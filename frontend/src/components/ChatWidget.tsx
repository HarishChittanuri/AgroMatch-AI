import { useState, useRef, useEffect } from 'react';
import { ai as aiApi } from '../services/api';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatWidgetProps {
    role: 'labor' | 'farmer';
}

const PLACEHOLDER_BY_ROLE = {
    labor: 'Ask about jobs, wages, locations…',
    farmer: 'Ask about laborers, hiring tips, wages…',
};

const SUGGESTIONS_BY_ROLE = {
    labor: [
        'Which jobs suit my skills?',
        'What\'s the pay for irrigation work?',
        'Any harvesting jobs available?',
    ],
    farmer: [
        'Which laborers know drip irrigation?',
        'What wage should I offer for plowing?',
        'Find me experienced harvesters',
    ],
};

export default function ChatWidget({ role }: ChatWidgetProps) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, open]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || loading) return;
        const userMsg: Message = { role: 'user', content: text.trim() };
        const updated = [...messages, userMsg];
        setMessages(updated);
        setInput('');
        setLoading(true);

        try {
            const res = await aiApi.chat({
                message: userMsg.content,
                history: updated.slice(-6),
            });
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
        } catch (err: any) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ ' + (err?.response?.data?.detail || 'Something went wrong. Please try again.'),
            }]);
        } finally {
            setLoading(false);
        }
    };

    const isLabor = role === 'labor';
    const accentColor = isLabor ? '#2563eb' : '#16a34a';
    const accentLight = isLabor ? '#eff6ff' : '#f0fdf4';
    const accentBorder = isLabor ? '#bfdbfe' : '#bbf7d0';

    return (
        <>
            <style>{`
        @keyframes chatPop { from{opacity:0;transform:scale(0.9) translateY(12px)} to{opacity:1;transform:none} }
        @keyframes msgIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
        .cw-bubble { white-space:pre-wrap; line-height:1.65; }
      `}</style>

            {/* ── Floating trigger button ── */}
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
                    width: 58, height: 58, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                    border: 'none', cursor: 'pointer',
                    boxShadow: `0 8px 28px ${accentColor}55`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform .2s, box-shadow .2s',
                    animation: messages.length === 0 ? 'pulse 2s ease infinite' : 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                title="Ask AgroMatch AI"
            >
                {open
                    ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    : <span style={{ fontSize: 26 }}>🤖</span>
                }
                {messages.length > 0 && !open && (
                    <span style={{ position: 'absolute', top: 3, right: 3, width: 10, height: 10, background: '#ef4444', borderRadius: '50%', border: '2px solid white' }} />
                )}
            </button>

            {/* ── Chat panel ── */}
            {open && (
                <div style={{
                    position: 'fixed', bottom: 96, right: 28, zIndex: 999,
                    width: 370, height: 520,
                    background: '#fff', borderRadius: 22,
                    boxShadow: '0 24px 72px rgba(0,0,0,.18)',
                    border: '1px solid #e8e4e0',
                    display: 'flex', flexDirection: 'column',
                    fontFamily: "'Instrument Sans', sans-serif",
                    animation: 'chatPop .3s cubic-bezier(0.16,1,0.3,1)',
                    overflow: 'hidden',
                }}>
                    {/* Header */}
                    <div style={{
                        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                        padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
                    }}>
                        <div style={{ width: 38, height: 38, background: 'rgba(255,255,255,.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🤖</div>
                        <div>
                            <p style={{ color: 'white', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>AgroMatch AI</p>
                            <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 12 }}>
                                {role === 'labor' ? 'Your job-finding assistant' : 'Your hiring assistant'}
                            </p>
                        </div>
                        <button onClick={() => setMessages([])}
                            style={{ marginLeft: 'auto', background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 8, padding: '5px 10px', color: 'rgba(255,255,255,.8)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                            Clear
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* Welcome message */}
                        {messages.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
                                <p style={{ fontSize: 14, color: '#aaa', marginBottom: 16 }}>
                                    {role === 'labor'
                                        ? '👋 Hi! Ask me about jobs, wages, or opportunities.'
                                        : '👋 Hi! Ask me about laborers, hiring tips, or wages.'}
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {SUGGESTIONS_BY_ROLE[role].map((s, i) => (
                                        <button key={i} onClick={() => sendMessage(s)}
                                            style={{
                                                background: accentLight, border: `1px solid ${accentBorder}`,
                                                borderRadius: 100, padding: '8px 14px', fontSize: 13,
                                                color: accentColor, cursor: 'pointer', fontFamily: 'inherit',
                                                fontWeight: 600, transition: 'background .15s', textAlign: 'left',
                                            }}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Chat messages */}
                        {messages.map((msg, i) => (
                            <div key={i} style={{
                                display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                animation: 'msgIn .25s ease',
                            }}>
                                {msg.role === 'assistant' && (
                                    <div style={{ width: 28, height: 28, background: accentLight, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginRight: 8, marginTop: 2 }}>🤖</div>
                                )}
                                <div className="cw-bubble" style={{
                                    maxWidth: '78%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                    background: msg.role === 'user' ? accentColor : '#f3f4f6',
                                    color: msg.role === 'user' ? 'white' : '#111',
                                    fontSize: 14, lineHeight: 1.6,
                                }}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {/* Loading dots */}
                        {loading && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 28, height: 28, background: accentLight, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
                                <div style={{ background: '#f3f4f6', padding: '10px 16px', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: 5 }}>
                                    {[0, 0.2, 0.4].map((d, i) => (
                                        <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#aaa', animation: `pulse 1.2s ease ${d}s infinite` }} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input bar */}
                    <div style={{ padding: '10px 12px 14px', borderTop: '1px solid #f3f1ef', display: 'flex', gap: 8, flexShrink: 0 }}>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                            placeholder={PLACEHOLDER_BY_ROLE[role]}
                            disabled={loading}
                            style={{
                                flex: 1, padding: '10px 14px', border: '1.5px solid #e8e4e0',
                                borderRadius: 12, fontSize: 14, outline: 'none',
                                background: '#faf9f7', fontFamily: 'inherit', color: '#111',
                                transition: 'border-color .2s',
                            }}
                            onFocus={e => (e.currentTarget.style.borderColor = accentColor)}
                            onBlur={e => (e.currentTarget.style.borderColor = '#e8e4e0')}
                        />
                        <button
                            onClick={() => sendMessage(input)}
                            disabled={loading || !input.trim()}
                            style={{
                                width: 42, height: 42, borderRadius: 12, border: 'none',
                                background: input.trim() ? accentColor : '#e8e4e0',
                                cursor: input.trim() ? 'pointer' : 'default',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'background .15s',
                                flexShrink: 0,
                            }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
