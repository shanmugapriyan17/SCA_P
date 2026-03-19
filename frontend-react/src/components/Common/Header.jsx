import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../Auth/AuthModal';

const FONT = "'Poppins', system-ui, sans-serif";

function Header() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [scrolled, setScrolled] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleAuthAction = (mode) => {
        if (isAuthenticated) {
            logout();
            navigate('/');
        } else {
            setAuthMode(mode);
            setAuthModalOpen(true);
        }
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Resume', path: '/resume-analyzer' },
        { name: 'Mentorship', path: '/mentorship' },
        { name: 'About', path: '/about' },
    ];

    return (
        <>
            <nav
                style={{
                    position: 'fixed',
                    top: scrolled ? '8px' : '16px',
                    left: '20px',
                    right: '20px',
                    zIndex: 1000,
                    background: scrolled
                        ? 'rgba(255,255,255,0.95)'
                        : 'rgba(255,255,255,0.82)',
                    backdropFilter: 'saturate(200%) blur(20px)',
                    WebkitBackdropFilter: 'saturate(200%) blur(20px)',
                    borderRadius: '50px',
                    boxShadow: scrolled
                        ? '0 10px 40px rgba(0,0,0,0.12)'
                        : '0 8px 24px rgba(0,0,0,0.07)',
                    fontFamily: FONT,
                    transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                    border: '1px solid rgba(255,255,255,0.6)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 28px',
                        maxWidth: '1300px',
                        margin: '0 auto',
                    }}
                >
                    {/* ── Brand ── */}
                    <Link
                        to="/"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            textDecoration: 'none',
                            flexShrink: 0,
                        }}
                    >
                        {/* Logo mark — custom globe/sphere SVG */}
                        <svg
                            width="36"
                            height="36"
                            viewBox="0 0 36 36"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ flexShrink: 0 }}
                        >
                            <ellipse cx="7" cy="18" rx="5" ry="13" fill="#18181b" opacity="0.55" />
                            <ellipse cx="12" cy="18" rx="6.5" ry="16" fill="#18181b" opacity="0.70" />
                            <ellipse cx="18" cy="18" rx="6.5" ry="18" fill="#18181b" opacity="0.90" />
                            <ellipse cx="24" cy="18" rx="6.5" ry="16" fill="#18181b" opacity="0.70" />
                            <ellipse cx="29" cy="18" rx="5" ry="13" fill="#18181b" opacity="0.55" />
                        </svg>
                        <span style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#18181b',
                            letterSpacing: '-0.2px',
                            fontFamily: FONT,
                        }}>
                            Smart Career Advisor
                        </span>
                    </Link>

                    {/* ── Desktop Nav Links ── */}
                    <div
                        id="nav-desktop-links"
                        style={{ gap: '2px', display: isDesktop ? 'flex' : 'none', alignItems: 'center' }}
                    >
                        {navLinks.map((link) => {
                            const active = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    style={{
                                        fontSize: '13px',
                                        fontWeight: active ? 600 : 400,
                                        color: active ? '#18181b' : '#71717a',
                                        padding: '7px 14px',
                                        borderRadius: '30px',
                                        textDecoration: 'none',
                                        background: active ? '#f4f4f5' : 'transparent',
                                        transition: 'all 0.2s ease',
                                        fontFamily: FONT,
                                        letterSpacing: '0.1px',
                                        display: 'inline-block',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!active) {
                                            e.currentTarget.style.color = '#18181b';
                                            e.currentTarget.style.background = '#f9f9f9';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!active) {
                                            e.currentTarget.style.color = '#71717a';
                                            e.currentTarget.style.background = 'transparent';
                                        }
                                    }}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* ── Right Buttons ── */}
                    <div
                        id="nav-desktop-buttons"
                        style={{ gap: '8px', flexShrink: 0, display: isDesktop ? 'flex' : 'none', alignItems: 'center' }}
                    >
                        {isAuthenticated ? (
                            <>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '5px 12px 5px 8px',
                                    borderRadius: '30px',
                                    background: '#f4f4f5',
                                    marginRight: '4px',
                                }}>
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #27272a, #52525b)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '10px',
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontFamily: FONT,
                                        flexShrink: 0,
                                    }}>
                                        {(user?.username || 'U')[0].toUpperCase()}
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#27272a', fontFamily: FONT }}>
                                        {user?.username || 'User'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleAuthAction('logout')}
                                    style={{
                                        background: 'transparent',
                                        border: '1.5px solid #e4e4e7',
                                        color: '#52525b',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        borderRadius: '30px',
                                        padding: '7px 18px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        fontFamily: FONT,
                                        letterSpacing: '0.2px',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#18181b';
                                        e.currentTarget.style.color = '#fff';
                                        e.currentTarget.style.borderColor = '#18181b';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#52525b';
                                        e.currentTarget.style.borderColor = '#e4e4e7';
                                    }}
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => handleAuthAction('login')}
                                    style={{
                                        background: 'transparent',
                                        border: '1.5px solid #e4e4e7',
                                        color: '#52525b',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        borderRadius: '30px',
                                        padding: '7px 20px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        fontFamily: FONT,
                                        letterSpacing: '0.2px',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#f4f4f5';
                                        e.currentTarget.style.color = '#18181b';
                                        e.currentTarget.style.borderColor = '#d4d4d8';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#52525b';
                                        e.currentTarget.style.borderColor = '#e4e4e7';
                                    }}
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => handleAuthAction('signup')}
                                    style={{
                                        background: 'linear-gradient(135deg, #27272a 0%, #3f3f46 100%)',
                                        border: 'none',
                                        color: '#fff',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        borderRadius: '30px',
                                        padding: '8px 22px',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 14px rgba(39,39,42,0.30)',
                                        transition: 'all 0.25s ease',
                                        fontFamily: FONT,
                                        letterSpacing: '0.2px',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(39,39,42,0.35)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(39,39,42,0.30)';
                                    }}
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>

                    {/* ── Mobile Toggle ── */}
                    <button
                        id="nav-mobile-toggle"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        style={{
                            background: mobileOpen ? '#f4f4f5' : 'transparent',
                            border: '1.5px solid #e4e4e7',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            padding: '6px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                        }}
                        aria-controls="mobile-nav"
                        aria-expanded={mobileOpen}
                        aria-label="Toggle navigation"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#27272a' }}>
                            {mobileOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>

                {/* ── Mobile Menu ── */}
                {mobileOpen && (
                    <div
                        id="mobile-nav"
                        style={{
                            padding: '4px 16px 16px',
                            borderTop: '1px solid #f4f4f5',
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px 0' }}>
                            {navLinks.map((link) => {
                                const active = location.pathname === link.path;
                                return (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        onClick={() => setMobileOpen(false)}
                                        style={{
                                            display: 'block',
                                            padding: '10px 16px',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            fontWeight: active ? 600 : 400,
                                            color: active ? '#18181b' : '#71717a',
                                            background: active ? '#f4f4f5' : 'transparent',
                                            textDecoration: 'none',
                                            fontFamily: FONT,
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>
                        <div style={{ height: '1px', background: '#f4f4f5', margin: '4px 0 10px' }}></div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {isAuthenticated ? (
                                <button
                                    onClick={() => { handleAuthAction('logout'); setMobileOpen(false); }}
                                    style={{ flex: 1, padding: '10px', borderRadius: '30px', fontSize: '12px', fontWeight: 600, color: '#ef4444', border: '1.5px solid #fecaca', background: '#fff', cursor: 'pointer', fontFamily: FONT }}
                                >
                                    Sign Out
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => { handleAuthAction('login'); setMobileOpen(false); }}
                                        style={{ flex: 1, padding: '10px', borderRadius: '30px', fontSize: '12px', fontWeight: 600, color: '#52525b', border: '1.5px solid #e4e4e7', background: 'transparent', cursor: 'pointer', fontFamily: FONT }}
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={() => { handleAuthAction('signup'); setMobileOpen(false); }}
                                        style={{ flex: 1, padding: '10px', borderRadius: '30px', fontSize: '12px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg,#27272a,#3f3f46)', border: 'none', cursor: 'pointer', fontFamily: FONT }}
                                    >
                                        Sign Up
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {authModalOpen && (
                <AuthModal
                    mode={authMode}
                    onClose={() => setAuthModalOpen(false)}
                    onSwitchMode={setAuthMode}
                />
            )}
        </>
    );
}

export default Header;
