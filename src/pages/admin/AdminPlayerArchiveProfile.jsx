import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
    LineChart, Line,
    AreaChart, Area,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import Aside from '../../components/layouts/Aside';
import Footer from '../../components/layouts/Footer';

const analyticsApi = axios.create({
    baseURL: import.meta.env.VITE_ANALYTICS_API_URL ?? 'http://localhost:8000',
    headers: { 'X-Service-Key': import.meta.env.VITE_ANALYTICS_SERVICE_KEY ?? '' },
});

const COLOR_ELO  = '#6f42c1';
const COLOR_WIN  = '#28a745';
const COLOR_LOSS = '#dc3545';

const DAYS = [
    { key: 'all', label: 'All days' },
    { key: 'mon', label: 'Mon' }, { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' }, { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' }, { key: 'sat', label: 'Sat' },
    { key: 'sun', label: 'Sun' },
];

const TIME_RANGES = [
    { key: '24h', label: 'Last 24h',   days: 1  },
    { key: '30d', label: 'Last 30 days', days: 30 },
];

function fmtHour(label) {
    return label.replace('am', ' AM').replace('pm', ' PM');
}

function StatCard({ icon, color, label, value }) {
    return (
        <div className={`small-box bg-${color}`}>
            <div className="inner">
                <h3>{value ?? <i className="fas fa-spinner fa-spin" />}</h3>
                <p>{label}</p>
            </div>
            <div className="icon">
                <i className={`fas fa-${icon}`}></i>
            </div>
        </div>
    );
}

