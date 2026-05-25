import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import Aside from '../../components/layouts/Aside';
import Footer from '../../components/layouts/Footer';

function StatCard({ icon, color, label, value }) {
    return (
        <div className={`small-box bg-${color}`}>
            <div className="inner">
                <h3>{value ?? <span className="fa fa-spinner fa-spin" />}</h3>
                <p>{label}</p>
            </div>
            <div className="icon">
                <i className={`fas fa-${icon}`}></i>
            </div>
        </div>
    );
}

function AdminDashboard() {

    const [stats, setStats] = useState(null);
    const [trends, setTrends] = useState([]);

    useEffect(() => {
        axios.get('/api/v1/admin/stats').then(res => setStats(res.data));
    }, []);

    useEffect(() => {
        axios.get('/api/v1/admin/trends')
            .then(res => {
                const data = (res.data.data ?? []).map(t => ({
                    ...t,
                    label: new Date(t.month + '-01').toLocaleString('en-KE', { month: 'short', year: 'numeric' }),
                }));
                setTrends(data);
            })
            .catch(err => console.error('Error fetching trends:', err));
    }, []);

    const kesWallet = stats?.central_wallets?.find(w => w.currency === 'KES');

    return (
        <DashboardWrapper>
            <AdminTopNav />
            <AdminSidebar />

            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0">Dashboard</h1>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-3">
                                <StatCard
                                    icon="users"
                                    color="info"
                                    label="Total Players"
                                    value={stats?.total_players}
                                />
                            </div>
                            <div className="col-md-3">
                                <StatCard
                                    icon="exchange-alt"
                                    color="success"
                                    label="Total Transactions"
                                    value={stats?.total_transactions}
                                />
                            </div>
                            <div className="col-md-3">
                                <StatCard
                                    icon="dollar-sign"
                                    color="warning"
                                    label="Players Balance (KES)"
                                    value={stats ? `KES ${(stats.total_players_balance ?? 0).toLocaleString()}` : null}
                                />
                            </div>
                            <div className="col-md-3">
                                <StatCard
                                    icon="wallet"
                                    color="danger"
                                    label="Central Wallet (KES)"
                                    value={kesWallet ? `KES ${kesWallet.balance.toLocaleString()}` : stats ? '—' : null}
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            <i className="fas fa-chart-line mr-2" />
                                            Player Signups &amp; Challenges — Last 12 Months
                                        </h3>
                                    </div>
                                    <div className="card-body">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={trends}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="signups" name="Signups" stroke="#007bff" dot={false} strokeWidth={2} />
                                                <Line type="monotone" dataKey="challenges" name="Challenges" stroke="#fd7e14" dot={false} strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            <i className="fas fa-chart-bar mr-2" />
                                            Challenge Entry Fees — Last 12 Months
                                        </h3>
                                    </div>
                                    <div className="card-body">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={trends}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                                <Tooltip formatter={(v) => `KES ${v.toLocaleString()}`} />
                                                <Legend />
                                                <Bar dataKey="challenge_amount" name="Entry Fees (KES)" fill="#28a745" />
                                            </BarChart>
                                        </ResponsiveContainer>
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

export default AdminDashboard;
