import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Common/Header';
import api from '../api/client';
import AuthModal from '../components/Auth/AuthModal';
import OverviewTab from '../components/Dashboard/OverviewTab';
import SkillMatrixTab from '../components/Dashboard/SkillMatrixTab';
import GrowthPathTab from '../components/Dashboard/GrowthPathTab';
import AssessmentTab from '../components/Dashboard/AssessmentTab';
import ProfileTab from '../components/Dashboard/ProfileTab';

const FONT = "'Poppins', system-ui, sans-serif";
const IND = '#4f46e5';
const VIO = '#7c3aed';

const TABS = [
    { id: 'overview', icon: 'space_dashboard', label: 'Overview' },
    { id: 'skills', icon: 'hub', label: 'Skill Matrix' },
    { id: 'growth', icon: 'trending_up', label: 'Growth Path' },
    { id: 'assessment', icon: 'quiz', label: 'Assessment' },
    { id: 'profile', icon: 'person', label: 'My Profile' },
];

function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < breakpoint);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, [breakpoint]);
    return isMobile;
}

function Dashboard() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [showAuth, setShowAuth] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [skillScores, setSkillScores] = useState({});
    const [assessmentHistory, setAssessmentHistory] = useState([]);
    const [profileData, setProfileData] = useState(null);
    const [resumeInfo, setResumeInfo] = useState(null);
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => { if (!isAuthenticated) setShowAuth(true); }, [isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) return;
        const load = async () => {
            try {
                const [profileRes, assessRes, historyRes, resumeRes] = await Promise.allSettled([
                    api.get('/api/profile'),
                    api.get('/api/assessment/results'),
                    api.get('/api/assessment/history'),
                    api.get('/api/profile/resume'),
                ]);
                if (profileRes.status === 'fulfilled') setProfileData(profileRes.value.data.user);
                if (assessRes.status === 'fulfilled') setSkillScores(assessRes.value.data.scores || {});
                if (historyRes.status === 'fulfilled') setAssessmentHistory(historyRes.value.data.history || []);
                if (resumeRes.status === 'fulfilled') setResumeInfo(resumeRes.value.data.resume);
            } catch (e) { console.error('Dashboard load error:', e); }
            setDataLoaded(true);
        };
        load();
    }, [isAuthenticated]);

    const userName = user?.username || user?.name || profileData?.full_name || 'User';
    const assessedSkillCount = Object.keys(skillScores).length;
    const avgScore = assessedSkillCount > 0 ? Math.round(Object.values(skillScores).reduce((a, b) => a + b, 0) / assessedSkillCount) : 0;
    const careerMatch = avgScore || 0;
    const predictedRole = avgScore >= 70 ? 'Data Scientist' : avgScore >= 50 ? 'Backend Developer' : 'Career Explorer';

    const saveAssessment = async (skill, score, answers) => {
        setSkillScores(prev => ({ ...prev, [skill]: score }));
        try {
            await api.post('/api/assessment/submit', { skill, score, answers });
            const histRes = await api.get('/api/assessment/history');
            if (histRes.data.history) setAssessmentHistory(histRes.data.history);
        } catch (e) { console.error('Save assessment error:', e); }
    };

    if (!isAuthenticated && !showAuth) return null;

    const tabProps = { userName, careerMatch, predictedRole, skillScores, setSkillScores, assessmentHistory, profileData, setProfileData, resumeInfo, setResumeInfo, saveAssessment, assessedSkillCount, dataLoaded, isMobile, setActiveTab };

    const renderTab = () => {
        switch (activeTab) {
            case 'overview': return <OverviewTab {...tabProps} />;
            case 'skills': return <SkillMatrixTab {...tabProps} />;
            case 'growth': return <GrowthPathTab {...tabProps} />;
            case 'assessment': return <AssessmentTab {...tabProps} />;
            case 'profile': return <ProfileTab {...tabProps} />;
            default: return null;
        }
    };

    const selectTab = (id) => { setActiveTab(id); if (isMobile) setSidebarOpen(false); };

    const sidebarWidth = isMobile ? '260px' : '220px';

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: FONT, overflowX: 'hidden' }}>
            <Header />
            <div style={{ display: 'flex', paddingTop: '88px' }}>

                {/* Mobile hamburger */}
                {isMobile && (
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
                        position: 'fixed', top: '94px', left: '12px', zIndex: 201,
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: sidebarOpen ? '#eef2ff' : '#fff', border: '1px solid #e5e7eb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '22px', color: IND }}>{sidebarOpen ? 'close' : 'menu'}</span>
                    </button>
                )}

                {/* Overlay (mobile) */}
                {isMobile && sidebarOpen && (
                    <div onClick={() => setSidebarOpen(false)} style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 149,
                        backdropFilter: 'blur(2px)', transition: 'opacity 0.3s',
                    }} />
                )}

                {/* Sidebar */}
                <aside style={{
                    width: sidebarWidth, flexShrink: 0,
                    position: 'fixed', top: '88px', left: isMobile ? (sidebarOpen ? '0' : `-${sidebarWidth}`) : '0',
                    bottom: 0, background: '#fff', borderRight: '1px solid #f0f0f8',
                    display: 'flex', flexDirection: 'column', padding: '20px 12px',
                    zIndex: 150, overflowY: 'auto',
                    transition: 'left 0.3s ease',
                    boxShadow: isMobile && sidebarOpen ? '4px 0 20px rgba(0,0,0,0.1)' : 'none',
                }}>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', letterSpacing: '1px', textTransform: 'uppercase', padding: '0 8px', marginBottom: '8px' }}>Navigation</p>
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => selectTab(tab.id)} style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px',
                            fontSize: '13px', fontWeight: activeTab === tab.id ? 600 : 400,
                            color: activeTab === tab.id ? IND : '#6b7280',
                            background: activeTab === tab.id ? '#eef2ff' : 'transparent',
                            border: 'none', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', fontFamily: FONT,
                        }}
                            onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.background = '#f9fafb'; }}
                            onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.background = 'transparent'; }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{tab.icon}</span>
                            {tab.label}
                            {tab.id === 'assessment' && <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 700, background: '#eef2ff', color: IND, padding: '2px 6px', borderRadius: '99px' }}>NEW</span>}
                        </button>
                    ))}
                    <div style={{ flex: 1 }} />
                    <div style={{ borderTop: '1px solid #f0f0f8', paddingTop: '12px', marginTop: '12px' }}>
                        <Link to="/resume-analyzer" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#fff', background: `linear-gradient(135deg,${IND},${VIO})`, textDecoration: 'none' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload_file</span>New Analysis
                        </Link>
                        <button onClick={() => { logout(); navigate('/'); }} style={{ marginTop: '6px', width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: FONT, textAlign: 'left' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>Sign Out
                        </button>
                    </div>
                </aside>

                <main style={{
                    flex: 1,
                    marginLeft: isMobile ? '0' : '220px',
                    padding: isMobile ? '16px 12px' : '28px 32px',
                    paddingTop: isMobile ? '56px' : '28px',
                    minHeight: 'calc(100vh - 88px)',
                    overflowX: 'hidden',
                    minWidth: 0,
                    maxWidth: isMobile ? '100vw' : 'none',
                    boxSizing: 'border-box',
                }}>
                    {renderTab()}
                </main>
            </div>
            {showAuth && !isAuthenticated && (
                <AuthModal mode={authMode} onClose={() => { setShowAuth(false); if (!isAuthenticated) navigate('/'); }} onSwitchMode={setAuthMode} />
            )}
        </div>
    );
}

export default Dashboard;
