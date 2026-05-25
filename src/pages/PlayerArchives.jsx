import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import useAuth from '../hooks/useAuth';
import Aside from '../components/layouts/Aside';
import Footer from '../components/layouts/Footer';
import TopNav from '../components/layouts/TopNav';
import Sidebar from '../components/layouts/Sidebar';
import DashboardWrapper from '../components/layouts/DashboardWrapper';

const LIMIT = 10;

function resultBadge(result) {
    if (result === 'win')  return <span className="badge badge-success">Win</span>;
    if (result === 'draw') return <span className="badge badge-secondary">Draw</span>;
    return <span className="badge badge-danger">Loss</span>;
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
    const [draft, setDraft]     = useState(emptyFilters);

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
            .catch(() => {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load games.' });
            })
            .finally(() => setLoading(false));
    };

    const handleSearch = () => {
        setFilters(draft);
        loadGames(0, draft);
    };

    const handleClear = () => {
        setDraft(emptyFilters);
        setFilters(emptyFilters);
        loadGames(0, emptyFilters);
    };

    useEffect(() => {
        axios.get(`api/v1/user/${userId}`)
            .then(res => {
                const user = res.data.data;
                if (user.analytics_key) {
                    setIntegrated(true);
                    loadGames(0);
                } else {
                    setIntegrated(false);
                }
            })
            .catch(() => {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load user data.' });
                setIntegrated(false);
            });
    }, [userId]);

    const handleIntegrate = () => {
        setIntegrating(true);
        axios.post('api/v1/analytics/integrate')
            .then(() => {
                setIntegrated(true);
                return loadGames(0);
            })
            .catch(() => {
                Swal.fire({ icon: 'error', title: 'Failed', text: 'Could not connect to analytics service. Please try again.' });
            })
            .finally(() => setIntegrating(false));
    };

    const page = Math.floor(skip / LIMIT) + 1;
    const totalPages = Math.ceil(total / LIMIT);

    return (
        <DashboardWrapper>
            <TopNav />
            <Sidebar />

            <div className="content-wrapper">

                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0">
                                    <i className="fas fa-archive mr-2"></i>
                                    Game Archives
                                </h1>
                            </div>
                            <div className="col-sm-6 text-right">
                                <small className="text-muted">
                                    chess.com · {auth?.username}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content">
                    <div className="container-fluid">

                        {integrated === null && (
                            <div className="text-center py-5">
                                <i className="fas fa-spinner fa-spin fa-2x text-muted"></i>
                                <p className="mt-2 text-muted">Loading archives...</p>
                            </div>
                        )}

                        {integrated === false && (
                            <div className="row justify-content-center">
                                <div className="col-md-6">
                                    <div className="card card-outline card-primary text-center">
                                        <div className="card-body py-5">
                                            <i className="fas fa-chess fa-4x text-primary mb-3"></i>
                                            <h3 className="mb-2">Connect Your Analytics</h3>
                                            <p className="text-muted mb-4">
                                                Your account isn't connected to the analytics service yet.<br />
                                                Click below to set it up — it only takes a second.
                                            </p>
                                            <button
                                                className="btn btn-primary btn-lg"
                                                onClick={handleIntegrate}
                                                disabled={integrating}
                                            >
                                                {integrating
                                                    ? <><i className="fas fa-spinner fa-spin mr-2"></i>Connecting...</>
                                                    : <><i className="fas fa-plug mr-2"></i>Connect Now</>
                                                }
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {integrated === true && (<>

                        {/* Filter form */}
                        <div className="card card-outline card-secondary mb-3">
                            <div className="card-body py-2">
                                <div className="form-row align-items-end">
                                    <div className="col-md-3 col-sm-6 mb-2">
                                        <label className="col-form-label-sm font-weight-bold">Opponent</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="Username..."
                                            value={draft.opponent}
                                            onChange={e => setDraft(d => ({ ...d, opponent: e.target.value }))}
                                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                    <div className="col-md-2 col-sm-6 mb-2">
                                        <label className="col-form-label-sm font-weight-bold">Time Class</label>
                                        <select
                                            className="form-control form-control-sm"
                                            value={draft.timeClass}
                                            onChange={e => setDraft(d => ({ ...d, timeClass: e.target.value }))}
                                        >
                                            <option value="">All</option>
                                            <option value="bullet">Bullet</option>
                                            <option value="blitz">Blitz</option>
                                            <option value="rapid">Rapid</option>
                                            <option value="daily">Daily</option>
                                        </select>
                                    </div>
                                    <div className="col-md-2 col-sm-6 mb-2">
                                        <label className="col-form-label-sm font-weight-bold">From</label>
                                        <input
                                            type="date"
                                            className="form-control form-control-sm"
                                            value={draft.startDate}
                                            onChange={e => setDraft(d => ({ ...d, startDate: e.target.value }))}
                                        />
                                    </div>
                                    <div className="col-md-2 col-sm-6 mb-2">
                                        <label className="col-form-label-sm font-weight-bold">To</label>
                                        <input
                                            type="date"
                                            className="form-control form-control-sm"
                                            value={draft.endDate}
                                            onChange={e => setDraft(d => ({ ...d, endDate: e.target.value }))}
                                        />
                                    </div>
                                    <div className="col-md-3 col-sm-12 mb-2 d-flex" style={{ gap: 8 }}>
                                        <button className="btn btn-sm btn-primary flex-fill" onClick={handleSearch} disabled={loading}>
                                            <i className="fas fa-search mr-1"></i> Search
                                        </button>
                                        <button className="btn btn-sm btn-outline-secondary flex-fill" onClick={handleClear} disabled={loading}>
                                            <i className="fas fa-times mr-1"></i> Clear
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Games table */}
                        <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-list mr-1"></i>
                                        Games
                                    </h3>
                                    <div className="card-tools">
                                        <small className="text-muted">
                                            {total > 0
                                                ? `Showing ${skip + 1}–${Math.min(skip + LIMIT, total)} of ${total}`
                                                : '0 games'}
                                        </small>
                                    </div>
                                </div>
                                <div className="card-body p-0">
                                    {loading ? (
                                        <div className="text-center py-4">
                                            <i className="fas fa-spinner fa-spin fa-lg text-muted"></i>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover table-sm mb-0">
                                                <thead className="thead-light">
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
                                                            <td className="text-muted" style={{ fontSize: '0.85rem', width: 40 }}>{skip + i + 1}</td>
                                                            <td className="text-nowrap text-muted" style={{ fontSize: '0.85rem' }}>
                                                                {new Date(g.end_time * 1000).toLocaleDateString()}
                                                            </td>
                                                            <td>
                                                                <span className="font-weight-bold">{g.white_username}</span>
                                                                <small className="text-muted ml-1">({g.white_rating})</small>
                                                            </td>
                                                            <td>
                                                                <span className="font-weight-bold">{g.black_username}</span>
                                                                <small className="text-muted ml-1">({g.black_rating})</small>
                                                            </td>
                                                            <td>{resultBadge(g.player_result)}</td>
                                                            <td>
                                                                <a href={g.url} target="_blank" rel="noreferrer" className="btn btn-xs btn-outline-secondary">
                                                                    <i className="fas fa-external-link-alt"></i>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {games.length === 0 && (
                                                        <tr>
                                                            <td colSpan={6} className="text-center text-muted py-4">No games found.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                                {totalPages > 1 && (
                                    <div className="card-footer d-flex align-items-center justify-content-between">
                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            disabled={skip === 0 || loading}
                                            onClick={() => loadGames(skip - LIMIT, filters)}
                                        >
                                            <i className="fas fa-chevron-left mr-1"></i> Prev
                                        </button>
                                        <small className="text-muted">Page {page} of {totalPages}</small>
                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            disabled={skip + LIMIT >= total || loading}
                                            onClick={() => loadGames(skip + LIMIT, filters)}
                                        >
                                            Next <i className="fas fa-chevron-right ml-1"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>)}

                    </div>
                </div>

            </div>

            <Aside />
            <Footer />
        </DashboardWrapper>
    );
}

export default PlayerArchives;
