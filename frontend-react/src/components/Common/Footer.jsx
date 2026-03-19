import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer style={{
            background: '#f8f9ff',
            borderTop: '3px solid',
            borderImageSource: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)',
            borderImageSlice: 1,
            fontFamily: "'Poppins', system-ui, sans-serif",
            width: '100%'
        }}>
            <style>{`
                .footer-grid { display: grid; grid-template-columns: 2.2fr 1fr 1fr 1fr 1fr; gap: 40px; padding-bottom: 48px; border-bottom: 1px solid #e8eaf6; }
                @media (max-width: 1024px) { .footer-grid { grid-template-columns: repeat(3, 1fr); } }
                @media (max-width: 768px)  { .footer-grid { grid-template-columns: 1fr 1fr; gap: 28px; } }
                @media (max-width: 480px)  { .footer-grid { grid-template-columns: 1fr; } }
            `}</style>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '56px 28px 0' }}>
                <div className="footer-grid">
                    {/* Brand */}
                    <div>
                        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '14px' }}>
                            <svg width="30" height="30" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                <ellipse cx="7" cy="18" rx="5" ry="13" fill="#18181b" opacity="0.40" />
                                <ellipse cx="12" cy="18" rx="6.5" ry="16" fill="#18181b" opacity="0.55" />
                                <ellipse cx="18" cy="18" rx="6.5" ry="18" fill="#18181b" opacity="0.85" />
                                <ellipse cx="24" cy="18" rx="6.5" ry="16" fill="#18181b" opacity="0.55" />
                                <ellipse cx="29" cy="18" rx="5" ry="13" fill="#18181b" opacity="0.40" />
                            </svg>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827', letterSpacing: '-0.2px' }}>Smart Career Advisor</span>
                        </Link>
                        <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.8, maxWidth: '230px', marginBottom: '22px' }}>
                            Your AI-powered companion for career discovery — personalised, instant, and built to help you thrive.
                        </p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <a href="http://linkedin.com/in/rathidevi-s-bb9a51289" target="_blank" rel="noopener noreferrer" title="LinkedIn" style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: '#fff', border: '1px solid #e5e7eb',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#eef2ff'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#6366f1' }}>link</span>
                            </a>
                            <a href="https://github.com/Rathidevi28" target="_blank" rel="noopener noreferrer" title="GitHub" style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: '#fff', border: '1px solid #e5e7eb',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#eef2ff'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#6366f1' }}>code</span>
                            </a>
                            <a href="mailto:rathideviruku@gmail.com" title="Email" style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: '#fff', border: '1px solid #e5e7eb',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#eef2ff'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#6366f1' }}>email</span>
                            </a>
                        </div>
                    </div>

                    {/* Link columns */}
                    {[
                        { heading: 'Platform', links: [{ text: 'Home', path: '/' }, { text: 'Dashboard', path: '/dashboard' }, { text: 'Resume Analyzer', path: '/resume-analyzer' }, { text: 'Mentorship', path: '/mentorship' }] },
                        { heading: 'Resources', links: [{ text: 'Learning Hub', path: '/about?tab=learning-platform' }, { text: 'How It Works', path: '/about?tab=how-it-works' }, { text: 'AI Career Tips', path: '/about?tab=ai-career-tips' }] },
                        { heading: 'Company', links: [{ text: 'About Project', path: '/about?tab=about-project' }, { text: 'The Creator', path: '/about?tab=about-me' }, { text: 'Contact Us', path: '/about?tab=terms#contact' }] },
                        { heading: 'Legal', links: [{ text: 'Privacy Policy', path: '/about?tab=privacy-policy' }, { text: 'Terms of Service', path: '/about?tab=terms' }, { text: 'Data & Security', path: '/about?tab=data-security' }] },
                    ].map(col => (
                        <div key={col.heading}>
                            <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#111827', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>{col.heading}</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {col.links.map(l => (
                                    <li key={l.text}>
                                        <Link to={l.path}
                                            style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none', transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.target.style.color = '#4f46e5'}
                                            onMouseLeave={e => e.target.style.color = '#6b7280'}
                                        >{l.text}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', flexWrap: 'wrap', gap: '8px' }}>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                        © 2026 <span style={{ color: '#4f46e5', fontWeight: 600 }}>SCA</span> · Smart Career Advisor. All rights reserved.
                    </p>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Built with <span className="material-symbols-outlined" style={{ fontSize: '12px', color: '#e11d48', fontVariationSettings: "'FILL' 1" }}>favorite</span> using React &amp; AI
                    </p>
                </div>
            </div>
        </footer>
    );
}
