import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  goal: { type: String },
  segmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Segment', required: true },
  
  // Message & Delivery Config
  message: { type: String, required: true },
  channel: { 
    type: String, 
    enum: ['WHATSAPP', 'SMS', 'EMAIL', 'RCS'], 
    default: 'WHATSAPP',
    required: true 
  },
  discount: { type: Number, default: 0 }, // percentage (0-100)
  
  // AI Metadata
  aiGenerated: { type: Boolean, default: false },
  aiReasoning: { type: String, default: null },
  
  // Campaign Stats
  status: { type: String, default: 'DRAFT', enum: ['DRAFT', 'SCHEDULED', 'LAUNCHED', 'PAUSED', 'COMPLETED'] },
  targetCount: { type: Number, default: 0 },
  deliveredCount: { type: Number, default: 0 },
  openCount: { type: Number, default: 0 },
  clickCount: { type: Number, default: 0 },
  conversionCount: { type: Number, default: 0 },
  
  // Optional: Manual user selection
  selectedUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }],
  
  createdAt: { type: Date, default: Date.now },
  launchedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null }
});

// Virtuals for engagement rates
campaignSchema.virtual('openRate').get(function() {
  return this.targetCount > 0 ? (this.openCount / this.targetCount * 100).toFixed(2) : 0;
});

campaignSchema.virtual('clickRate').get(function() {
  return this.targetCount > 0 ? (this.clickCount / this.targetCount * 100).toFixed(2) : 0;
});

// Configure virtual to load communications
campaignSchema.virtual('communications', {
  ref: 'Communication',
  localField: '_id',
  foreignField: 'campaignId'
});

campaignSchema.set('toJSON', { virtuals: true });
campaignSchema.set('toObject', { virtuals: true });

export const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;
