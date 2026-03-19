import { useState, useEffect, useRef } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { FONT, IND, VIO } from './helpers';

const SKILL_COLORS = ['#4f46e5', '#7c3aed', '#0284c7', '#059669', '#d97706'];
const SKILL_ICONS = ['code', 'psychology', 'storage', 'cloud', 'analytics'];

function Label({ children }) {
    return <label style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '6px' }}>{children}</label>;
}
function Input({ value, onChange, placeholder, type = 'text', disabled }) {
    const [focused, setFocused] = useState(false);
    return (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{
                width: '100%', padding: '11px 14px', borderRadius: '12px', fontFamily: FONT, fontSize: '13px',
                border: `1.5px solid ${focused ? IND : '#e5e7eb'}`, outline: 'none', transition: 'border 0.2s, box-shadow 0.2s',
                boxSizing: 'border-box', background: disabled ? '#f9fafb' : '#fff', color: disabled ? '#9ca3af' : '#111827',
                boxShadow: focused ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
            }} />
    );
}
function calcAge(dob) {
    if (!dob) return '';
    const d = new Date(dob); const t = new Date();
    let age = t.getFullYear() - d.getFullYear();
    if (t < new Date(t.getFullYear(), d.getMonth(), d.getDate())) age--;
    return age > 0 ? `${age} yrs old` : '';
}

