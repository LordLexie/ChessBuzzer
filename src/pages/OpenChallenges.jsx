import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import TopNav from '../components/layouts/TopNav';
import Sidebar from '../components/layouts/Sidebar';
import DashboardWrapper from '../components/layouts/DashboardWrapper';
import { Icons } from '../components/ui/Icons';

function seriesLabel(length) {
    if (!length || length <= 1) return null;
    return `Best of ${length}`;
}

function TimeAgo(dateString) {
    const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function OpenChallenges() {
    const { auth } = useAuth();
    const navigate = useNavigate();

    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(null);

    const fetchChallenges = () => {
        setLoading(true);
        axios.get('api/v1/challenge/open')
            .then(res => {
                if (res.data.status === 'Ok') setChallenges(res.data.data ?? []);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchChallenges();
        const interval = setInterval(fetchChallenges, 30000);
        return () => clearInterval(interval);
    }, []);

    const accept = (challengeCode, entryFee, currency, creatorUsername) => {
        Swal.fire({
            title: 'Accept challenge?',
            html: `<b>${currency} ${entryFee}</b> will be deducted from your wallet.<br/><small>Challenger: ${creatorUsername}</small>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Accept',
            confirmButtonColor: '#3BE089',
            background: '#121C18',
            color: '#E8F1EB',
        }).then(result => {
            if (!result.isConfirmed) return;
            setAccepting(challengeCode);
            axios.post(`api/v1/challenge/open/${challengeCode}/accept`)
                .then(res => {
                    if (res.data.status === 'Ok') {
                        toast.success('Challenge accepted!');
                        navigate('/dashboard');
                    } else {
                        toast.error(res.data.data || 'Could not accept challenge');
                    }
                })
                .catch(() => toast.error('Something went wrong. Please try again.'))
                .finally(() => setAccepting(null));
        });
    };

    return (
        <DashboardWrapper>
            <Sidebar />
            <div className="cb-main">
                <TopNav />
                <div className="cb-body">
                    <div className="cb-card">
                        <div className="cb-card-head">
                            <Icons.globe size={20} />
                            <h2>Open Challenges</h2>
                            {challenges.length > 0 && <span className="cb-count">{challenges.length}</span>}
                            <span className="cb-hint" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Link to="/dashboard" className="cb-btn cb-btn-primary" style={{ padding: '7px 14px', fontSize: 13 }}>
                                    + Post a challenge
                                </Link>
                                <button className="cb-btn cb-btn-ghost" onClick={fetchChallenges} style={{ padding: '7px 12px', fontSize: 13 }}>
                                    Refresh
                                </button>
                            </span>
                        </div>

                        <div className="cb-table-wrap">
                            {loading ? (
                                <div className="cb-center"><div className="cb-spinner" /></div>
                            ) : challenges.length === 0 ? (
                                <div className="cb-empty" style={{ padding: 60 }}>
                                    <div style={{ fontSize: 40, marginBottom: 14 }}>♟</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No open challenges right now</div>
                                    <div className="cb-muted" style={{ marginBottom: 18 }}>Be the first to post one!</div>
                                    <Link to="/dashboard" className="cb-btn cb-btn-primary">+ Post a challenge</Link>
                                </div>
                            ) : (
                                <table className="cb-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Player</th>
                                            <th>Entry Fee</th>
                                            <th>Series</th>
                                            <th>Time Control</th>
                                            <th>Posted</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {challenges.map((ch, i) => (
                                            <tr key={i}>
                                                <td className="cb-muted">{i + 1}</td>
                                                <td>
                                                    <div className="cb-user-cell">
                                                        <div className="cb-user-av" style={{ background: 'linear-gradient(150deg,#3BE089,#1E8A52)' }}>
                                                            {ch.creator_username?.[0]?.toUpperCase()}
                                                        </div>
                                                        <span style={{ fontWeight: 700 }}>{ch.creator_username}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="cb-mono gold">{ch.currency} {ch.entry_fee}</span>
                                                </td>
                                                <td>
                                                    {ch.series_length > 1
                                                        ? <span className="cb-tag">{seriesLabel(ch.series_length)}</span>
                                                        : <span className="cb-muted" style={{ fontSize: 13 }}>1 game</span>}
                                                </td>
                                                <td style={{ fontSize: 13 }}>{ch.challenge_type}</td>
                                                <td className="cb-muted" style={{ fontSize: 13 }}>{TimeAgo(ch.created_at)}</td>
                                                <td>
                                                    {ch.creator_username === auth.username ? (
                                                        <span className="cb-pill grey" style={{ fontSize: 11 }}>Your challenge</span>
                                                    ) : (
                                                        <button
                                                            className="cb-btn cb-btn-primary"
                                                            style={{ padding: '7px 16px', fontSize: 13 }}
                                                            disabled={accepting === ch.challenge_code}
                                                            onClick={() => accept(ch.challenge_code, ch.entry_fee, ch.currency, ch.creator_username)}
                                                        >
                                                            {accepting === ch.challenge_code
                                                                ? <span className="cb-spinner sm" />
                                                                : 'Accept'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardWrapper>
    );
}

export default OpenChallenges;
