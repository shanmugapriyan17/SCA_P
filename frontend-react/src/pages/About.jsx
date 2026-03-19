import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Common/Header';
import Footer from '../components/Common/Footer';

/* ── Design tokens ── */
const IND = '#4f46e5';
const VIO = '#7c3aed';
const FONT = "'Poppins', system-ui, sans-serif";

const TABS = [
    { id: 'about-me', label: 'The Creator', icon: 'person' },
    { id: 'about-project', label: 'The Project', icon: 'rocket_launch' },
    { id: 'how-it-works', label: 'How It Works', icon: 'integration_instructions' },
    { id: 'ai-career-tips', label: 'AI Career Tips', icon: 'lightbulb' },
    { id: 'learning-platform', label: 'Learning Hub', icon: 'school' },
    { id: 'privacy-policy', label: 'Privacy Policy', icon: 'policy' },
    { id: 'terms', label: 'Terms of Service', icon: 'gavel' },
    { id: 'data-security', label: 'Data & Security', icon: 'shield_locked' },
];

export default function About() {
    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(tabParam || 'about-me');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        if (tabParam) setActiveTab(tabParam);
    }, [tabParam]);

    useEffect(() => {
        const fn = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', fn);
        return () => window.removeEventListener('resize', fn);
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#f8f9ff 0%,#f0f2ff 50%,#f8f4ff 100%)', fontFamily: FONT }}>
            <Header />

            <style>{`
                @keyframes fadeUp { from{opacity:0;transform:translateY(15px)} to{opacity:1;transform:translateY(0)} }
                .tab-content { animation: fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both; }
                .tab-btn:hover { background: rgba(79,70,229,0.05); color: ${IND}; }
                .foot-link:hover { color: ${IND}; text-decoration: underline; }
            `}</style>

            <main style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '88px 16px 24px' : '96px 24px 32px' }}>

                {/* ── Page hero header ── */}
                <div style={{
                    background: `linear-gradient(135deg,${IND},${VIO})`,
                    borderRadius: '24px',
                    padding: isMobile ? '32px 24px' : '48px 40px',
                    marginBottom: '32px',
                    position: 'relative',
                    overflow: 'hidden',
                    textAlign: 'center',
                    boxShadow: '0 10px 30px rgba(79,70,229,0.2)'
                }}>
                    <div style={{ position: 'absolute', top: '-40px', left: '-20px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%', filter: 'blur(20px)' }} />
                    <div style={{ position: 'absolute', bottom: '-50px', right: '10%', width: '160px', height: '160px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%', filter: 'blur(20px)' }} />

                    <div style={{ position: 'relative' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', marginBottom: '16px' }}>
                            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '32px' }}>info</span>
                        </div>
                        <h1 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: 900, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
                            About Smart Career Advisor
                        </h1>
                        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                            Empowering professionals to discover their ideal career paths with intelligent, data-driven personalized guidance.
                        </p>
                    </div>
                </div>

                {/* ── Layout Grid ── */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '260px 1fr', gap: '32px', alignItems: 'start' }}>

                    {/* Sidebar Nav */}
                    <div style={{
                        background: '#fff',
                        borderRadius: '20px',
                        border: '1px solid #e0e7ff',
                        padding: '12px',
                        boxShadow: '0 4px 24px rgba(79,70,229,0.06)',
                        position: isMobile ? 'static' : 'sticky',
                        top: '100px',
                        display: isMobile ? 'flex' : 'block',
                        overflowX: isMobile ? 'auto' : 'visible',
                        gap: isMobile ? '8px' : '0',
                        scrollbarWidth: 'none'
                    }}>
                        {TABS.map((tab) => {
                            const active = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    className="tab-btn"
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        width: isMobile ? 'auto' : '100%',
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: active ? `linear-gradient(135deg,${IND},${VIO})` : 'transparent',
                                        color: active ? '#fff' : '#475569',
                                        fontSize: '14px', fontWeight: 600,
                                        fontFamily: FONT, cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        marginBottom: isMobile ? 0 : '8px',
                                        whiteSpace: 'nowrap',
                                        boxShadow: active ? '0 4px 12px rgba(79,70,229,0.3)' : 'none',
                                        flexShrink: 0
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content Area */}
                    <div style={{
                        background: '#fff',
                        borderRadius: '24px',
                        border: '1px solid #e0e7ff',
                        boxShadow: '0 4px 24px rgba(79,70,229,0.06)',
                        overflow: 'hidden',
                        minHeight: '500px'
                    }}>

                        {/* ── TAB 1: The Creator ── */}
                        {activeTab === 'about-me' && (
                            <div className="tab-content" style={{ padding: isMobile ? '32px 24px' : '48px' }}>
                                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'flex-start', gap: '32px', marginBottom: '40px' }}>

                                    {/* Avatar Card */}
                                    <div style={{ position: 'relative', flexShrink: 0 }}>
                                        <div style={{ width: '160px', height: '160px', borderRadius: '32px', overflow: 'hidden', border: '6px solid #f8faff', boxShadow: '0 12px 32px rgba(79,70,229,0.15)', transform: 'rotate(-2deg)' }}>
                                            <img src="/IMG/rathideviIMG.jpg" alt="Rathidevi S" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', width: '40px', height: '40px', borderRadius: '12px', background: `linear-gradient(135deg,${IND},${VIO})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(79,70,229,0.4)', transform: 'rotate(5deg)' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>verified</span>
                                        </div>
                                    </div>

                                    {/* Bio Header */}
                                    <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                                        <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>Rathidevi S</h2>
                                        <p style={{ fontSize: '15px', color: IND, fontWeight: 700, margin: '0 0 12px' }}>Creator & Lead Designer</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: isMobile ? 'center' : 'flex-start', color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>school</span>
                                            ME, Christian College of Engineering and Technology
                                        </div>

                                        {/* Badges */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                                            {[
                                                { label: 'Product Design', bg: '#fdf4ff', color: '#c026d3', border: '#fbcfe8' },
                                                { label: 'Career Research', bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
                                                { label: 'User Experience', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
                                            ].map(badge => (
                                                <span key={badge.label} style={{ padding: '6px 14px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                                                    {badge.label}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Bio Content */}
                                <div style={{ color: '#334155', fontSize: '15px', lineHeight: 1.8 }}>
                                    <p style={{ marginBottom: '16px' }}>
                                        Smart Career Advisor was founded and engineered by <strong>Rathidevi S</strong>, a passionate technologist and data enthusiast dedicated to bridging the gap between talent and opportunity. With a comprehensive background in Engineering from Christian College of Engineering and Technology, Rathidevi recognized early on that the traditional job search process was fundamentally broken—often leaving brilliant candidates lost in a sea of generic advice.
                                    </p>
                                    <p style={{ marginBottom: '24px' }}>
                                        Driven by the belief that every professional deserves a clear, data-backed roadmap to success, she combined advanced machine learning techniques with deep industry research to architect a platform that doesn't just read resumes, but truly understands the unique narrative behind every career path.
                                    </p>

                                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '32px 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="material-symbols-outlined" style={{ color: IND }}>explore</span> The Vision & The Journey
                                    </h3>
                                    <div style={{ padding: '28px', background: '#f8faff', borderRadius: '20px', border: '1px solid #e0e7ff', position: 'relative', boxShadow: 'inset 0 2px 10px rgba(79,70,229,0.02)' }}>
                                        <span style={{ position: 'absolute', top: '10px', left: '16px', fontSize: '50px', color: '#e0e7ff', fontFamily: 'serif', lineHeight: 1 }}>"</span>
                                        <div style={{ position: 'relative', zIndex: 1 }}>
                                            <p style={{ margin: '0 0 12px' }}>
                                                We started with a singular, ambitious vision: to democratize career intelligence. For too long, premium career coaching and actionable market insights have been locked behind expensive paywalls or exclusive networks.
                                            </p>
                                            <p style={{ margin: 0 }}>
                                                By extensively analyzing thousands of career trajectories, skill matrices, and success stories, we've built a system that democratizes this knowledge. Smart Career Advisor is more than just a tool—it's a personalized career mentor that evolves with you, ensuring that you're always one step ahead in an ever-changing job market.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── TAB 2: The Project ── */}
                        {activeTab === 'about-project' && (
                            <div className="tab-content" style={{ padding: isMobile ? '32px 24px' : '48px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: IND }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>rocket_launch</span>
                                    </div>
                                    <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Project Overview</h2>
                                </div>
                                <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.7, marginBottom: '20px' }}>
                                    Smart Career Advisor isn't just another job board or generic resume scanner. It is an intelligent, context-aware ecosystem designed to empower professionals by decoding the complex DNA of modern career paths.
                                </p>
                                <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.7, marginBottom: '40px' }}>
                                    By leveraging state-of-the-art natural language processing and advanced skills mapping, our engine analyzes your unique experiences, identifies hidden strengths, and cross-references them against real-world industry demands. Whether you're a fresh graduate looking for direction, or a seasoned professional planning a strategic pivot, our platform provides the actionable intelligence required to make confident, data-driven decisions.
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '48px' }}>
                                    {[
                                        { title: 'Smart Resume Reading', desc: 'Upload your resume and we instantly identify your strengths and expertise.', icon: 'description', ind: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
                                        { title: 'Career Matching', desc: 'Our AI compares your profile against thousands of trajectories for predictions.', icon: 'psychology', ind: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
                                        { title: 'Personalized Guidance', desc: 'Receive role recommendations ranked by how well they match your profile.', icon: 'recommend', ind: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
                                        { title: 'Skill Gap Insights', desc: 'See exactly which skills to develop and where you already excel.', icon: 'analytics', ind: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
                                    ].map((feat) => (
                                        <div key={feat.title} style={{ padding: '24px', borderRadius: '20px', background: '#fff', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: feat.bg, border: `1px solid ${feat.border}`, color: feat.ind, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{feat.icon}</span>
                                            </div>
                                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>{feat.title}</h3>
                                            <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>{feat.desc}</p>
                                        </div>
                                    ))}
                                </div>

                                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>Key Capabilities</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {['Resume Analysis', 'Career Prediction', 'Skill Mapping', 'AI Mentor', 'Growth Planning', 'Mentorship Hub', 'Analytics', 'Role Matching', 'Insights'].map(cap => (
                                        <span key={cap} style={{ padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#475569', background: '#f8fafc', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                                            {cap}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── NEW TAB: How It Works ── */}
                        {activeTab === 'how-it-works' && (
                            <div className="tab-content" style={{ padding: isMobile ? '32px 24px' : '48px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: IND }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>integration_instructions</span>
                                    </div>
                                    <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0 }}>How It Works</h2>
                                </div>
                                <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.7, marginBottom: '40px' }}>
                                    Smart Career Advisor uses advanced Machine Learning and NLP to parse your professional history and provide actionable next steps. Here is how the engine works behind the scenes.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {[
                                        { step: '1', title: 'Resume Ingestion & Parsing', desc: 'When you upload your resume, our NLP algorithms extract key entities—skills, experience, education, and achievements—structuring the unstructured data.' },
                                        { step: '2', title: 'Data Cross-Referencing', desc: 'We cross-reference your extracted skills against a continuously updated database of industry demands, mapped across various roles (e.g., Data Engineer, Frontend Developer).' },
                                        { step: '3', title: 'Similarity Scoring', desc: 'Using cosine similarity and advanced matching algorithms, we calculate a percentage fit for numerous roles, identifying where your profile overlaps most naturally.' },
                                        { step: '4', title: 'Gap Analysis & Recommendations', desc: 'For roles you are working towards, the AI identifies missing skills and recommends specific learning paths or courses to bridge the gap.' },
                                    ].map(item => (
                                        <div key={item.step} style={{ display: 'flex', gap: '20px', padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `linear-gradient(135deg,${IND},${VIO})`, color: '#fff', fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {item.step}
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>{item.title}</h4>
                                                <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── NEW TAB: AI Career Tips ── */}
                        {activeTab === 'ai-career-tips' && (
                            <div className="tab-content" style={{ padding: isMobile ? '32px 24px' : '48px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>lightbulb</span>
                                    </div>
                                    <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0 }}>AI Career Tips</h2>
                                </div>
                                <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.7, marginBottom: '32px' }}>
                                    Optimize your profile to stand out to both AI screening tools (ATS) and human recruiters.
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
                                    {[
                                        { title: 'Use Industry Keywords', tip: 'AI systems scan for specific technical terminology. Mirror the language used in job descriptions for the roles you want.' },
                                        { title: 'Quantify Achievements', tip: 'Instead of "improved performance", write "improved API response time by 40%". Numbers are easily parsed and highly valued.' },
                                        { title: 'Avoid Complex Formatting', tip: 'Heavy graphics, columns, and unusual fonts can break ATS parsers. Stick to clean, single-column layouts for maximum compatibility.' },
                                        { title: 'Show Continual Learning', tip: 'Regularly updated skills show adaptability. Include recent certifications and relevant side projects.' }
                                    ].map((tip, i) => (
                                        <div key={i} style={{ padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                <span className="material-symbols-outlined" style={{ color: '#d97706', fontSize: '20px' }}>check_circle</span>
                                                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{tip.title}</h4>
                                            </div>
                                            <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>{tip.tip}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── TAB 3: Learning Hub ── */}
                        {activeTab === 'learning-platform' && (
                            <div className="tab-content" style={{ padding: isMobile ? '32px 24px' : '48px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>school</span>
                                    </div>
                                    <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Learning Hub</h2>
                                </div>
                                <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.6, marginBottom: '40px' }}>
                                    Maximize your results with our structured 4-step guide. Let data drive your next career move.
                                </p>

                                <div style={{ position: 'relative' }}>
                                    {/* Vertical connecting line */}
                                    <div style={{ position: 'absolute', left: '23px', top: '24px', bottom: '24px', width: '2px', background: '#e2e8f0', zIndex: 0 }} />

                                    {[
                                        { step: 1, title: 'Optimize Your Resume', desc: 'Include all relevant skills. Detailed resumes yield better accuracy in our AI models.' },
                                        { step: 2, title: 'Understand Your Skills', desc: 'Review extracted skills. Our system identifies both technical and soft skills meticulously.' },
                                        { step: 3, title: 'Analyze Recommendations', desc: 'Review your top career matches and compare how each role fits your unique profile.' },
                                        { step: 4, title: 'Create a Growth Plan', desc: 'Use the skill gap analysis to target your personalized learning path.' },
                                    ].map((item, i) => (
                                        <div key={item.step} style={{ display: 'flex', gap: '24px', marginBottom: i === 3 ? 0 : '32px', position: 'relative', zIndex: 1 }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: `linear-gradient(135deg,${IND},${VIO})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 900, flexShrink: 0, boxShadow: '0 4px 12px rgba(79,70,229,0.3)', border: '4px solid #fff' }}>
                                                {item.step}
                                            </div>
                                            <div style={{ paddingTop: '4px' }}>
                                                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>{item.title}</h4>
                                                <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.6, maxWidth: '500px' }}>{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── NEW TAB: Privacy Policy ── */}
                        {activeTab === 'privacy-policy' && (
                            <div className="tab-content" style={{ padding: isMobile ? '32px 24px' : '48px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#fdf4ff,#fae8ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c026d3' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>policy</span>
                                    </div>
                                    <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Privacy Policy</h2>
                                </div>
                                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, marginBottom: '24px' }}>
                                    At Smart Career Advisor, your privacy is our priority. We are committed to protecting the personal and professional data you share with us.
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {[
                                        { title: 'Information Collection', text: 'We collect information you explicitly provide, including your resume data, name, and contact details, solely to provide personalized career advice.' },
                                        { title: 'How We Use Your Data', text: 'Your data is used exclusively to generate career predictions, skill gap analyses, and mentorship session context. We do not use your data to train public AI models.' },
                                        { title: 'Information Sharing', text: 'We do not sell, trade, or rent your personal information to third parties. Your data is strictly confidential.' },
                                        { title: 'Your Rights', text: 'You have the right to access, modify, or permanently delete your account and all associated data at any time via your dashboard settings.' },
                                    ].map((item, i) => (
                                        <div key={i} style={{ borderLeft: `3px solid ${IND}`, paddingLeft: '20px' }}>
                                            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>{item.title}</h4>
                                            <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>{item.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── TAB 4: Terms of Service ── */}
                        {activeTab === 'terms' && (
                            <div className="tab-content" style={{ padding: isMobile ? '32px 24px' : '48px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#fff1f2,#ffe4e6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>gavel</span>
                                    </div>
                                    <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Terms of Service</h2>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {[
                                        { num: '1', title: 'Acceptance of Terms', text: 'By accessing and using Smart Career Advisor, you accept and agree to be bound by the terms and provision of this agreement.' },
                                        { num: '2', title: 'Account Registration', text: 'You may be required to register for an account to access certain features. You must provide accurate, current, and complete information during the registration process.' },
                                        { num: '3', title: 'Service Limitations', text: 'Our AI predictions are algorithmic estimates based on available data. They are provided for guidance purposes only and do not guarantee employment or specific career outcomes.' },
                                        { num: '4', title: 'User Conduct', text: 'You agree not to use the platform for any unlawful purpose or in any way that interrupts, damages, or impairs the service.' },
                                    ].map(item => (
                                        <div key={item.num} style={{ display: 'flex', gap: '16px', padding: '20px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#94a3b8', width: '24px', flexShrink: 0 }}>0{item.num}.</div>
                                            <div>
                                                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>{item.title}</h4>
                                                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>{item.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div id="contact" style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #e2e8f0' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Contact & Connect</h3>

                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
                                        {/* Contact Card */}
                                        <div style={{ padding: '24px', background: 'linear-gradient(to right bottom, #f0f9ff, #e0f2fe)', borderRadius: '16px', border: '1px solid #bae6fd' }}>
                                            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0369a1', margin: '0 0 16px' }}>Get in Touch</h4>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <a href="mailto:rathideviruku@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0284c7', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '10px', background: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(2,132,199,0.08)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>mail</span>
                                                    rathideviruku@gmail.com
                                                </a>

                                                <a href="tel:6381849414" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0284c7', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '10px', background: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(2,132,199,0.08)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>call</span>
                                                    +91 6381849414
                                                </a>
                                            </div>
                                        </div>

                                        {/* Social Links Card */}
                                        <div style={{ padding: '24px', background: 'linear-gradient(to right bottom, #f5f3ff, #ede9fe)', borderRadius: '16px', border: '1px solid #ddd6fe' }}>
                                            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#6d28d9', margin: '0 0 16px' }}>Around the Web</h4>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <a href="http://linkedin.com/in/rathidevi-s-bb9a51289" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#5b21b6', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '10px', background: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(109,40,217,0.08)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>link</span>
                                                    LinkedIn Profile
                                                </a>

                                                <a href="https://github.com/Rathidevi28" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#5b21b6', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '10px', background: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(109,40,217,0.08)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>code</span>
                                                    GitHub Profile
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── NEW TAB: Data & Security ── */}
                        {activeTab === 'data-security' && (
                            <div className="tab-content" style={{ padding: isMobile ? '32px 24px' : '48px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>shield_locked</span>
                                    </div>
                                    <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Data & Security</h2>
                                </div>

                                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
                                    <p style={{ margin: 0, fontSize: '15px', color: '#475569', lineHeight: 1.7 }}>
                                        Enterprise-grade security for your personal career data. We employ industry-standard security protocols to ensure your data remains safe, secure, and entirely under your control.
                                    </p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
                                    {[
                                        { icon: 'lock', title: 'End-to-End Encryption', text: 'All data transmitted between your browser and our servers is encrypted using TLS 1.2+ protocols.' },
                                        { icon: 'database', title: 'Secure Storage', text: 'Resumes and user data are stored in secure, SOC2-compliant cloud databases with strict access controls.' },
                                        { icon: 'verified_user', title: 'Authentication', text: 'We utilize JWT (JSON Web Tokens) for secure, stateless authentication sessions that protect your account.' },
                                        { icon: 'delete_forever', title: 'Data Deletion', text: 'When you delete a resume or your account, all associated data is permanently hard-deleted from our systems.' }
                                    ].map((sec, i) => (
                                        <div key={i} style={{ padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                            <div style={{ padding: '10px', background: '#f0fdf4', borderRadius: '10px', color: '#16a34a' }}>
                                                <span className="material-symbols-outlined">{sec.icon}</span>
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>{sec.title}</h4>
                                                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>{sec.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* ── Footer ── */}
            <Footer />
        </div>
    );
}
