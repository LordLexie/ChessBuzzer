import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import { Icons } from '../../components/ui/Icons';

const STATUS_PILL = {
    draft:               'grey',
    registration_open:   'green',
    registration_closed: 'gold',
    in_progress:         'green',
    paused:              'gold',
    completed:           'green',
    disbursed:           'green',
    cancelled:           'coral',
};

function StatusPill({ status }) {
    const cls = STATUS_PILL[status] ?? 'grey';
    return (
        <span className={`cb-pill ${cls}`}>
            <span className="dot" />
            {status?.replace(/_/g, ' ')}
        </span>
    );
}

const PAGE_SIZE = 15;

function AdminTournaments() {
    const navigate = useNavigate();
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        axios.get('/api/v1/admin/tournaments')
            .then(res => setTournaments(res.data?.data ?? []))
            .catch(err => console.error('Error fetching tournaments:', err))
            .finally(() => setLoading(false));
    }, []);

    const totalPages = Math.ceil(tournaments.length / PAGE_SIZE);
    const visible = tournaments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const fmt = date => date
        ? new Date(date).toLocaleDateString('en-KE', { year: 'numeric', month: '2-digit', day: '2-digit' })
        : '—';

    return (
        <DashboardWrapper>
            <AdminSidebar />
            <div className="cb-main">
                <AdminTopNav />
                <div className="cb-body">
                    <div className="cb-card">
                        <div className="cb-card-head">
                            <Icons.crown size={20} />
                            <h2>Tournaments</h2>
                            <span className="cb-count">{tournaments.length}</span>
                        </div>
                        <div className="cb-table-wrap">
                            {loading ? (
                                <div className="cb-center"><div className="cb-spinner" /></div>
                            ) : (
                                <table className="cb-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Name</th>
                                            <th>Status</th>
                                            <th>Type</th>
                                            <th>Prize Pool</th>
                                            <th>Participants</th>
                                            <th>Start Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visible.length === 0 ? (
                                            <tr><td colSpan={7} className="cb-empty">No tournaments found.</td></tr>
                                        ) : visible.map((t, i) => (
                                            <tr
                                                key={t.ID}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => navigate(`/admin/tournaments/${t.ID}`)}
                                            >
                                                <td className="cb-muted">{(page - 1) * PAGE_SIZE + i + 1}</td>
                                                <td style={{ fontWeight: 700 }}>{t.name}</td>
                                                <td><StatusPill status={t.status} /></td>
                                                <td className="cb-muted" style={{ textTransform: 'capitalize' }}>{t.tournament_type ?? '—'}</td>
                                                <td>
                                                    <span className="cb-mono green">
                                                        {t.currency?.symbol}{t.prize_pool ?? 0}
                                                    </span>
                                                </td>
                                                <td className="cb-muted">{t.participants?.length ?? 0}</td>
                                                <td className="cb-muted" style={{ fontSize: 13 }}>{fmt(t.start_date)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        {totalPages > 1 && (
                            <div className="cb-card-foot">
                                <span className="cb-muted" style={{ fontSize: 13 }}>
                                    Page {page} of {totalPages}
                                </span>
                                <button className="cb-btn cb-btn-ghost" disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}>
                                    Previous
                                </button>
                                <button className="cb-btn cb-btn-ghost" disabled={page === totalPages}
                                    onClick={() => setPage(p => p + 1)}>
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardWrapper>
    );
}

export default AdminTournaments;
