import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

function AdminTopNav() {

    const navigate = useNavigate();
    const { auth, setAuth } = useAuth();

    const logout = (e) => {
        e.preventDefault();
        setAuth({});
        localStorage.removeItem('adminInfo');
        navigate("/admin");
    };

    return (
        <nav className="main-header navbar navbar-expand navbar-white navbar-light">
            <ul className="navbar-nav">
                <li className="nav-item">
                    <a className="nav-link" data-widget="pushmenu" href="#" role="button">
                        <i className="fas fa-bars"></i>
                    </a>
                </li>
            </ul>

            <ul className="navbar-nav ml-auto">
                <li className="nav-item">
                    <span className="nav-link text-muted" style={{ fontSize: '13px' }}>
                        <i className="fas fa-user-shield mr-1"></i> {auth?.username}
                    </span>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#" role="button" onClick={logout}>
                        <i className="fas fa-sign-out-alt"></i>
                    </a>
                </li>
            </ul>
        </nav>
    );
}

export default AdminTopNav;
