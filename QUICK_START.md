# ⚡ QUICK START: 3-HOUR DEPLOYMENT & SUBMISSION

**Your Goal**: Get from "local project" to "deployed + submitted" in 3 hours  
**Deadline**: June 15, 2026 - 12 PM  
**Status**: Ready NOW ✅

---

## 🎯 MISSION

- [ ] Deploy backend to Render (10 min)
- [ ] Deploy frontend to Vercel (10 min)
- [ ] Deploy channel simulator to Render (10 min)
- [ ] Test everything (15 min)
- [ ] Record 5-6 min video (30 min)
- [ ] Submit form (5 min)

**Total: 80 minutes** ✅

---

## 1️⃣ GIT PUSH (10 MINUTES)

### Create .gitignore
```bash
cat > .gitignore << 'EOF'
node_modules/
.env
.env.local
dist/
EOF
```

### Push to GitHub
```bash
git init
git add .
git commit -m "AI-native Mini CRM"
git branch -M main
git remote add origin https://github.com/sumancoder-cloud/PulseCRM.git
git push -u origin main
```

✅ **Verify**: Visit https://github.com/sumancoder-cloud/PulseCRM → See files

---

## 2️⃣ DEPLOY BACKEND TO RENDER (10 MINUTES)

1. Go to https://render.com → Sign up with GitHub
2. **+ New** → **Web Service** → Select your GitHub repo
3. Configure:
   - **Name**: `minicrm-backend`
   - **Build**: `npm install`
   - **Start**: `npm start`
   - **Root**: `crm-backend`

4. **Environment Variables**:
   ```
   MONGODB_URI=mongodb+srv://USER:PASS@cluster0.mongodb.net/minicrm
   GEMINI_API_KEY=your_key_here
   CRM_WEBHOOK_URL=https://minicrm-backend.onrender.com/api/webhooks/channel
   FRONTEND_URL=https://minicrm-frontend.vercel.app
   ```

5. Click **Deploy** → Wait 5 min

✅ **Verify**: Open `https://minicrm-backend.onrender.com/health`

---

## 3️⃣ DEPLOY FRONTEND TO VERCEL (10 MINUTES)

1. Go to https://vercel.com → Sign up with GitHub
2. **Add Project** → Select GitHub repo
3. Configure:
   - **Project Name**: `minicrm-frontend`
   - **Framework**: Vite
   - **Root**: `crm-frontend`
   - **Build Command**: `npm run build`

4. **Environment Variables**:
   ```
   VITE_API_URL=https://minicrm-backend.onrender.com
   ```

5. Click **Deploy** → Wait 3 min

✅ **Verify**: Open `https://minicrm-frontend.vercel.app`

---

## 4️⃣ DEPLOY CHANNEL SIMULATOR TO RENDER (10 MINUTES)

1. Go to Render → **+ New** → **Web Service**
2. Select GitHub repo
3. Configure:
   - **Name**: `minicrm-channel`
   - **Build**: `npm install`
   - **Start**: `npm start`
   - **Root**: `channel-simulator`

4. **Environment Variables**:
   ```
   CRM_WEBHOOK_URL=https://minicrm-backend.onrender.com/api/webhooks/channel
   ```

5. Click **Deploy** → Wait 3 min

✅ **Verify**: Backend receives webhook callbacks

---

## 5️⃣ TEST EVERYTHING (15 MINUTES)

Open: https://minicrm-frontend.vercel.app

**Test 1: Campaign Flow**
- [ ] Enter goal: "Win back at-risk shoppers"
- [ ] Click Diagnose → Audience size shows
- [ ] Click Generate → Message + channel appear
- [ ] Move discount slider → Preview updates
- [ ] Click Launch → Campaign queued
- [ ] Wait 10 sec → Dashboard shows metrics

**Test 2: Multiple Channels**
- [ ] Generate message
- [ ] Change channel (SMS/Email/RCS)
- [ ] See color change in preview
- [ ] Launch

**Test 3: Customer Selection**
- [ ] Click "Show Segment"
- [ ] Select specific customers
- [ ] Launch to selected only

✅ **All passing?** → Ready for video!

---

## 6️⃣ RECORD VIDEO (30 MINUTES)

### Tools
- Screen recorder: **Loom.com** (easiest, free, no watermark)
- Microphone: Built-in is fine

### Script (5-6 minutes)
See DEPLOYMENT_GUIDE.md for full script. TL;DR:

1. **(0:00-0:30)**: "This is Mini CRM, an AI-native platform..."
2. **(0:30-2:00)**: DEMO - Enter goal, diagnose, generate, customize, launch, monitor
3. **(2:00-3:00)**: ARCHITECTURE - Backend → Channel Sim → DB
4. **(3:00-4:00)**: CODE - Show models, services, webhook
5. **(4:00-5:00)**: AI WORKFLOW - How you built it with AI
6. **(5:00-5:30)**: CLOSING - Why it matters

### Recording Tips
- Speak clearly
- Record demo on your deployed app (not localhost)
- Use provided script
- 5-6 minutes exactly

### Upload
1. Export MP4
2. Go to **YouTube.com** → Upload
3. **Visibility**: Unlisted
4. Copy link: `https://www.youtube.com/watch?v=...`

---

## 7️⃣ SUBMIT FORM (5 MINUTES)

Open: https://forms.gle/fJqAPf9YVmCYPSUX9

**Fill these fields:**

| Field | Value |
|-------|-------|
| Email | Your email |
| Frontend URL | https://minicrm-frontend.vercel.app |
| Video Link | Your YouTube unlisted link |
| Video Transcript | Paste the script from DEPLOYMENT_GUIDE.md |
| Backend GitHub | https://github.com/sumancoder-cloud/PulseCRM |
| Frontend GitHub | https://github.com/sumancoder-cloud/PulseCRM |
| Notes | "Built with AI as co-pilot using Claude for architecture & code generation" |

**Click Submit** ✅

---

## ⏰ TIMELINE

**Now**: Deploy (30 min)  
**Next hour**: Test + record (45 min)  
**Same day**: Submit (5 min)  

**Done!** 🎉

---

## 🆘 QUICK FIXES

| Problem | Fix |
|---------|-----|
| Render shows error | Check .env vars are correct; ensure MongoDB Atlas IP whitelist is 0.0.0.0/0 |
| Vercel 404 on campaign | Check VITE_API_URL in Vercel settings matches your Render URL |
| Campaign hangs | Check browser console (F12); verify all 3 services deployed |
| Video upload fails | Try different browser; ensure <2GB file |

---

## ✅ VERIFICATION BEFORE SUBMIT

```bash
# Check all URLs are live:
curl https://minicrm-backend.onrender.com/health
curl https://minicrm-frontend.vercel.app
curl https://minicrm-channel.onrender.com/health

# Check GitHub is public:
open https://github.com/sumancoder-cloud/PulseCRM

# Check video link works (don't open—just confirm link format):
# https://www.youtube.com/watch?v=XXXXX
```

---

## 🎯 YOU'VE GOT THIS

- ✅ Project is 100% done
- ✅ Just needs to be deployed
- ✅ Scripts & guides provided
- ✅ 3 hours total work
- ✅ Then submit

**Go ship it!** 🚀

---

**Questions?** Check FINAL_SUMMARY.md or DEPLOYMENT_GUIDE.md

**Deadline**: June 15, 2026 - 12 PM  
**Form**: https://forms.gle/fJqAPf9YVmCYPSUX9
