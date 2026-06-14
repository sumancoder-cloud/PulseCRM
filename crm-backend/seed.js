import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Customer from './models/Customer.js';
import Order from './models/Order.js';
import Segment from './models/Segment.js';
import Campaign from './models/Campaign.js';
import Communication from './models/Communication.js';
import CommunicationEvent from './models/CommunicationEvent.js';

dotenv.config();

const firstNames = [
  'Aarav', 'Neha', 'Priya', 'Kiran', 'Rahul', 'Sneha', 'Vikram', 'Anjali', 'Rohan', 'Meera',
  'Arjun', 'Isha', 'Dev', 'Kavya', 'Aditya', 'Pooja', 'Nikhil', 'Riya', 'Karan', 'Simran',
];
const lastNames = ['Sharma', 'Patel', 'Reddy', 'Nair', 'Gupta', 'Iyer', 'Singh', 'Das', 'Mehta', 'Joshi'];
const cities = ['Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Jaipur'];
const products = [
  'Monsoon Malabar 250g', 'Cold Brew Starter Kit', 'French Press Bundle',
  'Espresso Roast 500g', 'Single Origin Coorg', 'Ceramic Pour-Over Set',
  'Hazelnut Latte Capsules', 'Barista Subscription Box',
];
const domains = ['gmail.com', 'yahoo.com', 'outlook.com'];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('🌱 Seeding Arora Roast shopper data to MongoDB...');

  await connectDB();

  // Check if data already exists (don't re-seed)
  const existingCount = await Customer.countDocuments();
  if (existingCount > 0) {
    console.log(`✓ Database already has ${existingCount} customers — skipping seed`);
    return;
  }

  // Clear collections
  await CommunicationEvent.deleteMany({});
  await Communication.deleteMany({});
  await Order.deleteMany({});
  await Campaign.deleteMany({});
  await Segment.deleteMany({});
  await Customer.deleteMany({});

  console.log('✓ Collections cleared');

  const customersData = [];
  for (let i = 0; i < 120; i++) {
    const name = `${pick(firstNames)} ${pick(lastNames)}`;
    customersData.push({
      name,
      email: `${name.replace(/\s+/g, '.').toLowerCase()}${i}@${pick(domains)}`,
      phone: `+9198${Math.floor(10000000 + Math.random() * 90000000)}`,
      city: pick(cities),
      totalSpent: 0,
      orderCount: 0,
      lastOrderDate: null
    });
  }

  const createdCustomers = await Customer.insertMany(customersData);
  console.log(`✓ ${createdCustomers.length} shoppers created in MongoDB`);

  let orderCount = 0;
  const now = Date.now();

  for (const customer of createdCustomers) {
    const profile = Math.random();
    let numOrders;
    let recencyBias;

    if (profile < 0.15) {
      numOrders = Math.floor(Math.random() * 6) + 6;
      recencyBias = 0.9;
    } else if (profile < 0.35) {
      numOrders = Math.floor(Math.random() * 4) + 3;
      recencyBias = 0.7;
    } else if (profile < 0.55) {
      numOrders = Math.floor(Math.random() * 3) + 2;
      recencyBias = 0.3;
    } else if (profile < 0.75) {
      numOrders = Math.floor(Math.random() * 2) + 1;
      recencyBias = 0.15;
    } else if (profile < 0.9) {
      numOrders = 1;
      recencyBias = 0.05;
    } else {
      numOrders = 0;
      recencyBias = 0;
    }

    let spent = 0;
    let lastDate = null;
    const ordersBatch = [];

    for (let j = 0; j < numOrders; j++) {
      const amount = Math.floor(Math.random() * 3500) + 499;
      spent += amount;
      const daysAgo = Math.floor((1 - recencyBias) * 180 * Math.random() + j * 10);
      const orderDate = new Date(now - daysAgo * 24 * 60 * 60 * 1000);

      if (!lastDate || orderDate > lastDate) lastDate = orderDate;

      ordersBatch.push({
        customerId: customer._id,
        amount,
        product: pick(products),
        createdAt: orderDate,
      });
      orderCount++;
    }

    if (ordersBatch.length > 0) {
      await Order.insertMany(ordersBatch);
      await Customer.findByIdAndUpdate(customer._id, {
        totalSpent: spent,
        orderCount: numOrders,
        lastOrderDate: lastDate,
      });
    }
  }

  console.log(`✓ ${orderCount} orders created in MongoDB`);
  console.log('✅ Seed complete — Arora Roast MongoDB data ready!');
}

// Export for use in server.js
export async function seedDatabase() {
  try {
    await main();
  } catch (e) {
    console.error('❌ Seeding failed:', e.message);
    throw e;
  }
}

// If run directly: node seed.js
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .catch((e) => {
      console.error('❌ Seeding failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await mongoose.disconnect();
    });
}
