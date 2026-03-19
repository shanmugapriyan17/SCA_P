import { useState, useRef, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import api from '../api/client';
import Header from '../components/Common/Header';

ChartJS.register(ArcElement, Tooltip, Legend);

/* ═══════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════ */

const IND = '#4f46e5'; const VIO = '#7c3aed'; const FONT = "'Poppins',system-ui,sans-serif";

const SkillTag = ({ name, type }) => {
    const cfg = {
        matched: { bg: '#ecfdf5', color: '#059669', border: '#6ee7b7', icon: 'check_circle' },
        missing: { bg: '#fff1f2', color: '#e11d48', border: '#fda4af', icon: 'cancel' },
        neutral: { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', icon: 'tag' },
    };
    const c = cfg[type] || cfg.neutral;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontFamily: FONT }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{c.icon}</span>
            {name}
        </span>
    );
};

const StepConnector = () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
        <div style={{ width: '2px', height: '40px', background: 'linear-gradient(to bottom,#a5b4fc,#e0e7ff)', borderRadius: '99px' }} />
    </div>
);

const StepBadge = ({ number, icon, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, background: `linear-gradient(135deg,${IND},${VIO})`, color: '#fff', boxShadow: '0 4px 12px rgba(79,70,229,0.3)', flexShrink: 0 }}>{number}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: IND }}>{icon}</span>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: FONT }}>{label}</h2>
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */
function ResumeAnalyzer() {
    const [file, setFile] = useState(null);
    const [pasteText, setPasteText] = useState('');
    const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'paste'
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState('');
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [selectedPredictionIdx, setSelectedPredictionIdx] = useState(0);
    const [visibleSections, setVisibleSections] = useState([]);
    const [perPredCourses, setPerPredCourses] = useState({});  // cache courses per role
    const [isFetchingCourses, setIsFetchingCourses] = useState(false);
    const fileInputRef = useRef(null);

    // ── Role Search State ──
    const [roleQuery, setRoleQuery] = useState('');
    const [allRoles, setAllRoles] = useState([]);
    const [roleSearchResult, setRoleSearchResult] = useState(null);
    const [isSearchingRole, setIsSearchingRole] = useState(false);
    const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
    const [activeTab, setActiveTab] = useState('predicted'); // 'predicted' | 'custom'
    const roleInputRef = useRef(null);

    /* ─── Load roles list on mount for autocomplete ─── */
    useEffect(() => {
        api.get('/api/analysis/roles-list')
            .then(res => setAllRoles(res.data?.roles || []))
            .catch(() => { });
    }, []);

    /* ─── Load cached analysis state on mount ─── */
    useEffect(() => {
        const cached = localStorage.getItem('resumeAnalysisCache');
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (parsed.result) {
                    setResult(parsed.result);
                    setSelectedPredictionIdx(parsed.selectedPredictionIdx || 0);
                    setActiveTab(parsed.activeTab || 'predicted');
                    if (parsed.roleSearchResult) setRoleSearchResult(parsed.roleSearchResult);
                    if (parsed.perPredCourses) setPerPredCourses(parsed.perPredCourses);
                    if (parsed.roleQuery) setRoleQuery(parsed.roleQuery);
                }
            } catch (e) {
                console.error('Failed to load cache:', e);
            }
        }
    }, []);

    /* ─── Save analysis state to cache when it changes ─── */
    useEffect(() => {
        if (result) {
            localStorage.setItem('resumeAnalysisCache', JSON.stringify({
                result,
                selectedPredictionIdx,
                activeTab,
                roleSearchResult,
                perPredCourses,
                roleQuery
            }));
        }
    }, [result, selectedPredictionIdx, activeTab, roleSearchResult, perPredCourses, roleQuery]);

    /* ─── Animate sections appearing one by one ─── */
    useEffect(() => {
        if (result) {
            const sections = ['skills', 'predictions', 'fit', 'courses'];
            sections.forEach((section, i) => {
                setTimeout(() => {
                    setVisibleSections(prev => [...prev, section]);
                }, (i + 1) * 400);
            });
        } else {
            setVisibleSections([]);
        }
    }, [result]);

    /* ─── Filtered role suggestions for autocomplete ─── */
    const filteredRoles = roleQuery.length >= 2
        ? allRoles.filter(r => r.toLowerCase().includes(roleQuery.toLowerCase())).slice(0, 6)
        : [];

    /* ─── Upload handler ─── */
    const handleFileUpload = async (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        setFile(selectedFile);
        setIsLoading(true);
        setError('');
        setLoadingProgress(10);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            setLoadingStep('Uploading & extracting text from resume...');
            setLoadingProgress(25);
            const uploadRes = await api.post('/api/upload-resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const text = uploadRes.data?.text || '';
            const skills = uploadRes.data?.skills || [];

            if (!text && skills.length === 0) {
                throw new Error('Could not extract content from your resume.');
            }

            setLoadingStep('Analyzing your skills...');
            setLoadingProgress(50);
            await new Promise(r => setTimeout(r, 300));

            setLoadingStep('Predicting your best-fit career roles...');
            setLoadingProgress(70);

            setLoadingStep('Analyzing skill gaps & recommending courses...');
            setLoadingProgress(85);

            const analysisRes = await api.post('/api/analysis/full', { text, skills });
            setLoadingProgress(100);
            setResult(analysisRes.data);
            setSelectedPredictionIdx(0);
            setActiveTab('predicted');
            setRoleSearchResult(null);
            setRoleQuery('');
        } catch (err) {
            console.error('Analysis Error:', err);
            setError(err.response?.data?.error || err.message || 'Analysis failed. Please try again.');
        } finally {
            setIsLoading(false);
            setLoadingStep('');
            setLoadingProgress(0);
        }
    };

    /* ─── Paste handler ─── */
    const handlePasteAnalyze = async () => {
        if (!pasteText.trim()) return;
        setIsLoading(true);
        setError('');
        setLoadingProgress(20);
        try {
            setLoadingStep('Identifying your key skills...');
            setLoadingProgress(40);
            await new Promise(r => setTimeout(r, 200));

            setLoadingStep('Finding your ideal career matches...');
            setLoadingProgress(60);

            setLoadingStep('Running skill gap analysis...');
            setLoadingProgress(80);

            const analysisRes = await api.post('/api/analysis/full', { text: pasteText });
            setLoadingProgress(100);
            setResult(analysisRes.data);
            setSelectedPredictionIdx(0);
            setActiveTab('predicted');
            setRoleSearchResult(null);
            setRoleQuery('');
        } catch (err) {
            console.error('Analysis Error:', err);
            setError(err.response?.data?.error || err.message || 'Analysis failed.');
        } finally {
            setIsLoading(false);
            setLoadingStep('');
            setLoadingProgress(0);
        }
    };

    /* ─── Custom role search handler ─── */
    const handleRoleSearch = async (customQuery) => {
        const q = customQuery || roleQuery;
        if (!q.trim()) return;
        setIsSearchingRole(true);
        setShowRoleSuggestions(false);
        try {
            const res = await api.post('/api/analysis/search-role', {
                query: q,
                user_skills: result?.user_skills || [],
            });
            setRoleSearchResult(res.data);
            setActiveTab('custom');
        } catch (err) {
            console.error('Role search error:', err);
        } finally {
            setIsSearchingRole(false);
        }
    };

    /* ─── Derived data (safe access) ─── */
    const prediction = result?.prediction || {};
    const topPredictions = result?.top_predictions || [];
    const userSkills = result?.user_skills || [];
    const explanation = result?.explanation || {};

    // Decide which data to show based on tab
    const isCustomView = activeTab === 'custom' && roleSearchResult;

    // Per-prediction skill gap: use enriched data from each prediction card
    const selectedPred = topPredictions[selectedPredictionIdx];
    const displaySkillGap = isCustomView
        ? (roleSearchResult.skill_gap || {})
        : (selectedPred?.skill_gap || result?.skill_gap || {});

    // Courses: use cached per-prediction courses, or primary from result
    const selectedRole = selectedPred?.role || prediction.predicted_role || 'N/A';
    const displayCourseRecs = isCustomView
        ? (roleSearchResult.course_recommendations || {})
        : (perPredCourses[selectedRole] || result?.course_recommendations || {});
    const displayRole = isCustomView ? (roleSearchResult.matched_role || 'N/A') : selectedRole;

    const learningPath = displayCourseRecs?.personalized_learning_path || [];

    // Get explainability features
    const explainTechniques = explanation?.techniques || [];
    const featureContrib = explainTechniques.find(t => t.name === 'Feature Contribution Analysis');
    const limeData = explainTechniques.find(t => t.name?.includes('LIME'));
    const topFeatures = featureContrib?.top_contributing_features || [];

    // SHAP and chart data
    const shapData = explainTechniques.find(t => t.name?.includes('SHAP'));
    const explainCharts = explanation?.charts || {};

    // Fit Score
    const fitScore = displaySkillGap.fit_percentage
        ? Math.round(displaySkillGap.fit_percentage)
        : 0;

    const fitLabel =
        fitScore >= 80 ? 'Excellent Fit' :
            fitScore >= 60 ? 'Strong Fit' :
                fitScore >= 40 ? 'Moderate Fit' :
                    fitScore >= 20 ? 'Developing' : 'Early Stage';

    const fitColor =
        fitScore >= 80 ? '#10b981' :
            fitScore >= 60 ? '#3b82f6' :
                fitScore >= 40 ? '#f59e0b' : '#ef4444';

    const chartData = {
        labels: ['Match', 'Gap'],
        datasets: [{
            data: [fitScore, 100 - fitScore],
            backgroundColor: [fitColor, '#e2e8f0'],
            borderWidth: 0,
            cutout: '78%',
        }],
    };
    const chartOptions = {
        maintainAspectRatio: false,
        plugins: { tooltip: { enabled: false }, legend: { display: false } },
    };

    /* ─── Reset ─── */
    const handleReset = () => {
        setResult(null);
        setFile(null);
        setPasteText('');
        setError('');
        setVisibleSections([]);
        setSelectedPredictionIdx(0);
        setRoleSearchResult(null);
        setRoleQuery('');
        setActiveTab('predicted');
        setPerPredCourses({});
        setIsFetchingCourses(false);
    };

    /* Medal icons for top 3 */
    const medals = ['🥇', '🥈', '🥉'];

    const sectionVisible = (name) => visibleSections.includes(name);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: FONT, overflowX: 'hidden' }}>
            <Header />

            <main style={{ maxWidth: '960px', margin: '0 auto', padding: isMobile ? '100px 14px 40px' : '110px 24px 60px', boxSizing: 'border-box' }}>

                {/* ════════ Page Header ════════ */}
                <div style={{ marginBottom: '40px', textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '99px', background: '#eef2ff', marginBottom: '16px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: IND }}>auto_awesome</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: IND, letterSpacing: '0.5px', textTransform: 'uppercase' }}>System-Powered Career Intelligence</span>
                    </div>
                    <h1 style={{ fontSize: isMobile ? '28px' : '38px', fontWeight: 900, color: '#0f172a', margin: '0 0 12px', lineHeight: 1.2 }}>
                        Professional{' '}
                        <span style={{ background: `linear-gradient(135deg,${IND},${VIO})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Resume Audit</span>
                    </h1>
                    <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.7, margin: 0 }}>
                        Upload your resume or paste your skills — our system analyzes skills, predicts career roles, and builds a personalized learning path.
                    </p>
                </div>

                {/* ════════════════════════════════════════════════
                    STEP 1 — Upload / Paste
                   ════════════════════════════════════════════════ */}
                {!result && !isLoading && (
                    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                        <StepBadge number={1} icon="upload_file" label="Upload Your Resume" />

                        {/* Toggle */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                            {['upload', 'paste'].map((mode) => (
                                <button key={mode} onClick={() => setInputMode(mode)} style={{
                                    padding: '10px 22px', borderRadius: '99px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: FONT, transition: 'all 0.2s',
                                    background: inputMode === mode ? `linear-gradient(135deg,${IND},${VIO})` : '#fff',
                                    color: inputMode === mode ? '#fff' : '#64748b',
                                    border: inputMode === mode ? 'none' : '1px solid #e2e8f0',
                                    boxShadow: inputMode === mode ? '0 4px 14px rgba(79,70,229,0.3)' : 'none',
                                }}>
                                    {mode === 'upload' ? '📄 Upload File' : '✏️ Paste Text'}
                                </button>
                            ))}
                        </div>

                        {inputMode === 'upload' ? (
                            <div onClick={() => fileInputRef.current?.click()} style={{
                                background: '#fff', border: `2px dashed #c7d2fe`, borderRadius: '24px',
                                padding: isMobile ? '48px 24px' : '64px', textAlign: 'center', cursor: 'pointer',
                                boxShadow: '0 4px 24px rgba(79,70,229,0.07)', transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = IND; e.currentTarget.style.background = '#fafbff'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.background = '#fff'; }}
                            >
                                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '36px', color: IND }}>upload_file</span>
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px', fontFamily: FONT }}>Drop your resume here</h3>
                                <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 24px' }}>Supports PDF, TXT — Max 5 MB</p>
                                <span style={{ display: 'inline-block', padding: '12px 28px', background: `linear-gradient(135deg,${IND},${VIO})`, color: '#fff', borderRadius: '14px', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>Browse Files</span>
                                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".pdf,.txt" onChange={handleFileUpload} />
                            </div>
                        ) : (
                            <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                                <textarea value={pasteText} onChange={e => setPasteText(e.target.value)}
                                    placeholder="Paste your resume text, skills, or job description here..."
                                    rows={8} style={{
                                        width: '100%', padding: '16px', border: '2px solid #e2e8f0', borderRadius: '14px',
                                        fontSize: '14px', color: '#334155', fontFamily: FONT, outline: 'none', resize: 'none',
                                        boxSizing: 'border-box', lineHeight: 1.6,
                                    }}
                                    onFocus={e => e.target.style.borderColor = IND}
                                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                />
                                <button onClick={handlePasteAnalyze} disabled={!pasteText.trim()} style={{
                                    width: '100%', padding: '14px', marginTop: '16px', borderRadius: '14px', border: 'none',
                                    background: pasteText.trim() ? `linear-gradient(135deg,${IND},${VIO})` : '#e2e8f0',
                                    color: pasteText.trim() ? '#fff' : '#94a3b8',
                                    fontSize: '15px', fontWeight: 700, cursor: pasteText.trim() ? 'pointer' : 'not-allowed',
                                    fontFamily: FONT, boxShadow: pasteText.trim() ? '0 4px 14px rgba(79,70,229,0.3)' : 'none',
                                }}>Analyze My Profile</button>
                            </div>
                        )}

                        {error && (
                            <div style={{ marginTop: '20px', padding: '14px 16px', background: '#fff1f2', borderRadius: '14px', border: '1px solid #fda4af', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className="material-symbols-outlined" style={{ color: '#e11d48' }}>warning</span>
                                <p style={{ fontSize: '13px', color: '#be123c', fontWeight: 600, margin: 0 }}>{error}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ════════ Loading State ════════ */}
                {isLoading && (
                    <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center', padding: '80px 0' }}>
                        <div style={{ position: 'relative', width: '110px', height: '110px', margin: '0 auto 32px' }}>
                            <div style={{ position: 'absolute', inset: 0, border: '4px solid #e0e7ff', borderRadius: '50%' }} />
                            <div style={{ position: 'absolute', inset: 0, border: '4px solid transparent', borderTopColor: IND, borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '22px', fontWeight: 900, color: IND, fontFamily: FONT }}>{loadingProgress}%</span>
                            </div>
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px', fontFamily: FONT }}>Analyzing Your Resume</h2>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px' }}>{loadingStep || 'Processing...'}</p>
                        <div style={{ width: '100%', background: '#e0e7ff', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
                            <div style={{ background: `linear-gradient(to right,${IND},${VIO})`, height: '8px', borderRadius: '99px', width: `${loadingProgress}%`, transition: 'width 0.7s ease-out' }} />
                        </div>
                        <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
                            {[{ label: 'Extract Text', pct: 25 }, { label: 'Skill Scan', pct: 50 }, { label: 'Career Match', pct: 70 }, { label: 'Gap Analysis', pct: 85 }].map((step, i) => (
                                <div key={i} style={{ textAlign: 'center' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, background: loadingProgress >= step.pct ? `linear-gradient(135deg,${IND},${VIO})` : '#e0e7ff', color: loadingProgress >= step.pct ? '#fff' : '#94a3b8', transition: 'all 0.3s' }}>{loadingProgress >= step.pct ? '✓' : i + 1}</div>
                                    <span style={{ fontSize: '10px', fontWeight: 600, color: loadingProgress >= step.pct ? IND : '#94a3b8' }}>{step.label}</span>
                                </div>
                            ))}
                        </div>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                )}

                {/* ════════════════════════════════════════════════
                    RESULTS — Step-by-Step Sections
                   ════════════════════════════════════════════════ */}
                {result && !isLoading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* ─── File Summary Bar ─── */}
                        <div style={{ background: '#fff', borderRadius: '16px', padding: '14px 18px', border: '1px solid #e0e7ff', boxShadow: '0 2px 12px rgba(79,70,229,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <span className="material-symbols-outlined" style={{ color: '#059669' }}>task_alt</span>
                                </div>
                                <div>
                                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: 0, fontFamily: FONT }}>Analysis Complete ✅</p>
                                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{file ? file.name : 'Pasted text'} • {userSkills.length} skills found • {topPredictions.length > 0 ? topPredictions.length : 1} roles predicted</p>
                                </div>
                            </div>
                            <button onClick={handleReset} style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #e0e7ff', background: '#fff', color: '#4f46e5', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '6px' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#eef2ff'}
                                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>restart_alt</span>
                                New Analysis
                            </button>
                        </div>

                        {/* ═══════ STEP 2 — NLP Extracted Skills ═══════ */}
                        <div style={{ transition: 'all 0.7s', opacity: sectionVisible('skills') ? 1 : 0, transform: sectionVisible('skills') ? 'none' : 'translateY(24px)' }}>
                            <StepBadge number={2} icon="psychology" label="Skill Analysis" />
                            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e0e7ff', boxShadow: '0 2px 16px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="material-symbols-outlined" style={{ color: IND }}>neurology</span>
                                        <h3 style={{ fontWeight: 700, color: '#0f172a', margin: 0, fontSize: '14px', fontFamily: FONT }}>Skills Extracted from Your Resume</h3>
                                    </div>
                                    <span style={{ padding: '4px 12px', borderRadius: '99px', background: '#eef2ff', color: IND, fontSize: '11px', fontWeight: 700 }}>{userSkills.length} skills found</span>
                                </div>
                                <div style={{ padding: '20px 24px' }}>
                                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>Our System analyzed your resume and identified these technical &amp; professional skills:</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {userSkills.map((s, i) => (
                                            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, background: 'linear-gradient(135deg,#f8faff,#eef2ff)', color: '#334155', border: '1px solid #c7d2fe' }}>
                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: IND, flexShrink: 0 }} />
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <StepConnector />

                        {/* ═══════ STEP 3 — Top 3 Career Predictions ═══════ */}
                        <div style={{ transition: 'all 0.7s', opacity: sectionVisible('predictions') ? 1 : 0, transform: sectionVisible('predictions') ? 'none' : 'translateY(24px)' }}>
                            <StepBadge number={3} icon="trending_up" label="Top Career Predictions" />

                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '14px' }}>
                                {(() => {
                                    const preds = topPredictions.length > 0 ? topPredictions : [{ role: prediction.predicted_role, confidence: prediction.confidence || 0.5, rank: 1 }];
                                    // Use combined_score for display % (matches re-ranking order so Rank #1 = highest %).
                                    // Fall back to confidence if combined_score not present.
                                    const getScore = (p) => p.combined_score != null ? p.combined_score : (p.confidence || 0);
                                    const totalScore = preds.reduce((s, p) => s + getScore(p), 0);
                                    return preds.map((pred, i) => {
                                        const isSelected = i === selectedPredictionIdx && activeTab === 'predicted';
                                        const confPct = totalScore > 0 ? Math.round((getScore(pred) / totalScore) * 100) : Math.round((pred.confidence || 0) * 100);
                                        const confColor = confPct >= 55 ? '#059669' : confPct >= 30 ? IND : '#d97706';

                                        return (
                                            <button key={i} onClick={async () => {
                                                setSelectedPredictionIdx(i); setActiveTab('predicted'); setRoleSearchResult(null);
                                                const roleName = pred.role;
                                                if (roleName && !perPredCourses[roleName] && pred.skill_gap?.missing_skills?.length > 0) {
                                                    setIsFetchingCourses(true);
                                                    try {
                                                        const courseRes = await api.post('/api/analysis/recommend', { missing_skills: pred.skill_gap.missing_skills, target_role: roleName });
                                                        setPerPredCourses(prev => ({ ...prev, [roleName]: courseRes.data }));
                                                    } catch (err) { console.error('Course fetch error:', err); }
                                                    finally { setIsFetchingCourses(false); }
                                                }
                                            }}
                                                style={{
                                                    textAlign: 'left', padding: '18px', borderRadius: '16px', cursor: 'pointer', fontFamily: FONT,
                                                    border: isSelected ? `2px solid ${IND}` : '2px solid #e0e7ff',
                                                    background: isSelected ? 'linear-gradient(135deg,#eef2ff,#f5f3ff)' : '#fff',
                                                    boxShadow: isSelected ? `0 4px 20px rgba(79,70,229,0.2)` : '0 2px 8px rgba(0,0,0,0.04)',
                                                    transition: 'all 0.25s',
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                    <span style={{ fontSize: '24px' }}>{medals[i] || '🏅'}</span>
                                                    {isSelected && <span style={{ padding: '2px 8px', borderRadius: '99px', background: IND, color: '#fff', fontSize: '10px', fontWeight: 700 }}>SELECTED</span>}
                                                </div>
                                                <h4 style={{ fontWeight: 800, fontSize: '15px', color: isSelected ? IND : '#0f172a', margin: '0 0 3px', fontFamily: FONT }}>{pred.role}</h4>
                                                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 10px' }}>Rank #{pred.rank} prediction</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <div style={{ flex: 1, height: '5px', borderRadius: '99px', background: '#e0e7ff', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', borderRadius: '99px', background: `linear-gradient(to right,${IND},${VIO})`, width: `${confPct}%` }} />
                                                    </div>
                                                    <span style={{ fontSize: '11px', fontWeight: 700, color: confColor }}>{confPct}%</span>
                                                </div>
                                                {!isSelected && <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px' }}>Click to see fit analysis →</p>}
                                            </button>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                        <StepConnector />

                        {/* ═══════ STEP 3.5 — Why These Predictions? (Simple Text) ═══════ */}
                        {topPredictions.length > 0 && (
                            <div style={{ transition: 'all 0.7s', opacity: sectionVisible('predictions') ? 1 : 0, transform: sectionVisible('predictions') ? 'none' : 'translateY(24px)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', boxShadow: '0 4px 12px rgba(124,58,237,0.3)', flexShrink: 0 }}>💡</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#7c3aed' }}>psychology_alt</span>
                                        <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: FONT }}>Why These Predictions?</h2>
                                    </div>
                                    <span style={{ padding: '3px 10px', borderRadius: '99px', background: '#f5f3ff', color: '#7c3aed', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Explainable Recommendation</span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {(() => {
                                        const getScore = (p) => p.combined_score != null ? p.combined_score : (p.confidence || 0);
                                        const totalScore = topPredictions.reduce((s, p) => s + getScore(p), 0);
                                        return topPredictions.map((pred, i) => {
                                            const normPct = totalScore > 0 ? Math.round((getScore(pred) / totalScore) * 100) : Math.round((pred.confidence || 0) * 100);
                                            const bgPalette = ['#fffbeb', '#f8fafc', '#fff7ed'];
                                            const borderPalette = ['#fcd34d', '#e0e7ff', '#fb923c'];
                                            return (
                                                <div key={i} style={{ padding: '18px', borderRadius: '14px', border: `1px solid ${borderPalette[i]}`, background: bgPalette[i], boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                        <span style={{ fontSize: '20px' }}>{medals[i]}</span>
                                                        <h3 style={{ fontWeight: 700, color: '#0f172a', margin: 0, fontSize: '14px', fontFamily: FONT }}>{pred.role}</h3>
                                                        <span style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: '99px', background: '#eef2ff', color: IND, fontSize: '10px', fontWeight: 700 }}>{normPct}% match</span>
                                                    </div>
                                                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: 0 }}>{pred.why_recommended || 'This role aligns with your skill profile based on ML analysis.'}</p>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        )}

                        <StepConnector />

                        {/* ═══════ STEP 4 — Fit Analysis (with role search) ═══════ */}
                        <div style={{ transition: 'all 0.7s', opacity: sectionVisible('fit') ? 1 : 0, transform: sectionVisible('fit') ? 'none' : 'translateY(24px)' }}>
                            <StepBadge number={4} icon="analytics" label="Fit Analysis" />

                            {/* ── Tab Toggle ── */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', borderRadius: '12px', padding: '4px' }}>
                                    {[{ id: 'predicted', icon: '🤖', label: 'ML Predicted' }, { id: 'custom', icon: '🔍', label: 'Search a Role' }].map(tab => (
                                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                                            padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, border: 'none', transition: 'all 0.2s',
                                            background: activeTab === tab.id ? '#fff' : 'transparent',
                                            color: activeTab === tab.id ? '#0f172a' : '#64748b',
                                            boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                        }}>{tab.icon} {tab.label}</button>
                                    ))}
                                </div>

                                {activeTab === 'custom' && (
                                    <div style={{ position: 'relative', flex: 1, minWidth: isMobile ? '100%' : '300px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <div style={{ position: 'relative', flex: 1 }}>
                                                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '18px' }}>search</span>
                                                <input ref={roleInputRef} type="text" value={roleQuery}
                                                    onChange={e => { setRoleQuery(e.target.value); setShowRoleSuggestions(e.target.value.length >= 2); }}
                                                    onKeyDown={e => { if (e.key === 'Enter') handleRoleSearch(); }}
                                                    onFocus={() => roleQuery.length >= 2 && setShowRoleSuggestions(true)}
                                                    onBlur={() => setTimeout(() => setShowRoleSuggestions(false), 200)}
                                                    placeholder='Try "Full Stack Developer", "Data Scientist"...'
                                                    style={{ width: '100%', paddingLeft: '38px', paddingRight: '14px', paddingTop: '10px', paddingBottom: '10px', borderRadius: '12px', border: '2px solid #e0e7ff', fontSize: '13px', fontFamily: FONT, outline: 'none', boxSizing: 'border-box' }}
                                                    onFocusCapture={e => e.target.style.borderColor = IND}
                                                    onBlurCapture={e => e.target.style.borderColor = '#e0e7ff'}
                                                />
                                                {showRoleSuggestions && filteredRoles.length > 0 && (
                                                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: '#fff', borderRadius: '12px', border: '1px solid #e0e7ff', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 20, overflow: 'hidden' }}>
                                                        {filteredRoles.map((role, i) => (
                                                            <button key={i} style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: '13px', cursor: 'pointer', color: '#334155', fontFamily: FONT, background: 'none', border: 'none', borderBottom: i < filteredRoles.length - 1 ? '1px solid #f0f0f8' : 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                                onMouseDown={e => { e.preventDefault(); setRoleQuery(role); setShowRoleSuggestions(false); handleRoleSearch(role); }}
                                                                onMouseEnter={e => e.currentTarget.style.background = '#eef2ff'}
                                                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                                            >
                                                                <span className="material-symbols-outlined" style={{ color: IND, fontSize: '16px' }}>work</span>
                                                                {role}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <button onClick={() => handleRoleSearch()} disabled={!roleQuery.trim() || isSearchingRole} style={{
                                                padding: '10px 18px', borderRadius: '12px', border: 'none', cursor: roleQuery.trim() && !isSearchingRole ? 'pointer' : 'not-allowed',
                                                background: roleQuery.trim() ? `linear-gradient(135deg,${IND},${VIO})` : '#e0e7ff',
                                                color: roleQuery.trim() ? '#fff' : '#94a3b8', fontSize: '13px', fontWeight: 700, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
                                            }}>
                                                {isSearchingRole ? <span style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> : <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>search</span>}
                                                Analyze Fit
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {isCustomView && roleSearchResult.did_you_mean && (
                                <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '12px', background: '#fffbeb', border: '1px solid #fcd34d', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="material-symbols-outlined" style={{ color: '#d97706' }}>spellcheck</span>
                                    <p style={{ fontSize: '13px', color: '#92400e', margin: 0 }}>Showing results for <strong>&#34;{roleSearchResult.matched_role}&#34;</strong> <span style={{ color: '#d97706' }}>(you typed: &#34;{roleSearchResult.query}&#34;)</span></p>
                                </div>
                            )}

                            {/* ── Role header ── */}
                            <div style={{ background: `linear-gradient(135deg,${IND},${VIO})`, borderRadius: '16px', padding: '16px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '22px' }}>work</span>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, margin: 0 }}>{isCustomView ? 'Custom Role Analysis' : `ML Prediction #${selectedPredictionIdx + 1}`}</p>
                                        <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: 0, fontFamily: FONT }}>{displayRole}</h3>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '32px', fontWeight: 900, color: '#fff', margin: 0, fontFamily: FONT }}>{fitScore}%</p>
                                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>{fitLabel}</p>
                                </div>
                            </div>

                            {/* ── Fit Chart + Skills Comparison ── */}
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '160px 1fr', gap: '16px' }}>
                                {/* Left: Doughnut + Summary */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e0e7ff', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                                        <div style={{ width: '120px', height: '120px', margin: '0 auto 12px', position: 'relative' }}>
                                            <Doughnut data={chartData} options={chartOptions} />
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                <span style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', fontFamily: FONT }}>{fitScore}%</span>
                                                <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.5px' }}>FIT SCORE</span>
                                            </div>
                                        </div>
                                        <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, background: fitColor + '18', color: fitColor }}>{fitLabel}</span>
                                    </div>

                                    <div style={{ background: '#0f172a', borderRadius: '16px', padding: '18px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: '#4f46e5', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.25 }} />
                                        <h4 style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px' }}>Summary</h4>
                                        {[['Target Role', displayRole, '#fff'], ['Skills Matched', displaySkillGap.matched_count || 0, '#34d399'], ['Skills Missing', displaySkillGap.missing_count || 0, '#f87171'], ['Gap', `${displaySkillGap.gap_percentage?.toFixed(0) || 0}%`, '#fbbf24']].map(([label, val, col]) => (
                                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                                                <span style={{ color: '#64748b' }}>{label}</span>
                                                <span style={{ fontWeight: 700, color: col, fontSize: '11px', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right: Skills Comparison */}
                                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e0e7ff', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f8' }}>
                                        <h3 style={{ fontWeight: 700, color: '#0f172a', margin: 0, fontSize: '14px', fontFamily: FONT }}>Skills Comparison</h3>
                                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>Your skills vs what <strong style={{ color: '#475569' }}>{displayRole}</strong> requires</p>
                                    </div>
                                    <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                                                Matched Skills ({displaySkillGap.matched_count || 0})
                                            </h4>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                {(displaySkillGap.matched_skills || []).length > 0
                                                    ? (displaySkillGap.matched_skills || []).map((s, i) => <SkillTag key={i} name={s} type="matched" />)
                                                    : <p style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>No matched skills found</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>cancel</span>
                                                Missing Skills ({displaySkillGap.missing_count || 0})
                                            </h4>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                {(displaySkillGap.missing_skills || []).length > 0
                                                    ? (displaySkillGap.missing_skills || []).map((s, i) => <SkillTag key={i} name={s} type="missing" />)
                                                    : <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>No gaps — great job! 🎉</p>}
                                            </div>
                                        </div>
                                    </div>
                                    {displaySkillGap.recommendation && (
                                        <div style={{ padding: '0 20px 20px' }}>
                                            <div style={{ padding: '14px', borderRadius: '12px', background: '#eef2ff', border: '1px solid #c7d2fe', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                <span className="material-symbols-outlined" style={{ color: IND, fontSize: '18px', marginTop: '1px' }}>lightbulb</span>
                                                <p style={{ fontSize: '13px', color: '#3730a3', lineHeight: 1.6, margin: 0 }}>{displaySkillGap.recommendation}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <StepConnector />

                        {/* ═══════ STEP 5 — Course Recommendations ═══════ */}
                        <div style={{ transition: 'all 0.7s', opacity: sectionVisible('courses') ? 1 : 0, transform: sectionVisible('courses') ? 'none' : 'translateY(24px)' }}>
                            <StepBadge number={5} icon="school" label="Recommended Courses" />

                            {learningPath.length > 0 ? (
                                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e0e7ff', boxShadow: '0 2px 16px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span className="material-symbols-outlined" style={{ color: IND }}>menu_book</span>
                                            <h3 style={{ fontWeight: 700, color: '#0f172a', margin: 0, fontSize: '14px', fontFamily: FONT }}>Learning Path for {displayRole}</h3>
                                        </div>
                                        {(displayCourseRecs.total_learning_hours || displayCourseRecs.estimated_weeks) && (
                                            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                                                {displayCourseRecs.total_learning_hours && `~${displayCourseRecs.total_learning_hours}h total`}
                                                {displayCourseRecs.estimated_weeks && ` • ${displayCourseRecs.estimated_weeks} weeks`}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                                        {learningPath.slice(0, 8).map((item, i) => (
                                            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={{
                                                display: 'block', padding: '14px', borderRadius: '12px', border: '1px solid #e0e7ff',
                                                textDecoration: 'none', transition: 'all 0.2s',
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = IND; e.currentTarget.style.background = '#fafbff'; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0e7ff'; e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#eef2ff', color: IND, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                                                        <span style={{ padding: '2px 7px', borderRadius: '6px', background: '#eef2ff', color: IND, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>{item.level || 'Course'}</span>
                                                    </div>
                                                    <span className="material-symbols-outlined" style={{ color: '#c7d2fe', fontSize: '16px' }}>open_in_new</span>
                                                </div>
                                                <h4 style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px', margin: '0 0 4px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.course}</h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#94a3b8' }}>
                                                    <span>{item.platform}</span>
                                                    {item.duration_hours && <span>• {item.duration_hours}h</span>}
                                                </div>
                                                <p style={{ fontSize: '10px', color: '#94a3b8', margin: '6px 0 0' }}>For: <span style={{ fontWeight: 600, color: '#e11d48' }}>{item.skill}</span> <span style={{ color: '#cbd5e1' }}>(missing skill)</span></p>
                                            </a>
                                        ))}
                                    </div>

                                    {displayCourseRecs.total_courses > 0 && (
                                        <div style={{ padding: '0 20px 20px' }}>
                                            <div style={{ padding: '16px', borderRadius: '14px', background: 'linear-gradient(135deg,#0f172a,#1e293b)', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span className="material-symbols-outlined" style={{ color: '#818cf8', fontSize: '22px' }}>auto_awesome</span>
                                                <div>
                                                    <p style={{ fontSize: '13px', fontWeight: 700, margin: 0, fontFamily: FONT }}>Complete this path to become a strong {displayRole}</p>
                                                    <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>{displayCourseRecs.total_courses} courses • {displayCourseRecs.total_learning_hours || '?'}h of learning</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e0e7ff', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', padding: '48px 24px', textAlign: 'center' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#34d399', display: 'block', marginBottom: '12px' }}>celebration</span>
                                    <h3 style={{ fontWeight: 800, color: '#0f172a', fontSize: '18px', margin: '0 0 8px', fontFamily: FONT }}>No Courses Needed!</h3>
                                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Your skills already cover the requirements for {displayRole}. Amazing work! 🎉</p>
                                </div>
                            )}
                        </div>

                        {/* Bottom CTA */}
                        <div style={{ marginTop: '32px', textAlign: 'center' }}>
                            <button onClick={handleReset} style={{
                                padding: '14px 32px', borderRadius: '16px', background: `linear-gradient(135deg,${IND},${VIO})`,
                                color: '#fff', fontSize: '15px', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: FONT,
                                boxShadow: '0 4px 20px rgba(79,70,229,0.35)', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 30px rgba(79,70,229,0.45)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(79,70,229,0.35)'}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>restart_alt</span>
                                Analyze Another Resume
                            </button>
                        </div>
                    </div>
                )
                }
            </main >
        </div >
    );
}

export default ResumeAnalyzer;
