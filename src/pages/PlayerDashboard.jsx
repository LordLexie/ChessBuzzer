import React, { useRef, useState, useEffect } from 'react';

import './style.css';
import axios from 'axios';
import Cookies from 'js-cookie';
import Select from 'react-select';
import { jwtDecode } from "jwt-decode";
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
//import swal from 'sweetalert';

import '../components/ui/DropdownMenu';
import Aside from '../components/layouts/Aside';
import Footer from '../components/layouts/Footer';
import TopNav from '../components/layouts/TopNav';
import Sidebar from '../components/layouts/Sidebar';
import DropdownMenu from '../components/ui/DropdownMenu';
import DashboardWrapper from '../components/layouts/DashboardWrapper';

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

  const [show, setShow] = useState(true);
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [opponent, setOpponent] = useState({});
  const [userWallets, setWallets] = useState([]);
  const [userChallenges, setChallenges] = useState([]);
  const [challengeTypes, setChallengeTypes] = useState([]);
  const [challengeModal, setChallengeModal] = useState(false);

  const [gameVariables, setGameVariables] = useState({
    challenge_type_code: '',
    currency: '',
    fees: 0,
  })

  const [inputErrors, setInputErrors] = useState({
    opponent: '',
    game_type: '',
    currency: '',
    amount: ''
  })

  const handleGameInput = (e) => {
    e.persist();
    setGameVariables({ ...gameVariables, [e.target.name]: e.target.value })
  }

  const setSearchUsername = (e) => {
    e.persist();
    setUsername(e.target.value)
  }

  const decoded_token = jwtDecode(Cookies.get("Authorization"))

  const closeChallengeModal = () => {
    setChallengeModal(false)
    setOpponent()
  }

  const openChallengeModal = () => {
    setChallengeModal(true)
  }

  const showAlert = (showIcon, showTitle) => {

    Swal.fire({
      position: "top-end",
      icon: showIcon,
      title: showTitle,
      showConfirmButton: false,
      timer: 1500
    });

  }

  const challengeSubmit = (e) => {
    e.preventDefault();

    let proceed = true

    // check if opponent is set
    if (opponent.value == null) {
      proceed = false

      setInputErrors(prevErrors => ({
        ...prevErrors,
        opponent: 'opponent required *'
      }));

    } else {
      setInputErrors(prevErrors => ({
        ...prevErrors,
        opponent: ''
      }));
    }

    // check if game type is set
    if (gameVariables.challenge_type_code == '') {
      proceed = false

      setInputErrors(prevErrors => ({
        ...prevErrors,
        game_type: 'game type required *'
      }));
    } else {
      setInputErrors(prevErrors => ({
        ...prevErrors,
        game_type: ''
      }));
    }

    // check if currency is set
    if (gameVariables.currency == '') {
      proceed = false

      setInputErrors(prevErrors => ({
        ...prevErrors,
        currency: 'currency required *'
      }));

    } else {
      setInputErrors(prevErrors => ({
        ...prevErrors,
        currency: ''
      }));
    }

    // check if amount is greater than 0
    if (parseFloat(gameVariables.fees) <= 0) {
      proceed = false

      setInputErrors(prevErrors => ({
        ...prevErrors,
        amount: 'cannot be less than 1 *'
      }));
    } else {
      setInputErrors(prevErrors => ({
        ...prevErrors,
        amount: ''
      }));
    }

    if (proceed) {

      const data = {
        CreatedBy: decoded_token.sub,
        MaxPlayers: 2,
        ChallengeTypeCode: gameVariables.challenge_type_code,
        Description: 'set by user',
        Currency: gameVariables.currency,
        Fees: parseFloat(gameVariables.fees),
        Players: [decoded_token.sub, parseInt(opponent.value)]
      }

      axios.post(`api/v1/challenge`, data).then(res => {


        if (res.data.status === "Ok") {

          fetchChallenges()
          fetchWallets()
          closeChallengeModal()
          setGameVariables({
            challenge_type_code: '',
            currency: '',
            fees: 0,
          })

          setOpponent({})
          showAlert("success", "challenge created")

        }
        else if (res.data.status === 401) {
        }
        else {

        }

      })

    }


  }

  const handleChange = (selectedOption) => {
    setOpponent(selectedOption)
  };

  const fetchChallenges = () => {

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

  }

  const fetchWallets = () => {

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

  }

  const fetchGameTypes = () => {

    axios.get(`api/v1/challenge-type`,).then(res => {


      if (res.data.status === "Ok") {

        setChallengeTypes(res.data.data)

      }
      else if (res.data.status === 401) {
        swal('Warning', res.data.message, "warning")
      }
      else {

      }

    })

  }

  const searchUsers = (event) => {
    if (event.length > 0) {

      const data = {
        username: event
      }

      axios.post(`api/v1/user/search`, data).then(res => {


        if (res.data.status === "Ok") {

          let usersArray = [];

          if (res.data.data != null) {
            res.data.data.map((user, index) => {

              let userData = {
                value: user.id,
                label: user.username
              };

              usersArray = [...usersArray, userData];
            });
            setUsers(usersArray)
          }

        }
        else if (res.data.status === 401) {
          swal('Warning', res.data.message, "warning")
        }
        else {

        }

      })

    }
  }

  const cancelGame = (gameId) => {

    let cookie = Cookies.get("Authorization")
    const decoded_token = jwtDecode(cookie);

    const data = {
      ID: gameId,
      CanceledBy: decoded_token.sub,
    }

    axios.patch(`api/v1/challenge/cancel_challenge/${gameId}`, data).then(res => {


      if (res.data.status === "Ok") {
        showAlert("success", "challenge canceled")
        fetchChallenges()
        fetchWallets()
      }
      else if (res.data.status === 401) {
        // swal('Warning', res.data.message, "warning")
      }
      else {

      }

    })

  }

  const updateGame = (matrixId, action) => {

    let cookie = Cookies.get("Authorization")
    const decoded_token = jwtDecode(cookie);

    const data = {
      ID: matrixId,
      Player: decoded_token.sub,
      AcceptedChallenge: action
    }

    axios.patch(`api/v1/challenge-martrix/${matrixId}`, data).then(res => {


      if (res.data.status === "Ok") {
        showAlert("success", "challenge updated")
      }
      else if (res.data.status === 401) {
        // swal('Warning', res.data.message, "warning")
      }
      else {

      }

    })

  }

  const displayChallenges = () => {

    

  }

  useEffect(() => {

    setUserDetails({
      username: localStorage.getItem("username").toLocaleUpperCase(),
      avatar: localStorage.getItem("avatar"),
    })

    fetchChallenges()
    fetchWallets()
    fetchGameTypes()


  }, [])

  return (
    <DashboardWrapper>

      <Modal
        show={challengeModal}
        onHide={closeChallengeModal}
        backdrop="static"
        keyboard={false}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create challenge</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <form onSubmit={challengeSubmit}>

            <div className='row m-1' >
              <div className='col-md-6'>
                <label><span className='fa fa-users' ></span> Opponent</label>
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  isDisabled={false}
                  isLoading={false}
                  isClearable={true}
                  isRtl={false}
                  isSearchable={true}
                  name="opponent"
                  options={users}
                  onChange={handleChange}
                  onInputChange={searchUsers}
                ></Select>
                <div className='error_holder'>
                  {inputErrors.opponent}
                </div>
              </div>

              <div className='col-md-6'>
                <label> Game type</label>
                <select className='form-control' name="challenge_type_code" id="challenge_type_code" onChange={handleGameInput} value={gameVariables.challenge_type_code} >
                  <option value=''>Select game type</option>
                  {challengeTypes.map((challenge, index) => (
                    <option key={index} value={challenge.code} >{challenge.name}</option>
                  ))}

                </select>
                <div className='error_holder'>
                  {inputErrors.game_type}
                </div>
              </div>

            </div>

            <div className='row m-1'>
              <div className='col-md-6'>
                <label>Currency</label>
                <select className='form-control' name="currency" id="currency" onChange={handleGameInput} value={gameVariables.currency} >
                  <option value=''>Select currency</option>
                  {userWallets.map((wallet, index) => (
                    <option key={index}>{wallet.currency}</option>
                  ))}
                </select>

                <div className='error_holder'>
                  {inputErrors.currency}
                </div>
              </div>

              <div className='col-md-6'>
                <label>Amount</label>
                <input type="text" className='form-control' name="fees" id="fees" onChange={handleGameInput} value={gameVariables.fees} />
                <div className='error_holder'>
                  {inputErrors.amount}
                </div>
              </div>

            </div>

            <div className='row m-1' >
              <div className='col-md-12'>
                <button type="submit" className='btn btn-success btn-sm'>Save challenge</button>
              </div>
            </div>

          </form>

        </Modal.Body>
        <Modal.Footer>

        </Modal.Footer>
      </Modal>

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
                  <div className="small-box bg-info" key={index}>
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

                      <span className="btn btn-success btn-sm" onClick={() => openChallengeModal(true)} >
                        New challenge
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
                          <th style={{ fontSize: '14px' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                      {userChallenges.map((challenge, index) => (
        <tr key={index}>
          <td style={{ fontSize: '14px' }} >{index + 1}</td>
          <td style={{ fontSize: '14px' }}>{FormatTime(challenge.CreatedAt)}</td>
          <td style={{ fontSize: '14px' }} >{challenge.Description}</td>
          <td style={{ fontSize: '14px' }}>{challenge.Currency} {challenge.EntryFee}</td>
          <td style={{ fontSize: '14px' }}>
            {challenge.Status === 'canceled' ? <><span className='fa fa-times-circle red' ></span> canceled</> : null}
            {challenge.Status === 'pending' ? <><span className='fa fa-spinner'></span> pending</> : null}
            {challenge.Status === 'complete' ? <><span className='fa fa-check-circle green'></span> complete</> : null}
            {challenge.Status === 'active' ? <><span className='fa fa-circle-notch fa-spin green'></span> active</> : null}
          </td>

          <td style={{ fontSize: '14px' }}>
            <Dropdown>
              <Dropdown.Toggle variant="secondary" id="dropdown-basic" size="sm" >
                {'action'}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {(() => {

                  if (challenge.Status === 'pending') {
                    if (challenge.AcceptedChallenge == 1) {
                      return <Dropdown.Item onClick={() => cancelGame(challenge.Challengeid)} > <span className='fa fa-times-circle'></span> Cancel</Dropdown.Item>;
                    } else {
                      return (<>
                        <Dropdown.Item onClick={() => updateGame(challenge.ID, 1)}>Accept</Dropdown.Item>
                        <Dropdown.Item onClick={() => updateGame(challenge.ID, 3)}>Reject</Dropdown.Item>
                      </>);
                    }
                  } else if (challenge.Status === 'active') {
                    return (<Dropdown.Item><i class="fa fa-trophy"></i> Claim</Dropdown.Item>)
                  }

                  // If status is not 'pending', return null (no item rendered)
                  return null;
                })()}


              </Dropdown.Menu>
            </Dropdown>
          </td>

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