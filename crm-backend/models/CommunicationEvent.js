import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  communicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Communication', required: true },
  status: { type: String, required: true },
  log: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

export const CommunicationEvent = mongoose.model('CommunicationEvent', eventSchema);
export default CommunicationEvent;
