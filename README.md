<h1 align="center">🚀 PulseCRM</h1>

<p align="center">
  AI-Native CRM for Intelligent Shopper Engagement
</p>

<p align="center">
  <img src="https://img.shields.io/badge/MERN-FullStack-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/AI-Gemini%202.0-blue?style=for-the-badge">
  <img src="https://img.shields.io/badge/Realtime-Socket.io-black?style=for-the-badge">
  <img src="https://img.shields.io/badge/Database-MongoDB-green?style=for-the-badge">
</p>

<p align="center">
  <b>Xeno SDE Internship Submission • June 2026</b>
</p>
# PulseCRM – AI‑Native Mini CRM

## 📢 Overview
**PulseCRM** is an AI‑native mini‑CRM built for the Xeno SDE Internship assignment. It helps a fictional premium coffee brand **Arora Roast** intelligently reach its shoppers using a **Campaign Copilot**. Marketers type a natural‑language goal, the AI proposes the right audience, crafts a message, picks the optimal channel, and suggests a discount. The human stays in full control and can customize before launch.


🏗️ Architecture Overview
PulseCRM is a full-stack MERN application (MongoDB + Express + React + Node.js) built for the Xeno Take-Home Assignment. It helps a D2C coffee brand ("Arora Roast") intelligently reach shoppers through personalized, AI-driven campaigns.

<img width="907" height="438" alt="image" src="https://github.com/user-attachments/assets/02278c5e-63e5-4a64-b38d-d2f60e0a963d" />


### Three Services

| Service | Port | Purpose |
|---------|------|---------|
| **crm-backend** | 5000 | Express API + WebSocket + AI + Queue |
| **crm-frontend** | 5173 | React SPA with Vite dev server (proxies to backend) |
| **channel-simulator** | 5001 | Simulates WhatsApp/SMS/Email/RCS message delivery |

---

## 📂 Project File Structure

```
MiniCRM/
├── crm-backend/
│   ├── server.js              ← Express + HTTP + Socket.io
│   ├── config/db.js           ← MongoDB Atlas connection
│   ├── models/
│   │   ├── Customer.js        ← Shopper profiles (name, email, phone, city, RFM stats)
│   │   ├── Order.js           ← Purchase history
│   │   ├── Segment.js         ← AI-generated audience segments
│   │   ├── Campaign.js        ← Campaign metadata + virtual comms
│   │   ├── Communication.js   ← Per-shopper message tracking
│   │   └── CommunicationEvent.js ← Event timeline per message
│   ├── controllers/
│   │   ├── aiController.js    ← /ai/segment + /ai/campaign endpoints
│   │   ├── campaignController.js ← Campaign launch + details
│   │   ├── customerController.js ← Add shopper + Add order
│   │   └── webhookController.js  ← Receives delivery receipts
│   ├── services/
│   │   ├── aiService.js       ← Gemini 2.0 Flash + heuristic fallback
│   │   ├── rfmService.js      ← RFM scoring engine
│   │   └── statsService.js    ← Campaign funnel stats
│   ├── routes/index.js        ← All API routes
│   ├── realtime.js            ← Socket.io broadcast helpers
│   ├── queue.js               ← BullMQ (Redis) or in-memory queue
│   ├── seed.js                ← Seeds 120 shoppers + 378 orders
│   └── .env                   ← MONGODB_URI, GEMINI_API_KEY
├── crm-frontend/
│   ├── src/
│   │   ├── App.jsx            ← Main UI (4 tabs: Copilot, Vitals, Add Data, Campaigns)
│   │   ├── useRealtime.js     ← Socket.io hook for live updates
│   │   ├── index.css          ← TailwindCSS v4 + custom design system
│   │   └── main.jsx           ← React entry point
│   └── vite.config.js         ← Proxy /api → :5000, /socket.io → :5000
├── channel-simulator/
│   └── server.js              ← Simulates message lifecycle with webhooks
└── README.md
```

---


## 🎯 All 4 Communication Channels

Your app supports **WhatsApp, SMS, Email, and RCS**. Here's how each works:

### How the Channel Gets Selected

1. **AI picks it automatically** — When you type a campaign goal in the Copilot, Gemini AI analyzes the goal and chooses the best channel:
   - "Win back at-risk shoppers" → AI typically picks **WhatsApp** (highest open rates in India)
   - "Send a newsletter to loyal customers" → AI picks **EMAIL**
   - "Quick flash sale alert" → AI picks **SMS**
   - "Rich media product showcase" → AI picks **RCS**

2. **The AI prompt explicitly says**: `"channel":"WHATSAPP"|"SMS"|"EMAIL"|"RCS"` — so Gemini knows all 4 options.

3. **If Gemini API is unavailable**, the heuristic fallback defaults to WHATSAPP .

### Channel-Specific Behavior in Simulator

| Channel | Delivery Flow | Special Features |
|---------|--------------|-----------------|
| **WhatsApp** | SENT → DELIVERED → READ → OPENED → CLICKED → ORDER | Blue tick read receipts (55% probability) |
| **SMS** | SENT → DELIVERED → OPENED → CLICKED → ORDER | No read receipts |
| **Email** | SENT → DELIVERED → OPENED → CLICKED → ORDER | No read receipts |
| **RCS** | SENT → DELIVERED → READ → OPENED → CLICKED → ORDER | Read receipts + rich cards |

