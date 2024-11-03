import React, { useState, useEffect } from 'react';
import DashboardWrapper from '../components/layouts/DashboardWrapper'
import TopNav from '../components/layouts/TopNav'
import Sidebar from '../components/layouts/Sidebar'
import Footer from '../components/layouts/Footer';
import Aside from '../components/layouts/Aside';
import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie';
import axios from 'axios';

function FormatTime(dateString) {

  let date = new Date(dateString);

  // Format the date to a human-friendly format
  let options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    //hour: '2-digit',
    //minute: '2-digit',
    //second: '2-digit',
    //timeZoneName: 'short'
  };

  let formattedDate = date.toLocaleString('en-US', options);
  return formattedDate
}

function formatMoney(num) {
  // Convert the number to a string, split on the decimal point
  const [integerPart, decimalPart] = num.toString().split('.');
  
  // Format the integer part with commas
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Limit the decimal part to 3 digits if it exists
  const formattedDecimal = decimalPart ? '.' + decimalPart.slice(0, 3) : '';
  
  // Combine both parts
  return formattedInteger + formattedDecimal;
}

function PlayerDashboard() {

  const [userDetails, setUserDetails] = useState({
    username: '',
    avatar: '../assets/dist/img/user1-128x128.jpg',
  });

  const [userChallenges, setChallenges] = useState([])
  const [userWallets, setWallets] = useState([])
  const decoded_token = jwtDecode(Cookies.get("Authorization"))



  useEffect(() => {

    setUserDetails({
      username: localStorage.getItem("username").toLocaleUpperCase(),
      avatar: localStorage.getItem("avatar"),
    })


    // Fetch the player challenges / game
    axios.get(`api/v1/challenge-martrix/player_games/${decoded_token.sub}`,).then(res => {


      if (res.data.status === "Ok") {

        setChallenges(res.data.data)

      }
      else if (res.data.status === 401) {
        swal('Warning', res.data.message, "warning")
      }
      else {
        setLogin({ ...loginInput, error_list: res.data.validation_errors })
      }

    })

    axios.get(`api/v1/player-wallet/user/${decoded_token.sub}`,).then(res => {


      if (res.data.status === "Ok") {

        setWallets(res.data.data)

      }
      else if (res.data.status === 401) {
        swal('Warning', res.data.message, "warning")
      }
      else {
        setLogin({ ...loginInput, error_list: res.data.validation_errors })
      }

    })

  }, [])

  return (
    <DashboardWrapper>

      <TopNav></TopNav>
      <Sidebar></Sidebar>

      <div className="content-wrapper">

        <div className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="m-0">Dashboard</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="content">
          <div className="container-fluid">
            <div className="row">

              <div className="col-md-4">

                <div className="card card-widget widget-user shadow">



                  <div className="widget-user-image">
                    <img className="img-circle elevation-2" src={userDetails.avatar} alt="User Avatar" />
                  </div>

                  <div className="widget-user-header bg-info">
                    <h5 className="widget-user-desc">{userDetails.username}</h5>
                  </div>

                  <div className="card-footer"></div>

                </div>

                {userWallets.map((wallet, index) => (
                  <div className="small-box bg-info">
                    <div className="inner">
                      <h4>{wallet.currency} {formatMoney(wallet.balance)}</h4>

                      <p>Account Balance</p>
                    </div>
                    <div className="icon">
                      <i className="ion ion-bag"></i>
                    </div>

                    <div className="row" style={{ paddingBottom: '5px' }}>
                      <div style={{ width: '50%' }}>
                        <span className="small-box-footer" style={{ padding: '5px' }}>
                          <span className='btn btn-default btn-sm'>
                            Deposit <span className='fas fa-arrow-up'></span>
                          </span>
                        </span>
                      </div>

                      <div style={{ width: '50%' }}>
                        <span className="small-box-footer" style={{ padding: '5px' }}>
                          <span className='btn btn-default btn-sm'>
                            Withdraw <span className='fas fa-arrow-down'></span>
                          </span>
                        </span>
                      </div>

                    </div>
                  </div>
                ))}

              </div>

              <div className="col-md-8">

                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Buzz History</h3>

                    <div className="card-tools">

                      <span className="btn btn-success btn-sm">
                        <i className="fas fa-plus"></i> New challenge
                      </span>
                    </div>
                  </div>

                  <div className="card-body table-responsive p-0">
                    <table className="table table-hover text-nowrap">
                      <thead>
                        <tr>
                          <th style={{ fontSize: '14px' }} >#</th>
                          <th style={{ fontSize: '14px' }}>Date</th>
                          <th style={{ fontSize: '14px' }}>Challenge</th>
                          <th style={{ fontSize: '14px' }}>Entry Fee</th>
                          <th style={{ fontSize: '14px' }}>Status</th>
                          <th style={{ fontSize: '14px' }}><span className='fa fa-edit'></span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {userChallenges.map((challenge, index) => (
                          <tr key={index}>
                            <td style={{ fontSize: '14px' }} >{index + 1}</td>
                            <td style={{ fontSize: '14px' }}>{FormatTime(challenge.CreatedAt)}</td>
                            <td style={{ fontSize: '14px' }} >{challenge.Description}</td>
                            <td style={{ fontSize: '14px' }}>{challenge.Currency} {challenge.EntryFee}</td>
                            <td style={{ fontSize: '14px' }}>{challenge.Status}</td>
                            <td style={{ fontSize: '14px' }}><span className='fa fa-edit'></span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>

              </div>


            </div>

          </div>
        </div>

      </div>

      <Aside />
      <Footer />
    </DashboardWrapper>
  );
}

export default PlayerDashboard