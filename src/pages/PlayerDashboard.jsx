import { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import Modal from 'react-bootstrap/Modal';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import TopNav from '../components/layouts/TopNav';
import Sidebar from '../components/layouts/Sidebar';
import DashboardWrapper from '../components/layouts/DashboardWrapper';
import { Icons } from '../components/ui/Icons';

function FormatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function TimeAgo(dateString) {
    const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function formatMoney(num) {
    const [int, dec] = num.toString().split('.');
    return int.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (dec ? '.' + dec.slice(0, 3) : '');
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

function seriesLabel(length) {
    if (!length || length <= 1) return null;
    return `Best of ${length}`;
}

const SERIES_OPTIONS = [
    { label: '1 game', value: 1 },
    { label: 'Best of 3', value: 3 },
    { label: 'Best of 5', value: 5 },
    { label: 'Best of 7', value: 7 },
];
const STATUS_FILTERS = ['all', 'pending', 'active', 'complete', 'canceled'];
const RAIL_COLORS = { pending: '#F2C14E', active: '#3BE089', complete: '#2E3C34', canceled: '#FF6A3D' };

function StatusPill({ status }) {
    const map = {
        pending:  { cls: 'gold',  label: 'Pending' },
        active:   { cls: 'green', label: 'Active',   pulse: true },
        complete: { cls: 'grey',  label: 'Complete' },
        canceled: { cls: 'coral', label: 'Canceled' },
    };
    const { cls, label, pulse } = map[status] || { cls: 'grey', label: status };
    return (
        <span className={`cb-pill ${cls}`}>
            <span className={`dot${pulse ? ' pulse' : ''}`} />
            {label}
        </span>
    );
}

function PlayerDashboard() {
    const { auth } = useAuth();
    const userId = auth.user_id;

    const [users, setUsers] = useState([]);
    const [opponent, setOpponent] = useState({});
    const [userWallets, setWallets] = useState([]);
    const [walletsLoading, setWalletsLoading] = useState(true);
    const [userChallenges, setChallenges] = useState([]);
    const [depositModal, setDepositModal] = useState(false);
    const [withdrawModal, setWithdrawModal] = useState(false);
    const [depositing, setDepositing] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);
    const [challengeTypes, setChallengeTypes] = useState([]);
    const [challengeModal, setChallengeModal] = useState(false);
    const [gameSettleModal, setGameSettleModal] = useState(false);
    const [challengeMode, setChallengeMode] = useState('specific');
    const [seriesLength, setSeriesLength] = useState(1);
    const [challengeFilter, setChallengeFilter] = useState('all');
    const [claimPayload, setClaimPayload] = useState({ GameType: '', ChallengeID: '' });
    const [recentGames, setRecentGames] = useState([]);
    const [loadingGames, setLoadingGames] = useState(false);
    const [selectedGameUUID, setSelectedGameUUID] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);
    const [challengeCreatedAt, setChallengeCreatedAt] = useState(null);
    const [gameVariables, setGameVariables] = useState({ challenge_type_code: '', currency: '', fees: 0 });
    const [depositVariables, setDepositVariables] = useState({ phoneNumber: '', amount: 1, projectCode: '', transactionId: '', userId: parseInt(userId) });
    const [withdrawVariables, setWithdrawVariables] = useState({ phone: '', amount: 1, user_id: parseInt(userId), wallet_id: 0 });
    const [inputErrors, setInputErrors] = useState({ opponent: '', game_type: '', currency: '', amount: '' });

    const handleGameInput = (e) => setGameVariables(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleDepositInput = (e) => setDepositVariables(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleWithdrawInput = (e) => setWithdrawVariables(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleClaimInput = (e) => setClaimPayload(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const closeChallengeModal = () => {
        setChallengeModal(false);
        setOpponent({});
        setChallengeMode('specific');
        setSeriesLength(1);
    };

    const openGameSettleModal = (challengeId, gameType, createdAt) => {
        setGameSettleModal(true);
        setClaimPayload({ GameType: gameType, ChallengeID: challengeId });
        setChallengeCreatedAt(createdAt);
        setSelectedGameUUID('');
        setShowManualInput(false);
        fetchRecentGames(createdAt);
    };

    const closeGameSettleModal = () => {
        setGameSettleModal(false);
        setClaimPayload({ GameType: '', ChallengeID: '' });
        setRecentGames([]);
        setSelectedGameUUID('');
        setShowManualInput(false);
        setChallengeCreatedAt(null);
    };

    const fetchChallenges = () => {
        axios.get(`api/v1/challenge-martrix/player_games/${userId}`).then(res => {
            if (res.data.status === 'Ok') setChallenges(res.data.data ?? []);
        });
    };

    const fetchWallets = () => {
        setWalletsLoading(true);
        axios.get(`api/v1/player-wallet/user/${userId}`)
            .then(res => { if (res.data.status === 'Ok') setWallets(res.data.data ?? []); })
            .finally(() => setWalletsLoading(false));
    };

    const fetchGameTypes = () => {
        axios.get('api/v1/challenge-type').then(res => {
            if (res.data.status === 'Ok') setChallengeTypes(res.data.data);
        });
    };

    const fetchProfile = () => {
        axios.get(`api/v1/user/${userId}`).then(res => {
            if (res.data.status === 'Ok') {
                const phone = res.data.data.phone ?? '';
                setDepositVariables(prev => ({ ...prev, phoneNumber: phone }));
                setWithdrawVariables(prev => ({ ...prev, phone }));
            }
        });
    };

    const searchUsers = (event) => {
        if (event.length > 0) {
            axios.post('api/v1/user/search', { username: event }).then(res => {
                if (res.data.status === 'Ok' && res.data.data) {
                    setUsers(res.data.data.map(u => ({ value: u.id, label: u.username })));
                }
            });
        }
    };

    const cancelGame = (gameId) => {
        axios.patch(`api/v1/challenge/cancel_challenge/${gameId}`, { ID: gameId, CanceledBy: userId }).then(res => {
            if (res.data.status === 'Ok') { toast.success('Challenge canceled'); fetchChallenges(); fetchWallets(); }
        });
    };

    const updateGame = (matrixId, action) => {
        axios.patch(`api/v1/challenge-martrix/${matrixId}`, { ID: matrixId, Player: userId, AcceptedChallenge: action }).then(res => {
            if (res.data.status === 'Ok') { toast.success('Challenge updated'); fetchChallenges(); fetchWallets(); }
        });
    };

    const fetchRecentGames = (since) => {
        setLoadingGames(true);
        setRecentGames([]);
        const sinceTs = since ? Math.floor(new Date(since).getTime() / 1000) : 0;
        axios.get(`api/v1/games/recent?since=${sinceTs}`)
            .then(res => setRecentGames(res.data?.data ?? []))
            .catch(() => { toast.error('Could not load recent games'); setShowManualInput(true); })
            .finally(() => setLoadingGames(false));
    };

    const saveDeposit = (e) => {
        e.preventDefault();
        if (!depositVariables.phoneNumber) { toast.error('Phone number is required!'); return; }
        if (depositVariables.phoneNumber.length < 9 || depositVariables.phoneNumber.length > 12) {
            toast.error('Phone number must be between 9 and 12 digits!'); return;
        }
        setDepositing(true);
        axios.post('api/v1/stk-push/smplypay', { ...depositVariables, amount: parseInt(depositVariables.amount) })
            .then(res => {
                if (res.data.code == 200) { toast.success('STK push initiated — check your phone!'); setDepositModal(false); fetchWallets(); }
                else toast.error('Failed to initiate deposit.');
            })
            .finally(() => setDepositing(false));
    };

    const withdrawDeposit = (e) => {
        e.preventDefault();
        if (!withdrawVariables.phone) { toast.error('Phone number is required!'); return; }
        if (withdrawVariables.phone.length < 9 || withdrawVariables.phone.length > 12) {
            toast.error('Phone number must be between 9 and 12 digits!'); return;
        }
        const w = userWallets[0];
        if (w && parseFloat(withdrawVariables.amount) > w.balance) {
            toast.error(`Amount exceeds available balance (${w.currency} ${w.balance?.toLocaleString()})`); return;
        }
        const payload = { ...withdrawVariables, amount: parseInt(withdrawVariables.amount), wallet_id: w?.id ?? 0 };
        setWithdrawing(true);
        axios.post('api/v1/player-wallet/withdraw', payload)
            .then(res => {
                if (res.data.code == 200) { toast.success('Withdrawal initiated!'); setWithdrawModal(false); fetchWallets(); }
                else toast.error('Failed to initiate withdrawal.');
            })
            .catch(err => toast.error(err.response?.data?.message || 'An unexpected error occurred.'))
            .finally(() => setWithdrawing(false));
    };

    const challengeSubmit = (e) => {
        e.preventDefault();
        const errors = { opponent: '', game_type: '', currency: '', amount: '' };
        let proceed = true;
        if (challengeMode === 'specific' && !opponent?.value) { proceed = false; errors.opponent = 'opponent required *'; }
        if (!gameVariables.challenge_type_code) { proceed = false; errors.game_type = 'game type required *'; }
        if (!gameVariables.currency) { proceed = false; errors.currency = 'currency required *'; }
        if (parseFloat(gameVariables.fees) <= 0) { proceed = false; errors.amount = 'cannot be less than 1 *'; }
        setInputErrors(errors);
        if (!proceed) return;

        if (challengeMode === 'open') {
            const data = {
                CreatedBy: parseInt(userId),
                ChallengeTypeCode: gameVariables.challenge_type_code,
                Currency: gameVariables.currency,
                Fees: parseFloat(gameVariables.fees),
                SeriesLength: seriesLength,
            };
            axios.post('api/v1/challenge/open', data)
                .then(res => {
                    if (res.data.status === 'Ok') { fetchChallenges(); fetchWallets(); closeChallengeModal(); setGameVariables({ challenge_type_code: '', currency: '', fees: 0 }); toast.success('Open challenge posted!'); }
                    else toast.error(res.data.data || 'Failed');
                })
                .catch(err => toast.error(err.response?.data?.Data || 'Failed to post challenge.'));
        } else {
            const data = {
                CreatedBy: parseInt(userId),
                MaxPlayers: 2,
                ChallengeTypeCode: gameVariables.challenge_type_code,
                Description: 'set by user',
                Currency: gameVariables.currency,
                Fees: parseFloat(gameVariables.fees),
                Players: [parseInt(userId), parseInt(opponent.value)],
                SeriesLength: seriesLength,
            };
            axios.post('api/v1/challenge', data)
                .then(res => {
                    if (res.data.status === 'Ok') { fetchChallenges(); fetchWallets(); closeChallengeModal(); setGameVariables({ challenge_type_code: '', currency: '', fees: 0 }); toast.success('Challenge created!'); }
                    else toast.error(res.data.data || 'Failed');
                })
                .catch(err => toast.error(err.response?.data?.Data || 'Failed to create challenge.'));
        }
    };

    const claimGame = (e) => {
        e.preventDefault();
        const gameId = showManualInput ? claimPayload.GameID : selectedGameUUID;
        if (!gameId) { toast.error('Select a game or enter a Game ID'); return; }
        axios.post('api/v1/game', { ...claimPayload, GameID: gameId }).then(res => {
            if (res.data.status === 'Ok') {
                const data = res.data.data;
                if (data?.series_ongoing) {
                    Swal.fire({ icon: 'info', title: 'Game recorded!', html: `Score: <b>${data.winner_wins} – ${data.opponent_wins}</b><br/>First to <b>${data.wins_needed}</b> wins takes the prize.`, background: '#121C18', color: '#E8F1EB' });
                } else {
                    toast.success('Game claimed!');
                }
                fetchChallenges(); fetchWallets(); closeGameSettleModal();
            } else {
                toast.error(res.data.data || 'Failed to claim');
            }
        }).catch(() => toast.error('Claim failed — please try again.'));
    };

    useEffect(() => {
        fetchChallenges(); fetchWallets(); fetchGameTypes(); fetchProfile();
    }, []);

    const filteredChallenges = challengeFilter === 'all'
        ? (userChallenges ?? [])
        : (userChallenges?.filter(c => c.Status === challengeFilter) ?? []);
    const filterCounts = STATUS_FILTERS.reduce((acc, f) => {
        acc[f] = f === 'all' ? (userChallenges?.length ?? 0) : (userChallenges?.filter(c => c.Status === f).length ?? 0);
        return acc;
    }, {});

    const selWallet = userWallets.find(w => w.currency === gameVariables.currency);
    const insufficient = selWallet && parseFloat(gameVariables.fees) > selWallet.balance;

    const activeCount   = (userChallenges ?? []).filter(c => c.Status === 'active').length;
    const pendingCount  = (userChallenges ?? []).filter(c => c.Status === 'pending').length;
    const completeCount = (userChallenges ?? []).filter(c => c.Status === 'complete').length;
    const totalWagered  = (userChallenges ?? []).reduce((s, c) => s + (parseFloat(c.EntryFee) || 0), 0);

    return (
        <DashboardWrapper>
            <Sidebar />
            <div className="cb-main">
                <TopNav
                    title={`${getGreeting()}, ${auth.username}`}
                    subtitle="Here's what's happening with your games today."
                />
                <div className="cb-body">

                    {/* ── Hero bar ── */}
                    <div className="cb-hero-bar">
                        <div className="cb-hero-id">
                            <div className="cb-avatar lg">{(auth.username || 'U')[0].toUpperCase()}</div>
                            <div>
                                <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 17 }}>
                                    {auth.username}
                                </div>
                                <small style={{ fontSize: 12.5, color: '#8A9D92', display: 'block', marginTop: 2 }}>
                                    Chess Buzzer player
                                </small>
                            </div>
                        </div>

                        <div className="cb-hero-bal">
                            <div className="cb-hero-bal-label"><Icons.wallet size={14} />Wallet balance</div>
                            {walletsLoading ? (
                                <div style={{ width: 180, height: 36, background: '#10261b', borderRadius: 8 }} />
                            ) : userWallets.length > 0 ? (
                                <div className="cb-hero-amount">
                                    <span style={{ fontFamily: "'Hanken Grotesk'", fontSize: 15, color: '#a98a3c', verticalAlign: 'super', marginRight: 7 }}>
                                        {userWallets[0].currency}
                                    </span>
                                    {formatMoney(userWallets[0].balance)}
                                </div>
                            ) : (
                                <div className="cb-hero-amount" style={{ color: '#8A9D92' }}>—</div>
                            )}
                        </div>

                        <div className="cb-hero-actions">
                            <button className="cb-btn cb-btn-ghost" onClick={() => setDepositModal(true)}>Deposit</button>
                            <button className="cb-btn cb-btn-ghost" onClick={() => setWithdrawModal(true)}>Withdraw</button>
                            <button className="cb-btn cb-btn-primary" onClick={() => setChallengeModal(true)}>
                                <Icons.plus size={16} /> New Challenge
                            </button>
                        </div>
                    </div>

                    {/* ── KPI strip ── */}
                    <div className="cb-kpi-strip">
                        {[
                            { ic: <Icons.zap size={20} />,   tint: '#2a2310', col: '#F2C14E', lab: 'Active now',    val: activeCount },
                            { ic: <Icons.clock size={20} />, tint: '#2a2310', col: '#F2C14E', lab: 'Pending',        val: pendingCount },
                            { ic: <Icons.trophy size={20} />,tint: '#10261b', col: '#3BE089', lab: 'Completed',      val: completeCount },
                            { ic: <Icons.coins size={20} />, tint: '#10261b', col: '#3BE089', lab: 'Total wagered',  val: totalWagered.toLocaleString(), cur: userWallets[0]?.currency },
                        ].map((k, i) => (
                            <div key={i} className="cb-kpi">
                                <div className="ic" style={{ background: k.tint, color: k.col }}>{k.ic}</div>
                                <div>
                                    <div className="lab">{k.lab}</div>
                                    <div className="val">{k.cur && <small>{k.cur}</small>}{k.val}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Challenge board ── */}
                    <div className="cb-card">
                        <div className="cb-card-head">
                            <Icons.grid size={20} />
                            <h2>My Challenges</h2>
                            <span className="cb-count">{userChallenges?.length ?? 0}</span>
                        </div>

                        <div className="cb-tabs">
                            {STATUS_FILTERS.map(f => (
                                <button key={f}
                                    className={`cb-tab ${challengeFilter === f ? 'active' : ''}`}
                                    onClick={() => setChallengeFilter(f)}>
                                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                                    {filterCounts[f] > 0 && <span className="cb-count">{filterCounts[f]}</span>}
                                </button>
                            ))}
                        </div>

                        <div className="cb-table-wrap">
                            <table className="cb-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Date</th>
                                        <th>Challenge</th>
                                        <th>Entry Fee</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredChallenges.map((ch, i) => (
                                        <tr key={i} className="cb-challenge-row" style={{ '--rail': RAIL_COLORS[ch.Status] }}>
                                            <td className="cb-muted">{i + 1}</td>
                                            <td className="cb-muted" style={{ fontSize: 13 }}>{FormatTime(ch.CreatedAt)}</td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{ch.Description}</div>
                                                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                                                    {ch.SeriesLength > 1 && (
                                                        <span className="cb-fmt cb-fmt-bo3">{seriesLabel(ch.SeriesLength)}</span>
                                                    )}
                                                    {ch.IsOpen && (
                                                        <span className="cb-fmt cb-fmt-open">Open</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="cb-mono gold" style={{ fontSize: 14 }}>{ch.Currency} {ch.EntryFee}</span>
                                            </td>
                                            <td>
                                                <StatusPill status={ch.Status} />
                                                {ch.Status === 'active' && ch.SeriesLength > 1 && (
                                                    <div className="cb-muted" style={{ fontSize: 11, marginTop: 4 }}>
                                                        {ch.Wins} wins · need {Math.floor(ch.SeriesLength / 2) + 1}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                    {ch.Status === 'pending' && ch.AcceptedChallenge == 1 && (
                                                        <button className="cb-btn cb-btn-danger" style={{ padding: '5px 12px', fontSize: 12 }}
                                                            onClick={() => cancelGame(ch.Challengeid)}>
                                                            Cancel
                                                        </button>
                                                    )}
                                                    {ch.Status === 'pending' && ch.AcceptedChallenge != 1 && (
                                                        <>
                                                            <button className="cb-btn cb-btn-primary" style={{ padding: '5px 12px', fontSize: 12 }}
                                                                onClick={() => updateGame(ch.ID, 1)}>
                                                                Accept
                                                            </button>
                                                            <button className="cb-btn cb-btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }}
                                                                onClick={() => updateGame(ch.ID, 3)}>
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {ch.Status === 'active' && (
                                                        <button className="cb-btn cb-btn-outline" style={{ padding: '5px 12px', fontSize: 12 }}
                                                            onClick={() => openGameSettleModal(ch.ChallengeCode, ch.GameType, ch.CreatedAt)}>
                                                            <Icons.trophy size={13} /> Claim
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredChallenges.length === 0 && (
                                        <tr><td colSpan={6} className="cb-empty">No challenges found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Challenge creation modal ── */}
            <Modal show={challengeModal} onHide={closeChallengeModal} backdrop="static" keyboard={false} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Create Challenge</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                        <button type="button"
                            className={`cb-btn ${challengeMode === 'specific' ? 'cb-btn-primary' : 'cb-btn-ghost'}`}
                            style={{ flex: 1, justifyContent: 'center' }}
                            onClick={() => setChallengeMode('specific')}>
                            <Icons.user size={15} /> Challenge a specific player
                        </button>
                        <button type="button"
                            className={`cb-btn ${challengeMode === 'open' ? 'cb-btn-primary' : 'cb-btn-ghost'}`}
                            style={{ flex: 1, justifyContent: 'center' }}
                            onClick={() => setChallengeMode('open')}>
                            <Icons.globe size={15} /> Post open challenge
                        </button>
                    </div>

                    {challengeMode === 'open' && (
                        <div style={{ background: '#10261b', border: '1px solid #245038', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#3BE089', marginBottom: 16 }}>
                            Your challenge will be visible to all players. Anyone can accept it.
                        </div>
                    )}

                    <form onSubmit={challengeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {challengeMode === 'specific' && (
                            <div className="cb-form-group">
                                <label className="cb-label">Opponent</label>
                                <Select
                                    classNamePrefix="select"
                                    isClearable isSearchable
                                    name="opponent"
                                    options={users}
                                    onChange={setOpponent}
                                    onInputChange={searchUsers}
                                />
                                {inputErrors.opponent && <div style={{ color: '#FF6A3D', fontSize: 12, marginTop: 4 }}>{inputErrors.opponent}</div>}
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div className="cb-form-group">
                                <label className="cb-label">Game type</label>
                                <select className="cb-input cb-select" name="challenge_type_code" onChange={handleGameInput} value={gameVariables.challenge_type_code}>
                                    <option value="">Select game type</option>
                                    {challengeTypes.map((ct, i) => <option key={i} value={ct.code}>{ct.name}</option>)}
                                </select>
                                {inputErrors.game_type && <div style={{ color: '#FF6A3D', fontSize: 12, marginTop: 4 }}>{inputErrors.game_type}</div>}
                            </div>
                            <div className="cb-form-group">
                                <label className="cb-label">Currency</label>
                                <select className="cb-input cb-select" name="currency" onChange={handleGameInput} value={gameVariables.currency}>
                                    <option value="">Select currency</option>
                                    {userWallets.map((w, i) => <option key={i}>{w.currency}</option>)}
                                </select>
                                {inputErrors.currency && <div style={{ color: '#FF6A3D', fontSize: 12, marginTop: 4 }}>{inputErrors.currency}</div>}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div className="cb-form-group">
                                <label className="cb-label">Amount</label>
                                <input type="text" className="cb-input" name="fees" onChange={handleGameInput} value={gameVariables.fees} />
                                {inputErrors.amount && <div style={{ color: '#FF6A3D', fontSize: 12, marginTop: 4 }}>{inputErrors.amount}</div>}
                                {selWallet && (
                                    <small style={{ color: insufficient ? '#FF6A3D' : '#8A9D92', fontSize: 12, marginTop: 4, display: 'block' }}>
                                        {insufficient ? 'Insufficient balance — ' : ''}Available: {selWallet.currency} {selWallet.balance?.toLocaleString()}
                                    </small>
                                )}
                            </div>
                            <div className="cb-form-group">
                                <label className="cb-label">Series</label>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {SERIES_OPTIONS.map(opt => (
                                        <button key={opt.value} type="button"
                                            className={`cb-btn ${seriesLength === opt.value ? 'cb-btn-primary' : 'cb-btn-ghost'}`}
                                            style={{ padding: '5px 12px', fontSize: 12 }}
                                            onClick={() => setSeriesLength(opt.value)}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 4 }}>
                            <button type="submit" className="cb-btn cb-btn-primary" disabled={!!insufficient}>
                                {challengeMode === 'open' ? 'Post open challenge' : 'Save challenge'}
                            </button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>

            {/* ── Claim game modal ── */}
            <Modal show={gameSettleModal} onHide={closeGameSettleModal} backdrop="static" keyboard={false} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Claim Game</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loadingGames && (
                        <div style={{ textAlign: 'center', padding: 24 }}>
                            <div className="cb-spinner" style={{ margin: '0 auto 12px' }} />
                            <p className="cb-muted">Loading recent games…</p>
                        </div>
                    )}

                    {!loadingGames && recentGames.length === 0 && !showManualInput && (
                        <div style={{ background: '#2a2310', border: '1px solid #4a3d18', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#F2C14E', marginBottom: 16 }}>
                            No recent games found since this challenge was created.{' '}
                            <button type="button"
                                style={{ background: 'none', border: 'none', color: '#3BE089', cursor: 'pointer', padding: 0, fontSize: 13 }}
                                onClick={() => setShowManualInput(true)}>
                                Enter ID manually
                            </button>
                        </div>
                    )}

                    {!loadingGames && recentGames.length > 0 && (
                        <>
                            <p className="cb-muted" style={{ fontSize: 13, marginBottom: 10 }}>Select the game you played:</p>
                            <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                                {recentGames.map(game => {
                                    const isSelected = selectedGameUUID === game.game_id;
                                    const opp = game.white_username?.toLowerCase() === auth.username?.toLowerCase() ? game.black_username : game.white_username;
                                    const resultColor = { win: '#3BE089', draw: '#8A9D92', loss: '#FF6A3D' }[game.player_result] ?? '#8A9D92';
                                    return (
                                        <button key={game.game_id} type="button"
                                            onClick={() => setSelectedGameUUID(game.game_id)}
                                            style={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                padding: '10px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                                                background: isSelected ? '#10261b' : '#16221C',
                                                border: `1px solid ${isSelected ? '#3BE089' : '#2E3C34'}`,
                                                color: '#E8F1EB', fontFamily: 'inherit', transition: 'all .12s',
                                            }}>
                                            <span>
                                                <span style={{ fontWeight: 700 }}>vs {opp}</span>
                                                <span className="cb-muted" style={{ fontSize: 12, marginLeft: 8 }}>{game.time_control} · {game.time_class}</span>
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ color: resultColor, fontWeight: 700, fontSize: 12 }}>
                                                    {game.player_result?.charAt(0).toUpperCase() + game.player_result?.slice(1)}
                                                </span>
                                                <span className="cb-muted" style={{ fontSize: 11 }}>{TimeAgo(new Date(game.end_time * 1000).toISOString())}</span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            {!showManualInput && (
                                <button type="button" className="cb-btn cb-btn-ghost" style={{ fontSize: 13, padding: '6px 14px', marginBottom: 14 }}
                                    onClick={() => { setShowManualInput(true); setSelectedGameUUID(''); }}>
                                    Enter game ID manually
                                </button>
                            )}
                        </>
                    )}

                    {showManualInput && (
                        <div className="cb-form-group" style={{ marginBottom: 14 }}>
                            <label className="cb-label">Game ID <small style={{ color: '#8A9D92', textTransform: 'none', letterSpacing: 0 }}>(from chess.com)</small></label>
                            <input type="text" className="cb-input" name="GameID"
                                placeholder="paste from chess.com" onChange={handleClaimInput} />
                            {recentGames.length > 0 && (
                                <button type="button"
                                    style={{ background: 'none', border: 'none', color: '#3BE089', cursor: 'pointer', padding: 0, fontSize: 13, marginTop: 6 }}
                                    onClick={() => setShowManualInput(false)}>
                                    ← Back to game list
                                </button>
                            )}
                        </div>
                    )}

                    <form onSubmit={claimGame}>
                        <button type="submit" className="cb-btn cb-btn-primary"
                            disabled={!showManualInput && !selectedGameUUID}>
                            <Icons.trophy size={15} /> Claim game
                        </button>
                    </form>
                </Modal.Body>
            </Modal>

            {/* ── Withdraw modal ── */}
            <Modal show={withdrawModal} onHide={() => setWithdrawModal(false)} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>KES Withdrawal</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={withdrawDeposit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="cb-form-group">
                            <label className="cb-label">Phone number</label>
                            <input type="number" className="cb-input" placeholder="254XXXXXXXXX" name="phone" onChange={handleWithdrawInput} value={withdrawVariables.phone} />
                        </div>
                        <div className="cb-form-group">
                            <label className="cb-label">Amount</label>
                            {userWallets.length > 0 && (
                                <small style={{ color: '#8A9D92', fontSize: 12, marginBottom: 6, display: 'block' }}>
                                    Available: {userWallets[0].currency} {userWallets[0].balance?.toLocaleString()}
                                </small>
                            )}
                            <input type="number" className="cb-input" placeholder="Amount" min="1"
                                max={userWallets.length > 0 ? userWallets[0].balance : undefined}
                                name="amount" onChange={handleWithdrawInput} value={withdrawVariables.amount} />
                        </div>
                        <button type="submit" className="cb-btn cb-btn-primary" disabled={withdrawing}>
                            {withdrawing ? <><span className="cb-spinner sm" /> Processing…</> : 'Withdraw'}
                        </button>
                    </form>
                </Modal.Body>
            </Modal>

            {/* ── Deposit modal ── */}
            <Modal show={depositModal} onHide={() => setDepositModal(false)} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>KES Deposit</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={saveDeposit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="cb-form-group">
                            <label className="cb-label">Phone number</label>
                            <input type="number" className="cb-input" placeholder="254XXXXXXXXX" name="phoneNumber" onChange={handleDepositInput} value={depositVariables.phoneNumber} />
                        </div>
                        <div className="cb-form-group">
                            <label className="cb-label">Amount</label>
                            <input type="number" className="cb-input" placeholder="Amount" min="1" name="amount" onChange={handleDepositInput} value={depositVariables.amount} />
                        </div>
                        <button type="submit" className="cb-btn cb-btn-primary" disabled={depositing}>
                            {depositing ? <><span className="cb-spinner sm" /> Processing…</> : 'Deposit'}
                        </button>
                    </form>
                </Modal.Body>
            </Modal>
        </DashboardWrapper>
    );
}

export default PlayerDashboard;
