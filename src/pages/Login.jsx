import React, {useState, useEffect} from 'react';
import useAuth from '../../hooks/useAuth';

import axios from 'axios';
import {Link, useNavigate} from 'react-router-dom';

import LoginPageWrapper from "../components/layouts/LoginPageWrapper";

function Login() {
    return (
        <LoginPageWrapper>
            <div className="card card-outline card-primary">
        <div className="card-header text-center">
          <span className="h2"><b>Chess</b>Buzzer</span>
        </div>
        <div className="card-body">
          <p className="login-box-msg">Sign in to start your session</p>
    
          <form action="../../index3.html" method="post">
            <div className="input-group mb-3">
              <input type="email" className="form-control" placeholder="Email" />
              <div className="input-group-append">
                <div className="input-group-text">
                  <span className="fas fa-envelope"></span>
                </div>
              </div>
            </div>
            <div className="input-group mb-3">
              <input type="password" className="form-control" placeholder="Password" />
              <div className="input-group-append">
                <div className="input-group-text">
                  <span className="fas fa-lock"></span>
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