# PulseCRM — SDE Internship Interview Prep Guide

This guide is designed to help you ace your final interview for Xeno SDE Internship. It outlines the elevator pitch, architecture, RFM formulas, AI features, tradeoffs, and includes a ready-to-use script for your walkthrough video.

---

## 1. The 30-Second Elevator Pitch

> *"I built **PulseCRM** using the **MERN** stack. It's an AI-native marketing and customer engagement tool for D2C brands. Marketers can describe their campaign goals in natural language, and the built-in AI interpreter automatically extracts behavioral query parameters to segment shoppers based on dynamic **RFM (Recency, Frequency, Monetary) vitals**. Personalized messages are then dispatched to the target audience via an asynchronous queue through a stubbed channel service on port 5001. The channel service simulates real-world customer outcomes (SENT, DELIVERED, READ, OPENED, CLICKED, ORDER_ATTRIBUTED) and notifies the CRM backend asynchronously via webhooks, updating our live analytics dashboard in real time using WebSockets."*

---

## 2. Architecture & System Flow

### System Diagram
```
  [ React/Vite Frontend ] (Port 5173)
             │
             │ HTTP REST (Launch, AI, Ingestion)
             │ WebSocket (Real-Time updates)
             ▼
    [ Express Backend ] (Port 5000)
       │           │
       │ Mongoose  │ HTTP POST /send
       ▼           ▼
  [ MongoDB ]   [ Channel Simulator ] (Port 5001)
                   │
                   │ Async Webhooks (POST /api/webhooks/channel)
                   └───────────────────► [ Express Backend ]
```

### Key Architectural Decisions:
1. **MERN Stack**: Replaced the previous SQLite/Prisma architecture with MongoDB and Mongoose. MongoDB provides a flexible schema that allows storing complex, nested structures like segment rules (e.g. Mixed Mongoose type) and raw log payloads.
2. **Two-Service Hook Loop**: The split between CRM (port 5000) and Channel Service (port 5001) simulates industry standard APIs like Twilio or Gupshup. It handles rate limiting, delivery receipts, and conversion attribution.
3. **Queue Processing**: Implemented a concurrency-limited queue runner (defaults to 10 parallel requests) with a built-in memory array buffer and Redis/BullMQ fallback. This prevents overloading downstream channel APIs.
4. **WebSockets (Socket.io)**: Feeds events to the sidebar in real time (funnel updates from SENT -> ORDER_ATTRIBUTED) without requiring manual browser refreshes.

---

## 3. RFM Shopper Vitals Formulas

The shoppers' health scores are calculated dynamically using three metrics:

1. **Recency (R)**: Days elapsed since the last order date (`lastOrderDate`):
   * $\le 14 \text{ days}$ $\rightarrow$ **Score 5**
   * $\le 30 \text{ days}$ $\rightarrow$ **Score 4**
   * $\le 60 \text{ days}$ $\rightarrow$ **Score 3**
   * $\le 90 \text{ days}$ $\rightarrow$ **Score 2**
   * $> 90 \text{ days}$ or no orders $\rightarrow$ **Score 1**

2. **Frequency (F)**: Total number of orders placed (`orderCount`):
   * $\ge 8 \text{ orders}$ $\rightarrow$ **Score 5**
   * $\ge 5 \text{ orders}$ $\rightarrow$ **Score 4**
   * $\ge 3 \text{ orders}$ $\rightarrow$ **Score 3**
   * $\ge 1 \text{ order}$ $\rightarrow$ **Score 2**
   * $0 \text{ orders}$ $\rightarrow$ **Score 1**

3. **Monetary (M)**: Cumulative monetary value spent (`totalSpent`):
   * $\ge \text{₹}15,000$ $\rightarrow$ **Score 5**
   * $\ge \text{₹}8,000$ $\rightarrow$ **Score 4**
   * $\ge \text{₹}4,000$ $\rightarrow$ **Score 3**
   * $\ge \text{₹}1,500$ $\rightarrow$ **Score 2**
   * $< \text{₹}1,500$ $\rightarrow$ **Score 1**

