import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginModal from '../Auth/LoginModal';
import SignupModal from '../Auth/SignupModal';
import SearchModal from './SearchModal';
import SettingsPopover from './SettingsPopover';

function Header() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [postLoginRedirect, setPostLoginRedirect] = useState(null);

    // Handle ESC key to close modals
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                setShowLoginModal(false);
                setShowSignupModal(false);
                setShowSearchModal(false);
                setShowSettings(false);
                setShowMobileMenu(false);
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, []);

    // Handle body scroll lock when modals are open
    useEffect(() => {
        if (showLoginModal || showSignupModal || showSearchModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [showLoginModal, showSignupModal, showSearchModal]);

    const handleDashboardClick = (e) => {
        e.preventDefault();
        if (isAuthenticated) {
            navigate('/dashboard');
        } else {
            setPostLoginRedirect('/dashboard');
            setShowLoginModal(true);
        }
    };

    const handleLoginSuccess = () => {
        setShowLoginModal(false);
        if (postLoginRedirect) {
            setTimeout(() => {
                navigate(postLoginRedirect);
                setPostLoginRedirect(null);
            }, 600);
        }
    };

    const handleSignupSuccess = () => {
        setShowSignupModal(false);
        setTimeout(() => {
            navigate('/dashboard');
        }, 600);
    };

    const handleLogout = async () => {
        await logout();
        setShowSettings(false);
        navigate('/');
    };

    const switchToSignup = () => {
        setShowLoginModal(false);
        setTimeout(() => setShowSignupModal(true), 100);
    };

    const switchToLogin = () => {
        setShowSignupModal(false);
        setTimeout(() => setShowLoginModal(true), 100);
    };

    return (
        <>
            <header className="header">
                <div className="header-container">
                    {/* Logo - Left Section */}
                    <Link to="/" className="logo">
                        <svg className="logo-icon" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" />
                            <path d="M20 8 L28 20 L20 32 L12 20 Z" fill="currentColor" opacity="0.8" />
                        </svg>
                        <span className="logo-text">Smart Career Advisor</span>
                    </Link>

                    {/* Navigation - Center Section */}
                    <nav className="nav">
                        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
                        <a href="#" onClick={handleDashboardClick} className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</a>
                        <Link to="/resume-analyzer" className={`nav-link ${location.pathname === '/resume-analyzer' ? 'active' : ''}`}>Resume Analyzer</Link>
                        <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About Us</Link>
                    </nav>

                    {/* Right Icons Section */}
                    <div className="header-actions">
                        <button className="icon-btn search-btn" onClick={() => setShowSearchModal(true)} title="Search" aria-label="Search">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                        </button>

                        <button className="icon-btn settings-btn" onClick={() => setShowSettings(!showSettings)} title="Settings" aria-label="Settings">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m3.08 3.08l4.24 4.24M1 12h6m6 0h6m-15.78 7.78l4.24-4.24m3.08-3.08l4.24-4.24"></path>
                            </svg>
                        </button>

                        {/* Hamburger Menu Toggle (Mobile Only) */}
                        <button
                            className="hamburger-btn"
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            title="Menu"
                            aria-label="Menu"
                            aria-expanded={showMobileMenu}
                        >
                            <span className="hamburger-line"></span>
                            <span className="hamburger-line"></span>
                            <span className="hamburger-line"></span>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                <nav className={`nav-mobile ${showMobileMenu ? 'active' : ''}`}>
                    <Link to="/" className="nav-link mobile-nav-link">Home</Link>
                    <a href="#" onClick={handleDashboardClick} className="nav-link mobile-nav-link">Dashboard</a>
                    <Link to="/resume-analyzer" className="nav-link mobile-nav-link">Resume Analyzer</Link>
                    <Link to="/about" className="nav-link mobile-nav-link">About Us</Link>
                </nav>

                {/* Settings Popover */}
                {showSettings && (
                    <SettingsPopover
                        isAuthenticated={isAuthenticated}
                        user={user}
                        onClose={() => setShowSettings(false)}
                        onLogout={handleLogout}
                        onLoginClick={() => { setShowSettings(false); setShowLoginModal(true); }}
                        onSignupClick={() => { setShowSettings(false); setShowSignupModal(true); }}
                    />
                )}
            </header>

            {/* Search Modal */}
            {showSearchModal && (
                <SearchModal onClose={() => setShowSearchModal(false)} />
            )}

            {/* Login Modal */}
            {showLoginModal && (
                <LoginModal
                    onClose={() => setShowLoginModal(false)}
                    onSuccess={handleLoginSuccess}
                    onSwitchToSignup={switchToSignup}
                />
            )}

            {/* Signup Modal */}
            {showSignupModal && (
                <SignupModal
                    onClose={() => setShowSignupModal(false)}
                    onSuccess={handleSignupSuccess}
                    onSwitchToLogin={switchToLogin}
                />
            )}
        </>
    );
}

export default Header;
