# How PulseCRM Works Like a Real Production System

## Real-Time Architecture

```
Marketer (Browser)
       │
       │  WebSocket (instant updates)
       ▼
┌──────────────────┐
│  CRM Backend     │◄──── REST API (launch, AI, vitals)
│  + Socket.io     │
└────────┬─────────┘
         │ HTTP POST /send
         ▼
┌──────────────────┐
│ Channel Service  │  (like Twilio / Gupshup / SendGrid)
│  (Simulator)     │
└────────┬─────────┘
         │ async webhooks (POST /api/webhooks/channel)
         ▼
┌──────────────────┐
│  CRM Backend     │──► broadcasts to all browsers via WebSocket
└──────────────────┘
```

## Lifecycle of One Message (Real Production Flow)

| Step | Who | What happens |
|------|-----|--------------|
| 1 | Marketer | Clicks "Launch Campaign" |
| 2 | CRM | Creates Communication records (PENDING) |
| 3 | Queue | Dispatches jobs to channel (10 concurrent) |
| 4 | Channel | Returns 202 Accepted → CRM marks QUEUED |
| 5 | Channel | Async: SENT webhook → CRM updates + WebSocket push |
| 6 | Channel | DELIVERED → READ → OPENED → CLICKED webhooks |
| 7 | Channel | 35% of clicks → ORDER_ATTRIBUTED + revenue |
| 8 | CRM | Broadcasts stats after every webhook |
| 9 | Browser | Dashboard updates instantly (no refresh) |

## WebSocket Events

| Event | When |
|-------|------|
| `communication:update` | Every webhook received |
| `campaign:stats` | Stats recalculated |
| `campaign:launch` | Campaign started |
| `campaign:completed` | All messages finished |
| `activity` | Live feed in sidebar |

## Run All 3 Services

```powershell
.\fix-and-start.ps1
```

Then install new packages first time:
```powershell
cd crm-backend; npm install
cd ..\crm-frontend; npm install
```

Open http://localhost:5173 — sidebar shows **Live Stream** with green dot.
