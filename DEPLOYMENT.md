# 🚀 Deployment Guide

## Smart Career Advisor - Deployment Instructions

This guide covers deploying the full-stack Smart Career Advisor platform:
- **Frontend (React)** → Vercel
- **Backend (Node.js)** → Render
- **Python ML Services** → Hosted alongside the Node.js backend

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] GitHub repository with your code pushed
- [ ] Vercel account (https://vercel.com)
- [ ] Render account (https://render.com)
- [ ] Google Gemini API Key
- [ ] Trained `.joblib` model files inside `backend-node/models/`

---

## 🔵 Backend Deployment (Render)

Because the backend relies on Python scripts to run the ML predictions (`predict_service.py`), the Node.js environment requires a mixed-runtime deployment. Render natively supports this using a custom build command or `render.yaml`.

### Step 1: Prepare Backend for Production

1. Ensure `package.json` has the correct start script:
   ```json
   {
     "scripts": {
       "start": "node src/app.js",
       "dev": "nodemon src/app.js"
     }
   }
   ```

2. Confirm your `requirements.txt` is updated in `backend-node/`.

### Step 2: Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. **Configure the service:**

   | Setting | Value |
   |---------|-------|
   | **Name** | `smart-career-advisor-api` |
   | **Region** | Choose nearest to your users |
   | **Branch** | `main` |
   | **Root Directory** | `backend-node` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install && pip install -r requirements.txt` |
   | **Start Command** | `npm start` |

   *Note: If Render's native Node environment rejects `pip`, you will need to switch the Runtime to `Docker` and provide a simple Dockerfile that installed both Node and Python.*

5. **Add Environment Variables:**
   
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `SESSION_SECRET` | `your-secure-secret-key-here` |
   | `FRONTEND_URL` | `https://your-app.vercel.app` |
   | `GEMINI_API_KEY` | `your-gemini-key` |

6. Click "Create Web Service" and wait for the deployment to finish.

### Step 3: Verify Backend Deployment

Test your API:
```bash
curl https://your-render-url.onrender.com/api/health/db
```

Expected response should confirm database tables and Python script accessibility.

---

## 🟣 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Production

1. Update API URL in `frontend-react/src/api/client.js` or via environment variables:
   Create `frontend-react/.env.production`:
   ```env
   VITE_API_URL=https://smart-career-advisor-api.onrender.com
   ```

2. Create `frontend-react/vercel.json` for routing:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/" }
     ]
   }
   ```

### Step 2: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
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

6. Click "Deploy". Make note of your resulting Vercel URL (e.g., `https://smart-career-advisor.vercel.app`).

---

## 🔄 Post-Deployment Configuration

### Update CORS in Backend

Ensure your deployed backend knows to accept requests from your new Vercel frontend. Your Node.js backend must have the Vercel URL whitelisted:

Go back to the Render dashboard and update the `FRONTEND_URL` environment variable to match the exact Vercel domain generated in the previous step.

### Verify End-to-End

1. **Visit your Vercel URL**
2. **Test the following:**
   - User registration & login
   - Model Prediction (Resume Analyzer page — upload a PDF)
   - Chatbot (Ask Cora a question)
   - Skill Gap Analysis
   - Dashboard Analytics rendering

---

## 🔧 Troubleshooting

#### 1. CORS Errors
**Symptom:** "Access-Control-Allow-Origin" errors in console.
**Solution:** Verify the `FRONTEND_URL` environment variable is set accurately on Render, without a trailing slash.

#### 2. ML Prediction Fails in Production
**Symptom:** AI resume parsing works, but ML role prediction returns an error.
**Solution:** The python scripts are failing to execute. Ensure `pip install -r requirements.txt` ran successfully during the Render build phase. Verify that the `.joblib` model binaries were actually pushed to your Git repository (they might be in `.gitignore`).

#### 3. Render Free Tier Sleep
**Symptom:** First request is very slow (30+ seconds).
**Solution:** This is normal for Render's free tier. The service "sleeps" after 15 minutes of inactivity. Upgrade to a paid tier for an always-on service.
