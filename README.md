# 🚀 Mini CRM - AI-Native Customer Engagement Platform

An intelligent marketing platform that helps brands reach shoppers through AI-driven segmentation, personalized messaging, and multi-channel campaigns.

## 📋 Quick Overview

**In 250 characters:**
Mini CRM is an AI-native marketing platform that helps brands intelligently reach shoppers. It segments customers using RFM analytics, generates personalized messages via Gemini AI, selects optimal channels (WhatsApp, SMS, Email, RCS), and applies dynamic discounts. Campaigns are fully customizable before launch, with real-time tracking of message delivery, opens, clicks, and attributed orders.

---

## ✨ Core Features

```
Frontend (React/Vite)  →  CRM Backend (Express/Mongoose)  →  Channel Simulator
                                    ↑                              |
                                    └──── async webhooks ──────────┘
```

### Key Design Decisions

- **Shopper Vitals (RFM)**: Recency, Frequency, Monetary scoring segments shoppers into Champions, Loyal, At Risk, Hibernating, New
- **AI Copilot**: Natural language → segment rule + message + channel recommendation
- **Two-service callback loop**: CRM dispatches to channel stub; simulator fires async webhooks (SENT → DELIVERED → READ → OPENED → CLICKED → ORDER_ATTRIBUTED)
- **Attribution**: Clicked messages can trigger simulated orders back into CRM
- **Queue**: BullMQ with in-memory fallback (no Redis required for demo)

## Quick Start (Local)

### Prerequisites

- Node.js 18+
- npm

### 1. Backend

```bash
cd crm-backend
npm install
npm run setup    # seed Arora Roast shopper data to MongoDB
npm run dev      # http://localhost:5000
```

### 2. Channel Simulator (separate terminal)

```bash
cd channel-simulator
npm install
npm start        # http://localhost:5001
```

### 3. Frontend (separate terminal)

```bash
cd crm-frontend
npm install
npm run dev      # http://localhost:5173
```

### Optional: Gemini AI

Add your key to `crm-backend/.env`:

```
GEMINI_API_KEY=your_key_here
```

Without it, smart heuristics are used as fallback.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/vitals` | RFM shopper vitals summary |
| GET | `/api/dashboard` | Campaigns + vitals |
| POST | `/api/ai/segment` | AI segment from natural language |
| POST | `/api/ai/campaign` | AI message + channel draft |
| POST | `/api/segments` | Save segment |
| POST | `/api/campaigns/launch` | Launch campaign |
| POST | `/api/webhooks/channel` | Channel receipt callback |
| GET | `/api/campaigns/:id` | Campaign detail + event timeline |

## Deployment

### Frontend → Vercel

```bash
cd crm-frontend
# Set VITE_API_URL=https://your-backend.onrender.com/api
vercel --prod
```

### Backend → Render

- Build: `npm install`
- Start: `npm start`
- Env: `MONGODB_URI`, `CHANNEL_SERVICE_URL`, `GEMINI_API_KEY`

### Channel Simulator → Render

- Start: `npm start`
- Env: `CRM_WEBHOOK_URL=https://your-backend.onrender.com/api/webhooks/channel`

## Tradeoffs

| Chose | Skipped (at scale) |
|-------|-------------------|
| MongoDB for dynamic model simplicity | Sharded MongoDB cluster + connection pooling |
| In-memory queue fallback | Mandatory Redis cluster |
| Single-brand demo | Multi-tenant auth |
| Heuristic AI fallback | Fine-tuned models |

## Repos (for submission)

- `crm-backend` → GitHub backend repo
- `crm-frontend` → GitHub frontend repo
- `channel-simulator` → can be in backend repo or separate

## Author

Built for Xeno SDE Internship Drive 2026.
