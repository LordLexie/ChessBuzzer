import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/v1/auth/forgot-password', { Email: email });
        } catch {
            // intentionally silent — always show success to prevent enumeration
        } finally {
            setLoading(false);
            setSubmitted(true);
        }
    };

    if (submitted) {
        return (
            <div className="container d-flex align-items-center justify-content-center min-vh-100">
                <div className="card p-4 shadow-sm w-100 text-center" style={{ maxWidth: '400px' }}>
                    <div className="mb-3" style={{ fontSize: '3rem' }}>📧</div>
                    <h4 className="mb-3">Check your email</h4>
                    <p className="text-muted">
                        If an account exists for <strong>{email}</strong>, a password reset link has been sent.
                        The link expires in 1 hour.
                    </p>
                    <p className="text-muted small">Can't find it? Check your spam or junk folder.</p>
                    <Link to="/" className="btn btn-link mt-2">Back to Login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container d-flex align-items-center justify-content-center min-vh-100">
            <div className="card p-4 shadow-sm w-100" style={{ maxWidth: '400px' }}>
                <h2 className="text-center mb-1">Forgot Password</h2>
                <p className="text-muted text-center mb-4" style={{ fontSize: '0.9rem' }}>
                    Enter your email and we'll send you a reset link.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
                <div className="text-center mt-3">
                    <Link to="/">Back to Login</Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
