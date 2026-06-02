import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    LineChart, Line,
    AreaChart, Area,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import { Icons } from '../../components/ui/Icons';

const analyticsApi = axios.create({
    baseURL: import.meta.env.VITE_ANALYTICS_API_URL ?? 'http://localhost:8000',
    headers: { 'X-Service-Key': import.meta.env.VITE_ANALYTICS_SERVICE_KEY ?? '' },
});

const C_ELO  = '#F2C14E';
const C_WIN  = '#3BE089';
const C_LOSS = '#FF6A3D';
const GRID   = '#243029';
const TICK   = '#8A9D92';
const TOOLTIP_STYLE = { background: '#121C18', border: '1px solid #243029', color: '#E8F1EB', borderRadius: 10, fontSize: 13 };

const DAYS = [
    { key: 'all', label: 'All days' },
    { key: 'mon', label: 'Mon' }, { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' }, { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' }, { key: 'sat', label: 'Sat' },
    { key: 'sun', label: 'Sun' },
];

const TIME_RANGES = [
    { key: '24h', label: 'Last 24h', days: 1 },
    { key: '30d', label: 'Last 30 days', days: 30 },
];

function fmtHour(label) {
    return label.replace('am', ' AM').replace('pm', ' PM');
}

function AdminPlayerArchiveProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [user, setUser]        = useState(null);
    const [stats, setStats]      = useState(null);
    const [eloHistory, setElo]   = useState([]);
    const [perfHistory, setPerf] = useState([]);
    const [loading, setLoading]  = useState(true);

    const [timeCache, setTimeCache]     = useState({});
    const [timeLoading, setTimeLoading] = useState(false);
    const [timeRange, setTimeRange]     = useState('30d');
    const [timeDay, setTimeDay]         = useState('all');

    useEffect(() => {
        setLoading(true);
        analyticsApi.get(`/users/${userId}`)
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
            .catch(() => toast.error('Failed to load player profile.'))
            .finally(() => setLoading(false));
    }, [userId]);

    useEffect(() => {
        if (!userId) return;
        if (timeCache[timeRange]) return;
        const rangeDef = TIME_RANGES.find(r => r.key === timeRange);
        setTimeLoading(true);
        analyticsApi.get(`/time-analytics/player/${userId}?range=${rangeDef.days}`)
            .then(res => setTimeCache(prev => ({ ...prev, [timeRange]: res.data.data })))
            .catch(() => {})
            .finally(() => setTimeLoading(false));
    }, [timeRange, userId]); // eslint-disable-line react-hooks/exhaustive-deps

    const timeData   = timeCache[timeRange] ?? null;
    const hourlyData = timeData ? timeData[timeDay] : null;
    const peakEntry  = hourlyData ? hourlyData.reduce((a, b) => b.games > a.games ? b : a) : null;
    const quietEntry = hourlyData ? hourlyData.reduce((a, b) => b.games < a.games ? b : a) : null;

    return (
        <DashboardWrapper>
            <AdminSidebar />
            <div className="cb-main">
                <AdminTopNav />
                <div className="cb-body">
                    {/* Back + header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <button className="cb-back" onClick={() => navigate('/admin/player-archives')}>
                            <Icons.back size={16} /> Back
                        </button>
                        <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 22 }}>
                            {user ? user.username : 'Player Profile'}
                        </h2>
                    </div>

                    {loading ? (
                        <div className="cb-center"><div className="cb-spinner" /></div>
                    ) : (
                        <>
                            {/* KPI stats */}
                            <div className="cb-stats" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                                <div className="cb-stat s-green">
                                    <div className="cb-stat ic"><Icons.trophy size={22} /></div>
                                    <div className="lab">Total Games</div>
                                    <div className="big">{stats?.totalGames ?? '—'}</div>
                                </div>
                                <div className="cb-stat s-green">
                                    <div className="cb-stat ic"><Icons.check size={22} /></div>
                                    <div className="lab">Wins</div>
                                    <div className="big">{stats?.wins ?? '—'}</div>
                                </div>
                                <div className="cb-stat s-coral">
                                    <div className="cb-stat ic"><Icons.crown size={22} /></div>
                                    <div className="lab">Losses</div>
                                    <div className="big">{stats?.losses ?? '—'}</div>
                                </div>
                                <div className="cb-stat s-gold">
                                    <div className="cb-stat ic"><Icons.medal size={22} /></div>
                                    <div className="lab">Draws</div>
                                    <div className="big">{stats?.draws ?? '—'}</div>
                                </div>
                            </div>

                            {/* ELO History */}
                            <div className="cb-card">
                                <div className="cb-card-head">
                                    <Icons.chart size={18} />
                                    <h2>ELO Rating — Last 12 Months</h2>
                                </div>
                                <div className="cb-card-body">
                                    {eloHistory.length === 0 ? (
                                        <div className="cb-empty">No ELO data available yet.</div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={260}>
                                            <LineChart data={eloHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: TICK, angle: -45, textAnchor: 'end' }} height={50} />
                                                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12, fill: TICK }} />
                                                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [v, 'Rating']} />
                                                <Line type="monotone" dataKey="rating" name="Rating" stroke={C_ELO} strokeWidth={2} dot={{ r: 3 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            {/* Performance Trend */}
                            <div className="cb-card">
                                <div className="cb-card-head">
                                    <Icons.chart size={18} />
                                    <h2>Performance Trend — Last 12 Months</h2>
                                </div>
                                <div className="cb-card-body">
                                    {perfHistory.length === 0 ? (
                                        <div className="cb-empty">No performance data available yet.</div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={260}>
                                            <LineChart data={perfHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: TICK, angle: -45, textAnchor: 'end' }} height={50} />
                                                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: TICK }} />
                                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                                <Legend />
                                                <Line type="monotone" dataKey="wins"   name="Wins"   stroke={C_WIN}  strokeWidth={2} dot={{ r: 3 }} />
                                                <Line type="monotone" dataKey="losses" name="Losses" stroke={C_LOSS} strokeWidth={2} dot={{ r: 3 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            {/* Time Distribution */}
                            <div className="cb-card">
                                <div className="cb-card-head">
                                    <Icons.clock size={18} />
                                    <h2>Game Activity — {timeRange === '24h' ? 'Last 24 Hours' : 'Last 30 Days'} (EAT)</h2>
                                    <span className="cb-hint">
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {TIME_RANGES.map(({ key, label }) => (
                                                <button key={key} className={`cb-tab ${timeRange === key ? 'active' : ''}`} onClick={() => setTimeRange(key)}>
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </span>
                                </div>
                                <div className="cb-card-body">
                                    {peakEntry && (
                                        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                                            <span className="cb-pill gold" style={{ fontSize: 12 }}>Peak: {fmtHour(peakEntry.label)}</span>
                                            <span className="cb-pill grey" style={{ fontSize: 12 }}>Quiet: {fmtHour(quietEntry.label)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 18 }}>
                                        {DAYS.map(({ key, label }) => (
                                            <button key={key} className={`cb-tab ${timeDay === key ? 'active' : ''}`} onClick={() => setTimeDay(key)}>
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                    {(timeLoading || !hourlyData) ? (
                                        <div className="cb-center"><div className="cb-spinner" /></div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={260}>
                                            <AreaChart data={hourlyData} margin={{ top: 8, right: 16, left: 0, bottom: 5 }}>
                                                <defs>
                                                    <linearGradient id="playerAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%"  stopColor="#3BE089" stopOpacity={0.35} />
                                                        <stop offset="95%" stopColor="#3BE089" stopOpacity={0.02} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                                                <XAxis dataKey="label" interval={0} tick={{ fill: TICK, fontSize: 9, angle: -45, textAnchor: 'end' }} tickLine={false} axisLine={false} height={50} />
                                                <YAxis tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} tick={{ fill: TICK, fontSize: 11 }} tickLine={false} axisLine={false} />
                                                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [v.toLocaleString(), 'Games']} labelFormatter={l => `Hour: ${fmtHour(l)}`} cursor={{ stroke: '#334155', strokeWidth: 1 }} />
                                                <Area type="monotone" dataKey="games" stroke={C_WIN} strokeWidth={2} fill="url(#playerAreaGrad)" dot={{ fill: C_WIN, r: 2, strokeWidth: 0 }} activeDot={{ r: 4, fill: '#5BE09A', strokeWidth: 0 }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DashboardWrapper>
    );
}

export default AdminPlayerArchiveProfile;
