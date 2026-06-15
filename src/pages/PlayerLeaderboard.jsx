import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import TopNav from '../components/layouts/TopNav';
import Sidebar from '../components/layouts/Sidebar';
import DashboardWrapper from '../components/layouts/DashboardWrapper';
import { Icons } from '../components/ui/Icons';

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };
const MEDAL_COLORS = { 1: '#F2C14E', 2: '#8A9D92', 3: '#CD7F32' };
const PAGE_SIZE = 15;

function PlayerLeaderboard() {
    const { auth } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        axios
            .get('/api/v1/analytics/leaderboard?range=30')
            .then(res => {
                setLeaderboard(res.data.entries);
                setPage(1);
            })
            .catch(() => toast.error('Could not load leaderboard.'))
            .finally(() => setLoading(false));
    }, []);

    const totalPages = Math.ceil(leaderboard.length / PAGE_SIZE);
    const visible = leaderboard.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <DashboardWrapper>
            <Sidebar />
            <div className="cb-main">
                <TopNav />
                <div className="cb-body">
                    <div className="cb-card">
                        <div className="cb-card-head">
                            <Icons.trophy size={20} />
                            <h2>Leaderboard</h2>
                            <span className="cb-hint">Most wins · last 30 days</span>
                        </div>

                        <div className="cb-table-wrap">
                            <table className="cb-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: 60 }}>#</th>
                                        <th>Player</th>
                                        <th style={{ textAlign: 'right' }}>Wins</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i}>
                                                <td><div style={{ width: 30, height: 14, background: '#16221C', borderRadius: 4 }} /></td>
                                                <td><div style={{ width: 120, height: 14, background: '#16221C', borderRadius: 4 }} /></td>
                                                <td><div style={{ width: 40, height: 14, background: '#16221C', borderRadius: 4, marginLeft: 'auto' }} /></td>
                                            </tr>
                                        ))
                                    ) : leaderboard.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="cb-empty">No data available yet.</td>
                                        </tr>
                                    ) : visible.map(entry => {
                                        const isMe = entry.username === auth.username;
                                        return (
                                            <tr key={entry.username} style={isMe ? { background: '#10261b' } : {}}>
                                                <td>
                                                    {entry.rank <= 3 ? (
                                                        <span style={{ fontSize: 18 }}>{MEDALS[entry.rank]}</span>
                                                    ) : (
                                                        <div className="cb-seat">{entry.rank}</div>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="cb-user-cell">
                                                        {entry.profile_picture && (
                                                            <img
                                                                src={entry.profile_picture}
                                                                alt=""
                                                                style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                                                                onError={e => { e.target.style.display = 'none'; }}
                                                            />
                                                        )}
                                                        <a href={`https://www.chess.com/member/${entry.username}`} target="_blank" rel="noreferrer"
                                                            style={{ color: isMe ? '#3BE089' : 'inherit', textDecoration: 'none', borderBottom: '1px dotted #3BE089' }}>
                                                            {entry.username}
                                                        </a>
                                                        {isMe && <span className="cb-pill green" style={{ fontSize: 11, padding: '2px 8px' }}>You</span>}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <span className="cb-mono green">{entry.wins}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="cb-card-foot">
                                <span className="cb-muted" style={{ fontSize: 13 }}>
                                    Page {page} of {totalPages}
                                </span>
                                <button className="cb-btn cb-btn-ghost" disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}>
                                    Previous
                                </button>
                                <button className="cb-btn cb-btn-ghost" disabled={page === totalPages}
                                    onClick={() => setPage(p => p + 1)}>
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardWrapper>
    );
}

export default PlayerLeaderboard;
