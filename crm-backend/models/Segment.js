import mongoose from 'mongoose';

const segmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  rule: { type: mongoose.Schema.Types.Mixed, required: true },
  vitalsLabel: { type: String },
  
  // Segment-Specific Defaults
  defaultChannel: { 
    type: String, 
    enum: ['WHATSAPP', 'SMS', 'EMAIL', 'RCS'], 
    default: 'WHATSAPP' 
  },
  defaultDiscount: { type: Number, default: 0 }, // percentage
  recommendedDaysBefore: { type: Number, default: 7 }, // when to send
  
  // Segment Meta
  customerCount: { type: Number, default: 0 },
  estimatedConversion: { type: Number, default: 0 }, // 0-100 %
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

segmentSchema.set('toJSON', { virtuals: true });
segmentSchema.set('toObject', { virtuals: true });

export const Segment = mongoose.model('Segment', segmentSchema);
export default Segment;
