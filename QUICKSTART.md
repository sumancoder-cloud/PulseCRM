# 🚀 Quick Start Guide

## 1️⃣ Start the System

**Terminal 1** (Backend):
```bash
cd crm-backend
npm run dev
# Running on http://localhost:5000
```

**Terminal 2** (Channel Simulator):
```bash
cd channel-simulator
npm start
# Running on http://localhost:5001
```

**Terminal 3** (Frontend):
```bash
cd crm-frontend
npm run dev
# Running on http://localhost:5173
```

## 2️⃣ First Campaign (30 seconds)

1. Open http://localhost:5173
2. Click **AI Copilot** tab
3. Enter: `"Win back at-risk shoppers with 15% off"`
4. Click **Diagnose** → ✓ Segment found
5. Click **Generate Message** → ✓ AI generates
6. **Customizer UI** appears with:
   - ✏️ Message editor
   - 📱 Channel selector (choose SMS or WhatsApp)
   - 💰 Discount slider (adjust to 20%)
   - 👥 Customer selector (optional - pick specific users)
7. Click **Launch** → Campaign sent!
8. Watch **Live Stream** (left sidebar) for real-time updates

## 3️⃣ What's Different Now?

### Before
- ❌ Fixed 15% discount for everything
- ❌ Always WhatsApp (no choice)
- ❌ Static message template

### Now ✨
- ✅ **Customize discount** per campaign (0-100%)
- ✅ **Select channel** (WhatsApp, SMS, Email, RCS)
- ✅ **Edit message** before sending
- ✅ **Choose specific customers** from segment
- ✅ **AI-aware context** (customer preferences included)
- ✅ **Live preview** before launch
- ✅ **Segment stats** shown (audience size, conversion %)

## 4️⃣ Key Endpoints

### Get Dynamic Message
```bash
curl -X POST http://localhost:5000/api/ai/message \
  -H "Content-Type: application/json" \
  -d '{
    "segmentId": "...",
    "goal": "Win back shoppers",
    "overrides": {
      "channel": "SMS",
      "discount": 20
    }
  }'
```

### List Segment Customers
```bash
curl http://localhost:5000/api/segments/:id/customers
```

## 5️⃣ Testing Scenarios

### Scenario A: Change Channel
1. In customizer, click SMS icon
2. See preview update to SMS format
3. Launch → messages sent via SMS

### Scenario B: Manual Customer Selection
1. Click "Show Segment (245)"
2. Uncheck specific customers
3. Select only 5 customers
4. Launch → only those 5 get message

### Scenario C: Adjust Discount
1. Move slider to 30%
2. See preview show "30% OFF"
3. Launch → discount 30% for this campaign

## 6️⃣ Environment Variables

### `.env` (Backend)
```
GEMINI_API_KEY="..." (your real key or mock)
USE_MOCK_GEMINI=true (set to false for real API)
MOCK_DISCOUNT=15 (default discount for mock mode)
```

## 7️⃣ Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Gemini API failed" | Set `USE_MOCK_GEMINI=true` |
| No customers showing | Run `npm run seed` in backend |
| Channel selector missing | Hard refresh (Ctrl+Shift+R) |
| Messages not sent | Check channel-simulator is running |
| UI not updating | Clear browser cache |

## 8️⃣ File Checklist

**Backend Files Modified** ✅
- ✓ `models/Customer.js` - Added RFM + channel fields
- ✓ `models/Campaign.js` - Added discount, channel enum
- ✓ `services/aiService.js` - New message generation function
- ✓ `services/rfmService.js` - New helper functions
- ✓ `controllers/aiController.js` - New /api/ai/message endpoint
- ✓ `controllers/campaignController.js` - New endpoints + enhanced launch
- ✓ `routes/index.js` - New routes

**Frontend Files Modified** ✅
- ✓ `src/App.jsx` - Updated handlers + new component import
- ✓ `src/CampaignCustomizer.jsx` - NEW component (channel, discount, customers)

**Documentation** ✅
- ✓ `IMPLEMENTATION_GUIDE.md` - Full reference
- ✓ `QUICKSTART.md` - This file

## 9️⃣ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ AI Copilot Tab                                       │  │
│  │ 1. Goal Input → 2. Diagnosis → 3. Generation        │  │
│  │    ↓                                                  │  │
│  │ CampaignCustomizer Component                         │  │
│  │ • Message Editor (textarea)                          │  │
│  │ • Channel Selector (4 buttons)                       │  │
│  │ • Discount Slider (0-100%)                           │  │
│  │ • Customer Selector (checkbox list)                  │  │
│  │ • Live Preview (message preview)                     │  │
│  │    ↓                                                  │  │
│  │ Launch Button → POST /api/campaigns/launch           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Express)               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ POST /api/ai/message                                 │  │
│  │ • Gemini: Generate message with context              │  │
│  │ • RFM: Include customer preferences                  │  │
│  │ • Return: message + channel + discount               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ POST /api/campaigns/launch                           │  │
│  │ • Create campaign with discount                      │  │
│  │ • Queue messages for selected/segment customers      │  │
│  │ • Broadcast via WebSocket                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Channel Simulator (http://5001)               │
│ Receives messages and simulates: SENT → OPENED → CLICKED  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│         MongoDB + WebSocket Real-time Updates              │
│ Live stream shows: "Message sent to Suman via SMS (20%)"   │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Next: Interview Talking Points

When presenting this system:

1. **"I built an AI-powered marketing platform that generates personalized campaigns"**
   - Uses Gemini AI for message generation
   - Analyzes RFM scores for segmentation
   - Includes customer context in AI prompts

2. **"The system gives non-technical users full control"**
   - Drag-drop channel selector
   - Slider for discounts
   - Manual customer selection
   - Live preview before launch

3. **"Dynamic personalization at scale"**
   - Different tone per segment
   - Channel optimized per customer
   - Discount sensitivity based on coupon history
   - Message variants for A/B testing

4. **"Real-time analytics with WebSocket"**
   - Live campaign dashboard
   - Instant delivery tracking
   - Engagement metrics (open rate, click rate)
   - Revenue attribution

5. **"Fallback-first design"**
   - Works without Gemini (mock mode)
   - Segment-specific defaults
   - Graceful error handling
   - Production-ready

---

## 🏆 You're Ready!

All features implemented and tested. Start the system and try a campaign! 

Questions? Check `IMPLEMENTATION_GUIDE.md` for detailed docs.
