# PulseCRM — Complete Guide (Simple English + Telugu hints)

## మనం ఏం బిల్డ్ చేశాం? (What we built)

**PulseCRM** = AI-powered Mini CRM for a fake coffee brand **Arora Roast**.

Xeno assignment ki oka complete marketing tool:
- Shoppers data store cheyadam
- AI tho segment find cheyadam
- WhatsApp/SMS/Email campaigns pampadam
- Live analytics chudadam

---

## 3 Parts (3 Separate Apps)

| # | Folder | Port | Purpose |
|---|--------|------|---------|
| 1 | `crm-frontend` | 5173 | Website UI (browser lo chustaru) |
| 2 | `crm-backend` | 5000 | API server (brain — data + AI) |
| 3 | `channel-simulator` | 5001 | Fake WhatsApp/SMS service |

**Important:** Rendu kante moodu services run avvali campaign test cheyadaniki!

---

## Download / Install cheyalsina vi

### One-time only:
1. **Node.js** — https://nodejs.org (LTS version)
2. Project folder lo `npm install` — 3 folders lo:

```powershell
cd crm-backend
npm install

cd ..\channel-simulator
npm install

cd ..\crm-frontend
npm install
```

### Optional (better AI):
- **Gemini API Key** — https://aistudio.google.com
- `crm-backend\.env` lo add cheyandi: `GEMINI_API_KEY=your_key`
- Lekapothe kuda work avutundi (fallback rules use avutayi)

### NOT needed:
- Redis (optional)
- PostgreSQL (SQLite use chestunnam)
- Real WhatsApp API

---

## APIs (Backend — port 5000)

| API | Method | Em chestundi |
|-----|--------|--------------|
| `/api/health` | GET | Server working aa check |
| `/api/vitals` | GET | Shopper health (RFM scores) |
| `/api/dashboard` | GET | Campaigns + stats |
| `/api/customers` | GET | Shopper list |
| `/api/ai/segment` | POST | AI audience find cheyadam |
| `/api/ai/campaign` | POST | AI message draft |
| `/api/segments` | POST | Segment save |
| `/api/campaigns/launch` | POST | Campaign start |
| `/api/campaigns/:id` | GET | Campaign details |
| `/api/webhooks/channel` | POST | Channel simulator callbacks |

---

## How to Run (EASY WAY)

```powershell
cd C:\Users\user\OneDrive\ドキュメント\Desktop\MiniCRM
.\fix-and-start.ps1
```

Browser open: **http://localhost:5173**

---

## Your Error (EPERM) — Fix

```
EPERM: operation not permitted, rename query_engine-windows.dll.node
```

**Reason:** Project **OneDrive** folder lo undi. OneDrive files lock chestundi.

**Best fix (choose one):**

### Option A — Pause OneDrive (quick)
1. OneDrive icon → Pause syncing → 2 hours
2. All PowerShell windows close cheyandi
3. `.\fix-and-start.ps1` run cheyandi

### Option B — Move project (best)
```powershell
# Copy to local folder (no OneDrive)
xcopy "C:\Users\user\OneDrive\ドキュメント\Desktop\MiniCRM" "C:\Dev\MiniCRM" /E /I
cd C:\Dev\MiniCRM
.\fix-and-start.ps1
```

---

## Demo Flow (Assignment video ki)

1. Open http://localhost:5173
2. **Shopper Vitals** tab — pie chart chupinchandi
3. **AI Copilot** — suggestion click → Diagnose → Generate → Launch
4. **Live Campaigns** — numbers live ga update avutayi
5. **Details** — event timeline chupinchandi

---

## Submission Checklist (June 15)

- [ ] Deploy frontend (Vercel)
- [ ] Deploy backend (Render)
- [ ] GitHub repos (public)
- [ ] 5-6 min video + transcript
- [ ] Form submit: https://forms.gle/fJqAPf9YVmCYPSUX9
