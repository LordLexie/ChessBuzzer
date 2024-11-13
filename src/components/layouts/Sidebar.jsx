import { Link } from 'react-router-dom';

function Sidebar() {
    return (
        <aside className="main-sidebar sidebar-dark-primary elevation-4">
            <span href="index3.html" className="brand-link">
                <img src="./assets/dist/img/AdminLTELogo.png" alt="AdminLTE Logo" className="brand-image img-circle elevation-3" />
                <span className="brand-text font-weight-light">Chess Buzzer</span>
            </span>

            <div className="sidebar">
                <nav className="mt-2">
                    <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                        <li className="nav-item">
                            <Link to="/" className="nav-link">
                                <i className="nav-icon far fa-circle text-danger"></i>
                                <p className="text">Home</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/transactions" className="nav-link">
                                <i className="nav-icon far fa-circle text-success"></i>
                                <p className="text">Transactions</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/register" className="nav-link">
                                <i className="nav-icon fas fa-user-plus"></i>
                                <p className="text">Sign Up</p>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>
    );
}

export default Sidebar;
