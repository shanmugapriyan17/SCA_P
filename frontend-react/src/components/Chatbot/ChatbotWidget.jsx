import { useState, useRef, useEffect } from 'react';
import api from '../../api/client';

const FONT = "'Poppins', system-ui, sans-serif";

/* Inject CSS once */
const STYLES = `
@keyframes cora-pop { 0%{transform:scale(0.8);opacity:0} 100%{transform:scale(1);opacity:1} }
@keyframes cora-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.4)} 70%{box-shadow:0 0 0 10px rgba(99,102,241,0)} }
@keyframes cora-bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
@keyframes cora-slide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes cora-marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
.cora-marquee-track { animation: cora-marquee 14s linear infinite; }
.cora-marquee-track:hover { animation-play-state: paused; }
`;

/* Logo mark SVG */
function LogoMark({ size = 20, color = '#fff' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="7" cy="18" rx="5" ry="13" fill={color} opacity="0.40" />
            <ellipse cx="12" cy="18" rx="6.5" ry="16" fill={color} opacity="0.60" />
            <ellipse cx="18" cy="18" rx="6.5" ry="18" fill={color} opacity="0.90" />
            <ellipse cx="24" cy="18" rx="6.5" ry="16" fill={color} opacity="0.60" />
            <ellipse cx="29" cy="18" rx="5" ry="13" fill={color} opacity="0.40" />
        </svg>
    );
}

