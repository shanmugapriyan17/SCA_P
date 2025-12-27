// Searchable content index for the entire website
// Only uses actual existing routes: /, /about, /dashboard, /resume-analyzer

export const SEARCHABLE_CONTENT = [
    // Home Page (/)
    {
        id: 'home-hero',
        title: 'Smart Career Advisor - AI-Powered Career Guidance',
        content: 'Discover your perfect career path with AI-powered guidance. Upload your resume and let our machine learning models analyze your skills to recommend the best career opportunities tailored for you.',
        route: '/',
        section: 'Home',
        keywords: ['career', 'advisor', 'ai', 'guidance', 'home', 'landing']
    },
    {
        id: 'home-features',
        title: 'Features - Resume Analysis & Career Prediction',
        content: 'Smart resume analysis using natural language processing. Dual ML models for accurate predictions. Personalized career recommendations. Job fit analysis and skill gap insights.',
        route: '/',
        section: 'Home - Features',
        keywords: ['features', 'resume', 'analysis', 'prediction', 'ml', 'models']
    },

    // About Page (/about)
    {
        id: 'about-main',
        title: 'About Smart Career Advisor',
        content: 'About Smart Career Advisor - Empowering careers through AI and machine learning. Learn about our project, creator, learning platform, and terms.',
        route: '/about',
        section: 'About Us',
        keywords: ['about', 'about us', 'information']
    },
    {
        id: 'about-creator',
        title: 'About the Creator - Rathidevi S',
        content: 'Smart Career Advisor was created by Rathidevi S, an AI/ML Engineer from Christian College of Engineering and Technology, Oddanchatram. Focus: Machine Learning and Deep Learning. Expertise: ML Model Development, Natural Language Processing, Resume Analysis, Web Application Development.',
        route: '/about',
        section: 'About - Creator',
        keywords: ['creator', 'developer', 'rathidevi', 'about me', 'engineer']
    },
    {
        id: 'about-project',
        title: 'About This Project',
        content: 'Smart Career Advisor is an innovative AI-powered platform that helps professionals discover ideal career paths through resume analysis and machine learning. Processes resume, extracts key skills, recommends suitable career roles based on patterns learned from 50,000+ job records.',
        route: '/about',
        section: 'About - Project',
        keywords: ['project', 'platform', 'system', 'technology']
    },
    {
        id: 'about-tech-stack',
        title: 'Technology Stack',
        content: 'Machine Learning: Support Vector Machine (SVM) LinearSVC, Random Forest Classifier, TF-IDF Vectorization, Natural Language Processing NLTK. Backend: Python, Flask, SQLite. Frontend: React, Vite, JavaScript.',
        route: '/about',
        section: 'About - Technology',
        keywords: ['technology', 'tech stack', 'frameworks', 'tools']
    },
    {
        id: 'about-learning',
        title: 'Learning Platform',
        content: 'Comprehensive learning resources and guides to help you navigate your career journey. Step-by-step tutorials and career development resources.',
        route: '/about',
        section: 'About - Learning',
        keywords: ['learning', 'platform', 'guide', 'tutorial', 'resources']
    },
    {
        id: 'about-terms',
        title: 'Terms and Conditions',
        content: 'Terms and Conditions, Privacy Policy, and usage guidelines for Smart Career Advisor. Read our terms of service and privacy commitments.',
        route: '/about',
        section: 'About - Terms',
        keywords: ['terms', 'conditions', 'privacy', 'policy', 'legal']
    },

    // Dashboard (/dashboard)
    {
        id: 'dashboard-main',
        title: 'User Dashboard',
        content: 'Your Dashboard - View your profile, upload resume, check career predictions, and manage your account. Access resume analysis and career insights.',
        route: '/dashboard',
        section: 'Dashboard',
        keywords: ['dashboard', 'profile', 'account', 'user']
    },
    {
        id: 'dashboard-profile',
        title: 'User Profile',
        content: 'Manage your profile information, view uploaded resumes, and track your career journey progress.',
        route: '/dashboard',
        section: 'Dashboard - Profile',
        keywords: ['profile', 'user info', 'account settings']
    },

    // Resume Analyzer (/resume-analyzer)
    {
        id: 'resume-analyzer',
        title: 'Resume Analyzer',
        content: 'Upload your resume for AI-powered analysis. Our system extracts skills, analyzes content, and predicts the best career paths for you. Support for PDF and TXT formats.',
        route: '/resume-analyzer',
        section: 'Resume Analyzer',
        keywords: ['resume', 'analyzer', 'upload', 'cv', 'analysis']
    },
    {
        id: 'resume-how-it-works',
        title: 'How Resume Analysis Works',
        content: 'Upload resume in PDF or TXT format. AI extracts skills using NLP. ML models predict best-fit careers. Get personalized recommendations with confidence scores.',
        route: '/resume-analyzer',
        section: 'Resume Analyzer - How It Works',
        keywords: ['how it works', 'process', 'steps']
    }
];

// Get all unique keywords for suggestions
export function getAllKeywords() {
    const keywords = new Set();
    SEARCHABLE_CONTENT.forEach(item => {
        item.keywords.forEach(keyword => keywords.add(keyword));
    });
    return Array.from(keywords).sort();
}
