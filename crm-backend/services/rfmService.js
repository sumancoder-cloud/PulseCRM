import Customer from '../models/Customer.js';

function scoreRecency(days) {
  if (days === null || days === undefined) return 1;
  if (days <= 14) return 5;
  if (days <= 30) return 4;
  if (days <= 60) return 3;
  if (days <= 90) return 2;
  return 1;
}

function scoreFrequency(count) {
  if (count >= 8) return 5;
  if (count >= 5) return 4;
  if (count >= 3) return 3;
  if (count >= 1) return 2;
  return 1;
}

function scoreMonetary(spent) {
  if (spent >= 15000) return 5;
  if (spent >= 8000) return 4;
  if (spent >= 4000) return 3;
  if (spent >= 1500) return 2;
  return 1;
}

function labelFromScores(r, f, m, orderCount) {
  if (orderCount === 0) return 'New';
  if (r >= 4 && f >= 4 && m >= 4) return 'Champions';
  if (r >= 3 && f >= 3) return 'Loyal';
  if (r <= 2 && f >= 3 && m >= 3) return 'At Risk';
  if (r <= 2 && f <= 2) return 'Hibernating';
  return 'Loyal';
}

const LABEL_COLORS = {
  Champions: '#22c55e',
  Loyal: '#3b82f6',
  'At Risk': '#f59e0b',
  Hibernating: '#ef4444',
  New: '#8b5cf6',
};

