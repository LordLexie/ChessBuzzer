import { useState, useEffect } from 'react';
import axios from 'axios';

import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import Aside from '../../components/layouts/Aside';
import Footer from '../../components/layouts/Footer';

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
        if (appliedFilters.dateTo) params.append('date_to', appliedFilters.dateTo);
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

    const applyFilters = () => {
        setPage(1);
        setAppliedFilters({ ...filters });
    };

    const resetFilters = () => {
        setFilters({ dateFrom: '', dateTo: '' });
        setAppliedFilters({ dateFrom: '', dateTo: '' });
        setPage(1);
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
                                    <i className="fas fa-trophy mr-2 text-warning" />
                                    Leaderboard
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content">
                    <div className="container-fluid">

                        <div className="card mb-3">
                            <div className="card-body py-2">
                                <div className="form-row align-items-end">
                                    <div className="form-group col-md-4 mb-0">
                                        <label style={{ fontSize: '13px' }}>From</label>
                                        <input
                                            type="date"
                                            className="form-control form-control-sm"
                                            value={filters.dateFrom}
                                            onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                                        />
                                    </div>
                                    <div className="form-group col-md-4 mb-0">
                                        <label style={{ fontSize: '13px' }}>To</label>
                                        <input
                                            type="date"
                                            className="form-control form-control-sm"
                                            value={filters.dateTo}
                                            onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                                        />
                                    </div>
                                    <div className="form-group col-md-4 mb-0 d-flex" style={{ gap: '8px' }}>
                                        <button className="btn btn-sm btn-primary" onClick={applyFilters}>Apply</button>
                                        <button className="btn btn-sm btn-secondary" onClick={resetFilters}>Reset</button>
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
                                                    <th style={{ fontSize: '14px' }}>Rank</th>
                                                    <th style={{ fontSize: '14px' }}>Avatar</th>
                                                    <th style={{ fontSize: '14px' }}>Username</th>
                                                    <th className="d-none d-md-table-cell" style={{ fontSize: '14px' }}>Name</th>
                                                    <th className="d-none d-md-table-cell" style={{ fontSize: '14px' }}>Country</th>
                                                    <th style={{ fontSize: '14px' }}>Challenges</th>
                                                    <th className="d-none d-md-table-cell" style={{ fontSize: '14px' }}>Joined</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-4">
                                                            <span className="fa fa-spinner fa-spin" /> Loading...
                                                        </td>
                                                    </tr>
                                                ) : entries.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-4">No data found.</td>
                                                    </tr>
                                                ) : (
                                                    entries.map((entry, index) => {
                                                        const rank = (pagination.page - 1) * 10 + index + 1;
                                                        return (
                                                            <tr key={entry.ID}>
                                                                <td style={{ fontSize: '13px', fontWeight: rank <= 3 ? 'bold' : 'normal' }}>
                                                                    {rank === 1 && <i className="fas fa-trophy text-warning mr-1" />}
                                                                    {rank === 2 && <i className="fas fa-medal text-secondary mr-1" />}
                                                                    {rank === 3 && <i className="fas fa-medal text-danger mr-1" style={{ opacity: 0.7 }} />}
                                                                    {rank}
                                                                </td>
                                                                <td>
                                                                    <img
                                                                        src={entry.avatar ?? './assets/dist/img/avatar.png'}
                                                                        alt=""
                                                                        className="img-circle img-size-32 mr-2"
                                                                    />
                                                                </td>
                                                                <td style={{ fontSize: '13px' }}>{entry.username}</td>
                                                                <td className="d-none d-md-table-cell" style={{ fontSize: '13px' }}>{entry.name}</td>
                                                                <td className="d-none d-md-table-cell" style={{ fontSize: '13px' }}>{entry.country}</td>
                                                                <td style={{ fontSize: '13px', fontWeight: 'bold' }}>{entry.challenge_count}</td>
                                                                <td className="d-none d-md-table-cell" style={{ fontSize: '13px' }}>
                                                                    {new Date(entry.CreatedAt).toLocaleString('en-KE', {
                                                                        year: 'numeric',
                                                                        month: '2-digit',
                                                                        day: '2-digit',
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

export default AdminLeaderboard;
