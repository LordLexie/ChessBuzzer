import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

function AdminSidebar() {
    return (
        <aside className="main-sidebar sidebar-dark-danger elevation-4">
            <span className="brand-link">
                <img src={logo} alt="ChessBuzzer Logo" className="brand-image elevation-3" style={{borderRadius: '4px'}} />
                <span className="brand-text font-weight-light">CB Admin</span>
            </span>

            <div className="sidebar">
                <nav className="mt-2">
                    <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                        <li className="nav-item">
                            <Link to="/admin/dashboard" className="nav-link">
                                <i className="nav-icon fas fa-tachometer-alt"></i>
                                <p>Dashboard</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/players" className="nav-link">
                                <i className="nav-icon fas fa-users"></i>
                                <p>Players</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/leaderboard" className="nav-link">
                                <i className="nav-icon fas fa-trophy"></i>
                                <p>Leaderboard</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/player-archives" className="nav-link">
                                <i className="nav-icon fas fa-archive"></i>
                                <p>Player Archives</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/marketing" className="nav-link">
                                <i className="nav-icon fas fa-bullhorn"></i>
                                <p>Marketing</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/time-analytics" className="nav-link">
                                <i className="nav-icon fas fa-clock"></i>
                                <p>Time Analytics</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/transactions" className="nav-link">
                                <i className="nav-icon fas fa-exchange-alt"></i>
                                <p>Transactions</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/challenges" className="nav-link">
                                <i className="nav-icon fas fa-chess"></i>
                                <p>Challenges</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/wallets" className="nav-link">
                                <i className="nav-icon fas fa-wallet"></i>
                                <p>Player Wallets</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/central-wallets" className="nav-link">
                                <i className="nav-icon fas fa-university"></i>
                                <p>Central Wallets</p>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>
    );
}

export default AdminSidebar;
