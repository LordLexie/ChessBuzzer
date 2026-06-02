import { Link, useLocation } from 'react-router-dom';
import { Icons, CHESS } from '../ui/Icons';
import { useSidebar } from '../../context/SidebarContext';

const NAV = [
    { id: 'home',         label: 'Home',          icon: 'home',    to: '/dashboard' },
    { id: 'find',         label: 'Find a Game',   icon: 'globe',   to: '/open-challenges' },
    { id: 'tournaments',  label: 'Tournaments',   icon: 'grid',    to: '/tournaments' },
    { id: 'transactions', label: 'Transactions',  icon: 'swap',    to: '/transactions' },
    { id: 'analytics',    label: 'Analytics',     icon: 'chart',   to: '/analytics' },
    { id: 'archives',     label: 'Archives',      icon: 'archive', to: '/archives' },
    { id: 'leaders',      label: 'Leaders board', icon: 'trophy',  to: '/leaderboard' },
];

function Sidebar() {
    const location = useLocation();
    const { isOpen, close } = useSidebar();

    let info = {};
    try { info = JSON.parse(localStorage.getItem('userInfo') || '{}'); } catch {}
    const initial = (info.username || 'U')[0].toUpperCase();

    return (
        <>
            <div className={'cb-overlay' + (isOpen ? ' show' : '')} onClick={close} />

            <aside className={'cb-sidebar' + (isOpen ? ' open' : '')}>
                <Link to="/dashboard" className="cb-brand" onClick={close}>
                    <div className="cb-brand-tile">{CHESS.knight}</div>
                    <div className="cb-brand-text">
                        <span className="cb-brand-name">Chess Buzzer</span>
                        <span className="cb-brand-role">Player</span>
                    </div>
                </Link>

                {NAV.map(n => {
                    const Icon = Icons[n.icon];
                    const active = location.pathname === n.to ||
                        (n.to !== '/dashboard' && location.pathname.startsWith(n.to));
                    return (
                        <Link
                            key={n.id}
                            to={n.to}
                            className={'cb-nav-item' + (active ? ' active' : '')}
                            onClick={close}
                        >
                            <Icon size={20} />
                            <span className="cb-nav-label">{n.label}</span>
                        </Link>
                    );
                })}

                <div className="cb-sidebar-foot">
                    <div className="cb-avatar">{initial}</div>
                    <div className="cb-sidebar-foot-text">
                        <b>{info.username || 'Player'}</b>
                        <small>Verified player</small>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