function AdminPlayerArchiveProfile() {
    const { userId } = useParams();

    const [user, setUser]        = useState(null);
    const [stats, setStats]      = useState(null);
    const [eloHistory, setElo]   = useState([]);
    const [perfHistory, setPerf] = useState([]);
    const [loading, setLoading]  = useState(true);

    // Time-distribution chart
    const [timeCache, setTimeCache]     = useState({});   // { '24h': DayBreakdown, '30d': DayBreakdown }
    const [timeLoading, setTimeLoading] = useState(false);
    const [timeRange, setTimeRange]     = useState('30d');
    const [timeDay, setTimeDay]         = useState('all');

    // Main profile load
    useEffect(() => {
        setLoading(true);
        analyticsApi
            .get(`/users/${userId}`)
            .then(res => {
                const u = res.data;
                setUser(u);
                return analyticsApi.get(`/analytics/by-username/${u.username}`);
            })
            .then(r => {
                const d = r.data;
                setStats({
                    totalGames: d.kpi.totalGames,
                    wins:       d.kpi.totalWins,
                    losses:     d.kpi.totalLosses,
                    draws:      d.kpi.totalDraws,
                });
                setElo(d.eloHistory.slice(-12));
                setPerf(d.gameHistory.slice(-12).map(p => ({
                    month:  p.month,
                    wins:   p.wins,
                    losses: p.losses,
                })));
            })
            .catch(() => {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load player profile.' });
            })
            .finally(() => setLoading(false));
    }, [userId]);

    // Time-chart fetch — runs on mount and when timeRange changes; caches results
    useEffect(() => {
        if (!userId) return;
        if (timeCache[timeRange]) return;   // already have it

        const rangeDef = TIME_RANGES.find(r => r.key === timeRange);
        setTimeLoading(true);
        analyticsApi
            .get(`/time-analytics/player/${userId}?range=${rangeDef.days}`)
            .then(res => setTimeCache(prev => ({ ...prev, [timeRange]: res.data.data })))
            .catch(() => {})
            .finally(() => setTimeLoading(false));
    }, [timeRange, userId]); // eslint-disable-line react-hooks/exhaustive-deps

    // Derived time-chart values
    const timeData   = timeCache[timeRange] ?? null;
    const hourlyData = timeData ? timeData[timeDay] : null;
    const peakEntry  = hourlyData ? hourlyData.reduce((a, b) => b.games > a.games ? b : a) : null;
    const quietEntry = hourlyData ? hourlyData.reduce((a, b) => b.games < a.games ? b : a) : null;

    const rangeTitle = timeRange === '24h' ? 'Last 24 Hours' : 'Last 30 Days';

    return (
        <DashboardWrapper>
            <AdminTopNav />
            <AdminSidebar />

            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0">
                                    {user?.profile_picture && (
                                        <img
                                            src={user.profile_picture}
                                            alt=""
                                            className="img-circle img-size-32 mr-2"
                                            onError={e => { e.target.style.display = 'none'; }}
                                        />
                                    )}
                                    <i className={`fas fa-user mr-2 ${user?.profile_picture ? 'd-none' : ''}`}></i>
                                    {user ? user.username : 'Player Profile'}
                                </h1>
                            </div>
                            <div className="col-sm-6 text-right">
                                <Link to="/admin/player-archives" className="btn btn-sm btn-outline-secondary">
                                    <i className="fas fa-arrow-left mr-1"></i> Back to Player Archives
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content">
                    <div className="container-fluid">

                        {loading && (
                            <div className="text-center py-5">
                                <i className="fas fa-spinner fa-spin fa-2x text-muted"></i>
                                <p className="mt-2 text-muted">Loading profile…</p>
                            </div>
                        )}

                        {!loading && (<>

                        {/* Row 1 — KPI Cards */}
                        <div className="row">
                            <div className="col-6 col-md-3">
                                <StatCard icon="chess"        color="info"      label="Total Games" value={stats?.totalGames} />
                            </div>
                            <div className="col-6 col-md-3">
                                <StatCard icon="trophy"       color="success"   label="Wins"        value={stats?.wins} />
                            </div>
                            <div className="col-6 col-md-3">
                                <StatCard icon="times-circle" color="danger"    label="Losses"      value={stats?.losses} />
                            </div>
                            <div className="col-6 col-md-3">
                                <StatCard icon="handshake"    color="secondary" label="Draws"       value={stats?.draws} />
                            </div>
                        </div>

                        {/* Row 2 — ELO Rating History */}
                        <div className="row">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            <i className="fas fa-chart-line mr-2"></i>
                                            ELO Rating — Last 12 Months
                                        </h3>
                                        <div className="card-tools">
                                            <button type="button" className="btn btn-tool" data-card-widget="collapse">
                                                <i className="fas fa-minus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        {eloHistory.length === 0 ? (
                                            <div className="text-center text-muted py-4">
                                                <i className="fas fa-chart-line fa-2x mb-2 d-block"></i>
                                                No ELO data available yet.
                                            </div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height={260}>
                                                <LineChart data={eloHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                                                    <XAxis dataKey="month" tick={{ fontSize: 11, angle: -45, textAnchor: 'end' }} height={50} />
                                                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
                                                    <Tooltip formatter={v => [v, 'Rating']} />
                                                    <Line type="monotone" dataKey="rating" name="Rating"
                                                          stroke={COLOR_ELO} strokeWidth={2} dot={{ r: 3 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Row 3 — Performance Trend */}
                        <div className="row">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            <i className="fas fa-chart-line mr-2"></i>
                                            Performance Trend — Last 12 Months
                                        </h3>
                                        <div className="card-tools">
                                            <button type="button" className="btn btn-tool" data-card-widget="collapse">
                                                <i className="fas fa-minus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        {perfHistory.length === 0 ? (
                                            <div className="text-center text-muted py-4">
                                                <i className="fas fa-chart-line fa-2x mb-2 d-block"></i>
                                                No performance data available yet.
                                            </div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height={260}>
                                                <LineChart data={perfHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                                                    <XAxis dataKey="month" tick={{ fontSize: 11, angle: -45, textAnchor: 'end' }} height={50} />
                                                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Line type="monotone" dataKey="wins"   name="Wins"
                                                          stroke={COLOR_WIN}  strokeWidth={2} dot={{ r: 3 }} />
                                                    <Line type="monotone" dataKey="losses" name="Losses"
                                                          stroke={COLOR_LOSS} strokeWidth={2} dot={{ r: 3 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Row 4 — Time Distribution */}
                        <div className="row">
                            <div className="col-md-12">
                                <div style={{
                                    background: '#0d1117',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    border: '1px solid #1e293b',
                                    marginBottom: '16px',
                                }}>

                                    {/* Header row: title + range toggle */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                                        <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '15px' }}>
                                            <i className="fas fa-clock mr-2" style={{ color: '#3b82f6' }}></i>
                                            Game Activity — {rangeTitle} (EAT)
                                        </span>

                                        {/* Range toggle */}
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            {TIME_RANGES.map(({ key, label }) => (
                                                <button
                                                    key={key}
                                                    onClick={() => setTimeRange(key)}
                                                    style={{
                                                        background: timeRange === key ? '#3b82f6' : '#1e293b',
                                                        color:      timeRange === key ? '#fff'    : '#94a3b8',
                                                        border: 'none', borderRadius: '20px',
                                                        padding: '4px 12px', cursor: 'pointer',
                                                        fontSize: '11px', fontWeight: 500,
                                                        transition: 'background 0.15s, color 0.15s',
                                                    }}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Peak / Quiet badges row */}
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                                        {peakEntry && (
                                            <span style={{ background: '#1e293b', color: '#60a5fa', borderRadius: '6px', padding: '3px 10px', fontSize: '12px' }}>
                                                Peak: {fmtHour(peakEntry.label)}
                                            </span>
                                        )}
                                        {quietEntry && (
                                            <span style={{ background: '#1e293b', color: '#94a3b8', borderRadius: '6px', padding: '3px 10px', fontSize: '12px' }}>
                                                Quiet: {fmtHour(quietEntry.label)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Day filter pills */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '18px' }}>
                                        {DAYS.map(({ key, label }) => (
                                            <button
                                                key={key}
                                                onClick={() => setTimeDay(key)}
                                                style={{
                                                    background: timeDay === key ? '#3b82f6' : '#1e293b',
                                                    color:      timeDay === key ? '#fff'    : '#94a3b8',
                                                    border: 'none', borderRadius: '20px',
                                                    padding: '5px 13px', cursor: 'pointer',
                                                    fontSize: '12px', fontWeight: 500,
                                                    transition: 'background 0.15s, color 0.15s',
                                                }}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Chart or spinner */}
                                    {(timeLoading || !hourlyData) ? (
                                        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="fas fa-spinner fa-spin fa-2x" style={{ color: '#3b82f6' }}></i>
                                        </div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={260}>
                                            <AreaChart data={hourlyData} margin={{ top: 8, right: 16, left: 0, bottom: 5 }}>
                                                <defs>
                                                    <linearGradient id="playerAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.35} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                                <XAxis
                                                    dataKey="label"
                                                    interval={0}
                                                    tick={{ fill: '#64748b', fontSize: 9, angle: -45, textAnchor: 'end' }}
                                                    tickLine={false} axisLine={false} height={50}
                                                />
                                                <YAxis
                                                    tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
                                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                                    tickLine={false} axisLine={false}
                                                />
                                                <Tooltip
                                                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                                                    labelStyle={{ color: '#94a3b8' }}
                                                    formatter={v => [v.toLocaleString(), 'Games']}
                                                    labelFormatter={l => `Hour: ${fmtHour(l)}`}
                                                    cursor={{ stroke: '#334155', strokeWidth: 1 }}
                                                />
                                                <Area
                                                    type="monotone" dataKey="games"
                                                    stroke="#3b82f6" strokeWidth={2}
                                                    fill="url(#playerAreaGrad)"
                                                    dot={{ fill: '#3b82f6', r: 2, strokeWidth: 0 }}
                                                    activeDot={{ r: 4, fill: '#60a5fa', strokeWidth: 0 }}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        </div>

                        </>)}

                    </div>
                </div>
            </div>

            <Aside />
            <Footer />
        </DashboardWrapper>
    );
}

export default AdminPlayerArchiveProfile;