export default function ProfileTab({ profileData, setProfileData, resumeInfo, setResumeInfo, isMobile }) {
    const M = isMobile;
    const { user, refreshProfile } = useAuth();
    const fileRef = useRef();
    const [form, setForm] = useState({ first_name: '', last_name: '', dob: '', phone: '', skills: ['', '', '', '', ''] });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ text: '', ok: true });
    const [uploading, setUploading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState('');
    const [activeSection, setActiveSection] = useState('personal');

    useEffect(() => {
        if (profileData) {
            const parts = (profileData.full_name || '').split(' ');
            const s = profileData.skills || [];
            setForm({
                first_name: parts[0] || '', last_name: parts.slice(1).join(' ') || '',
                dob: profileData.dob || '', phone: profileData.phone || '',
                skills: [s[0] || '', s[1] || '', s[2] || '', s[3] || '', s[4] || ''],
            });
        }
    }, [profileData]);

    const handleSave = async () => {
        setSaving(true); setMsg({ text: '', ok: true });
        const full_name = `${form.first_name} ${form.last_name}`.trim();
        const initials = `${form.first_name?.[0] || ''}${form.last_name?.[0] || ''}`.toUpperCase();
        const skills = form.skills.filter(Boolean);
        try {
            await api.post('/api/profile', { full_name, initials, phone: form.phone, dob: form.dob, skills });
            await refreshProfile();
            const pRes = await api.get('/api/profile');
            setProfileData(pRes.data.user);
            setMsg({ text: '✓ Profile saved successfully!', ok: true });
        } catch (e) { setMsg({ text: '✗ Failed to save. Try again.', ok: false }); }
        setSaving(false);
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        setUploading(true); setUploadMsg('');
        const fd = new FormData(); fd.append('file', file);
        try {
            const res = await api.post('/api/upload-resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data.success) {
                const rRes = await api.get('/api/profile/resume');
                setResumeInfo(rRes.data.resume);
                setUploadMsg('✓ Resume uploaded successfully!');
            }
        } catch (err) {
            setUploadMsg('✗ Upload failed: ' + (err?.message || 'unknown error'));
            console.error('Upload error:', err);
        }
        setUploading(false);
        if (fileRef.current) fileRef.current.value = '';
    };

    const displayName = [form.first_name, form.last_name].filter(Boolean).join(' ') || user?.username || 'Your Name';
    const initials = `${form.first_name?.[0] || ''}${form.last_name?.[0] || user?.username?.[0] || 'U'}`.toUpperCase();
    const completedFields = [form.first_name, form.last_name, form.dob, form.phone, ...form.skills.filter(Boolean)].filter(Boolean).length;
    const completionPct = Math.round((completedFields / 9) * 100);

    const cardStyle = {
        background: '#fff', borderRadius: '16px', padding: M ? '14px' : '24px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.05)', border: '1px solid #f0f0f8',
        boxSizing: 'border-box', width: '100%',
    };

    return (
        <div style={{ maxWidth: '800px', width: '100%', fontFamily: FONT, boxSizing: 'border-box' }}>

            {/* ── Hero header ── */}
            <div style={{
                background: `linear-gradient(135deg, ${IND} 0%, ${VIO} 55%, #a855f7 100%)`,
                borderRadius: M ? '14px' : '20px', padding: M ? '16px' : '28px',
                marginBottom: '20px', position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
            }}>
                {/* Decorative blobs */}
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-50px', right: '60px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

                {/* Content */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative', flexWrap: 'wrap' }}>
                    {/* Avatar + name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 200px', minWidth: 0 }}>
                        <div style={{
                            width: M ? '52px' : '68px', height: M ? '52px' : '68px', flexShrink: 0,
                            borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                            border: '3px solid rgba(255,255,255,0.4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: M ? '18px' : '24px', fontWeight: 800, color: '#fff',
                        }}>
                            {initials}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <h1 style={{ fontSize: M ? '16px' : '20px', fontWeight: 800, color: '#fff', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</h1>
                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', margin: '0 0 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {form.phone && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '13px' }}>phone</span>{form.phone}</span>}
                                {form.dob && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '13px' }}>cake</span>{calcAge(form.dob)}</span>}
                                {resumeInfo && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '13px' }}>description</span>Resume ✓</span>}
                            </div>
                        </div>
                    </div>

                    {/* Completion bar */}
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: M ? '22px' : '28px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{completionPct}%</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', margin: '3px 0 6px' }}>Profile Complete</div>
                        <div style={{ width: M ? '60px' : '80px', height: '5px', background: 'rgba(255,255,255,0.2)', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${completionPct}%`, background: '#fff', borderRadius: '99px', transition: 'width 0.6s' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Section Tabs ── */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '18px', background: '#f0f0f8', borderRadius: '12px', padding: '5px' }}>
                {[
                    { id: 'personal', icon: 'badge', label: 'Personal' },
                    { id: 'skills', icon: 'psychology', label: 'Skills' },
                    { id: 'resume', icon: 'description', label: 'Resume' },
                ].map(s => (
                    <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: M ? '0' : '6px', padding: M ? '10px 6px' : '10px 14px',
                        borderRadius: '9px', fontFamily: FONT, fontSize: M ? '12px' : '13px',
                        fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                        background: activeSection === s.id ? '#fff' : 'transparent',
                        color: activeSection === s.id ? IND : '#6b7280',
                        boxShadow: activeSection === s.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{s.icon}</span>
                        {!M && s.label}
                        {M && <span style={{ fontSize: '10px', marginTop: '1px' }}>{s.label}</span>}
                    </button>
                ))}
            </div>

            {/* ── PERSONAL ── */}
            {activeSection === 'personal' && (
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: IND }}>badge</span>
                        </div>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>Personal Information</h3>
                    </div>

                    {msg.text && (
                        <div style={{ padding: '10px 14px', borderRadius: '10px', background: msg.ok ? '#ecfdf5' : '#fef2f2', color: msg.ok ? '#059669' : '#dc2626', fontSize: '13px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{msg.ok ? 'check_circle' : 'error'}</span>{msg.text}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: M ? '1fr' : '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                        <div><Label>First Name</Label><Input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} placeholder="e.g. John" /></div>
                        <div><Label>Last Name</Label><Input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} placeholder="e.g. S" /></div>
                        <div>
                            <Label>Date of Birth</Label>
                            <Input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
                            {form.dob && <p style={{ fontSize: '12px', color: IND, fontWeight: 700, margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '13px' }}>cake</span>{calcAge(form.dob)}</p>}
                        </div>
                        <div><Label>Mobile Number</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 9876543210" /></div>
                        <div><Label>Email (account)</Label><Input value={user?.email || ''} disabled /></div>
                        <div><Label>Username (account)</Label><Input value={user?.username || ''} disabled /></div>
                    </div>

                    <button onClick={handleSave} disabled={saving} style={{
                        width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
                        background: saving ? '#9ca3af' : `linear-gradient(135deg,${IND},${VIO})`,
                        color: '#fff', fontSize: '14px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: FONT,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                        boxShadow: saving ? 'none' : '0 4px 14px rgba(79,70,229,0.35)', boxSizing: 'border-box',
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>{saving ? 'hourglass_empty' : 'save'}</span>
                        {saving ? 'Saving…' : 'Save Profile'}
                    </button>
                </div>
            )}

            {/* ── SKILLS ── */}
            {activeSection === 'skills' && (
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: VIO }}>psychology</span>
                        </div>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>Top 5 Skills</h3>
                    </div>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '18px', marginTop: '4px' }}>Add up to 5 of your strongest skills. They help match career recommendations.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                        {[0, 1, 2, 3, 4].map(i => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '36px', height: '36px', flexShrink: 0, borderRadius: '10px',
                                    background: form.skills[i] ? SKILL_COLORS[i] + '18' : '#f5f5f5',
                                    border: `1.5px solid ${form.skills[i] ? SKILL_COLORS[i] + '40' : '#e5e7eb'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '17px', color: form.skills[i] ? SKILL_COLORS[i] : '#9ca3af' }}>{SKILL_ICONS[i]}</span>
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <Input
                                        value={form.skills[i]}
                                        onChange={e => { const s = [...form.skills]; s[i] = e.target.value; setForm({ ...form, skills: s }); }}
                                        placeholder={`Skill ${i + 1} — e.g. ${['Python', 'Machine Learning', 'SQL', 'React', 'Cloud/AWS'][i]}`}
                                    />
                                </div>
                                {form.skills[i] && (
                                    <div style={{ padding: '4px 10px', borderRadius: '20px', background: SKILL_COLORS[i] + '15', color: SKILL_COLORS[i], fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>✓</div>
                                )}
                            </div>
                        ))}
                    </div>

                    {form.skills.some(Boolean) && (
                        <div style={{ padding: '14px', borderRadius: '12px', background: '#f8f9ff', border: '1px solid #e8eaf6', marginBottom: '18px' }}>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Skills Preview</p>
                            <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                                {form.skills.filter(Boolean).map((s, i) => (
                                    <span key={i} style={{ padding: '5px 12px', borderRadius: '20px', background: `linear-gradient(135deg,${SKILL_COLORS[i]},${SKILL_COLORS[(i + 1) % 5]})`, color: '#fff', fontSize: '12px', fontWeight: 600 }}>{s}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <button onClick={handleSave} disabled={saving} style={{
                        width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
                        background: `linear-gradient(135deg,${IND},${VIO})`, color: '#fff', fontSize: '14px', fontWeight: 700,
                        cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '7px', boxShadow: '0 4px 14px rgba(79,70,229,0.35)', boxSizing: 'border-box',
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>save</span>
                        {saving ? 'Saving…' : 'Save Skills'}
                    </button>
                </div>
            )}

            {/* ── RESUME ── */}
            {activeSection === 'resume' && (
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#059669' }}>description</span>
                        </div>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>My Resume</h3>
                    </div>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '18px', marginTop: '4px' }}>Upload your resume (PDF or TXT). View and download it anytime.</p>

                    {uploadMsg && (
                        <div style={{ padding: '10px 14px', borderRadius: '10px', background: uploadMsg.startsWith('✓') ? '#ecfdf5' : '#fef2f2', color: uploadMsg.startsWith('✓') ? '#059669' : '#dc2626', fontSize: '13px', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>{uploadMsg.startsWith('✓') ? 'check_circle' : 'error'}</span>{uploadMsg}
                        </div>
                    )}

                    {resumeInfo ? (
                        <div>
                            {/* Uploaded resume card */}
                            <div style={{
                                borderRadius: '14px', background: 'linear-gradient(135deg,#eef2ff,#f5f3ff)',
                                border: '1.5px solid #c7d2fe', padding: '16px', marginBottom: '14px',
                                display: 'flex', flexDirection: 'column', gap: '12px',
                            }}>
                                {/* Icon + filename row */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '44px', height: '44px', flexShrink: 0, borderRadius: '12px',
                                        background: `linear-gradient(135deg,${IND},${VIO})`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#fff' }}>description</span>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resumeInfo.filename}</p>
                                        <p style={{ fontSize: '11px', color: '#6b7280', margin: 0, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>schedule</span>
                                            Uploaded {resumeInfo.upload_date ? new Date(resumeInfo.upload_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'recently'}
                                        </p>
                                    </div>
                                </div>
                                {/* Download button — full width on mobile */}
                                <a
                                    href={`http://localhost:10000${resumeInfo.download_url}`}
                                    target="_blank" rel="noreferrer" download
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                        padding: '11px', borderRadius: '10px', width: '100%', boxSizing: 'border-box',
                                        background: `linear-gradient(135deg,${IND},${VIO})`, color: '#fff',
                                        fontSize: '13px', fontWeight: 700, textDecoration: 'none',
                                        boxShadow: '0 2px 10px rgba(79,70,229,0.3)',
                                    }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>Download Resume
                                </a>
                            </div>

                            {/* Replace */}
                            <label style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                padding: '12px', borderRadius: '12px', border: `1.5px dashed ${IND}`,
                                color: IND, fontSize: '13px', fontWeight: 600,
                                cursor: uploading ? 'not-allowed' : 'pointer', background: '#fafafe', transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = '#eef2ff'}
                                onMouseLeave={e => e.currentTarget.style.background = '#fafafe'}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload</span>
                                {uploading ? 'Uploading…' : 'Replace Resume'}
                                <input ref={fileRef} type="file" accept=".pdf,.txt" onChange={handleResumeUpload} style={{ display: 'none' }} />
                            </label>
                        </div>
                    ) : (
                        /* Upload drop zone */
                        <label style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            padding: M ? '32px 16px' : '48px 32px', textAlign: 'center',
                            borderRadius: '16px', border: `2px dashed ${uploading ? IND : '#c7d2fe'}`,
                            background: uploading ? '#eef2ff' : '#fafafe',
                            cursor: uploading ? 'not-allowed' : 'pointer', transition: 'all 0.3s', boxSizing: 'border-box',
                        }}
                            onMouseEnter={e => { if (!uploading) { e.currentTarget.style.borderColor = IND; e.currentTarget.style.background = '#eef2ff'; } }}
                            onMouseLeave={e => { if (!uploading) { e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.background = '#fafafe'; } }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: uploading ? `linear-gradient(135deg,${IND},${VIO})` : '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', transition: 'all 0.3s' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '28px', color: uploading ? '#fff' : IND }}>{uploading ? 'hourglass_empty' : 'cloud_upload'}</span>
                            </div>
                            <p style={{ fontSize: M ? '14px' : '16px', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>{uploading ? 'Uploading…' : 'Upload Your Resume'}</p>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 18px' }}>PDF or TXT · Max 5MB</p>
                            {!uploading && (
                                <span style={{ padding: '9px 22px', borderRadius: '10px', background: `linear-gradient(135deg,${IND},${VIO})`, color: '#fff', fontSize: '13px', fontWeight: 700, boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>Choose File</span>
                            )}
                            <input ref={fileRef} type="file" accept=".pdf,.txt" onChange={handleResumeUpload} style={{ display: 'none' }} />
                        </label>
                    )}
                </div>
            )}
        </div>
    );
}
