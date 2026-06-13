import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const USE_MOCK_GEMINI = process.env.USE_MOCK_GEMINI === 'true';
const MOCK_DISCOUNT = parseInt(process.env.MOCK_DISCOUNT) || 15;
let genAI = null;
if (GEMINI_API_KEY && !USE_MOCK_GEMINI) {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  } catch (err) {
    console.error('[AI] Initialization error:', err.message);
  }
}

function parseJsonFromText(text) {
  const cleaned = text.trim().replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

// --- Mock response used when Gemini is unavailable or when USE_MOCK_GEMINI is true ---
const mockResponse = {
  message: 'Hey {name}! Enjoy 15% off with code PULSE15. ☕',
  channel: 'WHATSAPP',
  reasoning: 'WhatsApp yields the highest open rate for win‑back campaigns.',
  variants: [
    'Your morning ritual awaits – use PULSE15 for 15% off.',
    'We saved your blend, {name}. Come back with 15% off — code PULSE15.'
  ],
  discount: MOCK_DISCOUNT
};

// Helper to call Gemini with exponential back‑off retry (max 3 attempts)
async function callGeminiWithRetry(prompt, attempts = 3, delay = 500) {
  if (USE_MOCK_GEMINI) return mockResponse;
  for (let i = 0; i < attempts; i++) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return parseJsonFromText(text);
    } catch (e) {
      const status = e?.response?.status || e?.status;
      if (status === 429 || (status >= 500 && status < 600)) {
        // exponential back‑off
        await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
        continue;
      }
      throw e; // non‑retryable error
    }
  }
  console.warn('[AI] Gemini quota exhausted – using mock response');
  return mockResponse;
}

function heuristicSegment(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.includes('champion') || lower.includes('vip') || lower.includes('best')) {
    return { vitalsLabel: 'Champions', reason: 'Targeting high-value loyal champions' };
  }
  if (lower.includes('risk') || lower.includes('churn') || lower.includes('inactive') || lower.includes("haven't")) {
    return { vitalsLabel: 'At Risk', daysInactive: 45, reason: 'Win-back campaign for at-risk shoppers showing churn signals' };
  }
  if (lower.includes('hibernat') || lower.includes('lost') || lower.includes('dormant')) {
    return { vitalsLabel: 'Hibernating', daysInactive: 90, reason: 'Reactivation for dormant shoppers' };
  }
  if (lower.includes('new') || lower.includes('first')) {
    return { vitalsLabel: 'New', reason: 'Onboarding campaign for new shoppers' };
  }
  if (lower.includes('spent') || lower.includes('spend') || lower.includes('₹') || lower.includes('rs')) {
    const match = lower.match(/(\d{3,6})/);
    const spend = match ? Number(match[1]) : 5000;
    return { spend, daysInactive: 30, reason: `High spenders (₹${spend}+) inactive 30+ days` };
  }
  return { vitalsLabel: 'At Risk', daysInactive: 60, reason: 'Default win-back for at-risk segment' };
}

export async function interpretSegmentPrompt(prompt) {
  if (!genAI) return heuristicSegment(prompt);

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const aiPrompt = `You are PulseCRM AI for Arora Roast, a premium Indian D2C coffee brand.
Analyze this marketer goal and return ONLY valid JSON:
{"spend":number,"daysInactive":number,"vitalsLabel":"Champions"|"Loyal"|"At Risk"|"Hibernating"|"New"|null,"minOrderCount":number,"reason":"one sentence diagnosis"}

Marketer goal: "${prompt}"`;
    const result = await model.generateContent(aiPrompt);
    const text = result.response.text();
    const parsed = parseJsonFromText(text);
    return {
      spend: parsed.spend || 0,
      daysInactive: parsed.daysInactive || 0,
      vitalsLabel: parsed.vitalsLabel || undefined,
      minOrderCount: parsed.minOrderCount || 0,
      reason: parsed.reason || 'AI segment recommendation',
    };
  } catch (e) {
    console.error('AI interpret error, using heuristic fallback:', e);
    return heuristicSegment(prompt);
  }
}

export async function generateCampaignForSegment(segmentRule, goal) {
  const fallback = {
    message: 'Hey {name}! Your Arora Roast favorites miss you ☕ Use code PULSE15 for 15% off your next brew. Shop now → aroraroast.in',
    channel: 'WHATSAPP',
    reasoning: 'WhatsApp has highest open rates for Indian D2C win-back campaigns. Personalized discount drives re-orders.',
    variants: [
      'Your morning ritual is waiting ☕ PULSE15 = 15% off premium beans.',
      'We saved your blend, {name}. Come back with 15% off — code PULSE15.',
    ],
    discount: MOCK_DISCOUNT
  };

  if (!genAI && !USE_MOCK_GEMINI) return fallback;

  const prompt = `You are an expert D2C marketer for Arora Roast (premium coffee).
Goal: "${goal}"
Segment: ${segmentRule}

Return ONLY JSON:
{"message":"personalized message with {name} placeholder","channel":"WHATSAPP"|"SMS"|"EMAIL"|"RCS","reasoning":"why this channel and angle","variants":["alt1","alt2"],"discount":number}`;

  try {
    const parsed = await callGeminiWithRetry(prompt);
    return {
      message: parsed.message || fallback.message,
      channel: (parsed.channel || fallback.channel).toUpperCase(),
      reasoning: parsed.reasoning || fallback.reasoning,
      variants: parsed.variants || fallback.variants,
      discount: parsed.discount ?? MOCK_DISCOUNT,
    };
  } catch (e) {
    console.error('AI campaign error, using marketing fallback:', e);
    return fallback;
  }
}

