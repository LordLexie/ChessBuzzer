import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { CHESS, Icons } from '../components/ui/Icons';

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };
const PAGE_SIZE = 20;

function PublicLeaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        axios
            .get('/api/v1/analytics/leaderboard?range=30')
            .then(res => { setLeaderboard(res.data.entries ?? []); setPage(1); })
            .catch(() => setLeaderboard([]))
            .finally(() => setLoading(false));
    }, []);

    const totalPages = Math.ceil(leaderboard.length / PAGE_SIZE);
    const visible = leaderboard.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div style={{ minHeight: '100vh', background: '#0A120E', color: '#E8F1EB', display: 'flex', flexDirection: 'column' }}>
            {/* Nav */}
            <header style={{
                padding: '18px clamp(16px, 4vw, 40px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #16221C',
                background: '#0A120E',
                position: 'sticky',
                top: 0,
                zIndex: 10,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(150deg,#3BE089,#1E8A52)', display: 'grid', placeItems: 'center', fontSize: 20, color: '#06140C' }}>
                        {CHESS.knight}
                    </div>
                    <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 16, color: '#E8F1EB' }}>Chess Buzzer</div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Link to="/about" style={{ color: '#8A9D92', fontSize: 13, textDecoration: 'none' }}>About</Link>
                    <Link to="/" style={{ color: '#3BE089', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>Sign In →</Link>
                </div>
            </header>

            {/* Body */}
            <main style={{ flex: 1, maxWidth: 800, width: '100%', margin: '0 auto', padding: '40px clamp(14px, 3vw, 24px)' }}>
                <div style={{ marginBottom: 32 }}>
                    <span style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: '#3BE089', fontWeight: 600 }}>Top players</span>
                    <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: '-.03em', color: '#E8F1EB', margin: '10px 0 6px' }}>
                        <Icons.trophy size={28} style={{ marginRight: 10, verticalAlign: 'middle' }} />
                        Leaderboard
                    </h1>
                    <p style={{ color: '#8A9D92', fontSize: 14 }}>Most wins · last 30 days</p>
                </div>

                <div style={{ background: '#0F1C16', border: '1px solid #16221C', borderRadius: 16, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #16221C' }}>
                                <th style={{ padding: '14px 20px', textAlign: 'left', color: '#4A6357', fontWeight: 600, fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase', width: 70 }}>#</th>
                                <th style={{ padding: '14px 20px', textAlign: 'left', color: '#4A6357', fontWeight: 600, fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase' }}>Player</th>
                                <th style={{ padding: '14px 20px', textAlign: 'right', color: '#4A6357', fontWeight: 600, fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase' }}>Wins</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(8)].map((_, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #0F1C16' }}>
                                        <td style={{ padding: '14px 20px' }}><div style={{ width: 28, height: 13, background: '#16221C', borderRadius: 4 }} /></td>
                                        <td style={{ padding: '14px 20px' }}><div style={{ width: 140, height: 13, background: '#16221C', borderRadius: 4 }} /></td>
                                        <td style={{ padding: '14px 20px' }}><div style={{ width: 36, height: 13, background: '#16221C', borderRadius: 4, marginLeft: 'auto' }} /></td>
                                    </tr>
                                ))
                            ) : leaderboard.length === 0 ? (
                                <tr>
                                    <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: '#4A6357' }}>No data available yet.</td>
                                </tr>
                            ) : visible.map(entry => (
                                <tr key={entry.username} style={{ borderBottom: '1px solid #0D1A13' }}>
                                    <td style={{ padding: '14px 20px' }}>
                                        {entry.rank <= 3
                                            ? <span style={{ fontSize: 20 }}>{MEDALS[entry.rank]}</span>
                                            : <span style={{ color: '#4A6357', fontWeight: 600 }}>{entry.rank}</span>
                                        }
                                    </td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            {entry.profile_picture && (
                                                <img src={entry.profile_picture} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                                                    onError={e => { e.target.style.display = 'none'; }} />
                                            )}
                                            <a href={`https://www.chess.com/member/${entry.username}`} target="_blank" rel="noreferrer"
                                                style={{ fontWeight: 700, color: '#E8F1EB', textDecoration: 'none', borderBottom: '1px dotted #3BE089' }}>
                                                {entry.username}
                                            </a>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                                        <span style={{ fontFamily: 'monospace', color: '#3BE089', fontWeight: 700 }}>{entry.wins}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid #16221C' }}>
                            <span style={{ fontSize: 12, color: '#4A6357' }}>Page {page} of {totalPages}</span>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="cb-btn cb-btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ fontSize: 12, padding: '6px 14px' }}>Previous</button>
                                <button className="cb-btn cb-btn-ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ fontSize: 12, padding: '6px 14px' }}>Next</button>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ textAlign: 'center', marginTop: 36 }}>
                    <p style={{ color: '#4A6357', fontSize: 13, marginBottom: 16 }}>Want to appear here?</p>
                    <Link to="/register" style={{ background: '#3BE089', color: '#06140C', fontWeight: 700, fontSize: 13, padding: '10px 24px', borderRadius: 8, textDecoration: 'none' }}>
                        Join Chess Buzzer
                    </Link>
                </div>
            </main>

            <footer style={{ borderTop: '1px solid #16221C', padding: '20px 40px', textAlign: 'center', color: '#4A6357', fontSize: 12 }}>
                © {new Date().getFullYear()} Chess Buzzer · <Link to="/about" style={{ color: '#4A6357' }}>About</Link>
            </footer>
        </div>
    );
}

export default PublicLeaderboard;
