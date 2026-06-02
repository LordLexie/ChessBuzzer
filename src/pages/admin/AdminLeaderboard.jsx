import { useState, useEffect } from 'react';
import axios from 'axios';

import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import { Icons } from '../../components/ui/Icons';

function AdminLeaderboard() {
    const [entries, setEntries] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalRows: 0 });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ dateFrom: '', dateTo: '' });
    const [appliedFilters, setAppliedFilters] = useState({ dateFrom: '', dateTo: '' });

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams({ page, page_size: 10 });
        if (appliedFilters.dateFrom) params.append('date_from', appliedFilters.dateFrom);
        if (appliedFilters.dateTo)   params.append('date_to', appliedFilters.dateTo);
        axios.get(`/api/v1/admin/leaderboard?${params}`)
            .then(res => {
                setEntries(res.data.data ?? []);
                setPagination({
                    page: res.data.page,
                    totalPages: res.data.total_pages,
                    totalRows: res.data.total_rows,
                });
            })
            .catch(err => console.error('Error fetching leaderboard:', err))
            .finally(() => setLoading(false));
    }, [page, appliedFilters]);

    const applyFilters = () => { setPage(1); setAppliedFilters({ ...filters }); };
    const resetFilters = () => {
        setFilters({ dateFrom: '', dateTo: '' });
        setAppliedFilters({ dateFrom: '', dateTo: '' });
        setPage(1);
    };

    const medal = rank => rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

    return (
        <DashboardWrapper>
            <AdminSidebar />
            <div className="cb-main">
                <AdminTopNav />
                <div className="cb-body">
                    {/* Filters */}
                    <div className="cb-card">
                        <div className="cb-card-head">
                            <Icons.trophy size={18} />
                            <h2>Leaderboard</h2>
                        </div>
                        <div className="cb-card-body">
                            <div className="cb-filters">
                                <div className="cb-form-group" style={{ minWidth: 140 }}>
                                    <label className="cb-label">From</label>
                                    <input className="cb-input" type="date" value={filters.dateFrom}
                                        onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
                                </div>
                                <div className="cb-form-group" style={{ minWidth: 140 }}>
                                    <label className="cb-label">To</label>
                                    <input className="cb-input" type="date" value={filters.dateTo}
                                        onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
                                </div>
                                <div style={{ alignSelf: 'flex-end', display: 'flex', gap: 8 }}>
                                    <button className="cb-btn cb-btn-primary" onClick={applyFilters}>Apply</button>
                                    <button className="cb-btn cb-btn-ghost" onClick={resetFilters}>Reset</button>
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
                                            <th>Rank</th>
                                            <th>Username</th>
                                            <th>Name</th>
                                            <th>Country</th>
                                            <th>Challenges</th>
                                            <th>Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entries.length === 0 ? (
                                            <tr><td colSpan={6} className="cb-empty">No data found.</td></tr>
                                        ) : entries.map((entry, index) => {
                                            const rank = (pagination.page - 1) * 10 + index + 1;
                                            const m = medal(rank);
                                            return (
                                                <tr key={entry.ID}>
                                                    <td>
                                                        {m ? (
                                                            <span style={{ fontSize: 20 }}>{m}</span>
                                                        ) : (
                                                            <div className="cb-seat">{rank}</div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="cb-user">
                                                            <div className="cb-user-av" style={{ background: 'linear-gradient(150deg,#3BE089,#1E8A52)' }}>
                                                                {entry.username?.[0]?.toUpperCase() ?? '?'}
                                                            </div>
                                                            <span style={{ fontWeight: 700, color: rank <= 3 ? '#F2C14E' : '#E8F1EB' }}>{entry.username}</span>
                                                        </div>
                                                    </td>
                                                    <td className="cb-muted">{entry.name || '—'}</td>
                                                    <td className="cb-muted">{entry.country || '—'}</td>
                                                    <td>
                                                        <span className="cb-mono green" style={{ fontSize: 14 }}>{entry.challenge_count}</span>
                                                    </td>
                                                    <td className="cb-muted" style={{ fontSize: 13 }}>
                                                        {new Date(entry.CreatedAt).toLocaleDateString('en-KE', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="cb-card-foot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="cb-muted" style={{ fontSize: 13 }}>
                                Page {pagination.page} of {pagination.totalPages} ({pagination.totalRows} total)
                            </span>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="cb-btn cb-btn-ghost" style={{ padding: '5px 14px', fontSize: 13 }}
                                    onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</button>
                                <button className="cb-btn cb-btn-ghost" style={{ padding: '5px 14px', fontSize: 13 }}
                                    onClick={() => setPage(p => p + 1)} disabled={page === pagination.totalPages}>Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardWrapper>
    );
}

export default AdminLeaderboard;
