import { useState, useEffect } from 'react';
import axios from 'axios';

import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import Aside from '../../components/layouts/Aside';
import Footer from '../../components/layouts/Footer';

const EMPTY_FILTERS = { player: '', status: '', dateFrom: '', dateTo: '' };

const STATUS_BADGE = {
    pending:   'warning',
    active:    'info',
    completed: 'success',
    canceled:  'danger',
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
            .catch(err => console.error('Error fetching challenges:', err))
            .finally(() => setLoading(false));
    }, [page, appliedFilters]);

    function handleApply() {
        setPage(1);
        setAppliedFilters({ ...filters });
    }

    function handleClear() {
        setFilters(EMPTY_FILTERS);
        setAppliedFilters({ ...EMPTY_FILTERS });
        setPage(1);
    }

    function setFilter(key, value) {
        setFilters(f => ({ ...f, [key]: value }));
    }

    function statusBadge(status) {
        const colour = STATUS_BADGE[status] ?? 'secondary';
        return <span className={`badge badge-${colour}`}>{status}</span>;
    }

    return (
        <DashboardWrapper>
            <AdminTopNav />
            <AdminSidebar />

            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0">Challenges</h1>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content">
                    <div className="container-fluid">

                        {/* Filter Card */}
                        <div className="card card-outline card-primary mb-3">
                            <div className="card-header d-flex align-items-center" style={{ padding: '0.6rem 1rem' }}>
                                <h3 className="card-title mb-0">
                                    <i className="fas fa-sliders-h mr-2" />
                                    Filter Challenges
                                    {activeCount > 0 && (
                                        <span className="badge badge-primary ml-2">{activeCount}</span>
                                    )}
                                </h3>
                                {activeCount > 0 && (
                                    <button
                                        className="btn btn-link btn-sm text-danger ml-auto p-0"
                                        onClick={handleClear}
                                        style={{ fontSize: '13px' }}
                                    >
                                        <i className="fas fa-times mr-1" />Clear All
                                    </button>
                                )}
                            </div>
                            <div className="card-body pb-2">
                                <div className="row">
                                    <div className="col-md-4 mb-2">
                                        <label style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Player (Creator)</label>
                                        <div className="input-group input-group-sm">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text"><i className="fas fa-user" /></span>
                                            </div>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search by username"
                                                value={filters.player}
                                                onChange={e => setFilter('player', e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleApply()}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-4 mb-2">
                                        <label style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Status</label>
                                        <div className="input-group input-group-sm">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text"><i className="fas fa-flag" /></span>
                                            </div>
                                            <select
                                                className="form-control"
                                                value={filters.status}
                                                onChange={e => setFilter('status', e.target.value)}
                                            >
                                                <option value="">All Statuses</option>
                                                <option value="pending">Pending</option>
                                                <option value="active">Active</option>
                                                <option value="complete">Completed</option>
                                                <option value="canceled">Canceled</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-4 mb-2" />
                                </div>
                                <div className="row align-items-end">
                                    <div className="col-md-4 mb-2">
                                        <label style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Date From</label>
                                        <div className="input-group input-group-sm">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text"><i className="fas fa-calendar-alt" /></span>
                                            </div>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={filters.dateFrom}
                                                onChange={e => setFilter('dateFrom', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-4 mb-2">
                                        <label style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Date To</label>
                                        <div className="input-group input-group-sm">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text"><i className="fas fa-calendar-alt" /></span>
                                            </div>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={filters.dateTo}
                                                onChange={e => setFilter('dateTo', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-4 mb-2">
                                        <button
                                            className="btn btn-primary btn-sm btn-block"
                                            onClick={handleApply}
                                        >
                                            <i className="fas fa-search mr-1" />Apply Filters
                                        </button>
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
                                                    <th className="d-none d-md-table-cell" style={{ fontSize: '14px' }}>#</th>
                                                    <th style={{ fontSize: '14px' }}>Creator</th>
                                                    <th style={{ fontSize: '14px' }}>Opponent</th>
                                                    <th className="d-none d-md-table-cell" style={{ fontSize: '14px' }}>Type</th>
                                                    <th style={{ fontSize: '14px' }}>Status</th>
                                                    <th className="d-none d-md-table-cell" style={{ fontSize: '14px' }}>Currency</th>
                                                    <th style={{ fontSize: '14px' }}>Entry Fee</th>
                                                    <th className="d-none d-md-table-cell" style={{ fontSize: '14px' }}>Max Players</th>
                                                    <th className="d-none d-md-table-cell" style={{ fontSize: '14px' }}>Balance</th>
                                                    <th className="d-none d-md-table-cell" style={{ fontSize: '14px' }}>Created</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan="10" className="text-center py-4">
                                                            <span className="fa fa-spinner fa-spin" /> Loading...
                                                        </td>
                                                    </tr>
                                                ) : challenges.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="10" className="text-center py-4">No challenges found.</td>
                                                    </tr>
                                                ) : (
                                                    challenges.map((ch, index) => {
                                                        const opponent = ch.Matrices?.find(m => m.Player !== ch.CreatedBy);
                                                        const opponentName = opponent?.User?.username ?? '—';
                                                        return (
                                                        <tr key={ch.ID}>
                                                            <td className="d-none d-md-table-cell" style={{ fontSize: '13px' }}>{(pagination.page - 1) * 10 + index + 1}</td>
                                                            <td style={{ fontSize: '13px' }}>{ch.User?.username ?? ch.CreatedBy}</td>
                                                            <td style={{ fontSize: '13px' }}>{opponentName}</td>
                                                            <td className="d-none d-md-table-cell" style={{ fontSize: '13px' }}>{ch.ChallengeType?.Name ?? '—'}</td>
                                                            <td style={{ fontSize: '13px' }}>{statusBadge(ch.status)}</td>
                                                            <td className="d-none d-md-table-cell" style={{ fontSize: '13px' }}>
                                                                <span className="badge badge-secondary">{ch.currency}</span>
                                                            </td>
                                                            <td style={{ fontSize: '13px' }}>{(ch.entry_fee ?? 0).toLocaleString()}</td>
                                                            <td className="d-none d-md-table-cell" style={{ fontSize: '13px' }}>{ch.max_players ?? '—'}</td>
                                                            <td className="d-none d-md-table-cell" style={{ fontSize: '13px' }}>{(ch.Balance ?? 0).toLocaleString()}</td>
                                                            <td className="d-none d-md-table-cell" style={{ fontSize: '13px' }}>
                                                                {new Date(ch.CreatedAt).toLocaleString('en-KE', {
                                                                    year: 'numeric',
                                                                    month: '2-digit',
                                                                    day: '2-digit',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </td>
                                                        </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="card-footer d-flex justify-content-between align-items-center">
                                        <span style={{ fontSize: '13px' }}>
                                            Page {pagination.page} of {pagination.totalPages} &nbsp;({pagination.totalRows} total)
                                        </span>
                                        <ul className="pagination pagination-sm mb-0">
                                            <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                                                <button className="page-link" onClick={() => setPage(p => p - 1)}>Previous</button>
                                            </li>
                                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                                                <li key={p} className={`page-item ${pagination.page === p ? 'active' : ''}`}>
                                                    <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                                                </li>
                                            ))}
                                            <li className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
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

export default AdminChallenges;
