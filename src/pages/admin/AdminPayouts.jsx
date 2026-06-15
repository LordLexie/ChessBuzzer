import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import { Icons } from '../../components/ui/Icons';

function AdminPayouts() {
    const [tab, setTab] = useState('internal');

    // Central wallet balances (for reference)
    const [wallets, setWallets] = useState([]);

    // Internal transfer state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [intForm, setIntForm] = useState({ currency: 'KES', amount: '', note: '' });
    const [intSubmitting, setIntSubmitting] = useState(false);
    const searchRef = useRef(null);

    // External transfer state
    const [extForm, setExtForm] = useState({ phone: '', currency: 'KES', amount: '', note: '' });
    const [extSubmitting, setExtSubmitting] = useState(false);

    useEffect(() => {
        axios.get('/api/v1/admin/central-wallets')
            .then(res => setWallets(res.data?.data ?? []))
            .catch(() => {});
    }, []);

    // Debounced player search
    useEffect(() => {
        if (!searchQuery.trim()) { setSearchResults([]); return; }
        const timer = setTimeout(() => {
            setSearching(true);
            axios.post('/api/v1/admin/players/search', { Username: searchQuery.trim() })
                .then(res => setSearchResults(res.data?.data ?? []))
                .catch(() => setSearchResults([]))
                .finally(() => setSearching(false));
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    function selectPlayer(player) {
        setSelectedPlayer(player);
        setSearchQuery(player.username ?? player.Username ?? '');
        setSearchResults([]);
    }

    function clearPlayer() {
        setSelectedPlayer(null);
        setSearchQuery('');
        setSearchResults([]);
    }

    function walletBalance(currency) {
        const w = wallets.find(w => w.Currency === currency || w.currency === currency);
        return w ? w.Balance ?? w.balance ?? 0 : null;
    }

    async function submitInternal(e) {
        e.preventDefault();
        if (!selectedPlayer) { toast.error('Select a player first'); return; }
        const amount = parseFloat(intForm.amount);
        if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }

        setIntSubmitting(true);
        try {
            await axios.post('/api/v1/admin/payouts/internal', {
                player_id: selectedPlayer.ID ?? selectedPlayer.id,
                currency: intForm.currency,
                amount,
                note: intForm.note,
            });
            toast.success('Transfer successful');
            clearPlayer();
            setIntForm({ currency: 'KES', amount: '', note: '' });
            // Refresh balances
            axios.get('/api/v1/admin/central-wallets').then(res => setWallets(res.data?.data ?? []));
        } catch (err) {
            toast.error(err.response?.data?.data ?? 'Transfer failed');
        } finally {
            setIntSubmitting(false);
        }
    }

    async function submitExternal(e) {
        e.preventDefault();
        const amount = parseInt(extForm.amount, 10);
        if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
        if (!extForm.phone.trim()) { toast.error('Enter a phone number'); return; }

        setExtSubmitting(true);
        try {
            await axios.post('/api/v1/admin/payouts/external', {
                phone: extForm.phone.trim(),
                currency: extForm.currency,
                amount,
                note: extForm.note,
            });
            toast.success('M-Pesa transfer initiated');
            setExtForm({ phone: '', currency: 'KES', amount: '', note: '' });
            axios.get('/api/v1/admin/central-wallets').then(res => setWallets(res.data?.data ?? []));
        } catch (err) {
            toast.error(err.response?.data?.data ?? 'Transfer failed');
        } finally {
            setExtSubmitting(false);
        }
    }

    const activeCurrency = tab === 'internal' ? intForm.currency : extForm.currency;
    const bal = walletBalance(activeCurrency);

    return (
        <DashboardWrapper>
            <AdminSidebar />
            <div className="cb-main">
                <AdminTopNav />
                <div className="cb-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 4 }}>
                        <h1 style={{ flex: 1, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: '-.02em' }}>
                            Payouts
                        </h1>
                    </div>

                    {/* Central wallet balances strip */}
                    {wallets.length > 0 && (
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
                            {wallets.map(w => (
                                <div key={w.WalletCode ?? w.wallet_code} style={{ background: '#0F1C16', border: '1px solid #16221C', borderRadius: 10, padding: '10px 18px', display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <Icons.coins size={16} />
                                    <span style={{ fontSize: 13, color: '#8A9D92' }}>{w.Currency ?? w.currency}</span>
                                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#3BE089', fontSize: 14 }}>{(w.Balance ?? w.balance ?? 0).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                        <button className={'cb-btn ' + (tab === 'internal' ? 'cb-btn-primary' : 'cb-btn-ghost')}
                            style={{ fontSize: 13, padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
                            onClick={() => setTab('internal')}>
                            <Icons.users size={15} /> To Player Wallet
                        </button>
                        <button className={'cb-btn ' + (tab === 'external' ? 'cb-btn-primary' : 'cb-btn-ghost')}
                            style={{ fontSize: 13, padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
                            onClick={() => setTab('external')}>
                            <Icons.swap size={15} /> To M-Pesa
                        </button>
                    </div>

                    {/* Internal Transfer */}
                    {tab === 'internal' && (
                        <div className="cb-card" style={{ maxWidth: 560 }}>
                            <div className="cb-card-head">
                                <Icons.users size={18} />
                                <h2>Transfer to Player Wallet</h2>
                            </div>
                            <form onSubmit={submitInternal}>
                                <div className="cb-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {/* Player search */}
                                    <div className="cb-form-group" style={{ position: 'relative' }} ref={searchRef}>
                                        <label className="cb-label">Player *</label>
                                        {selectedPlayer ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#0F1C16', border: '1px solid #1E3528', borderRadius: 8, padding: '10px 14px' }}>
                                                <span style={{ fontWeight: 700, flex: 1 }}>{selectedPlayer.username ?? selectedPlayer.Username}</span>
                                                <span style={{ fontSize: 12, color: '#8A9D92' }}>{selectedPlayer.email ?? selectedPlayer.Email}</span>
                                                <button type="button" onClick={clearPlayer}
                                                    style={{ background: 'none', border: 'none', color: '#8A9D92', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>✕</button>
                                            </div>
                                        ) : (
                                            <>
                                                <input
                                                    className="cb-input"
                                                    placeholder="Search by username…"
                                                    value={searchQuery}
                                                    onChange={e => setSearchQuery(e.target.value)}
                                                    autoComplete="off"
                                                />
                                                {(searchResults.length > 0 || searching) && (
                                                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#0F1C16', border: '1px solid #1E3528', borderRadius: 8, zIndex: 20, maxHeight: 200, overflowY: 'auto', marginTop: 4 }}>
                                                        {searching
                                                            ? <div style={{ padding: '12px 16px', color: '#8A9D92', fontSize: 13 }}>Searching…</div>
                                                            : searchResults.map(u => (
                                                                <div key={u.ID ?? u.id}
                                                                    onClick={() => selectPlayer(u)}
                                                                    style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #16221C', display: 'flex', justifyContent: 'space-between' }}
                                                                    onMouseEnter={e => e.currentTarget.style.background = '#16221C'}
                                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                                    <span style={{ fontWeight: 700, fontSize: 13 }}>{u.username ?? u.Username}</span>
                                                                    <span style={{ fontSize: 12, color: '#8A9D92' }}>{u.email ?? u.Email}</span>
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                                        <div className="cb-form-group">
                                            <label className="cb-label">Currency *</label>
                                            <select className="cb-input cb-select" value={intForm.currency}
                                                onChange={e => setIntForm(f => ({ ...f, currency: e.target.value }))}>
                                                {wallets.length > 0
                                                    ? wallets.map(w => <option key={w.WalletCode} value={w.Currency ?? w.currency}>{w.Currency ?? w.currency}</option>)
                                                    : <option value="KES">KES</option>
                                                }
                                            </select>
                                        </div>
                                        <div className="cb-form-group">
                                            <label className="cb-label">
                                                Amount *
                                                {bal !== null && <span style={{ color: '#4A6357', fontSize: 11, marginLeft: 8 }}>Available: {bal.toLocaleString()}</span>}
                                            </label>
                                            <input className="cb-input" type="number" step="0.01" min="1" placeholder="0.00"
                                                value={intForm.amount} onChange={e => setIntForm(f => ({ ...f, amount: e.target.value }))} required />
                                        </div>
                                    </div>

                                    <div className="cb-form-group">
                                        <label className="cb-label">Note / Reason</label>
                                        <input className="cb-input" placeholder="e.g. Tournament bonus" value={intForm.note}
                                            onChange={e => setIntForm(f => ({ ...f, note: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="cb-card-foot">
                                    <button type="submit" className="cb-btn cb-btn-primary" disabled={intSubmitting || !selectedPlayer}>
                                        {intSubmitting ? <span className="cb-spinner sm" /> : <Icons.swap size={15} />}
                                        {intSubmitting ? 'Sending…' : 'Send to Wallet'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* External M-Pesa Transfer */}
                    {tab === 'external' && (
                        <div className="cb-card" style={{ maxWidth: 560 }}>
                            <div className="cb-card-head">
                                <Icons.swap size={18} />
                                <h2>Send via M-Pesa</h2>
                            </div>
                            <form onSubmit={submitExternal}>
                                <div className="cb-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div className="cb-form-group">
                                        <label className="cb-label">Phone Number *</label>
                                        <input className="cb-input" placeholder="e.g. 254712345678" value={extForm.phone}
                                            onChange={e => setExtForm(f => ({ ...f, phone: e.target.value }))} required />
                                        <span style={{ fontSize: 11, color: '#4A6357', marginTop: 4, display: 'block' }}>Include country code, no + prefix (e.g. 254…)</span>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                                        <div className="cb-form-group">
                                            <label className="cb-label">Currency *</label>
                                            <select className="cb-input cb-select" value={extForm.currency}
                                                onChange={e => setExtForm(f => ({ ...f, currency: e.target.value }))}>
                                                {wallets.length > 0
                                                    ? wallets.map(w => <option key={w.WalletCode} value={w.Currency ?? w.currency}>{w.Currency ?? w.currency}</option>)
                                                    : <option value="KES">KES</option>
                                                }
                                            </select>
                                        </div>
                                        <div className="cb-form-group">
                                            <label className="cb-label">
                                                Amount (KES) *
                                                {bal !== null && <span style={{ color: '#4A6357', fontSize: 11, marginLeft: 8 }}>Available: {bal.toLocaleString()}</span>}
                                            </label>
                                            <input className="cb-input" type="number" min="1" step="1" placeholder="100"
                                                value={extForm.amount} onChange={e => setExtForm(f => ({ ...f, amount: e.target.value }))} required />
                                        </div>
                                    </div>

                                    <div className="cb-form-group">
                                        <label className="cb-label">Note / Reason</label>
                                        <input className="cb-input" placeholder="e.g. Prize payout" value={extForm.note}
                                            onChange={e => setExtForm(f => ({ ...f, note: e.target.value }))} />
                                    </div>

                                    <div style={{ background: '#0F1C16', border: '1px solid #1E3528', borderRadius: 8, padding: '12px 14px', fontSize: 12, color: '#8A9D92', lineHeight: 1.6 }}>
                                        The specified amount will be debited from the central wallet and sent directly to the M-Pesa number via SmlyPay.
                                        This action cannot be undone once initiated.
                                    </div>
                                </div>
                                <div className="cb-card-foot">
                                    <button type="submit" className="cb-btn cb-btn-primary" disabled={extSubmitting}>
                                        {extSubmitting ? <span className="cb-spinner sm" /> : <Icons.swap size={15} />}
                                        {extSubmitting ? 'Sending…' : 'Send via M-Pesa'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </DashboardWrapper>
    );
}

export default AdminPayouts;
