# Mini CRM - AI-Native Customer Engagement Platform

## Project Description (250 Characters)

**Mini CRM** is an AI-native marketing platform that helps brands intelligently reach shoppers. It segments customers using RFM analytics, generates personalized messages via Gemini AI, selects optimal channels (WhatsApp, SMS, Email, RCS), and applies dynamic discounts. Campaigns are fully customizable before launch, with real-time tracking of message delivery, opens, clicks, and attributed orders across a two-service callback architecture.

---

## Key Features

✨ **AI-Native Campaign Builder**
- Natural language goal input → AI diagnoses audience segment
- Gemini-powered message generation with segment-specific recommendations
- Intelligent channel selection based on customer engagement patterns

🎯 **Advanced Segmentation**
- RFM (Recency, Frequency, Monetary) analytics
- Pre-built segments: Champions, Loyal, At Risk, Hibernating, New, Active
- Custom rule-based targeting with spend thresholds and inactivity filters

📱 **Multi-Channel Support**
- WhatsApp, SMS, Email, RCS
- Per-segment channel optimization
- Dynamic discount configuration (0-100%)
- Message personalization with {name} templates

📊 **Real-Time Analytics Dashboard**
- Live campaign metrics (sent, delivered, read, opened, clicked, converted)
- Attribution tracking (orders → messages)
- Per-customer engagement history
- Conversion rate & attributed revenue

🔄 **Two-Service Callback Architecture**
- Backend API (Node.js, Express)
- Channel Simulator (async lifecycle simulation)
- Webhook-driven event ingestion
- Order attribution & customer LTV updates

---

## Architecture

```
Frontend (React/Vite :5173)
    ↓ POST /ai/segment (goal)
Backend API (Node/Express :5000)
    ├── AI Controller → Gemini API
    ├── RFM Service → Segmentation
    ├── Campaign Controller → Messaging
    └── Webhook Receiver → Event storage
        ↓ POST /send (messages)
Channel Simulator (Node :5001)
    └── Lifecycle simulation: SENT → DELIVERED → READ → OPENED → CLICKED → ORDER_ATTRIBUTED
        ↓ POST /webhooks/channel (callbacks)
    MongoDB stores: Campaigns, Communications, Events, Customers, Orders
        ↓ Socket.io real-time updates
    Dashboard (live metrics)
```

---

## Data Model

**Customer**
- RFM vitals (recency, frequency, monetary)
- Channel engagement history
- Segment labels & churn risk
- Lifetime value predictions

**Campaign**
- Message, channel, discount
- Segment + manual user selection
- AI metadata (generated, reasoning)
- Status tracking (DRAFT → LAUNCHED → COMPLETED)

**Communication**
- Per-customer campaign delivery
- Status lifecycle tracking
- Attributed order amounts
- Event log with timestamps

**CommunicationEvent**
- SENT, DELIVERED, READ, OPENED, CLICKED, ORDER_ATTRIBUTED
- Event log notes
- Timestamps for analytics

---

## Setup & Run

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)
- Gemini API key (optional; mock mode available)

### Installation

```bash
# Backend
cd crm-backend
npm install
npm run dev  # runs on :5000

# Channel Simulator
cd ../channel-simulator
npm install
npm start  # runs on :5001

# Frontend
cd ../crm-frontend
npm install
npm run dev  # runs on :5173
```

### Environment Variables

**crm-backend/.env**
```
MONGODB_URI=mongodb://localhost:27017/minicrm
GEMINI_API_KEY=your_key_here
USE_MOCK_GEMINI=false
PORT=5000
CRM_WEBHOOK_URL=http://localhost:5000/api/webhooks/channel
```

**channel-simulator/.env**
```
CRM_WEBHOOK_URL=http://localhost:5000/api/webhooks/channel
PORT=5001
```

### Seed Data

```bash
cd crm-backend
node seed.js  # Creates 50 test customers
```

---

## Testing Workflow

1. **Open** http://localhost:5173
2. **Diagnose**: Click suggestion or enter goal → AI analyzes audience
3. **Generate**: Click "Generate Message" → Customizer appears
4. **Customize**: Edit message, select channel, adjust discount, pick customers
5. **Launch**: Click "Launch to X Shoppers" → Campaign queued
6. **Monitor**: Watch Dashboard for real-time metrics (sent, delivered, opened, clicked, attributed orders)

---

## AI-Native Development

This project leverages AI throughout the workflow:
- **Natural language understanding** to interpret marketer goals
- **Message generation** with brand voice & segment context
- **Channel intelligence** based on customer engagement patterns
- **Discount recommendations** aligned with segment sensitivity

AI was used in:
- Architecture design (system thinking)
- Code generation (models, services, controllers)
- Debugging (identifying and fixing schema/enum issues)
- Testing (lifecycle simulation)

---

## Scalability & Tradeoffs

**Current Scope (Single Region)**
- Single backend instance
- Local MongoDB
- BullMQ for message queue (in-memory)
- WebSocket for real-time updates

**Scaling Path**
- Multi-region backend + Redis queue
- MongoDB sharding by customer segment
- CDN for static assets
- Dedicated webhook workers
- Message broker (RabbitMQ) for 100K+ campaigns/day

**Tradeoffs Made**
- ✅ In-memory queue for simplicity (use Redis at scale)
- ✅ Sync API calls for customer selection (async at scale)
- ✅ MongoDB for storage (NoSQL flexibility for segment rules)
- ✅ WebSocket for real-time (polling fallback available)

---

## Code Quality

- **Clean separation of concerns**: Controllers, services, models
- **Error handling**: Try/catch with console logging for debugging
- **Validation**: Channel enums, discount clamping, required fields
- **Documentation**: Inline comments for complex logic
- **Reusable patterns**: RFM calculation, message personalization, stats building

---

## Submission Details

**Repository**: [Your GitHub URL]
**Hosted URL**: [Your deployment URL]
**Walkthrough Video**: [Your video link]

---

## Next Steps for Production

- [ ] Add authentication (JWT tokens)
- [ ] Implement rate limiting
- [ ] Add A/B testing framework
- [ ] Export analytics to BI tools
- [ ] Mobile app for campaign approval
- [ ] Advanced ML segmentation
- [ ] Inventory management integration

---

**Built by**: [Your Name]  
**Date**: June 2026  
**Xeno Take-Home Assignment**
