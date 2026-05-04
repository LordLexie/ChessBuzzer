import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { jwtDecode } from "jwt-decode";

import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

import LoginPageWrapper from "../components/layouts/LoginPageWrapper";

function Login() {

  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [loginInput, setLogin] = useState({
    email: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState('');

  const handleInput = (e) => {
    e.persist();
    setLogin({ ...loginInput, [e.target.name]: e.target.value })
  }

  const togglePassword = () => {

    const myElement = document.getElementById("password");
    const attribute = myElement.getAttribute("type");

    const eye = document.getElementById("eye");

    if (attribute == "password") {
      myElement.setAttribute("type", "text")
      eye.className = "fa fa-eye-slash"
    }
    else {
      myElement.setAttribute("type", "password")
      eye.className = "fa fa-eye"
    }

  }

  const loginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {

      const data = {
        email: loginInput.email,
        password: loginInput.password
      }

      axios.post(`api/v1/auth/login`, data)
        .then(res => {
          if (res.data.status === "Ok") {
            const decoded = jwtDecode(res.data.data);
            const userInfo = { username: decoded.username, avatar: decoded.avatar, user_id: decoded.sub, status: decoded.status, email: decoded.email };
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            setAuth(userInfo);
            navigate("/dashboard");
          }
        })
        .catch(error => {
          const remaining = error?.response?.headers?.['x-ratelimit-remaining'];
          if (error?.response?.status === 429 || remaining === '0') {
            setErrorMessage('Too many attempts. Please try again after 15 minutes.');
          } else {
            setErrorMessage(error?.response?.data?.Data || 'Login failed. Please try again.');
          }
        });

    } catch (error) {
      setErrorMessage('Login failed. Please try again.');
    }

  }

  return (
    <LoginPageWrapper>
      <div className="container d-flex align-items-center justify-content-center min-vh-100">
        <div className="card card-outline card-primary shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
          <div className="card-header text-center">
            <span className="h2"><b>Chess</b>Buzzer</span>
          </div>
          <div className="card-body">
            <p className="login-box-msg">Sign in to start your session</p>

            <form onSubmit={loginSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  name="email"
                  id="email"
                  onChange={handleInput}
                  value={loginInput.email}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-group">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    name="password"
                    id="password"
                    onChange={handleInput}
                    value={loginInput.password}
                    required
                  />
                  <div className="input-group-append">
                    <div className="input-group-text">
                      <span className="fa fa-eye" id="eye" onClick={togglePassword}></span>
                    </div>
                  </div>
                </div>
              </div>
              {errorMessage && (
                <div className="alert alert-danger py-2 mb-3" role="alert">
                  {errorMessage}
                </div>
              )}
              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary btn-block">Sign In</button>
              </div>
            </form>

            <p className="mt-3 mb-1">
              <Link to="/forgot-password">Forgot my password</Link>
            </p>
            <p className="mb-0">
              <Link to="/register" className="text-center">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </LoginPageWrapper>
  )
}

export default Login
