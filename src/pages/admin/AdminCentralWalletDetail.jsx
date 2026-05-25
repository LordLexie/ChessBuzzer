import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import Aside from '../../components/layouts/Aside';
import Footer from '../../components/layouts/Footer';

function AdminCentralWalletDetail() {
    const { walletCode } = useParams();
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalRows: 0 });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get(`/api/v1/admin/central-wallets/${walletCode}/transactions?page=${page}&page_size=10`)
            .then(res => {
                setWallet(res.data.wallet ?? null);
                setTransactions(res.data.data ?? []);
                setPagination({
                    page: res.data.page,
                    totalPages: res.data.total_pages,
                    totalRows: res.data.total_rows,
                });
            })
            .catch(err => console.error('Error fetching central wallet transactions:', err))
            .finally(() => setLoading(false));
    }, [walletCode, page]);

    return (
        <DashboardWrapper>
            <AdminTopNav />
            <AdminSidebar />

            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0">Central Wallet Transactions</h1>
                            </div>
                            <div className="col-sm-6 text-right">
                                <Link to="/admin/central-wallets" className="btn btn-sm btn-secondary">
                                    ← Back to Central Wallets
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content">
                    <div className="container-fluid">

                        {wallet && (
                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <div className="small-box bg-info">
                                        <div className="inner">
                                            <h4>{wallet.Currency}</h4>
                                            <p>Currency</p>
                                        </div>
                                        <div className="icon"><i className="fas fa-coins" /></div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="small-box bg-success">
                                        <div className="inner">
                                            <h4>{wallet.Balance?.toLocaleString()}</h4>
                                            <p>Balance</p>
                                        </div>
                                        <div className="icon"><i className="fas fa-wallet" /></div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className={`small-box bg-${wallet.Status === 'active' ? 'success' : 'warning'}`}>
                                        <div className="inner">
                                            <h4 style={{ textTransform: 'capitalize' }}>{wallet.Status}</h4>
                                            <p>Status</p>
                                        </div>
                                        <div className="icon"><i className="fas fa-info-circle" /></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="row">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-body table-responsive p-0">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th className="d-none d-md-table-cell" style={{ fontSize: '14px' }}>#</th>
                                                    <th style={{ fontSize: '14px' }}>Date</th>
                                                    <th className="d-none d-md-table-cell" style={{ fontSize: '14px' }}>Transaction Code</th>
                                                    <th style={{ fontSize: '14px' }}>Type</th>
                                                    <th style={{ fontSize: '14px' }}>Amount</th>
                                                    <th className="d-none d-md-table-cell" style={{ fontSize: '14px' }}>Channel</th>
                                                    <th className="d-none d-md-table-cell" style={{ fontSize: '14px' }}>Party Type</th>
                                                    <th style={{ fontSize: '14px' }}>Party</th>
                                                    <th className="d-none d-lg-table-cell" style={{ fontSize: '14px' }}>Reference</th>
                                                    <th className="d-none d-lg-table-cell" style={{ fontSize: '14px' }}>Description</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan="10" className="text-center py-4">
                                                            <span className="fa fa-spinner fa-spin" /> Loading...
                                                        </td>
                                                    </tr>
                                                ) : transactions.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="10" className="text-center py-4">No transactions found for this wallet.</td>
                                                    </tr>
                                                ) : (
                                                    transactions.map((tx, index) => (
                                                        <tr key={tx.ID}>
                                                            <td className="d-none d-md-table-cell" style={{ fontSize: '13px' }}>{(pagination.page - 1) * 10 + index + 1}</td>
                                                            <td style={{ fontSize: '13px' }}>
                                                                {new Date(tx.TransactionDate).toLocaleString('en-KE', {
                                                                    year: 'numeric',
                                                                    month: '2-digit',
                                                                    day: '2-digit',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </td>
                                                            <td className="d-none d-md-table-cell" style={{ fontSize: '13px' }}>{tx.TransactionCode}</td>
                                                            <td style={{ fontSize: '13px' }}>
                                                                <span className={`badge badge-${tx.TransactionType?.toLowerCase() === 'credit' ? 'success' : 'danger'}`}>
                                                                    {tx.TransactionType?.toLowerCase()}
                                                                </span>
                                                            </td>
                                                            <td style={{ fontSize: '13px' }}>{tx.Amount?.toLocaleString()}</td>
                                                            <td className="d-none d-md-table-cell" style={{ fontSize: '13px' }}>{tx.Channel ?? '—'}</td>
                                                            <td className="d-none d-md-table-cell" style={{ fontSize: '13px' }}>{tx.TransactionPartyType ?? '—'}</td>
                                                            <td style={{ fontSize: '13px' }}>{tx.TransactionParty ?? '—'}</td>
                                                            <td className="d-none d-lg-table-cell" style={{ fontSize: '13px' }}>{tx.Reference ?? '—'}</td>
                                                            <td className="d-none d-lg-table-cell" style={{ fontSize: '13px' }}>{tx.Description ?? '—'}</td>
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

export default AdminCentralWalletDetail;
