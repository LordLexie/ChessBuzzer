import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import Aside from '../../components/layouts/Aside';
import Footer from '../../components/layouts/Footer';

function AdminCentralWallets() {
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/v1/admin/central-wallets')
            .then(res => setWallets(res.data.data ?? []))
            .catch(err => console.error('Error fetching central wallets:', err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <DashboardWrapper>
            <AdminTopNav />
            <AdminSidebar />

            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0">Central Wallets</h1>
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
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th className="d-none d-md-table-cell" style={{ fontSize: '14px' }}>#</th>
                                                    <th className="d-none d-md-table-cell" style={{ fontSize: '14px' }}>Wallet Code</th>
                                                    <th style={{ fontSize: '14px' }}>Currency</th>
                                                    <th style={{ fontSize: '14px' }}>Balance</th>
                                                    <th style={{ fontSize: '14px' }}>Status</th>
                                                    <th className="d-none d-md-table-cell" style={{ fontSize: '14px' }}>Notes</th>
                                                    <th style={{ fontSize: '14px' }}>Last Updated</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-4">
                                                            <span className="fa fa-spinner fa-spin" /> Loading...
                                                        </td>
                                                    </tr>
                                                ) : wallets.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-4">No central wallets found.</td>
                                                    </tr>
                                                ) : (
                                                    wallets.map((wallet, index) => (
                                                        <tr key={wallet.WalletCode}>
                                                            <td className="d-none d-md-table-cell" style={{ fontSize: '13px' }}>{index + 1}</td>
                                                            <td className="d-none d-md-table-cell" style={{ fontSize: '13px' }}>
                                                                <Link to={`/admin/central-wallets/${wallet.WalletCode}/transactions`}>
                                                                    {wallet.WalletCode}
                                                                </Link>
                                                            </td>
                                                            <td style={{ fontSize: '13px' }}>
                                                                <span className="badge badge-secondary">{wallet.Currency}</span>
                                                            </td>
                                                            <td style={{ fontSize: '13px' }}>{wallet.Balance.toLocaleString()}</td>
                                                            <td style={{ fontSize: '13px' }}>
                                                                <span className={`badge badge-${wallet.Status === 'active' ? 'success' : 'warning'}`}>
                                                                    {wallet.Status}
                                                                </span>
                                                            </td>
                                                            <td className="d-none d-md-table-cell" style={{ fontSize: '13px' }}>{wallet.Notes ?? '—'}</td>
                                                            <td style={{ fontSize: '13px' }}>
                                                                {new Date(wallet.UpdatedAt).toLocaleString('en-KE', {
                                                                    year: 'numeric',
                                                                    month: '2-digit',
                                                                    day: '2-digit',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
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

export default AdminCentralWallets;