### Channel Preview in UI

When you view a campaign, the **Interactive Channel Preview** renders a realistic mockup:
- **WhatsApp**: Green chat bubble in a phone frame with blue ticks ✓✓
- **SMS/RCS**: iMessage-style blue bubble (RCS includes a rich product card)
- **Email**: Desktop email client with headers (From, To, Subject)

> [!TIP]
> To test different channels, try these prompts in the Copilot:
> - `"Send an email newsletter to our loyal customers about new blends"` → EMAIL
> - `"Quick SMS flash sale to all champions"` → SMS
> - `"Rich product showcase for new arrivals to at-risk shoppers"` → RCS
> - `"WhatsApp win-back with discount code for hibernating shoppers"` → WHATSAPP

---

🔄 Complete Feature Flows
Flow 1: AI Copilot → Campaign Launch

<img width="1157" height="908" alt="image" src="https://github.com/user-attachments/assets/b155a1e5-0a98-4ca4-96aa-a8a388714118" />


## 🚀 Step-by-Step Workflow

1. User types goal → e.g., "Win back at-risk shoppers inactive 60+ days with 15% discount".

2. AI Diagnosis → Gemini returns: `{vitalsLabel: "At Risk", daysInactive: 60, reason: "..."}`.

3. Audience matching → Backend queries all customers, applies RFM filter, returns matched shoppers.

4. User clicks "Generate Message" → Saves segment to DB, asks Gemini for message + channel.

5. AI returns campaign proposal → Message with `{name}` placeholder, channel choice, reasoning, 2 variants.

6. User clicks "Launch" → Creates Campaign document, creates Communication docs for each shopper.

7. Queue dispatches → Each message sent to Channel Simulator via `POST /send`.

8. Simulator runs lifecycle → Sends webhooks back: `SENT → DELIVERED → READ → OPENED → CLICKED → ORDER`.

9. Real-time updates → Every webhook updates MongoDB + broadcasts via Socket.io.

10. Dashboard updates live → Funnel chart, stats cards, activity feed all update in real-time.


Flow 2: Shopper Vitals (RFM Engine)

<img width="1531" height="698" alt="image" src="https://github.com/user-attachments/assets/f52b1ac4-af6c-4988-bc38-ecd8697d72bb" />

#### RFM Scoring Thresholds:

| Score | Recency (days since last order) | Frequency (order count) | Monetary (total spent ₹) |
|-------|-------------------------------|------------------------|-------------------------|
| 5 | ≤14 days | ≥8 orders | ≥₹15,000 |
| 4 | ≤30 days | ≥5 orders | ≥₹8,000 |
| 3 | ≤60 days | ≥3 orders | ≥₹4,000 |
| 2 | ≤90 days | ≥1 order | ≥₹1,500 |
| 1 | >90 days | 0 orders | <₹1,500 |


---

### Flow 3: Data Ingestion

#### Add Shopper:
```
POST /api/customers → { name, email, phone, city }
  → Creates Customer in MongoDB (totalSpent=0, orderCount=0)
  → Computes initial RFM (label="New")
  → Broadcasts activity via WebSocket
```

#### Add Order:
```
POST /api/orders → { customerId, amount, product }
  → Creates Order in MongoDB
  → Updates Customer: totalSpent += amount, orderCount += 1, lastOrderDate = now
  → Recomputes RFM (label might change: New → Loyal, etc.)
  → Broadcasts activity via WebSocket
```

---

### Flow 4: Webhook Delivery Receipt Pipeline

When the Channel Simulator finishes processing a message, it sends webhooks back to the CRM:

```
Channel Simulator → POST /api/webhooks/channel
  → Updates Communication status in MongoDB
  → Creates CommunicationEvent (timeline entry)
  → If ORDER_ATTRIBUTED: creates Order + updates Customer stats
  → Broadcasts "communication:update" via WebSocket
  → Recalculates campaign stats → broadcasts "campaign:stats"
  → If all messages terminal → marks campaign "COMPLETED" → broadcasts "campaign:completed"
```

**Terminal statuses**: `FAILED`, `ORDER_ATTRIBUTED`, `CLICKED`, `OPENED`, `READ`, `DELIVERED`

---

### Flow 5: Real-Time WebSocket Events

| Event | When | Data |
|-------|------|------|
| `system:connected` | Client connects | Welcome message |
| `activity` | Any backend event | Type + message + metadata |
| `campaign:launch` | Campaign created | Campaign name, channel, total |
| `communication:update` | Each webhook received | Customer name, status, channel |
| `campaign:stats` | After each webhook | Updated funnel stats |
| `campaign:completed` | All messages terminal | Final stats |

---

## 🧠 AI Integration (Gemini 2.0 Flash)

### Segment Interpretation
- **Input**: Natural language goal (e.g., "Reward our champions")
- **Output**: JSON with `{vitalsLabel, daysInactive, spend, minOrderCount, reason}`
- **Fallback**: Keyword-based heuristic if Gemini is unavailable

