import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import Aside from '../../components/layouts/Aside';
import Footer from '../../components/layouts/Footer';

const analyticsApi = axios.create({
    baseURL: import.meta.env.VITE_ANALYTICS_API_URL ?? 'http://localhost:8000',
    headers: { 'X-Service-Key': import.meta.env.VITE_ANALYTICS_SERVICE_KEY ?? '' },
});

// ─── Top Players Tab ─────────────────────────────────────────────────────────

function TopPlayersTab() {
    const [items, setItems]         = useState([]);
    const [loading, setLoading]     = useState(false);
    const [minGames, setMinGames]   = useState(20);
    const [activeDays, setActiveDays] = useState(90);

    const fetch = () => {
        setLoading(true);
        analyticsApi
            .get(`/marketing/targets?min_games=${minGames}&active_days=${activeDays}&limit=50`)
            .then(res => setItems(res.data.items ?? []))
            .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load marketing targets.' }))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetch(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div>
            {/* Controls */}
            <div className="card card-outline card-secondary mb-3">
                <div className="card-body py-2">
                    <div className="form-inline">
                        <label className="mr-2" style={{ fontSize: '13px' }}>Min games</label>
                        <input
                            type="number" min="1"
                            className="form-control form-control-sm mr-3"
                            style={{ width: '70px' }}
                            value={minGames}
                            onChange={e => setMinGames(Number(e.target.value) || 1)}
                        />
                        <label className="mr-2" style={{ fontSize: '13px' }}>Active in last</label>
                        <select
                            className="form-control form-control-sm mr-3"
                            value={activeDays}
                            onChange={e => setActiveDays(Number(e.target.value))}
                        >
                            <option value={30}>30 days</option>
                            <option value={60}>60 days</option>
                            <option value={90}>90 days</option>
                            <option value={180}>180 days</option>
                        </select>
                        <button className="btn btn-sm btn-primary" onClick={fetch} disabled={loading}>
                            {loading
                                ? <><i className="fas fa-spinner fa-spin mr-1"></i>Loading…</>
                                : <><i className="fas fa-sync mr-1"></i>Refresh</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="card-body table-responsive p-0">
                    <table className="table table-hover table-sm">
                        <thead>
                            <tr>
                                <th style={{ fontSize: '13px' }}>#</th>
                                <th style={{ fontSize: '13px' }}>Avatar</th>
                                <th style={{ fontSize: '13px' }}>Username</th>
                                <th className="d-none d-md-table-cell" style={{ fontSize: '13px' }}>Country</th>
                                <th style={{ fontSize: '13px' }}>Rating</th>
                                <th style={{ fontSize: '13px' }}>Total Games</th>
                                <th style={{ fontSize: '13px' }}>Last 3 Mo.</th>
                                <th className="d-none d-md-table-cell" style={{ fontSize: '13px' }}>Active Mo. (6m)</th>
                                <th style={{ fontSize: '13px' }}>
                                    Score
                                    <i
                                        className="fas fa-info-circle ml-1 text-muted"
                                        title="Score = (games last 3 months × 2) + (active months in last 6 × 5) + (total games × 0.05)"
                                        style={{ cursor: 'help' }}
                                    ></i>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="9" className="text-center py-4">
                                    <i className="fas fa-spinner fa-spin"></i> Loading…
                                </td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan="9" className="text-center py-4 text-muted">No players match the current filters.</td></tr>
                            ) : items.map((p, idx) => (
                                <tr key={p.id}>
                                    <td style={{ fontSize: '13px' }}>{idx + 1}</td>
                                    <td>
                                        <img
                                            src={p.profile_picture ?? '/assets/dist/img/avatar.png'}
                                            alt=""
                                            className="img-circle img-size-32"
                                            onError={e => { e.target.src = '/assets/dist/img/avatar.png'; }}
                                        />
                                    </td>
                                    <td style={{ fontSize: '13px' }}>
                                        <Link to={`/admin/player-archives/${p.id}`}>{p.username}</Link>
                                    </td>
                                    <td className="d-none d-md-table-cell" style={{ fontSize: '13px' }}>{p.country || '—'}</td>
                                    <td style={{ fontSize: '13px' }}>
                                        {p.current_rating > 0
                                            ? <span className="badge badge-secondary">{p.current_rating}</span>
                                            : <span className="text-muted">—</span>}
                                    </td>
                                    <td style={{ fontSize: '13px' }}>{p.total_games}</td>
                                    <td style={{ fontSize: '13px' }}>{p.games_last_3_months}</td>
                                    <td className="d-none d-md-table-cell" style={{ fontSize: '13px' }}>{p.active_months_last_6}</td>
                                    <td style={{ fontSize: '13px' }}>
                                        <span className="badge badge-info">{p.activity_score}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ─── Matchups Tab ─────────────────────────────────────────────────────────────

function MatchupsTab() {
    const [items, setItems]               = useState([]);
    const [loading, setLoading]           = useState(false);
    const [ratingSpread, setRatingSpread] = useState(150);
    const [minGames, setMinGames]         = useState(20);
    const [activeDays, setActiveDays]     = useState(90);

    const fetch = () => {
        setLoading(true);
        analyticsApi
            .get(`/marketing/matchups?rating_spread=${ratingSpread}&min_games=${minGames}&active_days=${activeDays}&limit=30`)
            .then(res => setItems(res.data.items ?? []))
            .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load matchup suggestions.' }))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetch(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div>
            {/* Controls */}
            <div className="card card-outline card-secondary mb-3">
                <div className="card-body py-2">
                    <div className="form-inline">
                        <label className="mr-2" style={{ fontSize: '13px' }}>Rating spread ±</label>
                        <input
                            type="number" min="50" max="500" step="25"
                            className="form-control form-control-sm mr-3"
                            style={{ width: '75px' }}
                            value={ratingSpread}
                            onChange={e => setRatingSpread(Number(e.target.value) || 150)}
                        />
                        <label className="mr-2" style={{ fontSize: '13px' }}>Min games</label>
                        <input
                            type="number" min="1"
                            className="form-control form-control-sm mr-3"
                            style={{ width: '70px' }}
                            value={minGames}
                            onChange={e => setMinGames(Number(e.target.value) || 1)}
                        />
                        <label className="mr-2" style={{ fontSize: '13px' }}>Active in last</label>
                        <select
                            className="form-control form-control-sm mr-3"
                            value={activeDays}
                            onChange={e => setActiveDays(Number(e.target.value))}
                        >
                            <option value={30}>30 days</option>
                            <option value={60}>60 days</option>
                            <option value={90}>90 days</option>
                            <option value={180}>180 days</option>
                        </select>
                        <button className="btn btn-sm btn-primary" onClick={fetch} disabled={loading}>
                            {loading
                                ? <><i className="fas fa-spinner fa-spin mr-1"></i>Loading…</>
                                : <><i className="fas fa-sync mr-1"></i>Refresh</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="card-body table-responsive p-0">
                    <table className="table table-hover table-sm">
                        <thead>
                            <tr>
                                <th style={{ fontSize: '13px' }}>#</th>
                                <th style={{ fontSize: '13px' }}>Player A</th>
                                <th style={{ fontSize: '13px' }}>Rating A</th>
                                <th style={{ fontSize: '13px' }} className="text-center">vs</th>
                                <th style={{ fontSize: '13px' }}>Player B</th>
                                <th style={{ fontSize: '13px' }}>Rating B</th>
                                <th style={{ fontSize: '13px' }}>ELO Diff</th>
                                <th style={{ fontSize: '13px' }}>Times Played</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="text-center py-4">
                                    <i className="fas fa-spinner fa-spin"></i> Loading…
                                </td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan="8" className="text-center py-4 text-muted">No matchups found for the current filters.</td></tr>
                            ) : items.map((m, idx) => (
                                <tr key={idx} style={m.games_together === 0 ? { background: '#f6fff8' } : {}}>
                                    <td style={{ fontSize: '13px' }}>{idx + 1}</td>
                                    <td style={{ fontSize: '13px' }}>
                                        <Link to={`/admin/player-archives/${m.player_a.id}`}>{m.player_a.username}</Link>
                                    </td>
                                    <td style={{ fontSize: '13px' }}>
                                        <span className="badge badge-secondary">{m.player_a.rating}</span>
                                    </td>
                                    <td style={{ fontSize: '13px' }} className="text-center text-muted">⚔</td>
                                    <td style={{ fontSize: '13px' }}>
                                        <Link to={`/admin/player-archives/${m.player_b.id}`}>{m.player_b.username}</Link>
                                    </td>
                                    <td style={{ fontSize: '13px' }}>
                                        <span className="badge badge-secondary">{m.player_b.rating}</span>
                                    </td>
                                    <td style={{ fontSize: '13px' }}>{m.rating_diff}</td>
                                    <td style={{ fontSize: '13px' }}>
                                        {m.games_together === 0
                                            ? <span className="badge badge-success">Never played</span>
                                            : <span className="badge badge-light">{m.games_together}×</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {items.length > 0 && (
                    <div className="card-footer">
                        <small className="text-muted">
                            <i className="fas fa-circle text-success mr-1" style={{ fontSize: '10px' }}></i>
                            Green rows = players who have never faced each other — highest priority for arranged matches.
                        </small>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function AdminMarketingTargets() {
    const [tab, setTab] = useState('targets');

    return (
        <DashboardWrapper>
            <AdminTopNav />
            <AdminSidebar />

            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0">
                                    <i className="fas fa-bullhorn mr-2"></i>
                                    Marketing Intelligence
                                </h1>
                            </div>
                            <div className="col-sm-6 text-right">
                                <small className="text-muted">ranked by activity · suggested matchups</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content">
                    <div className="container-fluid">

                        {/* Tabs */}
                        <ul className="nav nav-tabs mb-3">
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${tab === 'targets' ? 'active' : ''}`}
                                    onClick={() => setTab('targets')}
                                >
                                    <i className="fas fa-star mr-1"></i> Top Players
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${tab === 'matchups' ? 'active' : ''}`}
                                    onClick={() => setTab('matchups')}
                                >
                                    <i className="fas fa-chess mr-1"></i> Suggested Matchups
                                </button>
                            </li>
                        </ul>

                        {tab === 'targets' && <TopPlayersTab />}
                        {tab === 'matchups' && <MatchupsTab />}

                    </div>
                </div>
            </div>

            <Aside />
            <Footer />
        </DashboardWrapper>
    );
}

export default AdminMarketingTargets;
