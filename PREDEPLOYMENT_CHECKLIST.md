# Pre-Deployment Checklist & Git Status

## 📋 Files You Should Have

### Backend (`crm-backend/`)
- [ ] `.env.example` - Template for environment variables ✓
- [ ] `.gitignore` - Should ignore `.env` and `node_modules`
- [ ] `package.json` - Dependencies listed ✓
- [ ] `server.js` - Entry point ✓
- [ ] `render.yaml` - Deployment configuration ✓
- [ ] All source files and controllers

### Frontend (`crm-frontend/`)
- [ ] `.env.example` - Template for environment variables ✓
- [ ] `.gitignore` - Should ignore `.env` and `node_modules`
- [ ] `package.json` - Build scripts configured ✓
- [ ] `vite.config.js` - Vite configuration ✓
- [ ] `src/App.jsx` - Using `VITE_API_URL` ✓
- [ ] `src/useRealtime.js` - WebSocket configured ✓

### Root
- [ ] `.gitignore` - Standard Node.js ignore
- [ ] `package.json` - If monorepo
- [ ] `README.md` - Project documentation ✓
- [ ] `DEPLOYMENT_GUIDE.md` - Full deployment instructions ✓
- [ ] `QUICK_DEPLOY.md` - Quick reference ✓

---

## 🔍 Git Status Check

Run these commands to verify everything is ready:

```powershell
# Check git status
git status

# Should output something like:
# On branch main
# Your branch is up to date with 'origin/main'.
# nothing to commit, working tree clean
```

If you see uncommitted files, run:
```powershell
# Stage all changes
git add .

# See what will be committed
git status

# Commit
git commit -m "Ready for Render + Vercel deployment

- Added DEPLOYMENT_GUIDE.md with detailed setup
- Added QUICK_DEPLOY.md with quick reference
- Added verify-deployment.ps1 script
- Updated frontend .env.example
- Verified production configuration"

# Push to GitHub
git push origin main
```

---

## 🌐 Repository Visibility

**CRITICAL:** Your GitHub repository MUST be PUBLIC

Check here:
1. Go to https://github.com/your-username/your-repo
2. Click **Settings** (gear icon)
3. Scroll down to **Danger Zone**
4. Check that **"This repository is PUBLIC"**
5. If private, click **"Change repository visibility"** → **"Make public"** → Confirm

---

## 🔐 Environment Variables Needed

### For Render Backend:
```
NODE_ENV = production
PORT = 5000
MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/pulsecrm
REDIS_URL = redis://default:pass@host:port
GEMINI_API_KEY = your_api_key_here
FRONTEND_URL = https://your-frontend.vercel.app
USE_MOCK_GEMINI = false
```

### For Vercel Frontend:
```
VITE_API_URL = https://pulsecrm-backend.onrender.com/api
VITE_WS_URL = https://pulsecrm-backend.onrender.com
```

---

## 📝 Create External Accounts (If Not Already Done)

Before deploying, you'll need:

- [ ] **MongoDB Atlas Account** - https://www.mongodb.com/cloud/atlas
  - Free tier available
  - Quick setup: 5 minutes

- [ ] **Redis Cloud Account** (Optional) - https://redis.com/try-free/
  - Or use Render's Redis add-on

- [ ] **Render Account** - https://dashboard.render.com
  - Sign up with GitHub for easy deploy

- [ ] **Vercel Account** - https://vercel.com
  - Sign up with GitHub for easy deploy

- [ ] **Gemini API Key** (Optional for mock mode) - https://makersuite.google.com/app/apikey
  - AI features work without it (falls back to mock)

---

## 🎯 Deployment Order

### Order to Deploy (Important!)

1. **Backend First** ← Do this first
   - It can work standalone
   - Frontend will fail without it
   - Takes 5-10 minutes

2. **Frontend Second** ← Do this after backend is live
   - Needs backend URL
   - Takes 3-5 minutes

3. **Link Them** ← Final step
   - Update backend FRONTEND_URL
   - Backend redeploys (2 minutes)

---

## ⏱️ Timeline Estimate

- **MongoDB Atlas Setup:** 5 minutes
- **Redis Cloud Setup:** 5 minutes (skip if using mock)
- **Render Backend Deploy:** 10 minutes
- **Vercel Frontend Deploy:** 5 minutes
- **Testing & Verification:** 10 minutes
- **Video Recording:** 15-20 minutes
- **Submission:** 5 minutes

**Total: ~55 minutes** ← You have 36 hours, so plenty of time!

---

## 🚨 Common Mistakes to Avoid

1. **Repository is Private** ← Make it PUBLIC
2. **Wrong environment variables** ← Copy-paste carefully
3. **Frontend deployed before backend** ← Backend first!
4. **Old API URLs** ← Use full `https://...` URLs, not localhost
5. **Missing `.env.example`** ← Helps reviewers understand setup
6. **Uncommitted code** ← Always push before deploying
7. **CORS not configured** ← Frontend URL must match `FRONTEND_URL` env var

---

## 📊 Deployment Checklist Summary

```
BEFORE DEPLOYMENT
☐ Repository is public
☐ All code is committed and pushed
☐ .env.example files are present
☐ DEPLOYMENT_GUIDE.md exists
☐ External accounts created (MongoDB, Render, Vercel)

BACKEND (RENDER)
☐ MongoDB Atlas cluster created and URL ready
☐ Redis instance created (if using) and URL ready
☐ Backend pushed to GitHub
☐ Render account created and GitHub connected
☐ Backend deployed on Render
☐ Environment variables set on Render
☐ Backend health check working

FRONTEND (VERCEL)
☐ Frontend pushed to GitHub
☐ Vercel account created and GitHub connected
☐ Frontend deployed on Vercel
☐ Environment variables set on Vercel
☐ Frontend loads and connects to backend
☐ WebSocket connection established

FINAL
☐ Backend FRONTEND_URL updated with Vercel domain
☐ Backend redeployed
☐ Full end-to-end test completed
☐ Video recorded (5-6 minutes)
☐ All submission links ready
☐ Submitted via form BEFORE 12 PM deadline
```

---

## 📞 Quick Help

| Need | Action |
|------|--------|
| **Render Logs** | Dashboard → Service → "All Logs" tab |
| **Vercel Logs** | Dashboard → Project → "Deployments" tab → Click deployment |
| **MongoDB Status** | Atlas Console → Cluster → Check connection |
| **Environment Vars** | Render: Service → "Environment", Vercel: Project → "Settings" → "Environment Variables" |
| **Rebuild/Redeploy** | Render: Manual Deploy button, Vercel: Push to GitHub or "Redeploy" button |

---

Good to go! You're all set for deployment. 🚀
