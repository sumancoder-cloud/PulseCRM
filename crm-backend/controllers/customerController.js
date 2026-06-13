import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import { computeVitals } from '../services/rfmService.js';
import { broadcastActivity } from '../realtime.js';

export const addCustomer = async (req, res) => {
  try {
    const { name, email, phone, city } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const customer = await Customer.create({ name, email, phone, city });
    const computed = computeVitals(customer);
    
    broadcastActivity('customer', `New shopper added: ${name} (${city || 'N/A'})`, {
      customerId: customer._id
    });

    res.status(201).json(computed);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'A customer with this email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

export const addOrder = async (req, res) => {
  try {
    const { customerId, amount, product } = req.body;
    if (!customerId || !amount) {
      return res.status(400).json({ error: 'CustomerId and amount are required' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const orderAmount = Number(amount);
    const order = await Order.create({
      customerId,
      amount: orderAmount,
      product: product || 'Premium Arabica Beans 250g'
    });

    // Update customer stats
    customer.totalSpent += orderAmount;
    customer.orderCount += 1;
    customer.lastOrderDate = new Date();
    await customer.save();

    const computed = computeVitals(customer);

    broadcastActivity('order', `New purchase: ₹${orderAmount} by ${customer.name}`, {
      customerId,
      orderId: order._id,
      amount: orderAmount
    });

    res.status(201).json({ order, customer: computed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
