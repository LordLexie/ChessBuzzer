import { useState } from 'react';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

function AdminLogin() {
    const navigate = useNavigate();
    const { setAuth } = useAuth();

    const [input, setInput] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInput = (e) => {
        setInput(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const loginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('api/v1/auth/admin/login', {
                email: input.email,
                password: input.password,
            });
            if (res.data.status === 'Ok') {
                const decoded = jwtDecode(res.data.data);
                const adminInfo = { username: decoded.username, user_id: decoded.sub, role: decoded.role };
                localStorage.setItem('adminInfo', JSON.stringify(adminInfo));
                setAuth(adminInfo);
                navigate('/admin/dashboard');
            } else {
                setError(res.data.data || 'Access denied. Invalid credentials.');
            }
        } catch (err) {
            const remaining = err?.response?.headers?.['x-ratelimit-remaining'];
            if (err?.response?.status === 429 || remaining === '0') {
                setError('Too many attempts. Please try again after 15 minutes.');
            } else {
                setError(err?.response?.data?.Data || 'Unable to reach the server.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cb-auth-page">
            <div className="cb-auth-card">
                <div className="cb-auth-brand">
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(150deg,#3BE089,#1E8A52)', display: 'grid', placeItems: 'center', fontSize: 22, color: '#06140C', boxShadow: '0 0 22px #3be08955', flexShrink: 0 }}>♛</div>
                    <div>
                        <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 18, color: '#E8F1EB' }}>Chess Buzzer</div>
                        <div style={{ fontSize: 11, color: '#1E8A52', letterSpacing: '.14em', textTransform: 'uppercase' }}>Admin portal</div>
                    </div>
                </div>

                <h1>Admin login</h1>
                <p>Sign in with your administrator credentials.</p>

                <form onSubmit={loginSubmit} autoComplete="on" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="cb-form-group">
                        <label className="cb-label" htmlFor="email">Email address</label>
                        <input className="cb-input" type="email" id="email" name="email"
                            placeholder="admin@example.com" value={input.email} onChange={handleInput} required />
                    </div>

                    <div className="cb-form-group">
                        <label className="cb-label" htmlFor="password">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input className="cb-input" type={showPassword ? 'text' : 'password'} id="password"
                                name="password" placeholder="••••••••" value={input.password}
                                onChange={handleInput} required style={{ paddingRight: 44 }} />
                            <button type="button" tabIndex={-1}
                                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8A9D92', padding: 0, fontSize: 15 }}
                                onClick={() => setShowPassword(p => !p)}>
                                <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div style={{ background: '#2a160f', border: '1px solid #4a2010', color: '#FF6A3D', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="cb-btn cb-btn-primary cb-btn-full" disabled={loading} style={{ marginTop: 4 }}>
                        {loading ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;
