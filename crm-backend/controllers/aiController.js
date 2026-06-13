import Segment from '../models/Segment.js';
import { interpretSegmentPrompt, generateCampaignForSegment, generateCustomizedMessage } from '../services/aiService.js';
import { findCustomersByRule, getAllVitals, getSampleCustomersForSegment, getSegmentStats } from '../services/rfmService.js';

export const segment = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt required' });

    const rule = await interpretSegmentPrompt(prompt);
    const matched = await findCustomersByRule(rule);

    res.json({
      rule,
      aiReasoning: rule.reason,
      audienceSize: matched.length,
      audience: matched.slice(0, 8).map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        totalSpent: c.totalSpent,
        vitalsLabel: c.vitalsLabel,
        recencyDays: c.recencyDays,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const campaign = async (req, res) => {
  try {
    const { segmentId, goal } = req.body;
    const segment = await Segment.findById(segmentId);
    if (!segment) return res.status(404).json({ error: 'Segment not found' });

    const ruleStr = typeof segment.rule === 'string' ? segment.rule : JSON.stringify(segment.rule);
    const result = await generateCampaignForSegment(ruleStr, goal);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Generate customized message with full customer context
 * POST /api/ai/message
 * Body: { segmentId, goal, overrides: { channel?, discount?, tone? } }
 */
export const generateMessage = async (req, res) => {
  try {
    const { segmentId, goal, overrides = {} } = req.body;
    
    if (!segmentId) {
      return res.status(400).json({ error: 'segmentId required' });
    }

    const segment = await Segment.findById(segmentId);
    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    // Get all vitals to filter by segment
    const allVitals = await getAllVitals();
    
    // Match customers to segment
    const { matchRule } = await import('../services/rfmService.js');
    const matchedCustomers = allVitals.filter(v => matchRule(v, segment.rule));

    // Get sample customers and stats
    const sampleCustomers = await getSampleCustomersForSegment(matchedCustomers, 3);
    const stats = await getSegmentStats(matchedCustomers);

    // Generate customized message
    const messageResult = await generateCustomizedMessage(
      segment,
      goal || 'Increase engagement and sales',
      sampleCustomers,
      overrides
    );

    res.json({
      success: true,
      message: messageResult.message,
      channel: messageResult.channel,
      discount: messageResult.discount,
      reasoning: messageResult.reasoning,
      variants: messageResult.variants,
      aiGenerated: messageResult.aiGenerated,
      tone: messageResult.tone,
      segment: {
        name: segment.name,
        vitalsLabel: segment.vitalsLabel,
        customerCount: stats.count,
        estimatedConversion: stats.estimatedConversion
      }
    });
  } catch (error) {
    console.error('[AI Message Generation Error]:', error);
    res.status(500).json({ error: error.message });
  }
};
