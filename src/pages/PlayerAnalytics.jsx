import React, { useState, useEffect, useRef } from 'react';
import './style.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import useAuth from '../hooks/useAuth';
import Aside from '../components/layouts/Aside';
import Footer from '../components/layouts/Footer';
import TopNav from '../components/layouts/TopNav';
import Sidebar from '../components/layouts/Sidebar';
import DashboardWrapper from '../components/layouts/DashboardWrapper';
import {
    Cell,
    LineChart, Line,
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const COLOR_WIN   = '#2d6a4f';
const COLOR_LOSS  = '#c1121f';
const COLOR_DRAW  = '#6c757d';
const COLOR_BLITZ = '#1a6496';
const COLOR_ELO   = '#6f42c1';

const DAY_META = {
    Monday:    { icon: 'calendar',       color: 'secondary' },
    Tuesday:   { icon: 'calendar',       color: 'secondary' },
    Wednesday: { icon: 'calendar',       color: 'info' },
    Thursday:  { icon: 'calendar',       color: 'info' },
    Friday:    { icon: 'calendar-check', color: 'primary' },
    Saturday:  { icon: 'chess',          color: 'success' },
    Sunday:    { icon: 'chess',          color: 'success' },
};

const TIME_META = {
    Morning:      { icon: 'sun',   color: 'warning', timeRange: '6:00am – Noon' },
    Afternoon:    { icon: 'cloud', color: 'info',    timeRange: 'Noon – 6:00pm' },
    Evening:      { icon: 'moon',  color: 'primary', timeRange: '6:00pm – Midnight' },
    'Late Night': { icon: 'star',  color: 'dark',    timeRange: 'Midnight – 6:00am' },
};

const LOSS_META = {
    Timeout:    { icon: 'hourglass-end', color: 'warning' },
    Checkmated: { icon: 'chess-king',    color: 'danger' },
    Resigned:   { icon: 'flag',          color: 'secondary' },
    Abandoned:  { icon: 'plug',          color: 'dark' },
};

function StatCard({ icon, color, label, value, sub }) {
    return (
        <div className={`small-box bg-${color}`}>
            <div className="inner">
                <h3>{value ?? <i className="fas fa-spinner fa-spin" />}</h3>
                {sub && <small>{sub}</small>}
                <p>{label}</p>
            </div>
            <div className="icon">
                <i className={`fas fa-${icon}`}></i>
            </div>
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

    const [kpi, setKpi]                   = useState(null);
    const [eloHistory, setEloHistory]     = useState([]);
    const [gameHistory, setGameHistory]   = useState([]);
    const [timeControls, setTimeControls] = useState([]);
    const [colorWinRate, setColorWinRate] = useState([]);
    const [topOpenings, setTopOpenings]   = useState([]);
    const [lossBreakdown, setLossBreakdown] = useState([]);
    const [dayDist, setDayDist]           = useState([]);
    const [timeDist, setTimeDist]         = useState([]);
    const [milestones, setMilestones]     = useState(null);

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
                const user = res.data.data;
                if (user.analytics_key) {
                    return axios.get('api/v1/analytics')
                        .then(r => loadAnalytics(r.data.data));
                } else {
                    setIntegrated(false);
                }
            })
            .catch(() => {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load analytics.' });
                setIntegrated(false);
            });
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
    function RangeButtons() {
        return RANGES.map(([val, label]) => (
            <button
                key={val}
                className={`btn btn-xs ${distributionRange === val ? 'btn-primary' : 'btn-default'} mr-1`}
                onClick={() => setDistributionRange(val)}
            >{label}</button>
        ));
    }

    const handleIntegrate = () => {
        setIntegrating(true);
        axios.post('api/v1/analytics/integrate')
            .then(() => axios.get('api/v1/analytics'))
            .then(res => loadAnalytics(res.data.data))
            .catch(() => {
                Swal.fire({ icon: 'error', title: 'Failed', text: 'Could not connect to analytics service. Please try again.' });
            })
            .finally(() => setIntegrating(false));
    };

    return (
        <DashboardWrapper>
            <TopNav />
            <Sidebar />

            <div className="content-wrapper">

                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0">
                                    <i className="fas fa-chart-line mr-2"></i>
                                    Analytics
                                </h1>
                            </div>
                            <div className="col-sm-6 text-right">
                                <small className="text-muted">
                                    chess.com · {auth?.username}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content">
                    <div className="container-fluid">

                        {integrated === null && (
                            <div className="text-center py-5">
                                <i className="fas fa-spinner fa-spin fa-2x text-muted"></i>
                                <p className="mt-2 text-muted">Loading analytics...</p>
                            </div>
                        )}

                        {integrated === false && (
                            <div className="row justify-content-center">
                                <div className="col-md-6">
                                    <div className="card card-outline card-primary text-center">
                                        <div className="card-body py-5">
                                            <i className="fas fa-chess fa-4x text-primary mb-3"></i>
                                            <h3 className="mb-2">Connect Your Analytics</h3>
                                            <p className="text-muted mb-4">
                                                Your account isn't connected to the analytics service yet.<br />
                                                Click below to set it up — it only takes a second.
                                            </p>
                                            <button
                                                className="btn btn-primary btn-lg"
                                                onClick={handleIntegrate}
                                                disabled={integrating}
                                            >
                                                {integrating
                                                    ? <><i className="fas fa-spinner fa-spin mr-2"></i>Connecting...</>
                                                    : <><i className="fas fa-plug mr-2"></i>Connect Now</>
                                                }
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {integrated === true && (<>

                        {/* Row 1 — KPI Cards */}
                        <div className="row">
                            <div className="col-6 col-md-3">
                                <StatCard icon="chess" color="info"
                                          label="Total Games" value={kpi?.totalGames} />
                            </div>
                            <div className="col-6 col-md-3">
                                <StatCard icon="trophy" color="success"
                                          label="Wins" value={kpi ? kpi.totalWins : null}  />
                            </div>
                            <div className="col-6 col-md-3">
                                <StatCard icon="times-circle" color="danger"
                                          label="Losses" value={kpi ? kpi.totalLosses : null} />
                            </div>
                            <div className="col-6 col-md-3">
                                <StatCard icon="handshake" color="secondary"
                                          label="Draws" value={kpi ? kpi.totalDraws : null} />
                            </div>
                        </div>

                        {/* Row 2 — Performance Trends (shared card) */}
                        <div className="row">
                            <div className="col-md-8">
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            <i className="fas fa-chart-line mr-1"></i>
                                            ELO Rating History
                                        </h3>
                                        <div className="card-tools">
                                            <button type="button" className="btn btn-tool" data-card-widget="collapse">
                                                <i className="fas fa-minus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <ResponsiveContainer width="100%" height={220}>
                                            <LineChart data={eloHistory}
                                                       margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                                                <XAxis dataKey="month" tick={{ fontSize: 11, angle: -45, textAnchor: 'end' }} height={50} />
                                                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
                                                <Tooltip formatter={v => [v, 'Rating']} />
                                                <Line type="monotone" dataKey="rating"
                                                      stroke={COLOR_ELO} strokeWidth={2}
                                                      dot={{ r: 3 }} name="Rating" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            <i className="fas fa-chart-bar mr-1"></i>
                                            Performance Trends
                                        </h3>
                                        <div className="card-tools">
                                            <button type="button" className="btn btn-tool" data-card-widget="collapse">
                                                <i className="fas fa-minus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <small className="text-muted d-block mb-2">Trends over time</small>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <LineChart data={gameHistory}
                                                       margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                                                <XAxis dataKey="month" tick={{ fontSize: 11, angle: -45, textAnchor: 'end' }} height={50} />
                                                <YAxis tick={{ fontSize: 12 }} />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="wins"
                                                      stroke={COLOR_WIN} strokeWidth={2}
                                                      dot={{ r: 3 }} name="Wins" />
                                                <Line type="monotone" dataKey="losses"
                                                      stroke={COLOR_LOSS} strokeWidth={2}
                                                      dot={{ r: 3 }} name="Losses" />
                                                <Line type="monotone" dataKey="draws"
                                                      stroke={COLOR_DRAW} strokeWidth={2}
                                                      strokeDasharray="4 4" dot={{ r: 3 }} name="Draws" />
                                            </LineChart>
                                        </ResponsiveContainer>

                                        <hr className="mt-2 mb-3" />

                                        <small className="text-muted d-block mb-2">Monthly breakdown</small>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <BarChart data={gameHistory}
                                                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                                                <XAxis dataKey="month" tick={{ fontSize: 11, angle: -45, textAnchor: 'end' }} height={50} />
                                                <YAxis tick={{ fontSize: 12 }} />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="wins"   stackId="a" fill={COLOR_WIN}  name="Wins" />
                                                <Bar dataKey="losses" stackId="a" fill={COLOR_LOSS} name="Losses" />
                                                <Bar dataKey="draws"  stackId="a" fill={COLOR_DRAW} name="Draws"
                                                     radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                                                <div className="card collapsed-card">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            <i className="fas fa-calendar-week mr-1"></i>
                                            Games by Day of Week
                                        </h3>
                                        <div className="card-tools d-flex align-items-center">
                                            <RangeButtons />
                                            <button type="button" className="btn btn-tool" data-card-widget="collapse">
                                                <i className="fas fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-body p-0">
                                        <table className="table table-sm table-hover mb-0">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th style={{ width: '44px' }}></th>
                                                    <th>Day</th>
                                                    <th style={{ width: '70px' }} className="text-center">Games</th>
                                                    <th style={{ width: '60px' }} className="text-center">Wins</th>
                                                    <th style={{ width: '60px' }} className="text-center">Losses</th>
                                                    <th style={{ width: '60px' }} className="text-center">Draws</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dayDist.map((row, i) => (
                                                    <tr key={i}>
                                                        <td className="text-center">
                                                            <i className={`fas fa-${row.icon} text-${row.color}`}></i>
                                                        </td>
                                                        <td><strong>{row.day}</strong></td>
                                                        <td className="text-center">{row.games}</td>
                                                        <td className="text-center text-success"><strong>{row.wins}</strong></td>
                                                        <td className="text-center text-danger"><strong>{row.losses}</strong></td>
                                                        <td className="text-center text-secondary">{row.draws}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>


                                    <div className="card collapsed-card">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            <i className="fas fa-clock mr-1"></i>
                                            Games by Time of Day
                                        </h3>
                                        <div className="card-tools d-flex align-items-center">
                                            <RangeButtons />
                                            <button type="button" className="btn btn-tool" data-card-widget="collapse">
                                                <i className="fas fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-body p-0">
                                        <table className="table table-sm table-hover mb-0">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th style={{ width: '44px' }}></th>
                                                    <th>Period</th>
                                                    <th style={{ width: '70px' }} className="text-center">Games</th>
                                                    <th style={{ width: '60px' }} className="text-center">Wins</th>
                                                    <th style={{ width: '60px' }} className="text-center">Losses</th>
                                                    <th style={{ width: '60px' }} className="text-center">Draws</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {timeDist.map((row, i) => (
                                                    <tr key={i}>
                                                        <td className="text-center">
                                                            <i className={`fas fa-${row.icon} text-${row.color}`}></i>
                                                        </td>
                                                        <td>
                                                            <strong>{row.period}</strong>
                                                            <br />
                                                            <small className="text-muted">{row.timeRange}</small>
                                                        </td>
                                                        <td className="text-center">{row.games}</td>
                                                        <td className="text-center text-success"><strong>{row.wins}</strong></td>
                                                        <td className="text-center text-danger"><strong>{row.losses}</strong></td>
                                                        <td className="text-center text-secondary">{row.draws}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                            </div>

                            <div className="col-md-4">

                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            <i className="fas fa-clock mr-1"></i>
                                            Games by Time Control
                                        </h3>
                                        <div className="card-tools">
                                            <button type="button" className="btn btn-tool" data-card-widget="collapse">
                                                <i className="fas fa-minus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <ResponsiveContainer width="100%" height={240}>
                                            <BarChart data={timeControls}
                                                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                                <YAxis tick={{ fontSize: 12 }} />
                                                <Tooltip />
                                                <Bar dataKey="games" fill={COLOR_BLITZ}
                                                     radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                 <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            <i className="fas fa-chess mr-1"></i>
                                            Win Rate: White vs Black
                                        </h3>
                                        <div className="card-tools">
                                            <button type="button" className="btn btn-tool" data-card-widget="collapse">
                                                <i className="fas fa-minus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <ResponsiveContainer width="100%" height={240}>
                                            <BarChart data={colorWinRate}
                                                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                                                <XAxis dataKey="color" tick={{ fontSize: 13 }} />
                                                <YAxis domain={[0, 100]}
                                                       tickFormatter={v => `${v}%`}
                                                       tick={{ fontSize: 12 }} />
                                                <Tooltip formatter={v => [`${v}%`, 'Win Rate']} />
                                                <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                                                    {colorWinRate.map((_, i) => (
                                                        <Cell key={i}
                                                              fill={i === 0 ? '#343a40' : '#adb5bd'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>


                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            <i className="fas fa-skull mr-1"></i>
                                            How I Lose
                                        </h3>
                                        <div className="card-tools">
                                            <button type="button" className="btn btn-tool" data-card-widget="collapse">
                                                <i className="fas fa-minus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-body p-0">
                                        <table className="table table-sm table-hover mb-0">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th style={{ width: '44px' }}></th>
                                                    <th>Loss Type</th>
                                                    <th style={{ width: '80px' }} className="text-center">Games</th>
                                                    <th style={{ width: '90px' }} className="text-center">% of Losses</th>
                                                    <th>Breakdown</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {lossBreakdown.map((row, i) => (
                                                    <tr key={i}>
                                                        <td className="text-center">
                                                            <i className={`fas fa-${row.icon} text-${row.color}`}></i>
                                                        </td>
                                                        <td><strong>{row.type}</strong></td>
                                                        <td className="text-center">{row.games}</td>
                                                        <td className="text-center">
                                                            <span className={`badge badge-${row.color}`}>{row.pct}%</span>
                                                        </td>
                                                        <td>
                                                            <div className="progress" style={{ height: '8px', marginTop: '4px' }}>
                                                                <div
                                                                    className={`progress-bar bg-${row.color}`}
                                                                    style={{ width: `${row.pct}%` }}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            <i className="fas fa-chess mr-1"></i>
                                            Top 5 Openings by Win Rate
                                        </h3>
                                        <div className="card-tools">
                                            <button type="button" className="btn btn-tool" data-card-widget="collapse">
                                                <i className="fas fa-minus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-body p-0">
                                        <table className="table table-sm table-hover mb-0">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th style={{ width: '36px' }}></th>
                                                    <th>Opening</th>
                                                    <th className="text-right">Win Rate</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {topOpenings.map((row, i) => {
                                                    const pieces = [
                                                        'chess-queen', 'chess-rook', 'chess-bishop',
                                                        'chess-knight', 'chess-pawn'
                                                    ];
                                                    const badgeClass = row.winRate >= 65
                                                        ? 'badge-success'
                                                        : row.winRate >= 50
                                                        ? 'badge-warning'
                                                        : 'badge-danger';
                                                    return (
                                                        <tr key={i}>
                                                            <td className="text-center text-muted">
                                                                <i className={`fas fa-${pieces[i]}`}></i>
                                                            </td>
                                                            <td>{row.opening}</td>
                                                            <td className="text-right">
                                                                <span className={`badge ${badgeClass}`}>
                                                                    {row.winRate}%
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            <i className="fas fa-trophy mr-1"></i>
                                            Streaks &amp; Rivals
                                        </h3>
                                        <div className="card-tools">
                                            <button type="button" className="btn btn-tool" data-card-widget="collapse">
                                                <i className="fas fa-minus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-body p-0">
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            <span><i className="fas fa-fire text-success mr-2"></i> Longest Win Streak</span>
                                            <strong className="text-success">{milestones?.longestWinStreak} games</strong>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            <span><i className="fas fa-skull text-danger mr-2"></i> Longest Loss Streak</span>
                                            <strong className="text-danger">{milestones?.longestLossStreak} games</strong>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            <span><i className="fas fa-user text-info mr-2"></i> Nem</span>
                                            <span>
                                                <strong>{milestones?.mostPlayedOpponent.username}</strong>
                                                <small className="text-muted ml-1">· {milestones?.mostPlayedOpponent.games} games</small>
                                            </span>
                                        </li>
                                    </ul>
                                    </div>
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

export default PlayerAnalytics;
