require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/session');
const profileRoutes = require('./routes/profile');
const avatarRoutes = require('./routes/avatar');
const resumeRoutes = require('./routes/resume');
const predictRoutes = require('./routes/predict');
const chatbotRoutes = require('./routes/chatbot.routes.js');

const app = express();
const PORT = process.env.PORT || 10000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://localhost:3000',
  'https://localhost:5000',
  'https://smart-career-advisor-fawn.vercel.app',
  'https://smart-career-advisor.vercel.app',
  'https://smart-career-advisor-seven.vercel.app',
  'https://smart-career-advisor-jhmp7j202-shanmugapriyan-ss-projects.vercel.app',
  'https://smart-career-advisor-exuf7rie5-shanmugapriyan-ss-projects.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all for now during development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Requested-With', 'Authorization']
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy (required for cookies behind Render/Heroku proxy)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Session configuration
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: path.join(__dirname, '..', 'database')
  }),
  secret: process.env.SECRET_KEY || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  proxy: process.env.NODE_ENV === 'production',
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 86400000, // 24 hours
    domain: process.env.NODE_ENV === 'production' ? undefined : undefined
  }
}));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', sessionRoutes);
app.use('/api', profileRoutes);
app.use('/api', avatarRoutes);
app.use('/api', resumeRoutes);
app.use('/api', predictRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Smart Career Advisor API is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler - always return JSON
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
