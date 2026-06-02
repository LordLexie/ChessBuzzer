import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import { Icons } from '../../components/ui/Icons';

const analyticsApi = axios.create({
    baseURL: import.meta.env.VITE_ANALYTICS_API_URL ?? 'http://localhost:8000',
    headers: { 'X-Service-Key': import.meta.env.VITE_ANALYTICS_SERVICE_KEY ?? '' },
});

function TopPlayersTab() {
    const navigate = useNavigate();
    const [items, setItems]           = useState([]);
    const [loading, setLoading]       = useState(false);
    const [minGames, setMinGames]     = useState(20);
    const [activeDays, setActiveDays] = useState(90);

    const fetch = () => {
        setLoading(true);
        analyticsApi.get(`/marketing/targets?min_games=${minGames}&active_days=${activeDays}&limit=50`)
            .then(res => setItems(res.data.items ?? []))
            .catch(() => toast.error('Failed to load marketing targets.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetch(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Controls */}
            <div className="cb-filters">
                <div className="cb-form-group" style={{ minWidth: 100 }}>
                    <label className="cb-label">Min games</label>
                    <input className="cb-input" type="number" min="1" value={minGames}
                        onChange={e => setMinGames(Number(e.target.value) || 1)} />
                </div>
                <div className="cb-form-group" style={{ minWidth: 130 }}>
                    <label className="cb-label">Active in last</label>
                    <select className="cb-input cb-select" value={activeDays} onChange={e => setActiveDays(Number(e.target.value))}>
                        <option value={30}>30 days</option>
                        <option value={60}>60 days</option>
                        <option value={90}>90 days</option>
                        <option value={180}>180 days</option>
                    </select>
                </div>
                <div style={{ alignSelf: 'flex-end' }}>
                    <button className="cb-btn cb-btn-primary" onClick={fetch} disabled={loading}>
                        {loading ? <span className="cb-spinner sm" /> : null} Refresh
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="cb-table-wrap">
                {loading ? (
                    <div className="cb-center"><div className="cb-spinner" /></div>
                ) : (
                    <table className="cb-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Username</th>
                                <th>Country</th>
                                <th>Rating</th>
                                <th>Total Games</th>
                                <th>Last 3 Mo.</th>
                                <th>Active Mo. (6m)</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr><td colSpan={8} className="cb-empty">No players match the current filters.</td></tr>
                            ) : items.map((p, idx) => (
                                <tr key={p.id}>
                                    <td className="cb-muted">{idx + 1}</td>
                                    <td>
                                        <span style={{ fontWeight: 700, color: '#3BE089', cursor: 'pointer' }}
                                            onClick={() => navigate(`/admin/player-archives/${p.id}`)}>
                                            {p.username}
                                        </span>
                                    </td>
                                    <td className="cb-muted">{p.country || '—'}</td>
                                    <td>
                                        {p.current_rating > 0
                                            ? <span className="cb-mono gold" style={{ fontSize: 13 }}>{p.current_rating}</span>
                                            : <span className="cb-muted">—</span>}
                                    </td>
                                    <td className="cb-muted">{p.total_games}</td>
                                    <td className="cb-muted">{p.games_last_3_months}</td>
                                    <td className="cb-muted">{p.active_months_last_6}</td>
                                    <td>
                                        <span className="cb-pill green" style={{ fontSize: 11 }}>{p.activity_score}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

function MatchupsTab() {
    const navigate = useNavigate();
    const [items, setItems]               = useState([]);
    const [loading, setLoading]           = useState(false);
    const [ratingSpread, setRatingSpread] = useState(150);
    const [minGames, setMinGames]         = useState(20);
    const [activeDays, setActiveDays]     = useState(90);

    const fetch = () => {
        setLoading(true);
        analyticsApi.get(`/marketing/matchups?rating_spread=${ratingSpread}&min_games=${minGames}&active_days=${activeDays}&limit=30`)
            .then(res => setItems(res.data.items ?? []))
            .catch(() => toast.error('Failed to load matchup suggestions.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetch(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Controls */}
            <div className="cb-filters">
                <div className="cb-form-group" style={{ minWidth: 110 }}>
                    <label className="cb-label">Rating spread ±</label>
                    <input className="cb-input" type="number" min="50" max="500" step="25" value={ratingSpread}
                        onChange={e => setRatingSpread(Number(e.target.value) || 150)} />
                </div>
                <div className="cb-form-group" style={{ minWidth: 100 }}>
                    <label className="cb-label">Min games</label>
                    <input className="cb-input" type="number" min="1" value={minGames}
                        onChange={e => setMinGames(Number(e.target.value) || 1)} />
                </div>
                <div className="cb-form-group" style={{ minWidth: 130 }}>
                    <label className="cb-label">Active in last</label>
                    <select className="cb-input cb-select" value={activeDays} onChange={e => setActiveDays(Number(e.target.value))}>
                        <option value={30}>30 days</option>
                        <option value={60}>60 days</option>
                        <option value={90}>90 days</option>
                        <option value={180}>180 days</option>
                    </select>
                </div>
                <div style={{ alignSelf: 'flex-end' }}>
                    <button className="cb-btn cb-btn-primary" onClick={fetch} disabled={loading}>
                        {loading ? <span className="cb-spinner sm" /> : null} Refresh
                    </button>
                </div>
            </div>

            <div className="cb-table-wrap">
                {loading ? (
                    <div className="cb-center"><div className="cb-spinner" /></div>
                ) : (
                    <table className="cb-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Player A</th>
                                <th>Rating A</th>
                                <th style={{ textAlign: 'center' }}>vs</th>
                                <th>Player B</th>
                                <th>Rating B</th>
                                <th>ELO Diff</th>
                                <th>Times Played</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr><td colSpan={8} className="cb-empty">No matchups found for the current filters.</td></tr>
                            ) : items.map((m, idx) => (
                                <tr key={idx} style={m.games_together === 0 ? { background: '#10261b' } : {}}>
                                    <td className="cb-muted">{idx + 1}</td>
                                    <td>
                                        <span style={{ fontWeight: 700, color: '#3BE089', cursor: 'pointer' }}
                                            onClick={() => navigate(`/admin/player-archives/${m.player_a.id}`)}>
                                            {m.player_a.username}
                                        </span>
                                    </td>
                                    <td><span className="cb-mono gold" style={{ fontSize: 13 }}>{m.player_a.rating}</span></td>
                                    <td style={{ textAlign: 'center', color: '#8A9D92' }}>⚔</td>
                                    <td>
                                        <span style={{ fontWeight: 700, color: '#3BE089', cursor: 'pointer' }}
                                            onClick={() => navigate(`/admin/player-archives/${m.player_b.id}`)}>
                                            {m.player_b.username}
                                        </span>
                                    </td>
                                    <td><span className="cb-mono gold" style={{ fontSize: 13 }}>{m.player_b.rating}</span></td>
                                    <td className="cb-muted">{m.rating_diff}</td>
                                    <td>
                                        {m.games_together === 0
                                            ? <span className="cb-pill green" style={{ fontSize: 11 }}>Never played</span>
                                            : <span className="cb-muted">{m.games_together}×</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {items.length > 0 && (
                <div className="cb-card-body" style={{ background: '#10261b', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#8A9D92' }}>
                    Green rows = players who have never faced each other — highest priority for arranged matches.
                </div>
            )}
        </div>
    );
}

function AdminMarketingTargets() {
    const [tab, setTab] = useState('targets');

    return (
        <DashboardWrapper>
            <AdminSidebar />
            <div className="cb-main">
                <AdminTopNav />
                <div className="cb-body">
                    <div className="cb-card">
                        <div className="cb-card-head">
                            <Icons.sparkles size={18} />
                            <h2>Marketing Intelligence</h2>
                            <span className="cb-hint" style={{ fontSize: 12, color: '#8A9D92' }}>ranked by activity · suggested matchups</span>
                        </div>

                        {/* Tabs */}
                        <div className="cb-tabs">
                            <button className={`cb-tab ${tab === 'targets' ? 'active' : ''}`} onClick={() => setTab('targets')}>
                                Top Players
                            </button>
                            <button className={`cb-tab ${tab === 'matchups' ? 'active' : ''}`} onClick={() => setTab('matchups')}>
                                Suggested Matchups
                            </button>
                        </div>

                        <div className="cb-card-body">
                            {tab === 'targets' && <TopPlayersTab />}
                            {tab === 'matchups' && <MatchupsTab />}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardWrapper>
    );
}

export default AdminMarketingTargets;
