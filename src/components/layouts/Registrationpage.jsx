import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegistrationPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [resendStatus, setResendStatus] = useState('');

    const navigate = useNavigate();

    const handleResend = async () => {
        setResendStatus('sending');
        try {
            await axios.post('http://127.0.0.1:8888/api/v1/auth/resend-verification', { Email: email });
            setResendStatus('sent');
        } catch {
            setResendStatus('error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const data = { username, email, password };

        try {
            const res = await axios.post('http://127.0.0.1:8888/api/v1/user', data);

            if (res.data.status === 'Ok') {
                setSubmitted(true);
            } else {
                setError(res.data.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration Error:', err);
            const remaining = err?.response?.headers?.['x-ratelimit-remaining'];
            if (err?.response?.status === 429 || remaining === '0') {
                setError('Too many attempts. Please try again after one hour.');
            } else if (remaining !== undefined) {
                const base = err?.response?.data?.Data || 'Registration failed. Please try again.';
                setError(`${base} (${remaining} attempt${remaining === '1' ? '' : 's'} remaining this hour)`);
            } else {
                setError(err?.response?.data?.Data || 'Registration failed. Please try again.');
            }
        }
    };

    if (submitted) {
        return (
            <div className="cb-auth-page">
                <div className="cb-auth-card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>📧</div>
                    <h1 style={{ fontSize: 22, marginBottom: 12 }}>Check your email</h1>
                    <p style={{ color: '#8A9D92', fontSize: 14, marginBottom: 10 }}>
                        We sent a verification link to <strong style={{ color: '#E8F1EB' }}>{email}</strong>.
                        Please click it to activate your account.
                    </p>
                    <p style={{ color: '#8A9D92', fontSize: 13, marginBottom: 10 }}>The link expires in 24 hours.</p>
                    <p style={{ color: '#8A9D92', fontSize: 13 }}>
                        Can't find it? Check your spam folder or{' '}
                        {resendStatus === 'sent' ? (
                            <span style={{ color: '#3BE089' }}>Email resent!</span>
                        ) : (
                            <button
                                style={{ background: 'none', border: 'none', color: '#3BE089', cursor: 'pointer', fontSize: 'inherit', textDecoration: 'underline', padding: 0 }}
                                onClick={handleResend}
                                disabled={resendStatus === 'sending'}
                            >
                                {resendStatus === 'sending' ? 'Sending…' : 'resend the email'}
                            </button>
                        )}
                        {resendStatus === 'error' && (
                            <span style={{ color: '#FF6A3D', display: 'block', marginTop: 4 }}>Failed to resend. Please try again.</span>
                        )}
                    </p>
                    <button
                        className="cb-btn cb-btn-ghost cb-btn-full"
                        style={{ marginTop: 20 }}
                        onClick={() => navigate('/')}
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="cb-auth-page">
            <div className="cb-auth-card">
                <div className="cb-auth-brand">
                    <div className="cb-brand-tile" style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(150deg,#3BE089,#1E8A52)', display: 'grid', placeItems: 'center', fontSize: 22, color: '#06140C', boxShadow: '0 0 22px #3be08955' }}>♞</div>
                    <div>
                        <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 18, color: '#E8F1EB' }}>Chess Buzzer</div>
                        <div style={{ fontSize: 11, color: '#1E8A52', letterSpacing: '.14em', textTransform: 'uppercase' }}>Create account</div>
                    </div>
                </div>
                <h1>Sign Up</h1>
                <p>Join Chess Buzzer and start competing.</p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="cb-form-group">
                        <label className="cb-label">Username</label>
                        <input type="text" className="cb-input" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="your_username" />
                    </div>
                    <div className="cb-form-group">
                        <label className="cb-label">Email</label>
                        <input type="email" className="cb-input" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@email.com" />
                    </div>
                    <div className="cb-form-group">
                        <label className="cb-label">Password</label>
                        <input type="password" className="cb-input" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
                    </div>
                    <div className="cb-form-group">
                        <label className="cb-label">Confirm Password</label>
                        <input type="password" className="cb-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••" />
                    </div>
                    {error && <p style={{ color: '#FF6A3D', fontSize: 13 }}>{error}</p>}
                    <button type="submit" className="cb-btn cb-btn-primary cb-btn-full" style={{ marginTop: 4 }}>Create Account</button>
                </form>
                <div className="cb-auth-foot">
                    Already have an account?{' '}
                    <a href="/" className="cb-auth-link">Sign in</a>
                </div>
            </div>
        </div>
    );
}

export default RegistrationPage;
