import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── SVG Illustrations ────────────────────────────────────────────────────────

const HeroIllustration = () => (
    <svg viewBox="0 0 520 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-lg mx-auto">
        {/* Desk */}
        <rect x="60" y="270" width="400" height="18" rx="6" fill="#1a1a1a" />
        <rect x="90" y="288" width="16" height="80" rx="4" fill="#1a1a1a" />
        <rect x="414" y="288" width="16" height="80" rx="4" fill="#1a1a1a" />
        {/* Monitor stand */}
        <rect x="238" y="240" width="44" height="32" rx="4" fill="#2d2d2d" />
        <rect x="215" y="268" width="90" height="8" rx="4" fill="#1a1a1a" />
        {/* Monitor */}
        <rect x="140" y="130" width="240" height="115" rx="12" fill="#1a1a1a" />
        <rect x="150" y="140" width="220" height="95" rx="8" fill="url(#screenGrad)" />
        {/* Screen content lines */}
        <rect x="168" y="158" width="80" height="6" rx="3" fill="#16a34a" opacity="0.8" />
        <rect x="168" y="172" width="140" height="4" rx="2" fill="white" opacity="0.3" />
        <rect x="168" y="183" width="110" height="4" rx="2" fill="white" opacity="0.2" />
        <rect x="168" y="194" width="130" height="4" rx="2" fill="white" opacity="0.2" />
        {/* Match badge on screen */}
        <rect x="270" y="185" width="82" height="32" rx="8" fill="#16a34a" />
        <text x="279" y="198" fill="white" fontSize="8" fontWeight="bold" fontFamily="monospace">94% MATCH</text>
        <text x="284" y="210" fill="white" fontSize="7" fontFamily="monospace">AI Scored</text>
        {/* Chair */}
        <rect x="215" y="300" width="90" height="12" rx="6" fill="#2d2d2d" />
        <rect x="253" y="312" width="14" height="30" rx="4" fill="#2d2d2d" />
        <ellipse cx="260" cy="348" rx="38" ry="8" fill="#1a1a1a" opacity="0.15" />
        {/* Person body */}
        <rect x="238" y="220" width="44" height="55" rx="10" fill="#2d2d2d" />
        {/* Head */}
        <circle cx="260" cy="205" r="22" fill="#f5c5a3" />
        {/* Hair */}
        <path d="M240 196 Q260 178 280 196 Q278 185 260 182 Q242 185 240 196Z" fill="#1a1a1a" />
        {/* Eyes */}
        <circle cx="253" cy="205" r="2.5" fill="#1a1a1a" />
        <circle cx="267" cy="205" r="2.5" fill="#1a1a1a" />
        {/* Smile */}
        <path d="M254 213 Q260 217 266 213" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Arms */}
        <path d="M238 235 Q210 245 200 260" stroke="#2d2d2d" strokeWidth="12" strokeLinecap="round" />
        <path d="M282 235 Q310 245 320 260" stroke="#2d2d2d" strokeWidth="12" strokeLinecap="round" />
        <ellipse cx="200" cy="264" rx="12" ry="8" fill="#f5c5a3" />
        <ellipse cx="320" cy="264" rx="12" ry="8" fill="#f5c5a3" />
        {/* Plant */}
        <rect x="430" y="200" width="14" height="72" rx="4" fill="#1a1a1a" />
        <ellipse cx="437" cy="198" rx="32" ry="28" fill="#16a34a" opacity="0.9" />
        <ellipse cx="455" cy="178" rx="22" ry="20" fill="#16a34a" />
        <ellipse cx="418" cy="182" rx="20" ry="18" fill="#15803d" />
        <path d="M422 270 L430 272 L444 272 L452 270 L448 288 L426 288Z" fill="#d97706" />
        {/* Floating card 1 */}
        <rect x="30" y="100" width="120" height="62" rx="10" fill="white" style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.10))' }} />
        <circle cx="52" cy="120" r="10" fill="#dcfce7" />
        <circle cx="52" cy="120" r="5" fill="#16a34a" />
        <rect x="68" y="113" width="65" height="6" rx="3" fill="#1a1a1a" />
        <rect x="68" y="125" width="48" height="4" rx="2" fill="#9ca3af" />
        <rect x="40" y="140" width="95" height="4" rx="2" fill="#e5e7eb" />
        <rect x="40" y="150" width="75" height="4" rx="2" fill="#e5e7eb" />
        {/* Floating card 2 */}
        <rect x="370" y="310" width="130" height="56" rx="10" fill="white" style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.10))' }} />
        <rect x="382" y="323" width="40" height="5" rx="2" fill="#9ca3af" />
        <rect x="382" y="334" width="70" height="9" rx="3" fill="#1a1a1a" />
        <rect x="382" y="350" width="50" height="4" rx="2" fill="#16a34a" />
        <circle cx="480" cy="335" r="14" fill="#dcfce7" />
        <text x="474" y="340" fill="#16a34a" fontSize="14" fontWeight="bold">✓</text>
        {/* Decorative dots */}
        <circle cx="100" cy="60" r="3" fill="#16a34a" opacity="0.4" />
        <circle cx="420" cy="80" r="4" fill="#16a34a" opacity="0.3" />
        <circle cx="480" cy="160" r="3" fill="#16a34a" opacity="0.5" />
        <circle cx="60" cy="220" r="2" fill="#16a34a" opacity="0.4" />
        <defs>
            <linearGradient id="screenGrad" x1="150" y1="140" x2="370" y2="235" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e3a2f" />
            </linearGradient>
        </defs>
    </svg>
);

