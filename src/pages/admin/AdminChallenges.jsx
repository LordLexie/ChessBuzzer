import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import { Icons } from '../../components/ui/Icons';

const EMPTY_FILTERS = { player: '', status: '', dateFrom: '', dateTo: '' };

const STATUS_PILL = {
    pending:  'gold',
    active:   'green',
    complete: 'green',
    completed: 'green',
    canceled: 'coral',
};

function AdminChallenges() {
    const [challenges, setChallenges] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalRows: 0 });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);

    const activeCount = Object.values(appliedFilters).filter(Boolean).length;

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams({ page, page_size: 10 });
        if (appliedFilters.player)   params.append('player', appliedFilters.player);
        if (appliedFilters.status)   params.append('status', appliedFilters.status);
        if (appliedFilters.dateFrom) params.append('date_from', appliedFilters.dateFrom);
        if (appliedFilters.dateTo)   params.append('date_to', appliedFilters.dateTo);

        axios.get(`/api/v1/admin/challenges?${params}`)
            .then(res => {
                setChallenges(res.data.data ?? []);
                setPagination({
                    page: res.data.page,
                    totalPages: res.data.total_pages,
                    totalRows: res.data.total_rows,
                });
            })
            .catch(() => toast.error('Failed to load challenges.'))
            .finally(() => setLoading(false));
    }, [page, appliedFilters]);

    function handleApply() { setPage(1); setAppliedFilters({ ...filters }); }
    function handleClear() { setFilters(EMPTY_FILTERS); setAppliedFilters({ ...EMPTY_FILTERS }); setPage(1); }
    function setFilter(key, value) { setFilters(f => ({ ...f, [key]: value })); }

    return (
        <DashboardWrapper>
            <AdminSidebar />
            <div className="cb-main">
                <AdminTopNav />
                <div className="cb-body">
                    {/* Filter card */}
                    <div className="cb-card">
                        <div className="cb-card-head">
                            <Icons.swap size={18} />
                            <h2>Filter Challenges</h2>
                            {activeCount > 0 && <span className="cb-count">{activeCount} active</span>}
                            {activeCount > 0 && (
                                <span className="cb-hint">
                                    <button className="cb-btn cb-btn-ghost" style={{ padding: '4px 12px', fontSize: 12, color: '#FF6A3D', borderColor: '#4a2010' }}
                                        onClick={handleClear}>Clear All</button>
                                </span>
                            )}
                        </div>
                        <div className="cb-card-body">
                            <div className="cb-filters">
                                <div className="cb-form-group" style={{ minWidth: 160 }}>
                                    <label className="cb-label">Player (Creator)</label>
                                    <input className="cb-input" placeholder="Search by username" value={filters.player}
                                        onChange={e => setFilter('player', e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleApply()} />
                                </div>
                                <div className="cb-form-group" style={{ minWidth: 130 }}>
                                    <label className="cb-label">Status</label>
                                    <select className="cb-input cb-select" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
                                        <option value="">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="active">Active</option>
                                        <option value="complete">Completed</option>
                                        <option value="canceled">Canceled</option>
                                    </select>
                                </div>
                                <div className="cb-form-group" style={{ minWidth: 140 }}>
                                    <label className="cb-label">Date From</label>
                                    <input className="cb-input" type="date" value={filters.dateFrom} onChange={e => setFilter('dateFrom', e.target.value)} />
                                </div>
                                <div className="cb-form-group" style={{ minWidth: 140 }}>
                                    <label className="cb-label">Date To</label>
                                    <input className="cb-input" type="date" value={filters.dateTo} onChange={e => setFilter('dateTo', e.target.value)} />
                                </div>
                                <div style={{ alignSelf: 'flex-end' }}>
                                    <button className="cb-btn cb-btn-primary" onClick={handleApply}>Apply Filters</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Challenges table */}
                    <div className="cb-card">
                        <div className="cb-card-head">
                            <Icons.trophy size={18} />
                            <h2>Challenges</h2>
                            <span className="cb-count">{pagination.totalRows}</span>
                        </div>
                        <div className="cb-table-wrap">
                            {loading ? (
                                <div className="cb-center"><div className="cb-spinner" /></div>
                            ) : (
                                <table className="cb-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Creator</th>
                                            <th>Opponent</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                            <th>Currency</th>
                                            <th>Entry Fee</th>
                                            <th>Max Players</th>
                                            <th>Balance</th>
                                            <th>Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {challenges.length === 0 ? (
                                            <tr><td colSpan={10} className="cb-empty">No challenges found.</td></tr>
                                        ) : challenges.map((ch, i) => {
                                            const opponent = ch.Matrices?.find(m => m.Player !== ch.CreatedBy);
                                            const cls = STATUS_PILL[ch.status] ?? 'grey';
                                            return (
                                                <tr key={ch.ID}>
                                                    <td className="cb-muted">{(pagination.page - 1) * 10 + i + 1}</td>
                                                    <td style={{ fontWeight: 700 }}>{ch.User?.username ?? ch.CreatedBy}</td>
                                                    <td className="cb-muted">{opponent?.User?.username ?? '—'}</td>
                                                    <td className="cb-muted" style={{ fontSize: 13 }}>{ch.ChallengeType?.Name ?? '—'}</td>
                                                    <td>
                                                        <span className={`cb-pill ${cls}`}>
                                                            <span className="dot" />{ch.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="cb-pill grey" style={{ fontSize: 11 }}>{ch.currency}</span>
                                                    </td>
                                                    <td>
                                                        <span className="cb-mono gold" style={{ fontSize: 14 }}>
                                                            {(ch.entry_fee ?? 0).toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td className="cb-muted">{ch.max_players ?? '—'}</td>
                                                    <td>
                                                        <span className="cb-mono green" style={{ fontSize: 14 }}>
                                                            {(ch.Balance ?? 0).toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td className="cb-muted" style={{ fontSize: 13 }}>
                                                        {new Date(ch.CreatedAt).toLocaleString('en-KE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
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

export default AdminChallenges;
