import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { matches, profiles, jobs as jobsApi } from '../services/api';
import ChatWidget from '../components/ChatWidget';

// ─── Empty state SVG ───────────────────────────────────────────────────────────
const NoMatchesSVG = () => (
  <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ width: 240, display: 'block', margin: '0 auto' }}>
    {/* Clipboard */}
    <rect x="70" y="50" width="160" height="130" rx="14" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="2" />
    <rect x="110" y="40" width="80" height="22" rx="8" fill="#dcfce7" stroke="#bbf7d0" strokeWidth="1.5" />
    <rect x="90" y="88" width="120" height="8" rx="4" fill="#dcfce7" />
    <rect x="90" y="104" width="90" height="8" rx="4" fill="#dcfce7" />
    <rect x="90" y="120" width="110" height="8" rx="4" fill="#dcfce7" />
    <rect x="90" y="136" width="70" height="8" rx="4" fill="#dcfce7" />
    {/* Magnifier */}
    <circle cx="200" cy="152" r="36" fill="white" stroke="#16a34a" strokeWidth="2.5" />
    <circle cx="200" cy="152" r="24" fill="#f0fdf4" />
    <path d="M190 152 L196 158 L212 142" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="225" y1="177" x2="248" y2="200" stroke="#16a34a" strokeWidth="4" strokeLinecap="round" />
    {/* Dots */}
    <circle cx="70" cy="34" r="5" fill="#16a34a" opacity="0.3" />
    <circle cx="248" cy="56" r="4" fill="#16a34a" opacity="0.25" />
    <circle cx="260" cy="168" r="3.5" fill="#16a34a" opacity="0.2" />
  </svg>
);

// ─── Score helpers ─────────────────────────────────────────────────────────────
const scoreMeta = (s: number) =>
  s >= 80 ? { bg: '#dcfce7', txt: '#166534', bar: '#16a34a', label: 'Excellent' }
    : s >= 60 ? { bg: '#fef9c3', txt: '#854d0e', bar: '#eab308', label: 'Good' }
      : { bg: '#ffedd5', txt: '#9a3412', bar: '#f97316', label: 'Fair' };

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, iconBg, iconColor, icon }: any) => (
  <div style={{ background: '#fff', border: '1px solid #e8e4e0', borderRadius: 18, padding: '24px 26px', display: 'flex', alignItems: 'center', gap: 18 }}>
    <div style={{ width: 54, height: 54, background: iconBg, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: 13, color: '#aaa', fontWeight: 500, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color: '#111', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 13, color: '#aaa', marginTop: 3 }}>{sub}</p>}
    </div>
  </div>
);

