import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profiles } from '../services/api';

// ─── Step Illustrations ────────────────────────────────────────────────────────
const PersonSVG = () => (
    <svg viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', maxWidth: 260, display: 'block', margin: '0 auto' }}>
        {/* ID card */}
        <rect x="50" y="70" width="180" height="130" rx="16" fill="#1a2e1a" stroke="#16a34a" strokeWidth="1.5" strokeOpacity="0.4" />
        <rect x="50" y="70" width="180" height="130" rx="16" fill="url(#cardGrad)" opacity="0.3" />
        {/* Photo area */}
        <rect x="70" y="90" width="56" height="64" rx="10" fill="#0d1f0d" />
        {/* Person in photo */}
        <circle cx="98" cy="110" r="14" fill="#2a4a2a" />
        <circle cx="98" cy="107" r="8" fill="#f5c5a3" />
        <path d="M86 125 Q98 120 110 125" fill="#2a4a2a" />
        {/* Info lines */}
        <rect x="140" y="98" width="76" height="8" rx="4" fill="#16a34a" opacity="0.7" />
        <rect x="140" y="113" width="56" height="6" rx="3" fill="#2a4a2a" />
        <rect x="140" y="125" width="64" height="6" rx="3" fill="#2a4a2a" />
        {/* Divider */}
        <line x1="70" y1="168" x2="210" y2="168" stroke="#16a34a" strokeWidth="1" strokeOpacity="0.3" />
        {/* Bottom labels */}
        <rect x="70" y="178" width="40" height="6" rx="3" fill="#2a4a2a" />
        <rect x="70" y="188" width="56" height="6" rx="3" fill="#16a34a" opacity="0.5" />
        <rect x="145" y="178" width="40" height="6" rx="3" fill="#2a4a2a" />
        <rect x="145" y="188" width="52" height="6" rx="3" fill="#16a34a" opacity="0.5" />
        {/* Verified badge */}
        <circle cx="213" cy="88" r="16" fill="#16a34a" />
        <path d="M206 88 L210 92 L220 82" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Floating dots */}
        <circle cx="38" cy="88" r="4" fill="#16a34a" opacity="0.3" />
        <circle cx="248" cy="180" r="3" fill="#16a34a" opacity="0.25" />
        <circle cx="240" cy="68" r="2.5" fill="#16a34a" opacity="0.2" />
        <defs>
            <linearGradient id="cardGrad" x1="50" y1="70" x2="230" y2="200" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#16a34a" />
                <stop offset="100%" stopColor="#0d2b1a" />
            </linearGradient>
        </defs>
    </svg>
);

const SkillsSVG = () => (
    <svg viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', maxWidth: 260, display: 'block', margin: '0 auto' }}>
        {/* Brain/network */}
        <circle cx="140" cy="110" r="52" fill="#0d1f0d" stroke="#16a34a" strokeWidth="1" strokeOpacity="0.3" />
        {/* Network nodes */}
        {[
            [140, 80], [168, 98], [175, 128], [155, 152], [125, 152], [105, 128], [112, 98],
            [140, 110]
        ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i === 7 ? 8 : 5} fill="#16a34a" opacity={i === 7 ? 1 : 0.6} />
        ))}
        {/* Network lines */}
        {[
            [[140, 80], [168, 98]], [[168, 98], [175, 128]], [[175, 128], [155, 152]],
            [[155, 152], [125, 152]], [[125, 152], [105, 128]], [[105, 128], [112, 98]],
            [[112, 98], [140, 80]],
            [[140, 80], [140, 110]], [[168, 98], [140, 110]], [[175, 128], [140, 110]],
            [[155, 152], [140, 110]], [[125, 152], [140, 110]], [[105, 128], [140, 110]], [[112, 98], [140, 110]],
        ].map(([[x1, y1], [x2, y2]], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#16a34a" strokeWidth="1" opacity="0.25" />
        ))}
        {/* Chip labels floating around */}
        {[
            [32, 62, 'harvesting'], [172, 42, 'irrigation'], [200, 155, 'planting'],
            [22, 168, 'tractor'], [165, 200, 'pesticides']
        ].map(([x, y, label], i) => (
            <g key={i}>
                <rect x={Number(x)} y={Number(y)} width={Number((label as string).length * 7.8 + 20)} height={24} rx={12}
                    fill="#1a2e1a" stroke="#16a34a" strokeWidth="1.2" strokeOpacity="0.5" />
                <text x={Number(x) + Number((label as string).length * 7.8 + 20) / 2} y={Number(y) + 16}
                    fill="#16a34a" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="sans-serif" opacity="0.8">{label as string}</text>
            </g>
        ))}
        {/* Pulse rings */}
        <circle cx="140" cy="110" r="62" stroke="#16a34a" strokeWidth="1" strokeOpacity="0.1" fill="none" />
        <circle cx="140" cy="110" r="72" stroke="#16a34a" strokeWidth="1" strokeOpacity="0.06" fill="none" />
    </svg>
);