const CelebrationIllustration = () => (
    <svg viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 420, margin: '0 auto', display: 'block' }}>
        {/* Person 1 */}
        <circle cx="130" cy="72" r="28" fill="#f5c5a3" />
        <path d="M105 64 Q130 44 155 64 Q153 50 130 46 Q107 50 105 64Z" fill="#1a1a1a" />
        <circle cx="121" cy="72" r="2.5" fill="#1a1a1a" />
        <circle cx="139" cy="72" r="2.5" fill="#1a1a1a" />
        <path d="M122 83 Q130 89 138 83" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" fill="none" />
        <rect x="105" y="102" width="50" height="65" rx="12" fill="#1a1a1a" />
        <path d="M105 112 Q80 87 68 64" stroke="#1a1a1a" strokeWidth="13" strokeLinecap="round" />
        <path d="M155 112 Q165 92 158 72" stroke="#1a1a1a" strokeWidth="13" strokeLinecap="round" />
        <ellipse cx="68" cy="60" rx="12" ry="9" fill="#f5c5a3" />
        <ellipse cx="158" cy="68" rx="12" ry="9" fill="#f5c5a3" />
        <rect x="110" y="165" width="18" height="58" rx="8" fill="#1a1a1a" />
        <rect x="132" y="165" width="18" height="52" rx="8" fill="#1a1a1a" />
        <ellipse cx="119" cy="223" rx="14" ry="6" fill="#111" />
        <ellipse cx="141" cy="217" rx="14" ry="6" fill="#111" />
        {/* Person 2 */}
        <circle cx="280" cy="62" r="28" fill="#f5c5a3" />
        <path d="M255 54 Q280 34 305 54 Q303 40 280 36 Q257 40 255 54Z" fill="#2d2d2d" />
        <circle cx="271" cy="62" r="2.5" fill="#1a1a1a" />
        <circle cx="289" cy="62" r="2.5" fill="#1a1a1a" />
        <path d="M272 74 Q280 80 288 74" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" fill="none" />
        <rect x="255" y="92" width="50" height="65" rx="12" fill="#16a34a" />
        <path d="M255 104 Q235 80 240 54" stroke="#16a34a" strokeWidth="13" strokeLinecap="round" />
        <path d="M305 104 Q330 77 325 52" stroke="#16a34a" strokeWidth="13" strokeLinecap="round" />
        <ellipse cx="240" cy="50" rx="12" ry="9" fill="#f5c5a3" />
        <ellipse cx="326" cy="48" rx="12" ry="9" fill="#f5c5a3" />
        <rect x="260" y="155" width="18" height="62" rx="8" fill="#1a1a1a" />
        <rect x="282" y="155" width="18" height="55" rx="8" fill="#1a1a1a" />
        <ellipse cx="269" cy="217" rx="14" ry="6" fill="#111" />
        <ellipse cx="291" cy="210" rx="14" ry="6" fill="#111" />
        {/* Confetti */}
        <rect x="60" y="32" width="8" height="8" rx="2" fill="#16a34a" opacity="0.7" transform="rotate(20 60 32)" />
        <rect x="340" y="24" width="8" height="8" rx="2" fill="#16a34a" opacity="0.6" transform="rotate(-15 340 24)" />
        <circle cx="205" cy="22" r="5" fill="#16a34a" opacity="0.5" />
        <rect x="182" y="42" width="6" height="6" rx="1" fill="#1a1a1a" opacity="0.25" transform="rotate(30 182 42)" />
        <circle cx="88" cy="136" r="4" fill="#16a34a" opacity="0.35" />
        <circle cx="325" cy="112" r="4" fill="#16a34a" opacity="0.35" />
        <ellipse cx="130" cy="230" rx="44" ry="9" fill="#1a1a1a" opacity="0.07" />
        <ellipse cx="280" cy="224" rx="44" ry="9" fill="#1a1a1a" opacity="0.07" />
    </svg>
);

