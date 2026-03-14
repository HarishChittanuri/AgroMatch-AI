import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { applications, jobs } from '../services/api';

// ─── Empty state SVG ─────────────────────────────────────────────────────────
const EmptyApplicantsSVG = () => (
    <svg viewBox="0 0 240 170" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ width: 180, display: 'block', margin: '0 auto' }}>
        <circle cx="100" cy="72" r="28" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1.8" />
        <circle cx="100" cy="68" r="14" fill="#dcfce7" />
        <circle cx="100" cy="68" r="7" fill="#16a34a" opacity="0.5" />
        <path d="M56 130 Q68 100 100 98 Q132 100 144 130" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1.8" />
        <circle cx="155" cy="65" r="22" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1.8" />
        <circle cx="155" cy="62" r="11" fill="#dcfce7" />
        <circle cx="155" cy="62" r="5.5" fill="#16a34a" opacity="0.4" />
        <path d="M128 122 Q136 106 155 104 Q174 106 182 122" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1.8" />
    </svg>
);

const scoreMeta = (s: number) =>
    s >= 80 ? { bg: '#dcfce7', txt: '#166534', bar: '#16a34a', label: 'Excellent' }
        : s >= 60 ? { bg: '#fef9c3', txt: '#854d0e', bar: '#eab308', label: 'Good' }
            : { bg: '#ffedd5', txt: '#9a3412', bar: '#f97316', label: 'Fair' };

const statusStyles: Record<string, { bg: string; txt: string; border: string }> = {
    pending: { bg: '#fef9c3', txt: '#854d0e', border: '#fde68a' },
    accepted: { bg: '#dcfce7', txt: '#166534', border: '#bbf7d0' },
    rejected: { bg: '#fee2e2', txt: '#991b1b', border: '#fca5a5' },
};

