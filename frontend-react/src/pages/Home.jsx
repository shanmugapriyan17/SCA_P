import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Common/Header';
import Footer from '../components/Common/Footer';
import HeroSection from '../components/Hero/HeroSection';

/* ─────────────────────────────────────────────────
   Entrance animation hook — adds .visible to .up elements
   when they scroll into view (IntersectionObserver)
   ───────────────────────────────────────────────── */
function useUpReveal() {
    const containerRef = useRef(null);
    useEffect(() => {
        const els = containerRef.current?.querySelectorAll('.up');
        if (!els?.length) return;
        const io = new IntersectionObserver(
            (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
            { threshold: 0.15 }
        );
        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);
    return containerRef;
}

/* ─── Inline CSS for .up animation ─── */
const upStyles = `
.up { opacity: 0; transform: translateY(18px); transition: transform .6s cubic-bezier(.2,.9,.3,1), opacity .6s ease; }
.up.visible { opacity: 1; transform: translateY(0); }
.move-on-hover { transition: transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s ease; }
.move-on-hover:hover { transform: translateY(-8px); box-shadow: 0 18px 40px rgba(17,24,39,0.12) !important; }
@keyframes countUp { from { opacity:0; transform: translateY(10px) } to { opacity:1; transform:translateY(0) } }
@keyframes ringFill { from { stroke-dashoffset: 251 } to { stroke-dashoffset: var(--target-offset) } }
@keyframes iconBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
@keyframes iconSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes iconPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:0.85} }
@keyframes statCardIn { from{opacity:0;transform:translateY(28px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
@media (max-width:640px) {
  .hiw-grid { grid-template-columns: 1fr 1fr !important; gap: 20px !important; }
  .hiw-connector { display: none !important; }
  .bfy-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
  .stat-card { flex: 1 1 100% !important; max-width: 100% !important; }
}
@media (min-width:641px) and (max-width:900px) {
  .hiw-grid { grid-template-columns: repeat(2,1fr) !important; gap: 24px !important; }
  .hiw-connector { display: none !important; }
  .bfy-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
}
`;

/* ══ Animated Stats Section ══ */
const STATS = [
    {
        id: 'paths',
        value: 25, suffix: '+',
        label: 'Career Paths',
        desc: 'Discover roles that perfectly match your unique skill set and experience',
        icon: (
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                <circle cx="19" cy="8" r="5" fill="#4f46e5" opacity="0.9" />
                <circle cx="8" cy="30" r="5" fill="#7c3aed" opacity="0.85" />
                <circle cx="30" cy="30" r="5" fill="#a855f7" opacity="0.8" />
                <line x1="19" y1="13" x2="8" y2="25" stroke="#c4b5fd" strokeWidth="2" strokeDasharray="4 2" />
                <line x1="19" y1="13" x2="30" y2="25" stroke="#c4b5fd" strokeWidth="2" strokeDasharray="4 2" />
            </svg>
        ),
        iconAnim: 'iconBounce 2.4s ease-in-out infinite',
        color: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
    },
    {
        id: 'accuracy',
        value: 99, suffix: '%',
        label: 'Accuracy',
        desc: 'Industry-leading precision ensures you receive the most relevant career guidance',
        ring: true,
        color: 'linear-gradient(135deg,#7c3aed,#a855f7)',
    },
    {
        id: 'mentor',
        value: '24/7', suffix: '',
        label: 'AI Mentor',
        desc: 'Get instant, personalized career advice whenever you need it - day or night',
        icon: (
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                <circle cx="19" cy="19" r="14" stroke="#a855f7" strokeWidth="2.5" fill="rgba(168,85,247,0.08)" />
                <line x1="19" y1="10" x2="19" y2="19" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="19" y1="19" x2="25" y2="23" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
                <circle cx="19" cy="19" r="2.5" fill="#4f46e5" />
            </svg>
        ),
        iconAnim: 'iconPulse 2s ease-in-out infinite',
        color: 'linear-gradient(135deg,#a855f7,#ec4899)',
    },
];

/* Count-up hook */
function useCountUp(target, duration = 1800, start = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start || typeof target !== 'number') return;
        let startTime = null;
        const step = (ts) => {
            if (!startTime) startTime = ts;
            const progress = Math.min((ts - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(parseFloat((eased * target).toFixed(target % 1 !== 0 ? 1 : 0)));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [start, target, duration]);
    return count;
}

/* Ring stat */
function AccuracyRing({ active }) {
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (99 / 100) * circumference;
    const count = useCountUp(99, 1800, active);
    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <div style={{ position: 'relative', width: '96px', height: '96px' }}>
                <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(139,92,246,0.12)" strokeWidth="7" />
                    <circle
                        cx="48" cy="48" r="40" fill="none"
                        stroke="url(#ringGrad)" strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={active ? offset : circumference}
                        style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.4,0,0.2,1)' }}
                    />
                    <defs>
                        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#4f46e5" />
                            <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                    </defs>
                </svg>
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <span style={{
                        fontSize: '20px', fontWeight: 800, fontFamily: "'Poppins',sans-serif",
                        background: 'linear-gradient(135deg,#4f46e5,#a855f7)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>{count}%</span>
                </div>
            </div>
        </div>
    );
}

function StatCard({ stat, index, active }) {
    const num = useCountUp(typeof stat.value === 'number' ? stat.value : 0, 1800, active && typeof stat.value === 'number');
    const displayVal = typeof stat.value === 'number' ? num : stat.value;
    return (
        <div
            style={{
                flex: '1 1 260px',
                maxWidth: '340px',
                background: '#fff',
                borderRadius: '20px',
                padding: '36px 28px 32px',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 12px 32px rgba(79,70,229,0.08)',
                border: '1px solid rgba(139,92,246,0.1)',
                animation: active ? `statCardIn 0.65s cubic-bezier(0.4,0,0.2,1) ${index * 0.15}s both` : 'none',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 20px 48px rgba(79,70,229,0.16)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.04), 0 12px 32px rgba(79,70,229,0.08)';
            }}
        >
            {/* Top gradient bar */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                background: stat.color, borderRadius: '20px 20px 0 0',
            }} />

            {/* Icon / Ring — equal height block (96px) */}
            <div style={{ height: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                {stat.ring ? (
                    <AccuracyRing active={active} />
                ) : (
                    <div style={{ animation: active ? stat.iconAnim : 'none' }}>
                        {stat.icon}
                    </div>
                )}
            </div>

            {/* Number — skip for ring since it's inside */}
            {!stat.ring && (
                <div style={{
                    fontSize: '44px', fontWeight: 800,
                    fontFamily: "'Poppins',sans-serif",
                    background: stat.color,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    marginBottom: '6px',
                    letterSpacing: '-1px',
                    lineHeight: 1.1,
                    animation: active ? `countUp 0.5s ease ${index * 0.15}s both` : 'none',
                }}>
                    {displayVal}{stat.suffix}
                </div>
            )}

            <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e1b4b', marginBottom: '10px', fontFamily: "'Poppins',sans-serif" }}>
                {stat.label}
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.7, fontFamily: "'Poppins',sans-serif", margin: 0 }}>
                {stat.desc}
            </p>
        </div>
    );
}

function StatsSection() {
    const ref = useRef(null);
    const [active, setActive] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setActive(true); io.disconnect(); } },
            { threshold: 0.25 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);
    return (
        <section ref={ref} style={{ padding: '0 24px 80px', marginTop: '-56px', position: 'relative', zIndex: 4 }}>
            <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
                <div style={{
                    display: 'flex', gap: '24px',
                    flexWrap: 'wrap', justifyContent: 'center',
                    alignItems: 'stretch',
                }}>
                    {STATS.map((s, i) => <StatCard key={s.id} stat={s} index={i} active={active} />)}
                </div>
            </div>
        </section>
    );
}

