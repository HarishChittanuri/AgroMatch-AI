import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobs as jobsApi } from '../services/api';

// ─── Empty state SVG ───────────────────────────────────────────────────────────
const EmptyJobsSVG = () => (
    <svg viewBox="0 0 240 170" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ width: 180, display: 'block', margin: '0 auto' }}>
        <rect x="35" y="48" width="170" height="104" rx="14" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1.8" />
        <rect x="55" y="70" width="130" height="9" rx="4.5" fill="#dcfce7" />
        <rect x="55" y="87" width="98" height="9" rx="4.5" fill="#dcfce7" />
        <rect x="55" y="104" width="112" height="9" rx="4.5" fill="#dcfce7" />
        <circle cx="178" cy="46" r="22" fill="white" stroke="#16a34a" strokeWidth="2" />
        <line x1="178" y1="36" x2="178" y2="56" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="168" y1="46" x2="188" y2="46" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="48" cy="38" r="5" fill="#16a34a" opacity="0.25" />
        <circle cx="218" cy="148" r="4" fill="#16a34a" opacity="0.2" />
    </svg>
);

export default function FarmerJobs() {
    const navigate = useNavigate();
    const [jobList, setJobList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [posting, setPosting] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [newJob, setNewJob] = useState({ title: '', description: '', wage: '', location_lat: '17.3850', location_lng: '78.4867', location: '', start_date: '', workers_needed: '1', duration: '' });
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await jobsApi.getMyJobs();
            setJobList(res.data || []);
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Failed to load your jobs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePostJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setPosting(true);
        try {
            await jobsApi.create({
                title: newJob.title,
                description: newJob.description,
                wage: parseFloat(newJob.wage),
                location_lat: parseFloat(newJob.location_lat),
                location_lng: parseFloat(newJob.location_lng),
                location: newJob.location || null,
                start_date: newJob.start_date || null,
                workers_needed: parseInt(newJob.workers_needed) || 1,
                duration: newJob.duration || null,
            });
            setShowModal(false);
            setNewJob({ title: '', description: '', wage: '', location_lat: '17.3850', location_lng: '78.4867', location: '', start_date: '', workers_needed: '1', duration: '' });
            fetchJobs();
        } catch (err: any) {
            alert(err?.response?.data?.detail || 'Error posting job. Please try again.');
        } finally { setPosting(false); }
    };

    const handleDelete = async (id: number) => {
        setDeleting(true);
        try {
            await jobsApi.deleteJob(id);
            setDeleteConfirmId(null);
            fetchJobs(); // Refresh from API
        } catch (err: any) {
            alert(err?.response?.data?.detail || 'Error deleting job. Please try again.');
        } finally { setDeleting(false); }
    };

    const handleToggleStatus = (id: number) => {
        // Local UI toggle only — add a PATCH /jobs/:id endpoint to persist this
        setJobList(prev => prev.map(j => j.id === id ? { ...j, _localStatus: (j._localStatus ?? 'active') === 'active' ? 'closed' : 'active' } : j));
    };

    const handleLogout = () => { localStorage.clear(); navigate('/'); };

    const active = jobList.length; // All fetched jobs from my-jobs are active (no status field yet)
    const totalApplicants = 0;     // Requires application count per job — add when applicants endpoint returns count
    const totalViews = 0;          // Not tracked in backend yet

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf9f7', fontFamily: "'Instrument Sans', sans-serif" }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, border: '3px solid #dcfce7', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 18px' }} />
                <p style={{ color: '#aaa', fontSize: 17 }}>Loading your jobs…</p>
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

        /* Modal */
        .overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); backdrop-filter:blur(6px); z-index:100; display:flex; align-items:center; justify-content:center; padding:24px; animation:overlayIn .2s ease; }
        .modal { background:#fff; border-radius:24px; padding:44px 44px 40px; max-width:560px; width:100%; max-height:90vh; overflow-y:auto; box-shadow:0 40px 100px rgba(0,0,0,.25); animation:modalPop .35s cubic-bezier(0.16,1,0.3,1); }

        /* Form inputs */
        .fi { width:100%; padding:14px 18px; border:1.5px solid #e8e4e0; border-radius:12px; font-size:16px; outline:none; background:#faf9f7; font-family:inherit; color:#111; transition:border-color .2s, box-shadow .2s, background .2s; }
        .fi:focus { border-color:#16a34a; background:#fff; box-shadow:0 0 0 3.5px rgba(22,163,74,.1); }
        .fi::placeholder { color:#c8c4be; }
        textarea.fi { resize:vertical; min-height:100px; line-height:1.6; }
        .flabel { font-size:12px; font-weight:700; color:#aaa; text-transform:uppercase; letter-spacing:.08em; margin-bottom:9px; display:block; }

        /* Buttons */
        .btn-primary { background:#111; color:white; border:none; padding:14px 28px; border-radius:12px; font-size:16px; font-weight:600; cursor:pointer; font-family:inherit; display:inline-flex; align-items:center; gap:8px; transition:background .15s, transform .15s, box-shadow .15s; }
        .btn-primary:hover:not(:disabled) { background:#333; transform:translateY(-1px); box-shadow:0 8px 24px rgba(0,0,0,.18); }
        .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
        .btn-secondary { background:#f3f1ef; color:#374151; border:none; padding:14px 22px; border-radius:12px; font-size:16px; font-weight:600; cursor:pointer; font-family:inherit; transition:background .15s; }
        .btn-secondary:hover { background:#e8e4e0; }
        .btn-danger { background:#fee2e2; color:#991b1b; border:none; padding:14px 22px; border-radius:12px; font-size:16px; font-weight:600; cursor:pointer; font-family:inherit; transition:background .15s; }
        .btn-danger:hover { background:#fca5a5; }

        /* Cards */
        .scard { background:#fff; border:1px solid #e8e4e0; border-radius:20px; overflow:hidden; }
        .stcard { background:#fff; border:1px solid #e8e4e0; border-radius:18px; padding:26px; display:flex; align-items:center; gap:18px; }

        /* Job rows */
        .job-row { display:flex; align-items:flex-start; gap:18px; padding:22px 28px; border-bottom:1px solid #f3f1ef; transition:background .15s; animation:fadeUp .4s ease both; }
        .job-row:last-child { border-bottom:none; }
        .job-row:hover { background:#faf9f7; }

        /* Nav icon btn */
        .nib { background:none; border:none; cursor:pointer; padding:9px; border-radius:10px; transition:background .15s; display:flex; align-items:center; justify-content:center; color:#6b7280; }
        .nib:hover { background:#f3f1ef; color:#111; }

        /* Icon action buttons */
        .icon-btn { background:#f3f1ef; color:#374151; border:none; padding:8px 14px; border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; display:inline-flex; align-items:center; gap:6px; transition:background .15s, color .15s; }
        .icon-btn:hover { background:#e8e4e0; }
        .icon-btn-red { background:#fff0f0; color:#991b1b; border:1px solid #fca5a5; }
        .icon-btn-red:hover { background:#fee2e2; }
        .icon-btn-green { background:#f0fdf4; color:#166534; border:1px solid #bbf7d0; }
        .icon-btn-green:hover { background:#dcfce7; }

        .spin { width:19px; height:19px; border:2.5px solid rgba(255,255,255,.3); border-top-color:white; border-radius:50%; animation:spin .7s linear infinite; }
      `}</style>

            {/* ══ Delete Confirm Modal ══ */}
            {deleteConfirmId !== null && (
                <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteConfirmId(null); }}>
                    <div className="modal" style={{ maxWidth: 420, padding: '40px 40px 36px' }}>
                        <div style={{ width: 56, height: 56, background: '#fee2e2', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                        </div>
                        <h2 className="serif" style={{ fontSize: 28, fontWeight: 400, color: '#111', textAlign: 'center', marginBottom: 10 }}>Delete this job?</h2>
                        <p style={{ color: '#aaa', fontSize: 15, textAlign: 'center', marginBottom: 28 }}>This will permanently remove the job and all applications from our servers.</p>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => handleDelete(deleteConfirmId!)} disabled={deleting} className="btn-danger" style={{ flex: 1, justifyContent: 'center' }}>
                                {deleting ? 'Deleting…' : 'Yes, Delete'}
                            </button>
                            <button onClick={() => setDeleteConfirmId(null)} className="btn-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ Post Job Modal ══ */}
            {showModal && (
                <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
                    <div className="modal">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                            <div>
                                <h2 className="serif" style={{ fontSize: 34, fontWeight: 400, color: '#111', marginBottom: 6 }}>Post a New Job</h2>
                                <p style={{ color: '#aaa', fontSize: 16 }}>AI will start matching workers immediately</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="nib" style={{ width: 38, height: 38 }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handlePostJob} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div>
                                <label className="flabel">Job Title *</label>
                                <input type="text" value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                                    className="fi" placeholder="e.g. Rice Harvesting Specialist" required />
                            </div>
                            <div>
                                <label className="flabel">Description *</label>
                                <textarea value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                                    className="fi" placeholder="Describe the work, skills needed, tools provided…" required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div>
                                    <label className="flabel">Daily Wage (₹) *</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 17, fontWeight: 600 }}>₹</span>
                                        <input type="number" value={newJob.wage} onChange={e => setNewJob({ ...newJob, wage: e.target.value })}
                                            className="fi" style={{ paddingLeft: 34 }} placeholder="600" min="100" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="flabel">Workers Needed</label>
                                    <input type="number" value={newJob.workers_needed} onChange={e => setNewJob({ ...newJob, workers_needed: e.target.value })}
                                        className="fi" placeholder="1" min="1" max="100" />
                                </div>
                            </div>
                            <div>
                                <label className="flabel">Location</label>
                                <input type="text" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })}
                                    className="fi" placeholder="e.g. Hyderabad, Telangana" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div>
                                    <label className="flabel">Start Date</label>
                                    <input type="date" value={newJob.start_date} onChange={e => setNewJob({ ...newJob, start_date: e.target.value })}
                                        className="fi" min={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div>
                                    <label className="flabel">Duration</label>
                                    <select value={newJob.duration} onChange={e => setNewJob({ ...newJob, duration: e.target.value })} className="fi">
                                        <option value="">Select duration</option>
                                        <option value="Single day">Single day</option>
                                        <option value="2-3 days">2–3 days</option>
                                        <option value="1 week">1 week</option>
                                        <option value="2 weeks">2 weeks</option>
                                        <option value="1 month">1 month</option>
                                        <option value="Ongoing">Ongoing</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                                <button type="submit" disabled={posting} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                    {posting ? <div className="spin" /> : <>Post Job <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></>}
                                </button>
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                            </div>
                        </form>

                    </div>
                </div>
            )}

            {/* ── Navbar ── */}
            <nav style={{ background: '#fff', borderBottom: '1px solid #e8e4e0', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 56px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, background: '#111', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 18, color: '#111' }}>AgroMatch</span>
                        <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100 }}>Farmer</span>
                    </div>
                    {/* Breadcrumb */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#aaa', fontSize: 14 }}>
                        <button onClick={() => navigate('/farmer/dashboard')} className="nib" style={{ padding: '4px 8px', fontSize: 14, color: '#aaa', fontFamily: 'inherit' }}>Dashboard</button>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                        <span style={{ color: '#111', fontWeight: 600 }}>Manage Jobs</span>
                    </div>
                    {/* Right */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button className="nib">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                        </button>
                        <div style={{ width: 1, height: 28, background: '#e8e4e0', margin: '0 4px' }} />
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
                        <p style={{ fontSize: 13, color: '#aaa', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>Farm Management</p>
                        <h1 className="serif" style={{ fontSize: 50, fontWeight: 400, color: '#111', letterSpacing: '-0.02em', lineHeight: 1 }}>Manage Jobs</h1>
                    </div>
                    <button onClick={() => setShowModal(true)} className="btn-primary">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Post New Job
                    </button>
                </div>

                {/* Error banner */}
                {error && (
                    <div style={{ background: '#fff0f0', border: '1px solid #fca5a5', borderRadius: 14, padding: '16px 22px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            <span style={{ color: '#991b1b', fontWeight: 600, fontSize: 15 }}>{error}</span>
                        </div>
                        <button onClick={fetchJobs} style={{ background: '#991b1b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                            Retry
                        </button>
                    </div>
                )}

                {/* Stat row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18, marginBottom: 44 }}>
                    {[
                        {
                            label: 'Active Listings', value: active, sub: `${jobList.length - active} closed`,
                            iconBg: '#f0fdf4', iconColor: '#16a34a',
                            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
                        },
                        {
                            label: 'Total Applicants', value: totalApplicants, sub: 'Across all jobs',
                            iconBg: '#eff6ff', iconColor: '#2563eb',
                            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
                        },
                        {
                            label: 'Total Views', value: totalViews, sub: 'Job listing impressions',
                            iconBg: '#faf5ff', iconColor: '#9333ea',
                            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
                        },
                        {
                            label: 'Total Jobs Posted', value: jobList.length, sub: 'All time',
                            iconBg: '#fefce8', iconColor: '#ca8a04',
                            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>,
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

                {/* Jobs list */}
                <div className="scard">
                    <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #f3f1ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 2 }}>All Job Listings</h2>
                            <p style={{ fontSize: 13, color: '#aaa' }}>{jobList.length} job{jobList.length !== 1 ? 's' : ''} posted</p>
                        </div>
                        <button onClick={() => setShowModal(true)}
                            style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '8px 16px', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, transition: 'background .15s' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#dcfce7')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#f0fdf4')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            New
                        </button>
                    </div>

                    {jobList.length === 0 ? (
                        <div style={{ padding: '80px 48px', textAlign: 'center' }}>
                            <EmptyJobsSVG />
                            <h3 className="serif" style={{ fontSize: 32, fontWeight: 400, color: '#111', margin: '28px 0 10px' }}>No jobs posted yet</h3>
                            <p style={{ color: '#aaa', fontSize: 17, maxWidth: 360, margin: '0 auto 32px', lineHeight: 1.7 }}>Post your first job to let the AI find the best-matched workers for you.</p>
                            <button onClick={() => setShowModal(true)} className="btn-primary">
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                Post a Job
                            </button>
                        </div>
                    ) : (
                        <div>
                            {jobList.map((job, idx) => (
                                <div key={job.id} className="job-row" style={{ animationDelay: `${idx * 0.05}s` }}>
                                    {/* Icon */}
                                    <div style={{ width: 48, height: 48, background: (job._localStatus ?? 'active') === 'active' ? '#f0fdf4' : '#f3f4f6', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: (job._localStatus ?? 'active') === 'active' ? '#16a34a' : '#9ca3af', flexShrink: 0 }}>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {/* Title row */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5, flexWrap: 'wrap' }}>
                                            <p style={{ fontWeight: 700, fontSize: 17, color: '#111' }}>{job.title}</p>
                                            <span style={{
                                                background: (job._localStatus ?? 'active') === 'active' ? '#f0fdf4' : '#f3f4f6',
                                                color: (job._localStatus ?? 'active') === 'active' ? '#16a34a' : '#9ca3af',
                                                border: `1px solid ${(job._localStatus ?? 'active') === 'active' ? '#bbf7d0' : '#e5e7eb'}`,
                                                fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 100
                                            }}>{(job._localStatus ?? 'active') === 'active' ? 'Active' : 'Closed'}</span>
                                        </div>
                                        {/* Description */}
                                        <p style={{ fontSize: 13, color: '#aaa', marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 560 }}>{job.description}</p>
                                        {/* Stats row */}
                                        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: 13, color: '#555', display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                                                <strong>{job.applicants}</strong>&nbsp;applicant{job.applicants !== 1 ? 's' : ''}
                                            </span>
                                            <span style={{ fontSize: 13, color: '#555', display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                                <strong>{job.views}</strong>&nbsp;views
                                            </span>
                                            <span style={{ fontSize: 13, color: '#aaa' }}>Posted {job.created_at ? new Date(job.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                                        </div>
                                    </div>

                                    {/* Wage + Actions */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, flexShrink: 0 }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: 19, fontWeight: 700, color: '#16a34a' }}>₹{job.wage}</p>
                                            <p style={{ fontSize: 12, color: '#aaa' }}>per day</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            {/* View applicants */}
                                            <button className="icon-btn icon-btn-green" onClick={() => navigate(`/farmer/jobs/${job.id}/applicants`)}>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                                                Applicants
                                            </button>
                                            {/* Toggle status */}
                                            <button className="icon-btn" onClick={() => handleToggleStatus(job.id)} title={(job._localStatus ?? 'active') === 'active' ? 'Close listing' : 'Reopen listing'}>
                                                {(job._localStatus ?? 'active') === 'active'
                                                    ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                                                    : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                }
                                                {(job._localStatus ?? 'active') === 'active' ? 'Close' : 'Reopen'}
                                            </button>
                                            {/* Delete */}
                                            <button className="icon-btn icon-btn-red" onClick={() => setDeleteConfirmId(job.id)}>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
