import mongoose from 'mongoose';

const communicationSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  status: { type: String, default: 'PENDING' },
  log: { type: String, default: null },
  attributedAmount: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Configure virtual to load events
communicationSchema.virtual('events', {
  ref: 'CommunicationEvent',
  localField: '_id',
  foreignField: 'communicationId'
});

communicationSchema.set('toJSON', { virtuals: true });
communicationSchema.set('toObject', { virtuals: true });

export const Communication = mongoose.model('Communication', communicationSchema);
export default Communication;
