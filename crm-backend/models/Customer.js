import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  city: { type: String },
  
  // RFM Analytics
  totalSpent: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
  lastOrderDate: { type: Date, default: null },
  averageOrderValue: { type: Number, default: 0 },
  
  // Channel Preferences & Engagement
  preferredChannel: { 
    type: String, 
    enum: ['WHATSAPP', 'SMS', 'EMAIL', 'RCS'], 
    default: 'WHATSAPP' 
  },
  channelEngagement: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      WHATSAPP: { opens: 0, clicks: 0 },
      SMS: { opens: 0, clicks: 0 },
      EMAIL: { opens: 0, clicks: 0 },
      RCS: { opens: 0, clicks: 0 }
    }
  },
  
  // Discount & Offer Sensitivity
  discountSensitivity: { type: Number, default: 0.5 }, // 0-1 scale
  couponUsageCount: { type: Number, default: 0 },
  lastCouponUsedAt: { type: Date, default: null },
  
  // Behavioral Signals
  favoriteCategory: { type: String, default: null },
  segmentLabel: { type: String, default: null }, // New, Loyal, At Risk, etc.
  churnRiskScore: { type: Number, default: 0 }, // 0-100
  lifetimeValue: { type: Number, default: 0 },
  
  // Engagement Tracking
  campaignsReceived: { type: Number, default: 0 },
  campaignOpenRate: { type: Number, default: 0 },
  campaignClickRate: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Virtuals for RFM calculation
customerSchema.virtual('recency').get(function() {
  if (!this.lastOrderDate) return Infinity;
  return Math.floor((Date.now() - this.lastOrderDate) / (1000 * 60 * 60 * 24)); // days ago
});

customerSchema.virtual('frequency').get(function() {
  return this.orderCount;
});

customerSchema.virtual('monetary').get(function() {
  return this.totalSpent;
});

customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });

export const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
