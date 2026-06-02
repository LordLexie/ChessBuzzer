import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useSidebar } from '../../context/SidebarContext';
import { Icons } from '../ui/Icons';

function AdminTopNav() {
    const navigate = useNavigate();
    const { auth, setAuth } = useAuth();
    const { toggle } = useSidebar();
    const [userOpen, setUserOpen] = useState(false);
    const userRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const logout = (e) => {
        e.preventDefault();
        setAuth({});
        localStorage.removeItem('adminInfo');
        navigate('/admin');
    };

    const initial = (auth?.username || 'A')[0].toUpperCase();

    return (
        <header className="cb-topbar">
            <div className="cb-topbar-left">
                <button className="cb-hamburger" onClick={toggle} aria-label="Open menu">
                    <Icons.menu size={22} />
                </button>
            </div>

            <div className="cb-topbar-right">
                <div className="cb-user-wrap" ref={userRef}>
                    <button className="cb-user-btn" onClick={() => setUserOpen(o => !o)}>
                        <div className="cb-avatar" style={{ width: 28, height: 28, fontSize: 13 }}>{initial}</div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#8A9D92' }}>{auth?.username}</span>
                        <Icons.chevdown size={14} />
                    </button>
                    {userOpen && (
                        <div className="cb-user-menu">
                            <button onClick={logout}>
                                <Icons.logout size={16} /> Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default AdminTopNav;
