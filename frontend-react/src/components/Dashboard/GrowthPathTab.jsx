import { Bar } from 'react-chartjs-2';
import { Card, SectionTitle, IND, VIO } from './helpers';

export default function GrowthPathTab({ predictedRole, careerMatch, isMobile }) {
    const milestones = [
        { phase: 'Now', title: 'Skill Assessment Phase', done: true, color: IND },
        { phase: '3 months', title: 'Skill Gap Closure', done: careerMatch >= 40, color: IND },
        { phase: '6 months', title: 'Junior ' + predictedRole, done: careerMatch >= 60, color: VIO },
        { phase: '1 year', title: predictedRole, done: careerMatch >= 80, color: '#a855f7' },
        { phase: '3 years', title: 'Senior ' + predictedRole, done: false, color: '#9333ea' },
    ];
    const growthData = { labels: ['Now', '6m', '1 yr', '3 yrs', '5 yrs'], datasets: [{ data: [careerMatch || 10, Math.min(100, (careerMatch || 10) + 10), Math.min(100, (careerMatch || 10) + 20), Math.min(100, (careerMatch || 10) + 28), Math.min(100, (careerMatch || 10) + 33)], backgroundColor: ['#e0e7ff', '#c7d2fe', '#818cf8', IND, VIO], borderRadius: 10 }] };
    const growthOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%', font: { family: 'Poppins', size: 10 } }, grid: { color: '#f5f6fb' } }, x: { grid: { display: false }, ticks: { font: { family: 'Poppins', size: 10 } } } } };
    const skills = ['Python (Pandas, NumPy)', 'Machine Learning', 'SQL & Data Wrangling', 'Cloud Platforms', 'Statistics', 'API Design'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
                <Card>
                    <SectionTitle icon="route" text="Career Timeline" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {milestones.map((m, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', paddingBottom: i < milestones.length - 1 ? '18px' : 0, position: 'relative' }}>
                                {i < milestones.length - 1 && <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: 0, width: '2px', background: m.done ? IND : '#e5e7eb' }} />}
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: m.done ? m.color : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '13px', color: m.done ? '#fff' : '#9ca3af' }}>{m.done ? 'check' : 'radio_button_unchecked'}</span>
                                </div>
                                <div><p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 2px' }}>{m.phase}</p><p style={{ fontSize: '13px', fontWeight: m.done ? 700 : 500, color: m.done ? '#111827' : '#6b7280', margin: 0 }}>{m.title}</p></div>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card><SectionTitle icon="trending_up" text="Projected Career Score" /><div style={{ height: '220px' }}><Bar data={growthData} options={growthOpts} /></div></Card>
            </div>
            <Card>
                <SectionTitle icon="checklist" text={`Roadmap to ${predictedRole}`} />
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '10px' }}>
                    {skills.map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '10px', background: i < 2 ? '#eef2ff' : '#f9fafb', border: `1px solid ${i < 2 ? '#c7d2fe' : '#f0f0f8'}` }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: i < 2 ? IND : '#9ca3af' }}>{i < 2 ? 'check_circle' : 'radio_button_unchecked'}</span>
                            <span style={{ fontSize: '12px', fontWeight: 500, color: i < 2 ? '#1e1b4b' : '#6b7280' }}>{s}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
