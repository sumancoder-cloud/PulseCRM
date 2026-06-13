const TERMINAL_STATUSES = ['FAILED', 'ORDER_ATTRIBUTED', 'CLICKED', 'OPENED', 'READ', 'DELIVERED'];

export function buildCampaignStats(comms) {
  const total = comms.length;
  const count = (s) => comms.filter((c) => c.status === s).length;
  const attributedRevenue = comms.reduce((sum, c) => sum + (c.attributedAmount || 0), 0);
  const conversions = comms.filter((c) => c.attributedAmount && c.attributedAmount > 0).length;

  return {
    total,
    pending: count('PENDING'),
    queued: count('QUEUED'),
    sent: count('SENT'),
    delivered: count('DELIVERED'),
    read: count('READ'),
    opened: count('OPENED'),
    clicked: count('CLICKED'),
    failed: count('FAILED'),
    attributed: count('ORDER_ATTRIBUTED'),
    attributedRevenue,
    conversions,
    conversionRate: total > 0 ? ((conversions / total) * 100).toFixed(1) : '0',
  };
}

export function isCampaignComplete(comms) {
  if (comms.length === 0) return false;
  return comms.every((c) => TERMINAL_STATUSES.includes(c.status));
}
