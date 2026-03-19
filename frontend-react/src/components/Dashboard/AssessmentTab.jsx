import { useState } from 'react';
import { Card, SectionTitle, Badge, FONT, IND, VIO, QUIZ_BANK, CAREER_REQUIREMENTS } from './helpers';

export default function AssessmentTab({ skillScores, saveAssessment, isMobile }) {
    const M = isMobile;
    const [phase, setPhase] = useState('menu');
    const [selectedSkill, setSelectedSkill] = useState('');
    const [qIdx, setQIdx] = useState(0);
    const [selected, setSelected] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [score, setScore] = useState(0);

    const startQuiz = (skill) => {
        setSelectedSkill(skill); setQIdx(0); setSelected(null); setAnswers([]); setScore(0); setPhase('quiz');
    };

    const handleNext = () => {
        const correct = QUIZ_BANK[selectedSkill][qIdx].ans === selected;
        const newAnswers = [...answers, { correct, selected }];
        setAnswers(newAnswers);
        if (qIdx + 1 < QUIZ_BANK[selectedSkill].length) { setQIdx(qIdx + 1); setSelected(null); }
        else {
            const pct = Math.round((newAnswers.filter(a => a.correct).length / QUIZ_BANK[selectedSkill].length) * 100);
            setScore(pct);
            saveAssessment(selectedSkill, pct, newAnswers);
            setPhase('results');
        }
    };

    const allSkills = Object.keys(QUIZ_BANK);
    const hasScores = Object.keys(skillScores || {}).length > 0;
    
    // Calculate match purely based on what is achieved (starts at 0%)
    const gapRows = CAREER_REQUIREMENTS.map(cr => {
        const reqEntries = Object.entries(cr.reqs);
        if (reqEntries.length === 0) return { ...cr, match: 0 };
        
        const sumOfFractions = reqEntries.reduce((sum, [skill, req]) => {
            const have = skillScores[skill] || 0;
            // E.g., if req is 40 and you have 20, that's 0.5 (50%) of that skill's requirement. Cap at 1.0.
            const fractionMet = Math.min(1, have / req);
            return sum + fractionMet;
        }, 0);
        
        const averageMatch = Math.round((sumOfFractions / reqEntries.length) * 100);
        return { ...cr, match: averageMatch };
    }).sort((a, b) => b.match - a.match);

    /* ── QUIZ phase ── */
    if (phase === 'quiz') {
        const q = QUIZ_BANK[selectedSkill][qIdx];
        return (
            <div style={{ width: '100%', maxWidth: '620px', margin: '0 auto', boxSizing: 'border-box' }}>
                <div style={{
                    background: '#fff', borderRadius: '16px', padding: M ? '16px' : '24px',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #f0f0f8',
                    boxSizing: 'border-box', width: '100%',
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                        <button onClick={() => setPhase('menu')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT, padding: 0 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span> Back
                        </button>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>Q {qIdx + 1}/{QUIZ_BANK[selectedSkill].length}</span>
                        <Badge text={selectedSkill} color="indigo" />
                    </div>
                    {/* Progress */}
                    <div style={{ height: '5px', background: '#f0f0f8', borderRadius: '99px', overflow: 'hidden', marginBottom: '20px' }}>
                        <div style={{ height: '100%', width: `${((qIdx + 1) / QUIZ_BANK[selectedSkill].length) * 100}%`, background: `linear-gradient(90deg,${IND},${VIO})`, borderRadius: '99px', transition: 'width 0.4s' }} />
                    </div>
                    {/* Question */}
                    <h2 style={{ fontSize: M ? '14px' : '16px', fontWeight: 700, color: '#111827', marginBottom: '18px', lineHeight: 1.55 }}>{q.q}</h2>
                    {/* Options */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                        {q.opts.map((opt, i) => (
                            <button key={i} onClick={() => setSelected(i)} style={{
                                padding: M ? '10px 12px' : '12px 16px', borderRadius: '12px', textAlign: 'left', cursor: 'pointer',
                                fontFamily: FONT, fontSize: M ? '13px' : '14px', fontWeight: selected === i ? 600 : 400,
                                background: selected === i ? '#eef2ff' : '#f9fafb',
                                border: `2px solid ${selected === i ? IND : '#e5e7eb'}`,
                                color: selected === i ? IND : '#374151', transition: 'all 0.15s', width: '100%', boxSizing: 'border-box',
                            }}>
                                <span style={{ marginRight: '10px', fontWeight: 700, color: selected === i ? IND : '#9ca3af' }}>{String.fromCharCode(65 + i)}.</span>{opt}
                            </button>
                        ))}
                    </div>
                    {/* Next button */}
                    <button onClick={handleNext} disabled={selected === null} style={{
                        width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
                        background: selected !== null ? `linear-gradient(135deg,${IND},${VIO})` : '#e5e7eb',
                        color: '#fff', fontSize: '14px', fontWeight: 600,
                        cursor: selected !== null ? 'pointer' : 'not-allowed', fontFamily: FONT,
                    }}>
                        {qIdx + 1 < QUIZ_BANK[selectedSkill].length ? 'Next Question →' : 'Finish Test 🎯'}
                    </button>
                </div>
            </div>
        );
    }

    /* ── RESULTS phase ── */
    if (phase === 'results') {
        const color = score >= 80 ? '#059669' : score >= 60 ? IND : '#d97706';
        return (
            <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', boxSizing: 'border-box' }}>
                <div style={{
                    background: '#fff', borderRadius: '16px', padding: M ? '24px 16px' : '36px 32px',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #f0f0f8',
                    textAlign: 'center', boxSizing: 'border-box', width: '100%',
                }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#eef2ff', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '36px', color }}>{score >= 60 ? 'emoji_events' : 'school'}</span>
                    </div>
                    <h2 style={{ fontSize: M ? '18px' : '20px', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Assessment Complete!</h2>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px' }}>{selectedSkill}</p>
                    <div style={{ fontSize: M ? '44px' : '52px', fontWeight: 900, color, lineHeight: 1, marginBottom: '6px' }}>{score}%</div>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '10px' }}>
                        {answers.filter(a => a.correct).length}/{QUIZ_BANK[selectedSkill].length} correct · Saved to your profile ✓
                    </p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexDirection: M ? 'column' : 'row' }}>
                        <button onClick={() => startQuiz(selectedSkill)} style={{
                            flex: 1, width: '100%', padding: '12px', borderRadius: '10px',
                            border: `1.5px solid ${IND}`, background: 'transparent', color: IND,
                            fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: FONT, boxSizing: 'border-box',
                        }}>Retake</button>
                        <button onClick={() => setPhase('menu')} style={{
                            flex: 1, width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                            background: `linear-gradient(135deg,${IND},${VIO})`, color: '#fff',
                            fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: FONT, boxSizing: 'border-box',
                        }}>All Assessments</button>
                    </div>
                </div>
            </div>
        );
    }

    /* ── MENU phase ── */
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', boxSizing: 'border-box' }}>

            {/* ── Skill list ── */}
            <div style={{
                background: '#fff', borderRadius: '16px', padding: M ? '16px' : '24px',
                boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #f0f0f8', boxSizing: 'border-box',
            }}>
                <SectionTitle icon="quiz" text="Skill Assessments — Take a Test" />
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '-10px 0 16px' }}>
                    Results are saved to your account and update your Skill Matrix instantly
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: M ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
                    {allSkills.map(skill => {
                        const sc = skillScores[skill] || 0;
                        const lv = sc > 0 ? (sc >= 80 ? 'Expert' : sc >= 60 ? 'Proficient' : 'Intermediate') : 'Not Taken';
                        const col = sc >= 80 ? 'green' : sc >= 60 ? 'indigo' : sc > 0 ? 'yellow' : 'red';
                        return (
                            <div key={skill} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: M ? '12px' : '14px 16px', borderRadius: '12px',
                                background: '#f9fafb', border: '1px solid #f0f0f8', gap: '10px',
                            }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{skill}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <Badge text={lv} color={col} />
                                        {sc > 0 && <span style={{ fontSize: '11px', color: IND, fontWeight: 700 }}>{sc}%</span>}
                                    </div>
                                </div>
                                <button onClick={() => startQuiz(skill)} style={{
                                    flexShrink: 0, padding: M ? '7px 12px' : '8px 16px', borderRadius: '9px', border: 'none',
                                    background: `linear-gradient(135deg,${IND},${VIO})`, color: '#fff',
                                    fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
                                }}>{sc > 0 ? 'Retake' : 'Start'}</button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Skill Gap Table ── */}
            <div style={{
                background: '#fff', borderRadius: '16px', padding: M ? '16px' : '24px',
                boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #f0f0f8', boxSizing: 'border-box',
                overflow: 'hidden',
            }}>
                <SectionTitle icon="analytics" text="Skill Gap Analysis" />

                {M ? (
                    /* ── Mobile: stacked cards ── */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {gapRows.map((row, i) => (
                            <div key={i} style={{
                                padding: '14px', borderRadius: '12px',
                                background: i === 0 ? '#eef2ff' : '#f9fafb',
                                border: `1px solid ${i === 0 ? '#c7d2fe' : '#f0f0f8'}`,
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{row.career}</span>
                                    <span style={{
                                        fontSize: '13px', fontWeight: 800,
                                        color: row.match >= 75 ? '#059669' : row.match >= 50 ? IND : '#d97706',
                                        background: row.match >= 75 ? '#ecfdf5' : row.match >= 50 ? '#eef2ff' : '#fffbeb',
                                        padding: '3px 10px', borderRadius: '20px',
                                    }}>{row.match}%</span>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {allSkills.map(skill => {
                                        const req = row.reqs[skill] || 50;
                                        const have = hasScores ? (skillScores[skill] || 0) : 0;
                                        const gap = Math.max(0, req - have);
                                        return (
                                            <div key={skill} style={{
                                                flex: '1 1 calc(50% - 6px)', minWidth: '80px',
                                                padding: '6px 8px', borderRadius: '8px', background: '#fff',
                                                border: '1px solid #f0f0f8', textAlign: 'center',
                                            }}>
                                                <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600, marginBottom: '2px' }}>{skill}</div>
                                                <div style={{ fontSize: '12px', fontWeight: 700, color: (!hasScores || gap > 0) ? '#dc2626' : '#059669' }}>
                                                    {(!hasScores || gap > 0) ? `-${req}%` : '✓'}
                                                </div>
                                                <div style={{ fontSize: '9px', color: '#9ca3af' }}>{have}%/{req}%</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* ── Desktop: table ── */
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT, minWidth: '500px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f0f0f8' }}>
                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Career</th>
                                    {allSkills.map(s => (
                                        <th key={s} style={{ padding: '10px 6px', textAlign: 'center', fontSize: '10px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{s}</th>
                                    ))}
                                    <th style={{ padding: '10px 6px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Match</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gapRows.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f9fafb', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                        <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{row.career}</td>
                                        {allSkills.map(skill => {
                                            const req = row.reqs[skill] || 50;
                                            const have = hasScores ? (skillScores[skill] || 0) : 0;
                                            const gap = Math.max(0, req - have);
                                            return (
                                                <td key={skill} style={{ padding: '10px 6px', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '11px', fontWeight: 600, color: (!hasScores || gap > 0) ? '#dc2626' : '#059669' }}>{(!hasScores || gap > 0) ? `-${req}%` : '✓'}</div>
                                                    <div style={{ fontSize: '10px', color: '#9ca3af' }}>{have}%/{req}%</div>
                                                </td>
                                            );
                                        })}
                                        <td style={{ padding: '10px 6px', textAlign: 'center' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 700, color: row.match >= 75 ? '#059669' : row.match >= 50 ? IND : '#d97706' }}>{row.match}%</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    );
}
