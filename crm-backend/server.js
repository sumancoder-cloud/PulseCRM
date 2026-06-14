import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/index.js';
import { connectDB } from './config/db.js';
import { initRealtime } from './realtime.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.use('/api', router);

const PORT = Number(process.env.PORT) || 5000;
const httpServer = http.createServer(app);

// Connect Database
await connectDB();

// Auto-seed database if empty (first time deployment)
try {
  await seedDatabase();
} catch (error) {
  console.warn('⚠️  Seeding skipped or already seeded:', error.message);
}

// Initialize WebSocket
initRealtime(httpServer);

httpServer.listen(PORT, () => {
  console.log(`PulseCRM API running on http://localhost:${PORT}`);
  console.log(`  Health:   http://localhost:${PORT}/api/health`);
  console.log(`  Vitals:   http://localhost:${PORT}/api/vitals`);
  console.log(`  WebSocket: ws://localhost:${PORT}`);
  console.log(`  Channel:  ${process.env.CHANNEL_SERVICE_URL || 'http://localhost:5001'}`);
});

export default app;
