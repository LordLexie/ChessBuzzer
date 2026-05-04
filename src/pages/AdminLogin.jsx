import { useState } from 'react';
import Swal from 'sweetalert2';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoginPageWrapper from "../components/layouts/LoginPageWrapper";

function AdminLogin() {

  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [input, setInput] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInput = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const loginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('api/v1/auth/admin/login', {
        email: input.email,
        password: input.password,
      });

      if (res.data.status === "Ok") {
        const decoded = jwtDecode(res.data.data);
        const adminInfo = { username: decoded.username, user_id: decoded.sub, role: decoded.role };
        localStorage.setItem('adminInfo', JSON.stringify(adminInfo));
        setAuth(adminInfo);
        navigate("/admin/dashboard");
      } else {
        Swal.fire({ icon: 'warning', title: 'Access Denied', text: res.data.data || 'Invalid credentials' });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Unable to reach the server.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginPageWrapper>
      <div className="container d-flex align-items-center justify-content-center min-vh-100">
        <div className="card card-outline card-danger shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
          <div className="card-header text-center">
            <span className="h2"><b>Chess</b>Buzzer</span>
            <p className="text-muted mb-0" style={{ fontSize: '13px' }}>Administrator Portal</p>
          </div>
          <div className="card-body">
            <p className="login-box-msg">Sign in with your admin credentials</p>

            <form onSubmit={loginSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="admin@example.com"
                  name="email"
                  id="email"
                  onChange={handleInput}
                  value={input.email}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Password"
                    name="password"
                    id="password"
                    onChange={handleInput}
                    value={input.password}
                    required
                  />
                  <div className="input-group-append">
                    <div className="input-group-text" style={{ cursor: 'pointer' }} onClick={() => setShowPassword(!showPassword)}>
                      <span className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-danger btn-block" disabled={loading}>
                  {loading ? <span className="fa fa-spinner fa-spin"></span> : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </LoginPageWrapper>
  );
}

export default AdminLogin;
