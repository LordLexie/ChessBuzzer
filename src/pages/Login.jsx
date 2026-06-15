import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [loginInput, setLogin] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleInput = (e) => {
    setLogin(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const loginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    axios.post('api/v1/auth/login', { email: loginInput.email, password: loginInput.password })
      .then(res => {
        if (res.data.status === 'Ok') {
          const decoded = jwtDecode(res.data.data);
          const userInfo = {
            username: decoded.username,
            avatar: decoded.avatar,
            user_id: decoded.sub,
            status: decoded.status,
            email: decoded.email,
          };
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
          setAuth(userInfo);
          navigate('/dashboard');
        }
      })
      .catch(error => {
        const remaining = error?.response?.headers?.['x-ratelimit-remaining'];
        if (error?.response?.status === 429 || remaining === '0') {
          setErrorMessage('Too many attempts. Please try again after 15 minutes.');
        } else {
          setErrorMessage(error?.response?.data?.data || 'Login failed. Please try again.');
        }
      });
  };

  return (
    <div className="cb-auth-page" style={{ flexDirection: 'column' }}>
      <div className="cb-auth-card">
        <div className="cb-auth-brand">
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(150deg,#3BE089,#1E8A52)', display: 'grid', placeItems: 'center', fontSize: 22, color: '#06140C', boxShadow: '0 0 22px #3be08955', flexShrink: 0 }}>♞</div>
          <div>
            <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 18, color: '#E8F1EB' }}>Chess Buzzer</div>
            <div style={{ fontSize: 11, color: '#1E8A52', letterSpacing: '.14em', textTransform: 'uppercase' }}>Player portal</div>
          </div>
        </div>

        <h1>Welcome back</h1>
        <p>Sign in to your ChessBuzzer account.</p>

        <form onSubmit={loginSubmit} autoComplete="on" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="cb-form-group">
            <label className="cb-label" htmlFor="email">Email address</label>
            <input className="cb-input" type="email" id="email" name="email" placeholder="you@example.com"
              value={loginInput.email} onChange={handleInput} required />
          </div>

          <div className="cb-form-group">
            <label className="cb-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="cb-input" type={showPw ? 'text' : 'password'} id="password" name="password"
                placeholder="••••••••" value={loginInput.password} onChange={handleInput} required
                style={{ paddingRight: 44 }} />
              <button type="button" tabIndex={-1}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8A9D92', padding: 0, fontSize: 15 }}
                onClick={() => setShowPw(p => !p)}>
                <i className={`fa ${showPw ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </div>

          {errorMessage && (
            <div style={{ background: '#2a160f', border: '1px solid #4a2010', color: '#FF6A3D', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
              {errorMessage}
            </div>
          )}

          <button type="submit" className="cb-btn cb-btn-primary cb-btn-full" style={{ marginTop: 4 }}>
            Sign in
          </button>
        </form>

        <div className="cb-auth-foot" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Link to="/forgot-password" className="cb-auth-link">Forgot password?</Link>
          <Link to="/register" className="cb-auth-link">Create account</Link>
        </div>
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 20, justifyContent: 'center' }}>
        <Link to="/about" className="cb-auth-link">About Us</Link>
        <Link to="/rankings" className="cb-auth-link">Leaderboard</Link>
      </div>
    </div>
  );
}

export default Login;