const RateSVG = () => (
    <svg viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', maxWidth: 260, display: 'block', margin: '0 auto' }}>
        {/* Chart bars */}
        <rect x="40" y="180" width="200" height="2" rx="1" fill="#2a3a2a" />
        {[
            [55, 130, 30], [100, 100, 30], [145, 70, 30], [190, 50, 30]
        ].map(([x, y, w], i) => (
            <g key={i}>
                <rect x={x} y={y} width={w} height={180 - y} rx="6" fill="#1a2e1a" />
                <rect x={x} y={y} width={w} height={180 - y} rx="6" fill="#16a34a" opacity={0.3 + i * 0.18} />
                {/* top glow */}
                <rect x={x} y={y} width={w} height={8} rx="4" fill="#22c55e" opacity={0.4 + i * 0.15} />
            </g>
        ))}
        {/* Rupee coin */}
        <circle cx="195" cy="90" r="34" fill="#1a2e1a" stroke="#16a34a" strokeWidth="1.5" strokeOpacity="0.5" />
        <circle cx="195" cy="90" r="26" fill="#0d1a0d" />
        <text x="182" y="100" fill="#16a34a" fontSize="26" fontWeight="700" fontFamily="serif" opacity="0.9">₹</text>
        {/* Arrow up */}
        <path d="M195 56 L195 40 M188 47 L195 40 L202 47" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dotted trend line */}
        <path d="M55,148 C80,140 110,115 145,88 C165,72 178,68 190,64" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.5" />
        {/* Dots on trend */}
        {[[55, 148], [100, 118], [145, 88], [190, 64]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={3.5} fill="#16a34a" opacity="0.7" />
        ))}
        {/* Decorative */}
        <circle cx="42" cy="60" r="3.5" fill="#16a34a" opacity="0.25" />
        <circle cx="248" cy="40" r="2.5" fill="#16a34a" opacity="0.2" />
    </svg>
);

const STEPS = [
    {
        label: 'Personal Info', sub: 'Your name & identity', SVG: PersonSVG,
        headline: 'What\'s your name?',
        desc: 'This is how farmers will see you when they view your profile.'
    },
    {
        label: 'Skills & Bio', sub: 'What you can do', SVG: SkillsSVG,
        headline: 'Your skills & experience',
        desc: 'The AI uses your skills to find the most compatible job matches for you.'
    },
    {
        label: 'Rate & Location', sub: 'Your expectations', SVG: RateSVG,
        headline: 'Rate & location',
        desc: 'Set your expected daily wage and location for proximity matching.'
    },
];

