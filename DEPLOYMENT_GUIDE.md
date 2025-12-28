# 🚀 Production Deployment Guide
## Tussles Client Tracker System

---

## Pre-Deployment Checklist

### ✅ Security Review
- [x] All environment variables configured
- [x] CORS properly restricted
- [x] Security headers enabled
- [x] Input validation implemented
- [x] File upload security enabled
- [x] No hardcoded secrets

### ✅ Code Quality
- [x] No syntax errors
- [x] All dependencies updated
- [x] Error handling complete
- [x] Logout functionality working

---

## Environment Setup

### 1. Backend Environment Variables

Create `.env` file in `backend-nodejs/` directory:

```bash
# Supabase Configuration
SUPABASE_URL=https://xueopsqhkcjnefttiucs.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1ZW9wc3Foa2NqbmVmdHRpdWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NzY3OTYsImV4cCI6MjA4MjI1Mjc5Nn0.kIfKeGsKV22ZKfMQ3n3YUfy0XTgTIgWwgIbbih-VUnk

# Server Configuration
PORT=3000
NODE_ENV=production

# Frontend URL (Update with your Vercel domain)
FRONTEND_URL=https://your-frontend-app.vercel.app
```

### 2. Frontend Environment Variables

Create `.env` file in `frontend/` directory:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://xueopsqhkcjnefttiucs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1ZW9wc3Foa2NqbmVmdHRpdWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NzY3OTYsImV4cCI6MjA4MjI1Mjc5Nn0.kIfKeGsKV22ZKfMQ3n3YUfy0XTgTIgWwgIbbih-VUnk

# API Configuration (Update with your backend Vercel domain)
VITE_API_BASE_URL=https://your-backend-app.vercel.app/api
```

---

## Vercel Deployment

### Backend Deployment

1. **Push to GitHub** (if not already done):
```bash
cd "c:\Users\hp\Desktop\client tracker"
git init
git add .
git commit -m "Production-ready build with security fixes"
git branch -M main
git remote add origin your-github-repo-url
git push -u origin main
```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Choose `backend-nodejs` as root directory
   - Add environment variables from step 1 above
   - Click "Deploy"

3. **Note the deployed URL**: `https://your-backend-app.vercel.app`

### Frontend Deployment

1. **Update API URL** in frontend `.env`:
```bash
VITE_API_BASE_URL=https://your-backend-app.vercel.app/api
```

2. **Deploy to Vercel**:
   - Import same repository again
   - Choose `frontend` as root directory
   - Add environment variables
   - Update `VITE_API_BASE_URL` with backend URL
   - Click "Deploy"

3. **Note the deployed URL**: `https://your-frontend-app.vercel.app`

### Update CORS

After both deployments:

1. Update `backend-nodejs/server.js` with your frontend URL:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://your-frontend-app.vercel.app', // Add your actual Vercel domain
  process.env.FRONTEND_URL
].filter(Boolean);
```

2. Update backend environment variable `FRONTEND_URL` in Vercel dashboard
3. Redeploy backend

---

## Local Development

### Start Backend:
```powershell
cd "c:\Users\hp\Desktop\client tracker\backend-nodejs"
node server.js
```

Backend runs on: `http://localhost:3000`

### Start Frontend:
```powershell
cd "c:\Users\hp\Desktop\client tracker\frontend"
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## Testing After Deployment

### Test Checklist:

1. **Authentication**:
   - [ ] Employee signup works
   - [ ] Owner login works
   - [ ] Employee login works
   - [ ] Logout works for both roles

2. **Employee Dashboard**:
   - [ ] Can create new order
   - [ ] Can upload tussle image
   - [ ] Can view own orders
   - [ ] Logout button visible

3. **Owner Dashboard**:
   - [ ] Can view pending approvals
   - [ ] Can approve orders
   - [ ] Can view completed orders tab
   - [ ] Completed orders show full history
   - [ ] Logout button visible

4. **Security**:
   - [ ] Cannot access protected routes without login
   - [ ] Employee cannot access owner-only features
   - [ ] File upload only accepts images
   - [ ] Invalid inputs are rejected

---

## Database Setup (Supabase)

If not already done, run this in Supabase SQL Editor:

```sql
-- Run the SIMPLE_FIX_DISABLE_RLS.sql file
-- Located at: database/SIMPLE_FIX_DISABLE_RLS.sql
```

This will:
- Disable RLS on users table
- Create user signup trigger
- Set up proper role handling

---

## Monitoring

### Check Logs:
- **Vercel Dashboard** → Your Project → "Logs" tab
- Monitor for any errors or issues

### Health Check Endpoints:
- Backend: `https://your-backend-app.vercel.app/health`
- API: `https://your-backend-app.vercel.app/api/health`

---

## Common Issues & Solutions

### Issue: CORS errors in production
**Solution**: Update `allowedOrigins` in `backend-nodejs/server.js` with your actual Vercel domains

### Issue: 500 Internal Server Error
**Solution**: Check environment variables are set correctly in Vercel dashboard

### Issue: "User profile not found" error
**Solution**: Run the `SIMPLE_FIX_DISABLE_RLS.sql` in Supabase SQL Editor

### Issue: File upload fails
**Solution**: Check Supabase Storage bucket `tussle-images` exists and has proper policies

---

## Support & Maintenance

### Regular Tasks:
- Monitor error logs weekly
- Update dependencies monthly
- Rotate API keys every 90 days
- Review security audit quarterly

### Backup Strategy:
- Supabase provides automatic backups
- Export critical data weekly
- Keep local copy of environment variables

---

## Success Metrics

Your deployment is successful when:
- ✅ All tests pass
- ✅ No console errors
- ✅ Authentication flows work
- ✅ Order creation and approval work
- ✅ File uploads work
- ✅ Both dashboards load correctly
- ✅ Logout works for both roles

---

## 🎉 You're Live!

Congratulations! Your Tussles Client Tracker is now deployed and ready for production use.

**Important URLs to Save:**
- Frontend: `https://your-frontend-app.vercel.app`
- Backend: `https://your-backend-app.vercel.app`
- Supabase Dashboard: `https://app.supabase.com`

**Last Updated:** December 28, 2025
