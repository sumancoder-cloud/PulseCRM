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
    const resp = await fetch(`${CHANNEL_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    });

    if (!resp.ok) throw new Error(`Channel returned ${resp.status}`);

    await Communication.findByIdAndUpdate(communicationId, {
      status: 'QUEUED',
      log: 'Accepted by channel service',
    });

    broadcast('communication:update', {
      communicationId,
      campaignId,
      status: 'QUEUED',
      customerName: job.customerName,
      channel: job.channel,
    });

    broadcastActivity('dispatch', `Message queued for ${job.customerName}`, {
      communicationId,
      campaignId,
      channel: job.channel,
    });

    console.log(`[Queue] Dispatched ${communicationId} → channel`);
  } catch (err) {
    const msg = err.message || String(err);
    console.error(`[Queue] Failed ${communicationId}:`, msg);

    await Communication.findByIdAndUpdate(communicationId, {
      status: 'FAILED',
      log: `Dispatch failed: ${msg}`,
    });
    
    await CommunicationEvent.create({
      communicationId,
      status: 'FAILED',
      log: msg,
    });

    broadcast('communication:update', {
      communicationId,
      campaignId,
      status: 'FAILED',
      customerName: job.customerName,
      log: msg,
    });
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
