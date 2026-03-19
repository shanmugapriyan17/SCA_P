import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import About from './pages/About';
import SearchResults from './pages/SearchResults';
import PerformanceDashboard from './pages/PerformanceDashboard';
import MentorshipHub from './pages/MentorshipHub';
import ChatbotWidget from './components/Chatbot/ChatbotWidget';

// Protected Route component
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-off-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-text-muted font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
}

function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />
                <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
                <Route path="/performance" element={<PerformanceDashboard />} />
                <Route path="/mentorship" element={<MentorshipHub />} />
                <Route path="/about" element={<About />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            {/* Chatbot Widget - Available on all pages */}
            <ChatbotWidget />
        </>
    );
}

export default App;