### Vitals Segment Classification:
- **New**: $0 \text{ orders}$.
- **Champions**: $R \ge 4$, $F \ge 4$, and $M \ge 4$ (highly active, high frequency, and high value).
- **At Risk**: $R \le 2$, $F \ge 3$, and $M \ge 3$ (made high value purchases before, but hasn't returned in a while).
- **Hibernating**: $R \le 2$ and $F \le 2$ (low-value, inactive users about to be lost).
- **Loyal**: All others (consistent repeat buyers).

---

## 4. AI-Native Workflow

We leverage Google's **Gemini 2.0 Flash** (`@google/generative-ai`) model for two primary intelligent components:

1. **Segment Prompt Interpreter**: Takes the marketer's natural language goal and outputs a JSON object containing query rules:
   ```json
   {
     "spend": 1500,
     "daysInactive": 60,
     "vitalsLabel": "At Risk",
     "minOrderCount": 2,
     "reason": "Targeting lapsed customers with high lifetime value"
   }
   ```
2. **Campaign Draft Generator**: Suggests personalized text (with `{name}` placeholders), selects the optimal channel (WhatsApp, Email, SMS, RCS) based on historical response rates, and creates marketing variants.
3. **Heuristic Fallback**: If no `GEMINI_API_KEY` is provided, a robust keyword search (regex matching words like *champions*, *at risk*, *spent*, etc.) takes over seamlessly to make segment recommendations.

---

## 5. Explicit Tradeoffs & Scale Planning

Be ready to explain what you did for this prototype and how you would design it at scale:

| Component | Prototype Implementation | Production Scale Implementation |
|---|---|---|
| **Database** | Single MongoDB database instance. | Sharded MongoDB cluster. Read-replicas to separate campaign-launch queries from live webhooks write-traffic. |
| **Queue** | Concurrency-limited in-memory queue. | BullMQ backed by a high-availability Redis cluster to handle millions of jobs with retry logic, backoffs, and DLQ. |
| **Attribution** | Webhook listener updates customer stats directly. | Process webhooks via an event stream (e.g. Kafka or AWS Kinesis) and calculate shopper vitals asynchronously. |
| **Authentication**| Skipped for simplicity. | OAuth2 + JWT (JSON Web Tokens) with Role-Based Access Control (RBAC). |

---

## 6. Walkthrough Video Script (5-6 Minutes)

Prepare to record your screen while explaining. Keep it clear, calm, and professional:

### Section 1: Intro (0.5 mins)
* **On Screen**: Show the browser with the PulseCRM homepage.
* **Script**: *"Hi, my name is [Your Name], and this is my submission for the SDE Internship Drive at Xeno. I built PulseCRM, which is a shopper engagement platform for a premium coffee D2C brand called Arora Roast. The app is built on the MERN stack with React on the frontend, Node and Express on the backend, and MongoDB as the database. It helps D2C brands segment their shopper base via RFM metrics and run personalized marketing campaigns."*

### Section 2: Ingestion & Live Updates (1.5 mins)
* **On Screen**: Click the **Add Data** tab.
* **Script**: *"Let's start by looking at data ingestion. We have a dedicated 'Add Data' tab to dynamically grow our shopper base. Let's add a new customer, say 'Karan Johar' in Mumbai. Let's click 'Ingest Shopper'. As you can see, a modern toast notification shows success, and our sidebar's real-time activities log shows this ingestion. Next, let's select Karan Johar from our dropdown and record an order of ₹15,000 for a Coffee Subscription Box. Clicking 'Record Purchase' creates the order in MongoDB. If we go to the 'Shopper Vitals' tab, we can verify that Karan Johar has now been categorized under 'Champions' because of his monetary purchase."*

### Section 3: AI Copilot & Segments (1.5 mins)
* **On Screen**: Click the **AI Copilot** tab.
* **Script**: *"Next, let's look at our AI Copilot tab. PulseCRM is AI-native. Rather than manually typing database queries, I can describe my marketing goal in plain English. Let's click this recommendation: 'Win back at-risk shoppers who haven't ordered in 60 days with a 15% discount.' and hit 'Diagnose'. The backend AI segmenter parses this, matches it to our database rules, and pulls out the shoppers. It has found our audience size. We can see a table of matched shoppers. Let's click 'Generate Message & Channel Strategy'. The AI drafts a personalized message using a {name} placeholder and recommends WhatsApp, explaining why it's optimal for Indian D2C coffee brands. Let's click 'Launch Campaign'."*

### Section 4: Live Campaigns & Webhooks (1.5 mins)
* **On Screen**: Automatically transitions to the **Live Campaigns** tab. Watch the counters and sidebar logs.
* **Script**: *"The moment we click Launch, the campaign starts sending. Because we stubbed our Channel Service as a separate service on port 5001, we model the full lifecycle. The channel service receives the messages, queue dispatches them, and calls back our webhook receipt API. We can see the dashboard charts updating in real time as webhooks arrive: Sent -> Delivered -> Read -> Opened -> Clicked. In fact, a percentage of shoppers will place orders which are attributed back to the campaign, generating revenue in real time. We can click 'Details' to view the full audit timeline for each customer's message."*

### Section 5: Code Walkthrough & Wrap-up (0.5 mins)
* **On Screen**: Briefly show your backend project directory in VS Code, pointing out `models/`, `controllers/`, and `services/`.
* **Script**: *"Taking a quick look at the codebase, I structured it using a clean MVC design. Inside `crm-backend`, we have folders for Mongoose `models`, API `controllers`, Express `routes`, and `services` like RFM scoring. The TypeScript and Prisma files have been completely migrated to native JavaScript ES modules. Everything is deployed and working. Thank you for your time, and I look forward to discussing my submission in the interviews!"*

---

## 7. Potential Trap Questions & Answers

### Q: Why did you choose MongoDB over a relational database like PostgreSQL?
* **A**: *"I chose MongoDB because marketing segment rules are highly dynamic. Marketers might want to segment by vitals, by total spent, by products purchased, or by geolocation. A document-oriented database allows us to store arbitrary, complex, schema-free segment rules directly as a Mixed object. Additionally, logging webhook callback payloads from multiple channel APIs requires high write-throughput, which fits MongoDB's write-performance characteristics perfectly."*

### Q: What happens if a webhook fails to deliver or arrives out of order?
* **A**: *"In our prototype, we implemented retry logic with exponential backoffs in the channel simulator. At production scale, webhooks would be pushed to a message broker like Kafka or RabbitMQ. Since webhook events can arrive out of order (e.g. READ arriving before DELIVERED due to network delay), we would write state updates using conditional logic—only updating communication state if the incoming state has a higher logical hierarchy (e.g. ORDER_ATTRIBUTED > CLICKED > READ > DELIVERED > SENT)."*

### Q: How do you prevent AI prompt injection?
* **A**: *"Our AI segment interpreter does not directly execute code or write queries. It acts strictly as a parser, mapping natural language to structured JSON rules. We enforce schema validation on the AI output using Mongoose queries rather than executing arbitrary commands. Even if a user inserts a malicious prompt, the validator sanitizes the resulting object, ignoring unrecognized keys."*
