import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import Aside from '../components/layouts/Aside';
import Footer from '../components/layouts/Footer';
import TopNav from '../components/layouts/TopNav';
import Sidebar from '../components/layouts/Sidebar';
import DashboardWrapper from '../components/layouts/DashboardWrapper';

const analyticsApi = axios.create({
    baseURL: import.meta.env.VITE_ANALYTICS_API_URL ?? 'http://localhost:8000',
    headers: { 'X-Service-Key': import.meta.env.VITE_ANALYTICS_SERVICE_KEY ?? '' },
    withCredentials: false,
});

function PlayerLeaderboard() {
    const { auth } = useAuth();

    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading]         = useState(true);

    useEffect(() => {
        analyticsApi
            .get('/leaderboard?range=30')
            .then(res => setLeaderboard(res.data.entries))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

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
                                    <i className="fas fa-trophy mr-2 text-warning"></i>
                                    Leaderboard
                                </h1>
                            </div>
                            <div className="col-sm-6 text-right">
                                <small className="text-muted">Most wins · last 30 days</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-8 offset-md-2">
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            <i className="fas fa-trophy mr-2 text-warning"></i>
                                            Rankings — Most Wins (Last 30 Days)
                                        </h3>
                                    </div>
                                    <div className="card-body table-responsive p-0">
                                        {loading ? (
                                            <div className="text-center py-5">
                                                <i className="fas fa-spinner fa-spin fa-2x text-muted"></i>
                                            </div>
                                        ) : (
                                            <table className="table table-hover text-nowrap mb-0">
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: 60 }}>#</th>
                                                        <th>Player</th>
                                                        <th className="text-right">Wins</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {leaderboard.map(entry => (
                                                        <tr
                                                            key={entry.username}
                                                            style={entry.username === auth.username
                                                                ? { background: '#fffbe6', fontWeight: 600 }
                                                                : {}}
                                                        >
                                                            <td style={{ fontSize: '16px' }}>
                                                                {entry.rank === 1 && <i className="fas fa-trophy text-warning"></i>}
                                                                {entry.rank === 2 && <i className="fas fa-medal" style={{ color: '#adb5bd' }}></i>}
                                                                {entry.rank === 3 && <i className="fas fa-medal" style={{ color: '#cd7f32' }}></i>}
                                                                {entry.rank > 3 && <span className="text-muted">{entry.rank}</span>}
                                                            </td>
                                                            <td>
                                                                {entry.profile_picture && (
                                                                    <img
                                                                        src={entry.profile_picture}
                                                                        alt=""
                                                                        className="img-circle mr-2"
                                                                        style={{ width: 28, height: 28, objectFit: 'cover' }}
                                                                        onError={e => { e.target.style.display = 'none'; }}
                                                                    />
                                                                )}
                                                                {entry.username}
                                                                {entry.username === auth.username && (
                                                                    <span className="badge badge-info ml-2" style={{ fontSize: '10px' }}>You</span>
                                                                )}
                                                            </td>
                                                            <td className="text-right">
                                                                <span className="badge badge-success" style={{ fontSize: '13px' }}>
                                                                    {entry.wins}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {leaderboard.length === 0 && (
                                                        <tr>
                                                            <td colSpan={3} className="text-center text-muted py-4">
                                                                No data available yet.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
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

export default PlayerLeaderboard;
