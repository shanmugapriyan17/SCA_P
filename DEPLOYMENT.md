# 🚀 Deployment Guide

## Smart Career Advisor - Deployment Instructions

This guide covers deploying:
- **Frontend (React)** → Vercel
- **Backend (Node.js)** → Render

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] GitHub repository with your code pushed
- [ ] Vercel account (https://vercel.com)
- [ ] Render account (https://render.com)
- [ ] All environment variables ready

---

## 🔵 Backend Deployment (Render)

### Step 1: Prepare Backend for Production

1. **Ensure `package.json` has correct start script:**
   ```json
   {
     "scripts": {
       "start": "node src/app.js",
       "dev": "nodemon src/app.js"
     }
   }
   ```

2. **Create/Update `.env` file in `backend-node/`:**
   ```env
   PORT=10000
   NODE_ENV=production
   SECRET_KEY=your-strong-secret-key-here
   FRONTEND_URL=https://your-app.vercel.app
   ```

### Step 2: Deploy to Render

1. **Go to [Render Dashboard](https://dashboard.render.com/)**

2. **Click "New +" → "Web Service"**

3. **Connect your GitHub repository**

4. **Configure the service:**

   | Setting | Value |
   |---------|-------|
   | **Name** | `smart-career-advisor-api` |
   | **Region** | Choose nearest to your users |
   | **Branch** | `main` |
   | **Root Directory** | `backend-node` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free (or paid for better performance) |

5. **Add Environment Variables:**
   
   Click "Environment" and add:
   
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `SECRET_KEY` | `your-secret-key-here` |
   | `FRONTEND_URL` | `https://your-app.vercel.app` |

6. **Click "Create Web Service"**

7. **Wait for deployment** (5-10 minutes on free tier)

8. **Copy your Render URL** (e.g., `https://smart-career-advisor-api.onrender.com`)

### Step 3: Verify Backend Deployment

Test your API:
```bash
curl https://your-render-url.onrender.com/api/health
```

Expected response:
```json
{"status": "ok", "message": "Smart Career Advisor API is running"}
```

---

## 🟣 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Production

1. **Update API URL in `frontend-react/src/api/client.js`:**
   ```javascript
   import axios from 'axios';

   const api = axios.create({
       baseURL: import.meta.env.VITE_API_URL || 'https://smart-career-advisor-api.onrender.com',
       withCredentials: true,
       headers: {
           'Content-Type': 'application/json',
       }
   });

   export default api;
   ```

2. **Create `frontend-react/.env.production`:**
   ```env
   VITE_API_URL=https://smart-career-advisor-api.onrender.com
   ```

3. **Create `frontend-react/vercel.json`:**
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/" }
     ],
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           { "key": "X-Content-Type-Options", "value": "nosniff" },
           { "key": "X-Frame-Options", "value": "DENY" },
           { "key": "X-XSS-Protection", "value": "1; mode=block" }
         ]
       }
     ]
   }
   ```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to frontend directory:**
   ```bash
   cd frontend-react
   ```

3. **Login to Vercel:**
   ```bash
   vercel login
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```

5. **Follow prompts:**
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N`
   - Project name? `smart-career-advisor`
   - Directory? `./`
   - Override settings? `N`

#### Option B: Deploy via Vercel Dashboard

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Click "Add New" → "Project"**

3. **Import your GitHub repository**

4. **Configure the project:**

   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | `Vite` |
   | **Root Directory** | `frontend-react` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |
   | **Install Command** | `npm install` |

5. **Add Environment Variables:**

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://your-render-url.onrender.com` |

6. **Click "Deploy"**

7. **Wait for deployment** (2-3 minutes)

8. **Copy your Vercel URL** (e.g., `https://smart-career-advisor.vercel.app`)

### Step 3: Update Backend CORS

Go back to Render and add your Vercel URL to the environment:

| Key | Value |
|-----|-------|
| `FRONTEND_URL` | `https://smart-career-advisor.vercel.app` |

---

## 🔄 Post-Deployment Configuration

### Update CORS in Backend

Ensure `backend-node/src/app.js` includes your production URLs:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://smart-career-advisor.vercel.app',  // Your Vercel URL
  process.env.FRONTEND_URL
].filter(Boolean);
```

### Verify End-to-End

1. **Visit your Vercel URL**
2. **Test the following:**
   - [ ] Homepage loads correctly
   - [ ] User registration works
   - [ ] User login works
   - [ ] Resume upload works
   - [ ] Career prediction works
   - [ ] Chatbot works
   - [ ] PDF export works

---

## 🔧 Troubleshooting

### Common Issues

#### 1. CORS Errors
**Symptom:** "Access-Control-Allow-Origin" errors in console

**Solution:** 
- Add your Vercel URL to `allowedOrigins` in `app.js`
- Redeploy backend on Render

#### 2. API Connection Failed
**Symptom:** "Network Error" or "Failed to fetch"

**Solution:**
- Check if `VITE_API_URL` is correctly set
- Verify backend is running on Render
- Check Render logs for errors

#### 3. Build Fails on Vercel
**Symptom:** Deployment fails during build

**Solution:**
```bash
# Test build locally first
cd frontend-react
npm run build
```

#### 4. Render Free Tier Sleep
**Symptom:** First request is very slow (30+ seconds)

**Solution:**
- This is normal for Render free tier
- Service "sleeps" after 15 min of inactivity
- Upgrade to paid tier for always-on service
- Or use a cron job to ping the server

---

## 📊 Production Environment Variables

### Backend (Render)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `10000` |
| `SECRET_KEY` | Session secret | `your-32-char-secret` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-app.vercel.app` |

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-api.onrender.com` |

---

## 🔐 Security Checklist

Before going live:

- [ ] Use strong `SECRET_KEY` (32+ characters)
- [ ] Enable HTTPS only (both platforms do this by default)
- [ ] Set proper CORS origins (not `*`)
- [ ] Remove any test/debug endpoints
- [ ] Secure database with proper authentication
- [ ] Review rate limiting settings

---

## 📈 Deployment URLs Summary

After deployment, you'll have:

| Service | URL |
|---------|-----|
| **Frontend** | `https://smart-career-advisor.vercel.app` |
| **Backend API** | `https://smart-career-advisor-api.onrender.com` |
| **API Health** | `https://smart-career-advisor-api.onrender.com/api/health` |

---

## 🔄 Continuous Deployment

Both Vercel and Render support automatic deployments:

- **Push to `main` branch** → Automatic deployment
- **Pull requests** → Preview deployments (Vercel)

---

## 📞 Support

If you encounter issues:

1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments → View Logs
3. Test locally first to isolate issues
4. Check browser console for frontend errors

---

**Happy Deploying! 🚀**