export default function CreateProfile() {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        full_name: '', phone: '', skills: '', bio: '', daily_rate: '',
        location: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const set = (key: string, val: string) => setFormData(f => ({ ...f, [key]: val }));
    const skills = formData.skills.split(',').map(s => s.trim()).filter(Boolean);

    const canNext = [
        () => formData.full_name.trim().length >= 2 && formData.phone.trim().length >= 10,
        () => skills.length > 0 && formData.bio.trim().length > 10,
        () => formData.daily_rate.trim().length > 0 && formData.location.trim().length >= 2,
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step < STEPS.length - 1) { setStep(s => s + 1); return; }
        setLoading(true); setError('');
        try {
            await profiles.createLabor({
                ...formData,
                daily_rate: parseFloat(formData.daily_rate),
            });
            navigate('/labor/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Error creating profile');
        } finally { setLoading(false); }
    };

    const CurrentSVG = STEPS[step].SVG;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Instrument Sans', 'DM Sans', sans-serif" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .serif { font-family: 'Instrument Serif', Georgia, serif; }
        .serif-i { font-family: 'Instrument Serif', Georgia, serif; font-style: italic; }

        /* dot grid */
        .dotbg { background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 28px 28px; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes stepIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:none} }

        .step-form { animation: stepIn .4s cubic-bezier(0.16,1,0.3,1) both; }

        /* inputs */
        .pi { width:100%; padding:16px 20px; border:1.5px solid #e8e4e0; border-radius:14px; font-size:16px; outline:none; background:#faf9f7; font-family:inherit; color:#111; transition:border-color .2s, box-shadow .2s, background .2s; }
        .pi:focus { border-color:#16a34a; background:#fff; box-shadow:0 0 0 3.5px rgba(22,163,74,.1); }
        .pi::placeholder { color:#c8c4be; }
        textarea.pi { resize:vertical; min-height:120px; line-height:1.65; }

        /* buttons */
        .pb-primary { flex:1; background:#111; color:white; border:none; padding:16px; border-radius:13px; font-size:16px; font-weight:700; cursor:pointer; font-family:inherit; display:flex; align-items:center; justify-content:center; gap:9px; transition:background .15s, transform .15s, box-shadow .15s; letter-spacing:.01em; }
        .pb-primary:hover:not(:disabled) { background:#222; transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.15); }
        .pb-primary:disabled { opacity:.45; cursor:not-allowed; }
        .pb-back { background:#f3f1ef; color:#374151; border:none; padding:16px 22px; border-radius:13px; font-size:16px; font-weight:600; cursor:pointer; font-family:inherit; display:flex; align-items:center; gap:8px; transition:background .15s; }
        .pb-back:hover { background:#e8e4e0; }

        /* chip */
        .chip { background:#1a2e1a; color:#16a34a; border:1px solid rgba(22,163,74,0.3); font-size:12px; font-weight:600; padding:5px 13px; border-radius:100px; white-space:nowrap; }
        .chip-preview { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; font-size:12px; font-weight:600; padding:5px 13px; border-radius:100px; white-space:nowrap; }

        /* label */
        .fl { font-size:12px; font-weight:700; color:#aaa; text-transform:uppercase; letter-spacing:.08em; margin-bottom:10px; display:block; }

        /* step indicator states */
        .step-dot-done { width:36px; height:36px; border-radius:50%; background:#16a34a; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .step-dot-active { width:36px; height:36px; border-radius:50%; border:2px solid #16a34a; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .step-dot-future { width:36px; height:36px; border-radius:50%; border:1.5px solid #2a3a2a; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .step-line-done { width:1.5px; height:40px; background:#16a34a; margin: 4px 0; }
        .step-line-future { width:1.5px; height:40px; background:#1a2a1a; margin: 4px 0; }
      `}</style>

            {/* ══ LEFT DARK PANEL ══ */}
            <div className="dotbg" style={{
                width: '44%', minWidth: 420,
                background: 'linear-gradient(160deg, #0a1a0a 0%, #0c1c10 55%, #0a1510 100%)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                padding: '52px 60px', position: 'sticky', top: 0, height: '100vh', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 25% 15%, rgba(22,163,74,0.07) 0%, transparent 55%)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative' }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 60 }}>
                        <div style={{ width: 36, height: 36, background: '#16a34a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 20, color: '#fff' }}>AgroMatch AI</span>
                    </div>

                    {/* Heading */}
                    <h2 className="serif" style={{ fontSize: 40, fontWeight: 400, color: '#f0f0ec', lineHeight: 1.12, marginBottom: 12, letterSpacing: '-0.01em' }}>
                        Complete your<br /><span className="serif-i">worker profile</span>
                    </h2>
                    <p style={{ color: '#4a6050', fontSize: 16, lineHeight: 1.7, marginBottom: 52 }}>
                        Tell us about yourself. Our AI will immediately start finding the best job matches for your exact skills and location.
                    </p>

                    {/* Step tracker */}
                    <div>
                        {STEPS.map((s, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    {i < step
                                        ? <div className="step-dot-done"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg></div>
                                        : i === step
                                            ? <div className="step-dot-active"><span style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>{i + 1}</span></div>
                                            : <div className="step-dot-future"><span style={{ fontSize: 14, fontWeight: 700, color: '#2a4a2a' }}>{i + 1}</span></div>
                                    }
                                    {i < STEPS.length - 1 && (
                                        <div className={i < step ? 'step-line-done' : 'step-line-future'} />
                                    )}
                                </div>
                                <div style={{ paddingTop: 8, paddingBottom: i < STEPS.length - 1 ? 28 : 0 }}>
                                    <p style={{ fontWeight: 700, fontSize: 15, color: i === step ? '#fff' : i < step ? '#4a6050' : '#2a3a2a', lineHeight: 1.2 }}>{s.label}</p>
                                    <p style={{ fontSize: 13, color: i === step ? '#4a6050' : '#1a2a1a', marginTop: 2 }}>{s.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contextual illustration */}
                <div style={{ position: 'relative', margin: '32px 0' }}>
                    <CurrentSVG />
                </div>

                <p style={{ position: 'relative', color: '#1a2a1a', fontSize: 13 }}>© 2025 AgroMatch AI</p>
            </div>

            {/* ══ RIGHT FORM PANEL ══ */}
            <div style={{ flex: 1, background: '#faf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '52px 72px', minHeight: '100vh' }}>
                <div style={{ width: '100%', maxWidth: 540 }}>

                    {/* Progress header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
                        <div>
                            <p style={{ fontSize: 13, color: '#aaa', fontWeight: 600, marginBottom: 8 }}>Step {step + 1} of {STEPS.length}</p>
                            <div style={{ width: 220, height: 4, background: '#e8e4e0', borderRadius: 100 }}>
                                <div style={{ width: `${((step + 1) / STEPS.length) * 100}%`, height: '100%', background: '#16a34a', borderRadius: 100, transition: 'width .45s cubic-bezier(0.16,1,0.3,1)' }} />
                            </div>
                        </div>
                        <button onClick={() => navigate('/')}
                            style={{ background: 'none', border: '1px solid #e8e4e0', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontSize: 14, color: '#aaa', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#aaa'; e.currentTarget.style.color = '#111'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e4e0'; e.currentTarget.style.color = '#aaa'; }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            Cancel
                        </button>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12, padding: '14px 18px', marginBottom: 28, color: '#be123c', fontSize: 15 }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="step-form" key={step}>

                        {/* Heading */}
                        <h1 className="serif" style={{ fontSize: 46, fontWeight: 400, color: '#111', marginBottom: 10, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
                            {STEPS[step].headline}
                        </h1>
                        <p style={{ color: '#aaa', fontSize: 17, lineHeight: 1.7, marginBottom: 44 }}>
                            {STEPS[step].desc}
                        </p>

                        {/* ─ Step 0 ─ */}
                        {step === 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <div>
                                    <label className="fl">Full Name *</label>
                                    <input type="text" value={formData.full_name} onChange={e => set('full_name', e.target.value)}
                                        className="pi" placeholder="e.g. Ravi Kumar" required autoFocus />
                                    <p style={{ fontSize: 14, color: '#ccc', marginTop: 10 }}>Use your real name — it builds trust with farmers.</p>
                                </div>
                                <div>
                                    <label className="fl">Mobile Number *</label>
                                    <input type="tel" value={formData.phone} onChange={e => set('phone', e.target.value)}
                                        className="pi" placeholder="e.g. 9876543210" required />
                                    <p style={{ fontSize: 14, color: '#ccc', marginTop: 10 }}>Farmers will use this to contact you after accepting your application.</p>
                                </div>
                            </div>
                        )}

                        {/* ─ Step 1 ─ */}
                        {step === 1 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                                <div>
                                    <label className="fl">Skills (comma-separated) *</label>
                                    <input type="text" value={formData.skills} onChange={e => set('skills', e.target.value)}
                                        className="pi" placeholder="harvesting, drip irrigation, tractor driving, pesticide spraying" required />
                                    <p style={{ fontSize: 14, color: '#ccc', marginTop: 10 }}>The more specific your skills, the better the AI matches.</p>
                                    {skills.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                                            {skills.map((s, i) => <span key={i} className="chip-preview">{s}</span>)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="fl">Bio / Experience *</label>
                                    <textarea value={formData.bio} onChange={e => set('bio', e.target.value)}
                                        className="pi" placeholder="Describe your farming experience, the type of work you're best at, and what you're looking for in a job…" required />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                                <div>
                                    <label className="fl">Expected Daily Rate (₹) *</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 20, fontWeight: 600 }}>₹</span>
                                        <input type="number" value={formData.daily_rate} onChange={e => set('daily_rate', e.target.value)}
                                            className="pi" style={{ paddingLeft: 42 }} placeholder="500" min="100" step="50" required />
                                    </div>
                                    <p style={{ fontSize: 14, color: '#ccc', marginTop: 10 }}>Farmers whose jobs pay this rate will be prioritised.</p>
                                </div>
                                <div>
                                    <label className="fl">Your Location *</label>
                                    <input type="text" value={formData.location} onChange={e => set('location', e.target.value)}
                                        className="pi" placeholder="e.g. Hyderabad, Telangana" required />
                                    <p style={{ fontSize: 14, color: '#ccc', marginTop: 10 }}>Enter your city or village name. This is used to match you with nearby jobs.</p>
                                </div>

                                {/* Profile summary card */}
                                {formData.full_name && (
                                    <div style={{ background: 'white', border: '1px solid #e8e4e0', borderRadius: 16, padding: '22px 24px' }}>
                                        <p style={{ fontSize: 12, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Profile Preview</p>
                                        <p style={{ fontWeight: 700, fontSize: 19, color: '#111', marginBottom: 10 }}>{formData.full_name}</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                            {skills.map((s, i) => <span key={i} className="chip-preview">{s}</span>)}
                                        </div>
                                        {formData.daily_rate && (
                                            <p style={{ fontSize: 16, fontWeight: 700, color: '#16a34a' }}>₹{formData.daily_rate}/day</p>
                                        )}
                                        {formData.location && (
                                            <p style={{ fontSize: 13, color: '#aaa', marginTop: 6 }}>📍 {formData.location}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 14, marginTop: 44 }}>
                            {step > 0 && (
                                <button type="button" onClick={() => setStep(s => s - 1)} className="pb-back">
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                                    Back
                                </button>
                            )}
                            <button type="submit" disabled={loading || !canNext[step]()} className="pb-primary">
                                {loading
                                    ? <div style={{ width: 20, height: 20, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                                    : step < STEPS.length - 1
                                        ? <>Continue <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></>
                                        : <>Create Profile <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg></>
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}