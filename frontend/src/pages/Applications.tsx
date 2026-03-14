import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { applications as applicationsApi } from '../services/api';

// ─── Types (matching the ApplicationResponse schema from backend) ──────────────
interface ApplicationResponse {
    id: number;
    job_id: number;
    labor_id: number;
    match_score: number | null;
    status: 'pending' | 'accepted' | 'rejected';
    applied_at: string;
    updated_at: string | null;
    job: { id: number; title: string; wage: number } | null;
    labor: { id: number; full_name: string; skills: string | null; daily_rate: number | null } | null;
}

// ─── Empty state SVG ───────────────────────────────────────────────────────────
const EmptyApplicationsSVG = () => (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ width: 200, display: 'block', margin: '0 auto' }}>
        <rect x="75" y="55" width="150" height="120" rx="14" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="2" />
        <rect x="110" y="44" width="80" height="22" rx="8" fill="#dcfce7" stroke="#bbf7d0" strokeWidth="1.5" />
        <rect x="96" y="90" width="108" height="8" rx="4" fill="#dcfce7" />
        <rect x="96" y="108" width="80" height="8" rx="4" fill="#dcfce7" />
        <rect x="96" y="126" width="96" height="8" rx="4" fill="#dcfce7" />
        <circle cx="195" cy="155" r="30" fill="white" stroke="#16a34a" strokeWidth="2.5" />
        <path d="M183 155 L191 163 L207 147" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="72" cy="40" r="5" fill="#16a34a" opacity="0.25" />
        <circle cx="238" cy="60" r="4" fill="#16a34a" opacity="0.2" />
        <circle cx="250" cy="175" r="3.5" fill="#16a34a" opacity="0.18" />
    </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const scoreMeta = (s: number) =>
    s >= 80 ? { bg: '#dcfce7', txt: '#166534' }
        : s >= 60 ? { bg: '#fef9c3', txt: '#854d0e' }
            : { bg: '#ffedd5', txt: '#9a3412' };

const statusMap: Record<string, { bg: string; txt: string; label: string }> = {
    accepted: { bg: '#dcfce7', txt: '#166534', label: 'Accepted' },
    rejected: { bg: '#fee2e2', txt: '#991b1b', label: 'Rejected' },
    pending: { bg: '#fef9c3', txt: '#854d0e', label: 'Pending' },
};

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

