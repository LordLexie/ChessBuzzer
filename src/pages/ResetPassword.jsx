import { useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await axios.post('/api/v1/auth/reset-password', { Token: token, NewPassword: newPassword });
            setSuccess(true);
        } catch (err) {
            setError(err?.response?.data?.data || 'Invalid or expired reset link. Please request a new one.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="cb-auth-page">
                <div className="cb-auth-card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
                    <h1 style={{ fontSize: 22, marginBottom: 12 }}>Invalid link</h1>
                    <p style={{ color: '#8A9D92', fontSize: 14, marginBottom: 20 }}>
                        This reset link is missing a token. Please request a new one.
                    </p>
                    <Link to="/forgot-password" className="cb-btn cb-btn-primary cb-btn-full" style={{ justifyContent: 'center' }}>
                        Request new link
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="cb-auth-page">
                <div className="cb-auth-card" style={{ textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: '#10261b', border: '1px solid #245038', display: 'grid', placeItems: 'center', fontSize: 32, margin: '0 auto 18px' }}>✓</div>
                    <h1 style={{ fontSize: 22, marginBottom: 12 }}>Password updated</h1>
                    <p style={{ color: '#8A9D92', fontSize: 14, marginBottom: 20 }}>
                        Your password has been reset successfully. You can now sign in.
                    </p>
                    <Link to="/" className="cb-btn cb-btn-primary cb-btn-full" style={{ justifyContent: 'center' }}>
                        Go to Login
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

                <h1>Set new password</h1>
                <p>Choose a strong password for your account.</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="cb-form-group">
                        <label className="cb-label" htmlFor="newPassword">New password</label>
                        <input
                            className="cb-input"
                            type="password"
                            id="newPassword"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="cb-form-group">
                        <label className="cb-label" htmlFor="confirmPassword">Confirm password</label>
                        <input
                            className="cb-input"
                            type="password"
                            id="confirmPassword"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div style={{ background: '#2a160f', border: '1px solid #4a2010', color: '#FF6A3D', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="cb-btn cb-btn-primary cb-btn-full" disabled={loading} style={{ marginTop: 4 }}>
                        {loading ? 'Updating…' : 'Reset password'}
                    </button>
                </form>

                <div className="cb-auth-foot" style={{ justifyContent: 'center' }}>
                    <Link to="/forgot-password" className="cb-auth-link">Request a new link</Link>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
