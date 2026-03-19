# Smart Career Advisor - Frontend (React)

This is the front-end application for the Smart Career Advisor platform. It is a modern, responsive single-page application (SPA) built with React and Vite, designed to interface with our Node.js and Python ML backend.

## 🚀 Technologies Used

- **React 18** (UI Library)
- **Vite 5** (Build Tool & Dev Server)
- **React Router DOM 6** (Client-side Routing)
- **Axios** (HTTP Client for API requests)
- **jsPDF & html2canvas** (Client-side PDF generation)

## 📁 Directory Structure

```text
frontend-react/
├── public/                 # Static assets (favicons)
├── src/
│   ├── api/                # Axios client configuration (client.js)
│   ├── components/
│   │   ├── Auth/           # Login and Registration Modals
│   │   ├── Chatbot/        # Cora the AI Career Advisor
│   │   ├── Common/         # Header, Footer, CustomCursor, Loaders
│   │   ├── Dashboard/      # Profile, Predictions, Assessments tabs
│   │   ├── Hero/           # Dynamic animated landing page hero
│   │   └── Search/         # Global site search components
│   ├── context/            # React Contexts (AuthContext.jsx)
│   ├── data/               # Static dataset / search configuration
│   ├── hooks/              # Custom React Hooks
│   ├── pages/              # Main Route Views
│   │   ├── Home.jsx             # Main landing page
│   │   ├── Dashboard.jsx        # User portal
│   │   ├── ResumeAnalyzer.jsx   # Core ML integration page
│   │   ├── MentorshipHub.jsx    # Scheduling & AI Mentorship
│   │   ├── About.jsx            # Detailed project documentation
│   │   └── SearchResults.jsx    # Search page
│   ├── styles/
│   │   └── index.css       # Global stylesheet (Vanilla CSS)
│   ├── App.jsx             # Root component & Route definitions
│   └── main.jsx            # React mounting point
├── package.json
└── vite.config.js          # Vite configuration
```

## 🛠 Setup & Installation

**Prerequisites:** Node.js (v18+)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Environment:
   Ensure you have configured the backend API URL. By default, Axios points to `http://localhost:10000` for local development. Make sure your local Node.js server is running on that port.

3. Start Development Server:
   ```bash
   npm run dev
   ```

4. Build for Production:
   ```bash
   npm run build
   ```
   *The optimized production files will be generated in the `dist/` folder.*

## ✨ Highlights
- **100% Custom CSS**: No heavy UI frameworks. The entire platform uses handcrafted, highly responsive vanilla CSS.
- **Micro-interactions**: Subtle hover state animations, a custom mouse cursor tracking dot, and intersection-observer powered reveal animations enhance the UX.
- **Context API**: Deep state management for user authentication (JWT + Cookies) without needing Redux.
