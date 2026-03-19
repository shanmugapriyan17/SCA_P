# 🎯 Smart Career Advisor

<div align="center">

![Smart Career Advisor](https://img.shields.io/badge/Smart-Career_Advisor-00A67E?style=for-the-badge&logo=target&logoColor=white)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Python](https://img.shields.io/badge/Python-ML-FFE873?style=for-the-badge&logo=python)

**An AI-powered career counseling platform that analyzes resumes, predicts job roles using Support Vector Machines, identifies skill gaps, and provides an interactive LLM Mentor.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Machine Learning](#-machine-learning-models) • [Deployment](DEPLOYMENT.md)

</div>

---

## 📋 Overview

Smart Career Advisor bridges the gap between raw resumes and actionable career trajectories. By combining a Node.js/React stack with sophisticated Python machine learning models and Google's Gemini LLM, the platform automatically parses PDF resumes, predicts the best-fit career from a pool of **97 comprehensive roles**, and maps out a localized learning journey to bridge missing skills.

---

## ✨ Features

- **📄 Resume Analyzer:** Upload PDFs for NLP tokenization and automatic skill extraction.
- **🤖 Support Vector Machine Predictions:** Career prediction matching against a 10,000-sample balanced dataset covering 97 tech, business, and design roles.
- **📊 Interactive User Dashboard:** Persist quiz scores, update profiles, download historical prediction PDFs, and track skill growth.
- **💬 Cora, the AI Mentor:** A sticky, context-aware chatbot powered by Gemini 1.5 Flash. Cora knows your current skill gaps and handles complex career queries.
- **🎓 Mentorship Hub:** Book 1-on-1 virtual mentoring sessions with auto-generated Google Meet links.
- **🔍 Explainable AI:** View exactly *why* the ML model picked your career using integrated SHAP and LIME algorithms.

---

## 🛠 Tech Stack

### Frontend (Client Layer)
- **React 18 & Vite**
- **Vanilla CSS:** Fully bespoke, highly animated responsive stylesheets.
- **React Router DOM 6**

### Backend (Server Layer)
- **Node.js & Express 5**
- **SQLite3:** Zero-config relational database for users, predictions, and chat histories.
- **Multer & pdf-parse:** For handling multipart form data and extracting raw text from PDFs.
- **Contextual NLP:** Keyword matching, sanitization.

### Machine Learning (Algorithm Layer)
- **scikit-learn:** Driving the Random Forest & SVM Hard Voting Ensemble.
- **TF-IDF Vectorizer:** Word embedding and frequency analysis.
- **Python 3.8+:** Spawning local child processes from Node.js to compute rapid inference using serialized `.joblib` models.
- **Google Generative AI:** Gemini SDK integration.

---

## 🚀 Installation & Setup

You need **Node.js (18+)** and **Python (3.8+)** installed.

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/Smart_Career_Advisor.git
cd Smart_Career_Advisor
```

### 2. Setup the Python ML Backend
```bash
cd backend-node
pip install -r requirements.txt
```
*(Optional) If you want to train the model from scratch:*
```bash
python scripts/train_and_evaluate.py
```

### 3. Setup the Node Server
```bash
npm install
```
Create a `.env` file in the `backend-node` folder:
```env
PORT=10000
NODE_ENV=development
SESSION_SECRET=super_secret_cookie_string
GEMINI_API_KEY=your_google_ai_key
```
Start the backend server:
```bash
npm run dev
```

### 4. Setup the React Frontend
Open a new terminal and navigate to the UI:
```bash
cd frontend-react
npm install
npm run dev
```

The application will be running at **http://localhost:5173**.

---

## 📚 Further Reading

Looking to dive deeper into how the XAI logic, TF-IDF vectorization, or the 97-role dataset was constructed? 

Check out the detailed **[Project Summary](PROJECT_SUMMARY.md)**.
Looking to host this online? Follow the **[Deployment Guide](DEPLOYMENT.md)**.

---

## 📝 License & Author

This project is licensed under the ISC License.

**Author:** Rathi Devi  
**Contact:** rathideviruku@gmail.com
