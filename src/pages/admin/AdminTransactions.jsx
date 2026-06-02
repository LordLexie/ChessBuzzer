import { useState, useEffect } from 'react';
import axios from 'axios';

import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import { Icons } from '../../components/ui/Icons';

const EMPTY_FILTERS = { player: '', dateFrom: '', dateTo: '', type: '', reference: '' };

function AdminTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalRows: 0 });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);

    const activeCount = Object.values(appliedFilters).filter(Boolean).length;

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams({ page, page_size: 10 });
        if (appliedFilters.player)    params.append('player', appliedFilters.player);
        if (appliedFilters.dateFrom)  params.append('date_from', appliedFilters.dateFrom);
        if (appliedFilters.dateTo)    params.append('date_to', appliedFilters.dateTo);
        if (appliedFilters.type)      params.append('type', appliedFilters.type);
        if (appliedFilters.reference) params.append('reference', appliedFilters.reference);

        axios.get(`/api/v1/admin/transactions?${params}`)
            .then(res => {
                setTransactions(res.data.data ?? []);
                setPagination({
                    page: res.data.page,
                    totalPages: res.data.total_pages,
                    totalRows: res.data.total_rows,
                });
            })
            .catch(err => console.error('Error fetching transactions:', err))
            .finally(() => setLoading(false));
    }, [page, appliedFilters]);

    function handleApply() { setPage(1); setAppliedFilters({ ...filters }); }
    function handleClear() { setFilters(EMPTY_FILTERS); setAppliedFilters(EMPTY_FILTERS); setPage(1); }
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
                            <h2>Filter Transactions</h2>
                            {activeCount > 0 && <span className="cb-count">{activeCount} active</span>}
                            {activeCount > 0 && (
                                <span className="cb-hint">
                                    <button className="cb-btn cb-btn-ghost" style={{ padding: '4px 12px', fontSize: 12, color: '#FF6A3D', borderColor: '#4a2010' }}
                                        onClick={handleClear}>
                                        Clear All
                                    </button>
                                </span>
                            )}
                        </div>
                        <div className="cb-card-body">
                            <div className="cb-filters">
                                <div className="cb-form-group" style={{ minWidth: 160 }}>
                                    <label className="cb-label">Player</label>
                                    <input className="cb-input" placeholder="Search by username" value={filters.player}
                                        onChange={e => setFilter('player', e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleApply()} />
                                </div>
                                <div className="cb-form-group" style={{ minWidth: 160 }}>
                                    <label className="cb-label">Reference</label>
                                    <input className="cb-input" placeholder="Search by reference" value={filters.reference}
                                        onChange={e => setFilter('reference', e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleApply()} />
                                </div>
                                <div className="cb-form-group" style={{ minWidth: 120 }}>
                                    <label className="cb-label">Type</label>
                                    <select className="cb-input cb-select" value={filters.type} onChange={e => setFilter('type', e.target.value)}>
                                        <option value="">All Types</option>
                                        <option value="credit">Credit</option>
                                        <option value="debit">Debit</option>
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

                    {/* Transactions table */}
                    <div className="cb-card">
                        <div className="cb-card-head">
                            <Icons.swap size={18} />
                            <h2>Transactions</h2>
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
                                            <th>Date</th>
                                            <th>Player</th>
                                            <th>Amount</th>
                                            <th>Type</th>
                                            <th>Channel</th>
                                            <th>Reference</th>
                                            <th>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.length === 0 ? (
                                            <tr><td colSpan={8} className="cb-empty">No transactions found.</td></tr>
                                        ) : transactions.map((tx, i) => {
                                            const isCredit = tx.TransactionType?.toLowerCase() === 'credit';
                                            return (
                                                <tr key={tx.ID}>
                                                    <td className="cb-muted">{(pagination.page - 1) * 10 + i + 1}</td>
                                                    <td className="cb-muted" style={{ fontSize: 13 }}>
                                                        {new Date(tx.CreatedAt).toLocaleString('en-KE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td style={{ fontWeight: 700 }}>{tx.User?.username ?? tx.UserID}</td>
                                                    <td>
                                                        <span className={`cb-mono ${isCredit ? 'green' : 'coral'}`} style={{ fontSize: 14 }}>
                                                            {tx.Amount?.toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`cb-pill ${isCredit ? 'green' : 'coral'}`}>
                                                            <span className="dot" />{tx.TransactionType?.toLowerCase()}
                                                        </span>
                                                    </td>
                                                    <td className="cb-muted" style={{ fontSize: 13 }}>{tx.Channel ?? '—'}</td>
                                                    <td className="cb-muted" style={{ fontSize: 13 }}>{tx.Reference ?? '—'}</td>
                                                    <td className="cb-muted" style={{ fontSize: 13 }}>{tx.Description ?? '—'}</td>
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

export default AdminTransactions;
