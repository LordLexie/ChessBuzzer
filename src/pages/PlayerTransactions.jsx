import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import TopNav from '../components/layouts/TopNav';
import Sidebar from '../components/layouts/Sidebar';
import DashboardWrapper from '../components/layouts/DashboardWrapper';
import { Icons } from '../components/ui/Icons';

function PlayerTransactions() {
    const { auth } = useAuth();

    const [playerTransactions, setPlayerTransactions] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalRows: 0 });
    const [page, setPage] = useState(1);

    const searchTransactions = (currentPage) => {
        axios.post('/api/v1/transactions', { player_id: auth.user_id, page: currentPage, page_size: 10 })
            .then(response => {
                const { data, page: p, total_pages, total_rows } = response.data;
                setPlayerTransactions(data);
                setPagination({ page: p, totalPages: total_pages, totalRows: total_rows });
            })
            .catch(error => console.error('Error fetching transactions:', error));
    };

    useEffect(() => { searchTransactions(page); }, [page]);

    const goToPage = (newPage) => setPage(newPage);

    return (
        <DashboardWrapper>
            <Sidebar />
            <div className="cb-main">
                <TopNav />
                <div className="cb-body">
                    <div className="cb-card">
                        <div className="cb-card-head">
                            <Icons.swap size={20} />
                            <h2>Transactions</h2>
                            <span className="cb-hint">{pagination.totalRows} total</span>
                        </div>

                        <div className="cb-table-wrap">
                            <table className="cb-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Type</th>
                                        <th>Reference</th>
                                        <th>Narration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {playerTransactions.map((t, i) => (
                                        <tr key={t.ID}>
                                            <td className="cb-muted">{(pagination.page - 1) * 10 + i + 1}</td>
                                            <td className="cb-muted" style={{ fontSize: 13 }}>
                                                {new Date(t.CreatedAt).toLocaleDateString('en-KE')}
                                            </td>
                                            <td>
                                                <span className={`cb-mono ${t.TransactionType?.toLowerCase() === 'credit' ? 'green' : 'coral'}`}>
                                                    {t.Amount}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`cb-pill ${t.TransactionType?.toLowerCase() === 'credit' ? 'green' : 'coral'}`}>
                                                    <span className="dot" />
                                                    {t.TransactionType?.toLowerCase()}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: 13, color: '#8A9D92' }}>{t.Reference}</td>
                                            <td style={{ fontSize: 13 }}>{t.Description}</td>
                                        </tr>
                                    ))}
                                    {playerTransactions.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="cb-empty">No transactions yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {pagination.totalPages > 1 && (
                            <div className="cb-card-foot">
                                <span className="cb-muted" style={{ fontSize: 13, marginRight: 'auto' }}>
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>
                                <button
                                    className="cb-btn cb-btn-ghost"
                                    disabled={pagination.page === 1}
                                    onClick={() => goToPage(pagination.page - 1)}
                                    style={{ padding: '7px 14px', fontSize: 13 }}
                                >
                                    Previous
                                </button>
                                <button
                                    className="cb-btn cb-btn-ghost"
                                    disabled={pagination.page === pagination.totalPages}
                                    onClick={() => goToPage(pagination.page + 1)}
                                    style={{ padding: '7px 14px', fontSize: 13 }}
                                >
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

export default PlayerTransactions;
