import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import { Icons } from '../../components/ui/Icons';

const PAGE_SIZE = 10;

function AdminPlayerArchives() {
    const navigate = useNavigate();
    const [users, setUsers]             = useState([]);
    const [total, setTotal]             = useState(0);
    const [page, setPage]               = useState(1);
    const [loading, setLoading]         = useState(true);
    const [discovering, setDiscovering] = useState({});

    const [activeDays, setActiveDays]       = useState('');
    const [minGames, setMinGames]           = useState('');
    const [appliedFilters, setAppliedFilters] = useState({ activeDays: '', minGames: '' });

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    useEffect(() => {
        setLoading(true);
        const skip = (page - 1) * PAGE_SIZE;
        let url = `/api/v1/admin/analytics/users?skip=${skip}&limit=${PAGE_SIZE}`;
        if (appliedFilters.activeDays) url += `&active_days=${appliedFilters.activeDays}`;
        if (appliedFilters.minGames)   url += `&min_games=${appliedFilters.minGames}`;

        axios.get(url)
            .then(res => {
                setUsers(res.data.items ?? []);
                setTotal(res.data.total ?? 0);
            })
            .catch(() => toast.error('Failed to load player archives.'))
            .finally(() => setLoading(false));
    }, [page, appliedFilters]);

    const handleApplyFilters = () => { setPage(1); setAppliedFilters({ activeDays, minGames }); };
    const handleClearFilters = () => {
        setActiveDays(''); setMinGames(''); setPage(1);
        setAppliedFilters({ activeDays: '', minGames: '' });
    };

    const handleDiscover = user => {
        setDiscovering(prev => ({ ...prev, [user.id]: true }));
        axios.post(`/api/v1/admin/analytics/users/${user.id}/discover`)
            .then(res => {
                toast.success(`Discover job queued for ${res.data.username} (task ${res.data.task_id.slice(0, 8)}…)`);
            })
            .catch(err => {
                toast.error(err.response?.data?.detail ?? 'Failed to queue discover job.');
            })
            .finally(() => setDiscovering(prev => ({ ...prev, [user.id]: false })));
    };

    return (
        <DashboardWrapper>
            <AdminSidebar />
            <div className="cb-main">
                <AdminTopNav />
                <div className="cb-body">
                    {/* Filter card */}
                    <div className="cb-card">
                        <div className="cb-card-head">
                            <Icons.archive size={18} />
                            <h2>Player Archives</h2>
                            <span className="cb-count">{total} users</span>
                        </div>
                        <div className="cb-card-body">
                            <div className="cb-filters">
                                <div className="cb-form-group" style={{ minWidth: 140 }}>
                                    <label className="cb-label">Active in last</label>
                                    <select className="cb-input cb-select" value={activeDays} onChange={e => setActiveDays(e.target.value)}>
                                        <option value="">Any time</option>
                                        <option value="30">30 days</option>
                                        <option value="60">60 days</option>
                                        <option value="90">90 days</option>
                                    </select>
                                </div>
                                <div className="cb-form-group" style={{ minWidth: 100 }}>
                                    <label className="cb-label">Min games</label>
                                    <input className="cb-input" type="number" placeholder="—" min="0" value={minGames}
                                        onChange={e => setMinGames(e.target.value)} />
                                </div>
                                <div style={{ alignSelf: 'flex-end', display: 'flex', gap: 8 }}>
                                    <button className="cb-btn cb-btn-primary" onClick={handleApplyFilters}>Apply</button>
                                    {(appliedFilters.activeDays || appliedFilters.minGames) && (
                                        <button className="cb-btn cb-btn-ghost" onClick={handleClearFilters}>Clear</button>
                                    )}
                                </div>
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
                                            <th>Username</th>
                                            <th>Country</th>
                                            <th>Depth</th>
                                            <th>Date Joined</th>
                                            <th>Last Refreshed</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length === 0 ? (
                                            <tr><td colSpan={7} className="cb-empty">No users found.</td></tr>
                                        ) : users.map((user, index) => (
                                            <tr key={user.id}>
                                                <td className="cb-muted">{(page - 1) * PAGE_SIZE + index + 1}</td>
                                                <td>
                                                    <span style={{ fontWeight: 700, color: '#3BE089', cursor: 'pointer' }}
                                                        onClick={() => navigate(`/admin/player-archives/${user.id}`)}>
                                                        {user.username}
                                                    </span>
                                                </td>
                                                <td className="cb-muted">{user.country || '—'}</td>
                                                <td>
                                                    <span className="cb-pill gold" style={{ fontSize: 11 }}>{user.depth ?? 0}</span>
                                                </td>
                                                <td className="cb-muted" style={{ fontSize: 13 }}>
                                                    {user.joined
                                                        ? new Date(Number(user.joined) * 1000).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: '2-digit' })
                                                        : '—'}
                                                </td>
                                                <td className="cb-muted" style={{ fontSize: 13 }}>
                                                    {user.last_refreshed_at
                                                        ? new Date(user.last_refreshed_at).toLocaleString('en-KE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                                                        : 'Never'}
                                                </td>
                                                <td>
                                                    <button
                                                        className="cb-btn cb-btn-ghost"
                                                        style={{ padding: '5px 12px', fontSize: 12 }}
                                                        onClick={() => handleDiscover(user)}
                                                        disabled={!!discovering[user.id]}
                                                        title="Scan this player's games and create accounts for any Kenyan opponents found"
                                                    >
                                                        {discovering[user.id] ? <span className="cb-spinner sm" /> : null}
                                                        {discovering[user.id] ? 'Queuing…' : 'Discover'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="cb-card-foot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="cb-muted" style={{ fontSize: 13 }}>
                                Page {page} of {totalPages} ({total} total)
                            </span>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="cb-btn cb-btn-ghost" style={{ padding: '5px 14px', fontSize: 13 }}
                                    onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</button>
                                <button className="cb-btn cb-btn-ghost" style={{ padding: '5px 14px', fontSize: 13 }}
                                    onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardWrapper>
    );
}

export default AdminPlayerArchives;
