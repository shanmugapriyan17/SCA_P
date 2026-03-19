# Smart Career Advisor - Project Summary

## 📌 Executive Summary

Smart Career Advisor is an advanced AI-powered web application designed to assist job seekers in identifying optimal career paths. The system merges Natural Language Processing (NLP), Machine Learning algorithms (SVM, Random Forest), and Large Language Models (Gemini 1.5 Flash) to parse resumes, predict roles from a massive 97-role dataset, compute skill gaps, and provide actionable educational roadmaps.

---

## 🏗 System Architecture

The project utilizes a modern **React + Node.js + Python** polyglot setup.

```text
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Vite + React)              │
│  • Home Page        • Dashboard      • Resume Analyzer           │
│  • Mentorship Hub   • Search Results • AI Chatbot Widget         │
└─────────────────────────────────────────────────────────────────┘
                              │ REST APIs
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER LAYER (Express.js)                │
│  • Authenticaton    • Profile/Resume Handling  • Chatbot Router  │
│  • SQLite DB        • Session / JWT Context    • child_process   │
└─────────────────────────────────────────────────────────────────┘
                              │ Sub-process spawning
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         ML/PYTHON LAYER                          │
│  • scikit-learn models (SVM / Random Forest Voting Classifier)   │
│  • NLP processing (nltk / natural)                               │
│  • Explainability (SHAP / LIME)                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧠 Machine Learning & Data Pipeline

### 1. Data Generation & Balancing
The training dataset consists of roughly **10,000 perfectly balanced samples** spread across **97 comprehensive career roles** covering Software, AI, DevOps, Business, Design, and QA. We utilized SMOTE (Synthetic Minority Oversampling Technique) via `balance_dataset.py` to ensure no single role dominates the predictions.

### 2. NLP Resume Processing
Resumes undergo rigorous tokenization, stop-word removal, and N-gram extraction. We match terms against a curated dictionary of 250+ technical skills to convert unstructured PDF data into a discrete array of skills. 

### 3. Model Training & Prediction
The pipeline relies on a TF-IDF Vectorizer extracting up to 5,000 features (unigrams + bigrams). These features feed into:
- **SVM Classifier** (93.15% Accuracy, 94.70% F1-Score)
- **Random Forest Classifier** (93.25% Accuracy, 92.60% F1-Score)
- **Hard Voting Ensemble** (Combines both for peak stability)

**Prediction endpoints return:** The top prediction, confidence float, alternative top-3 roles, and model runtime metadata.

### 4. Explainable AI (XAI)
To build trust, the system features a dedicated `/api/analysis/explain` route utilizing SHAP (SHapley Additive exPlanations) and LIME (Local Interpretable Model-agnostic Explanations). Users interactively see *which specific skills* pushed the model toward predicting their result.

---

## 💬 The "Cora" AI Mentorship Ecosystem

A hallmark of the Smart Career Advisor is the deep integration of **Google's Gemini 1.5 Flash** LLM into the `ChatbotWidget` and `MentorshipHub`.

1. **Intelligent Fallbacks**: If the Gemini API key is missing, Cora seamlessly defaults to a local intent-detection heuristic matching over 50+ keywords.
2. **Context-Aware Assistance**: Cora reads the active React state. If a user asks "What should I learn?", Cora automatically incorporates their predicted job role and missing skill gaps into the prompt.
3. **Google Meet Scheduling**: Users can directly request 1-on-1 mentorship sessions. The backend saves these to SQLite (`meeting_requests`) and generates mock Google Meet links on the fly.

---

## 📈 Platform Features

### The Dashboard
A centralized hub for the user containing:
- **Profile Tab**: Editable personal details, DOB, contact information, and top 5 skills.
- **Assessments Tab**: A technical/behavioral quiz area where scores are persisted to the database and tracked over time.
- **Predictions Tab**: A historical record of past ML resume analyses, complete with PDF export functionality via `jsPDF`.

### Skill Gap & Course Recommendations
When a role is predicted, the `skillGapAnalyzer.js` calculates a Job Fit Percentage by comparing the user's parsed skills against a master catalog of required skills. Missing skills trigger the `recommend_courses.py` script, which uses Cosine Similarity and K-Nearest Neighbors (KNN) to query a JSON database of 79 courses and construct a progressive learning roadmap from Beginner to Advanced.

---

## 🔌 Core APIs

**Authentication:** 
`POST /api/auth/register`, `POST /api/auth/login`, `GET /api/session`

**Profile & Data:**
`PUT /api/profile`, `POST /api/profile/resume`

**Analysis Pipeline:**
```text
POST /api/predict-role   -> Spawns Python CLI for SVM analysis
POST /api/analysis/explain -> Spawns SHAP/LIME explanation logic
POST /api/analysis/skill-gap -> Compares arrays for Job Fit %
POST /api/analysis/recommend -> K-NN Course lookup
```

**Chatbot:**
`POST /api/chatbot/chat`, `POST /api/chatbot/mentor`

---

## 🗄 Database Design

The local SQLite implementation ensures rapid, zero-config startup.

Major Tables:
- `users`: Credentials and timestamps
- `profiles`: Granular user info (skills, age, title)
- `resumes`: Binary/path mapping for user PDFs
- `predictions`: Stored ML results and confidences
- `chat_history`: Conversation logs for contextual LLM prompts
- `assessment_results`: Persisted quiz scoring

---

## 🎨 UI/UX Philosophy

The frontend is strictly Vanilla CSS inside React (no Tailwind/Bootstrap). This enforces a deep understanding of CSS Grid, Flexbox, and complex `@keyframes`.
- Glassmorphism, smooth `calc()` scaling, and responsive media queries.
- A Custom black-dot Cursor overriding the OS default.
- Reusable Modal wrappers (`AuthModal`, `ConfirmationModal`).

*Document last updated: March 2026*
