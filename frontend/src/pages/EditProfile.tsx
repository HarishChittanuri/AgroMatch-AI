import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profiles } from '../services/api';

const SKILL_OPTIONS = [
    'Plowing', 'Harvesting', 'Planting', 'Irrigation', 'Fertilizer Application',
    'Tractor Driving', 'Pesticide Spraying', 'Weeding', 'Crop Monitoring',
    'Dairy Farming', 'Horticulture', 'Drip Irrigation', 'Equipment Repair', 'Maintenance',
];

export default function EditProfile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        bio: '',
        daily_rate: '',
        location: '',
    });
    const [skills, setSkills] = useState<string[]>([]);
    const [customSkill, setCustomSkill] = useState('');

    // ── Load existing profile on mount ──────────────────────────────────────
    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        profiles.getMyProfile()
            .then(res => {
                const p = res.data;
                setFormData({
                    full_name: p.full_name || '',
                    phone: p.phone || '',
                    bio: p.bio || '',
                    daily_rate: p.daily_rate?.toString() || '',
                    location: p.location || '',
                });
                // skills stored as comma-separated string
                setSkills(p.skills ? p.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []);
            })
            .catch(() => setError('Failed to load your profile.'))
            .finally(() => setLoading(false));
    }, []);

    const set = (key: string, val: string) => setFormData(prev => ({ ...prev, [key]: val }));

    const toggleSkill = (skill: string) => {
        setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
    };

    const addCustomSkill = () => {
        const s = customSkill.trim();
        if (s && !skills.includes(s)) { setSkills(prev => [...prev, s]); }
        setCustomSkill('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.full_name.trim()) { setError('Name is required'); return; }
        if (skills.length === 0) { setError('Add at least one skill'); return; }
        if (!formData.daily_rate) { setError('Daily rate is required'); return; }
        setSaving(true);
        setError('');
        try {
            await profiles.updateLabor({
                ...formData,
                daily_rate: parseFloat(formData.daily_rate),
                skills: skills.join(', '),
            });
            setSuccess(true);
            setTimeout(() => navigate('/labor/dashboard'), 1200);
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => { localStorage.clear(); navigate('/'); };
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf9f7', fontFamily: "'Instrument Sans', sans-serif" }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, border: '3px solid #dcfce7', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 18px' }} />
                <p style={{ color: '#aaa', fontSize: 17 }}>Loading your profile…</p>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Instrument Sans', 'DM Sans', sans-serif" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .serif { font-family: 'Instrument Serif', Georgia, serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes successPop { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:none} }

        .scard { background:#fff; border:1px solid #e8e4e0; border-radius:20px; overflow:hidden; }
        .nib { background:none; border:none; cursor:pointer; padding:9px; border-radius:10px; transition:background .15s; display:flex; align-items:center; justify-content:center; color:#6b7280; }
        .nib:hover { background:#f3f1ef; color:#111; }

        .pi { width:100%; padding:14px 18px; border:1.5px solid #e8e4e0; border-radius:12px; font-size:16px; outline:none; background:#faf9f7; font-family:inherit; color:#111; transition:border-color .2s, box-shadow .2s, background .2s; }
        .pi:focus { border-color:#16a34a; background:#fff; box-shadow:0 0 0 3.5px rgba(22,163,74,.1); }
        .pi::placeholder { color:#c8c4be; }
        textarea.pi { resize:vertical; min-height:110px; line-height:1.6; }
        .fl { font-size:12px; font-weight:700; color:#aaa; text-transform:uppercase; letter-spacing:.08em; margin-bottom:9px; display:block; }

        .skill-chip { padding:8px 16px; border-radius:100px; font-size:14px; font-weight:600; cursor:pointer; border:1.5px solid #e8e4e0; background:#faf9f7; color:#374151; transition:all .15s; font-family:inherit; }
        .skill-chip:hover { border-color:#16a34a; color:#16a34a; }
        .skill-chip.selected { background:#f0fdf4; border-color:#16a34a; color:#166534; }
        .skill-remove { display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:100px; font-size:13px; font-weight:600; background:#f0fdf4; border:1.5px solid #bbf7d0; color:#166534; cursor:pointer; font-family:inherit; }
        .skill-remove:hover { background:#dcfce7; }

        .btn-save { width:100%; background:#111; color:white; border:none; padding:16px; border-radius:14px; font-size:17px; font-weight:700; cursor:pointer; font-family:inherit; display:flex; align-items:center; justify-content:center; gap:10px; transition:background .15s, transform .15s; }
        .btn-save:hover:not(:disabled) { background:#222; transform:translateY(-2px); }
        .btn-save:disabled { opacity:.55; cursor:not-allowed; }
        .spin-sm { width:20px; height:20px; border:2.5px solid rgba(255,255,255,.35); border-top-color:white; border-radius:50%; animation:spin .7s linear infinite; }
      `}</style>

            {/* ── Navbar ── */}
            <nav style={{ background: '#fff', borderBottom: '1px solid #e8e4e0', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, background: '#111', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 18, color: '#111' }}>AgroMatch</span>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100 }}>Labor</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#aaa', fontSize: 14 }}>
                        <button onClick={() => navigate('/labor/dashboard')} className="nib" style={{ padding: '4px 8px', fontSize: 14, color: '#aaa', fontFamily: 'inherit' }}>Dashboard</button>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                        <span style={{ color: '#111', fontWeight: 600 }}>Edit Profile</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg, #16a34a, #15803d)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16 }}>
                            {(formData.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                        </div>
                        <button onClick={handleLogout} className="nib" title="Logout">
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Body ── */}
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '52px 24px 80px' }}>
                {/* Header */}
                <button onClick={() => navigate('/labor/dashboard')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, color: '#aaa', fontWeight: 600, marginBottom: 36, padding: 0 }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#111')} onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                    Back to Dashboard
                </button>

                <p style={{ fontSize: 13, color: '#aaa', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>Your Profile</p>
                <h1 className="serif" style={{ fontSize: 44, fontWeight: 400, color: '#111', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 36 }}>
                    Edit Profile
                </h1>

                {/* Success banner */}
                {success && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: '20px 24px', marginBottom: 28, display: 'flex', gap: 14, alignItems: 'center', animation: 'successPop .4s ease' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" /></svg>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: 16, color: '#166534' }}>Profile updated!</p>
                            <p style={{ fontSize: 14, color: '#16a34a' }}>Redirecting to dashboard…</p>
                        </div>
                    </div>
                )}

                {/* Error banner */}
                {error && (
                    <div style={{ background: '#fff0f0', border: '1px solid #fca5a5', borderRadius: 14, padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        <span style={{ color: '#991b1b', fontWeight: 600, fontSize: 14 }}>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

                    {/* ── Section 1: Personal Info ── */}
                    <div className="scard" style={{ padding: '32px 36px', animation: 'fadeUp .4s ease' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 24 }}>Personal Info</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div>
                                <label className="fl">Full Name *</label>
                                <input className="pi" type="text" value={formData.full_name} onChange={e => set('full_name', e.target.value)}
                                    placeholder="Your full name" required />
                            </div>
                            <div>
                                <label className="fl">Mobile Number *</label>
                                <input className="pi" type="tel" value={formData.phone} onChange={e => set('phone', e.target.value)}
                                    placeholder="+91 98765 43210" minLength={10} required />
                            </div>
                            <div>
                                <label className="fl">Your Location</label>
                                <input className="pi" type="text" value={formData.location} onChange={e => set('location', e.target.value)}
                                    placeholder="e.g. Hyderabad, Telangana" />
                                <p style={{ fontSize: 13, color: '#ccc', marginTop: 8 }}>Used to match you with nearby jobs</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Section 2: Skills ── */}
                    <div className="scard" style={{ padding: '32px 36px', animation: 'fadeUp .45s ease' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Skills</p>
                        <p style={{ fontSize: 14, color: '#ccc', marginBottom: 20 }}>Select all that apply</p>

                        {/* Selected chips */}
                        {skills.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                                {skills.map(s => (
                                    <button key={s} type="button" className="skill-remove" onClick={() => toggleSkill(s)}>
                                        {s}
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Preset skill buttons */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                            {SKILL_OPTIONS.filter(s => !skills.includes(s)).map(s => (
                                <button key={s} type="button" className="skill-chip" onClick={() => toggleSkill(s)}>{s}</button>
                            ))}
                        </div>

                        {/* Custom skill */}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <input className="pi" type="text" value={customSkill} onChange={e => setCustomSkill(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill(); } }}
                                placeholder="Type a custom skill and press Enter…" style={{ flex: 1 }} />
                            <button type="button" onClick={addCustomSkill}
                                style={{ padding: '0 20px', background: '#f0fdf4', color: '#166534', border: '1.5px solid #bbf7d0', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                                + Add
                            </button>
                        </div>
                    </div>

                    {/* ── Section 3: About & Rate ── */}
                    <div className="scard" style={{ padding: '32px 36px', animation: 'fadeUp .5s ease' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 24 }}>About & Rate</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div>
                                <label className="fl">Bio / About You *</label>
                                <textarea className="pi" value={formData.bio} onChange={e => set('bio', e.target.value)}
                                    placeholder="Describe your experience, crops you've worked with, how many years you've been farming…" required />
                            </div>
                            <div>
                                <label className="fl">Expected Daily Rate (₹) *</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 20, fontWeight: 600 }}>₹</span>
                                    <input className="pi" type="number" value={formData.daily_rate} onChange={e => set('daily_rate', e.target.value)}
                                        style={{ paddingLeft: 40 }} placeholder="500" min="50" step="50" required />
                                </div>
                                <p style={{ fontSize: 13, color: '#ccc', marginTop: 8 }}>Jobs matching this pay rate will be prioritised for you</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Save button ── */}
                    <button type="submit" className="btn-save" disabled={saving || success}>
                        {saving
                            ? <><div className="spin-sm" /> Saving…</>
                            : success
                                ? <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg> Saved!</>
                                : <>Save Changes <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></>
                        }
                    </button>

                </form>
            </div>
        </div>
    );
}