export default function Applications() {
    const navigate = useNavigate();
    const [appList, setAppList] = useState<ApplicationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await applicationsApi.getMyApplications();
            setAppList(res.data || []);
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Failed to load applications. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (applicationId: number) => {
        if (!window.confirm('Withdraw this application? This cannot be undone.')) return;
        try {
            await applicationsApi.withdraw(applicationId);
            fetchApplications(); // refresh list
        } catch (err: any) {
            alert(err?.response?.data?.detail || 'Failed to withdraw application. Please try again.');
        }
    };

    const handleLogout = () => { localStorage.clear(); navigate('/'); };

    const total = appList.length;
    const pending = appList.filter(a => a.status === 'pending').length;
    const accepted = appList.filter(a => a.status === 'accepted').length;

    // ── Loading ──
    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf9f7', fontFamily: "'Instrument Sans', sans-serif" }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, border: '3px solid #dcfce7', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 18px' }} />
                <p style={{ color: '#aaa', fontSize: 17 }}>Loading applications…</p>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: "'Instrument Sans', 'DM Sans', sans-serif" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .serif { font-family: 'Instrument Serif', Georgia, serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }

        .scard { background:#fff; border:1px solid #e8e4e0; border-radius:20px; overflow:hidden; }
        .stcard { background:#fff; border:1px solid #e8e4e0; border-radius:18px; padding:26px; display:flex; align-items:center; gap:18px; }
        .app-row {
          display:flex; align-items:center; gap:16px;
          padding:20px 28px; border-bottom:1px solid #f3f1ef;
          transition:background .15s; cursor:pointer;
          animation:fadeUp .4s ease both;
        }
        .app-row:last-child { border-bottom:none; }
        .app-row:hover { background:#faf9f7; }
        .nib { background:none; border:none; cursor:pointer; padding:9px; border-radius:10px; transition:background .15s; display:flex; align-items:center; justify-content:center; color:#6b7280; }
        .nib:hover { background:#f3f1ef; color:#111; }
        .btn-primary { background:#111; color:white; border:none; padding:12px 24px; border-radius:12px; font-size:15px; font-weight:600; cursor:pointer; font-family:inherit; display:inline-flex; align-items:center; gap:8px; transition:background .15s, transform .15s; }
        .btn-primary:hover { background:#333; transform:translateY(-1px); }
        .withdraw-btn { background:none; border:1px solid #e8e4e0; padding:6px 14px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; color:#9ca3af; transition:all .15s; flex-shrink:0; }
        .withdraw-btn:hover { border-color:#fca5a5; color:#991b1b; background:#fff0f0; }
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#aaa', fontSize: 14 }}>
                        <button onClick={() => navigate('/labor/dashboard')} className="nib" style={{ padding: '4px 8px', fontSize: 14, color: '#aaa', fontFamily: 'inherit' }}>Dashboard</button>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                        <span style={{ color: '#111', fontWeight: 600 }}>My Applications</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button className="nib" style={{ position: 'relative' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                            {pending > 0 && <span style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, background: '#ef4444', borderRadius: '50%', border: '1.5px solid white' }} />}
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

                {/* Page header */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 44, flexWrap: 'wrap', gap: 18 }}>
                    <div>
                        <p style={{ fontSize: 13, color: '#aaa', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>Track Your Progress</p>
                        <h1 className="serif" style={{ fontSize: 50, fontWeight: 400, color: '#111', letterSpacing: '-0.02em', lineHeight: 1 }}>My Applications</h1>
                    </div>
                    <button onClick={() => navigate('/labor/dashboard')} className="btn-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                        Back to Dashboard
                    </button>
                </div>

                {/* Error banner */}
                {error && (
                    <div style={{ background: '#fff0f0', border: '1px solid #fca5a5', borderRadius: 14, padding: '16px 22px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            <span style={{ color: '#991b1b', fontWeight: 600, fontSize: 15 }}>{error}</span>
                        </div>
                        <button onClick={fetchApplications}
                            style={{ background: '#991b1b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                            Retry
                        </button>
                    </div>
                )}

                {/* Stat row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18, marginBottom: 44 }}>
                    {[
                        {
                            label: 'Total Applied', value: total, sub: 'All time',
                            iconBg: '#eff6ff', iconColor: '#2563eb',
                            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>,
                        },
                        {
                            label: 'Pending Review', value: pending, sub: 'Awaiting response',
                            iconBg: '#fefce8', iconColor: '#ca8a04',
                            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
                        },
                        {
                            label: 'Accepted', value: accepted, sub: accepted > 0 ? 'Congratulations!' : 'Keep applying',
                            iconBg: '#f0fdf4', iconColor: '#16a34a',
                            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>,
                        },
                    ].map((s, i) => (
                        <div key={i} className="stcard">
                            <div style={{ width: 54, height: 54, background: s.iconBg, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.iconColor, flexShrink: 0 }}>{s.icon}</div>
                            <div>
                                <p style={{ fontSize: 13, color: '#aaa', fontWeight: 500, marginBottom: 4 }}>{s.label}</p>
                                <p style={{ fontSize: 28, fontWeight: 700, color: '#111', lineHeight: 1 }}>{s.value}</p>
                                <p style={{ fontSize: 13, color: '#aaa', marginTop: 3 }}>{s.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Applications list */}
                <div className="scard">
                    <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #f3f1ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 2 }}>Application History</h2>
                            <p style={{ fontSize: 13, color: '#aaa' }}>{total} application{total !== 1 ? 's' : ''} submitted</p>
                        </div>
                        {pending > 0 && (
                            <span style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100 }}>
                                {pending} pending
                            </span>
                        )}
                    </div>

                    {appList.length === 0 ? (
                        <div style={{ padding: '80px 48px', textAlign: 'center' }}>
                            <EmptyApplicationsSVG />
                            <h3 className="serif" style={{ fontSize: 32, fontWeight: 400, color: '#111', margin: '28px 0 10px' }}>No applications yet</h3>
                            <p style={{ color: '#aaa', fontSize: 17, maxWidth: 380, margin: '0 auto 32px', lineHeight: 1.7 }}>
                                Browse job matches and apply to positions that fit your skills.
                            </p>
                            <button onClick={() => navigate('/labor/dashboard')} className="btn-primary">
                                Find Job Matches
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    ) : (
                        <div>
                            {appList.map((app, i) => {
                                const sm = statusMap[app.status] || statusMap.pending;
                                const score = app.match_score ?? 0;
                                const sc = scoreMeta(score);
                                return (
                                    <div key={app.id} className="app-row" style={{ animationDelay: `${i * 0.05}s` }}>
                                        {/* Job icon */}
                                        <div style={{ width: 44, height: 44, background: '#f0fdf4', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
                                        </div>
                                        {/* Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 700, fontSize: 16, color: '#111', marginBottom: 4 }}>
                                                {app.job?.title ?? `Job #${app.job_id}`}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                                {app.job?.wage && (
                                                    <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>₹{app.job.wage}/day</span>
                                                )}
                                                <span style={{ fontSize: 13, color: '#aaa' }}>•</span>
                                                <span style={{ fontSize: 13, color: '#aaa' }}>
                                                    Applied {formatDate(app.applied_at)}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Badges + action */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                            {score > 0 && (
                                                <span style={{ background: sc.bg, color: sc.txt, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100, whiteSpace: 'nowrap' }}>
                                                    {Math.round(score)}% match
                                                </span>
                                            )}
                                            <span style={{ background: sm.bg, color: sm.txt, fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 100 }}>
                                                {sm.label}
                                            </span>
                                            {/* Only show Withdraw for pending apps */}
                                            {app.status === 'pending' && (
                                                <button className="withdraw-btn" onClick={() => handleWithdraw(app.id)}>
                                                    Withdraw
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
