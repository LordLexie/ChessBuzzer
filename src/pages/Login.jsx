import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";

import axios from 'axios';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import LoginPageWrapper from "../components/layouts/LoginPageWrapper";

function Login() {

  const navigate = useNavigate();
  const { setAuth } = useAuth()

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
      <div className="card card-outline card-primary">
        <div className="card-header text-center">
          <span className="h2"><b>Chess</b>Buzzer</span>
        </div>
        <div className="card-body">
          <p className="login-box-msg">Sign in to start your session</p>

          <form onSubmit={loginSubmit}>
            <div className="input-group mb-3">
              <input type="email" className="form-control" placeholder="Email" name="email" id="email" onChange={handleInput} value={loginInput.email} />
              <div className="input-group-append">
                <div className="input-group-text">
                  <span className="fas fa-envelope"></span>
                </div>
              </div>
            </div>
            <div className="input-group mb-3">
              <input type="password" className="form-control" placeholder="Password" name="password" id="password" onChange={handleInput} value={loginInput.password} />
              <div className="input-group-append">
                <div className="input-group-text">
                  <span className="fa fa-eye" id="eye" onClick={togglePassword}></span>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-8">
              </div>

              <div className="col-4">
                <button type="submit" className="btn btn-primary btn-block">Sign In</button>
              </div>

            </div>
          </form>

          <p className="mb-1">
            <a href="forgot-password.html">Forgot my password</a>
          </p>
          <p className="mb-0">
            <a href="register.html" className="text-center">Register</a>
          </p>
        </div>

      </div>
    </LoginPageWrapper>
  )
}

export default Login