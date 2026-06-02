import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import { Icons } from '../../components/ui/Icons';

function AdminCentralWallets() {
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/v1/admin/central-wallets')
            .then(res => setWallets(res.data.data ?? []))
            .catch(err => console.error('Error fetching central wallets:', err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <DashboardWrapper>
            <AdminSidebar />
            <div className="cb-main">
                <AdminTopNav />
                <div className="cb-body">
                    <div className="cb-card">
                        <div className="cb-card-head">
                            <Icons.coins size={20} />
                            <h2>Central Wallets</h2>
                            <span className="cb-count">{wallets.length}</span>
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
                                            <th>Currency</th>
                                            <th>Balance</th>
                                            <th>Status</th>
                                            <th>Notes</th>
                                            <th>Last Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {wallets.length === 0 ? (
                                            <tr><td colSpan={7} className="cb-empty">No central wallets found.</td></tr>
                                        ) : wallets.map((wallet, i) => (
                                            <tr key={wallet.WalletCode} style={{ cursor: 'pointer' }}
                                                onClick={() => navigate(`/admin/central-wallets/${wallet.WalletCode}/transactions`)}>
                                                <td className="cb-muted">{i + 1}</td>
                                                <td>
                                                    <span style={{ color: '#3BE089', fontWeight: 700, fontFamily: "'Space Mono',monospace", fontSize: 13 }}>
                                                        {wallet.WalletCode}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="cb-pill grey" style={{ fontSize: 11 }}>{wallet.Currency}</span>
                                                </td>
                                                <td>
                                                    <span className="cb-mono green" style={{ fontSize: 14 }}>
                                                        {wallet.Balance?.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`cb-pill ${wallet.Status === 'active' ? 'green' : 'gold'}`}>
                                                        <span className="dot" />{wallet.Status}
                                                    </span>
                                                </td>
                                                <td className="cb-muted" style={{ fontSize: 13 }}>{wallet.Notes ?? '—'}</td>
                                                <td className="cb-muted" style={{ fontSize: 13 }}>
                                                    {new Date(wallet.UpdatedAt).toLocaleString('en-KE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardWrapper>
    );
}

export default AdminCentralWallets;