function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: "Hi! 👋 I'm **Cora**, your AI career companion.\nAsk me about career paths, skill gaps, or interview prep!" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatRef = useRef(null);

    useEffect(() => {
        if (!document.getElementById('cora-style')) {
            const s = document.createElement('style');
            s.id = 'cora-style';
            s.textContent = STYLES;
            document.head.appendChild(s);
        }
    }, []);

    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages]);

    const send = async (msg) => {
        const text = (msg || input).trim();
        if (!text || loading) return;
        setInput('');
        setMessages(p => [...p, { role: 'user', text }]);
        setLoading(true);
        try {
            const res = await api.post('/api/chatbot/chat', { message: text });
            const reply = res.data?.response || res.data?.message || "I'm here to help with your career!";
            setMessages(p => [...p, { role: 'bot', text: reply }]);
        } catch {
            setMessages(p => [...p, { role: 'bot', text: "Sorry, I'm having trouble connecting. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    /* ────────── CLOSED STATE ────────── */
    if (!isOpen) return (
        <button
            onClick={() => setIsOpen(true)}
            title="Chat with Cora"
            style={{
                position: 'fixed', bottom: '28px', right: '28px', zIndex: 1000,
                width: '56px', height: '56px', borderRadius: '16px',
                background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(79,70,229,0.5)',
                animation: 'cora-pulse 2.5s infinite',
                transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
            <LogoMark size={26} color="#fff" />
            <span style={{
                position: 'absolute', top: '-5px', right: '-5px',
                width: '18px', height: '18px', borderRadius: '50%',
                background: '#22c55e', border: '2px solid #fff',
                fontSize: '9px', fontWeight: 700, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: FONT,
            }}>1</span>
        </button>
    );

    /* ────────── OPEN STATE ────────── */
    return (
        <div style={{
            position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
            width: 'calc(100% - 48px)', maxWidth: '390px',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(79,70,229,0.2), 0 4px 16px rgba(0,0,0,0.08)',
            fontFamily: FONT,
            animation: 'cora-pop 0.25s ease',
            display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto auto',
            maxHeight: 'calc(100vh - 120px)',
            transformOrigin: 'bottom right',
        }}>
            {/* ── HEADER ── */}
            <div style={{
                padding: '18px 22px',
                background: 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Avatar */}
                    <div style={{
                        width: '38px', height: '38px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.18)',
                        border: '1.5px solid rgba(255,255,255,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <LogoMark size={22} color="#fff" />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>Cora</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', flexShrink: 0, display: 'inline-block' }} />
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)' }}>Online • AI Career Advisor</span>
                        </div>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} style={{
                    width: '28px', height: '28px', borderRadius: '8px', border: 'none',
                    background: 'rgba(255,255,255,0.15)', color: '#fff',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.15s',
                }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>close</span>
                </button>
            </div>

            {/* ── MESSAGES ── */}
            <div ref={chatRef} style={{
                overflowY: 'auto', padding: '20px 18px',
                background: '#f5f6fb',
                display: 'flex', flexDirection: 'column', gap: '16px',
            }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                        alignItems: 'flex-end', gap: '8px',
                        animation: 'cora-slide 0.2s ease',
                    }}>
                        {/* Avatar bubble */}
                        {msg.role === 'bot' && (
                            <div style={{
                                width: '28px', height: '28px', borderRadius: '8px',
                                background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <LogoMark size={16} color="#fff" />
                            </div>
                        )}
                        {/* Message */}
                        <div style={{
                            maxWidth: '74%',
                            padding: '11px 15px',
                            borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                            background: msg.role === 'user'
                                ? 'linear-gradient(135deg,#4f46e5,#7c3aed)'
                                : '#fff',
                            color: msg.role === 'user' ? '#fff' : '#111827',
                            fontSize: '13px', lineHeight: 1.6,
                            boxShadow: msg.role === 'user'
                                ? '0 3px 12px rgba(79,70,229,0.28)'
                                : '0 1px 4px rgba(0,0,0,0.07)',
                            border: msg.role === 'bot' ? '1px solid rgba(99,102,241,0.1)' : 'none',
                        }}>
                            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', animation: 'cora-slide 0.2s ease' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <LogoMark size={16} color="#fff" />
                        </div>
                        <div style={{ background: '#fff', borderRadius: '14px 14px 14px 4px', padding: '12px 14px', border: '1px solid rgba(99,102,241,0.1)', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                            {[0, 160, 320].map(d => (
                                <span key={d} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#6366f1', display: 'inline-block', animation: `cora-bounce 1.4s ease-in-out ${d}ms infinite` }} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── AUTO-SCROLL MARQUEE CHIPS ── */}
            <div style={{
                padding: '8px 0',
                background: '#f5f6fb',
                borderTop: '1px solid rgba(99,102,241,0.08)',
                overflow: 'hidden',
            }}>
                {/* Track: doubled chips for seamless loop, pauses on hover */}
                <div className="cora-marquee-track" style={{ display: 'flex', gap: '8px', width: 'max-content', padding: '0 8px' }}>
                    {[...['Skill Gap', 'Career Paths', 'Interview Tips', 'Resume Help', 'Salary Data', 'Job Search'], ...['Skill Gap', 'Career Paths', 'Interview Tips', 'Resume Help', 'Salary Data', 'Job Search']].map((chip, i) => (
                        <button key={i}
                            onClick={() => send(`Tell me about ${chip.toLowerCase()}`)}
                            style={{
                                padding: '5px 13px', borderRadius: '20px', whiteSpace: 'nowrap',
                                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)',
                                color: '#4f46e5', fontSize: '11px', fontWeight: 600,
                                cursor: 'pointer', transition: 'all 0.15s', fontFamily: FONT,
                                flexShrink: 0,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#4f46e5'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = '#4f46e5'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.18)'; }}
                        >{chip}</button>
                    ))}
                </div>
            </div>

            {/* ── INPUT ── */}
            <div style={{ background: '#fff', padding: '14px 18px 18px', borderTop: '1px solid #f0f0f8' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: '#f5f6fb', borderRadius: '12px',
                    border: '1.5px solid rgba(99,102,241,0.2)',
                    padding: '0 8px 0 14px',
                    transition: 'border-color 0.2s',
                }}
                    onFocus={() => { }}
                >
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                        placeholder="Ask Cora anything..."
                        style={{
                            flex: 1, border: 'none', background: 'transparent', outline: 'none',
                            fontSize: '13px', color: '#111827', padding: '11px 0', fontFamily: FONT,
                        }}
                    />
                    <button onClick={() => send()} disabled={!input.trim() || loading}
                        style={{
                            width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                            flexShrink: 0, cursor: input.trim() ? 'pointer' : 'default',
                            background: input.trim() ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : '#e5e7eb',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s',
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#fff' }}>arrow_upward</span>
                    </button>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '10px', color: '#9ca3af', textAlign: 'center', fontFamily: FONT }}>
                    Powered by Smart Career Advisor AI
                </p>
            </div>
        </div>
    );
}

export default ChatbotWidget;
