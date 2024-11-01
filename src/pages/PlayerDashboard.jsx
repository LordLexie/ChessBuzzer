import React, { useState, useEffect } from 'react';
import DashboardWrapper from '../components/layouts/DashboardWrapper'
import TopNav from '../components/layouts/TopNav'
import Sidebar from '../components/layouts/Sidebar'
import Footer from '../components/layouts/Footer';
import Aside from '../components/layouts/Aside';
function PlayerDashboard() {

  const [userDetails, setUserDetails] = useState({
    username: '',
    avatar: '../assets/dist/img/user1-128x128.jpg',
  });

  useEffect(() => {

    setUserDetails({
      username: localStorage.getItem("username").toLocaleUpperCase(),
      avatar:localStorage.getItem("avatar"),
    })

    console.log("We are in the players dashboard")
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

                <div className="small-box bg-info">
                  <div className="inner">
                    <h3>KES 1,500</h3>

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
                          <th>ID</th>
                          <th>Date</th>
                          <th>Opponent</th>
                          <th>Amount</th>
                          <th>Results</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>11-7-2014</td>
                          <td>Alexander Pierce</td>
                          <td>1,200</td>
                          <td><span className="tag tag-warning">Pending</span></td>
                          <td>Edit</td>
                        </tr>
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