export function computeVitals(customer) {
  const custObj = customer.toObject ? customer.toObject() : customer;
  
  const recencyDays = custObj.lastOrderDate
    ? Math.floor((Date.now() - new Date(custObj.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const rScore = scoreRecency(recencyDays);
  const fScore = scoreFrequency(custObj.orderCount);
  const mScore = scoreMonetary(custObj.totalSpent);
  const vitalsLabel = labelFromScores(rScore, fScore, mScore, custObj.orderCount);

  return {
    ...custObj,
    id: custObj._id.toString(),
    recencyDays,
    rScore,
    fScore,
    mScore,
    vitalsLabel,
    vitalsColor: LABEL_COLORS[vitalsLabel],
  };
}

export async function getAllVitals() {
  const customers = await Customer.find().sort({ totalSpent: -1 });
  return customers.map(computeVitals);
}

export async function getVitalsSummary() {
  const vitals = await getAllVitals();
  const groups = {
    Champions: 0,
    Loyal: 0,
    'At Risk': 0,
    Hibernating: 0,
    New: 0,
  };
  for (const v of vitals) {
    if (groups[v.vitalsLabel] !== undefined) {
      groups[v.vitalsLabel]++;
    }
  }

  return {
    totalShoppers: vitals.length,
    groups: Object.entries(groups).map(([label, count]) => ({
      label,
      count,
      color: LABEL_COLORS[label],
    })),
    shoppers: vitals,
  };
}

export function matchRule(vitals, rule) {
  if (rule.vitalsLabel && vitals.vitalsLabel !== rule.vitalsLabel) return false;
  if (rule.spend && vitals.totalSpent < rule.spend) return false;
  if (rule.minOrderCount && vitals.orderCount < rule.minOrderCount) return false;
  if (rule.daysInactive && rule.daysInactive > 0) {
    if (vitals.recencyDays === null || vitals.recencyDays === undefined || vitals.recencyDays < rule.daysInactive) return false;
  }
  return true;
}

export async function findCustomersByRule(rule) {
  const vitals = await getAllVitals();
  return vitals.filter((v) => matchRule(v, rule));
}

/**
 * Get preferred channel for a customer based on engagement history
 */
export function getPreferredChannel(customer) {
  const engagement = customer.channelEngagement || {};
  
  const channels = ['WHATSAPP', 'SMS', 'EMAIL', 'RCS'];
  const rates = channels.map(ch => ({
    channel: ch,
    opens: engagement[ch]?.opens || 0,
    clicks: engagement[ch]?.clicks || 0,
    engagement: (engagement[ch]?.opens || 0) + (engagement[ch]?.clicks || 0)
  }));

  // Sort by engagement, default to preferred channel or WHATSAPP
  const best = rates.sort((a, b) => b.engagement - a.engagement)[0];
  return customer.preferredChannel || best?.channel || 'WHATSAPP';
}

/**
 * Get discount sensitivity for customer (0-1 scale, where 1 = always uses coupons)
 */
export function getDiscountSensitivity(customer) {
  if (customer.orderCount === 0) return 0.6; // new customers more likely to use
  if (customer.orderCount === 1) return 0.7;
  
  // If customer frequently uses coupons
  const couponUsageRate = customer.couponUsageCount / (customer.orderCount || 1);
  return Math.min(couponUsageRate, 1.0);
}

/**
 * Get sample customers from a segment for AI context (up to 3)
 */
export async function getSampleCustomersForSegment(vitals, count = 3) {
  const sample = vitals.slice(0, count).map(c => ({
    name: c.name,
    city: c.city,
    favoriteCategory: c.favoriteCategory || 'Coffee',
    orderCount: c.orderCount,
    totalSpent: c.totalSpent,
    preferredChannel: getPreferredChannel(c),
    discountSensitivity: (getDiscountSensitivity(c) * 100).toFixed(0),
    segmentLabel: c.vitalsLabel,
    recencyDays: c.recencyDays
  }));
  return sample;
}

/**
 * Calculate lifetime value for a customer
 */
export function calculateLTV(customer) {
  if (customer.orderCount === 0) return 0;
  const avgOrderValue = customer.totalSpent / customer.orderCount;
  const daysActive = customer.lastOrderDate 
    ? Math.floor((Date.now() - new Date(customer.lastOrderDate)) / (1000 * 60 * 60 * 24))
    : Math.floor((Date.now() - new Date(customer.createdAt)) / (1000 * 60 * 60 * 24));
  const purchaseFrequency = daysActive > 0 ? (customer.orderCount / (daysActive / 30)) : 0; // per month
  const margin = 0.3; // 30% margin
  return daysActive > 0 ? (avgOrderValue * purchaseFrequency * margin * 12).toFixed(2) : 0; // annual
}

/**
 * Get segment statistics
 */
export async function getSegmentStats(vitals) {
  if (!vitals || vitals.length === 0) {
    return {
      count: 0,
      avgSpent: 0,
      avgOrders: 0,
      avgRecency: 0,
      topChannel: 'WHATSAPP',
      estimatedConversion: 50
    };
  }

  const avgSpent = vitals.reduce((sum, c) => sum + c.totalSpent, 0) / vitals.length;
  const avgOrders = vitals.reduce((sum, c) => sum + c.orderCount, 0) / vitals.length;
  const avgRecency = vitals.reduce((sum, c) => sum + (c.recencyDays || 0), 0) / vitals.length;
  
  const channelCounts = {};
  vitals.forEach(c => {
    const ch = getPreferredChannel(c);
    channelCounts[ch] = (channelCounts[ch] || 0) + 1;
  });
  
  const topChannel = Object.keys(channelCounts).sort((a, b) => 
    channelCounts[b] - channelCounts[a]
  )[0] || 'WHATSAPP';

  // Estimate conversion based on segment
  const segmentEstimates = {
    'Champions': 80,
    'Loyal': 65,
    'At Risk': 55,
    'Hibernating': 35,
    'New': 45
  };
  
  const vitalsLabel = vitals[0]?.vitalsLabel || 'Loyal';
  const estimatedConversion = segmentEstimates[vitalsLabel] || 50;

  return {
    count: vitals.length,
    avgSpent: avgSpent.toFixed(2),
    avgOrders: avgOrders.toFixed(2),
    avgRecency: avgRecency.toFixed(2),
    topChannel,
    estimatedConversion
  };
}
