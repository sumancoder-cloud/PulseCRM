import { Queue, Worker } from 'bullmq';
import Communication from './models/Communication.js';
import CommunicationEvent from './models/CommunicationEvent.js';
import { broadcast, broadcastActivity } from './realtime.js';

const REDIS_URL = process.env.REDIS_URL;
const CHANNEL_URL = process.env.CHANNEL_SERVICE_URL || 'http://localhost:5001';
const CONCURRENCY = Number(process.env.QUEUE_CONCURRENCY) || 10;

let useRedis = false;
let queue = null;
let worker = null;

const memoryQueue = [];
let isProcessing = false;

async function dispatchToChannel(job) {
  const communicationId = job.communicationId;
  const campaignId = job.campaignId;

  try {
    // Try real channel service first
    const resp = await fetch(`${CHANNEL_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
      signal: AbortSignal.timeout(5000), // 5s timeout
    });

    if (!resp.ok) throw new Error(`Channel returned ${resp.status}`);

    await Communication.findByIdAndUpdate(communicationId, {
      status: 'SENT',
      log: 'Sent via channel service',
    });

    broadcast('communication:update', {
      communicationId,
      campaignId,
      status: 'SENT',
      customerName: job.customerName,
      channel: job.channel,
    });

    console.log(`[Queue] Sent ${communicationId} via ${job.channel}`);
  } catch (err) {
    // Fallback: mock delivery for demo/testing
    console.warn(`[Queue] Channel service failed, using mock delivery:`, err.message);

    // Simulate delivery status with random outcomes
    const rand = Math.random();
    let deliveryStatus = 'DELIVERED';
    if (rand < 0.1) deliveryStatus = 'READ';
    if (rand < 0.05) deliveryStatus = 'CLICKED';

    await Communication.findByIdAndUpdate(communicationId, {
      status: deliveryStatus,
      log: `Mock delivery (${job.channel}) — ${deliveryStatus}`,
    });

    await CommunicationEvent.create({
      communicationId,
      status: deliveryStatus,
      log: `Simulated ${job.channel} delivery`,
    });

    broadcast('communication:update', {
      communicationId,
      campaignId,
      status: deliveryStatus,
      customerName: job.customerName,
      channel: job.channel,
    });

    broadcastActivity('delivery', `${job.customerName}: ${deliveryStatus} (mock)`, {
      communicationId,
      campaignId,
      channel: job.channel,
      status: deliveryStatus,
    });

    console.log(`[Queue] Mock delivered ${communicationId} → ${deliveryStatus}`);
  }
}

async function processMemoryQueue() {
  if (isProcessing) return;
  isProcessing = true;

  while (memoryQueue.length > 0) {
    const batch = memoryQueue.splice(0, CONCURRENCY);
    await Promise.all(batch.map((job) => dispatchToChannel(job)));
  }

  isProcessing = false;
}

if (REDIS_URL) {
  try {
    queue = new Queue('communications', { connection: REDIS_URL });
    worker = new Worker(
      'communications',
      async (job) => dispatchToChannel(job.data),
      { connection: REDIS_URL, concurrency: CONCURRENCY }
    );
    useRedis = true;
    console.log('[Queue] Redis + BullMQ active');
  } catch (e) {
    console.warn('[Queue] Redis unavailable — in-memory mode:', e.message);
  }
} else {
  console.log(`[Queue] In-memory mode (concurrency: ${CONCURRENCY})`);
}

export async function enqueueJob(job) {
  if (useRedis && queue) {
    await queue.add('send', job, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  } else {
    memoryQueue.push(job);
    processMemoryQueue();
  }
}

export default { enqueueJob };
