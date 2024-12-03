import React, { useState } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import Swal from 'sweetalert2';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/v1/auth/login', { email, password });
      console.log('Response:', response);
      const token = response.data.data;
      console.log('Token:', token);

      // Decode the JWT token
      const decoded = jwtDecode(token);
      console.log('Decoded Token:', decoded);

      // Save token to localStorage
      localStorage.setItem('token', token);

      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: `Welcome, ${decoded.username}!`,
      });

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login Error:', error);

      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: 'Invalid email or password.',
      });
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={loginSubmit}>
        <h2>Login</h2>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
