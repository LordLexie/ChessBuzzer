import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import { Icons, CHESS } from '../../components/ui/Icons';

const STATUS_PILL = {
    draft:               'grey',
    registration_open:   'green',
    registration_closed: 'gold',
    in_progress:         'green',
    paused:              'gold',
    completed:           'green',
    disbursed:           'green',
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

const medalLabel = pos => pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : `#${pos}`;

function AdminTournamentDetail() {
    const { tournamentId } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [prizes, setPrizes] = useState([]);

    useEffect(() => {
        axios.get(`/api/v1/admin/tournaments/${tournamentId}`)
            .then(res => {
                const t = res.data?.data ?? null;
                setTournament(t);
                if (t?.status === 'completed' && t?.prize_type === 'fixed') {
                    axios.get(`/api/v1/tournament/${tournamentId}/prizes`)
                        .catch(() => {});
                }
            })
            .catch(() => toast.error('Failed to load tournament'))
            .finally(() => setLoading(false));
    }, [tournamentId]);

    const fmt = date => date
        ? new Date(date).toLocaleString('en-KE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
        : '—';

    const disbursementRows = () => {
        if (!tournament) return [];
        if (tournament.prize_type === 'winner_takes_all') {
            return [{ position: 1, percentage: 100, amount: tournament.prize_pool }];
        }
        return prizes.map(p => ({
            position: p.position,
            percentage: p.percentage,
            amount: (p.percentage / 100) * tournament.prize_pool,
        }));
    };

    const t = tournament;

    return (
        <DashboardWrapper>
            <AdminSidebar />
            <div className="cb-main">
                <AdminTopNav />
                <div className="cb-body">
                    {loading ? (
                        <div className="cb-center"><div className="cb-spinner" /></div>
                    ) : !t ? (
                        <div className="cb-empty">Tournament not found.</div>
                    ) : (
                        <>
                            {/* Page header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                                <h1 style={{ flex: 1, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: '-.02em' }}>
                                    <span style={{ marginRight: 10, fontSize: 28, lineHeight: 1 }}>{CHESS.knight}</span>
                                    {t.name}
                                </h1>
                                <button className="cb-btn cb-btn-ghost" style={{ fontSize: 13, padding: '7px 14px' }}
                                    onClick={() => navigate('/admin/tournaments')}>
                                    <Icons.back size={15} /> Back
                                </button>
                            </div>

                            {/* Details card with stat cards */}
                            <div className="cb-card">
                                <div className="cb-card-head">
                                    <Icons.grid size={18} />
                                    <h2>Details</h2>
                                </div>
                                <div className="cb-card-body">
                                    <div className="cb-stats" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 20 }}>
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

                                    <div className="cb-det">
                                        <div className="cb-kv">
                                            <div className="k">Status</div>
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
                                        <div className="cb-kv">
                                            <div className="k">Fund Source</div>
                                            <div className="v" style={{ textTransform: 'capitalize' }}>{t.fund_source_code || '—'}</div>
                                        </div>
                                        {t.disbursed_at && (
                                            <div className="cb-kv">
                                                <div className="k"><Icons.check size={14} /> Disbursed At</div>
                                                <div className="v" style={{ color: '#3BE089' }}>{fmt(t.disbursed_at)}</div>
                                            </div>
                                        )}
                                    </div>
                                    {t.event_link && (
                                        <div className="cb-kv" style={{ marginTop: 20 }}>
                                            <div className="k"><Icons.link size={14} /> Event Link</div>
                                            <div className="v"><a href={t.event_link} target="_blank" rel="noreferrer">{t.event_link}</a></div>
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
                                                {t.participants.map((p, i) => (
                                                    <tr key={p.ID}>
                                                        <td className="cb-muted">{i + 1}</td>
                                                        <td style={{ fontWeight: 700 }}>{p.user?.username ?? '—'}</td>
                                                        <td><ParticipantPill status={p.status} /></td>
                                                        <td className="cb-muted">{p.rank ?? '—'}</td>
                                                        <td className="cb-muted">{p.score ?? '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>

                            {/* Prize breakdown — visible when completed or disbursed */}
                            {(t.status === 'completed' || t.status === 'disbursed') && disbursementRows().length > 0 && (
                                <div className="cb-card">
                                    <div className="cb-card-head">
                                        <Icons.trophy size={18} />
                                        <h2>Prize Breakdown</h2>
                                        {t.disbursed_at && (
                                            <span className="cb-pill green" style={{ marginLeft: 'auto' }}>
                                                <span className="dot" /> Disbursed
                                            </span>
                                        )}
                                    </div>
                                    <div className="cb-table-wrap">
                                        <table className="cb-table">
                                            <thead>
                                                <tr>
                                                    <th>Position</th>
                                                    <th>Winner</th>
                                                    <th>Prize Amount</th>
                                                    <th>% of Pool</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {disbursementRows().map(row => {
                                                    const winner = t.participants?.find(p => p.rank === row.position);
                                                    return (
                                                        <tr key={row.position}>
                                                            <td style={{ fontWeight: 700, color: '#F2C14E' }}>{medalLabel(row.position)}</td>
                                                            <td style={{ fontWeight: 700 }}>{winner?.user?.username ?? <span className="cb-muted">—</span>}</td>
                                                            <td>
                                                                <span className="cb-mono green" style={{ fontSize: 15 }}>
                                                                    {t.currency?.symbol} {row.amount.toFixed(2)}
                                                                </span>
                                                            </td>
                                                            <td className="cb-muted">{row.percentage}%</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </DashboardWrapper>
    );
}

export default AdminTournamentDetail;
