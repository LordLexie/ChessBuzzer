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
            await axios.post('/api/v1/auth/reset-password', {
                Token: token,
                NewPassword: newPassword,
            });
            setSuccess(true);
        } catch (err) {
            const msg = err?.response?.data?.data || 'Invalid or expired reset link. Please request a new one.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="container d-flex align-items-center justify-content-center min-vh-100">
                <div className="card p-4 shadow-sm w-100 text-center" style={{ maxWidth: '400px' }}>
                    <p className="text-danger">Invalid reset link.</p>
                    <Link to="/forgot-password">Request a new one</Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="container d-flex align-items-center justify-content-center min-vh-100">
                <div className="card p-4 shadow-sm w-100 text-center" style={{ maxWidth: '400px' }}>
                    <div className="mb-3" style={{ fontSize: '3rem' }}>✅</div>
                    <h4 className="mb-3">Password updated</h4>
                    <p className="text-muted">Your password has been reset successfully.</p>
                    <Link to="/" className="btn btn-primary mt-2">Back to Login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container d-flex align-items-center justify-content-center min-vh-100">
            <div className="card p-4 shadow-sm w-100" style={{ maxWidth: '400px' }}>
                <h2 className="text-center mb-4">Reset Password</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="alert alert-danger py-2">{error}</div>}
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
                <div className="text-center mt-3">
                    <Link to="/forgot-password">Request a new link</Link>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
