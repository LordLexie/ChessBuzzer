import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying | success | error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('No verification token found.');
            return;
        }

        axios.get(`/api/v1/auth/verify-email?token=${token}`)
            .then((res) => {
                if (res.data.status === 'Ok') {
                    setStatus('success');
                } else {
                    setStatus('error');
                    setMessage(res.data.data || 'Verification failed.');
                }
            })
            .catch((err) => {
                const msg = err.response?.data?.data || 'Verification failed. The link may have expired.';
                setStatus('error');
                setMessage(msg);
            });
    }, []);

    return (
        <div className="container d-flex align-items-center justify-content-center min-vh-100">
            <div className="card p-4 shadow-sm w-100 text-center" style={{ maxWidth: '400px' }}>
                {status === 'verifying' && (
                    <>
                        <div className="spinner-border text-primary mb-3" role="status" />
                        <p className="text-muted">Verifying your email...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="mb-3" style={{ fontSize: '3rem' }}>✅</div>
                        <h4 className="mb-2">Email Verified!</h4>
                        <p className="text-muted">Your account is now active. You can log in.</p>
                        <button className="btn btn-primary mt-3 w-100" onClick={() => navigate('/')}>
                            Go to Login
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="mb-3" style={{ fontSize: '3rem' }}>❌</div>
                        <h4 className="mb-2">Verification Failed</h4>
                        <p className="text-muted">{message}</p>
                        <button className="btn btn-outline-secondary mt-3 w-100" onClick={() => navigate('/register')}>
                            Back to Sign Up
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail;
