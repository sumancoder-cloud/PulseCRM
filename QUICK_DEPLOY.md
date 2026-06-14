# Quick Deployment Steps - Render + Vercel

**Deadline: Monday, June 15, 2026 - 12:00 PM IST**
**Current Time: Saturday, June 14, 2026**
**Time Remaining: ~36 hours**

---

## 🔴 URGENT: Pre-Deployment (Do This First!)

### 1. Push Code to GitHub
```powershell
cd c:\Users\user\Downloads\MiniCRM
git add .
git commit -m "Prepare for deployment: Render + Vercel"
git push origin main
```

### 2. Verify Public Repository
- [ ] Go to your GitHub repository
- [ ] Check settings: **Settings → General → Visibility**
- [ ] Must be **PUBLIC** (not private)

### 3. Create Environment Files (Local)
```powershell
# Backend .env
copy crm-backend\.env.example crm-backend\.env

# Frontend .env (optional - Vercel will set via dashboard)
copy crm-frontend\.env.example crm-frontend\.env
```

---

## 🟢 BACKEND: Deploy to Render

### Step 1: Set Up MongoDB Atlas

**In your browser:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / Log in
3. Create a **Free Cluster** (M0 tier)
4. Create a **Database User**:
   - Username: `pulsecrm_user`
   - Password: Generate strong password (save it!)
   - Add IP: 0.0.0.0/0 (allow all - for now)
5. Get **Connection String**:
   - Click "Drivers" → copy connection string
   - Replace `<password>` with your password
   - Should look like: `mongodb+srv://pulsecrm_user:PASSWORD@cluster0.xxxxx.mongodb.net/pulsecrm?retryWrites=true&w=majority`
   - Save this URL

### Step 2: Create Redis Instance (Optional but recommended)

**Option A: Redis Cloud (Free)**
1. Go to https://redis.com/try-free/
2. Sign up
3. Create a **Free Database**
4. Copy **Connection String** (should include `:password@host:port`)
5. Save this URL

**Option B: Use Render's Redis**
- Can set up after backend deployment

### Step 3: Deploy Backend on Render

**In your browser:**

1. Go to https://dashboard.render.com
2. Sign up with GitHub (recommended)
3. Click **"New +"** → **"Web Service"**
4. Select your GitHub repository
5. Configure:
   | Setting | Value |
   |---------|-------|
   | **Name** | `pulsecrm-backend` |
   | **Environment** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Plan** | `Free` |

6. Click **"Create Web Service"** (it will start building)

7. Once created, add **Environment Variables**:
   - Go to **Environment** section
   - Add these variables:
   ```
   NODE_ENV = production
   MONGODB_URI = mongodb+srv://your_user:PASSWORD@cluster.xxxxx.mongodb.net/pulsecrm
   REDIS_URL = redis://default:PASSWORD@redis-host:6379
   GEMINI_API_KEY = your_gemini_api_key_here
   FRONTEND_URL = https://your-frontend-will-go-here.vercel.app
   USE_MOCK_GEMINI = false
   ```

8. Click **"Save"** (backend will redeploy)

9. Wait for deployment to complete (shows "Live" in top right)

10. **Copy your backend URL:** `https://pulsecrm-backend.onrender.com`

⏰ **Typical time: 5-10 minutes**

---

## 🔵 FRONTEND: Deploy to Vercel

### Step 1: Deploy on Vercel

**In your browser:**

1. Go to https://vercel.com
2. Sign up with GitHub (recommended)
3. Click **"Add New"** → **"Project"**
4. Select your GitHub repository
5. Configure:
   | Setting | Value |
   |---------|-------|
   | **Root Directory** | `crm-frontend` (if monorepo) or leave blank |
   | **Framework** | `Vite` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

6. Add **Environment Variables**:
   ```
   VITE_API_URL = https://pulsecrm-backend.onrender.com/api
   VITE_WS_URL = https://pulsecrm-backend.onrender.com
   ```

7. Click **"Deploy"**

8. Wait for deployment to complete (shows checkmark)

9. **Copy your frontend URL:** `https://your-project.vercel.app`

⏰ **Typical time: 3-5 minutes**

---

## 🔄 FINAL STEP: Link Them Together

### Update Backend with Frontend URL

1. Go back to **Render Dashboard**
2. Open **pulsecrm-backend** service
3. Go to **Environment**
4. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL = https://your-project.vercel.app
   ```
5. Click **"Save"** (backend will redeploy)

---

## ✅ Testing After Deployment

### Test Backend
```powershell
# Open PowerShell and run:
$apiUrl = "https://pulsecrm-backend.onrender.com/api"
Invoke-RestMethod -Uri "$apiUrl/health"
```

Expected response:
```json
{
  "status": "ok",
  "service": "PulseCRM API",
  "brand": "Arora Roast"
}
```

### Test Frontend
1. Open your Vercel URL in browser: `https://your-project.vercel.app`
2. Check browser console (F12) for errors
3. Try to generate a segment (should connect to API)

### Test Real-time
1. Try launching a campaign
2. Check if stats update in real-time
3. Open DevTools → Network → Filter "WS" to see WebSocket

---

## 📱 If Something Goes Wrong

| Issue | Fix |
|-------|-----|
| **Frontend shows "Cannot reach API"** | Check env vars in Vercel (VITE_API_URL) |
| **Backend won't deploy** | Check logs in Render → Environment → "All Logs" |
| **MongoDB connection failed** | Verify connection string and IP allowlist (0.0.0.0/0) |
| **WebSocket not connecting** | Ensure both URLs match in frontend env vars |
| **CORS error in console** | Verify FRONTEND_URL matches exactly in backend |

---

## 🎬 Record Walkthrough Video

**Once everything is working:**

1. **Open your deployed CRM:** `https://your-project.vercel.app`
2. **Record 5-6 minute video** showing:
   - [ ] Dashboard with customers and segments
   - [ ] Creating a segment with AI
   - [ ] Generating a campaign
   - [ ] Customizing message/channel/discount
   - [ ] Launching the campaign
   - [ ] Viewing real-time analytics
   - [ ] Explaining key features and architecture decisions

**Use:** OBS, ScreenFlow, or built-in screen recording

---

## 📤 Submission Checklist

Before submitting via the form, have ready:

- [ ] Frontend URL: `https://your-project.vercel.app`
- [ ] Backend URL: `https://pulsecrm-backend.onrender.com`
- [ ] GitHub Backend Link: `https://github.com/your-user/repo`
- [ ] GitHub Frontend Link: `https://github.com/your-user/repo`
- [ ] Walkthrough Video Link: (YouTube, Google Drive, etc.)
- [ ] Video Transcript (copy from video captions or manually)

---

## 🚀 Submit

**Form Link:** https://forms.gle/fJqAPf9YVmCYPSUX9

**Deadline:** Monday, June 15, 2026 - 12:00 PM IST

**Do NOT email - only accept form submissions!**

---

**Good luck! You've got this! 💪**