### Campaign Generation
- **Input**: Segment rule + goal
- **Output**: JSON with `{message, channel, reasoning, variants}`
- **Message**: Uses `{name}` placeholder for personalization
- **Channel**: AI picks from WhatsApp/SMS/Email/RCS based on context
- **Variants**: 2 alternative messages for A/B testing ideas

### Personalization
- `{name}` → replaced with shopper's first name at send time
- Example: `"Hey {name}!"` → `"Hey Aarav!"`

---

## 📊 Campaign Analytics Dashboard

Each campaign shows:

| Metric | Description |
|--------|-------------|
| **Queued** | Accepted by channel service |
| **Sent** | Submitted to carrier |
| **Delivered** | Reached device |
| **Read** | Blue ticks (WhatsApp/RCS only) |
| **Opened** | Message opened |
| **Clicked** | Clicked CTA link |
| **Failed** | Carrier rejected |
| **Revenue** | Sum of attributed order amounts |
| **Conversion Rate** | (orders / total) × 100% |

### Funnel Chart
A horizontal bar chart shows the progressive funnel:
`Sent → Delivered → Read → Opened → Clicked → Ordered`

---

## 🔧 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite 8 + TailwindCSS v4 |
| **Charts** | Recharts (PieChart, BarChart) |
| **Icons** | Lucide React |
| **HTTP** | Axios |
| **Real-time** | Socket.io Client |
| **Backend** | Express.js 5 (ESM) |
| **Database** | MongoDB Atlas + Mongoose 8 |
| **AI** | Google Gemini 2.0 Flash |
| **Queue** | BullMQ (Redis) or In-Memory fallback |
| **WebSocket** | Socket.io Server |
| **Simulator** | Express (standalone service) |

---

## ✅ Xeno Assignment Requirements — Checklist

| Requirement | Status | Implementation |
|------------|--------|---------------|
| **Ingest customer + order data** | ✅ | Add Data tab + REST APIs + MongoDB |
| **Build audience segments** | ✅ | AI Copilot + RFM vitals engine |
| **Personalised comms** | ✅ | `{name}` personalization + AI message generation |
| **Multi-channel delivery** | ✅ | WhatsApp, SMS, Email, RCS |
| **Delivery tracking** | ✅ | Webhook pipeline + real-time WebSocket |
| **Campaign analytics** | ✅ | Funnel chart + stat cards + conversion tracking |
| **AI-native** | ✅ | Gemini 2.0 Flash with heuristic fallback |
| **Performance insights** | ✅ | Revenue attribution + conversion rates |

---

## 🧪 Testing Guide

### Test 1: Multi-Channel Campaigns
Try each of these prompts in the AI Copilot to get different channels:

| Prompt | Expected Channel |
|--------|-----------------|
| "Win back at-risk shoppers with a WhatsApp discount" | WHATSAPP |
| "Send a detailed email newsletter to loyal customers about our new single-origin blend" | EMAIL |
| "Quick flash sale SMS to all champions — 2 hours only" | SMS |
| "Rich product showcase with images for new shoppers" | RCS |

### Test 2: Full Campaign Lifecycle
1. AI Copilot → Diagnose → Generate → Launch
2. Switch to Live Campaigns → watch stats update in real-time
3. Click Details → see per-shopper communication timeline
4. Check sidebar Live Stream for event-by-event updates

### Test 3: Data Ingestion + RFM
1. Add Data → Create new shopper → appears as "New" in Vitals
2. Add an order for that shopper → vitals label updates (New → Loyal if enough spend)
3. Check Shopper Vitals → verify RFM scores recalculated

### Test 4: WebSocket Connection
- Sidebar should show green dot + "Live Stream"
- Backend terminal shows single `[Realtime] Client connected` (no rapid loop)
- Events appear in real-time in the sidebar feed

## 🚀 Quick Start

### Clone Repository

```bash
git clone https://github.com/sumancoder-cloud/PulseCRM.git
cd PulseCRM
```

### 📦 Install Dependencies

#### Backend

```bash
cd crm-backend
npm install
```

#### Frontend

```bash
cd ../crm-frontend
npm install
```

#### Channel Simulator

```bash
cd ../channel-simulator
npm install
```

### ▶️ Start Services

#### Backend

```bash
cd crm-backend
npm run dev
```

#### Frontend

```bash
cd ../crm-frontend
npm run dev
```

#### Channel Simulator

```bash
cd ../channel-simulator
npm start
```

---

## 👨‍💻 Author

**Tati Suman Yadav**

🎓 B.Tech CSE, SRM AP University  
💻 Full Stack & AI Developer  
🚀 Aspiring Software Engineer  

🐙 GitHub: https://github.com/sumancoder-cloud  

---

<p align="center">
  Built with ❤️ using MERN, Gemini AI and Socket.io
</p>

<p align="center">
  ⭐ Star this repository if you like the project!
</p>

*Prepared by **Tati Suman Yadav** for the Xeno SDE Internship – June 2026.*
  