export default function FarmerApplicants() {
    const navigate = useNavigate();
    const { jobId } = useParams<{ jobId: string }>();
    const [applicants, setApplicants] = useState<any[]>([]);
    const [jobInfo, setJobInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
    const [contactModal, setContactModal] = useState<any | null>(null);
    const [error, setError] = useState('');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [appRes, jobRes] = await Promise.all([
                applications.getJobApplications(Number(jobId)),
                jobs.getById(Number(jobId)),
            ]);
            setApplicants(appRes.data);
            setJobInfo(jobRes.data);
        } catch (e: any) {
            setError(e.response?.data?.detail || 'Failed to load applicants');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (appId: number, newStatus: string) => {
        setActionLoading(appId);
        try {
            const res = await applications.updateStatus(appId, newStatus);
            setApplicants(prev => prev.map(a => a.id === appId ? { ...a, ...res.data } : a));
            // Open contact modal automatically when accepted
            if (newStatus === 'accepted') {
                const updated = applicants.find(a => a.id === appId);
                if (updated) setContactModal({ ...updated, status: 'accepted', labor: res.data.labor });
            }
        } catch (e: any) {
            alert(e.response?.data?.detail || 'Failed to update status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleLogout = () => { localStorage.clear(); navigate('/'); };

    const filtered = applicants.filter(a => filter === 'all' ? true : a.status === filter);
    const pendingCount = applicants.filter(a => a.status === 'pending').length;
    const acceptedCount = applicants.filter(a => a.status === 'accepted').length;

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf9f7', fontFamily: "'Instrument Sans', sans-serif" }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, border: '3px solid #dcfce7', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 18px' }} />
                <p style={{ color: '#aaa', fontSize: 17 }}>Loading applicants…</p>
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
        @keyframes overlayIn { from{opacity:0} to{opacity:1} }
        @keyframes modalPop { from{opacity:0;transform:scale(0.95) translateY(12px)} to{opacity:1;transform:none} }
        .acard { background:#fff; border:1px solid #e8e4e0; border-radius:20px; padding:26px 28px; display:flex; flex-direction:column; gap:18px; transition:transform .2s, box-shadow .2s, border-color .2s; animation:fadeUp .45s ease both; }
        .acard:hover { transform:translateY(-4px); box-shadow:0 18px 44px rgba(0,0,0,.09); border-color:#c0c0bc; }
        .stcard { background:#fff; border:1px solid #e8e4e0; border-radius:18px; padding:26px; display:flex; align-items:center; gap:18px; }
        .chip { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; font-size:12px; font-weight:600; padding:4px 12px; border-radius:100px; white-space:nowrap; }
        .fpill { padding:8px 18px; border-radius:100px; border:1.5px solid #e8e4e0; background:white; font-size:14px; font-weight:600; cursor:pointer; font-family:inherit; color:#6b7280; transition:all .15s; }
        .fpill:hover { border-color:#aaa; color:#111; }
        .fpill.on { background:#111; color:white; border-color:#111; }
        .btn-ghost { background:#f3f1ef; color:#374151; border:none; padding:9px 16px; border-radius:9px; font-size:14px; font-weight:600; cursor:pointer; font-family:inherit; display:inline-flex; align-items:center; gap:6px; transition:background .15s; }
        .btn-ghost:hover { background:#e8e4e0; }
        .nib { background:none; border:none; cursor:pointer; padding:9px; border-radius:10px; transition:background .15s; display:flex; align-items:center; justify-content:center; color:#6b7280; }
        .nib:hover { background:#f3f1ef; color:#111; }
        .overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); backdrop-filter:blur(6px); z-index:100; display:flex; align-items:center; justify-content:center; padding:24px; animation:overlayIn .2s ease; }
        .modal { background:#fff; border-radius:24px; padding:44px; max-width:480px; width:100%; box-shadow:0 40px 100px rgba(0,0,0,.25); animation:modalPop .35s cubic-bezier(0.16,1,0.3,1); }
      `}</style>

            {/* ══ Contact Modal ══ */}
            {contactModal && (
                <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setContactModal(null); }}>
                    <div className="modal">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                            <div>
                                <h2 className="serif" style={{ fontSize: 30, fontWeight: 400, color: '#111', marginBottom: 4 }}>Worker Contact</h2>
                                <p style={{ color: '#aaa', fontSize: 15 }}>Accepted — reach out to connect</p>
                            </div>
                            <button onClick={() => setContactModal(null)} className="nib" style={{ width: 38, height: 38 }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>

                        {/* Worker card */}
                        <div style={{ background: '#faf9f7', border: '1px solid #f3f1ef', borderRadius: 16, padding: '18px 20px', marginBottom: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                                <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 700, fontSize: 20, flexShrink: 0 }}>
                                    {(contactModal.labor?.full_name || 'L')[0].toUpperCase()}
                                </div>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: 17, color: '#111' }}>{contactModal.labor?.full_name || '—'}</p>
                                    <p style={{ fontSize: 13, color: '#aaa', marginTop: 2 }}>₹{contactModal.labor?.daily_rate || contactModal.match_score || 0}/day expected</p>
                                </div>
                            </div>
                            {contactModal.labor?.skills && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {contactModal.labor.skills.split(',').map((s: string, i: number) => (
                                        <span key={i} className="chip">{s.trim()}</span>
                                    ))}
                                </div>
                            )}
                            {contactModal.labor?.bio && (
                                <p style={{ fontSize: 13, color: '#6b7280', marginTop: 10, lineHeight: 1.6 }}>{contactModal.labor.bio}</p>
                            )}
                        </div>

                        {/* Contact options */}
                        {contactModal.labor?.phone ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <a href={`tel:${contactModal.labor.phone}`}
                                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', border: '1.5px solid #e8e4e0', borderRadius: 14, textDecoration: 'none', color: '#111', fontWeight: 600, fontSize: 15, transition: 'border-color .15s, background .15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.background = '#f0fdf4'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e4e0'; e.currentTarget.style.background = 'white'; }}>
                                    <div style={{ width: 40, height: 40, background: '#f0fdf4', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.67 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45c.91.31 1.85.54 2.81.67A2 2 0 0 1 22 16.92z" /></svg>
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 700 }}>Call</p>
                                        <p style={{ fontSize: 13, color: '#aaa', fontWeight: 400 }}>{contactModal.labor.phone}</p>
                                    </div>
                                </a>
                                <a href={`https://wa.me/${contactModal.labor.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', border: '1.5px solid #e8e4e0', borderRadius: 14, textDecoration: 'none', color: '#111', fontWeight: 600, fontSize: 15, transition: 'border-color .15s, background .15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.background = '#f0fdf4'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e4e0'; e.currentTarget.style.background = 'white'; }}>
                                    <div style={{ width: 40, height: 40, background: '#dcfce7', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#16a34a"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.11 1.528 5.832L.038 23.962l6.337-1.461A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 0 1-5.028-1.382l-.361-.214-3.741.863.933-3.617-.235-.374A9.788 9.788 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z" /></svg>
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 700 }}>WhatsApp</p>
                                        <p style={{ fontSize: 13, color: '#aaa', fontWeight: 400 }}>Send a message</p>
                                    </div>
                                </a>
                            </div>
                        ) : (
                            <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 12, padding: '14px 18px', color: '#854d0e', fontSize: 14 }}>
                                ⚠️ This worker didn't provide a phone number during registration. Ask them to update their profile.
                            </div>
                        )}
                    </div>
                </div>
            )}

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
                        <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100 }}>Farmer</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#aaa', fontSize: 14 }}>
                        <button onClick={() => navigate('/farmer/dashboard')} className="nib" style={{ padding: '4px 8px', fontSize: 14, color: '#aaa', fontFamily: 'inherit' }}>Dashboard</button>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                        <button onClick={() => navigate('/farmer/jobs')} className="nib" style={{ padding: '4px 8px', fontSize: 14, color: '#aaa', fontFamily: 'inherit' }}>My Jobs</button>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                        <span style={{ color: '#111', fontWeight: 600 }}>Applicants</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #16a34a, #15803d)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 17 }}>
                            {(user?.email?.[0] || 'F').toUpperCase()}
                        </div>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: 15, color: '#111', lineHeight: 1.2 }}>Farmer Account</p>
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
                        <p style={{ fontSize: 13, color: '#aaa', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
                            Job · {jobInfo?.title || `#${jobId}`}
                        </p>
                        <h1 className="serif" style={{ fontSize: 50, fontWeight: 400, color: '#111', letterSpacing: '-0.02em', lineHeight: 1 }}>Applicants</h1>
                    </div>
                    <button onClick={() => navigate('/farmer/jobs')}
                        style={{ background: '#fff', color: '#374151', border: '1px solid #e8e4e0', padding: '12px 20px', borderRadius: 11, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7, transition: 'border-color .15s' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#aaa')} onMouseLeave={e => (e.currentTarget.style.borderColor = '#e8e4e0')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                        Back to Jobs
                    </button>
                </div>

                {error && (
                    <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12, padding: '14px 18px', marginBottom: 28, color: '#be123c', fontSize: 15 }}>
                        {error}
                    </div>
                )}

                {/* Stat row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18, marginBottom: 44 }}>
                    {[
                        { label: 'Total Applicants', value: applicants.length, sub: 'Applied for this job', iconBg: '#eff6ff', iconColor: '#2563eb', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
                        { label: 'Pending Review', value: pendingCount, sub: 'Awaiting your decision', iconBg: '#fefce8', iconColor: '#ca8a04', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
                        { label: 'Accepted', value: acceptedCount, sub: acceptedCount > 0 ? 'Ready to hire' : 'None yet', iconBg: '#f0fdf4', iconColor: '#16a34a', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg> },
                        { label: 'Posted Wage', value: `₹${jobInfo?.wage || '—'}`, sub: 'Per day offered', iconBg: '#f0fdf4', iconColor: '#16a34a', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
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

                {/* Filter row */}
                {applicants.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, color: '#aaa', fontWeight: 500, marginRight: 4 }}>Filter:</span>
                        {(['all', 'pending', 'accepted', 'rejected'] as const).map(f => (
                            <button key={f} className={`fpill ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
                                {f === 'all' ? `All (${applicants.length})`
                                    : f === 'pending' ? `🟡 Pending (${pendingCount})`
                                        : f === 'accepted' ? `🟢 Accepted (${acceptedCount})`
                                            : `🔴 Rejected (${applicants.filter(a => a.status === 'rejected').length})`}
                            </button>
                        ))}
                    </div>
                )}

                {/* Applicant cards */}
                {filtered.length === 0 ? (
                    <div style={{ background: '#fff', border: '1px solid #e8e4e0', borderRadius: 22, padding: '80px 48px', textAlign: 'center' }}>
                        <EmptyApplicantsSVG />
                        <h3 className="serif" style={{ fontSize: 32, fontWeight: 400, color: '#111', margin: '28px 0 10px' }}>
                            {applicants.length === 0 ? 'No applicants yet' : 'No applicants here'}
                        </h3>
                        <p style={{ color: '#aaa', fontSize: 17, maxWidth: 380, margin: '0 auto', lineHeight: 1.7 }}>
                            {applicants.length === 0 ? 'Workers will appear here once they apply for this job.' : 'Try a different filter.'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 22 }}>
                        {filtered.map((applicant, idx) => {
                            const score = applicant.match_score || 0;
                            const meta = scoreMeta(score);
                            const ss = statusStyles[applicant.status] || statusStyles.pending;
                            const labor = applicant.labor;
                            const skills = labor?.skills?.split(',').map((s: string) => s.trim()).filter(Boolean) || [];
                            const isAccepted = applicant.status === 'accepted';
                            const isPending = applicant.status === 'pending';
                            const isLoading = actionLoading === applicant.id;

                            return (
                                <div key={applicant.id} className="acard" style={{ animationDelay: `${idx * 0.06}s` }}>
                                    {/* Score bar */}
                                    <div style={{ height: 4, background: `linear-gradient(90deg, ${meta.bar}, ${meta.bar}88)`, width: `${Math.max(score, 5)}%`, borderRadius: 100 }} />

                                    {/* Header */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <div style={{ width: 50, height: 50, background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 700, fontSize: 19, flexShrink: 0 }}>
                                                {(labor?.full_name || 'L')[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 700, fontSize: 17, color: '#111', marginBottom: 3 }}>{labor?.full_name || 'Unknown Worker'}</p>
                                                <div style={{ display: 'flex', gap: 10 }}>
                                                    <span style={{ fontSize: 13, color: '#aaa' }}>₹{labor?.daily_rate || '—'}/day</span>
                                                    {/* Only show phone if accepted */}
                                                    {isAccepted && labor?.phone && (
                                                        <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>📞 {labor.phone}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                                            <div style={{ background: meta.bg, color: meta.txt, fontWeight: 700, fontSize: 13, padding: '5px 13px', borderRadius: 100 }}>
                                                {Math.round(score)}%
                                            </div>
                                            <div style={{ background: ss.bg, color: ss.txt, border: `1px solid ${ss.border}`, fontWeight: 600, fontSize: 11, padding: '3px 10px', borderRadius: 100, textTransform: 'capitalize' }}>
                                                {applicant.status}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Match bar */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#bbb', marginBottom: 7 }}>
                                            <span style={{ fontWeight: 500 }}>Match quality</span>
                                            <span style={{ color: meta.txt, fontWeight: 700 }}>{meta.label}</span>
                                        </div>
                                        <div style={{ height: 7, background: '#f3f1ef', borderRadius: 100, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${Math.max(score, 2)}%`, background: `linear-gradient(90deg, ${meta.bar}, ${meta.bar}cc)`, borderRadius: 100, transition: 'width .6s ease' }} />
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    {skills.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                                            {skills.slice(0, 5).map((s: string, i: number) => <span key={i} className="chip">{s}</span>)}
                                        </div>
                                    )}

                                    {/* Bio */}
                                    {labor?.bio && (
                                        <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, background: '#faf9f7', borderRadius: 10, padding: '10px 14px' }}>
                                            {labor.bio.length > 120 ? labor.bio.slice(0, 120) + '…' : labor.bio}
                                        </p>
                                    )}

                                    {/* Action buttons */}
                                    <div style={{ display: 'flex', gap: 10, paddingTop: 14, borderTop: '1px solid #f3f1ef' }}>
                                        {/* Contact button — only shown for accepted */}
                                        {isAccepted && (
                                            <button onClick={() => setContactModal(applicant)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.67 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45c.91.31 1.85.54 2.81.67A2 2 0 0 1 22 16.92z" /></svg>
                                                View Contact
                                            </button>
                                        )}
                                        {isPending && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusChange(applicant.id, 'accepted')}
                                                    disabled={isLoading}
                                                    style={{ flex: 1, background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '10px 16px', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background .15s', opacity: isLoading ? 0.6 : 1 }}
                                                    onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = '#dcfce7'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4'; }}>
                                                    {isLoading ? <div style={{ width: 14, height: 14, border: '2px solid #bbf7d0', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(applicant.id, 'rejected')}
                                                    disabled={isLoading}
                                                    style={{ background: '#fff0f0', color: '#991b1b', border: '1px solid #fca5a5', padding: '10px 16px', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'background .15s', opacity: isLoading ? 0.6 : 1 }}
                                                    onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = '#fee2e2'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = '#fff0f0'; }}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {applicant.status === 'rejected' && (
                                            <button
                                                onClick={() => handleStatusChange(applicant.id, 'pending')}
                                                disabled={isLoading}
                                                className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
                                                Reconsider
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
    );
}
