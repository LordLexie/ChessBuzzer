import { useState } from 'react';
import swal from 'sweetalert2';
// import useAuth from '../hooks/useAuth';
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";

import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

import LoginPageWrapper from "../components/layouts/LoginPageWrapper";

function Login() {

  const navigate = useNavigate();

  const [loginInput, setLogin] = useState({
    email: '',
    password: '',
    error_list: [],
  });

  

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

    const data = {
      email: loginInput.email,
      password: loginInput.password
    }

    axios.post(`api/v1/auth/login`, data).then(res => {


      if (res.data.status === "Ok") {
        Cookies.set("Authorization",res.data.data)
        const decoded_token = jwtDecode(res.data.data);

        localStorage.setItem('username', decoded_token.username)
        localStorage.setItem('avatar', decoded_token.avatar)
        navigate("/dashboard")
      }
      else if (res.data.status === 401) {
        swal('Warning', res.data.message, "warning")
      }
      else {
        setLogin({ ...loginInput, error_list: res.data.validation_errors })
      }

    })

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
              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary btn-block">Sign In</button>
              </div>
            </form>

            <p className="mt-3 mb-1">
              <a href="forgot-password.html">Forgot my password</a>
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
