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
                setStatus('error');
                setMessage(err.response?.data?.data || 'Verification failed. The link may have expired.');
            });
    }, []);

    return (
        <div className="cb-auth-page">
            <div className="cb-auth-card" style={{ textAlign: 'center' }}>
                <div className="cb-auth-brand" style={{ justifyContent: 'center', paddingBottom: 24 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(150deg,#3BE089,#1E8A52)', display: 'grid', placeItems: 'center', fontSize: 22, color: '#06140C', boxShadow: '0 0 22px #3be08955' }}>♞</div>
                    <div>
                        <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 18, color: '#E8F1EB' }}>Chess Buzzer</div>
                        <div style={{ fontSize: 11, color: '#1E8A52', letterSpacing: '.14em', textTransform: 'uppercase' }}>Email verification</div>
                    </div>
                </div>

                {status === 'verifying' && (
                    <>
                        <div className="cb-spinner" style={{ margin: '0 auto 18px' }} />
                        <p style={{ color: '#8A9D92', fontSize: 15 }}>Verifying your email…</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div style={{ width: 64, height: 64, borderRadius: 18, background: '#10261b', border: '1px solid #245038', color: '#3BE089', display: 'grid', placeItems: 'center', fontSize: 32, margin: '0 auto 18px' }}>✓</div>
                        <h1 style={{ fontSize: 22, marginBottom: 10 }}>Email verified!</h1>
                        <p style={{ color: '#8A9D92', fontSize: 14, marginBottom: 24 }}>
                            Your account is now active. You're ready to play.
                        </p>
                        <button className="cb-btn cb-btn-primary cb-btn-full" style={{ justifyContent: 'center' }} onClick={() => navigate('/')}>
                            Go to Login
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div style={{ width: 64, height: 64, borderRadius: 18, background: '#2a160f', border: '1px solid #4a2010', color: '#FF6A3D', display: 'grid', placeItems: 'center', fontSize: 28, margin: '0 auto 18px' }}>✕</div>
                        <h1 style={{ fontSize: 22, marginBottom: 10 }}>Verification failed</h1>
                        <p style={{ color: '#8A9D92', fontSize: 14, marginBottom: 24 }}>{message}</p>
                        <button className="cb-btn cb-btn-ghost cb-btn-full" style={{ justifyContent: 'center' }} onClick={() => navigate('/register')}>
                            Back to Sign Up
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail;
