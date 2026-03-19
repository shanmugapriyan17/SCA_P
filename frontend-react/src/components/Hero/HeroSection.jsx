import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const FONT = "'Poppins', system-ui, sans-serif";

const heroCSS = `
@keyframes floatDoc {
  0%,100% { transform: translateY(0px) }
  50%      { transform: translateY(-10px) }
}
@keyframes scanLine {
  0%   { top: 8% }
  100% { top: 86% }
}
@keyframes shimmer {
  0%   { background-position: -200% 0 }
  100% { background-position: 200% 0 }
}
@keyframes aiPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(79,70,229,0.15), 0 8px 32px rgba(79,70,229,0.18) }
  50%     { box-shadow: 0 0 0 8px rgba(79,70,229,0), 0 8px 32px rgba(79,70,229,0.28) }
}
@keyframes badgeIn {
  from { opacity:0; transform: translateY(-6px) }
  to   { opacity:1; transform: translateY(0) }
}
@keyframes meshMove {
  0%,100% { background-position: 0% 50% }
  50%     { background-position: 100% 50% }
}
@media (max-width: 640px) {
  .hero-pipeline { display: none !important; }
  .hero-left { max-width: 100% !important; flex: 1 1 100% !important; text-align: center; }
  .hero-cta { justify-content: center !important; }
}
@media (max-width: 480px) {
  .cta-section { padding: 40px 16px !important; }
  .cta-heading { font-size: 24px !important; }
}
`;

/* ── Resume Card ── */
function ResumeCard({ phase }) {
    return (
        <div style={{
            width: '165px',
            background: '#fff',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '16px',
            padding: '16px 14px',
            display: 'flex', flexDirection: 'column', gap: '8px',
            position: 'relative', overflow: 'hidden',
            transition: 'all 0.85s cubic-bezier(0.4,0,0.2,1)',
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.93)',
            animation: phase === 1 ? 'floatDoc 3.8s ease-in-out infinite' : 'none',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 20px 40px rgba(0,0,0,0.08)',
        }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '2px' }}>
                <div style={{
                    width: '22px', height: '26px', borderRadius: '5px',
                    background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '6px', fontWeight: 800, color: '#fff', fontFamily: FONT,
                }}>PDF</div>
                <span style={{ fontSize: '9px', color: '#64748b', fontFamily: FONT, fontWeight: 500 }}>resume.pdf</span>
            </div>

            {/* Name line */}
            <div style={{ height: '8px', borderRadius: '4px', width: '65%', background: '#1e293b' }} />

            {/* Text lines */}
            {[88, 72, 90, 60, 82, 68, 76, 52].map((w, i) => (
                <div key={i} style={{
                    height: '5px', borderRadius: '3px',
                    width: `${w}%`,
                    background: `rgba(100,116,139,${0.15 + (i % 3) * 0.06})`,
                }} />
            ))}

            {/* Scan line */}
            {phase === 2 && (
                <div style={{
                    position: 'absolute', left: 0, right: 0, height: '2px',
                    background: 'linear-gradient(90deg, transparent, #4f46e5, #7c3aed, #4f46e5, transparent)',
                    animation: 'scanLine 1.3s ease-in-out infinite',
                    boxShadow: '0 0 12px rgba(79,70,229,0.5)',
                }} />
            )}
        </div>
    );
}

