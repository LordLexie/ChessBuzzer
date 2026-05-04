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
            <div className="container d-flex align-items-center justify-content-center min-vh-100">
                <div className="card p-4 shadow-sm w-100 text-center" style={{ maxWidth: '400px' }}>
                    <div className="mb-3" style={{ fontSize: '3rem' }}>📧</div>
                    <h4 className="mb-3">Check your email</h4>
                    <p className="text-muted">
                        We sent a verification link to <strong>{email}</strong>.
                        Please click it to activate your account.
                    </p>
                    <p className="text-muted small">The link expires in 24 hours.</p>
                    <p className="text-muted small">
                        Can't find it? Check your <strong>spam or junk folder</strong> or{' '}
                        {resendStatus === 'sent' ? (
                            <span className="text-success">Email resent!</span>
                        ) : (
                            <button
                                className="btn btn-link p-0 align-baseline"
                                style={{ fontSize: 'inherit' }}
                                onClick={handleResend}
                                disabled={resendStatus === 'sending'}
                            >
                                {resendStatus === 'sending' ? 'Sending...' : 'resend the email'}
                            </button>
                        )}
                        {resendStatus === 'error' && (
                            <span className="text-danger d-block mt-1">Failed to resend. Please try again.</span>
                        )}
                    </p>
                    <button className="btn btn-link mt-2" onClick={() => navigate('/')}>
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container d-flex align-items-center justify-content-center min-vh-100">
            <div className="card p-4 shadow-sm w-100" style={{ maxWidth: '400px' }}>
                <h2 className="text-center mb-4">Sign Up</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Username:</label>
                        <input
                            type="text"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Email:</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password:</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Confirm Password:</label>
                        <input
                            type="password"
                            className="form-control"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-danger">{error}</p>}
                    <button type="submit" className="btn btn-primary w-100">Register</button>
                </form>
            </div>
        </div>
    );
}

export default RegistrationPage;
