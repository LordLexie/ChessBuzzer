import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import { Icons } from '../../components/ui/Icons';

const CHALLENGE_STATUS_PILL = {
    pending:  'gold',
    active:   'green',
    complete: 'green',
    canceled: 'coral',
};

const TOURNAMENT_STATUS_PILL = {
    draft:               'grey',
    registration_open:   'green',
    registration_closed: 'gold',
    in_progress:         'green',
    paused:              'gold',
    completed:           'green',
    disbursed:           'green',
    cancelled:           'coral',
};

const PARTICIPANT_STATUS_PILL = {
    registered:    'green',
    withdrawn:     'gold',
    disqualified:  'coral',
};

function Pill({ status, map }) {
    const cls = map[status] ?? 'grey';
    return (
        <span className={`cb-pill ${cls}`}>
            <span className="dot" />
            {status?.replace(/_/g, ' ')}
        </span>
    );
}

function AdminPlayerDetail() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [player, setPlayer] = useState(null);
    const [challenges, setChallenges] = useState([]);
    const [organizedTournaments, setOrganizedTournaments] = useState([]);
    const [participations, setParticipations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);
    const [tournamentTab, setTournamentTab] = useState('organized');

    useEffect(() => {
        axios.get(`/api/v1/admin/players/${userId}`)
            .then(res => {
                setPlayer(res.data.player);
                setChallenges(res.data.challenges ?? []);
                setOrganizedTournaments(res.data.organized_tournaments ?? []);
                setParticipations(res.data.tournament_participations ?? []);
            })
            .catch(() => toast.error('Failed to load player'))
            .finally(() => setLoading(false));
    }, [userId]);

    const handleToggle = () => {
        if (!player) return;
        setToggling(true);
        axios.patch(`/api/v1/admin/players/${userId}/create-tournament`, {
            create_tournament: !player.create_tournament,
        })
            .then(res => {
                setPlayer(res.data.player);
                toast.success(`Tournament creation ${res.data.player.create_tournament ? 'enabled' : 'disabled'}`);
            })
            .catch(() => toast.error('Failed to update permission'))
            .finally(() => setToggling(false));
    };

    const fmt = d => d ? new Date(d).toLocaleDateString('en-KE', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '—';

    if (loading) {
        return (
            <DashboardWrapper>
                <AdminSidebar />
                <div className="cb-main">
                    <AdminTopNav />
                    <div className="cb-body"><div className="cb-center"><div className="cb-spinner" /></div></div>
                </div>
            </DashboardWrapper>
        );
    }

    if (!player) {
        return (
            <DashboardWrapper>
                <AdminSidebar />
                <div className="cb-main">
                    <AdminTopNav />
                    <div className="cb-body">
                        <p className="cb-muted">Player not found.</p>
                    </div>
                </div>
            </DashboardWrapper>
        );
    }

    return (
        <DashboardWrapper>
            <AdminSidebar />
            <div className="cb-main">
                <AdminTopNav />
                <div className="cb-body">

                    {/* Back + Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <button className="cb-btn cb-btn-ghost" style={{ padding: '5px 14px', fontSize: 13 }}
                            onClick={() => navigate('/admin/players')}>
                            ← Back
                        </button>
                        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{player.username}</h2>
                    </div>

                    {/* Player Info Card */}
                    <div className="cb-card" style={{ marginBottom: 20 }}>
                        <div className="cb-card-head">
                            <Icons.user size={18} />
                            <h2>Player Info</h2>
                        </div>
                        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px 24px' }}>
                            <div>
                                <div className="cb-muted" style={{ fontSize: 11, marginBottom: 3 }}>USERNAME</div>
                                <div style={{ fontWeight: 700 }}>{player.username}</div>
                            </div>
                            <div>
                                <div className="cb-muted" style={{ fontSize: 11, marginBottom: 3 }}>NAME</div>
                                <div>{player.name || '—'}</div>
                            </div>
                            <div>
                                <div className="cb-muted" style={{ fontSize: 11, marginBottom: 3 }}>EMAIL</div>
                                <div style={{ fontSize: 13 }}>{player.email}</div>
                            </div>
                            <div>
                                <div className="cb-muted" style={{ fontSize: 11, marginBottom: 3 }}>COUNTRY</div>
                                <div>{player.country || '—'}</div>
                            </div>
                            <div>
                                <div className="cb-muted" style={{ fontSize: 11, marginBottom: 3 }}>STATUS</div>
                                <span className={`cb-pill ${player.status === 'active' ? 'green' : 'gold'}`}>
                                    <span className="dot" />{player.status}
                                </span>
                            </div>
                            <div>
                                <div className="cb-muted" style={{ fontSize: 11, marginBottom: 3 }}>JOINED</div>
                                <div style={{ fontSize: 13 }}>{fmt(player.CreatedAt)}</div>
                            </div>
                            <div>
                                <div className="cb-muted" style={{ fontSize: 11, marginBottom: 3 }}>TOURNAMENT CREATION</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span className={`cb-pill ${player.create_tournament ? 'green' : 'grey'}`}>
                                        <span className="dot" />{player.create_tournament ? 'Enabled' : 'Disabled'}
                                    </span>
                                    <button
                                        className={`cb-btn ${player.create_tournament ? 'cb-btn-ghost' : 'cb-btn-primary'}`}
                                        style={{ padding: '4px 12px', fontSize: 12 }}
                                        onClick={handleToggle}
                                        disabled={toggling}
                                    >
                                        {toggling ? '…' : player.create_tournament ? 'Revoke' : 'Grant'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Challenges */}
                    <div className="cb-card" style={{ marginBottom: 20 }}>
                        <div className="cb-card-head">
                            <Icons.zap size={18} />
                            <h2>Challenges</h2>
                            <span className="cb-count">{challenges.length}</span>
                        </div>
                        <div className="cb-table-wrap">
                            <table className="cb-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Code</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Entry Fee</th>
                                        <th>Series</th>
                                        <th>Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {challenges.length === 0 ? (
                                        <tr><td colSpan={7} className="cb-empty">No challenges.</td></tr>
                                    ) : challenges.map((c, i) => (
                                        <tr key={c.ID}>
                                            <td className="cb-muted">{i + 1}</td>
                                            <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.ChallengeCode}</td>
                                            <td className="cb-muted">{c.ChallengeTypeCode}</td>
                                            <td><Pill status={c.status} map={CHALLENGE_STATUS_PILL} /></td>
                                            <td>{c.currency} {Number(c.EntryFee ?? 0).toFixed(2)}</td>
                                            <td className="cb-muted">{c.SeriesLength}</td>
                                            <td className="cb-muted" style={{ fontSize: 13 }}>{fmt(c.CreatedAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Tournaments (tabbed) */}
                    <div className="cb-card">
                        <div className="cb-card-head">
                            <Icons.grid size={18} />
                            <h2>Tournaments</h2>
                        </div>
                        <div className="cb-tabs">
                            <button
                                className={`cb-tab ${tournamentTab === 'organized' ? 'active' : ''}`}
                                onClick={() => setTournamentTab('organized')}
                            >
                                Organized
                                <span className="cb-count">{organizedTournaments.length}</span>
                            </button>
                            <button
                                className={`cb-tab ${tournamentTab === 'participating' ? 'active' : ''}`}
                                onClick={() => setTournamentTab('participating')}
                            >
                                Participating
                                <span className="cb-count">{participations.length}</span>
                            </button>
                        </div>
                        <div className="cb-table-wrap">
                            {tournamentTab === 'organized' ? (
                                <table className="cb-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Name</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                            <th>Entry Fee</th>
                                            <th>Prize Pool</th>
                                            <th>Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {organizedTournaments.length === 0 ? (
                                            <tr><td colSpan={7} className="cb-empty">No organized tournaments.</td></tr>
                                        ) : organizedTournaments.map((t, i) => (
                                            <tr key={t.ID}>
                                                <td className="cb-muted">{i + 1}</td>
                                                <td style={{ fontWeight: 600 }}>{t.name}</td>
                                                <td className="cb-muted">{t.tournament_type}</td>
                                                <td><Pill status={t.status} map={TOURNAMENT_STATUS_PILL} /></td>
                                                <td>{t.currency_code} {Number(t.entry_fee ?? 0).toFixed(2)}</td>
                                                <td>{t.currency_code} {Number(t.prize_pool ?? 0).toFixed(2)}</td>
                                                <td className="cb-muted" style={{ fontSize: 13 }}>{fmt(t.CreatedAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="cb-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Tournament</th>
                                            <th>Status</th>
                                            <th>Rank</th>
                                            <th>Score</th>
                                            <th>Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {participations.length === 0 ? (
                                            <tr><td colSpan={6} className="cb-empty">No tournament participations.</td></tr>
                                        ) : participations.map((p, i) => (
                                            <tr key={p.ID}>
                                                <td className="cb-muted">{i + 1}</td>
                                                <td style={{ fontWeight: 600 }}>{p.tournament?.name ?? '—'}</td>
                                                <td><Pill status={p.status} map={PARTICIPANT_STATUS_PILL} /></td>
                                                <td className="cb-muted">{p.rank > 0 ? `#${p.rank}` : '—'}</td>
                                                <td className="cb-muted">{p.score ?? 0}</td>
                                                <td className="cb-muted" style={{ fontSize: 13 }}>{fmt(p.CreatedAt)}</td>
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

export default AdminPlayerDetail;
