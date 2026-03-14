import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../services/api';

// ─── Rich Farm Scene Illustration ─────────────────────────────────────────────
const FarmSceneIllustration = () => (
    <svg viewBox="0 0 480 360" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', maxWidth: 440, display: 'block', margin: '0 auto' }}>

        {/* Ground */}
        <ellipse cx="240" cy="330" rx="220" ry="24" fill="#1a2e1a" opacity="0.4" />

        {/* Far background hills */}
        <ellipse cx="100" cy="290" rx="140" ry="60" fill="#1a2a1a" opacity="0.5" />
        <ellipse cx="370" cy="295" rx="130" ry="55" fill="#1a2a1a" opacity="0.4" />

        {/* ── Big Tree (left) ── */}
        <rect x="44" y="200" width="18" height="110" rx="5" fill="#1a1a1a" />
        {/* roots */}
        <path d="M44 300 Q30 315 20 320" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" />
        <path d="M62 300 Q78 315 88 322" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" />
        {/* foliage */}
        <ellipse cx="53" cy="175" rx="46" ry="40" fill="#16a34a" opacity="0.9" />
        <ellipse cx="30" cy="195" rx="34" ry="30" fill="#15803d" />
        <ellipse cx="78" cy="190" rx="32" ry="28" fill="#16a34a" opacity="0.8" />
        <ellipse cx="53" cy="152" rx="34" ry="28" fill="#22c55e" opacity="0.7" />

        {/* ── Small tree (right) ── */}
        <rect x="400" y="228" width="14" height="82" rx="4" fill="#1a1a1a" />
        <ellipse cx="407" cy="210" rx="34" ry="30" fill="#16a34a" opacity="0.85" />
        <ellipse cx="390" cy="225" rx="24" ry="20" fill="#15803d" />
        <ellipse cx="426" cy="220" rx="22" ry="18" fill="#16a34a" opacity="0.75" />
        {/* pot */}
        <path d="M394 308 L402 310 L412 310 L420 308 L416 322 L398 322Z" fill="#b45309" />

        {/* ── Farmhouse ── */}
        {/* walls */}
        <rect x="160" y="200" width="160" height="110" rx="4" fill="#e8e0d0" />
        <rect x="160" y="200" width="160" height="110" rx="4" fill="#1a1a1a" opacity="0.04" />
        {/* roof */}
        <path d="M148 204 L240 148 L332 204Z" fill="#1a1a1a" />
        <path d="M152 204 L240 152 L328 204Z" fill="#2d2d2d" />
        {/* chimney */}
        <rect x="270" y="150" width="20" height="40" rx="2" fill="#1a1a1a" />
        <ellipse cx="280" cy="150" rx="12" ry="5" fill="#333" />
        {/* smoke */}
        <path d="M280 142 Q278 132 282 122 Q286 112 280 102" stroke="#555" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.4" />
        <path d="M285 138 Q290 128 286 118" stroke="#555" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.25" />
        {/* door */}
        <rect x="215" y="256" width="50" height="54" rx="6" fill="#1a1a1a" />
        <rect x="219" y="260" width="42" height="46" rx="5" fill="#2d2d2d" />
        <circle cx="252" cy="285" r="3" fill="#888" />
        {/* windows */}
        <rect x="170" y="218" width="42" height="36" rx="5" fill="#1a1a1a" />
        <rect x="173" y="221" width="38" height="30" rx="4" fill="#0d2b1a" />
        <line x1="192" y1="221" x2="192" y2="251" stroke="#1a1a1a" strokeWidth="1.5" />
        <line x1="173" y1="236" x2="211" y2="236" stroke="#1a1a1a" strokeWidth="1.5" />
        <rect x="268" y="218" width="42" height="36" rx="5" fill="#1a1a1a" />
        <rect x="271" y="221" width="38" height="30" rx="4" fill="#0d2b1a" />
        <line x1="290" y1="221" x2="290" y2="251" stroke="#1a1a1a" strokeWidth="1.5" />
        <line x1="271" y1="236" x2="309" y2="236" stroke="#1a1a1a" strokeWidth="1.5" />
        {/* window glow */}
        <rect x="173" y="221" width="38" height="30" rx="4" fill="#16a34a" opacity="0.15" />
        <rect x="271" y="221" width="38" height="30" rx="4" fill="#16a34a" opacity="0.1" />

        {/* ── Field rows ── */}
        {[0, 1, 2, 3].map(i => (
            <g key={i}>
                <path d={`M${100 + i * 60} 310 Q${130 + i * 60} 290 ${160 + i * 60} 310`}
                    stroke="#16a34a" strokeWidth="3" strokeLinecap="round" fill="none" opacity={0.4 + i * 0.1} />
                <ellipse cx={130 + i * 60} cy={296} rx="8" ry="6" fill="#16a34a" opacity={0.3 + i * 0.1} />
            </g>
        ))}

        {/* ── Floating UI cards ── */}
        {/* Card 1 - top right */}
        <rect x="330" y="56" width="130" height="66" rx="12" fill="white" opacity="0.97"
            style={{ filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.22))' }} />
        <circle cx="354" cy="78" r="12" fill="#dcfce7" />
        <circle cx="354" cy="78" r="6" fill="#16a34a" />
        <rect x="372" y="70" width="72" height="7" rx="3.5" fill="#111" />
        <rect x="372" y="83" width="52" height="5" rx="2.5" fill="#d1d5db" />
        <rect x="342" y="100" width="104" height="5" rx="2.5" fill="#e5e7eb" />
        <rect x="342" y="109" width="80" height="5" rx="2.5" fill="#e5e7eb" />
        {/* score badge on card1 */}
        <rect x="388" y="96" width="48" height="22" rx="6" fill="#16a34a" />
        <text x="396" y="108" fill="white" fontSize="8" fontWeight="bold" fontFamily="monospace">94%</text>

        {/* Card 2 - bottom left */}
        <rect x="20" y="290" width="118" height="52" rx="11" fill="white" opacity="0.97"
            style={{ filter: 'drop-shadow(0 8px 22px rgba(0,0,0,0.18))' }} />
        <rect x="32" y="304" width="44" height="6" rx="3" fill="#d1d5db" />
        <rect x="32" y="316" width="68" height="8" rx="3" fill="#111" />
        <rect x="32" y="329" width="48" height="5" rx="2.5" fill="#16a34a" />

        {/* ── Moon / stars ── */}
        <circle cx="420" cy="60" r="24" fill="#1a2a1a" opacity="0.6" />
        <path d="M408 52 Q420 44 432 56 Q420 50 408 52Z" fill="#f5f0dc" opacity="0.8" />
        <circle cx="360" cy="36" r="2.5" fill="#f5f0dc" opacity="0.6" />
        <circle cx="390" cy="24" r="1.8" fill="#f5f0dc" opacity="0.5" />
        <circle cx="340" cy="48" r="1.5" fill="#f5f0dc" opacity="0.4" />
        <circle cx="450" cy="90" r="2" fill="#f5f0dc" opacity="0.4" />
        <circle cx="130" cy="30" r="2" fill="#f5f0dc" opacity="0.3" />
        <circle cx="80" cy="55" r="1.5" fill="#f5f0dc" opacity="0.35" />

        {/* ── Green glow from windows ── */}
        <ellipse cx="192" cy="255" rx="30" ry="10" fill="#16a34a" opacity="0.06" />
        <ellipse cx="290" cy="255" rx="30" ry="10" fill="#16a34a" opacity="0.06" />
    </svg>
);