function Home() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const ref = useUpReveal();

    const handleGetStarted = () => {
        navigate(isAuthenticated ? '/dashboard' : '/resume-analyzer');
    };

    return (
        <div ref={ref} className="min-h-screen overflow-x-hidden" style={{ background: '#eef2ff', fontFamily: "'Poppins', system-ui, sans-serif" }}>
            <style>{upStyles}</style>
            <Header />

            {/* ═══ ANIMATED HERO ═══ */}
            <HeroSection />


            {/* ═══ ANIMATED STATS ═══ */}
            <StatsSection />


            {/* ═══════════════════════════════════
                FEATURES — What We Offer
               ═══════════════════════════════════ */}
            <section style={{ padding: '80px 0 90px', background: '#eef2ff' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 28px' }}>

                    {/* Heading */}
                    <div className="up" style={{ textAlign: 'center', marginBottom: '56px' }}>
                        <span style={{
                            display: 'inline-block',
                            padding: '4px 16px', borderRadius: '20px',
                            background: '#ede9fe',
                            border: '1px solid rgba(139,92,246,0.2)',
                            fontSize: '11px', fontWeight: 600,
                            color: '#5b21b6', letterSpacing: '0.6px',
                            textTransform: 'uppercase', marginBottom: '14px',
                        }}>Everything you need</span>
                        <h2 style={{
                            fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 800,
                            color: '#1e1b4b', marginBottom: '14px', letterSpacing: '-0.5px',
                            fontFamily: "'Poppins', sans-serif",
                        }}>What We Offer</h2>
                        <p style={{
                            fontSize: '16px', color: '#64748b',
                            lineHeight: 1.75, maxWidth: '520px', margin: '0 auto',
                            fontFamily: "'Poppins', sans-serif",
                        }}>
                            A complete suite of AI-powered tools to navigate your career journey with confidence.
                        </p>
                    </div>

                    {/* Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '24px',
                    }}>
                        {[
                            {
                                icon: 'description',
                                iconBg: '#27272a',
                                accentColor: '#27272a',
                                title: 'Smart Resume Analysis',
                                desc: 'Upload your resume and our System instantly reads, understands, and identifies your professional strengths, skills, and areas for growth.',
                                tags: ['Skill Detection', 'Strength Mapping', 'Gap Analysis', 'Instant Results'],
                            },
                            {
                                icon: 'psychology',
                                iconBg: 'linear-gradient(310deg, #2152ff 0%, #21d4fd 100%)',
                                accentColor: '#2152ff',
                                title: 'Career Prediction',
                                desc: 'Our System analyzes your profile against thousands of career trajectories and recommends the roles where you will thrive.',
                                badge: 'Top 3 best-fit roles',
                                badgeIcon: 'check_circle',
                                badgeColor: '#17c1e8',
                            },
                            {
                                icon: 'smart_toy',
                                iconBg: 'linear-gradient(310deg, #7928ca 0%, #ff0080 100%)',
                                accentColor: '#7928ca',
                                title: 'AI Career CHATBOT',
                                desc: 'Your personal career advisor, available 24/7. Ask about career transitions, interview prep, salary expectations, or upskilling.',
                                chat: true,
                            },
                            {
                                icon: 'analytics',
                                iconBg: 'linear-gradient(310deg, #17ad37 0%, #98ec2d 100%)',
                                accentColor: '#17ad37',
                                title: 'Skill Gap Insights',
                                desc: 'See exactly which skills you need to develop and where you already excel to reach your dream role.',
                                skillBar: true,
                                skillBarColor: 'linear-gradient(90deg, #17ad37, #98ec2d)',
                            },
                            {
                                icon: 'groups',
                                iconBg: 'linear-gradient(310deg, #f53939 0%, #fbcf33 100%)',
                                accentColor: '#f53939',
                                title: 'Mentorship Hub',
                                desc: 'Connect with guidance when you need it most. Book sessions, get advice, and build your personalized career roadmap.',
                                badge: 'Book a Session',
                                badgeIcon: 'calendar_month',
                                badgeColor: '#f53939',
                            },
                            {
                                icon: 'route',
                                iconBg: 'linear-gradient(310deg, #2152ff 0%, #21d4fd 100%)',
                                accentColor: '#2152ff',
                                title: 'Career Roadmap',
                                desc: 'Get a personalized step-by-step growth plan with timelines, milestones, and learning resources tailored to your goals.',
                                tags: ['Learning Path', 'Milestones', 'Resources'],
                            },
                        ].map((feat, i) => (
                            <div
                                key={i}
                                className="up"
                                style={{
                                    background: '#fff',
                                    borderRadius: '20px',
                                    padding: '32px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.03), 0 10px 30px rgba(79,70,229,0.07)',
                                    border: '1px solid rgba(139,92,246,0.08)',
                                    display: 'flex', flexDirection: 'column', gap: '0',
                                    position: 'relative', overflow: 'hidden',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 20px 48px rgba(79,70,229,0.14)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.03), 0 10px 30px rgba(79,70,229,0.07)';
                                }}
                            >
                                {/* Top accent line */}
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                                    background: feat.iconBg, borderRadius: '20px 20px 0 0',
                                }} />

                                {/* Icon */}
                                <div style={{
                                    width: '52px', height: '52px', borderRadius: '14px',
                                    background: feat.iconBg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '20px',
                                    boxShadow: `0 6px 16px ${feat.accentColor}33`,
                                }}>
                                    <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '24px' }}>{feat.icon}</span>
                                </div>

                                {/* Title */}
                                <h3 style={{
                                    fontSize: '17px', fontWeight: 700, color: '#1e1b4b',
                                    marginBottom: '10px', fontFamily: "'Poppins', sans-serif",
                                }}>{feat.title}</h3>

                                {/* Desc */}
                                <p style={{
                                    fontSize: '14px', color: '#64748b', lineHeight: 1.75,
                                    fontFamily: "'Poppins', sans-serif", marginBottom: '18px', flex: 1,
                                }}>{feat.desc}</p>

                                {/* Tags */}
                                {feat.tags && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {feat.tags.map(t => (
                                            <span key={t} style={{
                                                padding: '4px 12px', borderRadius: '6px',
                                                background: '#ede9fe', fontSize: '11px',
                                                fontWeight: 600, color: '#5b21b6',
                                                fontFamily: "'Poppins', sans-serif",
                                            }}>{t}</span>
                                        ))}
                                    </div>
                                )}

                                {/* Chat preview */}
                                {feat.chat && (
                                    <div style={{
                                        background: '#f8f7ff', borderRadius: '12px',
                                        padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px',
                                        border: '1px solid rgba(139,92,246,0.1)',
                                    }}>
                                        <div style={{
                                            alignSelf: 'flex-end', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                                            color: '#fff', fontSize: '12px', padding: '8px 12px',
                                            borderRadius: '12px 12px 2px 12px', maxWidth: '85%',
                                            fontFamily: "'Poppins', sans-serif",
                                        }}>How can I switch to product management?</div>
                                        <div style={{
                                            alignSelf: 'flex-start', background: '#fff',
                                            color: '#374151', fontSize: '12px', padding: '8px 12px',
                                            borderRadius: '12px 12px 12px 2px', maxWidth: '85%',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                                            fontFamily: "'Poppins', sans-serif",
                                        }}>Great question! Here are 3 steps to start...</div>
                                    </div>
                                )}

                                {/* Skill bar */}
                                {feat.skillBar && (
                                    <div>
                                        <div style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            fontSize: '11px', color: '#94a3b8', fontWeight: 500,
                                            marginBottom: '6px', fontFamily: "'Poppins', sans-serif",
                                        }}>
                                            <span>Required</span><span>Your Level</span>
                                        </div>
                                        <div style={{ height: '7px', background: '#ede9fe', borderRadius: '100px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%', width: '65%', borderRadius: '100px',
                                                background: 'linear-gradient(90deg,#4f46e5,#a855f7)',
                                            }} />
                                        </div>
                                    </div>
                                )}

                                {/* Badge / CTA */}
                                {feat.badge && (
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                                        color: feat.badgeColor || feat.accentColor,
                                        fontSize: '13px', fontWeight: 600,
                                        fontFamily: "'Poppins', sans-serif",
                                    }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>{feat.badgeIcon}</span>
                                        {feat.badge}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* ════════════════════════════════
                HOW IT WORKS
               ════════════════════════════════ */}
            <section style={{
                padding: '90px 0 100px',
                background: '#fff',
                position: 'relative',
            }}>
                {/* Dot grid background */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(rgba(79,70,229,0.08) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                    pointerEvents: 'none',
                }} />

                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 28px', position: 'relative', zIndex: 1 }}>

                    {/* Heading */}
                    <div className="up" style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <span style={{
                            display: 'inline-block',
                            padding: '4px 16px', borderRadius: '20px',
                            background: '#ede9fe',
                            border: '1px solid rgba(139,92,246,0.2)',
                            fontSize: '11px', fontWeight: 600,
                            color: '#5b21b6', letterSpacing: '0.6px',
                            textTransform: 'uppercase', marginBottom: '14px',
                        }}>Simple Process</span>
                        <h2 style={{
                            fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 800,
                            color: '#1e1b4b', marginBottom: '12px', letterSpacing: '-0.5px',
                            fontFamily: "'Poppins', sans-serif",
                        }}>How It Works</h2>
                        <p style={{
                            fontSize: '16px', color: '#64748b',
                            lineHeight: 1.75, maxWidth: '480px', margin: '0 auto',
                            fontFamily: "'Poppins', sans-serif",
                        }}>Four simple steps to your personalized career roadmap.</p>
                    </div>

                    {/* Steps row */}
                    <div className="hiw-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '0',
                        position: 'relative',
                    }}>
                        {[
                            { icon: 'upload_file', title: 'Upload Resume', desc: 'Upload your resume — we accept PDF and text formats.', bg: '#27272a', num: '01', tint: '#f8f8f8' },
                            { icon: 'auto_awesome', title: 'System Analysis', desc: 'Our System reads your resume and maps out your full professional profile.', bg: 'linear-gradient(310deg, #2152ff 0%, #21d4fd 100%)', num: '02', tint: '#eff8ff' },
                            { icon: 'explore', title: 'Discover Paths', desc: 'See your top career matches ranked by how well they fit your profile.', bg: 'linear-gradient(310deg, #17ad37 0%, #98ec2d 100%)', num: '03', tint: '#f0fff4' },
                            { icon: 'route', title: 'Take Action', desc: 'Get a personalized growth plan and start building toward your dream career.', bg: 'linear-gradient(310deg, #f53939 0%, #fbcf33 100%)', num: '04', tint: '#fffbf0' },
                        ].map((step, i, arr) => (
                            <div key={i} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px' }}>

                                {/* Dashed connector line between steps */}
                                {i < arr.length - 1 && (
                                    <div className="hiw-connector" style={{
                                        position: 'absolute',
                                        top: '52px',
                                        left: 'calc(50% + 52px)',
                                        right: 'calc(-50% + 52px)',
                                        height: '2px',
                                        borderTop: '2px dashed rgba(139,92,246,0.25)',
                                        zIndex: 0,
                                    }} />
                                )}

                                {/* Step number badge */}
                                <div style={{
                                    fontSize: '11px', fontWeight: 800,
                                    color: '#a5b4fc',
                                    fontFamily: "'Poppins', sans-serif",
                                    letterSpacing: '1px',
                                    marginBottom: '12px',
                                }}>STEP {step.num}</div>

                                {/* Icon */}
                                <div style={{
                                    position: 'relative', zIndex: 1,
                                    width: '80px', height: '80px', borderRadius: '22px',
                                    background: step.bg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 8px 28px rgba(0,0,0,0.14)',
                                    marginBottom: '24px',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    cursor: 'default',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.18)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.14)'; }}
                                >
                                    <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '34px' }}>{step.icon}</span>
                                </div>

                                {/* Text card */}
                                <div style={{
                                    background: step.tint,
                                    borderRadius: '16px',
                                    padding: '20px 18px',
                                    textAlign: 'center',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    width: '100%',
                                }}>
                                    <h3 style={{
                                        fontSize: '16px', fontWeight: 700,
                                        color: '#1e1b4b', marginBottom: '8px',
                                        fontFamily: "'Poppins', sans-serif",
                                    }}>{step.title}</h3>
                                    <p style={{
                                        fontSize: '13px', color: '#64748b',
                                        lineHeight: 1.7, margin: 0,
                                        fontFamily: "'Poppins', sans-serif",
                                    }}>{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* ═══════════════════
                BUILT FOR YOU
               ═══════════════════ */}
            <section style={{ padding: '80px 0', background: '#fff' }}>
                <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '0 28px' }}>
                    <div
                        className="bfy-grid up"
                        style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px',
                            alignItems: 'center',
                        }}
                    >
                        {/* Left — Text */}
                        <div>
                            <p style={{
                                fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px',
                                textTransform: 'uppercase', color: '#6366f1',
                                marginBottom: '12px', fontFamily: "'Poppins', sans-serif",
                            }}>Built for your growth</p>
                            <h2 style={{
                                fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800,
                                color: '#111827', lineHeight: 1.25, marginBottom: '20px',
                                letterSpacing: '-0.4px', fontFamily: "'Poppins', sans-serif",
                            }}>Everything you need to navigate your career with confidence</h2>
                            <p style={{
                                fontSize: '15px', color: '#6b7280', lineHeight: 1.8,
                                fontFamily: "'Poppins', sans-serif", marginBottom: '28px',
                            }}>
                                Smart Career Advisor brings together AI-powered resume analysis, career path prediction, real-time skill tracking, and a 24/7 AI mentor into one seamless platform — designed to give you clarity at every career stage.
                            </p>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                fontSize: '13px', fontWeight: 600, color: '#4f46e5',
                                fontFamily: "'Poppins', sans-serif", cursor: 'pointer',
                            }}>
                                Get started free
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                            </div>
                        </div>

                        {/* Right — Feature Checklist */}
                        <div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[
                                    'System reads and understands your full resume in seconds',
                                    'Matches your skills to the best-fit career roles',
                                    'Identifies skill gaps and suggests what to learn',
                                    'Personalised career roadmap with clear milestones',
                                    '24/7 AI mentor for career questions and guidance',
                                    'Book mentorship sessions with industry professionals',
                                    'Resume scoring with actionable improvement tips',
                                    'Private, secure, and built with your data in mind',
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                        <div style={{
                                            width: '20px', height: '20px', borderRadius: '50%',
                                            background: '#eef2ff',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0, marginTop: '1px',
                                        }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '13px', color: '#4f46e5' }}>check</span>
                                        </div>
                                        <span style={{
                                            fontSize: '14px', color: '#374151', lineHeight: 1.6,
                                            fontFamily: "'Poppins', sans-serif",
                                        }}>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>





            {/* ══════════════════════════════════════════════
                CTA
               ══════════════════════════════════════════════ */}
            <section style={{ padding: '80px 0', background: '#fff' }}>
                <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 24px' }}>
                    <div
                        className="up cta-section"
                        style={{
                            background: '#27272a',
                            borderRadius: '16px',
                            padding: '64px 48px',
                            textAlign: 'center',
                            boxShadow: '0 20px 27px 0 rgba(0,0,0,0.15)',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '320px', height: '320px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', filter: 'blur(80px)', transform: 'translate(40%, -50%)' }}></div>
                        <h2 className="cta-heading" style={{ fontSize: '36px', fontWeight: 700, color: '#fff', marginBottom: '16px', position: 'relative', zIndex: 1 }}>Ready to discover your path?</h2>
                        <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(255,255,255,0.6)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px', position: 'relative', zIndex: 1, lineHeight: 1.7 }}>
                            Join thousands of professionals who found clarity and direction through personalized AI career guidance.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                            <button
                                onClick={() => navigate('/resume-analyzer')}
                                style={{
                                    background: '#fff', color: '#27272a',
                                    fontSize: '12px', fontWeight: 700,
                                    borderRadius: '999px', padding: '12px 40px',
                                    border: 'none', cursor: 'pointer',
                                    boxShadow: '0 4px 7px -1px rgba(0,0,0,.11)',
                                    transition: 'all .25s ease',
                                    letterSpacing: '0.5px',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(0,0,0,.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 7px -1px rgba(0,0,0,.11)';
                                }}
                            >
                                Start Free Analysis
                            </button>
                            <Link
                                to="/about"
                                style={{
                                    color: 'rgba(255,255,255,0.8)',
                                    fontSize: '12px', fontWeight: 700,
                                    borderRadius: '999px', padding: '12px 40px',
                                    border: '1px solid rgba(255,255,255,0.25)',
                                    textDecoration: 'none',
                                    transition: 'all .25s ease',
                                    letterSpacing: '0.5px',
                                }}
                            >
                                About Us
                            </Link>
                        </div>
                    </div>
                </div>
            </section>


            {/* ═══════ FOOTER ═══════ */}
            <Footer />
        </div>
    );
}

export default Home;
