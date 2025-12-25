# Vercel Deployment Guide for Tussles ERP

## 🚀 Step-by-Step Deployment

### **STEP 1: Deploy Backend First**

1. **Go to Vercel Dashboard** (https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository (or upload `backend-nodejs` folder)
4. **Project Settings:**
   - **Root Directory**: `backend-nodejs`
   - **Framework Preset**: Other
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

5. **Environment Variables** (CRITICAL - Add these in Vercel):
   ```
   NODE_ENV=production
   SUPABASE_URL=https://xueopsqhkcjnefttiucs.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   PORT=3000
   ```
   *(Copy your actual Supabase keys from `backend-nodejs/.env`)*

6. Click **Deploy**
7. **Copy the deployed URL** (e.g., `https://tussles-backend.vercel.app`)

---

### **STEP 2: Deploy Frontend**

1. **Go to Vercel Dashboard** again
2. Click **"Add New Project"**
3. Import your GitHub repository (or upload `frontend` folder)
4. **Project Settings:**
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Environment Variables** (CRITICAL - Add these in Vercel):
   ```
   VITE_API_BASE_URL=https://YOUR-BACKEND-URL.vercel.app/api
   VITE_SUPABASE_URL=https://xueopsqhkcjnefttiucs.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   - **Replace `YOUR-BACKEND-URL`** with the URL from Step 1
   - Copy Supabase keys from `frontend/.env`

6. Click **Deploy**
7. Your app will be live at `https://your-app-name.vercel.app`

---

## ✅ What Was Changed for Vercel

### Backend (`backend-nodejs/`)
- ✅ **Created `vercel.json`**: Routes all traffic to `server.js`
- ✅ **Modified `server.js`**:
  - CORS now allows all origins (`origin: '*'`)
  - Exports `app` for Vercel serverless: `module.exports = app`
  - Server only runs locally: `if (process.env.NODE_ENV !== 'production')`

### Frontend (`frontend/`)
- ✅ **Created `vercel.json`**: Fixes 404 on page refresh (SPA routing)
- ✅ **Updated `src/config/api.js`**: Uses `import.meta.env.VITE_API_BASE_URL`
- ✅ **Created `.env.production`**: Template for production env vars

---

## 🧪 Testing After Deployment

### 1. Test Backend API:
```bash
curl https://YOUR-BACKEND-URL.vercel.app/health
```
Should return: `{"status":"ok","message":"Tussles API is running"}`

### 2. Test Frontend:
- Visit: `https://YOUR-FRONTEND-URL.vercel.app`
- Try signing up as employee
- Try logging in
- Create a test order
- Check if images upload correctly

---

## 🔧 Troubleshooting

### Backend Issues:
- **Error: "Module not found"**: Make sure `node_modules` is NOT in `.vercelignore`
- **500 Error**: Check Vercel logs → Functions → View Logs
- **CORS Error**: Make sure backend deployed first and URL is correct

### Frontend Issues:
- **404 on refresh**: Check `vercel.json` exists in frontend folder
- **API not connecting**: Check `VITE_API_BASE_URL` in Vercel env vars
- **White screen**: Check browser console (F12) for errors

### Common Fixes:
1. **Redeploy** if env vars changed (Vercel → Deployments → Redeploy)
2. **Check logs** in Vercel Dashboard → Functions → Logs
3. **Clear Vercel cache**: Vercel Dashboard → Settings → Clear Cache & Redeploy

---

## 📝 Environment Variables Checklist

### Backend (Vercel → Settings → Environment Variables):
- [ ] `NODE_ENV=production`
- [ ] `SUPABASE_URL=...`
- [ ] `SUPABASE_ANON_KEY=...`
- [ ] `PORT=3000`

### Frontend (Vercel → Settings → Environment Variables):
- [ ] `VITE_API_BASE_URL=https://your-backend.vercel.app/api`
- [ ] `VITE_SUPABASE_URL=...`
- [ ] `VITE_SUPABASE_ANON_KEY=...`

---

## 🎉 Done!

Your Tussles ERP system is now deployed to Vercel!

- **Backend API**: `https://your-backend.vercel.app`
- **Frontend App**: `https://your-frontend.vercel.app`

Both will auto-deploy when you push to GitHub (if connected).
