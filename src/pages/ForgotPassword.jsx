import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        let rateLimited = false;
        try {
            await axios.post('/api/v1/auth/forgot-password', { Email: email });
        } catch (err) {
            const remaining = err?.response?.headers?.['x-ratelimit-remaining'];
            if (err?.response?.status === 429 || remaining === '0') {
                rateLimited = true;
                setError('Too many attempts. Please try again after one hour.');
            }
            // intentionally silent for all other errors — always show success to prevent enumeration
        } finally {
            setLoading(false);
            if (!rateLimited) setSubmitted(true);
        }
    };

    if (submitted) {
        return (
            <div className="cb-auth-page">
                <div className="cb-auth-card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>📧</div>
                    <h1 style={{ fontSize: 22, marginBottom: 12 }}>Check your email</h1>
                    <p style={{ color: '#8A9D92', fontSize: 14, marginBottom: 8 }}>
                        If an account exists for <strong style={{ color: '#E8F1EB' }}>{email}</strong>,
                        a password reset link has been sent. The link expires in 1 hour.
                    </p>
                    <p style={{ color: '#8A9D92', fontSize: 13, marginBottom: 20 }}>
                        Can't find it? Check your spam or junk folder.
                    </p>
                    <Link to="/" className="cb-btn cb-btn-ghost cb-btn-full" style={{ justifyContent: 'center' }}>
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cb-auth-page">
            <div className="cb-auth-card">
                <div className="cb-auth-brand">
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(150deg,#3BE089,#1E8A52)', display: 'grid', placeItems: 'center', fontSize: 22, color: '#06140C', boxShadow: '0 0 22px #3be08955', flexShrink: 0 }}>♞</div>
                    <div>
                        <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 18, color: '#E8F1EB' }}>Chess Buzzer</div>
                        <div style={{ fontSize: 11, color: '#1E8A52', letterSpacing: '.14em', textTransform: 'uppercase' }}>Password reset</div>
                    </div>
                </div>

                <h1>Forgot password?</h1>
                <p>Enter your email and we'll send you a reset link.</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="cb-form-group">
                        <label className="cb-label" htmlFor="email">Email address</label>
                        <input
                            className="cb-input"
                            type="email"
                            id="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div style={{ background: '#2a160f', border: '1px solid #4a2010', color: '#FF6A3D', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="cb-btn cb-btn-primary cb-btn-full" disabled={loading} style={{ marginTop: 4 }}>
                        {loading ? 'Sending…' : 'Send reset link'}
                    </button>
                </form>

                <div className="cb-auth-foot" style={{ justifyContent: 'center' }}>
                    <Link to="/" className="cb-auth-link">Back to Login</Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