/* ── AI Slot ── */
function AISlot({ active }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px',
            opacity: active ? 1 : 0.3, transition: 'opacity 0.6s ease',
        }}>
            <div style={{
                width: '52px', height: '52px', borderRadius: '16px',
                background: active ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : '#f1f5f9',
                border: `1.5px solid ${active ? 'rgba(79,70,229,0.4)' : '#e2e8f0'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.6s ease',
                animation: active ? 'aiPulse 2.5s ease-in-out infinite' : 'none',
            }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                        stroke={active ? '#fff' : '#94a3b8'} strokeWidth="1.6"
                        strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            <span style={{
                fontSize: '7px', fontWeight: 700, letterSpacing: '1px',
                color: active ? '#4f46e5' : '#94a3b8',
                fontFamily: FONT, textTransform: 'uppercase',
            }}>
                {active ? 'Analyzing' : 'AI Engine'}
            </span>
        </div>
    );
}

/* ── Connector ── */
function Connector({ active }) {
    return (
        <div style={{
            width: '42px', height: '1.5px', position: 'relative', overflow: 'hidden',
            background: active ? 'rgba(79,70,229,0.12)' : '#e2e8f0', borderRadius: '1px',
        }}>
            {active && (
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, transparent, #4f46e5, #7c3aed, #4f46e5, transparent)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.8s linear infinite',
                }} />
            )}
        </div>
    );
}

/* ── Career Card ── */
function CareerCard({ visible }) {
    return (
        <div style={{
            width: '195px',
            background: '#fff',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '16px',
            padding: '18px',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateX(0) scale(1)' : 'translateX(24px) scale(0.95)',
            transition: 'all 0.85s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 20px 40px rgba(0,0,0,0.08)',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '14px' }}>
                <div style={{
                    width: '30px', height: '30px', borderRadius: '9px',
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
                }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#111827', fontFamily: FONT }}>Career Match</span>
            </div>

            {/* Role */}
            <div style={{ marginBottom: '13px' }}>
                <div style={{ fontSize: '8px', color: '#94a3b8', fontFamily: FONT, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Suggested Role</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', fontFamily: FONT }}>Data Scientist</div>
            </div>

            {/* Bar */}
            <div style={{ marginBottom: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '8px', color: '#94a3b8', fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.7px' }}>Skill Match</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#4f46e5', fontFamily: FONT }}>94%</span>
                </div>
                <div style={{ height: '5px', borderRadius: '3px', background: '#f1f5f9' }}>
                    <div style={{
                        height: '100%', borderRadius: '3px',
                        width: visible ? '94%' : '0%',
                        background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #a78bfa)',
                        transition: 'width 1.3s cubic-bezier(0.4,0,0.2,1) 0.35s',
                    }} />
                </div>
            </div>

            {/* Skills */}
            <div style={{ fontSize: '8px', color: '#94a3b8', fontFamily: FONT, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Top Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {['Python', 'ML', 'SQL', 'TensorFlow'].map(s => (
                    <span key={s} style={{
                        fontSize: '9px', fontWeight: 600, padding: '3px 9px', borderRadius: '6px',
                        background: '#ede9fe', color: '#5b21b6', fontFamily: FONT,
                    }}>{s}</span>
                ))}
            </div>
        </div>
    );
}

/* ══ MAIN ══ */
export default function HeroSection() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        const t = [];
        const run = () => {
            setPhase(0);
            t.push(setTimeout(() => setPhase(1), 500));
            t.push(setTimeout(() => setPhase(2), 2600));
            t.push(setTimeout(() => setPhase(3), 4600));
            t.push(setTimeout(run, 8800));
        };
        run();
        return () => t.forEach(clearTimeout);
    }, []);

    return (
        <header style={{ position: 'relative', overflow: 'hidden' }}>
            <style>{heroCSS}</style>

            <div style={{
                position: 'relative',
                minHeight: '85vh',
                /* Clean white with animated rainbow mesh in the top-right corner */
                background: '#f8faff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '90px 24px 40px',
            }}>

                {/* Mesh gradient blobs – soft, barely visible */}
                <div style={{
                    position: 'absolute', top: '-8%', right: '-5%',
                    width: '560px', height: '560px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, rgba(99,102,241,0.06) 50%, transparent 75%)',
                    pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', top: '10%', right: '8%',
                    width: '320px', height: '320px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(236,72,153,0.09) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', bottom: '10%', left: '-5%',
                    width: '400px', height: '400px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                {/* Dot grid */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(rgba(100,116,139,0.13) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                    pointerEvents: 'none',
                }} />

                {/* ══ Content ══ */}
                <div style={{
                    position: 'relative', zIndex: 2,
                    display: 'flex', alignItems: 'center', gap: '72px',
                    maxWidth: '1080px', width: '100%',
                    flexWrap: 'wrap', justifyContent: 'center',
                }}>

                    {/* Left */}
                    <div style={{ flex: '1 1 360px', maxWidth: '440px' }}>

                        {/* Badge */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '7px',
                            padding: '5px 14px', borderRadius: '20px',
                            background: '#ede9fe',
                            border: '1px solid rgba(139,92,246,0.22)',
                            marginBottom: '22px',
                            animation: 'badgeIn 0.5s ease 0.1s both',
                        }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }} />
                            <span style={{ fontSize: '10px', fontWeight: 600, color: '#5b21b6', fontFamily: FONT, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                AI-Powered Career Analysis
                            </span>
                        </div>

                        {/* Headline */}
                        <h1 style={{
                            fontSize: 'clamp(28px, 4vw, 50px)',
                            fontWeight: 800,
                            color: '#0f172a',
                            lineHeight: 1.12,
                            marginBottom: '18px',
                            fontFamily: FONT,
                            letterSpacing: '-1px',
                        }}>
                            Upload Your Resume.{' '}
                            <span style={{
                                display: 'inline-block',
                                backgroundImage: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)',
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                color: 'transparent',
                            }}>
                                Discover Your
                            </span>{' '}
                            Perfect Career.
                        </h1>

                        <p style={{
                            fontSize: '15px', lineHeight: 1.75,
                            color: '#64748b',
                            marginBottom: '32px', fontFamily: FONT,
                        }}>
                            AI-powered career analysis in seconds. Our intelligent engine scans your resume, matches skills, and recommends the ideal career path for you.
                        </p>

                        {/* CTAs */}
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/resume-analyzer')}
                                style={{
                                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                    border: 'none', color: '#fff',
                                    fontSize: '13px', fontWeight: 600,
                                    borderRadius: '12px', padding: '13px 30px',
                                    cursor: 'pointer', fontFamily: FONT,
                                    boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
                                    transition: 'all 0.25s ease',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 14px 32px rgba(79,70,229,0.45)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,70,229,0.35)';
                                }}
                            >
                                Analyze Resume →
                            </button>
                            <button
                                onClick={() => navigate('/about')}
                                style={{
                                    background: '#fff',
                                    border: '1.5px solid #e2e8f0',
                                    color: '#374151',
                                    fontSize: '13px', fontWeight: 500,
                                    borderRadius: '12px', padding: '12px 24px',
                                    cursor: 'pointer', fontFamily: FONT,
                                    transition: 'all 0.25s ease',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = '#a5b4fc';
                                    e.currentTarget.style.color = '#4f46e5';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                    e.currentTarget.style.color = '#374151';
                                }}
                            >
                                Learn More
                            </button>
                        </div>


                    </div>

                    {/* Right: Pipeline */}
                    <div className="hero-pipeline" style={{
                        flex: '1 1 360px', maxWidth: '490px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                    }}>
                        <ResumeCard phase={phase} />
                        <Connector active={phase >= 2} />
                        <AISlot active={phase >= 2} />
                        <Connector active={phase >= 3} />
                        <CareerCard visible={phase >= 3} />
                    </div>
                </div>

                {/* Wave at bottom — matches white page below */}
                <div style={{ position: 'absolute', bottom: '-1px', left: 0, width: '100%', zIndex: 3, lineHeight: 0, pointerEvents: 'none' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px' }}>
                        <path d="M0,40 C480,60 960,0 1440,40 L1440,60 L0,60 Z" fill="#eef2ff" />
                    </svg>
                </div>
            </div>
        </header>
    );
}
