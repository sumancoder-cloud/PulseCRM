import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const WEBHOOK_URL = process.env.CRM_WEBHOOK_URL || 'http://localhost:5000/api/webhooks/channel';
const PORT = Number(process.env.PORT) || 5001;
const MAX_RETRIES = 3;

function delay(min = 300, max = 2000) {
  return new Promise((r) => setTimeout(r, Math.floor(Math.random() * (max - min + 1) + min)));
}

async function sendWebhook(payload, attempt = 1) {
  try {
    const resp = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    console.log(`[Channel] ${payload.communicationId} → ${payload.status}`);
    return true;
  } catch (e) {
    if (attempt < MAX_RETRIES) {
      console.warn(`[Channel] Retry ${attempt}/${MAX_RETRIES} for ${payload.status}`);
      await delay(500, 1500);
      return sendWebhook(payload, attempt + 1);
    }
    console.error(`[Channel] Webhook failed: ${payload.communicationId} ${payload.status}`, e.message);
    return false;
  }
}

async function simulateLifecycle(job) {
  const { communicationId, channel, customerName } = job;

  await delay(100, 400);
  await sendWebhook({ communicationId, status: 'SENT', log: `Submitted to ${channel}` });

  if (Math.random() < 0.04) {
    await sendWebhook({ communicationId, status: 'FAILED', log: 'Carrier rejected message' });
    return;
  }

  await delay(400, 1500);
  await sendWebhook({ communicationId, status: 'DELIVERED', log: 'Delivered to device' });

  if (channel === 'WHATSAPP' || channel === 'RCS') {
    if (Math.random() < 0.55) {
      await delay(800, 2500);
      await sendWebhook({ communicationId, status: 'READ', log: `${customerName || 'Shopper'} read message` });
    }
  }

  if (Math.random() < 0.62) {
    await delay(1000, 3500);
    await sendWebhook({ communicationId, status: 'OPENED', log: 'Message opened' });

    if (Math.random() < 0.28) {
      await delay(1500, 4000);
      await sendWebhook({ communicationId, status: 'CLICKED', log: 'Clicked shop-now link' });

      if (Math.random() < 0.35) {
        await delay(2000, 6000);
        const amount = Math.floor(Math.random() * 2500) + 799;
        await sendWebhook({
          communicationId,
          status: 'ORDER_ATTRIBUTED',
          log: `Order placed — attributed to campaign`,
          attributedAmount: amount,
          product: 'Arora Roast Premium Blend',
        });
      }
    }
  }
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Channel Simulator', webhook: WEBHOOK_URL });
});

app.post('/send', (req, res) => {
  const job = req.body;
  if (!job.communicationId) {
    return res.status(400).json({ error: 'communicationId required' });
  }
  console.log(`[Channel] Accepted ${job.channel} → ${job.customerEmail || job.customerPhone}`);
  res.status(202).json({ status: 'accepted', communicationId: job.communicationId });
  simulateLifecycle(job);
});

app.listen(PORT, () => {
  console.log(`Channel Simulator on port ${PORT}`);
  console.log(`Webhook → ${WEBHOOK_URL}`);
});
