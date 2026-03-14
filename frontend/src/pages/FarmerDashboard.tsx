import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobs, matches } from '../services/api';
import ChatWidget from '../components/ChatWidget';

// ─── Empty illustrations ──────────────────────────────────────────────────────
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

export default function FarmerDashboard() {
    const [jobList, setJobList] = useState<any[]>([]);
    const [matchesList, setMatchesList] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [newJob, setNewJob] = useState({ title: '', description: '', wage: '', location_lat: '17.3850', location_lng: '78.4867', location: '', start_date: '', workers_needed: '1', duration: '' });
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [jobsRes, matchesRes] = await Promise.all([jobs.getMyJobs(), matches.getMyMatches()]);
            setJobList(jobsRes.data || []);
            setMatchesList(matchesRes.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handlePostJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setPosting(true);
        try {
            await jobs.create({
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
            fetchData();
        } catch { alert('Error posting job'); }
        finally { setPosting(false); }
    };

    const handleLogout = () => { localStorage.clear(); navigate('/'); };
    const avgWage = jobList.length > 0 ? Math.round(jobList.reduce((a, j) => a + j.wage, 0) / jobList.length) : 0;

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf9f7', fontFamily: "'Instrument Sans', sans-serif" }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, border: '3px solid #dcfce7', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 18px' }} />
                <p style={{ color: '#aaa', fontSize: 17 }}>Loading dashboard…</p>
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

        /* Buttons */
        .btn-primary { background:#111; color:white; border:none; padding:14px 28px; border-radius:12px; font-size:16px; font-weight:600; cursor:pointer; font-family:inherit; display:inline-flex; align-items:center; gap:8px; transition:background .15s, transform .15s; }
        .btn-primary:hover:not(:disabled) { background:#333; transform:translateY(-1px); }
        .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
        .btn-secondary { background:#f3f1ef; color:#374151; border:none; padding:14px 22px; border-radius:12px; font-size:16px; font-weight:600; cursor:pointer; font-family:inherit; transition:background .15s; }
        .btn-secondary:hover { background:#e8e4e0; }

        /* Section cards */
        .scard { background:#fff; border:1px solid #e8e4e0; border-radius:20px; overflow:hidden; }

        /* Rows */
        .job-row { display:flex; align-items:flex-start; gap:16px; padding:20px 24px; border-bottom:1px solid #f3f1ef; transition:background .15s; cursor:default; }
        .job-row:last-child { border-bottom:none; }
        .job-row:hover { background:#faf9f7; }
        .app-row { display:flex; align-items:center; gap:14px; padding:18px 24px; border-bottom:1px solid #f3f1ef; transition:background .15s; }
        .app-row:last-child { border-bottom:none; }
        .app-row:hover { background:#faf9f7; }

        /* Stat cards */
        .stcard { background:#fff; border:1px solid #e8e4e0; border-radius:18px; padding:26px; display:flex; align-items:center; gap:18px; }

        /* Nav icon */
        .nib { background:none; border:none; cursor:pointer; padding:9px; border-radius:10px; transition:background .15s; display:flex; align-items:center; justify-content:center; color:#6b7280; }
        .nib:hover { background:#f3f1ef; color:#111; }

        /* Spin */
        .spin { width:19px; height:19px; border:2.5px solid rgba(255,255,255,.3); border-top-color:white; border-radius:50%; animation:spin .7s linear infinite; }

        /* Label */
        .flabel { font-size:12px; font-weight:700; color:#aaa; text-transform:uppercase; letter-spacing:.08em; margin-bottom:9px; display:block; }
      `}</style>

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

            {/* ══ Navbar ══ */}
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
                        <span>Dashboard</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                        <span style={{ color: '#111', fontWeight: 600 }}>Overview</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => navigate('/farmer/jobs')}
                            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: '#f3f1ef', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#374151', transition: 'background .15s' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#e8e4e0')} onMouseLeave={e => (e.currentTarget.style.background = '#f3f1ef')}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
                            Manage Jobs
                        </button>
                        <div style={{ width: 1, height: 28, background: '#e8e4e0' }} />
                        <button className="nib" style={{ position: 'relative' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                            {matchesList.length > 0 && <span style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, background: '#ef4444', borderRadius: '50%', border: '1.5px solid white' }} />}
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

            {/* ══ Body ══ */}
            <div style={{ maxWidth: 1440, margin: '0 auto', padding: '52px 56px' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 44, flexWrap: 'wrap', gap: 18 }}>
                    <div>
                        <p style={{ fontSize: 13, color: '#aaa', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>Farm Management</p>
                        <h1 className="serif" style={{ fontSize: 50, fontWeight: 400, color: '#111', letterSpacing: '-0.02em', lineHeight: 1 }}>
                            Farmer Dashboard
                        </h1>
                    </div>
                    <button onClick={() => setShowModal(true)}
                        style={{ background: '#111', color: 'white', border: 'none', padding: '14px 28px', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 9, transition: 'background .15s, transform .15s, box-shadow .15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#333'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.18)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Post New Job
                    </button>
                </div>

                {/* Stat row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18, marginBottom: 44 }}>
                    {[
                        {
                            label: 'Active Jobs', value: jobList.length, sub: 'Posted by you', iconBg: '#f0fdf4', iconColor: '#16a34a',
                            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                        },
                        {
                            label: 'Applications', value: matchesList.length, sub: 'Awaiting review', iconBg: '#eff6ff', iconColor: '#2563eb',
                            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        },
                        {
                            label: 'Avg. Daily Wage', value: avgWage > 0 ? `₹${avgWage}` : '—', sub: 'Across all postings', iconBg: '#fefce8', iconColor: '#ca8a04',
                            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        },
                        {
                            label: 'Acceptance Rate', value: matchesList.filter((m: any) => m.status === 'accepted').length > 0 ? `${Math.round((matchesList.filter((m: any) => m.status === 'accepted').length / matchesList.length) * 100)}%` : '—', sub: 'Of applications', iconBg: '#f0fdf4', iconColor: '#16a34a',
                            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
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

                {/* Action Cards Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26 }}>

                    {/* Job Postings summary */}
                    <div className="scard">
                        <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #f3f1ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 2 }}>Job Postings</h2>
                                <p style={{ fontSize: 13, color: '#aaa' }}>{jobList.length} active listing{jobList.length !== 1 ? 's' : ''}</p>
                            </div>
                            <button onClick={() => setShowModal(true)}
                                style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '8px 16px', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, transition: 'background .15s' }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#dcfce7')}
                                onMouseLeave={e => (e.currentTarget.style.background = '#f0fdf4')}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                New
                            </button>
                        </div>

                        <div style={{ padding: '28px' }}>
                            {jobList.length === 0 ? (
                                <div style={{ textAlign: 'center', paddingBottom: 8 }}>
                                    <EmptyJobsSVG />
                                    <p style={{ fontWeight: 700, fontSize: 17, color: '#111', margin: '18px 0 6px' }}>No jobs posted yet</p>
                                    <p style={{ fontSize: 14, color: '#aaa', marginBottom: 20 }}>Post your first job to find matched workers</p>
                                    <button onClick={() => setShowModal(true)}
                                        style={{ background: '#111', color: 'white', border: 'none', padding: '11px 22px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                        Post a Job
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {/* Show only last 3 jobs as preview */}
                                    {jobList.slice(0, 3).map((job: any, i: number) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: '#faf9f7', borderRadius: 14, border: '1px solid #f3f1ef' }}>
                                            <div style={{ width: 40, height: 40, background: '#f0fdf4', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 2 }}>{job.title}</p>
                                                <p style={{ fontSize: 13, color: '#aaa' }}>₹{job.wage}/day · Active</p>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => navigate('/farmer/jobs')}
                                        style={{ width: '100%', background: 'none', border: '1.5px dashed #e8e4e0', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 600, color: '#6b7280', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'border-color .15s, color .15s' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.color = '#16a34a'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e4e0'; e.currentTarget.style.color = '#6b7280'; }}>
                                        View all {jobList.length} jobs
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>


                </div>
            </div>
            <ChatWidget role="farmer" />
        </div>
    );
}