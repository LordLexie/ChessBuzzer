import { useState, useEffect } from 'react';
import axios from 'axios';

import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import { Icons } from '../../components/ui/Icons';

function AdminWallets() {
    const [wallets, setWallets] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalRows: 0 });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get(`/api/v1/admin/wallets?page=${page}&page_size=10`)
            .then(res => {
                setWallets(res.data.data ?? []);
                setPagination({
                    page: res.data.page,
                    totalPages: res.data.total_pages,
                    totalRows: res.data.total_rows,
                });
            })
            .catch(err => console.error('Error fetching wallets:', err))
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
                            <Icons.coins size={20} />
                            <h2>Player Wallets</h2>
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
                                            <th>Wallet Code</th>
                                            <th>Player</th>
                                            <th>Type</th>
                                            <th>Currency</th>
                                            <th>Balance</th>
                                            <th>Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {wallets.length === 0 ? (
                                            <tr><td colSpan={7} className="cb-empty">No wallets found.</td></tr>
                                        ) : wallets.map((wallet, i) => (
                                            <tr key={wallet.WalletCode}>
                                                <td className="cb-muted">{(pagination.page - 1) * 10 + i + 1}</td>
                                                <td><span className="cb-mono" style={{ fontSize: 13, color: '#8A9D92' }}>{wallet.WalletCode}</span></td>
                                                <td style={{ fontWeight: 700 }}>{wallet.User?.username ?? wallet.UserID}</td>
                                                <td className="cb-muted" style={{ fontSize: 13 }}>{wallet.WalletType?.Name ?? wallet.WalletTypeCode}</td>
                                                <td>
                                                    <span className="cb-pill grey" style={{ fontSize: 11 }}>{wallet.Currency}</span>
                                                </td>
                                                <td>
                                                    <span className="cb-mono green" style={{ fontSize: 14 }}>
                                                        {wallet.Balance?.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="cb-muted" style={{ fontSize: 13 }}>
                                                    {new Date(wallet.CreatedAt).toLocaleDateString('en-KE', { year: 'numeric', month: '2-digit', day: '2-digit' })}
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

export default AdminWallets;
