import { Link, useLocation } from 'react-router-dom';
import { Icons, CHESS } from '../ui/Icons';
import { useSidebar } from '../../context/SidebarContext';

const ADMIN_NAV = [
    { id: 'dashboard',   label: 'Dashboard',      icon: 'bar',      to: '/admin/dashboard' },
    { id: 'players',     label: 'Players',         icon: 'users',    to: '/admin/players' },
    { id: 'leaderboard', label: 'Leaderboard',     icon: 'trophy',   to: '/admin/leaderboard' },
    { id: 'archives',    label: 'Player Archives', icon: 'archive',  to: '/admin/player-archives' },
    { id: 'marketing',   label: 'Marketing',       icon: 'flag',     to: '/admin/marketing' },
    { id: 'analytics',   label: 'Time Analytics',  icon: 'clock',    to: '/admin/time-analytics' },
    { id: 'transactions',label: 'Transactions',    icon: 'swap',     to: '/admin/transactions' },
    { id: 'challenges',  label: 'Challenges',      icon: 'grid',     to: '/admin/challenges' },
    { id: 'wallets',     label: 'Player Wallets',  icon: 'wallet',   to: '/admin/wallets' },
    { id: 'cwallets',    label: 'Central Wallets', icon: 'coins',    to: '/admin/central-wallets' },
    { id: 'settings',    label: 'Settings',        icon: 'settings', to: '/admin/settings' },
];

function AdminSidebar() {
    const location = useLocation();
    const { isOpen, close } = useSidebar();

    return (
        <>
            <div className={'cb-overlay' + (isOpen ? ' show' : '')} onClick={close} />

            <aside className={'cb-sidebar' + (isOpen ? ' open' : '')}>
                <Link to="/admin/dashboard" className="cb-brand" onClick={close}>
                    <div className="cb-brand-tile">{CHESS.queen}</div>
                    <div className="cb-brand-text">
                        <span className="cb-brand-name">Chess Buzzer</span>
                        <span className="cb-brand-role">Admin</span>
                    </div>
                </Link>

                {ADMIN_NAV.map(n => {
                    const Icon = Icons[n.icon];
                    const active = location.pathname === n.to || location.pathname.startsWith(n.to + '/');
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
                    <div className="cb-avatar">A</div>
                    <div className="cb-sidebar-foot-text">
                        <b>Admin</b>
                        <small>Super admin</small>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default AdminSidebar;
