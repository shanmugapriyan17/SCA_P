import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SEARCH_SUGGESTIONS = [
    'Data Scientist',
    'Frontend Developer',
    'Machine Learning',
    'Backend Engineer',
    'DevOps Engineer',
    'Full Stack Developer'
];

// Keyword to route mapping
const SEARCH_ROUTES = {
    // About page and tabs
    'about': '/about',
    'about us': '/about',
    'about me': '/about?tab=about-me',
    'creator': '/about?tab=about-me',
    'developer': '/about?tab=about-me',
    'rathidevi': '/about?tab=about-me',
    'project': '/about?tab=about-project',
    'about project': '/about?tab=about-project',
    'features': '/about?tab=about-project',
    'technology': '/about?tab=about-project',
    'learning': '/about?tab=learning-platform',
    'platform': '/about?tab=learning-platform',
    'guide': '/about?tab=learning-platform',
    'terms': '/about?tab=terms',
    'conditions': '/about?tab=terms',
    'privacy': '/about?tab=terms',

    // Dashboard
    'dashboard': '/dashboard',
    'profile': '/dashboard',
    'my profile': '/dashboard',

    // Resume Analyzer
    'resume': '/resume-analyzer',
    'analyzer': '/resume-analyzer',
    'upload resume': '/resume-analyzer',
    'analyze': '/resume-analyzer',
    'cv': '/resume-analyzer',

    // Home
    'home': '/',
    'main': '/',
    'landing': '/'
};

function SearchModal({ onClose }) {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            onClose();
        }
    };

    const handleSearch = (query) => {
        if (!query.trim()) return;

        // Navigate to search results page
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        onClose();
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion);
        handleSearch(suggestion);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch(searchQuery);
        }
    };

    return (
        <div className="modal" style={{ display: 'flex' }}>
            <div className="modal-overlay" onClick={handleOverlayClick}></div>
            <div className="modal-content search-modal">
                <button className="modal-close" onClick={onClose} style={{ top: '1rem', right: '1rem', zIndex: 10 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <h3>Search</h3>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search pages, sections, roles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    autoFocus
                />
                <div className="search-suggestions">
                    {SEARCH_SUGGESTIONS.map((suggestion, index) => (
                        <div
                            key={index}
                            className="suggestion-chip"
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SearchModal;
