import { useState, useEffect } from 'react';
import axios from 'axios';

import DashboardWrapper from '../components/layouts/DashboardWrapper';
import AdminTopNav from '../components/layouts/AdminTopNav';
import AdminSidebar from '../components/layouts/AdminSidebar';
import Aside from '../components/layouts/Aside';
import Footer from '../components/layouts/Footer';

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

    useEffect(() => {
        axios.get('/api/v1/admin/stats').then(res => setStats(res.data));
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
                    </div>
                </div>
            </div>

            <Aside />
            <Footer />
        </DashboardWrapper>
    );
}

export default AdminDashboard;
