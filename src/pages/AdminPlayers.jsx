import { useState, useEffect } from 'react';
import axios from 'axios';

import DashboardWrapper from '../components/layouts/DashboardWrapper';
import AdminTopNav from '../components/layouts/AdminTopNav';
import AdminSidebar from '../components/layouts/AdminSidebar';
import Aside from '../components/layouts/Aside';
import Footer from '../components/layouts/Footer';

function AdminPlayers() {
    const [players, setPlayers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalRows: 0 });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get(`/api/v1/admin/players?page=${page}&page_size=10`)
            .then(res => {
                setPlayers(res.data.data ?? []);
                setPagination({
                    page: res.data.page,
                    totalPages: res.data.total_pages,
                    totalRows: res.data.total_rows,
                });
            })
            .catch(err => console.error('Error fetching players:', err))
            .finally(() => setLoading(false));
    }, [page]);

    return (
        <DashboardWrapper>
            <AdminTopNav />
            <AdminSidebar />

            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0">Players</h1>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-body table-responsive p-0">
                                        <table className="table table-hover text-nowrap">
                                            <thead>
                                                <tr>
                                                    <th style={{ fontSize: '14px' }}>#</th>
                                                    <th style={{ fontSize: '14px' }}>Username</th>
                                                    <th style={{ fontSize: '14px' }}>Name</th>
                                                    <th style={{ fontSize: '14px' }}>Email</th>
                                                    <th style={{ fontSize: '14px' }}>Country</th>
                                                    <th style={{ fontSize: '14px' }}>Status</th>
                                                    <th style={{ fontSize: '14px' }}>Joined</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-4">
                                                            <span className="fa fa-spinner fa-spin" /> Loading...
                                                        </td>
                                                    </tr>
                                                ) : players.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-4">No players found.</td>
                                                    </tr>
                                                ) : (
                                                    players.map((player, index) => (
                                                        <tr key={player.ID}>
                                                            <td style={{ fontSize: '13px' }}>{(pagination.page - 1) * 10 + index + 1}</td>
                                                            <td style={{ fontSize: '13px' }}>
                                                                <img
                                                                    src={player.avatar ?? './assets/dist/img/avatar.png'}
                                                                    alt=""
                                                                    className="img-circle img-size-32 mr-2"
                                                                />
                                                                {player.username}
                                                            </td>
                                                            <td style={{ fontSize: '13px' }}>{player.name}</td>
                                                            <td style={{ fontSize: '13px' }}>{player.email}</td>
                                                            <td style={{ fontSize: '13px' }}>{player.country}</td>
                                                            <td style={{ fontSize: '13px' }}>
                                                                <span className={`badge badge-${player.status === 'active' ? 'success' : 'warning'}`}>
                                                                    {player.status}
                                                                </span>
                                                            </td>
                                                            <td style={{ fontSize: '13px' }}>
                                                                {new Date(player.CreatedAt).toLocaleString('en-KE', {
                                                                    year: 'numeric',
                                                                    month: '2-digit',
                                                                    day: '2-digit',
                                                                })}
                                                            </td>
                                                        </tr>
                                                    ))
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

export default AdminPlayers;
