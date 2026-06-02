import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import TopNav from '../components/layouts/TopNav';
import Sidebar from '../components/layouts/Sidebar';
import DashboardWrapper from '../components/layouts/DashboardWrapper';
import { Icons } from '../components/ui/Icons';

function ActionDropdown({ items }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [open]);

    return (
        <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
            <button className="cb-btn cb-btn-ghost" style={{ padding: '5px 12px', fontSize: 13 }}
                onClick={() => setOpen(o => !o)}>
                Actions ▾
            </button>
            {open && (
                <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 6px)', minWidth: 140,
                    background: '#121C18', border: '1px solid #243029', borderRadius: 12,
                    zIndex: 100, boxShadow: '0 8px 24px #00000055', overflow: 'hidden',
                }}>
                    {items.map(({ label, action, danger }) => (
                        <button key={label} onClick={() => { setOpen(false); action?.(); }}
                            style={{
                                display: 'block', width: '100%', textAlign: 'left',
                                padding: '11px 16px', background: 'none', border: 'none',
                                color: danger ? '#FF6A3D' : '#E8F1EB', fontSize: 14,
                                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: '.12s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = danger ? '#2a160f' : '#16221C'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

const STATUS_PILL = {
    draft:                'grey',
    registration_open:    'green',
    registration_closed:  'gold',
    in_progress:          'green',
    paused:               'gold',
    completed:            'green',
    cancelled:            'coral',
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

function Tournaments() {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchTournaments = () => {
        setLoading(true);
        axios.get('/api/v1/tournament')
            .then(res => setTournaments(res.data?.data ?? []))
            .catch(() => toast.error('Failed to load tournaments'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchTournaments(); }, []);

    const isOrganizer = t => String(t.organizer_id) === String(auth.user_id);

    const visibleTournaments = tournaments.filter(t => {
        if (t.status === 'draft') return isOrganizer(t);
        if (t.status === 'cancelled') {
            const joined = t.participants?.some(p => String(p.user_id) === String(auth.user_id));
            return isOrganizer(t) || joined;
        }
        return true;
    });

    return (
        <DashboardWrapper>
            <Sidebar />
            <div className="cb-main">
                <TopNav />
                <div className="cb-body">
                    <div className="cb-card">
                        <div className="cb-card-head">
                            <Icons.grid size={20} />
                            <h2>Tournaments</h2>
                            <span className="cb-count">{visibleTournaments.length}</span>
                            <span className="cb-hint">
                                <button className="cb-btn cb-btn-primary" style={{ padding: '7px 14px', fontSize: 13 }}
                                    onClick={() => navigate('/tournaments/new')}>
                                    + New Tournament
                                </button>
                            </span>
                        </div>

                        <div className="cb-table-wrap">
                            {loading ? (
                                <div className="cb-center"><div className="cb-spinner" /></div>
                            ) : (
                                <table className="cb-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Name</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                            <th><Icons.clock size={14} /></th>
                                            <th>Entry Fee</th>
                                            <th>Prize Pool</th>
                                            <th>Start Date</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleTournaments.length === 0 ? (
                                            <tr><td colSpan={9} className="cb-empty">No tournaments found.</td></tr>
                                        ) : visibleTournaments.map((t, i) => (
                                            <tr key={t.ID}>
                                                <td className="cb-muted">{i + 1}</td>
                                                <td>
                                                    <span style={{ fontWeight: 700 }}>{t.name}</span>
                                                    {isOrganizer(t) && (
                                                        <span className="cb-pill grey" style={{ fontSize: 11, padding: '2px 8px', marginLeft: 8 }}>mine</span>
                                                    )}
                                                </td>
                                                <td style={{ fontSize: 13 }}>{t.tournament_type}</td>
                                                <td><StatusPill status={t.status} /></td>
                                                <td style={{ fontSize: 13 }}>{t.time_control}</td>
                                                <td><span className="cb-mono gold" style={{ fontSize: 14 }}>{t.currency?.symbol} {t.entry_fee}</span></td>
                                                <td><span className="cb-mono green" style={{ fontSize: 14 }}>{t.currency?.symbol} {t.prize_pool}</span></td>
                                                <td className="cb-muted" style={{ fontSize: 13 }}>
                                                    {t.start_date ? new Date(t.start_date).toLocaleString('en-KE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                                                </td>
                                                <td>
                                                    {isOrganizer(t) ? (
                                                        <ActionDropdown items={[
                                                            { label: 'View', action: () => navigate(`/tournaments/${t.ID}/manage`) },
                                                            { label: 'Edit', action: () => navigate(`/tournaments/${t.ID}/edit`) },
                                                        ]} />
                                                    ) : (
                                                        <button className="cb-btn cb-btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }}
                                                            onClick={() => navigate(`/tournaments/${t.ID}`)}>
                                                            View
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

export default Tournaments;
