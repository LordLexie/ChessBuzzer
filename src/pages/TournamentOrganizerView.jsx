import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
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

const medalLabel = pos => pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : `#${pos}`;

function TournamentOrganizerView() {
    const { tournamentId } = useParams();
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [edits, setEdits] = useState({});
    const [saving, setSaving] = useState({});
    const [prizes, setPrizes] = useState([]);
    const [disbursing, setDisbursing] = useState(false);

    useEffect(() => {
        axios.get(`/api/v1/tournament/${tournamentId}`)
            .then(res => {
                const t = res.data?.data ?? null;
                if (t && String(t.organizer_id) !== String(auth.user_id)) {
                    navigate(`/tournaments/${tournamentId}`, { replace: true });
                    return;
                }
                setTournament(t);
                if (t) {
                    const initial = {};
                    (t.participants ?? []).forEach(p => {
                        initial[p.ID] = { rank: p.rank, score: p.score };
                    });
                    setEdits(initial);
                    if (t.status === 'completed' && t.prize_type === 'fixed') {
                        axios.get(`/api/v1/tournament/${tournamentId}/prizes`)
                            .then(res => setPrizes(res.data?.data ?? []))
                            .catch(() => {});
                    }
                }
            })
            .catch(() => toast.error('Failed to load tournament'))
            .finally(() => setLoading(false));
    }, [tournamentId]);

    const handleSave = async (p) => {
        setSaving(s => ({ ...s, [p.ID]: true }));
        try {
            await axios.patch(`/api/v1/tournament-participant/${p.ID}`, {
                ID: p.ID,
                Rank: edits[p.ID]?.rank ?? p.rank,
                Score: edits[p.ID]?.score ?? p.score,
            });
            toast.success(`Saved rank for ${p.user?.username ?? 'participant'}`);
        } catch (err) {
            toast.error(err.response?.data?.data ?? 'Failed to save');
        } finally {
            setSaving(s => ({ ...s, [p.ID]: false }));
        }
    };

    const handleDisburseAll = async () => {
        const result = await Swal.fire({
            title: 'Disburse Prizes?',
            text: 'Winners will be paid and a platform fee deducted. This cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3BE089',
            cancelButtonColor: '#243029',
            confirmButtonText: 'Yes, disburse',
            background: '#121C18',
            color: '#E8F1EB',
        });
        if (!result.isConfirmed) return;
        setDisbursing(true);
        try {
            await axios.post(`/api/v1/tournament/${tournamentId}/disburse`);
            toast.success('Prizes disbursed successfully');
            const res = await axios.get(`/api/v1/tournament/${tournamentId}`);
            setTournament(res.data?.data ?? tournament);
        } catch (err) {
            toast.error(err.response?.data?.data ?? 'Disbursement failed');
        } finally {
            setDisbursing(false);
        }
    };

    const canEditRanks = tournament?.status === 'completed';

    const disbursementRows = () => {
        if (!tournament) return [];
        if (tournament.prize_type === 'winner_takes_all') {
            return [{ position: 1, percentage: 100, amount: tournament.prize_pool }];
        }
        return prizes.map(p => ({
            id: p.ID,
            position: p.position,
            percentage: p.percentage,
            amount: ((p.percentage / 100) * tournament.prize_pool),
        }));
    };

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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                                        <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: '-.02em' }}>
                                            {t.name}
                                        </h1>
                                        <span className="cb-pill gold" style={{ fontSize: 11, padding: '2px 8px' }}>Organizer View</span>
                                    </div>
                                    <StatusPill status={t.status} />
                                </div>
                                <button className="cb-btn cb-btn-ghost" style={{ fontSize: 13, padding: '7px 14px' }}
                                    onClick={() => navigate(`/tournaments/${tournamentId}/edit`)}>
                                    <Icons.edit size={15} /> Edit
                                </button>
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
                                    {canEditRanks && (
                                        <span className="cb-hint" style={{ fontSize: 12, color: '#8A9D92' }}>Edit ranks and scores, then save each row</span>
                                    )}
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
                                                    {canEditRanks && <th></th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {t.participants.map((p, i) => (
                                                    <tr key={p.ID}>
                                                        <td className="cb-muted">{i + 1}</td>
                                                        <td style={{ fontWeight: 700 }}>{p.user?.username ?? '—'}</td>
                                                        <td><ParticipantPill status={p.status} /></td>
                                                        <td>
                                                            {canEditRanks ? (
                                                                <input
                                                                    type="number"
                                                                    className="cb-input"
                                                                    style={{ width: 80, padding: '6px 10px' }}
                                                                    value={edits[p.ID]?.rank ?? p.rank ?? ''}
                                                                    onChange={e => setEdits(s => ({
                                                                        ...s,
                                                                        [p.ID]: { ...s[p.ID], rank: parseInt(e.target.value) || 0 },
                                                                    }))}
                                                                />
                                                            ) : (
                                                                <span className="cb-muted">{p.rank ?? '—'}</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {canEditRanks ? (
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    className="cb-input"
                                                                    style={{ width: 90, padding: '6px 10px' }}
                                                                    value={edits[p.ID]?.score ?? p.score ?? ''}
                                                                    onChange={e => setEdits(s => ({
                                                                        ...s,
                                                                        [p.ID]: { ...s[p.ID], score: parseFloat(e.target.value) || 0 },
                                                                    }))}
                                                                />
                                                            ) : (
                                                                <span className="cb-muted">{p.score ?? '—'}</span>
                                                            )}
                                                        </td>
                                                        {canEditRanks && (
                                                            <td>
                                                                <button
                                                                    className="cb-btn cb-btn-ghost"
                                                                    style={{ padding: '5px 14px', fontSize: 13 }}
                                                                    onClick={() => handleSave(p)}
                                                                    disabled={saving[p.ID]}
                                                                >
                                                                    {saving[p.ID] ? <span className="cb-spinner sm" /> : <Icons.check size={14} />}
                                                                    Save
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>

                            {/* Prize Disbursement card — only when completed */}
                            {canEditRanks && (
                                <div className="cb-card">
                                    <div className="cb-card-head">
                                        <Icons.trophy size={18} />
                                        <h2>Prize Disbursement</h2>
                                        {t.disbursed_at && (
                                            <span className="cb-pill green" style={{ marginLeft: 'auto' }}>
                                                <span className="dot" /> All Prizes Disbursed
                                            </span>
                                        )}
                                    </div>
                                    <div className="cb-table-wrap">
                                        {disbursementRows().length === 0 ? (
                                            <div className="cb-empty">No prize tiers configured.</div>
                                        ) : (
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
                                                        const winner = t.participants?.find(par => par.rank === row.position);
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
                                        )}
                                    </div>
                                    {disbursementRows().length > 0 && !t.disbursed_at && (
                                        <div className="cb-card-foot" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <button
                                                className="cb-btn cb-btn-primary"
                                                onClick={handleDisburseAll}
                                                disabled={disbursing}
                                            >
                                                {disbursing ? <span className="cb-spinner sm" /> : <Icons.send size={16} />}
                                                Disburse All
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </DashboardWrapper>
    );
}

export default TournamentOrganizerView;
