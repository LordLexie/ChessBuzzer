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
    headers: {
        'X-Service-Key': import.meta.env.VITE_ANALYTICS_SERVICE_KEY ?? '',
    },
});

const PAGE_SIZE = 10;

function AdminPlayerArchives() {
    const [users, setUsers]               = useState([]);
    const [total, setTotal]               = useState(0);
    const [page, setPage]                 = useState(1);
    const [loading, setLoading]           = useState(true);
    const [discovering, setDiscovering]   = useState({});   // { [userId]: true }

    // Filters (pending = form value, applied = last fetched value)
    const [activeDays, setActiveDays]     = useState('');   // '' = no filter
    const [minGames,   setMinGames]       = useState('');   // '' = no filter
    const [appliedFilters, setAppliedFilters] = useState({ activeDays: '', minGames: '' });

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    useEffect(() => {
        setLoading(true);
        const skip = (page - 1) * PAGE_SIZE;
        let url = `/users/?skip=${skip}&limit=${PAGE_SIZE}`;
        if (appliedFilters.activeDays) url += `&active_days=${appliedFilters.activeDays}`;
        if (appliedFilters.minGames)   url += `&min_games=${appliedFilters.minGames}`;

        analyticsApi
            .get(url)
            .then(res => {
                setUsers(res.data.items ?? []);
                setTotal(res.data.total ?? 0);
            })
            .catch(err => {
                console.error('Error fetching chess analytics users:', err);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load player archives.' });
            })
            .finally(() => setLoading(false));
    }, [page, appliedFilters]);

    const handleApplyFilters = () => {
        setPage(1);
        setAppliedFilters({ activeDays, minGames });
    };

    const handleClearFilters = () => {
        setActiveDays('');
        setMinGames('');
        setPage(1);
        setAppliedFilters({ activeDays: '', minGames: '' });
    };

    const handleDiscover = (user) => {
        setDiscovering(prev => ({ ...prev, [user.id]: true }));
        analyticsApi
            .post(`/users/${user.id}/discover`)
            .then(res => {
                Swal.fire({
                    icon: 'success',
                    title: 'Queued',
                    text: `Discover job queued for ${res.data.username} (task ${res.data.task_id.slice(0, 8)}…)`,
                    timer: 3000,
                    showConfirmButton: false,
                });
            })
            .catch(err => {
                const msg = err.response?.data?.detail ?? 'Failed to queue discover job.';
                Swal.fire({ icon: 'error', title: 'Error', text: msg });
            })
            .finally(() => {
                setDiscovering(prev => ({ ...prev, [user.id]: false }));
            });
    };

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
                                    <i className="fas fa-archive mr-2"></i>
                                    Player Archives
                                </h1>
                            </div>
                            <div className="col-sm-6 text-right">
                                <small className="text-muted">chess analytics · {total} users</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content">
                    <div className="container-fluid">
                        {/* Filter bar */}
                        <div className="row mb-3">
                            <div className="col-md-12">
                                <div className="card card-outline card-secondary">
                                    <div className="card-body py-2">
                                        <div className="form-inline">
                                            <label className="mr-2" style={{ fontSize: '13px' }}>Active in last</label>
                                            <select
                                                className="form-control form-control-sm mr-3"
                                                value={activeDays}
                                                onChange={e => setActiveDays(e.target.value)}
                                            >
                                                <option value="">Any time</option>
                                                <option value="30">30 days</option>
                                                <option value="60">60 days</option>
                                                <option value="90">90 days</option>
                                            </select>

                                            <label className="mr-2" style={{ fontSize: '13px' }}>Min games</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm mr-3"
                                                style={{ width: '80px' }}
                                                placeholder="—"
                                                min="0"
                                                value={minGames}
                                                onChange={e => setMinGames(e.target.value)}
                                            />

                                            <button className="btn btn-sm btn-primary mr-2" onClick={handleApplyFilters}>
                                                <i className="fas fa-filter mr-1"></i>Apply
                                            </button>
                                            {(appliedFilters.activeDays || appliedFilters.minGames) && (
                                                <button className="btn btn-sm btn-outline-secondary" onClick={handleClearFilters}>
                                                    <i className="fas fa-times mr-1"></i>Clear
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-body table-responsive p-0">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th style={{ fontSize: '14px' }}>#</th>
                                                    <th style={{ fontSize: '14px' }}>Avatar</th>
                                                    <th style={{ fontSize: '14px' }}>Username</th>
                                                    <th className="d-none d-md-table-cell" style={{ fontSize: '14px' }}>Country</th>
                                                    <th className="d-none d-md-table-cell" style={{ fontSize: '14px' }}>Depth</th>
                                                    <th className="d-none d-md-table-cell" style={{ fontSize: '14px' }}>Date Joined</th>
                                                    <th className="d-none d-lg-table-cell" style={{ fontSize: '14px' }}>Last Refreshed</th>
                                                    <th style={{ fontSize: '14px' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan="8" className="text-center py-4">
                                                            <span className="fa fa-spinner fa-spin" /> Loading...
                                                        </td>
                                                    </tr>
                                                ) : users.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="8" className="text-center py-4">No users found.</td>
                                                    </tr>
                                                ) : (
                                                    users.map((user, index) => (
                                                        <tr key={user.id}>
                                                            <td style={{ fontSize: '13px' }}>
                                                                {(page - 1) * PAGE_SIZE + index + 1}
                                                            </td>
                                                            <td>
                                                                <img
                                                                    src={user.profile_picture ?? './assets/dist/img/avatar.png'}
                                                                    alt=""
                                                                    className="img-circle img-size-32 mr-2"
                                                                    onError={e => { e.target.src = './assets/dist/img/avatar.png'; }}
                                                                />
                                                            </td>
                                                            <td style={{ fontSize: '13px' }}>
                                                                <Link to={`/admin/player-archives/${user.id}`}>
                                                                    {user.username}
                                                                </Link>
                                                            </td>
                                                            <td className="d-none d-md-table-cell" style={{ fontSize: '13px' }}>
                                                                {user.country || '—'}
                                                            </td>
                                                            <td className="d-none d-md-table-cell" style={{ fontSize: '13px' }}>
                                                                <span className="badge badge-info">{user.depth ?? 0}</span>
                                                            </td>
                                                            <td className="d-none d-md-table-cell" style={{ fontSize: '13px' }}>
                                                                {user.joined
                                                                    ? new Date(Number(user.joined) * 1000).toLocaleDateString('en-KE', {
                                                                          year: 'numeric', month: 'short', day: '2-digit',
                                                                      })
                                                                    : <span className="text-muted">—</span>
                                                                }
                                                            </td>
                                                            <td className="d-none d-lg-table-cell" style={{ fontSize: '13px' }}>
                                                                {user.last_refreshed_at
                                                                    ? new Date(user.last_refreshed_at).toLocaleString('en-KE', {
                                                                          year: 'numeric', month: '2-digit', day: '2-digit',
                                                                          hour: '2-digit', minute: '2-digit',
                                                                      })
                                                                    : <span className="text-muted">Never</span>
                                                                }
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() => handleDiscover(user)}
                                                                    disabled={!!discovering[user.id]}
                                                                    title="Scan this player's games and create accounts for any Kenyan opponents found"
                                                                >
                                                                    {discovering[user.id]
                                                                        ? <><i className="fas fa-spinner fa-spin mr-1"></i>Queuing…</>
                                                                        : <><i className="fas fa-search-plus mr-1"></i>Discover Players</>
                                                                    }
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="card-footer d-flex justify-content-between align-items-center">
                                        <span style={{ fontSize: '13px' }}>
                                            Page {page} of {totalPages} &nbsp;({total} total)
                                        </span>
                                        <ul className="pagination pagination-sm mb-0">
                                            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                                <button className="page-link" onClick={() => setPage(p => p - 1)}>Previous</button>
                                            </li>
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                                <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                                                    <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                                                </li>
                                            ))}
                                            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                                <button className="page-link" onClick={() => setPage(p => p + 1)}>Next</button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Aside />
            <Footer />
        </DashboardWrapper>
    );
}

export default AdminPlayerArchives;
