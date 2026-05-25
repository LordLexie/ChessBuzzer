import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

function Sidebar() {
    return (
        <aside className="main-sidebar sidebar-dark-primary elevation-4">
            <span href="index3.html" className="brand-link">
                <img src={logo} alt="ChessBuzzer Logo" className="brand-image elevation-3" style={{borderRadius: '4px'}} />
                <span className="brand-text font-weight-light">Chess Buzzer</span>
            </span>

            <div className="sidebar">
                <nav className="mt-2">
                    <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                        <li className="nav-item">
                            <Link to="/dashboard" className="nav-link">
                                <i className="nav-icon fas fa-home"></i>
                                <p>Home</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/transactions" className="nav-link">
                                <i className="nav-icon fas fa-exchange-alt"></i>
                                <p>Transactions</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/analytics" className="nav-link">
                                <i className="nav-icon fas fa-chart-line"></i>
                                <p>Analytics</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/archives" className="nav-link">
                                <i className="nav-icon fas fa-archive"></i>
                                <p>Archives</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/leaderboard" className="nav-link">
                                <i className="nav-icon fas fa-trophy"></i>
                                <p>Leaderboard</p>
                            </Link>
                        </li>

                    </ul>
                </nav>
            </div>
        </aside>
    );
}

export default Sidebar;