// ─── Inline Icon Components ────────────────────────────────────────────────────
const FeatureIcons = {
    ai: () => (
        <svg viewBox="0 0 44 44" fill="none" width="44" height="44">
            <rect width="44" height="44" rx="11" fill="#f0fdf4" />
            <circle cx="22" cy="22" r="8" stroke="#16a34a" strokeWidth="2" />
            <circle cx="22" cy="22" r="3" fill="#16a34a" />
            <line x1="22" y1="10" x2="22" y2="6" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
            <line x1="22" y1="38" x2="22" y2="34" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
            <line x1="10" y1="22" x2="6" y2="22" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
            <line x1="38" y1="22" x2="34" y2="22" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    match: () => (
        <svg viewBox="0 0 44 44" fill="none" width="44" height="44">
            <rect width="44" height="44" rx="11" fill="#f0fdf4" />
            <path d="M13 22 L19 28 L31 15" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="22" cy="22" r="12" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
    ),
    speed: () => (
        <svg viewBox="0 0 44 44" fill="none" width="44" height="44">
            <rect width="44" height="44" rx="11" fill="#f0fdf4" />
            <path d="M9 26 Q15 14 22 20 Q29 26 35 11" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" fill="none" />
            <circle cx="35" cy="11" r="3" fill="#16a34a" />
            <rect x="12" y="30" width="20" height="4" rx="2" fill="#dcfce7" />
            <rect x="12" y="30" width="14" height="4" rx="2" fill="#16a34a" />
        </svg>
    ),
    eye: () => (
        <svg viewBox="0 0 44 44" fill="none" width="44" height="44">
            <rect width="44" height="44" rx="11" fill="#f0fdf4" />
            <path d="M9 22 C9 22 13 14 22 14 C31 14 35 22 35 22 C35 22 31 30 22 30 C13 30 9 22 9 22Z" stroke="#16a34a" strokeWidth="1.8" fill="#dcfce7" />
            <circle cx="22" cy="22" r="4" fill="#16a34a" />
            <circle cx="22" cy="22" r="2" fill="white" />
        </svg>
    ),
    location: () => (
        <svg viewBox="0 0 44 44" fill="none" width="44" height="44">
            <rect width="44" height="44" rx="11" fill="#f0fdf4" />
            <path d="M22 9 C16 9 11 14 11 20 C11 28 22 37 22 37 C22 37 33 28 33 20 C33 14 28 9 22 9Z" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.8" />
            <circle cx="22" cy="20" r="4.5" fill="#16a34a" />
        </svg>
    ),
    skill: () => (
        <svg viewBox="0 0 44 44" fill="none" width="44" height="44">
            <rect width="44" height="44" rx="11" fill="#f0fdf4" />
            <path d="M22 9 L24.5 16.5 L32 16.5 L26 21 L28.5 28.5 L22 24 L15.5 28.5 L18 21 L12 16.5 L19.5 16.5Z"
                fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
    ),
};

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function Landing() {
    const navigate = useNavigate();

    useEffect(() => {
        const obs = new IntersectionObserver(
            (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
            { threshold: 0.07 }
        );
        document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, []);

    const features = [
        { Icon: FeatureIcons.ai, title: 'AI-Powered Matching', desc: 'Our model scores every match across skills, distance, wages, and experience — giving you a ranked, explainable result.' },
        { Icon: FeatureIcons.match, title: 'Instant Results', desc: 'No more searching. Create a profile and matches appear immediately, ranked by compatibility score.' },
        { Icon: FeatureIcons.speed, title: 'Real-time Updates', desc: 'Jobs and workers update live. See new opportunities the moment they\'re posted to the platform.' },
        { Icon: FeatureIcons.eye, title: 'Full Transparency', desc: 'Every match includes a clear score breakdown so you understand exactly why you were matched.' },
        { Icon: FeatureIcons.location, title: 'Location-Smart', desc: 'Distance is factored into every match. Work near you always ranks higher in your results.' },
        { Icon: FeatureIcons.skill, title: 'Skill Precision', desc: 'Skills are parsed and cross-referenced against job requirements with semantic intelligence.' },
    ];

    const testimonials = [
        { name: 'Ravi Kumar', handle: '@ravi_farm', text: 'AgroMatch transformed how I hire. Found 3 skilled workers in one day — something that used to take a full week of phone calls.' },
        { name: 'Priya Devi', handle: '@priya_labor', text: 'The AI match score was spot on. Got a job 2km from my village paying exactly my rate. No middleman, no commission.' },
        { name: 'Suresh Naidu', handle: '@suresh_n', text: 'The transparency is what got me. I could see exactly why each worker was matched. Made hiring decisions so much easier.' },
        { name: 'Lakshmi B', handle: '@lakshmi_b', text: 'Never had to travel far for work again. The location-based matching is accurate and the pay is always what was shown.' },
        { name: 'Arjun Reddy', handle: '@arjun_r', text: 'Posted a job, got 8 matched applications in 4 hours. All relevant. Our harvest was completed on time for the first time in years.' },
        { name: 'Meena Pillai', handle: '@meena_p', text: 'Simple to use even on a basic phone. Found workers who actually knew tractor irrigation — no generic applicants.' },
    ];

    return (
        <div style={{ fontFamily: "'Instrument Sans', 'DM Sans', sans-serif", background: '#fff', color: '#111' }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .serif { font-family: 'Instrument Serif', Georgia, serif; font-style: italic; }
        .serif-upright { font-family: 'Instrument Serif', Georgia, serif; }
        .reveal { opacity: 0; transform: translateY(26px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .reveal.visible { opacity: 1; transform: none; }
        .d1 { transition-delay: 0.08s; }
        .d2 { transition-delay: 0.16s; }
        .d3 { transition-delay: 0.24s; }
        .hi { animation: hi 0.75s cubic-bezier(0.16,1,0.3,1) both; }
        .hi2 { animation: hi 0.75s 0.1s cubic-bezier(0.16,1,0.3,1) both; }
        .hi3 { animation: hi 0.75s 0.2s cubic-bezier(0.16,1,0.3,1) both; }
        .hi4 { animation: hi 0.75s 0.3s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes hi { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        .pill { display:inline-flex;align-items:center;gap:7px;background:#f0fdf4;border:1px solid #bbf7d0;color:#16a34a;font-size:13px;font-weight:600;letter-spacing:.04em;padding:7px 16px;border-radius:100px; }
        .dot { width:7px;height:7px;background:#16a34a;border-radius:50%;animation:blink 2s infinite; }
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
        .btn-dark{display:inline-flex;align-items:center;gap:9px;background:#111;color:#fff;font-size:16px;font-weight:600;padding:15px 32px;border-radius:10px;border:none;cursor:pointer;font-family:inherit;transition:background .15s,transform .15s;}
        .btn-dark:hover{background:#333;transform:translateY(-1px);}
        .btn-outline{display:inline-flex;align-items:center;gap:9px;background:#fff;color:#111;font-size:16px;font-weight:600;padding:15px 32px;border-radius:10px;border:1.5px solid #d1d5db;cursor:pointer;font-family:inherit;transition:border-color .15s,transform .15s;}
        .btn-outline:hover{border-color:#111;transform:translateY(-1px);}
        .fcard{background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:32px;transition:box-shadow .2s,transform .2s,border-color .2s;}
        .fcard:hover{box-shadow:0 14px 40px rgba(0,0,0,.08);transform:translateY(-3px);border-color:#16a34a;}
        .tcard{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:28px;transition:box-shadow .2s;}
        .tcard:hover{box-shadow:0 8px 28px rgba(0,0,0,.06);}
        .av{width:44px;height:44px;border-radius:50%;background:#16a34a;color:#fff;font-weight:700;font-size:17px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .nav-a{font-size:15px;font-weight:500;color:#666;background:none;border:none;cursor:pointer;font-family:inherit;transition:color .15s;padding:0;}
        .nav-a:hover{color:#111;}
        .footer-a{font-size:14px;color:#999;text-decoration:none;transition:color .15s;display:block;margin-bottom:10px;}
        .footer-a:hover{color:#111;}
        .grey-logo{font-weight:700;font-size:15px;color:#aaa;letter-spacing:.02em;}
      `}</style>

            {/* ── Nav ── */}
            <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f0f0ec' }}>
                <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 48px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, background: '#111', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 18 }}>AgroMatch</span>
                        <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 100 }}>AI</span>
                    </div>
                    <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
                        <button className="nav-a" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</button>
                        <button className="nav-a" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>Pricing</button>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <button className="nav-a" onClick={() => navigate('/login')}>Login</button>
                        <button onClick={() => navigate('/login?register=true')} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Sign Up</button>
                    </div>
                </div>
            </nav>

            {/* ── Hero Text ── */}
            <section style={{ textAlign: 'center', padding: '100px 48px 56px', maxWidth: 1000, margin: '0 auto' }}>
                <div className="hi" style={{ marginBottom: 24 }}>
                    <div className="pill"><span className="dot" />Your Workspace, Perfected</div>
                </div>
                <h1 className="hi2 serif-upright" style={{ fontSize: 'clamp(56px,7vw,90px)', lineHeight: 1.05, fontWeight: 400, letterSpacing: '-0.025em', marginBottom: 24 }}>
                    All-In-One AI Job Matching<br />for <span className="serif">Agriculture</span>
                </h1>
                <p className="hi3" style={{ fontSize: 20, color: '#666', lineHeight: 1.75, maxWidth: 620, margin: '0 auto 40px' }}>
                    AgroMatch AI matches farmers with skilled workers based on skills,
                    location, wages, and experience — right match in seconds, not days.
                </p>
                <div className="hi4" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                    <button className="btn-dark" onClick={() => navigate('/login?register=true&role=farmer')}>
                        Get Started
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                    <button className="btn-outline" onClick={() => navigate('/login')}>Log In</button>
                </div>
            </section>

            {/* ── Hero Illustration ── */}
            <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 48px 96px' }}>
                <div style={{ background: '#f5f5f2', border: '1px solid #e5e5e0', borderRadius: 22, padding: '36px 24px 16px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 14, left: 18, display: 'flex', gap: 6 }}>
                        {['#e8e8e4', '#e8e8e4', '#e8e8e4'].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                    </div>
                    <HeroIllustration />
                </div>
            </section>

            {/* ── Features ── */}
            <section id="features" style={{ background: '#f8f8f6', padding: '104px 48px', borderTop: '1px solid #ebebea', borderBottom: '1px solid #ebebea' }}>
                <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                    <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
                        <h2 className="serif-upright" style={{ fontSize: 'clamp(38px,4vw,58px)', fontWeight: 400, marginBottom: 16 }}>Why choose AgroMatch AI?</h2>
                        <p style={{ color: '#777', fontSize: 18, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
                            An experiment in how AI can make agricultural work fairer, faster, and more transparent.
                        </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
                        {features.map((f, i) => (
                            <div key={i} className={`fcard reveal d${(i % 3) + 1}`}>
                                <div style={{ marginBottom: 16 }}><f.Icon /></div>
                                <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 9 }}>{f.title}</p>
                                <p style={{ fontSize: 15, color: '#666', lineHeight: 1.65 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Dashboard preview "all in one place" ── */}
            <section style={{ padding: '104px 48px', textAlign: 'center', background: '#fff' }}>
                <div className="reveal" style={{ maxWidth: 700, margin: '0 auto 56px' }}>
                    <h2 className="serif-upright" style={{ fontSize: 'clamp(36px,4vw,56px)', fontWeight: 400, lineHeight: 1.15, marginBottom: 16 }}>
                        Keep track of your matches<br />all in one place
                    </h2>
                    <p style={{ color: '#777', fontSize: 18, lineHeight: 1.7 }}>
                        Your dashboard shows every AI match ranked by score — with skills, distance, and wage at a glance.
                    </p>
                </div>
                {/* Dashboard card mockup */}
                <div className="reveal" style={{ maxWidth: 1100, margin: '0 auto', background: '#f5f5f2', border: '1px solid #e5e5e0', borderRadius: 22, padding: 36, textAlign: 'left' }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
                        {[0, 1, 2].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: '#e0e0dc' }} />)}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
                        {[
                            { title: 'Rice Harvesting Expert', score: 94, wage: '₹750/day', skills: ['harvesting', 'irrigation'] },
                            { title: 'Drip Irrigation Setup', score: 81, wage: '₹620/day', skills: ['drip irrigation', 'pipes'] },
                            { title: 'Pesticide Application', score: 67, wage: '₹500/day', skills: ['spraying', 'safety'] },
                        ].map((job, i) => (
                            <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 8 }}>
                                    <p style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.4, flex: 1 }}>{job.title}</p>
                                    <span style={{ background: job.score >= 85 ? '#dcfce7' : job.score >= 70 ? '#fef9c3' : '#ffedd5', color: job.score >= 85 ? '#166534' : job.score >= 70 ? '#854d0e' : '#9a3412', fontWeight: 700, fontSize: 12, padding: '4px 10px', borderRadius: 100, whiteSpace: 'nowrap' }}>{job.score}%</span>
                                </div>
                                <div style={{ height: 5, background: '#f0f0ec', borderRadius: 100, marginBottom: 14 }}>
                                    <div style={{ width: `${job.score}%`, height: '100%', background: job.score >= 85 ? '#16a34a' : job.score >= 70 ? '#eab308' : '#f97316', borderRadius: 100 }} />
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                                    {job.skills.map(s => <span key={s} style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 100 }}>{s}</span>)}
                                </div>
                                <p style={{ fontSize: 15, color: '#16a34a', fontWeight: 700, marginBottom: 12 }}>{job.wage}</p>
                                <button style={{ width: '100%', background: '#111', color: '#fff', border: 'none', borderRadius: 9, padding: '11px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Apply</button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How It Works ── */}
            <section id="how" style={{ background: '#f8f8f6', padding: '104px 48px', borderTop: '1px solid #ebebea', borderBottom: '1px solid #ebebea' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <div className="reveal" style={{ textAlign: 'center', marginBottom: 72 }}>
                        <h2 className="serif-upright" style={{ fontSize: 'clamp(36px,4vw,56px)', fontWeight: 400, marginBottom: 14 }}>How it works</h2>
                        <p style={{ color: '#777', fontSize: 18 }}>Three steps to your first match</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                        {[
                            { n: '01', title: 'Create your profile', desc: 'Sign up in 2 minutes. Add your skills, location, and expected wages. Farmers post jobs with their requirements and location.' },
                            { n: '02', title: 'AI scores every match', desc: 'Our model cross-references your profile against all available opportunities, scoring compatibility across 8 dimensions including skills, distance, and wages.' },
                            { n: '03', title: 'Connect and start', desc: 'View your ranked matches with full score explanations. Apply in one click. Farmers reach out directly — no middleman fees.' },
                        ].map((step, i) => (
                            <div key={i} className={`reveal d${i + 1}`} style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
                                <div style={{ width: 52, height: 52, border: '2px solid #111', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, flexShrink: 0, background: '#fff' }}>{step.n}</div>
                                <div style={{ paddingTop: 12 }}>
                                    <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
                                    <p style={{ color: '#666', fontSize: 16, lineHeight: 1.7 }}>{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* ── Testimonials ── */}
            <section id="testimonials" style={{ padding: '104px 48px', background: '#fff' }}>
                <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                    <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
                        <h2 className="serif-upright" style={{ fontSize: 'clamp(36px,4vw,56px)', fontWeight: 400, marginBottom: 14 }}>Trusted by all</h2>
                        <p style={{ color: '#777', fontSize: 18, maxWidth: 500, margin: '0 auto' }}>
                            Join thousands of farmers and workers who rely on AgroMatch for their livelihood.
                        </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: 18 }}>
                        {testimonials.map((t, i) => (
                            <div key={i} className={`tcard reveal d${(i % 3) + 1}`}>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                                    <div className="av">{t.name[0]}</div>
                                    <div>
                                        <p style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</p>
                                        <p style={{ fontSize: 13, color: '#aaa' }}>{t.handle}</p>
                                    </div>
                                </div>
                                <p style={{ fontSize: 15, color: '#555', lineHeight: 1.72 }}>{t.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Open Source / CTA ── */}
            <section style={{ background: '#f8f8f6', borderTop: '1px solid #ebebea', padding: '104px 48px', textAlign: 'center' }}>
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                    <div className="reveal" style={{ marginBottom: 12 }}>
                        <h2 className="serif-upright" style={{ fontSize: 'clamp(36px,4vw,56px)', fontWeight: 400, marginBottom: 16 }}>Proudly Open Source</h2>
                        <p style={{ color: '#777', fontSize: 18, lineHeight: 1.7, marginBottom: 44 }}>
                            AgroMatch AI is built in public — better opportunities for agricultural workers across India.
                            The code is available on <span style={{ color: '#16a34a', fontWeight: 600 }}>GitHub</span>.
                        </p>
                    </div>
                    <div className="reveal">
                        <CelebrationIllustration />
                    </div>
                    <div className="reveal" style={{ marginTop: 36, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn-dark" onClick={() => navigate('/login?register=true&role=farmer')}>
                            Start Hiring
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </button>
                        <button className="btn-outline" onClick={() => navigate('/login?register=true&role=labor')}>Find Work</button>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer style={{ background: '#fff', borderTop: '1px solid #ebebea', padding: '28px 48px' }}>
                <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 22, height: 22, background: '#111', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>AgroMatch AI</span>
                        <span style={{ fontSize: 13, color: '#aaa', marginLeft: 4 }}>— © 2026</span>
                    </div>
                    <a href="https://github.com/HarishChittanuri/AgroMatch-AI" target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 14, color: '#666', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#111')} onMouseLeave={e => (e.currentTarget.style.color = '#666')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.929.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.216.69.825.573C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" /></svg>
                        View on GitHub
                    </a>
                </div>
            </footer>
        </div>
    );
}