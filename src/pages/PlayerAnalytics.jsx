import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import TopNav from '../components/layouts/TopNav';
import Sidebar from '../components/layouts/Sidebar';
import DashboardWrapper from '../components/layouts/DashboardWrapper';
import { Icons } from '../components/ui/Icons';
import {
    Cell, LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const C_WIN   = '#3BE089';
const C_LOSS  = '#FF6A3D';
const C_DRAW  = '#8A9D92';
const C_ELO   = '#F2C14E';
const C_BLITZ = '#5BB4F8';
const GRID    = '#243029';
const TICK    = '#8A9D92';

const DAY_META = {
    Monday:    {}, Tuesday: {}, Wednesday: {}, Thursday: {},
    Friday:    {}, Saturday: {}, Sunday: {},
};
const TIME_META = {
    Morning:      { timeRange: '6:00am – Noon' },
    Afternoon:    { timeRange: 'Noon – 6:00pm' },
    Evening:      { timeRange: '6:00pm – Midnight' },
    'Late Night': { timeRange: 'Midnight – 6:00am' },
};
const LOSS_META = {
    Timeout: {}, Checkmated: {}, Resigned: {}, Abandoned: {},
};

function StatCard({ icon, color, label, value }) {
    const colorMap = { green: 's-green', gold: 's-gold', coral: 's-coral', blue: 's-blue' };
    const iconMap  = { green: <Icons.trophy size={20} />, gold: <Icons.chart size={20} />, coral: <Icons.x size={20} />, blue: <Icons.grid size={20} /> };
    return (
        <div className={`cb-stat ${colorMap[color] || 's-green'}`}>
            <div className="ic">{icon || iconMap[color]}</div>
            <div className="lab">{label}</div>
            <div className="big">{value ?? '—'}</div>
        </div>
    );
}

function PlayerAnalytics() {
    const { auth } = useAuth();
    const userId = auth?.user_id;

    const [integrated, setIntegrated]     = useState(null);
    const [integrating, setIntegrating]   = useState(false);
    const [distributionRange, setDistributionRange] = useState('');
    const distRangeReady = useRef(false);

    const [kpi, setKpi]               = useState(null);
    const [eloHistory, setEloHistory] = useState([]);
    const [gameHistory, setGameHistory] = useState([]);
    const [timeControls, setTimeControls] = useState([]);
    const [colorWinRate, setColorWinRate] = useState([]);
    const [topOpenings, setTopOpenings]   = useState([]);
    const [lossBreakdown, setLossBreakdown] = useState([]);
    const [dayDist, setDayDist]         = useState([]);
    const [timeDist, setTimeDist]       = useState([]);
    const [milestones, setMilestones]   = useState(null);

    const loadAnalytics = (data) => {
        setKpi(data.kpi);
        setEloHistory(data.eloHistory);
        setGameHistory(data.gameHistory);
        setTimeControls(data.timeControls);
        setColorWinRate(data.colorWinRate);
        setTopOpenings(data.topOpenings);
        setLossBreakdown(data.lossBreakdown.map(r => ({ ...r, ...LOSS_META[r.type] })));
        setDayDist(data.dayDistribution.map(r => ({ ...r, ...DAY_META[r.day] })));
        setTimeDist(data.timeDistribution.map(r => ({ ...r, ...TIME_META[r.period] })));
        setMilestones(data.milestones);
        setIntegrated(true);
    };

    useEffect(() => {
        axios.get(`api/v1/user/${userId}`)
            .then(res => {
                if (res.data.data.analytics_key) {
                    return axios.get('api/v1/analytics').then(r => loadAnalytics(r.data.data));
                }
                setIntegrated(false);
            })
            .catch(() => { toast.error('Failed to load analytics.'); setIntegrated(false); });
    }, [userId]);

    useEffect(() => {
        if (!distRangeReady.current) { distRangeReady.current = true; return; }
        if (integrated !== true) return;
        const params = distributionRange ? `?range=${distributionRange}` : '';
        axios.get(`api/v1/analytics${params}`)
            .then(res => {
                const d = res.data.data;
                setDayDist(d.dayDistribution.map(r => ({ ...r, ...DAY_META[r.day] })));
                setTimeDist(d.timeDistribution.map(r => ({ ...r, ...TIME_META[r.period] })));
            })
            .catch(() => {});
    }, [distributionRange]);

    const RANGES = [['1w', '1W'], ['1m', '1M'], ['1y', '1Y'], ['', 'All']];

    const handleIntegrate = () => {
        setIntegrating(true);
        axios.post('api/v1/analytics/integrate')
            .then(() => axios.get('api/v1/analytics'))
            .then(res => loadAnalytics(res.data.data))
            .catch(() => toast.error('Could not connect to analytics service.'))
            .finally(() => setIntegrating(false));
    };

    if (integrated === null) {
        return (
            <DashboardWrapper>
                <Sidebar />
                <div className="cb-main"><TopNav />
                    <div className="cb-body"><div className="cb-center"><div className="cb-spinner" /></div></div>
                </div>
            </DashboardWrapper>
        );
    }

    if (integrated === false) {
        return (
            <DashboardWrapper>
                <Sidebar />
                <div className="cb-main"><TopNav />
                    <div className="cb-body">
                        <div style={{ maxWidth: 480 }}>
                            <div className="cb-card">
                                <div className="cb-card-body" style={{ textAlign: 'center', padding: '48px 32px' }}>
                                    <div style={{ fontSize: 48, marginBottom: 18 }}>♟</div>
                                    <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 10 }}>
                                        Connect Your Analytics
                                    </div>
                                    <p className="cb-muted" style={{ marginBottom: 24 }}>
                                        Your account isn't connected to the analytics service yet.
                                        Click below to set it up — it only takes a second.
                                    </p>
                                    <button className="cb-btn cb-btn-primary" onClick={handleIntegrate} disabled={integrating}>
                                        {integrating ? <><span className="cb-spinner sm" /> Connecting…</> : 'Connect Now'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardWrapper>
        );
    }

    const chartProps = {
        grid:    <CartesianGrid strokeDasharray="3 3" stroke={GRID} />,
        xAxis:   (key) => <XAxis dataKey={key} tick={{ fontSize: 11, fill: TICK, angle: -45, textAnchor: 'end' }} height={50} />,
        yAxis:   <YAxis tick={{ fontSize: 12, fill: TICK }} />,
        tooltip: <Tooltip contentStyle={{ background: '#121C18', border: '1px solid #243029', color: '#E8F1EB', borderRadius: 10 }} />,
    };

    return (
        <DashboardWrapper>
            <Sidebar />
            <div className="cb-main">
                <TopNav />
                <div className="cb-body">

                    {/* KPI row */}
                    <div className="cb-stats" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                        <StatCard color="blue"  label="Total Games" value={kpi?.totalGames} icon={<Icons.grid size={20} />} />
                        <StatCard color="green" label="Wins"        value={kpi?.totalWins} />
                        <StatCard color="coral" label="Losses"      value={kpi?.totalLosses} />
                        <StatCard color="gold"  label="Draws"       value={kpi?.totalDraws} icon={<Icons.medal size={20} />} />
                    </div>

                    {/* Charts row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 26 }}>
                        {/* Left column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>

                            {/* ELO History */}
                            <div className="cb-card">
                                <div className="cb-card-head"><Icons.chart size={20} /><h2>ELO Rating History</h2></div>
                                <div className="cb-card-body">
                                    <ResponsiveContainer width="100%" height={220}>
                                        <LineChart data={eloHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                            {chartProps.grid}
                                            {chartProps.xAxis('month')}
                                            {chartProps.yAxis}
                                            {chartProps.tooltip}
                                            <Line type="monotone" dataKey="rating" stroke={C_ELO} strokeWidth={2} dot={{ r: 3 }} name="Rating" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Performance Trends */}
                            <div className="cb-card">
                                <div className="cb-card-head"><Icons.bar size={20} /><h2>Performance Trends</h2></div>
                                <div className="cb-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={gameHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                            {chartProps.grid}
                                            {chartProps.xAxis('month')}
                                            {chartProps.yAxis}
                                            {chartProps.tooltip}
                                            <Legend wrapperStyle={{ color: TICK, fontSize: 13 }} />
                                            <Line type="monotone" dataKey="wins"   stroke={C_WIN}  strokeWidth={2} dot={{ r: 3 }} name="Wins" />
                                            <Line type="monotone" dataKey="losses" stroke={C_LOSS} strokeWidth={2} dot={{ r: 3 }} name="Losses" />
                                            <Line type="monotone" dataKey="draws"  stroke={C_DRAW} strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} name="Draws" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={gameHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                            {chartProps.grid}
                                            {chartProps.xAxis('month')}
                                            {chartProps.yAxis}
                                            {chartProps.tooltip}
                                            <Legend wrapperStyle={{ color: TICK, fontSize: 13 }} />
                                            <Bar dataKey="wins"   stackId="a" fill={C_WIN}  name="Wins" />
                                            <Bar dataKey="losses" stackId="a" fill={C_LOSS} name="Losses" />
                                            <Bar dataKey="draws"  stackId="a" fill={C_DRAW} name="Draws" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Day Distribution */}
                            <div className="cb-card">
                                <div className="cb-card-head">
                                    <Icons.calendar size={20} />
                                    <h2>Games by Day</h2>
                                    <span className="cb-hint" style={{ display: 'flex', gap: 6 }}>
                                        {RANGES.map(([val, label]) => (
                                            <button key={val}
                                                className={`cb-tab ${distributionRange === val ? 'active' : ''}`}
                                                style={{ padding: '3px 10px', fontSize: 12 }}
                                                onClick={() => setDistributionRange(val)}>{label}</button>
                                        ))}
                                    </span>
                                </div>
                                <div className="cb-table-wrap">
                                    <table className="cb-table">
                                        <thead>
                                            <tr>
                                                <th>Day</th>
                                                <th style={{ textAlign: 'center' }}>Games</th>
                                                <th style={{ textAlign: 'center' }}>Wins</th>
                                                <th style={{ textAlign: 'center' }}>Losses</th>
                                                <th style={{ textAlign: 'center' }}>Draws</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dayDist.map((row, i) => (
                                                <tr key={i}>
                                                    <td style={{ fontWeight: 700 }}>{row.day}</td>
                                                    <td style={{ textAlign: 'center' }}>{row.games}</td>
                                                    <td style={{ textAlign: 'center', color: C_WIN, fontWeight: 700 }}>{row.wins}</td>
                                                    <td style={{ textAlign: 'center', color: C_LOSS, fontWeight: 700 }}>{row.losses}</td>
                                                    <td style={{ textAlign: 'center', color: C_DRAW }}>{row.draws}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Time Distribution */}
                            <div className="cb-card">
                                <div className="cb-card-head">
                                    <Icons.clock size={20} />
                                    <h2>Games by Time of Day</h2>
                                </div>
                                <div className="cb-table-wrap">
                                    <table className="cb-table">
                                        <thead>
                                            <tr>
                                                <th>Period</th>
                                                <th style={{ textAlign: 'center' }}>Games</th>
                                                <th style={{ textAlign: 'center' }}>Wins</th>
                                                <th style={{ textAlign: 'center' }}>Losses</th>
                                                <th style={{ textAlign: 'center' }}>Draws</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {timeDist.map((row, i) => (
                                                <tr key={i}>
                                                    <td>
                                                        <span style={{ fontWeight: 700 }}>{row.period}</span>
                                                        <span className="cb-muted" style={{ fontSize: 12, marginLeft: 8 }}>{row.timeRange}</span>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>{row.games}</td>
                                                    <td style={{ textAlign: 'center', color: C_WIN, fontWeight: 700 }}>{row.wins}</td>
                                                    <td style={{ textAlign: 'center', color: C_LOSS, fontWeight: 700 }}>{row.losses}</td>
                                                    <td style={{ textAlign: 'center', color: C_DRAW }}>{row.draws}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>

                        {/* Right column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>

                            {/* Time Controls */}
                            <div className="cb-card">
                                <div className="cb-card-head"><Icons.clock size={20} /><h2>By Time Control</h2></div>
                                <div className="cb-card-body">
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={timeControls} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                            {chartProps.grid}
                                            {chartProps.xAxis('name')}
                                            {chartProps.yAxis}
                                            {chartProps.tooltip}
                                            <Bar dataKey="games" fill={C_BLITZ} radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Color Win Rate */}
                            <div className="cb-card">
                                <div className="cb-card-head"><Icons.grid size={20} /><h2>White vs Black</h2></div>
                                <div className="cb-card-body">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={colorWinRate} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                            {chartProps.grid}
                                            {chartProps.xAxis('color')}
                                            <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 12, fill: TICK }} />
                                            <Tooltip formatter={v => [`${v}%`, 'Win Rate']} contentStyle={{ background: '#121C18', border: '1px solid #243029', color: '#E8F1EB', borderRadius: 10 }} />
                                            <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                                                {colorWinRate.map((_, i) => (
                                                    <Cell key={i} fill={i === 0 ? '#E8F1EB' : '#8A9D92'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* How I Lose */}
                            <div className="cb-card">
                                <div className="cb-card-head"><Icons.x size={20} /><h2>How I Lose</h2></div>
                                <div className="cb-table-wrap">
                                    <table className="cb-table">
                                        <thead>
                                            <tr>
                                                <th>Loss Type</th>
                                                <th style={{ textAlign: 'center' }}>Games</th>
                                                <th>%</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lossBreakdown.map((row, i) => (
                                                <tr key={i}>
                                                    <td style={{ fontWeight: 700 }}>{row.type}</td>
                                                    <td style={{ textAlign: 'center' }}>{row.games}</td>
                                                    <td>
                                                        <div className="cb-pctbar">
                                                            <div className="track"><div className="fill" style={{ width: `${row.pct}%`, background: C_LOSS }} /></div>
                                                            <span>{row.pct}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Top Openings */}
                            <div className="cb-card">
                                <div className="cb-card-head"><Icons.trophy size={20} /><h2>Top Openings</h2></div>
                                <div className="cb-table-wrap">
                                    <table className="cb-table">
                                        <thead>
                                            <tr>
                                                <th>Opening</th>
                                                <th style={{ textAlign: 'right' }}>Win Rate</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topOpenings.map((row, i) => {
                                                const color = row.winRate >= 65 ? C_WIN : row.winRate >= 50 ? '#F2C14E' : C_LOSS;
                                                return (
                                                    <tr key={i}>
                                                        <td style={{ fontSize: 13 }}>{row.opening}</td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <span className="cb-mono" style={{ color, fontSize: 14 }}>{row.winRate}%</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Streaks & Rivals */}
                            {milestones && (
                                <div className="cb-card">
                                    <div className="cb-card-head"><Icons.sparkles size={20} /><h2>Streaks &amp; Rivals</h2></div>
                                    <div className="cb-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span className="cb-muted" style={{ fontSize: 13 }}>Longest Win Streak</span>
                                            <span className="cb-mono green">{milestones.longestWinStreak} games</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span className="cb-muted" style={{ fontSize: 13 }}>Longest Loss Streak</span>
                                            <span className="cb-mono coral">{milestones.longestLossStreak} games</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span className="cb-muted" style={{ fontSize: 13 }}>Nemesis</span>
                                            <span style={{ fontWeight: 700, fontSize: 14 }}>
                                                {milestones.mostPlayedOpponent.username}
                                                <span className="cb-muted" style={{ fontSize: 12, fontWeight: 400, marginLeft: 6 }}>
                                                    · {milestones.mostPlayedOpponent.games} games
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>
        </DashboardWrapper>
    );
}

export default PlayerAnalytics;
