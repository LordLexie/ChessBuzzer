import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import TopNav from '../components/layouts/TopNav';
import Sidebar from '../components/layouts/Sidebar';
import DashboardWrapper from '../components/layouts/DashboardWrapper';
import { Icons } from '../components/ui/Icons';

const analyticsApi = axios.create({
    baseURL: import.meta.env.VITE_ANALYTICS_API_URL ?? 'http://localhost:8000',
    headers: { 'X-Service-Key': import.meta.env.VITE_ANALYTICS_SERVICE_KEY ?? '' },
    withCredentials: false,
});

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };
const MEDAL_COLORS = { 1: '#F2C14E', 2: '#8A9D92', 3: '#CD7F32' };

function PlayerLeaderboard() {
    const { auth } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        analyticsApi
            .get('/leaderboard?range=30')
            .then(res => setLeaderboard(res.data.entries))
            .catch(() => toast.error('Could not load leaderboard.'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <DashboardWrapper>
            <Sidebar />
            <div className="cb-main">
                <TopNav />
                <div className="cb-body">
                    <div style={{ maxWidth: 680 }}>
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
                                        ) : leaderboard.map(entry => {
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
                                                            <span style={isMe ? { color: '#3BE089' } : {}}>{entry.username}</span>
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
                        </div>
                    </div>
                </div>
            </div>
        </DashboardWrapper>
    );
}

export default PlayerLeaderboard;
