import { useState, useEffect } from 'react';

function SettingsPopover({ isAuthenticated, user, onClose, onLogout, onLoginClick, onSignupClick }) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'system';
    });

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const applyTheme = (selectedTheme) => {
        localStorage.setItem('theme', selectedTheme);

        if (selectedTheme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.classList.toggle('dark-mode', prefersDark);
        } else if (selectedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    };

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.popover') && !e.target.closest('.settings-btn')) {
                onClose();
            }
        };
        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 0);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [onClose]);

    const getInitials = () => {
        if (user?.initials) return user.initials;
        if (user?.full_name) {
            return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
        }
        if (user?.username) return user.username[0].toUpperCase();
        return 'U';
    };

    return (
        <div className="popover" id="settingsPopover">
            <div className="popover-content">
                {/* Greeting */}
                <h4 id="greetingText">Hello, {isAuthenticated ? (user?.username || 'User') : 'Guest'}</h4>

                {/* Theme section */}
                <div className="theme-section">
                    <label>Theme:</label>
                    <div className="theme-options">
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="theme"
                                value="light"
                                checked={theme === 'light'}
                                onChange={() => handleThemeChange('light')}
                            />
                            <span>Light Mode</span>
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="theme"
                                value="dark"
                                checked={theme === 'dark'}
                                onChange={() => handleThemeChange('dark')}
                            />
                            <span>Dark Mode</span>
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="theme"
                                value="system"
                                checked={theme === 'system'}
                                onChange={() => handleThemeChange('system')}
                            />
                            <span>System Default</span>
                        </label>
                    </div>
                </div>

                {isAuthenticated ? (
                    <div id="profileSection">
                        <hr />
                        <div className="profile-card-container">
                            <button className="profile-card-button" type="button">
                                <div className="profile-avatar-small" id="settingsAvatarContainer">
                                    {user?.avatar_filename ? (
                                        <img src={`/uploads/avatars/${user.avatar_filename}`} alt="Avatar" />
                                    ) : (
                                        <span style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'linear-gradient(135deg, var(--sca-primary), var(--sca-secondary))',
                                            color: 'white',
                                            fontWeight: '600',
                                            fontSize: '1rem',
                                            borderRadius: '50%'
                                        }}>{getInitials()}</span>
                                    )}
                                </div>
                                <div className="profile-info-small">
                                    <p className="profile-username">{user?.full_name || user?.username || 'User'}</p>
                                    <p className="profile-email">{user?.email || 'email@example.com'}</p>
                                </div>
                            </button>
                            <button className="logout-btn" onClick={onLogout}>Logout</button>
                        </div>
                    </div>
                ) : (
                    <div id="authLinks" className="auth-links">
                        <button className="btn-link" onClick={onLoginClick}>Login</button>
                        <button className="btn-link" onClick={onSignupClick}>Create Account</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SettingsPopover;
