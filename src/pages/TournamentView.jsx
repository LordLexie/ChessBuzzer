import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';

import DashboardWrapper from '../components/layouts/DashboardWrapper';
import TopNav from '../components/layouts/TopNav';
import Sidebar from '../components/layouts/Sidebar';
import { Icons } from '../components/ui/Icons';

const STATUS_PILL = {
    draft:               'grey',
    registration_open:   'green',
    registration_closed: 'gold',
    in_progress:         'green',
    paused:              'gold',
    completed:           'green',
    cancelled:           'coral',
};

function StatusPill({ status }) {
    const cls = STATUS_PILL[status] ?? 'grey';
    return (
        <span className={`cb-pill ${cls}`}>
            <span className="dot" />
            {status?.replace(/_/g, ' ')}
        </span>
    );
}

function ParticipantPill({ status }) {
    const map = { registered: 'green', withdrawn: 'gold', disqualified: 'coral' };
    const cls = map[status] ?? 'grey';
    return <span className={`cb-pill ${cls}`} style={{ fontSize: 11, padding: '2px 8px' }}>{status}</span>;
}

function TournamentView() {
    const { tournamentId } = useParams();
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);

    const myParticipant = tournament?.participants?.find(p => p.user_id === auth.user_id);
    const canJoin = tournament?.status === 'registration_open' && !myParticipant;
    const canWithdraw = tournament?.status === 'registration_open' && myParticipant?.status === 'registered';

    const refresh = () =>
        axios.get(`/api/v1/tournament/${tournamentId}`)
            .then(res => setTournament(res.data?.data ?? null));

    const handleJoin = async () => {
        setJoining(true);
        try {
            await axios.post(`/api/v1/tournament/${tournamentId}/participants`);
            toast.success('Successfully joined the tournament');
            await refresh();
        } catch (err) {
            const msg = err.response?.data?.Data ?? 'Failed to join tournament';
            const symbol = tournament?.currency?.symbol || tournament?.currency_code || '';
            const display = msg === 'Insufficient balance'
                ? `Insufficient balance. Entry fee is ${symbol} ${tournament?.entry_fee}. Please top up your wallet.`
                : msg;
            toast.error(display, { duration: 4000 });
        } finally {
            setJoining(false);
        }
    };

    const handleWithdraw = async () => {
        setWithdrawing(true);
        try {
            await axios.delete(`/api/v1/tournament/${tournamentId}/participants`);
            toast.success('Successfully withdrawn from the tournament');
            await refresh();
        } catch (err) {
            toast.error(err.response?.data?.Data ?? 'Failed to withdraw');
        } finally {
            setWithdrawing(false);
        }
    };

    useEffect(() => {
        axios.get(`/api/v1/tournament/${tournamentId}`)
            .then(res => setTournament(res.data?.data ?? null))
            .catch(() => toast.error('Failed to load tournament'))
            .finally(() => setLoading(false));
    }, [tournamentId]);

    const fmt = date => date
        ? new Date(date).toLocaleString('en-KE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
        : '—';

    const t = tournament;

    return (
        <DashboardWrapper>
            <Sidebar />
            <div className="cb-main">
                <TopNav />
                <div className="cb-body">
                    {loading ? (
                        <div className="cb-center"><div className="cb-spinner" /></div>
                    ) : !t ? null : (
                        <>
                            {/* Page header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                                <button className="cb-back" onClick={() => navigate('/tournaments')}>
                                    <Icons.back size={16} /> Back
                                </button>
                                <div style={{ flex: 1 }}>
                                    <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: '-.02em', marginBottom: 4 }}>
                                        {t.name}
                                    </h1>
                                    <StatusPill status={t.status} />
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {canWithdraw && (
                                        <button className="cb-btn cb-btn-ghost" onClick={handleWithdraw} disabled={withdrawing}>
                                            {withdrawing ? <span className="cb-spinner sm" /> : null}
                                            Withdraw
                                        </button>
                                    )}
                                    {canJoin && (
                                        <button className="cb-btn cb-btn-primary" onClick={handleJoin} disabled={joining}>
                                            {joining ? <span className="cb-spinner sm" /> : null}
                                            Join Tournament
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Stat cards */}
                            <div className="cb-stats" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                                <div className="cb-stat s-gold">
                                    <div className="cb-stat ic"><Icons.ticket size={22} /></div>
                                    <div className="lab">Entry Fee</div>
                                    <div className="big">
                                        <sup>{t.currency?.symbol}</sup>
                                        {t.entry_fee ?? 0}
                                    </div>
                                </div>
                                <div className="cb-stat s-green">
                                    <div className="cb-stat ic"><Icons.trophy size={22} /></div>
                                    <div className="lab">Prize Pool</div>
                                    <div className="big">
                                        <sup>{t.currency?.symbol}</sup>
                                        {t.prize_pool ?? 0}
                                    </div>
                                </div>
                                <div className="cb-stat s-coral">
                                    <div className="cb-stat ic"><Icons.coins size={22} /></div>
                                    <div className="lab">Total Collections</div>
                                    <div className="big">
                                        <sup>{t.currency?.symbol}</sup>
                                        {t.collected_amount ?? 0}
                                    </div>
                                </div>
                            </div>

                            {/* Details card */}
                            <div className="cb-card">
                                <div className="cb-card-head">
                                    <Icons.grid size={18} />
                                    <h2>Details</h2>
                                </div>
                                <div className="cb-card-body">
                                    <div className="cb-det">
                                        <div className="cb-kv">
                                            <div className="k"><Icons.clock size={14} /> Status</div>
                                            <div className="v"><StatusPill status={t.status} /></div>
                                        </div>
                                        <div className="cb-kv">
                                            <div className="k">Type</div>
                                            <div className="v" style={{ textTransform: 'capitalize' }}>{t.tournament_type}</div>
                                        </div>
                                        <div className="cb-kv">
                                            <div className="k"><Icons.clock size={14} /> Time Control</div>
                                            <div className="v">{t.time_control || '—'}</div>
                                        </div>
                                        <div className="cb-kv">
                                            <div className="k"><Icons.clock size={14} /> Duration</div>
                                            <div className="v">{t.duration ? `${t.duration} mins` : '—'}</div>
                                        </div>
                                        <div className="cb-kv">
                                            <div className="k"><Icons.calendar size={14} /> Start Date</div>
                                            <div className="v">{fmt(t.start_date)}</div>
                                        </div>
                                        <div className="cb-kv">
                                            <div className="k"><Icons.crown size={14} /> Organizer</div>
                                            <div className="v">{t.organizer?.username ?? '—'}</div>
                                        </div>
                                        <div className="cb-kv">
                                            <div className="k"><Icons.trophy size={14} /> Prize Type</div>
                                            <div className="v" style={{ textTransform: 'capitalize' }}>{t.prize_type?.replace(/_/g, ' ') || '—'}</div>
                                        </div>
                                        {t.fund_source_code && (
                                            <div className="cb-kv">
                                                <div className="k">Fund Source</div>
                                                <div className="v" style={{ textTransform: 'capitalize' }}>{t.fund_source_code}</div>
                                            </div>
                                        )}
                                    </div>
                                    {t.event_link && (
                                        <div className="cb-kv" style={{ marginTop: 20 }}>
                                            <div className="k"><Icons.link size={14} /> Event Link</div>
                                            <div className="v">
                                                <a href={t.event_link} target="_blank" rel="noreferrer">{t.event_link}</a>
                                            </div>
                                        </div>
                                    )}
                                    {t.description && (
                                        <div className="cb-kv" style={{ marginTop: 20 }}>
                                            <div className="k">Description</div>
                                            <div className="v" style={{ fontSize: 14, color: '#8A9D92', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{t.description}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Participants card */}
                            <div className="cb-card">
                                <div className="cb-card-head">
                                    <Icons.users size={18} />
                                    <h2>Participants</h2>
                                    <span className="cb-count">{t.participants?.length ?? 0}</span>
                                </div>
                                <div className="cb-table-wrap">
                                    {(!t.participants || t.participants.length === 0) ? (
                                        <div className="cb-empty">No participants yet.</div>
                                    ) : (
                                        <table className="cb-table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Username</th>
                                                    <th>Status</th>
                                                    <th>Rank</th>
                                                    <th>Score</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {t.participants.map((p, i) => {
                                                    const isMe = String(p.user_id) === String(auth.user_id);
                                                    return (
                                                        <tr key={p.ID} style={isMe ? { background: '#10261b' } : {}}>
                                                            <td className="cb-muted">{i + 1}</td>
                                                            <td>
                                                                <span style={{ fontWeight: 700, color: isMe ? '#3BE089' : '#E8F1EB' }}>
                                                                    {p.user?.username ?? '—'}
                                                                </span>
                                                                {isMe && <span className="cb-pill green" style={{ fontSize: 11, padding: '2px 8px', marginLeft: 8 }}>You</span>}
                                                            </td>
                                                            <td><ParticipantPill status={p.status} /></td>
                                                            <td className="cb-muted">{p.rank ?? '—'}</td>
                                                            <td className="cb-muted">{p.score ?? '—'}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
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

export default TournamentView;
