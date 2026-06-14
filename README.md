# 🚀 Mini CRM – AI‑Native Customer Engagement Platform

**Mini CRM** is an intelligent marketing platform that enables brands to reach shoppers through AI‑driven segmentation, personalized messaging, and multi‑channel campaigns.

---

## 📚 Quick Overview

- **AI Copilot**: Turn natural‑language prompts into shopper segments, campaign messages, and optimal channel recommendations using Gemini (or a heuristic fallback).
- **Shopper Vitals (RFM)**: Recency‑Frequency‑Monetary scoring automatically groups shoppers into **Champions, Loyal, At‑Risk, Hibernating, New**.
- **Channel Simulator**: A lightweight service that mimics real‑world delivery pipelines (WhatsApp, SMS, Email, RCS) with async webhook callbacks for **SENT → DELIVERED → READ → OPENED → CLICKED → ORDER_ATTRIBUTED**.
- **Attribution Loop**: Clicked messages can trigger simulated orders that flow back into the CRM for closed‑loop analytics.
- **Dynamic Discounts**: AI can suggest discount values (e.g., 15 %) that are applied per‑campaign.

---

## 🏗️ Architecture Diagram

![Mini CRM Architecture](file:///C:/Users/user/.gemini/antigravity-ide/brain/f7bc9903-bbdc-459d-9b8e-8a33c94e7e1c/mini_crm_architecture_1781373090790.png)

---

## ⚙️ System Components

| Component | Tech Stack | Purpose |
|-----------|------------|---------|
| **Frontend** | React + Vite | Interactive UI for campaign creation, shopper insights, and live dashboard |
| **Backend API** | Node.js (Express) + Mongoose (MongoDB) | Business logic, AI integration, campaign orchestration |
| **Channel Simulator** | Node.js (Express) | Mock external channels, emit async webhook events |
| **Queue** | BullMQ (in‑memory fallback) | Reliable background processing of campaigns |
| **Database** | MongoDB (local / Atlas) | Persist shoppers, segments, campaigns, events |

---

## 🚀 Local Development

### Prerequisites
- Node.js ≥ 18
- npm
- (Optional) MongoDB instance (local or Atlas)

### 1. Backend
```bash
cd crm-backend
npm install
# Seed demo shopper data
npm run setup
# Start the API (http://localhost:5000)
npm run dev
```

### 2. Channel Simulator (in a separate terminal)
```bash
cd channel-simulator
npm install
npm start   # http://localhost:5001
```

### 3. Frontend (in a third terminal)
```bash
cd crm-frontend
npm install
npm run dev   # http://localhost:5173
```

### 4. Enable Gemini AI (optional)
Create a `.env` file in `crm-backend/`:
```dotenv
GEMINI_API_KEY=YOUR_GEMINI_KEY
```
If the key is missing, the service falls back to deterministic heuristics.

---

## 📡 API Reference
| Method | Path | Description |
|--------|------|-------------|
| **GET** | `/api/health` | Health check |
| **GET** | `/api/vitals` | Summary of RFM shopper vitals |
| **GET** | `/api/dashboard` | Overview of campaigns & vitals |
| **POST** | `/api/ai/segment` | Generate segment rules from natural language |
| **POST** | `/api/ai/campaign` | Generate message + channel recommendation |
| **POST** | `/api/segments` | Persist a new segment |
| **POST** | `/api/campaigns/launch` | Launch a prepared campaign |
| **POST** | `/api/webhooks/channel` | Receive async channel callbacks |
| **GET** | `/api/campaigns/:id` | Campaign details + event timeline |

---

## 📦 Deployment Guide
### Backend → Render / Railway / Render
```bash
# Build step
echo "npm install"
# Start command
npm start
```
Set environment variables:
- `MONGODB_URI`
- `CHANNEL_SERVICE_URL`
- `GEMINI_API_KEY` (optional)
- `WEBHOOK_URL` (URL of your backend for the simulator to call)

### Frontend → Vercel / Netlify
```bash
cd crm-frontend
# Set API endpoint for production
export VITE_API_URL=https://your-backend.com/api
vercel --prod
```

### Channel Simulator → Render (or keep local for demo)
Provide `CRM_WEBHOOK_URL` env var pointing to the deployed backend webhook endpoint.

---

## 🛠️ Trade‑offs & Future Work
| Decision | Reason | Potential Improvement |
|----------|--------|-----------------------|
| **MongoDB** for schema flexibility | Simple document model for shopper data | Sharded cluster for high‑scale multi‑tenant |
| **In‑memory queue fallback** | No external Redis required for demo | Dedicated Redis for durability |
| **Single‑brand demo** | Keeps scope manageable for internship | Multi‑tenant auth & brand isolation |
| **Heuristic AI fallback** | Guarantees functionality without API key | Fine‑tuned Gemini model for better copy |

---

## 📁 Repository Layout
```
MiniCRM/
├─ .git/                # Git history
├─ .gitignore           # Ignored files (see below)
├─ README.md            # **You are here**
├─ channel-simulator/   # Mock channel service
├─ crm-backend/         # Express API
├─ crm-frontend/        # React UI (Vite)
└─ guides/              # Helpful docs / scripts (clean_repo.ps1, etc.)
```

---

## 📃 Guides (Optional)
The `guides/` folder contains utility scripts used during development (e.g., `clean_repo.ps1`). They are ignored by Git by default.

---

## 📜 Author & License
**Built for the Xeno SDE Internship Drive 2026**

---

*Feel free to open an issue or submit a PR for enhancements!*
