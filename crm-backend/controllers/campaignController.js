import Campaign from '../models/Campaign.js';
import Segment from '../models/Segment.js';
import Communication from '../models/Communication.js';
import queue from '../queue.js';
import { findCustomersByRule } from '../services/rfmService.js';
import { personalizeMessage } from '../services/aiService.js';
import { broadcast, broadcastActivity } from '../realtime.js';
import { buildCampaignStats } from '../services/statsService.js';

export const launch = async (req, res) => {
  try {
    const { name, goal, segmentId, message, channel, discount = 0, selectedUserIds = [] } = req.body;
    const segment = await Segment.findById(segmentId);
    if (!segment) return res.status(404).json({ error: 'Segment not found' });

    const rule = segment.rule;
    
    // Get target customers
    let targetCustomers = [];
    if (selectedUserIds && selectedUserIds.length > 0) {
      // Use manually selected users
      const Customer = (await import('../models/Customer.js')).default;
      targetCustomers = await Customer.find({ _id: { $in: selectedUserIds } });
    } else {
      // Use segment rule
      targetCustomers = await findCustomersByRule(rule);
    }

    if (targetCustomers.length === 0) {
      return res.status(400).json({ error: 'No shoppers match this segment' });
    }

    const campaign = await Campaign.create({
      name,
      goal,
      segmentId,
      message,
      channel,
      discount: Math.min(Math.max(discount || 0, 0), 100), // clamp 0-100
      status: 'LAUNCHED',
      targetCount: targetCustomers.length,
      selectedUserIds: selectedUserIds.length > 0 ? selectedUserIds : undefined,
      launchedAt: new Date()
    });
    console.log('[Campaign Stored]:', {
      campaignId: campaign._id,
      name: campaign.name,
      channel: campaign.channel,
      discount: campaign.discount,
      targetCount: campaign.targetCount,
      status: campaign.status
    });

    const communications = targetCustomers.map((c) => ({
      campaignId: campaign._id,
      customerId: c.id || c._id,
      status: 'PENDING',
    }));

    await Communication.insertMany(communications);

    const storedComms = await Communication.find({ campaignId: campaign._id })
      .populate('customerId');

    broadcast('campaign:launch', {
      campaignId: campaign._id,
      name: campaign.name,
      channel,
      discount: campaign.discount,
      total: storedComms.length,
      goal,
    });

    broadcastActivity('launch', `Campaign "${name}" launched to ${storedComms.length} shoppers via ${channel} (${discount}% discount)`, {
      campaignId: campaign._id,
      channel,
      discount,
      total: storedComms.length,
    });

    for (const comm of storedComms) {
      const customer = comm.customerId;
      if (!customer) continue;
      
      const personalized = personalizeMessage(message, customer.name);
      await queue.enqueueJob({
        communicationId: comm._id.toString(),
        campaignId: campaign._id.toString(),
        customerId: customer._id.toString(),
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        message: personalized,
        channel,
        discount,
      });
    }

    console.log(`[Campaign Launched] ${storedComms.length} messages queued to ${channel}`);
    res.json({
      success: true,
      campaignId: campaign._id.toString(),
      messagesQueued: storedComms.length,
      discount: campaign.discount,
      channel: campaign.channel,
      message: 'Campaign launched successfully and stored in database'
    });
  } catch (error) {
    console.error('[Campaign Launch Error]:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const id = req.params.id;
    const campaign = await Campaign.findById(id).populate('segmentId');
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const communications = await Communication.find({ campaignId: id })
      .populate('customerId')
      .populate({
        path: 'events',
        options: { sort: { createdAt: 1 } }
      });

    const stats = buildCampaignStats(communications);

    res.json({
      id: campaign._id.toString(),
      name: campaign.name,
      goal: campaign.goal,
      segmentId: campaign.segmentId?._id?.toString() || campaign.segmentId,
      segment: campaign.segmentId,
      message: campaign.message,
      channel: campaign.channel,
      discount: campaign.discount,
      status: campaign.status,
      createdAt: campaign.createdAt,
      communications: communications.map(c => ({
        id: c._id.toString(),
        campaignId: c.campaignId.toString(),
        status: c.status,
        log: c.log,
        attributedAmount: c.attributedAmount,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        customer: c.customerId,
        events: c.events
      })),
      stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create customized campaign with full control over:
 * - Target customers (can select specific users)
 * - Message (editable)
 * - Channel (customizable)
 * - Discount (adjustable)
 * POST /api/campaigns/customize
 */
export const createCustomized = async (req, res) => {
  try {
    const {
      name,
      goal,
      segmentId,
      message,
      channel,
      discount = 0,
      selectedUserIds = [],
      aiGenerated = false,
      aiReasoning = null
    } = req.body;

    // Validate required fields
    if (!name || !segmentId || !message || !channel) {
      return res.status(400).json({
        error: 'Missing required fields: name, segmentId, message, channel'
      });
    }

    // Validate channel enum
    const validChannels = ['WHATSAPP', 'SMS', 'EMAIL', 'RCS'];
    if (!validChannels.includes(channel.toUpperCase())) {
      return res.status(400).json({
        error: `Invalid channel. Must be one of: ${validChannels.join(', ')}`
      });
    }

    const segment = await Segment.findById(segmentId);
    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    // Get target customers
    let targetCustomers = [];
    if (selectedUserIds && selectedUserIds.length > 0) {
      // Use manually selected users
      const Customer = (await import('../models/Customer.js')).default;
      targetCustomers = await Customer.find({ _id: { $in: selectedUserIds } });
    } else {
      // Use segment rule
      targetCustomers = await findCustomersByRule(segment.rule);
    }

    if (targetCustomers.length === 0) {
      return res.status(400).json({ error: 'No customers match this selection' });
    }

    // Create campaign
    const campaign = await Campaign.create({
      name,
      goal,
      segmentId,
      message,
      channel: channel.toUpperCase(),
      discount: Math.min(Math.max(discount, 0), 100), // clamp 0-100
      status: 'DRAFT',
      targetCount: targetCustomers.length,
      aiGenerated,
      aiReasoning,
      selectedUserIds: selectedUserIds.length > 0 ? selectedUserIds : undefined,
      createdAt: new Date()
    });
    console.log('[Campaign Draft Created]:', {
      campaignId: campaign._id,
      name: campaign.name,
      status: campaign.status,
      targetCount: campaign.targetCount,
      message: campaign.message.substring(0, 50) + '...'
    });

    res.json({
      success: true,
      campaignId: campaign._id,
      campaign: {
        _id: campaign._id,
        name: campaign.name,
        goal: campaign.goal,
        message: campaign.message,
        channel: campaign.channel,
        discount: campaign.discount,
        status: campaign.status,
        targetCount: targetCustomers.length,
        aiGenerated: campaign.aiGenerated
      }
    });
  } catch (error) {
    console.error('[Campaign Customization Error]:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update campaign parameters before launch
 * PATCH /api/campaigns/:id/update
 */
export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, channel, discount, selectedUserIds } = req.body;

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Only allow updates on DRAFT campaigns
    if (campaign.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Can only update DRAFT campaigns' });
    }

    // Update fields if provided
    if (message) campaign.message = message;
    if (channel) {
      const validChannels = ['WHATSAPP', 'SMS', 'EMAIL', 'RCS'];
      if (!validChannels.includes(channel.toUpperCase())) {
        return res.status(400).json({ error: 'Invalid channel' });
      }
      campaign.channel = channel.toUpperCase();
    }
    if (discount !== undefined) {
      campaign.discount = Math.min(Math.max(discount, 0), 100);
    }
    if (selectedUserIds) {
      campaign.selectedUserIds = selectedUserIds;
    }

    await campaign.save();

    res.json({
      success: true,
      campaign: {
        _id: campaign._id,
        name: campaign.name,
        message: campaign.message,
        channel: campaign.channel,
        discount: campaign.discount,
        status: campaign.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
