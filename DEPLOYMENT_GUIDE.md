# PulseCRM Deployment Guide: Render + Vercel

**Deadline: Monday, June 15, 2026 - 12:00 PM IST**

This guide walks you through deploying the complete PulseCRM stack to production using Render (backend) and Vercel (frontend).

---

## 📋 Pre-Deployment Checklist

- [ ] GitHub repositories are public and up-to-date
- [ ] `.env.example` files document all required env variables
- [ ] Frontend API URL is configured for production
- [ ] Backend CORS is configured for frontend domain
- [ ] MongoDB Atlas account set up (or using Render's database)
- [ ] Redis instance provisioned
- [ ] Gemini API key ready
- [ ] Both services have necessary env vars configured

---

## 🚀 Deployment Architecture

```
Frontend (Vercel)  ──HTTP/WebSocket──>  Backend (Render)  ──>  MongoDB Atlas
                                           ↓
                                        Redis Queue
```

---

## Part 1: Backend Deployment on Render

### Step 1: Prepare Backend for Production

#### 1.1 Update Backend Server Configuration

The backend needs to support production deployment. Update [crm-backend/server.js](crm-backend/server.js):

**Key requirements:**
- Use `process.env.PORT` instead of hardcoded port
- Enable CORS for frontend domain
- Support WebSocket connections from frontend
- Health check endpoint for Render
- Graceful shutdown

#### 1.2 Create `.env` Template

Create `.env.example` in [crm-backend](crm-backend) with required variables:

```bash
# MongoDB
MONGODB_URI=your_mongodb_atlas_uri_here

# Redis
REDIS_URL=your_redis_url_here

# API Keys
GEMINI_API_KEY=your_gemini_api_key_here

# Frontend URL (for CORS)
FRONTEND_URL=https://your-app.vercel.app

# Environment
NODE_ENV=production

# Server
PORT=5000
```

### Step 2: Create Render Deployment Files

#### 2.1 Add `render.yaml` to Backend

Create a production blueprint in [crm-backend/render.yaml](crm-backend/render.yaml). This is already there, but verify it includes:

```yaml
services:
  - type: web
    name: pulsecrm-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

#### 2.2 Database Setup

**Option A: MongoDB Atlas (Recommended)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Allow IP access (allow all for development: 0.0.0.0/0)
5. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/pulsecrm`
6. Copy this to `MONGODB_URI` in Render env vars

**Option B: Using Render's PostgreSQL/MySQL**
- Less ideal for this app (uses Mongoose), but possible

### Step 3: Redis Setup

Render offers Redis as an add-on:

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Create a new Redis instance
3. Copy the Redis connection URL
4. Add to backend env vars as `REDIS_URL`

Alternatively, use a free Redis service like [Redis Cloud](https://redis.com/try-free/)

### Step 4: Deploy Backend on Render

1. **Push code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to [Render Dashboard](https://dashboard.render.com)**

3. **Create a new Web Service:**
   - Connect your GitHub repository
   - Select `crm-backend` folder (or repository root if it's separate)
   - Name: `pulsecrm-backend`
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free (or Paid if you need more resources)

4. **Add Environment Variables** (under Service Settings):
   ```
   NODE_ENV = production
   MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/pulsecrm
   REDIS_URL = redis://default:password@redis-host:6379
   GEMINI_API_KEY = your_key_here
   FRONTEND_URL = https://your-vercel-domain.vercel.app
   ```

5. **Deploy:** Click "Deploy" and wait for completion

6. **Note your backend URL:** `https://pulsecrm-backend.onrender.com`

---

## Part 2: Frontend Deployment on Vercel

### Step 1: Prepare Frontend for Production

#### 1.1 Update Frontend Configuration

Edit [crm-frontend/vite.config.js](crm-frontend/vite.config.js) to ensure it's Vercel-compatible:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

#### 1.2 Update API Configuration

Create/update [crm-frontend/src/config.js](crm-frontend/src/config.js):

```javascript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';
```

#### 1.3 Update All API Calls

In your React components (like [crm-frontend/src/App.jsx](crm-frontend/src/App.jsx)), use:

```javascript
import { API_URL } from './config'

// Instead of: axios.post('/api/campaigns/launch', ...)
// Use:
axios.post(`${API_URL}/api/campaigns/launch`, ...)
```

#### 1.4 Create `.env.example`

```bash
VITE_API_URL=https://pulsecrm-backend.onrender.com
VITE_WS_URL=https://pulsecrm-backend.onrender.com
```

### Step 2: Deploy Frontend on Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Import Project:**
   - Click "Add New" → "Project"
   - Select your GitHub repository
   - Choose `crm-frontend` as the root directory (if in monorepo)

3. **Configure Project:**
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add:
     ```
     VITE_API_URL = https://pulsecrm-backend.onrender.com
     VITE_WS_URL = https://pulsecrm-backend.onrender.com
     ```

5. **Deploy:** Click "Deploy"

6. **Note your frontend URL:** `https://your-project.vercel.app`

---

## Step 3: Update Backend CORS & Frontend URL

After getting your Vercel URL:

1. Go back to Render Dashboard
2. Open `pulsecrm-backend` service
3. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL = https://your-project.vercel.app
   ```

4. Redeploy backend (it will auto-redeploy)

---

## 🔧 Post-Deployment Configuration

### 1. Database Seeding

Once backend is deployed, seed the database:

```bash
# Option A: Via Render Shell
# Open the backend service in Render Dashboard → "Shell" tab
npm run seed

# Option B: Trigger via API
curl -X POST https://pulsecrm-backend.onrender.com/api/seed
```

### 2. Test Connectivity

Check if frontend can reach backend:

1. Open browser console on your Vercel app
2. Run:
   ```javascript
   fetch('https://pulsecrm-backend.onrender.com/api/health')
     .then(r => r.json())
     .then(console.log)
   ```

3. Should see successful response

### 3. Test Real-time Features

1. Open the CRM dashboard
2. Create a campaign and launch it
3. Check if real-time updates appear in analytics
4. Verify WebSocket connection in browser DevTools (Network → WS tab)

---

## 📝 Environment Variables Summary

### Backend (Render)
| Variable | Source | Example |
|----------|--------|---------|
| `NODE_ENV` | Static | `production` |
| `PORT` | Auto | `5000` |
| `MONGODB_URI` | MongoDB Atlas | `mongodb+srv://...` |
| `REDIS_URL` | Redis Cloud | `redis://...` |
| `GEMINI_API_KEY` | Google Cloud | `AIzaSy...` |
| `FRONTEND_URL` | Your Vercel domain | `https://app.vercel.app` |

### Frontend (Vercel)
| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://pulsecrm-backend.onrender.com` |
| `VITE_WS_URL` | `https://pulsecrm-backend.onrender.com` |

---

## 🐛 Troubleshooting

### "Cannot GET /api/..."
- **Cause:** Backend not running or CORS misconfigured
- **Fix:** Check Render service logs, ensure backend is deployed

### "WebSocket connection failed"
- **Cause:** WebSocket not supported or URL incorrect
- **Fix:** Ensure both frontend and backend URLs match

### "MongoDB connection refused"
- **Cause:** MongoDB URI invalid or network not allowed
- **Fix:** Check MongoDB Atlas IP allowlist, update connection string

### "CORS error"
- **Cause:** Frontend domain not in backend CORS config
- **Fix:** Update `FRONTEND_URL` env var and redeploy backend

### "Build fails on Vercel"
- **Cause:** Dependencies missing or build script error
- **Fix:** Check build logs in Vercel dashboard

---

## 📤 Submission Links Required

After deployment completes, collect these for submission:

1. **Frontend URL:** `https://your-project.vercel.app`
2. **Backend Health Check:** `https://pulsecrm-backend.onrender.com/api/health`
3. **GitHub Frontend:** `https://github.com/your-user/frontend`
4. **GitHub Backend:** `https://github.com/your-user/backend`

---

## ✅ Final Verification Checklist

- [ ] Frontend loads without errors
- [ ] Can fetch segments from API
- [ ] AI message generation works
- [ ] Can create and launch campaigns
- [ ] Real-time updates appear
- [ ] Analytics data persists in MongoDB
- [ ] All links are publicly accessible

---

## 🎬 Quick Deployment Summary

```bash
# 1. Push code
git push origin main

# 2. Create backend on Render
#    - Connect GitHub repo
#    - Add env vars
#    - Deploy

# 3. Create frontend on Vercel
#    - Import GitHub repo
#    - Add env vars
#    - Deploy

# 4. Get URLs and verify

# 5. Record 5-6 min walkthrough video

# 6. Submit via form before 12 PM deadline
```

---

**Good luck! 🚀**
