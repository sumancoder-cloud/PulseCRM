import { Router } from 'express';
import * as aiController from '../controllers/aiController.js';
import * as campaignController from '../controllers/campaignController.js';
import * as webhookController from '../controllers/webhookController.js';
import * as customerController from '../controllers/customerController.js';
import Campaign from '../models/Campaign.js';
import Segment from '../models/Segment.js';
import Customer from '../models/Customer.js';
import { getVitalsSummary } from '../services/rfmService.js';
import { buildCampaignStats } from '../services/statsService.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'PulseCRM API', brand: 'Arora Roast' });
});

router.get('/vitals', async (_req, res) => {
  try {
    const summary = await getVitalsSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/customers', async (_req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/dashboard', async (_req, res) => {
  try {
    // Find campaigns and populates virtual communications
    const campaigns = await Campaign.find()
      .populate('segmentId')
      .populate('communications')
      .sort({ createdAt: -1 });

    const segments = await Segment.find().sort({ createdAt: -1 });
    const vitals = await getVitalsSummary();

    const enhancedCampaigns = campaigns.map((camp) => {
      const comms = camp.communications || [];
      return {
        id: camp._id.toString(),
        name: camp.name,
        goal: camp.goal,
        segmentId: camp.segmentId?._id?.toString() || camp.segmentId,
        message: camp.message,
        channel: camp.channel,
        status: camp.status,
        createdAt: camp.createdAt,
        stats: buildCampaignStats(comms),
      };
    });

    res.json({ campaigns: enhancedCampaigns, segments, vitals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/campaigns/:id', campaignController.getById);

router.post('/ai/segment', aiController.segment);
router.post('/ai/campaign', aiController.campaign);
router.post('/ai/message', aiController.generateMessage);

router.post('/campaigns/customize', campaignController.createCustomized);
router.patch('/campaigns/:id/update', campaignController.updateCampaign);

router.get('/segments', async (_req, res) => {
  try {
    const segments = await Segment.find().sort({ createdAt: -1 });
    res.json(segments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/segments', async (req, res) => {
  try {
    const { name, rule, description, vitalsLabel } = req.body;
    const segment = await Segment.create({
      name,
      description,
      vitalsLabel: vitalsLabel || rule?.vitalsLabel || null,
      rule,
    });
    res.json(segment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/segments/:id/customers', async (req, res) => {
  try {
    const { id } = req.params;
    const segment = await Segment.findById(id);
    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    const allVitals = await getVitalsSummary();
    const { matchRule } = await import('../services/rfmService.js');
    const matchedCustomers = allVitals.shoppers.filter(v => matchRule(v, segment.rule));

    res.json({
      segmentId: segment._id,
      segmentName: segment.name,
      customerCount: matchedCustomers.length,
      customers: matchedCustomers.map(c => ({
        _id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        city: c.city,
        totalSpent: c.totalSpent,
        orderCount: c.orderCount,
        vitalsLabel: c.vitalsLabel,
        recencyDays: c.recencyDays
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/campaigns/launch', campaignController.launch);
router.post('/webhooks/channel', webhookController.receive);

// Endpoints for Add Data tab
router.post('/customers', customerController.addCustomer);
router.post('/orders', customerController.addOrder);

export default router;
