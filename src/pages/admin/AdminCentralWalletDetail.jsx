import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import { Icons } from '../../components/ui/Icons';

function AdminCentralWalletDetail() {
    const { walletCode } = useParams();
    const navigate = useNavigate();
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
            <AdminSidebar />
            <div className="cb-main">
                <AdminTopNav />
                <div className="cb-body">
                    {/* Back + header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <button className="cb-back" onClick={() => navigate('/admin/central-wallets')}>
                            <Icons.back size={16} /> Back
                        </button>
                        <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 22 }}>
                            Central Wallet — <span style={{ color: '#3BE089' }}>{walletCode}</span>
                        </h2>
                    </div>

                    {/* Wallet stat cards */}
                    {wallet && (
                        <div className="cb-stats" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                            <div className="cb-stat s-gold">
                                <div className="cb-stat ic"><Icons.coins size={22} /></div>
                                <div className="lab">Currency</div>
                                <div className="big" style={{ fontSize: 30 }}>{wallet.Currency}</div>
                            </div>
                            <div className="cb-stat s-green">
                                <div className="cb-stat ic"><Icons.coins size={22} /></div>
                                <div className="lab">Balance</div>
                                <div className="big">{wallet.Balance?.toLocaleString()}</div>
                            </div>
                            <div className={`cb-stat ${wallet.Status === 'active' ? 's-green' : 's-gold'}`}>
                                <div className="cb-stat ic"><Icons.check size={22} /></div>
                                <div className="lab">Status</div>
                                <div className="big" style={{ fontSize: 22, textTransform: 'capitalize' }}>{wallet.Status}</div>
                            </div>
                        </div>
                    )}

                    {/* Transactions table */}
                    <div className="cb-card">
                        <div className="cb-card-head">
                            <Icons.swap size={18} />
                            <h2>Transactions</h2>
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
                                            <th>Date</th>
                                            <th>Tx Code</th>
                                            <th>Type</th>
                                            <th>Amount</th>
                                            <th>Channel</th>
                                            <th>Party Type</th>
                                            <th>Party</th>
                                            <th>Reference</th>
                                            <th>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.length === 0 ? (
                                            <tr><td colSpan={10} className="cb-empty">No transactions found for this wallet.</td></tr>
                                        ) : transactions.map((tx, i) => {
                                            const isCredit = tx.TransactionType?.toLowerCase() === 'credit';
                                            return (
                                                <tr key={tx.ID}>
                                                    <td className="cb-muted">{(pagination.page - 1) * 10 + i + 1}</td>
                                                    <td className="cb-muted" style={{ fontSize: 13 }}>
                                                        {new Date(tx.TransactionDate).toLocaleString('en-KE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td><span className="cb-mono" style={{ fontSize: 12, color: '#8A9D92' }}>{tx.TransactionCode}</span></td>
                                                    <td>
                                                        <span className={`cb-pill ${isCredit ? 'green' : 'coral'}`}>
                                                            <span className="dot" />{tx.TransactionType?.toLowerCase()}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`cb-mono ${isCredit ? 'green' : 'coral'}`} style={{ fontSize: 14 }}>
                                                            {tx.Amount?.toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td className="cb-muted" style={{ fontSize: 13 }}>{tx.Channel ?? '—'}</td>
                                                    <td className="cb-muted" style={{ fontSize: 13 }}>{tx.TransactionPartyType ?? '—'}</td>
                                                    <td className="cb-muted" style={{ fontSize: 13 }}>{tx.TransactionParty ?? '—'}</td>
                                                    <td className="cb-muted" style={{ fontSize: 13 }}>{tx.Reference ?? '—'}</td>
                                                    <td className="cb-muted" style={{ fontSize: 13 }}>{tx.Description ?? '—'}</td>
                                                </tr>
                                            );
                                        })}
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

export default AdminCentralWalletDetail;
