import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  amount: { type: Number, required: true },
  product: { type: String },
  attributedToComm: { type: mongoose.Schema.Types.ObjectId, ref: 'Communication', default: null },
  createdAt: { type: Date, default: Date.now }
});

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

export const Order = mongoose.model('Order', orderSchema);
export default Order;
