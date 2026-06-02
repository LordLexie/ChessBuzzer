import { useState, useEffect } from 'react';
import axios from 'axios';

import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import { Icons } from '../../components/ui/Icons';

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
            <AdminSidebar />
            <div className="cb-main">
                <AdminTopNav />
                <div className="cb-body">
                    <div className="cb-card">
                        <div className="cb-card-head">
                            <Icons.users size={20} />
                            <h2>Players</h2>
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
                                            <th>Username</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Country</th>
                                            <th>Status</th>
                                            <th>Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {players.length === 0 ? (
                                            <tr><td colSpan={7} className="cb-empty">No players found.</td></tr>
                                        ) : players.map((player, index) => (
                                            <tr key={player.ID}>
                                                <td className="cb-muted">{(pagination.page - 1) * 10 + index + 1}</td>
                                                <td>
                                                    <div className="cb-user">
                                                        <div className="cb-user-av" style={{ background: 'linear-gradient(150deg,#3BE089,#1E8A52)' }}>
                                                            {player.username?.[0]?.toUpperCase() ?? '?'}
                                                        </div>
                                                        <span style={{ fontWeight: 700 }}>{player.username}</span>
                                                    </div>
                                                </td>
                                                <td className="cb-muted">{player.name || '—'}</td>
                                                <td className="cb-muted" style={{ fontSize: 13 }}>{player.email}</td>
                                                <td className="cb-muted">{player.country || '—'}</td>
                                                <td>
                                                    <span className={`cb-pill ${player.status === 'active' ? 'green' : 'gold'}`}>
                                                        <span className="dot" />{player.status}
                                                    </span>
                                                </td>
                                                <td className="cb-muted" style={{ fontSize: 13 }}>
                                                    {new Date(player.CreatedAt).toLocaleDateString('en-KE', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                                </td>
                                            </tr>
                                        ))}
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
                                    onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                                    Previous
                                </button>
                                <button className="cb-btn cb-btn-ghost" style={{ padding: '5px 14px', fontSize: 13 }}
                                    onClick={() => setPage(p => p + 1)} disabled={page === pagination.totalPages}>
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardWrapper>
    );
}

export default AdminPlayers;
