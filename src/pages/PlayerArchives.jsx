import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import TopNav from '../components/layouts/TopNav';
import Sidebar from '../components/layouts/Sidebar';
import DashboardWrapper from '../components/layouts/DashboardWrapper';
import { Icons } from '../components/ui/Icons';

const LIMIT = 10;

function resultPill(result) {
    if (result === 'win')  return <span className="cb-pill green"><span className="dot" />Win</span>;
    if (result === 'draw') return <span className="cb-pill grey"><span className="dot" />Draw</span>;
    return <span className="cb-pill coral"><span className="dot" />Loss</span>;
}

function PlayerArchives() {
    const { auth } = useAuth();
    const userId = auth?.user_id;

    const [integrated, setIntegrated] = useState(null);
    const [integrating, setIntegrating] = useState(false);
    const [games, setGames] = useState([]);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const [loading, setLoading] = useState(false);

    const emptyFilters = { opponent: '', timeClass: '', startDate: '', endDate: '' };
    const [filters, setFilters] = useState(emptyFilters);
    const [draft, setDraft] = useState(emptyFilters);

    const loadGames = (offset = 0, f = filters) => {
        setLoading(true);
        const params = new URLSearchParams({ skip: offset, limit: LIMIT });
        if (f.opponent)  params.append('opponent',   f.opponent);
        if (f.timeClass) params.append('time_class', f.timeClass);
        if (f.startDate) params.append('start_date', f.startDate);
        if (f.endDate)   params.append('end_date',   f.endDate);
        axios.get(`api/v1/games?${params}`)
            .then(res => {
                const page = res.data.data;
                setGames(page.items);
                setTotal(page.total);
                setSkip(offset);
            })
            .catch(() => toast.error('Failed to load games.'))
            .finally(() => setLoading(false));
    };

    const handleSearch = () => { setFilters(draft); loadGames(0, draft); };
    const handleClear  = () => { setDraft(emptyFilters); setFilters(emptyFilters); loadGames(0, emptyFilters); };

    useEffect(() => {
        axios.get(`api/v1/user/${userId}`)
            .then(res => {
                const user = res.data.data;
                if (user.analytics_key) { setIntegrated(true); loadGames(0); }
                else setIntegrated(false);
            })
            .catch(() => { toast.error('Failed to load user data.'); setIntegrated(false); });
    }, [userId]);

    const handleIntegrate = () => {
        setIntegrating(true);
        axios.post('api/v1/analytics/integrate')
            .then(() => { setIntegrated(true); loadGames(0); })
            .catch(() => toast.error('Could not connect to analytics service.'))
            .finally(() => setIntegrating(false));
    };

    const page = Math.floor(skip / LIMIT) + 1;
    const totalPages = Math.ceil(total / LIMIT);

    if (integrated === null) {
        return (
            <DashboardWrapper>
                <Sidebar />
                <div className="cb-main">
                    <TopNav />
                    <div className="cb-body">
                        <div className="cb-center"><div className="cb-spinner" /></div>
                    </div>
                </div>
            </DashboardWrapper>
        );
    }

    if (integrated === false) {
        return (
            <DashboardWrapper>
                <Sidebar />
                <div className="cb-main">
                    <TopNav />
                    <div className="cb-body">
                        <div style={{ maxWidth: 480 }}>
                            <div className="cb-card">
                                <div className="cb-card-body" style={{ textAlign: 'center', padding: '48px 32px' }}>
                                    <div style={{ fontSize: 48, marginBottom: 18 }}>♟</div>
                                    <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 10 }}>
                                        Connect Your Analytics
                                    </div>
                                    <p className="cb-muted" style={{ marginBottom: 24, lineHeight: 1.6 }}>
                                        Your account isn't connected to the analytics service yet.<br />
                                        Click below to set it up — it only takes a second.
                                    </p>
                                    <button className="cb-btn cb-btn-primary" onClick={handleIntegrate} disabled={integrating}>
                                        {integrating ? <><span className="cb-spinner sm" /> Connecting…</> : 'Connect Now'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardWrapper>
        );
    }

    return (
        <DashboardWrapper>
            <Sidebar />
            <div className="cb-main">
                <TopNav />
                <div className="cb-body">
                    {/* Filter bar */}
                    <div className="cb-card">
                        <div className="cb-card-body" style={{ padding: '18px 26px' }}>
                            <div className="cb-filters">
                                <div className="cb-form-group">
                                    <label className="cb-label">Opponent</label>
                                    <input className="cb-input" type="text" placeholder="Username…"
                                        value={draft.opponent}
                                        onChange={e => setDraft(d => ({ ...d, opponent: e.target.value }))}
                                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                                <div className="cb-form-group" style={{ minWidth: 120, maxWidth: 150 }}>
                                    <label className="cb-label">Time Class</label>
                                    <select className="cb-input cb-select" value={draft.timeClass}
                                        onChange={e => setDraft(d => ({ ...d, timeClass: e.target.value }))}>
                                        <option value="">All</option>
                                        <option value="bullet">Bullet</option>
                                        <option value="blitz">Blitz</option>
                                        <option value="rapid">Rapid</option>
                                        <option value="daily">Daily</option>
                                    </select>
                                </div>
                                <div className="cb-form-group" style={{ minWidth: 140 }}>
                                    <label className="cb-label">From</label>
                                    <input className="cb-input" type="date" value={draft.startDate}
                                        onChange={e => setDraft(d => ({ ...d, startDate: e.target.value }))} />
                                </div>
                                <div className="cb-form-group" style={{ minWidth: 140 }}>
                                    <label className="cb-label">To</label>
                                    <input className="cb-input" type="date" value={draft.endDate}
                                        onChange={e => setDraft(d => ({ ...d, endDate: e.target.value }))} />
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-end' }}>
                                    <button className="cb-btn cb-btn-primary" onClick={handleSearch} disabled={loading}>
                                        <Icons.search size={15} /> Search
                                    </button>
                                    <button className="cb-btn cb-btn-ghost" onClick={handleClear} disabled={loading}>
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Games table */}
                    <div className="cb-card">
                        <div className="cb-card-head">
                            <Icons.archive size={20} />
                            <h2>Game Archives</h2>
                            <span className="cb-hint">
                                {total > 0 ? `${skip + 1}–${Math.min(skip + LIMIT, total)} of ${total}` : '0 games'}
                            </span>
                        </div>

                        <div className="cb-table-wrap">
                            {loading ? (
                                <div className="cb-center"><div className="cb-spinner" /></div>
                            ) : (
                                <table className="cb-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Date</th>
                                            <th>White</th>
                                            <th>Black</th>
                                            <th>Result</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {games.map((g, i) => (
                                            <tr key={g.id}>
                                                <td className="cb-muted" style={{ fontSize: 13 }}>{skip + i + 1}</td>
                                                <td className="cb-muted" style={{ fontSize: 13 }}>
                                                    {new Date(g.end_time * 1000).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    <span style={{ fontWeight: 700 }}>{g.white_username}</span>
                                                    <span className="cb-muted" style={{ fontSize: 12, marginLeft: 6 }}>({g.white_rating})</span>
                                                </td>
                                                <td>
                                                    <span style={{ fontWeight: 700 }}>{g.black_username}</span>
                                                    <span className="cb-muted" style={{ fontSize: 12, marginLeft: 6 }}>({g.black_rating})</span>
                                                </td>
                                                <td>{resultPill(g.player_result)}</td>
                                                <td>
                                                    <a href={g.url} target="_blank" rel="noreferrer"
                                                        className="cb-btn cb-btn-ghost"
                                                        style={{ padding: '5px 10px', fontSize: 12 }}>
                                                        <Icons.link size={13} />
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                        {games.length === 0 && (
                                            <tr><td colSpan={6} className="cb-empty">No games found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className="cb-card-foot">
                                <button className="cb-btn cb-btn-ghost" disabled={skip === 0 || loading}
                                    onClick={() => loadGames(skip - LIMIT)}
                                    style={{ padding: '7px 14px', fontSize: 13 }}>
                                    Previous
                                </button>
                                <span className="cb-muted" style={{ fontSize: 13 }}>Page {page} of {totalPages}</span>
                                <button className="cb-btn cb-btn-ghost" disabled={skip + LIMIT >= total || loading}
                                    onClick={() => loadGames(skip + LIMIT)}
                                    style={{ padding: '7px 14px', fontSize: 13 }}>
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardWrapper>
    );
}

export default PlayerArchives;
