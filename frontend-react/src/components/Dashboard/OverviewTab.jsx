import { Link } from 'react-router-dom';
import { Bar, Radar, Doughnut } from 'react-chartjs-2';
import { Card, SectionTitle, FONT, IND, VIO } from './helpers';

export default function OverviewTab({ userName, careerMatch, predictedRole, skillScores, assessmentHistory, assessedSkillCount, isMobile, setActiveTab }) {
    const donutData = { labels: ['Fit', 'Gap'], datasets: [{ data: [careerMatch || 1, Math.max(0, 100 - (careerMatch || 1))], backgroundColor: [IND, '#f0f0f8'], borderWidth: 0, cutout: '78%' }] };
    const donutOpts = { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false }, tooltip: { enabled: false } } };
    const growthData = { labels: ['Now', '1 Year', '3 Years', '5 Years'], datasets: [{ data: [careerMatch || 10, Math.min(100, (careerMatch || 10) + 15), Math.min(100, (careerMatch || 10) + 25), Math.min(100, (careerMatch || 10) + 30)], backgroundColor: ['#e0e7ff', '#c7d2fe', '#818cf8', IND], borderRadius: 10 }] };
    const growthOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%', font: { family: 'Poppins', size: 10 } }, grid: { color: '#f5f6fb' } }, x: { grid: { display: false }, ticks: { font: { family: 'Poppins', size: 10 } } } } };

    const labels = Object.keys(skillScores).length > 0 ? Object.keys(skillScores) : ['Python', 'ML / AI', 'SQL', 'Cloud'];
    const vals = labels.map(l => skillScores[l] || 0);
    const radarData = { labels, datasets: [{ label: 'You', data: vals, backgroundColor: 'rgba(79,70,229,0.12)', borderColor: IND, borderWidth: 2, pointBackgroundColor: IND, pointRadius: 4 }] };
    const radarOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 14, font: { family: 'Poppins', size: 11 } } } }, scales: { r: { angleLines: { color: '#e8eaf6' }, grid: { color: '#e8eaf6' }, pointLabels: { font: { family: 'Poppins', size: isMobile ? 9 : 11 } }, suggestedMin: 0, suggestedMax: 100 } } };

    const recentActivity = (assessmentHistory || []).slice(0, 4).map(h => ({
        icon: 'quiz', text: `${h.skill} assessment — ${h.score}%`, time: new Date(h.taken_at).toLocaleDateString(), color: IND, bg: '#eef2ff',
    }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '14px' : '20px' }}>
            {/* Welcome */}
            <div style={{ background: `linear-gradient(135deg,${IND} 0%,${VIO} 60%,#a855f7 100%)`, borderRadius: isMobile ? '16px' : '20px', padding: isMobile ? '20px' : '28px 32px', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', boxShadow: '0 8px 32px rgba(79,70,229,0.25)', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '16px' : 0 }}>
                <div>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: '0 0 4px' }}>Welcome back</p>
                    <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>{userName} 👋</h1>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '16px', padding: isMobile ? '12px 18px' : '16px 22px', textAlign: 'center', alignSelf: isMobile ? 'flex-end' : 'auto' }}>
                    <div style={{ fontSize: isMobile ? '26px' : '32px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{careerMatch}%</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>Career Match</div>
                </div>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? '10px' : '16px' }}>
                {[
                    { icon: 'workspace_premium', bg: `linear-gradient(135deg,${IND},${VIO})`, val: `${careerMatch}%`, label: 'Career Match', sub: `Best: ${predictedRole}`, prog: careerMatch },
                    { icon: 'quiz', bg: 'linear-gradient(135deg,#059669,#10b981)', val: String(assessedSkillCount), label: 'Assessments Done', sub: 'Skill tests completed' },
                    { icon: 'local_fire_department', bg: 'linear-gradient(135deg,#d97706,#f59e0b)', val: String((assessmentHistory || []).length), label: 'Total Attempts', sub: 'All time' },
                    { icon: 'bolt', bg: `linear-gradient(135deg,#a855f7,${VIO})`, val: String(Object.keys(skillScores).length), label: 'Skills Tracked', sub: 'Based on quizzes' },
                ].map(s => (
                    <div key={s.label} style={{ background: '#fff', borderRadius: isMobile ? '12px' : '16px', padding: isMobile ? '14px' : '20px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f0f0f8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isMobile ? '8px' : '12px' }}>
                            <span style={{ fontSize: isMobile ? '10px' : '12px', fontWeight: 500, color: '#6b7280' }}>{s.label}</span>
                            <span style={{ width: isMobile ? '26px' : '30px', height: isMobile ? '26px' : '30px', borderRadius: '8px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: isMobile ? '14px' : '16px', color: '#fff' }}>{s.icon}</span>
                            </span>
                        </div>
                        <div style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 700, color: '#111827', lineHeight: 1, marginBottom: '4px' }}>{s.val}</div>
                        <p style={{ fontSize: isMobile ? '10px' : '11px', color: '#6b7280', margin: s.prog ? '0 0 10px' : 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.sub}</p>
                        {s.prog !== undefined && <div style={{ height: '4px', background: '#f0f0f8', borderRadius: '99px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${s.prog}%`, background: `linear-gradient(90deg,${IND},${VIO})`, borderRadius: '99px' }} /></div>}
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '14px' : '20px' }}>
                <Card><SectionTitle icon="trending_up" text="Projected Growth" /><div style={{ height: isMobile ? '180px' : '200px' }}><Bar data={growthData} options={growthOpts} /></div></Card>
                <Card><SectionTitle icon="hub" text="Skill Matrix" /><div style={{ height: isMobile ? '180px' : '200px' }}><Radar data={radarData} options={radarOpts} /></div></Card>
            </div>

            {/* Quick actions + Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '3fr 2fr', gap: isMobile ? '14px' : '20px' }}>
                <Card>
                    <SectionTitle icon="flash_on" text="Quick Actions" />
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                        {[{ icon: 'description', label: 'Resume Analyzer', path: '/resume-analyzer', bg: '#eef2ff', color: IND },
                        { icon: 'quiz', label: 'Take Assessment', path: '/dashboard', bg: '#f5f3ff', color: VIO },
                        { icon: 'groups', label: 'Mentorship', path: '/mentorship', bg: '#ecfdf5', color: '#059669' },
                        { icon: 'info', label: 'About', path: '/about', bg: '#fff7ed', color: '#d97706' },
                        ].map(a => (
                            <Link key={a.label} to={a.path} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '12px', background: a.bg, textDecoration: 'none', transition: 'all 0.2s' }}
                                onClick={() => { if (a.label === 'Take Assessment' && setActiveTab) setActiveTab('assessment'); }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '17px', color: a.color }}>{a.icon}</span>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>{a.label}</span>
                            </Link>
                        ))}
                    </div>
                </Card>
                <Card>
                    <SectionTitle icon="history" text="Recent Activity" />
                    {recentActivity.length === 0 ? <p style={{ fontSize: '12px', color: '#9ca3af' }}>No assessments taken yet. Take one to see activity!</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {recentActivity.map((a, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: a.color }}>{a.icon}</span>
                                    </div>
                                    <div><p style={{ fontSize: '12px', color: '#111827', margin: '0 0 2px' }}>{a.text}</p><p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>{a.time}</p></div>
                                </div>
                            ))}
                        </div>
                    )}
                    {careerMatch > 0 && (
                        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f5f6fb', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '56px', height: '56px', position: 'relative', flexShrink: 0 }}>
                                <Doughnut data={donutData} options={donutOpts} />
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '11px', fontWeight: 700, color: IND }}>{careerMatch >= 80 ? 'A+' : careerMatch >= 60 ? 'B+' : 'C'}</span></div>
                            </div>
                            <div><p style={{ fontSize: '12px', fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>Market Fit</p><p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Based on {assessedSkillCount} assessments</p></div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
