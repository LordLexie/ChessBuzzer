import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const S = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  left: {
    flex: 1,
    background: 'linear-gradient(160deg, #1b4332 0%, #081c15 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: '#fff',
  },
  king: {
    fontSize: '5rem',
    lineHeight: 1,
    marginBottom: '1rem',
    filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.4))',
  },
  brand: {
    fontSize: '2.6rem',
    fontWeight: 800,
    letterSpacing: '-0.5px',
    marginBottom: '0.5rem',
  },
  brandAccent: { color: '#74c69d' },
  tagline: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.6)',
    maxWidth: 280,
    textAlign: 'center',
    lineHeight: 1.6,
    marginTop: '0.5rem',
  },
  dots: {
    marginTop: '3rem',
    display: 'flex',
    gap: '8px',
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8f9fa',
    padding: '2rem',
  },
  card: {
    background: '#fff',
    borderRadius: '1.25rem',
    boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
    padding: '2.5rem',
    width: '100%',
    maxWidth: 400,
  },
  cardTitle: {
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#1b4332',
    marginBottom: '0.25rem',
  },
  cardSub: {
    fontSize: '0.9rem',
    color: '#6c757d',
    marginBottom: '2rem',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#495057',
    marginBottom: '0.35rem',
    display: 'block',
    letterSpacing: '0.3px',
  },
  input: {
    width: '100%',
    padding: '0.65rem 1rem',
    border: '1.5px solid #dee2e6',
    borderRadius: '0.6rem',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    background: '#fff',
  },
  inputWrap: {
    position: 'relative',
    marginBottom: '1.25rem',
  },
  eyeBtn: {
    position: 'absolute',
    right: '0.85rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6c757d',
    padding: 0,
    fontSize: '0.9rem',
  },
  alert: {
    background: '#fff5f5',
    border: '1px solid #f5c6cb',
    color: '#721c24',
    borderRadius: '0.6rem',
    padding: '0.65rem 1rem',
    fontSize: '0.85rem',
    marginBottom: '1rem',
  },
  footer: {
    marginTop: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
  },
  link: { color: '#2d6a4f', textDecoration: 'none', fontWeight: 500 },
};

function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [loginInput, setLogin] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [hovering, setHovering] = useState(false);

  const handleInput = (e) => {
    e.persist();
    setLogin({ ...loginInput, [e.target.name]: e.target.value });
  };

  const loginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
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
            setErrorMessage(error?.response?.data?.Data || 'Login failed. Please try again.');
          }
        });
    } catch {
      setErrorMessage('Login failed. Please try again.');
    }
  };

  return (
    <div style={S.page}>
      {/* Left branding panel — hidden on mobile */}
      <div style={S.left} className="d-none d-md-flex">
        <div style={S.king}>♔</div>
        <div style={S.brand}>
          Chess<span style={S.brandAccent}>Buzzer</span>
        </div>
        <p style={S.tagline}>
          Compete, wager, and track your chess performance — all in one place.
        </p>
        <div style={S.dots}>
          {[true, false, false].map((a, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: a ? '#74c69d' : 'rgba(255,255,255,0.25)' }} />
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={S.right}>
        <div style={S.card}>
          <div style={S.cardTitle}>Welcome back</div>
          <div style={S.cardSub}>Sign in to your ChessBuzzer account</div>

          <form onSubmit={loginSubmit} autoComplete="on">
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={S.label} htmlFor="email">Email address</label>
              <input
                style={S.input}
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                value={loginInput.email}
                onChange={handleInput}
                required
                onFocus={e => (e.target.style.borderColor = '#2d6a4f')}
                onBlur={e => (e.target.style.borderColor = '#dee2e6')}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={S.label} htmlFor="password">Password</label>
              <div style={S.inputWrap}>
                <input
                  style={{ ...S.input, paddingRight: '2.5rem' }}
                  type={showPw ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={loginInput.password}
                  onChange={handleInput}
                  required
                  onFocus={e => (e.target.style.borderColor = '#2d6a4f')}
                  onBlur={e => (e.target.style.borderColor = '#dee2e6')}
                />
                <button
                  type="button"
                  style={S.eyeBtn}
                  onClick={() => setShowPw(p => !p)}
                  tabIndex={-1}
                >
                  <i className={`fa ${showPw ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </div>

            {errorMessage && <div style={S.alert}>{errorMessage}</div>}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: hovering ? '#1b4332' : '#2d6a4f',
                color: '#fff',
                border: 'none',
                borderRadius: '0.6rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
                marginTop: '0.5rem',
              }}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              Sign in
            </button>
          </form>

          <div style={S.footer}>
            <Link to="/forgot-password" style={S.link}>Forgot password?</Link>
            <Link to="/register" style={S.link}>Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
