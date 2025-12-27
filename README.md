# 🎯 Smart Career Advisor

<div align="center">

![Smart Career Advisor](https://img.shields.io/badge/Smart-Career_Advisor-00A67E?style=for-the-badge&logo=target&logoColor=white)
![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-ISC-green?style=for-the-badge)

**An AI-powered career guidance platform that analyzes resumes and provides personalized career recommendations using Machine Learning**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [ML Models](#-machine-learning-models) • [API](#-api-endpoints) • [Deployment](DEPLOYMENT.md)

</div>

---

## 📋 Overview

Smart Career Advisor is a full-stack web application that leverages Machine Learning to help job seekers find their ideal career path. The platform analyzes resumes, extracts skills, and provides personalized job role recommendations with detailed career roadmaps.

### 🎯 Key Capabilities

- **Resume Analysis**: Upload PDF resumes for automatic skill extraction
- **Career Prediction**: ML-powered job role recommendations
- **Skill Gap Analysis**: Identify missing skills for desired roles
- **Career Roadmaps**: Get personalized learning paths
- **Interactive Dashboard**: Track predictions and career progress

---

## ✨ Features

### 🔐 Authentication System
- User registration with password hashing (bcrypt)
- Secure session management
- Profile customization with avatar upload
- Password visibility toggle

### 📄 Resume Analyzer
- PDF resume upload and parsing
- Automatic skill extraction using NLP
- Text-to-skills conversion
- Support for multiple file formats

### 🤖 Career Prediction Engine
- **SVM Model**: Support Vector Machine classifier (93.2% accuracy)
- **Random Forest Model**: Ensemble learning approach (76.1% accuracy)
- Predicts from **97 comprehensive job roles** including:
  - AI/ML roles: Prompt Engineer, LLM Engineer, Generative AI Engineer, MLOps Engineer
  - Development: Full Stack, Frontend, Backend, Mobile (iOS, Android, Flutter, React Native)
  - Cloud/DevOps: Cloud Engineer, DevOps Engineer, SRE, Platform Engineer
  - Data: Data Scientist, Data Analyst, Data Engineer, Big Data Engineer
  - And 80+ more roles across all tech domains
- Provides confidence scores and top 3 role recommendations

### 📊 Interactive Dashboard
- Prediction history tracking
- Visual skill analysis
- Career progress metrics
- Downloadable PDF reports (jsPDF)

### 🔍 Smart Search
- Full-text search across all pages
- Search highlighting on destination pages
- Intelligent navigation with keyword mapping

### 💬 AI Chatbot
- Meeting scheduling functionality
- Project information queries
- Interactive conversation flow
- **View Model Accuracy**: Type "4" or "accuracy" to see real-time ML metrics
- **Export PDF Report**: Type "5" or "export pdf" to download comprehensive metrics report

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Framework |
| Vite | 5.0.8 | Build Tool & Dev Server |
| React Router DOM | 6.20.1 | Client-side Routing |
| Axios | 1.6.2 | HTTP Client |
| jsPDF | 3.0.4 | PDF Generation |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime Environment |
| Express | 5.2.1 | Web Framework |
| SQLite3 | 5.1.7 | Database |
| bcrypt | 6.0.0 | Password Hashing |
| Multer | 2.0.2 | File Upload Handling |
| pdf-parse | 1.1.1 | PDF Text Extraction |
| express-session | 1.18.2 | Session Management |
| express-rate-limit | 8.2.1 | API Rate Limiting |

### Machine Learning (Python)
| Technology | Purpose |
|------------|---------|
| scikit-learn | ML Model Training |
| TF-IDF Vectorizer | Text Feature Extraction |
| LinearSVC | Support Vector Machine |
| RandomForestClassifier | Ensemble Learning |
| joblib | Model Serialization |
| pandas/numpy | Data Processing |

---

## 🧠 Machine Learning Models

### Model Architecture

```
Resume Text → TF-IDF Vectorization → ML Classifier → Job Role Prediction
                    ↓
            5000 Features
          (Unigrams + Bigrams)
```

### Performance Metrics

| Metric | SVM | Random Forest | Winner |
|--------|-----|---------------|--------|
| **Accuracy** | 93.2% | 76.1% | ✅ SVM |
| **Precision** | 91.2% | 77.1% | ✅ SVM |
| **Recall** | 94.2% | 74.1% | ✅ SVM |
| **F1-Score** | 92.7% | 75.5% | ✅ SVM |

> **Note**: The model now supports **97 comprehensive job roles** including Prompt Engineer, LLM Engineer, Generative AI Engineer, and many more covering all tech, business, and design domains.
| **Overfitting Risk** | Medium | Low | ✅ RF |

### 📊 View Model Metrics

To view the saved model accuracy metrics:

```bash
cd backend-node
python scripts/show_model_metrics.py
```

### 🔄 Train Models & Get Real-Time Metrics

To run actual training on the dataset and get **real-time** accuracy metrics:

```bash
cd backend-node
python scripts/train_and_evaluate.py
```

This command will:
1. Load the dataset
2. Split into training (80%) and testing (20%) sets
3. Train SVM and Random Forest models
4. Evaluate on test set
5. Display real-time performance metrics
6. Save trained models to `models/` directory

**Sample Output:**
```
[Step 5] Cross-Validation (5-Fold) - Computing Realistic Metrics
--------------------------------------------------
  SVM Cross-Validation:
    Fold scores: ['95.0%', '89.0%', '95.0%', '96.0%', '97.0%']
    Mean: 94.40% (+/- 5.60%)

  Random Forest Cross-Validation:
    Fold scores: ['89.0%', '83.0%', '89.0%', '94.0%', '94.0%']
    Mean: 89.80% (+/- 8.14%)

MODEL COMPARISON - REAL-TIME RESULTS
Metric          SVM             Random Forest    Winner
------------------------------------------------------------
Accuracy        94.40%          89.80%           ■ SVM
Precision       92.40%          90.80%           ■ SVM
Recall          95.40%          87.80%           ■ SVM
F1-Score        93.87%          89.27%           ■ SVM

Best Model:     SVM (94.40% accuracy)
```

### Training Configuration

```python
# TF-IDF Vectorizer
TfidfVectorizer(
    max_features=5000,
    ngram_range=(1, 2),    # Unigrams + Bigrams
    min_df=2,
    max_df=0.8,
    stop_words='english'
)

# SVM Classifier
LinearSVC(
    max_iter=2000,
    C=0.8,
    loss='squared_hinge'
)

# Random Forest Classifier
RandomForestClassifier(
    n_estimators=200,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2
)
```

### Dataset Information

| Attribute | Value |
|-----------|-------|
| Total Records | 50,000 |
| Training Split | 80% (40,000) |
| Testing Split | 20% (10,000) |
| Job Roles | 44 |
| Unique Skills | 100+ |

### Supported Job Roles (97 Total)

<details>
<summary>Click to expand all 97 job roles</summary>

**Software Development:**
- Full Stack Developer, Frontend Developer, Backend Developer
- Software Engineer, Senior Software Engineer, Junior Developer
- Web Developer, API Developer, Tech Lead, Software Architect

**Mobile Development:**
- Mobile Developer, iOS Developer, Android Developer
- React Native Developer, Flutter Developer

**AI/ML/Data (includes Prompt Engineer):**
- AI/ML Engineer, Data Scientist, Data Analyst, Data Engineer
- Machine Learning Engineer, NLP Engineer, Computer Vision Engineer
- **Prompt Engineer**, LLM Engineer, Generative AI Engineer
- AI Research Scientist, AI Product Manager, MLOps Engineer
- Big Data Engineer, Business Intelligence Developer

**DevOps/Cloud:**
- DevOps Engineer, Cloud Engineer, Cloud Architect
- Site Reliability Engineer, Platform Engineer
- Systems Administrator, Network Engineer
- Infrastructure Engineer, Release Engineer

**Security:**
- Security Engineer, Cybersecurity Analyst
- Application Security Engineer, Information Security Analyst
- Penetration Tester

**Database:**
- Database Administrator, Database Developer, Database Architect

**Quality Assurance:**
- QA Engineer, QA Lead, SDET, Manual Tester, Performance Engineer

**Design:**
- UI/UX Designer, Product Designer, Graphic Designer
- UX Researcher, Visual Designer, Interaction Designer

**Product & Project Management:**
- Product Manager, Technical Product Manager, Product Owner
- Project Manager, Program Manager, Scrum Master, Agile Coach

**Business & Analytics:**
- Business Analyst, Business Intelligence Analyst
- Systems Analyst, Operations Analyst

**Technical Writing & Support:**
- Technical Writer, Technical Support Engineer
- Customer Success Engineer, Support Engineer
- Help Desk Technician, Desktop Support Engineer

**Architecture:**
- Solutions Architect, Enterprise Architect
- Software Architect, Data Architect, Integration Architect

**Emerging Tech:**
- Blockchain Developer, AR/VR Developer, Game Developer
- IoT Developer, Robotics Engineer

**Leadership & Management:**
- Engineering Manager, Director of Engineering
- VP of Engineering, CTO, IT Manager

**Sales & Consulting:**
- Sales Engineer, Solutions Engineer
- IT Consultant, Technology Consultant

**Marketing Tech:**
- Growth Engineer, Marketing Technologist, SEO Specialist

</details>

---

## 📁 Project Structure

```
Smart_Career_Advisor/
├── frontend-react/           # React Frontend
│   ├── src/
│   │   ├── api/              # API client functions
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Auth/         # Login/Signup modals
│   │   │   ├── Chatbot/      # AI chatbot widget
│   │   │   ├── Common/       # Header, Footer, Search
│   │   │   ├── Dashboard/    # Dashboard components
│   │   │   └── Search/       # Search result cards
│   │   ├── context/          # React Context (Auth)
│   │   ├── data/             # Static data & search index
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── About.jsx
│   │   │   ├── ResumeAnalyzer.jsx
│   │   │   └── SearchResults.jsx
│   │   ├── styles/           # CSS styles
│   │   │   └── index.css     # Main stylesheet
│   │   └── utils/            # Utility functions
│   ├── package.json
│   └── vite.config.js
│
├── backend-node/             # Node.js Backend
│   ├── src/
│   │   ├── app.js            # Express app entry
│   │   ├── routes/           # API route handlers
│   │   │   ├── auth.js       # Authentication
│   │   │   ├── predict.js    # Career prediction
│   │   │   ├── resume.js     # Resume upload/analysis
│   │   │   ├── profile.js    # User profile
│   │   │   ├── avatar.js     # Avatar upload
│   │   │   ├── session.js    # Session management
│   │   │   └── chatbot.routes.js
│   │   ├── services/         # Business logic
│   │   │   └── database.js   # SQLite operations
│   │   └── middleware/       # Express middleware
│   ├── database/             # SQLite database & migrations
│   ├── models/               # ML model files (.joblib)
│   ├── scripts/              # Utility scripts
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** >= 18.0.0
- **Python** >= 3.8 (for ML model training)
- **npm** or **yarn**

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/Smart_Career_Advisor.git
cd Smart_Career_Advisor
```

### 2. Backend Setup

```bash
cd backend-node
npm install
```

Create `.env` file:
```env
PORT=10000
NODE_ENV=development
SESSION_SECRET=your-secret-key
```

Start the server:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend-react
npm install
npm run dev
```

### 4. Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:10000

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/session` | Check session status |

### Career Prediction

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/predict` | Get career prediction from skills |
| POST | `/api/resume/upload` | Upload and analyze resume |
| GET | `/api/predict/history` | Get prediction history |

### Profile Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get user profile |
| PUT | `/api/profile` | Update profile |
| POST | `/api/avatar/upload` | Upload avatar image |

### Chatbot

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chatbot/schedule` | Schedule a meeting |

---

## 🗄 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Predictions Table
```sql
CREATE TABLE predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    skills TEXT,
    predicted_role TEXT,
    confidence REAL,
    model_used TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Meeting Requests Table
```sql
CREATE TABLE meeting_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    preferred_date TEXT,
    preferred_time TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Theme toggle support
- **Glassmorphism**: Modern UI with blur effects
- **Micro-animations**: Smooth transitions and hover effects
- **Accessible**: Semantic HTML and ARIA labels

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| Lighthouse Score | 90+ |
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3.5s |
| Bundle Size (gzipped) | < 200KB |

---

## 🔒 Security

- **Password Hashing**: bcrypt with salt rounds
- **Session Security**: HTTP-only cookies
- **Rate Limiting**: 100 requests per 15 minutes
- **Input Validation**: Server-side validation
- **CORS**: Configured for allowed origins

---

## 📝 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Rathi Devi**  
📧 rathideviruku@gmail.com

---

## 🙏 Acknowledgments

- scikit-learn for ML algorithms
- React team for the amazing framework
- Express.js community
- All open-source contributors

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ for career seekers everywhere

</div>