export default function LaborDashboard() {
  const [matchesList, setMatchesList] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'excellent' | 'good'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const profileRes = await profiles.getMyProfile();
      setProfile(profileRes.data);
      try {
        const matchesRes = await matches.getForLabor();
        setMatchesList(matchesRes.data.matches || []);
      } catch { /* no matches yet */ }
    } catch (err: any) {
      if (err.response?.status === 404) navigate('/create-profile');
    } finally { setLoading(false); }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    setSearching(true);
    try {
      const res = await jobsApi.searchByLocation(searchQuery.trim());
      setSearchResults(res.data.results || []);
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') { setSearchQuery(''); setSearchResults(null); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const avgScore = matchesList.length
    ? Math.round(matchesList.reduce((a, m) => a + m.score, 0) / matchesList.length) : 0;

  const skills = profile?.skills?.split(',').map((s: string) => s.trim()).filter(Boolean) || [];

  const filtered = searchResults !== null ? searchResults : matchesList.filter(m =>
    filter === 'all' ? true :
      filter === 'excellent' ? m.score >= 80 :
        m.score >= 60 && m.score < 80
  );

  const isSearchMode = searchResults !== null;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf9f7', fontFamily: "'Instrument Sans', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, border: '3px solid #dcfce7', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 18px' }} />
        <p style={{ color: '#aaa', fontSize: 17 }}>Loading your matches…</p>
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

        /* Job cards */
        .jcard {
          background: #fff; border: 1px solid #e8e4e0; border-radius: 20px;
          overflow: hidden; display: flex; flex-direction: column;
          transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
          animation: fadeUp .5s ease both;
        }
        .jcard:hover { transform: translateY(-5px); box-shadow: 0 22px 52px rgba(0,0,0,.1); border-color: #16a34a; }

        /* Skill chips */
        .chip { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 100px; white-space: nowrap; }
        .chip-gray { background: #f3f4f6; color: #6b7280; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 100px; white-space: nowrap; }

        /* Apply button */
        .apply-btn {
          width: 100%; background: #111; color: white; border: none;
          padding: 14px; border-radius: 11px; font-size: 15px; font-weight: 600;
          cursor: pointer; font-family: inherit;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background .15s, transform .15s;
        }
        .apply-btn:hover { background: #333; transform: translateY(-1px); }

        /* Filter pill */
        .fpill { padding: 8px 18px; border-radius: 100px; border: 1.5px solid #e8e4e0; background: white; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; color: #6b7280; transition: all .15s; }
        .fpill:hover { border-color: #aaa; color: #111; }
        .fpill.on { background: #111; color: white; border-color: #111; }

        /* Nav icon btn */
        .nib { background: none; border: none; cursor: pointer; padding: 9px; border-radius: 10px; transition: background .15s; display: flex; align-items: center; justify-content: center; color: #6b7280; }
        .nib:hover { background: #f3f1ef; color: #111; }
      `}</style>

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
            <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100 }}>Labor</span>
          </div>
          {/* Nav centre - breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#aaa', fontSize: 14 }}>
            <span>Dashboard</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
            <span style={{ color: '#111', fontWeight: 600 }}>Job Matches</span>
          </div>
          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => navigate('/labor/applications')}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: '#f3f1ef', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#374151', transition: 'background .15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#e8e4e0')} onMouseLeave={e => (e.currentTarget.style.background = '#f3f1ef')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
              My Applications
            </button>
            <div style={{ width: 1, height: 28, background: '#e8e4e0' }} />
            <button className="nib" style={{ position: 'relative' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
              {matchesList.length > 0 && <span style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, background: '#ef4444', borderRadius: '50%', border: '1.5px solid white' }} />}
            </button>
            <div style={{ width: 1, height: 28, background: '#e8e4e0', margin: '0 4px' }} />
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #16a34a, #15803d)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 17, cursor: 'pointer' }}>
              {profile?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ marginLeft: 2 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#111', lineHeight: 1.2 }}>{profile?.full_name || 'User'}</p>
              <p style={{ fontSize: 12, color: '#aaa' }}>Labor Profile</p>
            </div>
            <button onClick={handleLogout} className="nib" title="Logout" style={{ marginLeft: 4 }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Page Body ── */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '52px 56px' }}>

        {/* Page title row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 44, flexWrap: 'wrap', gap: 18 }}>
          <div>
            <p style={{ fontSize: 13, color: '#aaa', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
              Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}
            </p>
            <h1 className="serif" style={{ fontSize: 50, fontWeight: 400, color: '#111', letterSpacing: '-0.02em', lineHeight: 1 }}>
              Your Job Matches
            </h1>
          </div>
          {/* Search bar */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search by location… (e.g. Hyderabad)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                style={{ width: '100%', padding: '11px 40px 11px 40px', border: '1.5px solid #e8e4e0', borderRadius: 11, fontSize: 14, fontFamily: 'inherit', color: '#111', background: '#fff', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#16a34a')}
                onBlur={e => (e.currentTarget.style.borderColor = '#e8e4e0')}
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchResults(null); }}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 2, display: 'flex' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              )}
            </div>
            <button onClick={() => navigate('/profile/edit')} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 18px', background: '#fff', border: '1px solid #e8e4e0', borderRadius: 11, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', color: '#374151', transition: 'border-color .15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#aaa')} onMouseLeave={e => (e.currentTarget.style.borderColor = '#e8e4e0')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              Profile
            </button>
          </div>
        </div>

        {/* Stat row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18, marginBottom: 32 }}>
          <StatCard label="Avg. Match Score" value={`${avgScore}%`} sub={avgScore >= 80 ? 'Excellent standing' : 'Keep updating skills'}
            iconBg="#f0fdf4" iconColor="#16a34a"
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>} />
          <StatCard label="Total Matches" value={matchesList.length} sub={`${matchesList.filter(m => m.score >= 80).length} excellent`}
            iconBg="#eff6ff" iconColor="#2563eb"
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>} />
          <StatCard label="Daily Rate" value={`₹${profile?.daily_rate || 0}`} sub="Per day expected"
            iconBg="#fefce8" iconColor="#ca8a04"
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>} />
          <StatCard label="Skills Listed" value={skills.length} sub={skills.slice(0, 2).join(', ') || '—'}
            iconBg="#faf5ff" iconColor="#9333ea"
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>} />
        </div>

        {/* Skills strip */}
        {skills.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e8e4e0', borderRadius: 15, padding: '16px 26px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>Your skills</span>
            <div style={{ width: 1, height: 18, background: '#e8e4e0' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {skills.map((s: string, i: number) => <span key={i} className="chip">{s}</span>)}
            </div>
          </div>
        )}

        {/* Filter row / Search banner */}
        {isSearchMode ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <span style={{ fontWeight: 600, color: '#166534', fontSize: 14 }}>
                {filtered.length} job{filtered.length !== 1 ? 's' : ''} found for &ldquo;{searchQuery}&rdquo; &mdash; sorted by location relevance
              </span>
            </div>
            <button onClick={() => { setSearchResults(null); setSearchQuery(''); }}
              style={{ background: 'none', border: '1px solid #bbf7d0', color: '#16a34a', padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Clear search
            </button>
          </div>
        ) : matchesList.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: '#aaa', fontWeight: 500, marginRight: 4 }}>Filter:</span>
            {(['all', 'excellent', 'good'] as const).map(f => (
              <button key={f} className={`fpill ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? `All (${matchesList.length})` : f === 'excellent' ? `🟢 Excellent (${matchesList.filter(m => m.score >= 80).length})` : `🟡 Good (${matchesList.filter(m => m.score >= 60 && m.score < 80).length})`}
              </button>
            ))}
          </div>
        ) : null}

        {/* Jobs grid or empty */}
        {filtered.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #e8e4e0', borderRadius: 22, padding: '80px 48px', textAlign: 'center' }}>
            <NoMatchesSVG />
            <h3 className="serif" style={{ fontSize: 32, fontWeight: 400, color: '#111', margin: '28px 0 10px' }}>
              {isSearchMode ? `No jobs found in "${searchQuery}"` : matchesList.length === 0 ? 'No matches yet' : 'No matches in this category'}
            </h3>
            <p style={{ color: '#aaa', fontSize: 17, maxWidth: 380, margin: '0 auto 32px', lineHeight: 1.7 }}>
              {isSearchMode ? 'Try a different location or a broader term like a city or state name.'
                : matchesList.length === 0
                  ? 'Complete your profile with skills and rate — the AI will start matching instantly.'
                  : 'Try a different filter to see more results.'}
            </p>
            {!isSearchMode && matchesList.length === 0 && (
              <button onClick={() => navigate('/profile/edit')}
                style={{ background: '#111', color: 'white', border: 'none', padding: '14px 30px', borderRadius: 11, fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                Update Profile
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 22 }}>
            {filtered.map((match, idx) => {
              const meta = scoreMeta(match.score);
              const pts = (match.explanation || '').split('•').filter((p: string) => p.trim()).slice(0, 3);
              const matchedSkills = (match.explanation || '').includes('Skills matched:')
                ? match.explanation.split('Skills matched:')[1]?.split(',').map((s: string) => s.trim()).filter(Boolean).slice(0, 4)
                : [];

              return (
                <div key={idx} className="jcard" style={{ animationDelay: `${idx * 0.06}s`, cursor: 'pointer' }}
                  onClick={() => navigate(`/jobs/${match.job_id}`)}>
                  {/* Score header band */}
                  <div style={{ height: 5, background: `linear-gradient(90deg, ${meta.bar}, ${meta.bar}88)`, width: `${match.score}%` }} />

                  <div style={{ padding: '24px 26px 18px' }}>
                    {/* Title + badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                      <h3 style={{ fontSize: 19, fontWeight: 700, color: '#111', lineHeight: 1.3, flex: 1 }}>{match.job_title}</h3>
                      <div style={{ background: meta.bg, color: meta.txt, fontWeight: 700, fontSize: 13, padding: '5px 13px', borderRadius: 100, flexShrink: 0 }}>
                        {Math.round(match.score)}%
                      </div>
                    </div>

                    {/* Score bar */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#bbb', marginBottom: 7 }}>
                        <span style={{ fontWeight: 500 }}>Match quality</span>
                        <span style={{ color: meta.txt, fontWeight: 700 }}>{meta.label}</span>
                      </div>
                      <div style={{ height: 7, background: '#f3f1ef', borderRadius: 100, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${match.score}%`, background: `linear-gradient(90deg, ${meta.bar}, ${meta.bar}cc)`, borderRadius: 100, transition: 'width .6s ease' }} />
                      </div>
                    </div>

                    {/* Explanation points */}
                    {pts.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f3f1ef' }}>
                        {pts.map((pt: string, i: number) => (
                          <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M2 5l2 2 4-4" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <span style={{ fontSize: 14, color: '#555', lineHeight: 1.55 }}>{pt.trim()}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Matched skills */}
                    {matchedSkills.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
                        {matchedSkills.map((s: string, i: number) => <span key={i} className="chip">{s}</span>)}
                      </div>
                    )}

                    {/* Wage + location/meta row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>₹{match.wage}/day</span>
                      {(match.location || match.relevance !== undefined) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#555', fontSize: 13, background: '#faf9f7', padding: '5px 12px', borderRadius: 100 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                          {match.location || 'Location not specified'}
                        </div>
                      )}
                    </div>
                    {/* Extra job details */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                      {match.workers_needed > 1 && <span style={{ fontSize: 12, color: '#6b7280', background: '#f3f4f6', padding: '3px 10px', borderRadius: 100 }}>👥 {match.workers_needed} workers needed</span>}
                      {match.duration && <span style={{ fontSize: 12, color: '#6b7280', background: '#f3f4f6', padding: '3px 10px', borderRadius: 100 }}>⏱ {match.duration}</span>}
                      {match.start_date && <span style={{ fontSize: 12, color: '#6b7280', background: '#f3f4f6', padding: '3px 10px', borderRadius: 100 }}>📅 Starts {match.start_date}</span>}
                      {isSearchMode && match.relevance > 0 && <span style={{ fontSize: 12, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '3px 10px', borderRadius: 100 }}>📍 Location match</span>}
                    </div>
                  </div>

                  <div style={{ padding: '0 26px 26px' }}>
                    <button className="apply-btn" onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${match.job_id}`); }}>
                      View & Apply
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <ChatWidget role="labor" />
    </div>
  );
}