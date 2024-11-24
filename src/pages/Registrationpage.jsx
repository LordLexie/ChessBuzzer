import { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

function RegistrationPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const data = {
            username,
            email,
            password,
        };

        try {
            const res = await axios.post('http://127.0.0.1:8888/api/v1/user', data);

            if (res.status === 200 && res.data.status === 'OK') {
                Swal.fire('Success', 'Registration Successful', 'success');
                navigate('/');
            } else {
                setError(res.data.message || 'Registration failed');
            }
        } catch (error) {
            if (error.response && error.response.status === 409) {
                setError('Username or email already exists');
            } else {
                console.error('Registration Error:', error);
                setError('Registration Failed. Please try again.');
            }
        }
    };

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