// ─── Component ─────────────────────────────────────────────────────────────────
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('labor');
    const [isRegistering, setIsRegistering] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('register') === 'true') {
            setIsRegistering(true);
            if (params.get('role')) setRole(params.get('role')!);
        }
    }, [location]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isRegistering) {
                await auth.register({ email, password, role, auth_provider: 'local' });
                alert('Registration successful! Please login.');
                setIsRegistering(false);
            } else {
                const formData = new FormData();
                formData.append('username', email);
                formData.append('password', password);
                const response = await auth.login(formData);
                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                if (response.data.user.role === 'labor') {
                    try {
                        const chk = await fetch('http://localhost:8000/profiles/labor/me', {
                            headers: { Authorization: `Bearer ${response.data.access_token}` }
                        });
                        navigate(chk.status === 404 ? '/create-profile' : '/labor/dashboard');
                    } catch { navigate('/labor/dashboard'); }
                } else {
                    navigate('/farmer/dashboard');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
        } finally { setLoading(false); }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Instrument Sans', 'DM Sans', sans-serif" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .serif { font-family: 'Instrument Serif', Georgia, serif; }
        .serif-i { font-family: 'Instrument Serif', Georgia, serif; font-style: italic; }

        /* Dark panel dot grid */
        .dot-bg {
          background-image: radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px);
          background-size: 30px 30px;
        }

        /* Form card slide-in */
        .card-in { animation: cardIn 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes cardIn { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }

        /* Inputs */
        .lg-input {
          width: 100%; padding: 15px 18px 15px 50px;
          border: 1.5px solid #e8e4e0; border-radius: 13px;
          font-size: 16px; outline: none; background: #faf9f7;
          font-family: inherit; color: #111;
          transition: border-color .2s, box-shadow .2s, background .2s;
        }
        .lg-input:focus {
          border-color: #16a34a; background: #fff;
          box-shadow: 0 0 0 3.5px rgba(22,163,74,.1);
        }
        .lg-input::placeholder { color: #c8c4be; }

        /* Tab pills */
        .tab { flex:1; padding: 11px; border-radius: 10px; border: none; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all .15s; }
        .tab-on  { background: #fff; color: #111; box-shadow: 0 1px 6px rgba(0,0,0,.1); }
        .tab-off { background: transparent; color: #aaa; }
        .tab-off:hover { color: #555; }

        /* Role cards */
        .role-card {
          flex: 1; padding: 18px 14px; border-radius: 14px;
          border: 1.5px solid #e8e4e0; background: #faf9f7;
          cursor: pointer; text-align: center; font-family: inherit;
          transition: all .18s;
        }
        .role-card:hover { border-color: #aaa; transform: translateY(-1px); }
        .role-card.on { border-color: #16a34a; background: #f0fdf4; box-shadow: 0 0 0 3px rgba(22,163,74,.08); }

        /* Submit btn */
        .go-btn {
          width: 100%; padding: 16px; background: #111; color: white;
          border: none; border-radius: 13px; font-size: 16px; font-weight: 700;
          cursor: pointer; font-family: inherit;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          transition: background .15s, transform .15s, box-shadow .15s;
          letter-spacing: 0.01em;
        }
        .go-btn:hover:not(:disabled) { background: #222; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.18); }
        .go-btn:disabled { opacity: .5; cursor: not-allowed; }

        /* Back button */
        .back-link { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 500; transition: color .15s; padding: 0; }

        /* Error box */
        .err-box { background: #fff1f2; border: 1px solid #fecdd3; border-radius: 11px; padding: 13px 16px; color: #be123c; font-size: 15px; }

        /* Spin */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,.3); border-top-color: white; border-radius: 50%; animation: spin .7s linear infinite; }

        /* Check icon */
        .chk { width: 20px; height: 20px; background: rgba(22,163,74,.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      `}</style>

            {/* ══ LEFT DARK PANEL ══ */}
            <div className="dot-bg" style={{
                width: '50%', minWidth: 460,
                background: 'linear-gradient(160deg, #0a1a0a 0%, #0d1f12 50%, #0a1510 100%)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                padding: '52px 60px', position: 'sticky', top: 0, height: '100vh', overflow: 'hidden'
            }}>
                {/* Subtle radial highlight */}
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 20%, rgba(22,163,74,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative' }}>
                    {/* Back */}
                    <button onClick={() => navigate('/')} className="back-link" style={{ color: '#4a4a4a', marginBottom: 48 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                        Back to home
                    </button>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 52 }}>
                        <div style={{ width: 36, height: 36, background: '#16a34a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 20, color: '#fff' }}>AgroMatch AI</span>
                    </div>
                    {/* Headline */}
                    <h2 className="serif" style={{ fontSize: 44, fontWeight: 400, color: '#f0f0ec', lineHeight: 1.1, marginBottom: 16, letterSpacing: '-0.015em' }}>
                        The smartest way to<br /><span className="serif-i">match</span> talent to land
                    </h2>
                    <p style={{ color: '#4a6050', fontSize: 16, lineHeight: 1.75, marginBottom: 44 }}>
                        AI-powered agricultural job matching.<br />Find the right people in seconds, not days.
                    </p>
                    {/* Check points */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                            '95% match accuracy across all placements',
                            'Instant AI-scored results, no manual search',
                            'Transparent score breakdown for every match',
                        ].map((pt, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                                <div className="chk">
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path d="M2 5l2.5 2.5L8 3" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span style={{ color: '#6a8070', fontSize: 15 }}>{pt}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Illustration */}
                <div style={{ position: 'relative', marginTop: 36 }}>
                    <FarmSceneIllustration />
                </div>

                <p style={{ position: 'relative', color: '#2a3a2a', fontSize: 13 }}>© 2025 AgroMatch AI. All rights reserved.</p>
            </div>

            {/* ══ RIGHT FORM PANEL ══ */}
            <div style={{ flex: 1, background: '#faf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 48px' }}>
                <div className="card-in" style={{ width: '100%', maxWidth: 480 }}>

                    {/* Card */}
                    <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #e8e4e0', boxShadow: '0 8px 40px rgba(0,0,0,0.07)', padding: '44px 44px 40px' }}>

                        {/* Header */}
                        <div style={{ marginBottom: 32 }}>
                            <h1 className="serif" style={{ fontSize: 36, fontWeight: 400, color: '#111', marginBottom: 8, letterSpacing: '-0.01em' }}>
                                {isRegistering ? 'Create account' : 'Welcome back'}
                            </h1>
                            <p style={{ color: '#aaa', fontSize: 16 }}>
                                {isRegistering ? 'Get started with AgroMatch AI for free' : 'Sign in to your AgroMatch account'}
                            </p>
                        </div>

                        {/* Tab toggle */}
                        <div style={{ display: 'flex', background: '#f3f1ef', borderRadius: 13, padding: 4, marginBottom: 28, gap: 4 }}>
                            <button className={`tab ${!isRegistering ? 'tab-on' : 'tab-off'}`} onClick={() => setIsRegistering(false)}>Sign In</button>
                            <button className={`tab ${isRegistering ? 'tab-on' : 'tab-off'}`} onClick={() => setIsRegistering(true)}>Register</button>
                        </div>

                        {/* Error */}
                        {error && <div className="err-box" style={{ marginBottom: 22 }}>{error}</div>}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                            {/* Role selector */}
                            {isRegistering && (
                                <div>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>I am a</p>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        {[
                                            { val: 'labor', emoji: '👷', label: 'Laborer', sub: 'Looking for work' },
                                            { val: 'farmer', emoji: '🌾', label: 'Farmer', sub: 'Hiring workers' },
                                        ].map(r => (
                                            <button key={r.val} type="button" onClick={() => setRole(r.val)} className={`role-card ${role === r.val ? 'on' : ''}`}>
                                                <div style={{ fontSize: 26, marginBottom: 6 }}>{r.emoji}</div>
                                                <div style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{r.label}</div>
                                                <div style={{ fontSize: 13, color: '#aaa', marginTop: 2 }}>{r.sub}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Email */}
                            <div>
                                <p style={{ fontSize: 12, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 9 }}>Email address</p>
                                <div style={{ position: 'relative' }}>
                                    <svg style={{ position: 'absolute', left: 17, top: '50%', transform: 'translateY(-50%)', color: '#d1c8c0', flexShrink: 0 }}
                                        width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                                    </svg>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                        className="lg-input" placeholder="you@example.com" required />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <p style={{ fontSize: 12, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 9 }}>Password</p>
                                <div style={{ position: 'relative' }}>
                                    <svg style={{ position: 'absolute', left: 17, top: '50%', transform: 'translateY(-50%)', color: '#d1c8c0' }}
                                        width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                        className="lg-input" placeholder="••••••••" required />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="go-btn" style={{ marginTop: 4 }}>
                                {loading ? <div className="spin" /> : <>
                                    {isRegistering ? 'Create Account' : 'Sign In'}
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                </>}
                            </button>
                        </form>

                        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 15, color: '#bbb' }}>
                            {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
                            <button onClick={() => setIsRegistering(!isRegistering)}
                                style={{ color: '#16a34a', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, fontFamily: 'inherit' }}>
                                {isRegistering ? 'Sign In' : 'Sign Up'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}