import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const FONT = "'Poppins', system-ui, sans-serif";
const IND = '#4f46e5';
const VIO = '#7c3aed';

function AuthModal({ mode = 'login', onClose, onSwitchMode }) {
    const { login, signup } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [focused, setFocused] = useState('');

    const isLogin = mode === 'login';

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                await signup(formData.username, formData.email, formData.password);
            }
            setSuccess(true);
            setTimeout(() => {
                onClose();
                navigate('/dashboard');
            }, 800);
        } catch (err) {
            setError(err.response?.data?.message || err.message || `${isLogin ? 'Login' : 'Signup'} failed.`);
        } finally {
            setLoading(false);
        }
    };

    /* ── Shared styles ── */
    const overlay = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT,
    };
    const backdrop = {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
    };
    const card = {
        position: 'relative', background: '#fff', borderRadius: '24px',
        padding: '32px', width: '100%', maxWidth: '420px', margin: '0 16px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.25)', boxSizing: 'border-box',
    };
    const inputStyle = (name) => ({
        width: '100%', padding: '12px 16px', borderRadius: '14px', fontSize: '14px',
        border: `2px solid ${focused === name ? IND : '#e2e8f0'}`,
        background: '#f8fafc', color: '#1e293b', outline: 'none',
        fontFamily: FONT, boxSizing: 'border-box',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: focused === name ? '0 0 0 3px rgba(79,70,229,0.12)' : 'none',
    });
    const labelStyle = {
        display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155',
        marginBottom: '6px',
    };

    /* ── Success screen ── */
    if (success) {
        return (
            <div style={overlay}>
                <div style={backdrop} />
                <div style={{ ...card, textAlign: 'center', padding: '48px 32px' }}>
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '50%', background: '#ecfdf5',
                        margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#059669' }}>check_circle</span>
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>
                        {isLogin ? 'Welcome back!' : 'Account created!'}
                    </h2>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    /* ── Main form ── */
    return (
        <div style={overlay}>
            <div style={backdrop} onClick={onClose} />
            <div style={card}>
                {/* Close button */}
                <button onClick={onClose} style={{
                    position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px',
                    borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s',
                }}
                    onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748b' }}>close</span>
                </button>

                {/* Header */}
                <div style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: `linear-gradient(135deg, ${IND}, ${VIO})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#fff' }}>smart_toy</span>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '16px', color: '#1e293b' }}>SmartCareer</span>
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>
                        {isLogin ? 'Welcome back' : 'Create your account'}
                    </h2>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                        {isLogin ? 'Sign in to continue' : 'Start your career journey'}
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        marginBottom: '20px', padding: '12px 14px', borderRadius: '12px',
                        background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                        fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500,
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {!isLogin && (
                            <div>
                                <label style={labelStyle}>Username</label>
                                <input
                                    type="text" name="username" value={formData.username}
                                    onChange={handleChange} placeholder="johndoe" required
                                    onFocus={() => setFocused('username')} onBlur={() => setFocused('')}
                                    style={inputStyle('username')}
                                />
                            </div>
                        )}
                        <div>
                            <label style={labelStyle}>Email</label>
                            <input
                                type="email" name="email" value={formData.email}
                                onChange={handleChange} placeholder="you@example.com" required
                                onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                                style={inputStyle('email')}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password" value={formData.password}
                                    onChange={handleChange} placeholder="••••••••" required
                                    onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                                    style={{ ...inputStyle('password'), paddingRight: '48px' }}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                                    display: 'flex', alignItems: 'center',
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#94a3b8' }}>
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={loading} style={{
                        width: '100%', padding: '14px', borderRadius: '14px', border: 'none', marginTop: '24px',
                        background: loading ? '#94a3b8' : `linear-gradient(135deg, ${IND}, ${VIO})`,
                        color: '#fff', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                        fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        boxShadow: loading ? 'none' : '0 4px 14px rgba(79,70,229,0.35)',
                        transition: 'all 0.2s',
                    }}>
                        {loading ? (
                            <>
                                <div style={{
                                    width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)',
                                    borderTopColor: '#fff', borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite',
                                }} />
                                {isLogin ? 'Signing in...' : 'Creating account...'}
                            </>
                        ) : (
                            isLogin ? 'Sign In' : 'Create Account'
                        )}
                    </button>
                </form>

                {/* Switch mode */}
                <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', marginTop: '24px' }}>
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                    <button onClick={() => onSwitchMode(isLogin ? 'signup' : 'login')} style={{
                        background: 'none', border: 'none', color: IND, fontWeight: 700, cursor: 'pointer',
                        fontFamily: FONT, fontSize: '14px', padding: 0, textDecoration: 'underline',
                    }}>
                        {isLogin ? 'Create one' : 'Sign in'}
                    </button>
                </p>
            </div>

            {/* Spin animation */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default AuthModal;
