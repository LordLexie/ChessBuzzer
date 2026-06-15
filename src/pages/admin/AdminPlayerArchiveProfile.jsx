import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    LineChart, Line,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import { Icons } from '../../components/ui/Icons';

const C_ELO  = '#F2C14E';
const C_WIN  = '#3BE089';
const C_LOSS = '#FF6A3D';
const GRID   = '#243029';
const TICK   = '#8A9D92';
const TOOLTIP_STYLE = { background: '#121C18', border: '1px solid #243029', color: '#E8F1EB', borderRadius: 10, fontSize: 13 };

const RESULT_STYLE = {
    win:  { background: '#0d2b1f', color: '#3BE089', border: '1px solid #1a4a32' },
    loss: { background: '#2b0d0d', color: '#FF6A3D', border: '1px solid #4a1a1a' },
    draw: { background: '#1a1a2b', color: '#8A9D92', border: '1px solid #2a2a4a' },
};

function AdminPlayerArchiveProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [user, setUser]        = useState(null);
    const [stats, setStats]      = useState(null);
    const [eloHistory, setElo]   = useState([]);
    const [perfHistory, setPerf] = useState([]);
    const [loading, setLoading]  = useState(true);

    const [games, setGames]             = useState([]);
    const [gamesTotal, setGamesTotal]   = useState(0);
    const [gamesPage, setGamesPage]     = useState(1);
    const [gamesLoading, setGamesLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        axios.get(`/api/v1/admin/analytics/users/${userId}`)
            .then(res => {
                const u = res.data;
                setUser(u);
                return axios.get(`/api/v1/admin/analytics/by-username/${u.username}`);
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
        if (!user) return;
        setGamesLoading(true);
        const skip = (gamesPage - 1) * 10;
        axios.get(`/api/v1/admin/analytics/games?username=${user.username}&skip=${skip}&limit=10`)
            .then(res => {
                setGames(res.data.items ?? []);
                setGamesTotal(res.data.total ?? 0);
            })
            .catch(() => toast.error('Failed to load games.'))
            .finally(() => setGamesLoading(false));
    }, [user, gamesPage]);

    const gamesTotalPages = Math.max(1, Math.ceil(gamesTotal / 10));

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

                            {/* Game List */}
                            <div className="cb-card">
                                <div className="cb-card-head">
                                    <Icons.archive size={18} />
                                    <h2>Game Archives</h2>
                                    <span className="cb-count">{gamesTotal} games</span>
                                </div>
                                <div className="cb-table-wrap">
                                    {gamesLoading ? (
                                        <div className="cb-center"><div className="cb-spinner" /></div>
                                    ) : (
                                        <table className="cb-table">
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Opponent</th>
                                                    <th>Color</th>
                                                    <th>Time Class</th>
                                                    <th>Result</th>
                                                    <th>Ratings</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {games.length === 0 ? (
                                                    <tr><td colSpan={7} className="cb-empty">No games found.</td></tr>
                                                ) : games.map(g => {
                                                    const isWhite  = g.white_username?.toLowerCase() === user?.username?.toLowerCase();
                                                    const opponent = isWhite ? g.black_username : g.white_username;
                                                    const playerRating   = isWhite ? g.white_rating : g.black_rating;
                                                    const opponentRating = isWhite ? g.black_rating : g.white_rating;
                                                    const resultKey = g.player_result === 'win' ? 'win' : g.player_result === 'loss' ? 'loss' : 'draw';
                                                    return (
                                                        <tr key={g.id}>
                                                            <td className="cb-muted" style={{ fontSize: 13 }}>
                                                                {new Date(g.end_time * 1000).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: '2-digit' })}
                                                            </td>
                                                            <td style={{ fontWeight: 600 }}>{opponent || '—'}</td>
                                                            <td>
                                                                <span className={`cb-pill ${isWhite ? 'grey' : 'dark'}`} style={{ fontSize: 11 }}>
                                                                    {isWhite ? 'White' : 'Black'}
                                                                </span>
                                                            </td>
                                                            <td className="cb-muted" style={{ fontSize: 13, textTransform: 'capitalize' }}>
                                                                {g.time_class || '—'}
                                                            </td>
                                                            <td>
                                                                <span style={{
                                                                    ...RESULT_STYLE[resultKey],
                                                                    fontSize: 11, fontWeight: 700,
                                                                    padding: '2px 10px', borderRadius: 20,
                                                                    textTransform: 'capitalize',
                                                                }}>
                                                                    {g.player_result}
                                                                </span>
                                                            </td>
                                                            <td className="cb-muted" style={{ fontSize: 13 }}>
                                                                {playerRating ?? '—'} vs {opponentRating ?? '—'}
                                                            </td>
                                                            <td>
                                                                {g.url && (
                                                                    <a href={g.url} target="_blank" rel="noreferrer"
                                                                        style={{ color: '#3BE089', fontSize: 13, textDecoration: 'none' }}
                                                                        title="View on chess.com">
                                                                        ↗
                                                                    </a>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                                {gamesTotalPages > 1 && (
                                    <div className="cb-card-foot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span className="cb-muted" style={{ fontSize: 13 }}>
                                            Page {gamesPage} of {gamesTotalPages}
                                        </span>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="cb-btn cb-btn-ghost" style={{ padding: '5px 14px', fontSize: 13 }}
                                                onClick={() => setGamesPage(p => p - 1)} disabled={gamesPage === 1}>
                                                Previous
                                            </button>
                                            <button className="cb-btn cb-btn-ghost" style={{ padding: '5px 14px', fontSize: 13 }}
                                                onClick={() => setGamesPage(p => p + 1)} disabled={gamesPage === gamesTotalPages}>
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DashboardWrapper>
    );
}

export default AdminPlayerArchiveProfile;
