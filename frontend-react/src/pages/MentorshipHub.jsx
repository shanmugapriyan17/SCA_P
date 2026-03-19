import { useState, useRef, useEffect } from 'react';
import api from '../api/client';
import Header from '../components/Common/Header';

/* ── Design tokens ── */
const IND = '#4f46e5';
const VIO = '#7c3aed';
const FONT = "'Poppins', system-ui, sans-serif";

const TOPICS = [
    'Career Transition', 'Technical Skills', 'Leadership',
    'Interview Prep', 'Salary Negotiation', 'Resume Review'
];
const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];
const STORAGE_KEY = 'sca_mentor_chat';

/* ── Quick-action prompts shown in header area ── */
const QUICK = [
    { icon: '🚀', label: 'Career Pivot' },
    { icon: '📈', label: 'Upskilling' },
    { icon: '💼', label: 'Interview Prep' },
    { icon: '💰', label: 'Salary Tips' },
];

function formatTime(d) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/* ── Shared field style ── */
const fieldStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '2px solid #e0e7ff',
    fontSize: '13px',
    fontFamily: FONT,
    outline: 'none',
    background: '#f8faff',
    color: '#0f172a',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
};

export default function MentorshipHub() {
    /* ── State (unchanged logic) ── */
    const [messages, setMessages] = useState(() => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved);
        } catch { /* ignore */ }
        return [{
            role: 'bot',
            text: "Welcome to the AI Mentorship Hub! 🎓 I'm your dedicated career mentor. Share your career goals or challenges, and I'll provide personalized guidance with actionable steps.",
            time: formatTime(new Date()),
        }];
    });
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [bookingData, setBookingData] = useState({ name: '', email: '', phone: '', topic: '', date: '', time: '' });
    const [bookingResult, setBookingResult] = useState(null);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const chatRef = useRef(null);

    useEffect(() => {
        const fn = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', fn);
        return () => window.removeEventListener('resize', fn);
    }, []);

    useEffect(() => {
        try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch { /* full */ }
    }, [messages]);

    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages, loading]);

    /* ── API calls (unchanged) ── */
    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg, time: formatTime(new Date()) }]);
        setLoading(true);
        try {
            const res = await api.post('/api/chatbot/mentor', { message: userMsg });
            const botText = res.data?.response || res.data?.message || 'Let me think about that…';
            setMessages(prev => [...prev, { role: 'bot', text: botText, time: formatTime(new Date()) }]);
        } catch {
            setMessages(prev => [...prev, { role: 'bot', text: "I'm having trouble connecting. Please try again in a moment.", time: formatTime(new Date()) }]);
        } finally {
            setLoading(false);
        }
    };

    const handleBookSession = async (e) => {
        e.preventDefault();
        if (!bookingData.name || !bookingData.email || !bookingData.phone || !bookingData.time) return;
        setBookingLoading(true);
        try {
            const res = await api.post('/api/chatbot/schedule-meeting', {
                name: bookingData.name,
                email: bookingData.email,
                phone: bookingData.phone,
                preferredTime: `${bookingData.date} ${bookingData.time}`,
            });
            setBookingResult(res.data);
        } catch {
            setBookingResult({ success: false, message: 'Failed to schedule. Try again.' });
        } finally {
            setBookingLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    /* ─────────────────────────────────────────────── */
    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#f8f9ff 0%,#f0f2ff 50%,#f8f4ff 100%)', fontFamily: FONT }}>
            <Header />

            {/* ── Keyframes for animations ── */}
            <style>{`
                @keyframes bounce3 { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
                @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                .msg-in { animation: fadeUp 0.25s ease both; }
            `}</style>

            <main style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '88px 16px 24px' : '96px 24px 32px' }}>

                {/* ── Page hero header ── */}
                <div style={{
                    background: `linear-gradient(135deg,${IND},${VIO})`,
                    borderRadius: '20px',
                    padding: isMobile ? '24px 20px' : '28px 36px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* BG blobs */}
                    <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '180px', height: '180px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', bottom: '-20px', left: '40%', width: '120px', height: '120px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', flexShrink: 0 }}>
                            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '28px' }}>school</span>
                        </div>
                        <div>
                            <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 800, color: '#fff', margin: 0 }}>AI Mentorship Hub</h1>
                            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', margin: '3px 0 0' }}>Personalized career guidance, powered by AI</p>
                        </div>
                    </div>

                    {/* Quick-action chips */}
                    {!isMobile && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', position: 'relative' }}>
                            {QUICK.map(q => (
                                <button key={q.label}
                                    onClick={() => setInput(`Help me with ${q.label.toLowerCase()}`)}
                                    style={{
                                        padding: '7px 14px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.3)',
                                        background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: '12px', fontWeight: 600,
                                        cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '6px',
                                        backdropFilter: 'blur(8px)', transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                                >{q.icon} {q.label}</button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Main 2-column grid ── */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: '20px', alignItems: 'start' }}>

                    {/* ══════ CHAT PANEL ══════ */}
                    <div style={{
                        background: '#fff',
                        borderRadius: '20px',
                        border: '1px solid #e0e7ff',
                        boxShadow: '0 4px 24px rgba(79,70,229,0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        height: isMobile ? '70vh' : 'calc(100vh - 200px)',
                        minHeight: '480px',
                    }}>

                        {/* Chat Header */}
                        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f8', flexShrink: 0, background: 'linear-gradient(to right,#fafbff,#f5f3ff)', borderRadius: '20px 20px 0 0' }}>
                            {/* Top row: avatar + name */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: `linear-gradient(135deg,${IND},${VIO})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(79,70,229,0.3)', flexShrink: 0 }}>
                                            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '22px' }}>psychology</span>
                                        </div>
                                        <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', border: '2px solid #fff' }} />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: FONT, whiteSpace: 'nowrap' }}>AI Career Mentor</h2>
                                        <p style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, margin: 0 }}>● Online — Ready to guide you</p>
                                    </div>
                                </div>
                            </div>
                            {/* Mobile quick chips — full row below title */}
                            {isMobile && (
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                                    {QUICK.slice(0, 4).map(q => (
                                        <button key={q.label}
                                            onClick={() => setInput(`Help me with ${q.label.toLowerCase()}`)}
                                            style={{ padding: '5px 10px', borderRadius: '99px', border: `1px solid #e0e7ff`, background: '#f0f0f8', color: IND, fontSize: '10px', fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}
                                        >{q.icon} {q.label}</button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Messages */}
                        <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', scrollbarWidth: 'thin', scrollbarColor: '#e0e7ff transparent' }}>
                            {messages.map((msg, i) => (
                                <div key={i} className="msg-in" style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'column' : 'row', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '8px' }}>
                                    {msg.role === 'bot' && (
                                        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg,#eef2ff,#f5f3ff)', border: '1px solid #e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                            <span className="material-symbols-outlined" style={{ color: IND, fontSize: '16px' }}>psychology</span>
                                        </div>
                                    )}
                                    <div>
                                        <div style={{
                                            maxWidth: isMobile ? '85%' : '75%',
                                            padding: '12px 16px',
                                            borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                            background: msg.role === 'user'
                                                ? `linear-gradient(135deg,${IND},${VIO})`
                                                : '#f8f9ff',
                                            border: msg.role === 'bot' ? '1px solid #e0e7ff' : 'none',
                                            boxShadow: msg.role === 'user' ? '0 4px 12px rgba(79,70,229,0.25)' : '0 1px 4px rgba(0,0,0,0.04)',
                                        }}>
                                            <p style={{ fontSize: '13px', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap', color: msg.role === 'user' ? '#fff' : '#334155' }}>{msg.text}</p>
                                        </div>
                                        <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginTop: '3px', textAlign: msg.role === 'user' ? 'right' : 'left', paddingLeft: msg.role === 'bot' ? '4px' : 0 }}>{msg.time}</span>
                                    </div>
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {loading && (
                                <div className="msg-in" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg,#eef2ff,#f5f3ff)', border: '1px solid #e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span className="material-symbols-outlined" style={{ color: IND, fontSize: '16px' }}>psychology</span>
                                    </div>
                                    <div style={{ padding: '14px 18px', borderRadius: '16px 16px 16px 4px', background: '#f8f9ff', border: '1px solid #e0e7ff', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        {[0, 1, 2].map(n => (
                                            <div key={n} style={{ width: '7px', height: '7px', borderRadius: '50%', background: IND, opacity: 0.6, animation: 'bounce3 1.2s infinite', animationDelay: `${n * 0.2}s` }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input bar */}
                        <div style={{ padding: '14px 16px', borderTop: '1px solid #f0f0f8', flexShrink: 0, background: '#fafbff' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask your mentor anything…"
                                    style={{ ...fieldStyle, flex: 1, borderRadius: '14px', padding: '12px 18px' }}
                                    onFocus={e => e.target.style.borderColor = IND}
                                    onBlur={e => e.target.style.borderColor = '#e0e7ff'}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim() || loading}
                                    style={{
                                        width: '46px', height: '46px', borderRadius: '14px', border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                                        background: input.trim() ? `linear-gradient(135deg,${IND},${VIO})` : '#e0e7ff',
                                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: input.trim() ? '0 4px 14px rgba(79,70,229,0.35)' : 'none',
                                        transition: 'all 0.2s', flexShrink: 0,
                                    }}
                                    onMouseEnter={e => { if (input.trim()) e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.45)'; }}
                                    onMouseLeave={e => { if (input.trim()) e.currentTarget.style.boxShadow = '0 4px 14px rgba(79,70,229,0.35)'; }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>send</span>
                                </button>
                            </div>
                            <p style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center', marginTop: '8px' }}>Press Enter to send • Shift+Enter for new line</p>
                        </div>
                    </div>

                    {/* ══════ RIGHT SIDEBAR ══════ */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* ── Book a Session card ── */}
                        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e0e7ff', boxShadow: '0 4px 20px rgba(79,70,229,0.07)' }}>
                            {/* Card header */}
                            <div style={{ background: `linear-gradient(135deg,${IND},${VIO})`, padding: '18px 20px', position: 'relative', overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
                                <div style={{ position: 'absolute', top: '-18px', right: '-18px', width: '80px', height: '80px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '20px' }}>calendar_month</span>
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: 0, fontFamily: FONT }}>Book a Live Session</h3>
                                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', margin: 0 }}>1-on-1 mentoring via Google Meet</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '20px' }}>
                                {bookingResult ? (
                                    /* ── Success / Error state ── */
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{
                                            padding: '20px 16px',
                                            borderRadius: '14px',
                                            background: bookingResult.success ? '#f0fdf4' : '#fff1f2',
                                            border: `1px solid ${bookingResult.success ? '#bbf7d0' : '#fecdd3'}`,
                                            marginBottom: '14px',
                                        }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: bookingResult.success ? '#16a34a' : '#e11d48', display: 'block', marginBottom: '8px' }}>
                                                {bookingResult.success ? 'check_circle' : 'error'}
                                            </span>
                                            <p style={{ fontWeight: 700, fontSize: '14px', color: bookingResult.success ? '#15803d' : '#be123c', margin: '0 0 4px' }}>
                                                {bookingResult.success ? '✅ Session Booked!' : 'Booking Failed'}
                                            </p>
                                            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{bookingResult.message}</p>
                                        </div>

                                        {/* Meeting ID */}
                                        {bookingResult.meetId && (
                                            <div style={{ padding: '12px', borderRadius: '12px', background: '#eef2ff', border: '1px solid #c7d2fe', marginBottom: '10px', textAlign: 'center' }}>
                                                <p style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>Meeting ID</p>
                                                <p style={{ fontSize: '18px', fontWeight: 900, color: IND, fontFamily: 'monospace', letterSpacing: '2px', margin: 0 }}>{bookingResult.meetId}</p>
                                            </div>
                                        )}

                                        {/* Booking details grid */}
                                        {bookingResult.success && (
                                            <div style={{ textAlign: 'left', padding: '12px', borderRadius: '12px', background: '#f8faff', border: '1px solid #e0e7ff', marginBottom: '10px' }}>
                                                {[
                                                    ['person', bookingResult.name],
                                                    ['mail', bookingResult.email],
                                                    ['schedule', bookingResult.preferredTime],
                                                    ['database', `Saved (ID #${bookingResult.bookingId})`],
                                                ].map(([icon, val]) => val && (
                                                    <div key={icon} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '12px' }}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#94a3b8' }}>{icon}</span>
                                                        <span style={{ color: '#334155' }}>{val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Meet link */}
                                        {bookingResult.meetLink && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: '10px' }}>
                                                <span className="material-symbols-outlined" style={{ color: '#16a34a', fontSize: '18px' }}>video_call</span>
                                                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#334155', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bookingResult.meetLink}</span>
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(bookingResult.meetLink)}
                                                    style={{ padding: '4px 10px', borderRadius: '8px', background: IND, color: '#fff', fontSize: '11px', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: FONT, flexShrink: 0 }}
                                                >Copy</button>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => { setBookingResult(null); setBookingData({ name: '', email: '', phone: '', topic: '', date: '', time: '' }); }}
                                            style={{ fontSize: '12px', color: IND, background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT, fontWeight: 600, textDecoration: 'underline' }}
                                        >Book another session →</button>
                                    </div>
                                ) : (
                                    /* ── Booking Form ── */
                                    <form onSubmit={handleBookSession} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {/* Name */}
                                        <div>
                                            <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>Full Name *</label>
                                            <input value={bookingData.name} onChange={e => setBookingData(p => ({ ...p, name: e.target.value }))}
                                                placeholder="e.g. Arjun Kumar" required style={fieldStyle}
                                                onFocus={e => e.target.style.borderColor = IND} onBlur={e => e.target.style.borderColor = '#e0e7ff'} />
                                        </div>
                                        {/* Email */}
                                        <div>
                                            <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>Email Address *</label>
                                            <input type="email" value={bookingData.email} onChange={e => setBookingData(p => ({ ...p, email: e.target.value }))}
                                                placeholder="you@example.com" required style={fieldStyle}
                                                onFocus={e => e.target.style.borderColor = IND} onBlur={e => e.target.style.borderColor = '#e0e7ff'} />
                                        </div>
                                        {/* Phone */}
                                        <div>
                                            <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>Phone Number *</label>
                                            <input value={bookingData.phone} onChange={e => setBookingData(p => ({ ...p, phone: e.target.value }))}
                                                placeholder="+91 98765 43210" required style={fieldStyle}
                                                onFocus={e => e.target.style.borderColor = IND} onBlur={e => e.target.style.borderColor = '#e0e7ff'} />
                                        </div>
                                        {/* Topic */}
                                        <div>
                                            <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>Session Topic</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '6px' }}>
                                                {TOPICS.map(t => (
                                                    <button type="button" key={t}
                                                        onClick={() => setBookingData(p => ({ ...p, topic: t }))}
                                                        style={{
                                                            padding: '8px 4px', borderRadius: '9px', fontSize: '11px', fontWeight: 700,
                                                            border: `2px solid ${bookingData.topic === t ? IND : '#e0e7ff'}`,
                                                            background: bookingData.topic === t ? `linear-gradient(135deg,${IND},${VIO})` : '#f8faff',
                                                            color: bookingData.topic === t ? '#fff' : '#475569',
                                                            cursor: 'pointer', fontFamily: FONT, transition: 'all 0.15s',
                                                        }}
                                                    >{t}</button>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Date */}
                                        <div>
                                            <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>Preferred Date</label>
                                            <input type="date" value={bookingData.date} onChange={e => setBookingData(p => ({ ...p, date: e.target.value }))}
                                                style={{ ...fieldStyle, color: bookingData.date ? '#0f172a' : '#94a3b8' }}
                                                onFocus={e => e.target.style.borderColor = IND} onBlur={e => e.target.style.borderColor = '#e0e7ff'} />
                                        </div>
                                        {/* Time slots */}
                                        <div>
                                            <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>Time Slot *</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px' }}>
                                                {TIME_SLOTS.map(t => (
                                                    <button type="button" key={t}
                                                        onClick={() => setBookingData(p => ({ ...p, time: t }))}
                                                        style={{
                                                            padding: '8px 4px', borderRadius: '9px', fontSize: '11px', fontWeight: 700,
                                                            border: `2px solid ${bookingData.time === t ? IND : '#e0e7ff'}`,
                                                            background: bookingData.time === t ? `linear-gradient(135deg,${IND},${VIO})` : '#f8faff',
                                                            color: bookingData.time === t ? '#fff' : '#475569',
                                                            cursor: 'pointer', fontFamily: FONT, transition: 'all 0.15s',
                                                        }}
                                                    >{t}</button>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Submit */}
                                        <button type="submit" disabled={bookingLoading}
                                            style={{
                                                width: '100%', padding: '13px', borderRadius: '12px', border: 'none', marginTop: '4px',
                                                background: `linear-gradient(135deg,${IND},${VIO})`,
                                                color: '#fff', fontSize: '14px', fontWeight: 700, cursor: bookingLoading ? 'wait' : 'pointer',
                                                fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                boxShadow: '0 4px 16px rgba(79,70,229,0.3)', transition: 'all 0.2s',
                                                opacity: bookingLoading ? 0.7 : 1,
                                            }}
                                        >
                                            {bookingLoading
                                                ? <><span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Booking…</>
                                                : <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>video_call</span>Book Session</>
                                            }
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* ── Popular Topics card ── */}
                        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e0e7ff', boxShadow: '0 4px 20px rgba(79,70,229,0.07)', padding: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                <span className="material-symbols-outlined" style={{ color: IND, fontSize: '20px' }}>tag</span>
                                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: FONT }}>Popular Topics</h3>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {TOPICS.map((topic, i) => {
                                    const colors = [
                                        { bg: '#eef2ff', color: IND, border: '#c7d2fe' },
                                        { bg: '#f5f3ff', color: VIO, border: '#ddd6fe' },
                                        { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
                                        { bg: '#fff7ed', color: '#d97706', border: '#fde68a' },
                                        { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3' },
                                        { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
                                    ];
                                    const c = colors[i % colors.length];
                                    return (
                                        <button key={topic}
                                            onClick={() => setInput(`I need guidance on ${topic.toLowerCase()}`)}
                                            style={{
                                                padding: '6px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                                                border: `1px solid ${c.border}`, background: c.bg, color: c.color,
                                                cursor: 'pointer', fontFamily: FONT, transition: 'all 0.15s',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 3px 8px rgba(0,0,0,0.1)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                                        >{topic}</button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── AI features info card ── */}
                        <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e1b4b)', borderRadius: '20px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: '#4f46e5', borderRadius: '50%', filter: 'blur(50px)', opacity: 0.3 }} />
                            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', margin: '0 0 12px', fontFamily: FONT, position: 'relative' }}>✨ What your mentor can do</h4>
                            {[
                                ['🎯', 'Chart your career path'],
                                ['📋', 'Review your resume & skills'],
                                ['💡', 'Interview tips & mock Q&A'],
                                ['📈', 'Salary negotiation advice'],
                                ['🔁', 'Plan a career transition'],
                            ].map(([icon, text]) => (
                                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', position: 'relative' }}>
                                    <span style={{ fontSize: '14px' }}>{icon}</span>
                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
