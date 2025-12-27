import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import About from './pages/About';
import SearchResults from './pages/SearchResults';
import ChatbotWidget from './components/Chatbot/ChatbotWidget';

// Protected Route component
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
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
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
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

