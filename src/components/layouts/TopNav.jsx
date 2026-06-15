import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';
import { useSidebar } from '../../context/SidebarContext';
import { Icons } from '../ui/Icons';


function TopNav({ title, subtitle }) {
    const navigate = useNavigate();
    const { setAuth } = useAuth();
    const { toggle } = useSidebar();

    let userInfo = {};
    try { userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}'); } catch {}

    const [resendStatus, setResendStatus] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [notifOpen, setNotifOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const prevChallengesRef = useRef(null);
    const notifIdRef = useRef(0);
    const notifRef = useRef(null);
    const userRef = useRef(null);

    const addNotif = (message) => {
        const id = ++notifIdRef.current;
        setNotifications(prev => [{ id, message, time: new Date() }, ...prev].slice(0, 10));
    };

    useEffect(() => {
        if (!userInfo.id) return;
        const checkForAccepted = () => {
            axios.get(`api/v1/challenge-martrix/player_games/${userInfo.id}`)
                .then(res => {
                    if (res.data.status !== 'Ok' || !res.data.data) return;
                    const current = res.data.data;
                    if (prevChallengesRef.current !== null) {
                        current.forEach(ch => {
                            const prev = prevChallengesRef.current.find(p => p.ChallengeCode === ch.ChallengeCode);
                            if (ch.IsOpen && ch.Status === 'active' && prev && prev.Status === 'pending') {
                                addNotif(`✓ Your open challenge (${ch.Currency} ${ch.EntryFee}) was accepted!`);
                            }
                        });
                    }
                    prevChallengesRef.current = current;
                })
                .catch(() => {});
        };
        checkForAccepted();
        const interval = setInterval(checkForAccepted, 15000);
        return () => clearInterval(interval);
    }, [userInfo.id]);

    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
            if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleResend = async () => {
        setResendStatus('sending');
        try {
            await axios.post('api/v1/auth/resend-verification', { Email: userInfo.email });
            setResendStatus('sent');
        } catch {
            setResendStatus('error');
        }
    };

    const logout = (e) => {
        e.preventDefault();
        setAuth({});
        localStorage.removeItem('userInfo');
        navigate('/');
    };

    const initial = (userInfo.username || 'U')[0].toUpperCase();
    const unread = notifications.length;

    return (
        <>
            <header className="cb-topbar">
                <div className="cb-topbar-left">
                    <button className="cb-hamburger" onClick={toggle} aria-label="Open menu">
                        <Icons.menu size={22} />
                    </button>
                    {title && (
                        <div>
                            <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: '-.02em' }}>
                                {title}
                            </div>
                            {subtitle && (
                                <p style={{ fontSize: 13.5, color: '#8A9D92', marginTop: 3 }}>{subtitle}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="cb-topbar-right">
                    <div className="cb-notif-wrap" ref={notifRef}>
                        <button
                            className="cb-bell-btn"
                            onClick={() => { setNotifOpen(o => !o); setUserOpen(false); }}
                            aria-label="Notifications"
                        >
                            <Icons.bell size={20} />
                            {unread > 0 && <span className="cb-bell-count">{unread}</span>}
                        </button>
                        {notifOpen && (
                            <div className="cb-notif-panel">
                                <div className="cb-notif-header">
                                    {unread > 0 ? `${unread} notification${unread > 1 ? 's' : ''}` : 'Notifications'}
                                </div>
                                {notifications.length === 0 ? (
                                    <div className="cb-notif-empty">You're all caught up!</div>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} className="cb-notif-item">
                                            {n.message}
                                            <div className="cb-notif-time">{n.time.toLocaleTimeString()}</div>
                                        </div>
                                    ))
                                )}
                                {notifications.length > 0 && (
                                    <button className="cb-notif-clear" onClick={() => { setNotifications([]); setNotifOpen(false); }}>
                                        Clear all
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="cb-user-wrap" ref={userRef}>
                        <button className="cb-user-btn" onClick={() => { setUserOpen(o => !o); setNotifOpen(false); }}>
                            <div className="cb-avatar" style={{ width: 28, height: 28, fontSize: 13 }}>{initial}</div>
                            <span className="cb-user-name">{userInfo.username}</span>
                            <Icons.chevdown size={14} />
                        </button>
                        {userOpen && (
                            <div className="cb-user-menu">
                                <Link to="/profile" onClick={() => setUserOpen(false)}>
                                    <Icons.user size={16} /> Profile
                                </Link>
                                <hr className="cb-user-menu-divider" />
                                <button onClick={logout}>
                                    <Icons.logout size={16} /> Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {userInfo.status && userInfo.status !== 'active' && (
                <div className="cb-verify-banner">
                    <Icons.zap size={15} />
                    Your email is not verified. Please check your inbox.{' '}
                    {resendStatus === 'sent' ? (
                        <strong>Email resent!</strong>
                    ) : (
                        <button onClick={handleResend} disabled={resendStatus === 'sending'}>
                            {resendStatus === 'sending' ? 'Sending…' : 'Resend verification'}
                        </button>
                    )}
                    {resendStatus === 'error' && <span style={{ color: '#FF6A3D' }}>Failed. Try again.</span>}
                </div>
            )}
        </>
    );
}

export default TopNav;
