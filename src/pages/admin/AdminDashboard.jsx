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
import { Icons } from '../../components/ui/Icons';

const GRID = '#243029';
const TICK = '#8A9D92';
const TOOLTIP = { background: '#121C18', border: '1px solid #243029', color: '#E8F1EB', borderRadius: 10 };

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
            <AdminSidebar />
            <div className="cb-main">
                <AdminTopNav />
                <div className="cb-body">
                    {/* KPI stats */}
                    <div className="cb-stats" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                        <div className="cb-stat s-green">
                            <div className="cb-stat ic"><Icons.users size={22} /></div>
                            <div className="lab">Total Players</div>
                            <div className="big">{stats?.total_players ?? '—'}</div>
                        </div>
                        <div className="cb-stat s-gold">
                            <div className="cb-stat ic"><Icons.swap size={22} /></div>
                            <div className="lab">Total Transactions</div>
                            <div className="big">{stats?.total_transactions ?? '—'}</div>
                        </div>
                        <div className="cb-stat s-coral">
                            <div className="cb-stat ic"><Icons.coins size={22} /></div>
                            <div className="lab">Players Balance (KES)</div>
                            <div className="big" style={{ fontSize: 28 }}>
                                {stats ? (stats.total_players_balance ?? 0).toLocaleString() : '—'}
                            </div>
                            <div className="sub">KES</div>
                        </div>
                        <div className="cb-stat s-green">
                            <div className="cb-stat ic"><Icons.coins size={22} /></div>
                            <div className="lab">Central Wallet (KES)</div>
                            <div className="big" style={{ fontSize: 28 }}>
                                {kesWallet ? kesWallet.balance.toLocaleString() : stats ? '—' : '—'}
                            </div>
                            <div className="sub">KES</div>
                        </div>
                    </div>

                    {/* Signups & Challenges trend */}
                    <div className="cb-card">
                        <div className="cb-card-head">
                            <Icons.chart size={18} />
                            <h2>Player Signups &amp; Challenges — Last 12 Months</h2>
                        </div>
                        <div className="cb-card-body">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={trends}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: TICK }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: TICK }} />
                                    <Tooltip contentStyle={TOOLTIP} />
                                    <Legend />
                                    <Line type="monotone" dataKey="signups" name="Signups" stroke="#3BE089" dot={false} strokeWidth={2} />
                                    <Line type="monotone" dataKey="challenges" name="Challenges" stroke="#F2C14E" dot={false} strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Entry fees bar chart */}
                    <div className="cb-card">
                        <div className="cb-card-head">
                            <Icons.chart size={18} />
                            <h2>Challenge Entry Fees — Last 12 Months</h2>
                        </div>
                        <div className="cb-card-body">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={trends}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: TICK }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: TICK }} />
                                    <Tooltip contentStyle={TOOLTIP} formatter={v => `KES ${v.toLocaleString()}`} />
                                    <Legend />
                                    <Bar dataKey="challenge_amount" name="Entry Fees (KES)" fill="#3BE089" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardWrapper>
    );
}

export default AdminDashboard;