export function personalizeMessage(template, name) {
  return template.replace(/\{name\}/gi, name.split(' ')[0] || name);
}

/**
 * Generate fully customized campaign message with customer context
 * Considers: segment, customer preferences, channel engagement, discount sensitivity
 */
export async function generateCustomizedMessage(segment, goal, sampleCustomers = [], overrides = {}) {
  const USE_MOCK = USE_MOCK_GEMINI || !genAI;
  
  // Segment-specific default logic
  const segmentDefaults = {
    'Champions': { channel: 'EMAIL', discount: 5, tone: 'VIP exclusive access' },
    'Loyal': { channel: 'WHATSAPP', discount: 10, tone: 'thank you reward' },
    'At Risk': { channel: 'WHATSAPP', discount: 15, tone: 'win-back incentive' },
    'Hibernating': { channel: 'SMS', discount: 25, tone: 'last-attempt offer' },
    'New': { channel: 'WHATSAPP', discount: 20, tone: 'welcome bonus' },
    'First Time Buyer': { channel: 'WHATSAPP', discount: 10, tone: 'second purchase incentive' },
    'Active': { channel: 'WHATSAPP', discount: 8, tone: 'appreciation' }
  };

  const defaults = segmentDefaults[segment?.vitalsLabel] || segmentDefaults['At Risk'];
  
  // Apply overrides (UI customization)
  const finalChannel = overrides.channel || defaults.channel;
  const finalDiscount = overrides.discount !== undefined ? overrides.discount : defaults.discount;
  const tone = overrides.tone || defaults.tone;

  // Build customer context summary
  const customerContext = sampleCustomers.length > 0 
    ? `Sample customers: ${JSON.stringify(sampleCustomers.slice(0, 2))}`
    : '';

  const fallbackMessages = {
    'Champions': 'Thank you for being a VIP! Exclusive early access to our new limited edition blends. Plus 5% VIP discount. Enjoy ☕',
    'Loyal': 'We appreciate your loyalty! Here\'s a special 10% reward just for you, {name}. LOYAL10',
    'At Risk': 'We miss you, {name}! Come back with 15% off — code BACK15. ☕',
    'Hibernating': 'It\'s been too long! Here\'s 25% off to welcome you back — code COMEBACK25.',
    'New': 'Welcome to Arora Roast, {name}! Start your journey with 20% off your first order — code WELCOME20.',
    'First Time Buyer': 'Loved your first brew? Get 10% off on your next order — code SECOND10.',
    'Active': 'Hey {name}! Fresh batch just arrived. Enjoy 8% off premium blends — code FRESH8.'
  };

  const fallbackMessage = fallbackMessages[segment?.vitalsLabel] || fallbackMessages['At Risk'];

  if (USE_MOCK) {
    return {
      message: fallbackMessage,
      channel: finalChannel,
      discount: finalDiscount,
      reasoning: `Customized for ${segment?.vitalsLabel} segment with ${finalChannel} channel and ${finalDiscount}% discount`,
      aiGenerated: false,
      tone
    };
  }

  const prompt = `You are an expert D2C marketer for Arora Roast (premium Indian coffee).

Segment: ${segment?.vitalsLabel || 'At Risk'}
Goal: ${goal}
Tone: ${tone}
Channel: ${finalChannel} (preferred)
Target Discount: ${finalDiscount}%
${customerContext}

Generate a personalized marketing message that:
1. Includes {name} placeholder
2. Reflects the tone (${tone})
3. Incorporates discount naturally (${finalDiscount}%)
4. Is optimized for ${finalChannel} (keep SMS short, EMAIL can be longer)
5. Drives action (purchase, re-engagement)

Return ONLY JSON:
{
  "message": "personalized message with {name} placeholder",
  "channel": "${finalChannel}",
  "discount": ${finalDiscount},
  "reasoning": "brief explanation",
  "variants": ["alternative message 1", "alternative message 2"]
}`;

  try {
    const response = await callGeminiWithRetry(prompt);
    return {
      message: response.message || fallbackMessage,
      channel: finalChannel,
      discount: finalDiscount,
      reasoning: response.reasoning || `AI-generated for ${segment?.vitalsLabel}`,
      variants: response.variants || [fallbackMessage],
      aiGenerated: true,
      tone
    };
  } catch (e) {
    console.error('[AI] Customized message generation failed:', e.message);
    return {
      message: fallbackMessage,
      channel: finalChannel,
      discount: finalDiscount,
      reasoning: `Fallback message for ${segment?.vitalsLabel}`,
      variants: [fallbackMessage],
      aiGenerated: false,
      tone
    };
  }
}
