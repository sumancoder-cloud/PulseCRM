import Communication from '../models/Communication.js';
import CommunicationEvent from '../models/CommunicationEvent.js';
import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import Campaign from '../models/Campaign.js';
import { broadcast, broadcastActivity } from '../realtime.js';
import { buildCampaignStats, isCampaignComplete } from '../services/statsService.js';

export const receive = async (req, res) => {
  try {
    const { communicationId, status, log, attributedAmount, product } = req.body;
    if (!communicationId || !status) {
      return res.status(400).json({ error: 'communicationId and status required' });
    }

    const comm = await Communication.findById(communicationId)
      .populate('customerId')
      .populate('campaignId');

    if (!comm) return res.status(404).json({ error: 'Communication not found' });

    await CommunicationEvent.create({
      communicationId,
      status,
      log: log || null,
    });

    const updateData = { status };
    if (log) {
      updateData.log = log;
    }

    const customer = comm.customerId;
    const campaign = comm.campaignId;

    if (status === 'ORDER_ATTRIBUTED' && attributedAmount) {
      updateData.attributedAmount = attributedAmount;

      await Order.create({
        customerId: customer._id,
        amount: attributedAmount,
        product: product || 'Arora Roast Premium Blend',
        attributedToComm: communicationId,
      });

      await Customer.findByIdAndUpdate(customer._id, {
        $inc: { totalSpent: attributedAmount, orderCount: 1 },
        $set: { lastOrderDate: new Date() },
      });
    }

    await Communication.findByIdAndUpdate(communicationId, updateData);

    broadcast('communication:update', {
      communicationId,
      campaignId: campaign._id,
      status,
      customerName: customer.name,
      channel: campaign.channel,
      log: log || null,
      attributedAmount: attributedAmount || null,
    });

    broadcastActivity('webhook', `${customer.name}: ${status}`, {
      communicationId,
      campaignId: campaign._id,
      status,
      channel: campaign.channel,
    });

    const allComms = await Communication.find({ campaignId: campaign._id });
    const stats = buildCampaignStats(allComms);
    broadcast('campaign:stats', { campaignId: campaign._id, stats });

    if (isCampaignComplete(allComms)) {
      await Campaign.findByIdAndUpdate(campaign._id, { status: 'COMPLETED' });
      broadcast('campaign:completed', {
        campaignId: campaign._id,
        name: campaign.name,
        stats,
      });
      broadcastActivity('campaign', `Campaign "${campaign.name}" completed`, {
        campaignId: campaign._id,
        stats,
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
