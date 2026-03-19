import { Radar } from 'react-chartjs-2';
import { Card, SectionTitle, Badge, skillLevel, IND, VIO } from './helpers';

export default function SkillMatrixTab({ skillScores, isMobile }) {
    const skills = Object.entries(skillScores);
    if (skills.length === 0) return <Card><SectionTitle icon="hub" text="Skill Matrix" /><p style={{ fontSize: '13px', color: '#6b7280' }}>No assessments taken yet. Go to the Assessment tab to take your first test!</p></Card>;

    const radarData = { labels: skills.map(([k]) => k), datasets: [{ label: 'Your Skills', data: skills.map(([, v]) => v), backgroundColor: 'rgba(79,70,229,0.15)', borderColor: IND, borderWidth: 2, pointBackgroundColor: IND, pointRadius: 5 }] };
    const radarOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16, font: { family: 'Poppins', size: 12 } } } }, scales: { r: { angleLines: { color: '#e8eaf6' }, grid: { color: '#e8eaf6' }, pointLabels: { font: { family: 'Poppins', size: isMobile ? 10 : 12 } }, suggestedMin: 0, suggestedMax: 100 } } };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 0.8fr', gap: '20px' }}>
                <Card><SectionTitle icon="hub" text="Skill Radar" /><div style={{ height: isMobile ? '250px' : '300px' }}><Radar data={radarData} options={radarOpts} /></div></Card>
                <Card>
                    <SectionTitle icon="bar_chart" text="Skill Breakdown" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {skills.map(([skill, score]) => {
                            const lv = skillLevel(score); return (
                                <div key={skill}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>{skill}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Badge text={lv.label} color={lv.color} /><span style={{ fontSize: '12px', fontWeight: 700, color: IND }}>{score}%</span></div>
                                    </div>
                                    <div style={{ height: '7px', background: '#f0f0f8', borderRadius: '99px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${score}%`, background: score >= 80 ? 'linear-gradient(90deg,#059669,#34d399)' : score >= 60 ? `linear-gradient(90deg,${IND},${VIO})` : 'linear-gradient(90deg,#d97706,#fbbf24)', borderRadius: '99px', transition: 'width 0.8s ease' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </div>
    );
}
