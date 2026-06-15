# PulseCRM – AI‑Native Mini CRM

![MIT License](https://img.shields.io/badge/License-MIT-green.svg) ![Node.js](https://img.shields.io/badge/Node.js-22%2B-blue.svg)

## 📢 Overview
**PulseCRM** is an AI‑native mini‑CRM built for the Xeno SDE Internship assignment. It helps a fictional premium coffee brand **Arora Roast** intelligently reach its shoppers using a **Campaign Copilot**. Marketers type a natural‑language goal, the AI proposes the right audience, crafts a message, picks the optimal channel, and suggests a discount. The human stays in full control and can customize before launch.

---

## 🖥️ Live Demo Flow (5 min walkthrough)
1. **AI Copilot** – type a goal such as *“Re‑engage shoppers who haven’t ordered in 60 days with a 15 % discount.”*
2. **Audience diagnosis** – AI returns the **At‑Risk** segment with shopper vitals.
3. **Message & channel** – AI suggests WhatsApp + 15 % discount; preview updates instantly.
4. **Campaign customizer** – adjust discount or channel, see live preview.
5. **Launch** – campaign is queued; the **Live Campaigns** dashboard shows the funnel updating in real time (SENT → DELIVERED → READ → OPENED → CLICKED → ORDER_ATTRIBUTED).
6. Quick glance at **Shopper Vitals** (RFM scores) and the **Add Data** tab.

---

## 🏗️ System Architecture
![PulseCRM Architecture Diagram](file:///C:/Users/user/.gemini/antigravity-ide/brain/6a52fc4d-f346-4022-9003-170b61f88170/pulsecrm_architecture_image_1781483679551.png)

### Data Flow Diagram
![Data Flow Diagram](file:///C:/Users/user/.gemini/antigravity-ide/brain/6a52fc4d-f346-4022-9003-170b61f88170/pulsecrm_data_flow_1781459125129.png)

> **Architecture diagram** – see the image generated for the walkthrough: ![Architecture](file:///C:/Users/user/.gemini/antigravity-ide/brain/6a52fc4d-f346-4022-9003-170b61f88170/pulsecrm_architecture_1781458801362.png)

---

## 📂 Repository Layout
```
MiniCRM/
├─ crm-frontend/      # React + Vite UI
│   └─ src/...       
├─ crm-backend/       # Express API, Mongoose models, services
│   ├─ models/        # Customer, Order, Campaign, etc.
│   ├─ controllers/   # AI, Campaign, Webhook, RFM
│   ├─ services/      # aiService.js, rfmService.js, statsService.js
│   └─ queue.js       # BullMQ / fallback queue
├─ channel-simulator/ # Mock external channels, async webhook lifecycle
│   └─ server.js
├─ docs/              # Architecture & data‑flow images
│   ├─ pulsecrm_architecture_*.png
│   └─ pulsecrm_data_flow_*.png
└─ README.md          # (this file)
```

---

## 🤖 AI Integration & Fallback
- **Gemini 2.0 Flash** powers segment interpretation and message generation.
- **Graceful degradation** – if the Gemini API key is missing or rate‑limited, `services/aiService.js` falls back to a deterministic heuristic (keyword matching + simple templates) so the demo never breaks.
- **Two‑service callback loop** – the backend posts webhook events to the channel simulator, which replies with status updates; the backend then forwards them back to the frontend via Socket.IO.

---

## 📈 Trade‑offs (quick table)
| Decision | Reason | At‑scale alternative |
|---|---|---|
| **MongoDB** | Flexible document model for campaigns & communications | Sharded cluster with replicas |
| **In‑memory queue** | Zero‑dependency demo | Dedicated Redis + BullMQ |
| **Single‑brand focus** | Manageable scope, deep AI iteration | Multi‑tenant architecture with JWT auth |
| **Heuristic fallback** | Works without API key | Fine‑tuned Gemini model + caching |
| **On‑the‑fly RFM** | Fresh scores for demo | Nightly batch job, cache in Redis |

---

## 🚀 Getting Started
```bash
# Clone the repo
git clone <YOUR_GITHUB_URL>
cd MiniCRM

# Install dependencies (backend & frontend)
npm install          # installs root + workspace packages

# Set up env (copy example files)
cp crm-backend/.env.example crm-backend/.env
cp channel-simulator/.env.example channel-simulator/.env

# Start services (in separate terminals)
# Backend API
npm run dev --workspace=crm-backend
# Frontend UI
npm run dev --workspace=crm-frontend
# Channel simulator
npm run dev --workspace=channel-simulator
```
Open `http://localhost:5173` (Vite) and follow the demo flow described above.

---

## 🎬 Video Walkthrough
The 5‑minute walkthrough script is included in the repository under `docs/video_transcript_final.md`. Use it as a teleprompter while recording.

---

*Prepared by **Tati Suman Yadav** for the Xeno SDE Internship – June 2026.*
