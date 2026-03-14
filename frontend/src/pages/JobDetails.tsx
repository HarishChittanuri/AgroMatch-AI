import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jobs as jobsApi, applications as applicationsApi, ai as aiApi } from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Job {
    id: number;
    title: string;
    description: string;
    wage: number;
    location_lat: number | null;
    location_lng: number | null;
    farmer_id: number;
    created_at: string;
    job_vector?: number[] | null;
}

interface ExistingApplication {
    id: number;
    status: 'pending' | 'accepted' | 'rejected';
    applied_at: string;
    match_score: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const scoreMeta = (s: number) =>
    s >= 80 ? { bg: '#dcfce7', txt: '#166534', bar: '#16a34a', label: 'Excellent Match' }
        : s >= 60 ? { bg: '#fef9c3', txt: '#854d0e', bar: '#eab308', label: 'Good Match' }
            : { bg: '#ffedd5', txt: '#9a3412', bar: '#f97316', label: 'Fair Match' };

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

export default function JobDetails() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const jobId = parseInt(id || '0', 10);

    const [job, setJob] = useState<Job | null>(null);
    const [existing, setExisting] = useState<ExistingApplication | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    // AI explanation state
    const [selectedLang, setSelectedLang] = useState('hindi');
    const [explanation, setExplanation] = useState('');
    const [explaining, setExplaining] = useState(false);
    const [explainError, setExplainError] = useState('');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        if (!jobId) { setError('Invalid job ID'); setLoading(false); return; }
        fetchAll();
    }, [jobId]);

    const fetchAll = async () => {
        setLoading(true);
        setError('');
        try {
            const [jobRes, appsRes] = await Promise.all([
                jobsApi.getById(jobId),
                // Only labor users check their applications
                user?.role === 'labor' ? applicationsApi.getMyApplications() : Promise.resolve({ data: [] })
            ]);
            setJob(jobRes.data);
            // Find if already applied to this job
            const alreadyApplied = (appsRes.data || []).find((a: any) => a.job_id === jobId);
            setExisting(alreadyApplied || null);
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Failed to load job details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (!window.confirm(`Apply to "${job?.title}"?`)) return;
        setApplying(true);
        setError('');
        try {
            await applicationsApi.apply(jobId);
            setSuccess(true);
            // Refresh to show the new application status
            await fetchAll();
        } catch (err: any) {
            const detail = err?.response?.data?.detail || 'Failed to submit application. Please try again.';
            setError(detail);
        } finally {
            setApplying(false);
        }
    };

    const handleLogout = () => { localStorage.clear(); navigate('/'); };

    const LANGUAGES = [
        { key: 'hindi', label: 'हिन्दी', eng: 'Hindi' },
        { key: 'telugu', label: 'తెలుగు', eng: 'Telugu' },
        { key: 'tamil', label: 'தமிழ்', eng: 'Tamil' },
        { key: 'kannada', label: 'ಕನ್ನಡ', eng: 'Kannada' },
        { key: 'bengali', label: 'বাংলা', eng: 'Bengali' },
        { key: 'marathi', label: 'मराठी', eng: 'Marathi' },
        { key: 'gujarati', label: 'ગુજરાતી', eng: 'Gujarati' },
        { key: 'malayalam', label: 'മലയാളം', eng: 'Malayalam' },
    ];

    const handleExplain = async () => {
        if (!job) return;
        setExplaining(true);
        setExplainError('');
        setExplanation('');
        try {
            const res = await aiApi.explainJob({
                title: job.title,
                description: job.description,
                wage: job.wage,
                language: selectedLang,
            });
            setExplanation(res.data.explanation);
        } catch (err: any) {
            setExplainError(err?.response?.data?.detail || 'Failed to generate explanation. Try again.');
        } finally {
            setExplaining(false);
        }
    };

    // ── Loading ──
    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf9f7', fontFamily: "'Instrument Sans', sans-serif" }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, border: '3px solid #dcfce7', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 18px' }} />
                <p style={{ color: '#aaa', fontSize: 17 }}>Loading job details…</p>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    // ── Hard error (no job loaded) ──
    if (error && !job) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#faf9f7', fontFamily: "'Instrument Sans', sans-serif", gap: 20 }}>
            <div style={{ width: 64, height: 64, background: '#fee2e2', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            </div>
            <p style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>{error}</p>
            <button onClick={() => navigate('/labor/dashboard')}
                style={{ background: '#111', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Back to Dashboard
            </button>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    const score = existing?.match_score ?? 0;
    const sc = score > 0 ? scoreMeta(score) : null;

    const statusMap: Record<string, { bg: string; txt: string; border: string; label: string }> = {
        pending: { bg: '#fef9c3', txt: '#854d0e', border: '#fde68a', label: 'Pending Review' },
        accepted: { bg: '#dcfce7', txt: '#166534', border: '#bbf7d0', label: 'Accepted 🎉' },
        rejected: { bg: '#fee2e2', txt: '#991b1b', border: '#fca5a5', label: 'Rejected' },
    };

    return (
        <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Instrument Sans', 'DM Sans', sans-serif" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .serif { font-family: 'Instrument Serif', Georgia, serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes successPop { from{opacity:0;transform:scale(0.9) translateY(8px)} to{opacity:1;transform:none} }

        .scard { background:#fff; border:1px solid #e8e4e0; border-radius:20px; overflow:hidden; }
        .nib { background:none; border:none; cursor:pointer; padding:9px; border-radius:10px; transition:background .15s; display:flex; align-items:center; justify-content:center; color:#6b7280; }
        .nib:hover { background:#f3f1ef; color:#111; }
        .detail-row { display:flex; align-items:center; gap:14px; padding:16px 20px; border-bottom:1px solid #f3f1ef; }
        .detail-row:last-child { border-bottom:none; }
        .btn-apply { width:100%; background:#111; color:white; border:none; padding:16px; border-radius:14px; font-size:17px; font-weight:700; cursor:pointer; font-family:inherit; display:flex; align-items:center; justify-content:center; gap:10px; transition:background .15s, transform .15s, box-shadow .15s; }
        .btn-apply:hover:not(:disabled) { background:#222; transform:translateY(-2px); box-shadow:0 10px 28px rgba(0,0,0,.2); }
        .btn-apply:disabled { opacity:.55; cursor:not-allowed; }
        .spin-sm { width:20px; height:20px; border:2.5px solid rgba(255,255,255,.35); border-top-color:white; border-radius:50%; animation:spin .7s linear infinite; }
      `}</style>

            {/* ── Navbar ── */}
            <nav style={{ background: '#fff', borderBottom: '1px solid #e8e4e0', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 56px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, background: '#111', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 18, color: '#111' }}>AgroMatch</span>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100 }}>Labor</span>
                    </div>
                    {/* Breadcrumb */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#aaa', fontSize: 14 }}>
                        <button onClick={() => navigate('/labor/dashboard')} className="nib" style={{ padding: '4px 8px', fontSize: 14, color: '#aaa', fontFamily: 'inherit' }}>Dashboard</button>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                        <span style={{ color: '#111', fontWeight: 600 }}>Job Details</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button className="nib">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                        </button>
                        <div style={{ width: 1, height: 28, background: '#e8e4e0', margin: '0 4px' }} />
                        <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #16a34a, #15803d)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 17 }}>
                            {(user?.email?.[0] || 'U').toUpperCase()}
                        </div>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: 15, color: '#111', lineHeight: 1.2 }}>Labor Profile</p>
                            <p style={{ fontSize: 12, color: '#aaa' }}>{user?.email || ''}</p>
                        </div>
                        <button onClick={handleLogout} className="nib" title="Logout" style={{ marginLeft: 4 }}>
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Body ── */}
            <div style={{ maxWidth: 1440, margin: '0 auto', padding: '52px 56px' }}>

                {/* Back button */}
                <button onClick={() => navigate('/labor/dashboard')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, color: '#aaa', fontWeight: 600, marginBottom: 36, padding: 0, transition: 'color .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#111')} onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                    Back to Dashboard
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>

                    {/* ── Left column: Job Info ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                        {/* Header card */}
                        <div className="scard" style={{ padding: '38px 40px', animation: 'fadeUp .4s ease' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18, marginBottom: 24, flexWrap: 'wrap' }}>
                                <div>
                                    <p style={{ fontSize: 13, color: '#aaa', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>Job Opportunity</p>
                                    <h1 className="serif" style={{ fontSize: 40, fontWeight: 400, color: '#111', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 14 }}>{job?.title}</h1>
                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                                        <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100 }}>Active</span>
                                        {job?.created_at && (
                                            <span style={{ fontSize: 13, color: '#aaa' }}>Posted {formatDate(job.created_at)}</span>
                                        )}
                                    </div>
                                </div>
                                {sc && (
                                    <div style={{ background: sc.bg, color: sc.txt, padding: '14px 20px', borderRadius: 16, textAlign: 'center', flexShrink: 0 }}>
                                        <p style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{Math.round(score)}%</p>
                                        <p style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>{sc.label}</p>
                                    </div>
                                )}
                            </div>

                            {/* Wage highlight */}
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: '18px 22px', display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 44, height: 44, background: 'white', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                </div>
                                <div>
                                    <p style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Wage</p>
                                    <p style={{ fontSize: 26, fontWeight: 700, color: '#15803d', lineHeight: 1 }}>₹{job?.wage}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description card */}
                        <div className="scard" style={{ padding: '32px 36px', animation: 'fadeUp .45s ease' }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 34, height: 34, background: '#f3f1ef', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                                </div>
                                Job Description
                            </h2>
                            <p style={{ fontSize: 16, color: '#4b5563', lineHeight: 1.8 }}>{job?.description || 'No description provided.'}</p>
                        </div>

                        {/* Location card */}
                        {(job?.location_lat || job?.location_lng) && (
                            <div className="scard" style={{ padding: '32px 36px', animation: 'fadeUp .5s ease' }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 34, height: 34, background: '#eff6ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                    </div>
                                    Location
                                </h2>
                                <div className="scard" style={{ borderRadius: 12, overflow: 'hidden' }}>
                                    <div className="detail-row">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /></svg>
                                        <span style={{ fontSize: 14, color: '#4b5563' }}>
                                            Lat {job.location_lat?.toFixed(4)}, Lng {job.location_lng?.toFixed(4)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {sc && score > 0 && (
                            <div className="scard" style={{ padding: '32px 36px', animation: 'fadeUp .55s ease' }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 34, height: 34, background: '#f0fdf4', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                                    </div>
                                    Your Match Score
                                </h2>
                                <div style={{ marginBottom: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                        <span style={{ fontSize: 14, color: '#aaa', fontWeight: 500 }}>Overall compatibility</span>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: sc.txt }}>{Math.round(score)}% — {sc.label}</span>
                                    </div>
                                    <div style={{ height: 10, background: '#f3f1ef', borderRadius: 100, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${score}%`, background: `linear-gradient(90deg, ${sc.bar}, ${sc.bar}cc)`, borderRadius: 100, transition: 'width .8s ease' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── AI Multilingual Explanation (labor only) ── */}
                        {user?.role === 'labor' && (
                            <div className="scard" style={{ padding: '32px 36px', animation: 'fadeUp .6s ease' }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #fdf4ff, #ede9fe)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
                                    Explain in Your Language
                                </h2>
                                <p style={{ fontSize: 13, color: '#aaa', marginBottom: 20 }}>Let AI explain this job in simple words in your language</p>

                                {/* Language selector */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                                    {LANGUAGES.map(lang => (
                                        <button key={lang.key} type="button"
                                            onClick={() => { setSelectedLang(lang.key); setExplanation(''); }}
                                            style={{
                                                padding: '7px 14px', borderRadius: 100, fontSize: 14, fontWeight: 600,
                                                cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                                                background: selectedLang === lang.key ? '#7c3aed' : '#faf9f7',
                                                color: selectedLang === lang.key ? 'white' : '#374151',
                                                border: selectedLang === lang.key ? '1.5px solid #7c3aed' : '1.5px solid #e8e4e0',
                                            }}>
                                            {lang.label} <span style={{ fontSize: 11, opacity: 0.7 }}>({lang.eng})</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Explain button */}
                                <button onClick={handleExplain} disabled={explaining}
                                    style={{ width: '100%', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: 'white', border: 'none', padding: '14px', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: explaining ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: explaining ? 0.7 : 1, transition: 'opacity .15s' }}>
                                    {explaining
                                        ? <><div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /> Generating…</>
                                        : <> 🌐 Explain this Job in {LANGUAGES.find(l => l.key === selectedLang)?.label}</>
                                    }
                                </button>

                                {/* Error */}
                                {explainError && (
                                    <div style={{ marginTop: 14, background: '#fff0f0', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', color: '#991b1b', fontSize: 14, fontWeight: 600 }}>
                                        {explainError}
                                    </div>
                                )}

                                {/* AI Explanation output */}
                                {explanation && (
                                    <div style={{ marginTop: 18, background: 'linear-gradient(135deg, #fdf4ff, #ede9fe)', border: '1px solid #ddd6fe', borderRadius: 16, padding: '22px 24px', animation: 'fadeUp .4s ease' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                            <span style={{ background: '#7c3aed', color: 'white', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>
                                                🤖 AI • {LANGUAGES.find(l => l.key === selectedLang)?.label}
                                            </span>
                                            <span style={{ fontSize: 12, color: '#7c3aed', fontWeight: 500 }}>Powered by Gemini</span>
                                        </div>
                                        <p style={{ fontSize: 15, color: '#4c1d95', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{explanation}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Right column: Apply Panel ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 88 }}>

                        {/* Success banner */}
                        {success && !existing && (
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 18, padding: '22px 24px', display: 'flex', gap: 14, alignItems: 'flex-start', animation: 'successPop .4s ease' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" /></svg>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: 16, color: '#166534', marginBottom: 4 }}>Application Submitted!</p>
                                    <p style={{ fontSize: 14, color: '#16a34a', lineHeight: 1.6 }}>The farmer will review your profile and get back to you.</p>
                                </div>
                            </div>
                        )}

                        {/* Error banner (inline, not blocking) */}
                        {error && job && (
                            <div style={{ background: '#fff0f0', border: '1px solid #fca5a5', borderRadius: 14, padding: '14px 18px', display: 'flex', gap: 10, alignItems: 'center' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                <span style={{ color: '#991b1b', fontWeight: 600, fontSize: 14 }}>{error}</span>
                            </div>
                        )}

                        {/* Application status card (if already applied) */}
                        {existing ? (() => {
                            const sm = statusMap[existing.status] || statusMap.pending;
                            return (
                                <div className="scard" style={{ padding: '28px', animation: 'fadeUp .4s ease' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                        <div style={{ width: 46, height: 46, background: sm.bg, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {existing.status === 'accepted'
                                                ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                : existing.status === 'rejected'
                                                    ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                    : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#854d0e" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                            }
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 700, fontSize: 16, color: '#111', marginBottom: 2 }}>Already Applied</p>
                                            <span style={{ background: sm.bg, color: sm.txt, border: `1px solid ${sm.border}`, fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>
                                                {sm.label}
                                            </span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.7, marginBottom: 20 }}>
                                        You applied on {formatDate(existing.applied_at)}. {existing.status === 'pending' ? 'Hang tight — the farmer will review your profile soon.' : ''}
                                    </p>
                                    <button onClick={() => navigate('/labor/applications')}
                                        style={{ width: '100%', background: '#111', color: 'white', border: 'none', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        View All Applications
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            );
                        })() : (
                            /* Apply card */
                            <div className="scard" style={{ padding: '28px', animation: 'fadeUp .4s ease' }}>
                                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 6 }}>Ready to Apply?</h2>
                                <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.7, marginBottom: 24 }}>
                                    Your profile and skills will be shared with the farmer for review.
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {[
                                        { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>, text: 'Your profile is shared instantly' },
                                        { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>, text: 'AI match score sent to farmer' },
                                        { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>, text: 'You can withdraw anytime' },
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 24, height: 24, background: '#f0fdf4', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</div>
                                            <span style={{ fontSize: 14, color: '#4b5563' }}>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ height: 1, background: '#f3f1ef', margin: '24px 0' }} />
                                <button onClick={handleApply} disabled={applying} className="btn-apply">
                                    {applying
                                        ? <><div className="spin-sm" /> Submitting…</>
                                        : <>Apply for this Job <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></>
                                    }
                                </button>
                            </div>
                        )}

                        {/* Quick info card */}
                        <div className="scard" style={{ animation: 'fadeUp .5s ease' }}>
                            <div style={{ padding: '20px 22px', borderBottom: '1px solid #f3f1ef' }}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Job Overview</p>
                            </div>
                            <div>
                                {[
                                    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>, label: 'Daily Wage', value: `₹${job?.wage}` },
                                    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>, label: 'Posted', value: job?.created_at ? formatDate(job.created_at) : '—' },
                                    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>, label: 'Location', value: (job?.location_lat && job?.location_lng) ? `${job.location_lat.toFixed(2)}°, ${job.location_lng.toFixed(2)}°` : 'Not specified' },
                                    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>, label: 'Status', value: 'Active' },
                                ].map((row, i) => (
                                    <div key={i} className="detail-row">
                                        <div style={{ width: 30, height: 30, background: '#f3f1ef', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', flexShrink: 0 }}>{row.icon}</div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: 12, color: '#aaa', fontWeight: 500 }}>{row.label}</p>
                                            <p style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{row.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
