import React, { useState, useEffect } from 'react';

import './style.css';
import axios from 'axios';
import Select from 'react-select';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';
import Swal from 'sweetalert2'

import useAuth from '../hooks/useAuth';
import Aside from '../components/layouts/Aside';
import Footer from '../components/layouts/Footer';
import TopNav from '../components/layouts/TopNav';
import Sidebar from '../components/layouts/Sidebar';
import DashboardWrapper from '../components/layouts/DashboardWrapper';

function FormatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatMoney(num) {
  const [integerPart, decimalPart] = num.toString().split('.');
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formattedDecimal = decimalPart ? '.' + decimalPart.slice(0, 3) : '';
  return formattedInteger + formattedDecimal;
}

function PlayerDashboard() {

  const { auth } = useAuth();
  const userId = auth.user_id;

  const [users, setUsers] = useState([]);
  const [opponent, setOpponent] = useState({});
  const [userWallets, setWallets] = useState([]);
  const [userChallenges, setChallenges] = useState([]);
  const [depositModal, setDepositModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [challengeTypes, setChallengeTypes] = useState([]);
  const [challengeModal, setChallengeModal] = useState(false);
  const [gameSettleModal, setGameSettleModal] = useState(false);

  const [claimPayload, setClaimPayload] = useState({
    GameType: '',
    ChallengeID: '',
  });

  const [gameVariables, setGameVariables] = useState({
    challenge_type_code: '',
    currency: '',
    fees: 0,
  });

  const [depositVariables, setDepositVariables] = useState({
    phoneNumber: '',
    amount: 1,
    projectCode: '',
    transactionId: '',
    userId: parseInt(userId),
  });

  const [withdrawVariables, setWithdrawVariables] = useState({
    phone: '',
    amount: 1,
    user_id: parseInt(userId),
    wallet_id: 0,
  });

  const [inputErrors, setInputErrors] = useState({
    opponent: '',
    game_type: '',
    currency: '',
    amount: ''
  });

  const handleDepositInput = (e) => {
    e.persist();
    setDepositVariables({ ...depositVariables, [e.target.name]: e.target.value });
  };

  const handleWithdrawInput = (e) => {
    e.persist();
    setWithdrawVariables({ ...withdrawVariables, [e.target.name]: e.target.value });
  };

  const handleGameInput = (e) => {
    e.persist();
    setGameVariables({ ...gameVariables, [e.target.name]: e.target.value });
  };

  const handleInput = (e) => {
    e.persist();
    setClaimPayload({ ...claimPayload, [e.target.name]: e.target.value });
  };

  const showAlert = (icon, title) => {
    Swal.fire({ position: "top-end", icon, title, showConfirmButton: false, timer: 1500 });
  };

  const closeChallengeModal = () => { setChallengeModal(false); setOpponent({}); };
  const openChallengeModal = () => setChallengeModal(true);
  const openGameSettleModal = (challengeId, gameType) => {
    setGameSettleModal(true);
    setClaimPayload({ GameType: gameType, ChallengeID: challengeId });
  };
  const closeGameSettleModal = () => { setGameSettleModal(false); setClaimPayload({ GameType: '', ChallengeID: '' }); };
  const openDepositModal = () => setDepositModal(true);
  const closeDepositModal = () => setDepositModal(false);
  const openWithdrawalModal = () => setWithdrawModal(true);
  const closeWithdrawalModal = () => setWithdrawModal(false);

  const saveDeposit = (e) => {
    e.preventDefault();

    if (!depositVariables.phoneNumber) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Phone number is required!' });
      return;
    }
    if (depositVariables.phoneNumber.length < 9 || depositVariables.phoneNumber.length > 12) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Phone number must be between 9 and 12 digits!' });
      return;
    }

    setDepositing(true);
    axios.post(`api/v1/stk-push/smplypay`, { ...depositVariables, amount: parseInt(depositVariables.amount) })
      .then(res => {
        if (res.data.code == 200) {
          Swal.fire({ icon: 'success', title: 'Success', text: 'STK push initiated successfully!' });
          closeDepositModal();
          fetchWallets();
        } else {
          Swal.fire({ icon: 'error', title: 'Oops...', text: 'Failed to initiate deposit. Please try again.' });
        }
      })
      .finally(() => setDepositing(false));
  };

  const withdrawDeposit = (e) => {
    e.preventDefault();

    if (!withdrawVariables.phone) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Phone number is required!' });
      return;
    }
    if (withdrawVariables.phone.length < 9 || withdrawVariables.phone.length > 12) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Phone number must be between 9 and 12 digits!' });
      return;
    }

    const payload = {
      ...withdrawVariables,
      amount: parseInt(withdrawVariables.amount),
      wallet_id: userWallets.length > 0 ? userWallets[0].id : 0,
    };

    setWithdrawing(true);
    axios.post(`api/v1/player-wallet/withdraw`, payload)
      .then(res => {
        if (res.data.code == 200) {
          Swal.fire({ icon: 'success', title: 'Success', text: 'Withdrawal initiated successfully!' });
          closeWithdrawalModal();
          fetchWallets();
        } else {
          Swal.fire({ icon: 'error', title: 'Oops...', text: 'Failed to initiate withdrawal. Please try again.' });
        }
      })
      .catch(error => {
        const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
        Swal.fire({ icon: 'error', title: 'Error', text: errorMessage });
      })
      .finally(() => setWithdrawing(false));
  };

  const challengeSubmit = (e) => {
    e.preventDefault();

    let proceed = true;
    const errors = { opponent: '', game_type: '', currency: '', amount: '' };

    if (!opponent?.value) { proceed = false; errors.opponent = 'opponent required *'; }
    if (!gameVariables.challenge_type_code) { proceed = false; errors.game_type = 'game type required *'; }
    if (!gameVariables.currency) { proceed = false; errors.currency = 'currency required *'; }
    if (parseFloat(gameVariables.fees) <= 0) { proceed = false; errors.amount = 'cannot be less than 1 *'; }

    setInputErrors(errors);

    if (proceed) {
      const data = {
        CreatedBy: userId,
        MaxPlayers: 2,
        ChallengeTypeCode: gameVariables.challenge_type_code,
        Description: 'set by user',
        Currency: gameVariables.currency,
        Fees: parseFloat(gameVariables.fees),
        Players: [userId, parseInt(opponent.value)]
      };

      axios.post(`api/v1/challenge`, data).then(res => {
        if (res.data.status === "Ok") {
          fetchChallenges();
          fetchWallets();
          closeChallengeModal();
          setGameVariables({ challenge_type_code: '', currency: '', fees: 0 });
          showAlert("success", "challenge created");
        } else {
          showAlert("error", res.data.data || "Failed, try again later");
        }
      });
    }
  };

  const fetchChallenges = () => {
    axios.get(`api/v1/challenge-martrix/player_games/${userId}`).then(res => {
      if (res.data.status === "Ok") setChallenges(res.data.data);
    });
  };

  const fetchWallets = () => {
    axios.get(`api/v1/player-wallet/user/${userId}`).then(res => {
      if (res.data.status === "Ok") setWallets(res.data.data);
    });
  };

  const fetchGameTypes = () => {
    axios.get(`api/v1/challenge-type`).then(res => {
      if (res.data.status === "Ok") setChallengeTypes(res.data.data);
    });
  };

  const fetchProfile = () => {
    axios.get(`api/v1/user/${userId}`).then(res => {
      if (res.data.status === 'Ok') {
        const phone = res.data.data.phone ?? '254719671440';
        setDepositVariables(prev => ({ ...prev, phoneNumber: phone }));
        setWithdrawVariables(prev => ({ ...prev, phone }));
      }
    });
  };

  const searchUsers = (event) => {
    if (event.length > 0) {
      axios.post(`api/v1/user/search`, { username: event }).then(res => {
        if (res.data.status === "Ok" && res.data.data) {
          setUsers(res.data.data.map(user => ({ value: user.id, label: user.username })));
        }
      });
    }
  };

  const cancelGame = (gameId) => {
    axios.patch(`api/v1/challenge/cancel_challenge/${gameId}`, { ID: gameId, CanceledBy: userId }).then(res => {
      if (res.data.status === "Ok") {
        showAlert("success", "challenge canceled");
        fetchChallenges();
        fetchWallets();
      }
    });
  };

  const updateGame = (matrixId, action) => {
    axios.patch(`api/v1/challenge-martrix/${matrixId}`, { ID: matrixId, Player: userId, AcceptedChallenge: action }).then(res => {
      if (res.data.status === "Ok") {
        showAlert("success", "challenge updated");
        fetchChallenges();
        fetchWallets();
      }
    });
  };

  const claimGame = (e) => {
    e.preventDefault();
    axios.post(`api/v1/game`, claimPayload).then(res => {
      if (res.data.status === "Ok") {
        showAlert("success", "claimed successfully");
        fetchChallenges();
        fetchWallets();
      }
    });
  };

  useEffect(() => {
    fetchChallenges();
    fetchWallets();
    fetchGameTypes();
    fetchProfile();
  }, []);

  return (
    <DashboardWrapper>

      <Modal show={challengeModal} onHide={closeChallengeModal} backdrop="static" keyboard={false} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create challenge</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={challengeSubmit}>
            <div className='row m-1'>
              <div className='col-md-6'>
                <label><span className='fa fa-users'></span> Opponent</label>
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  isClearable={true}
                  isSearchable={true}
                  name="opponent"
                  options={users}
                  onChange={setOpponent}
                  onInputChange={searchUsers}
                />
                <div className='error_holder'>{inputErrors.opponent}</div>
              </div>

              <div className='col-md-6'>
                <label>Game type</label>
                <select className='form-control' name="challenge_type_code" onChange={handleGameInput} value={gameVariables.challenge_type_code}>
                  <option value=''>Select game type</option>
                  {challengeTypes.map((challenge, index) => (
                    <option key={index} value={challenge.code}>{challenge.name}</option>
                  ))}
                </select>
                <div className='error_holder'>{inputErrors.game_type}</div>
              </div>
            </div>

            <div className='row m-1'>
              <div className='col-md-6'>
                <label>Currency</label>
                <select className='form-control' name="currency" onChange={handleGameInput} value={gameVariables.currency}>
                  <option value=''>Select currency</option>
                  {userWallets.map((wallet, index) => (
                    <option key={index}>{wallet.currency}</option>
                  ))}
                </select>
                <div className='error_holder'>{inputErrors.currency}</div>
              </div>

              <div className='col-md-6'>
                <label>Amount</label>
                <input type="text" className='form-control' name="fees" onChange={handleGameInput} value={gameVariables.fees} />
                <div className='error_holder'>{inputErrors.amount}</div>
              </div>
            </div>

            <div className='row m-1'>
              <div className='col-md-12'>
                <button type="submit" className='btn btn-success btn-sm'>Save challenge</button>
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer />
      </Modal>

      <Modal show={gameSettleModal} onHide={closeGameSettleModal} backdrop="static" keyboard={false} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Claim game</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={claimGame}>
            <div className='row m-1'>
              <div className='col-md-12'>
                <label>Game ID</label>
                <input type="text" placeholder='from chess.com' className='form-control' name="GameID" onChange={handleInput} />
              </div>
            </div>
            <div className='row m-1'>
              <div className='col-md-12'>
                <button type="submit" className='btn btn-success btn-sm'><span className='fa fa-trophy'></span> Claim game</button>
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <Modal show={withdrawModal} onHide={closeWithdrawalModal} backdrop="static" keyboard={false} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>KES WITHDRAWAL</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={withdrawDeposit}>
            <div className='row m-1'>
              <div className='col-md-12'>
                <label>Phone number</label>
                <input type="number" className='form-control' placeholder='254XXXXXXXXX' name='phone' onChange={handleWithdrawInput} value={withdrawVariables.phone} />
              </div>
            </div>
            <div className='row m-1'>
              <div className='col-md-12'>
                <label>Amount</label>
                <input type="number" className='form-control' placeholder='AMOUNT' min='1' name='amount' onChange={handleWithdrawInput} value={withdrawVariables.amount} />
              </div>
            </div>
            <div className='row m-1'>
              <div className='col-md-12'>
                <button type="submit" className='btn btn-success btn-sm' disabled={withdrawing}>
                  {withdrawing
                    ? <><span className='spinner-border spinner-border-sm me-1' role='status' aria-hidden='true'></span>Processing...</>
                    : 'Withdraw'}
                </button>
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <Modal show={depositModal} onHide={closeDepositModal} backdrop="static" keyboard={false} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>KES DEPOSIT</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={saveDeposit}>
            <div className='row m-1'>
              <div className='col-md-12'>
                <label>Phone number</label>
                <input type="number" className='form-control' placeholder='254XXXXXXXXX' name='phoneNumber' onChange={handleDepositInput} value={depositVariables.phoneNumber} />
              </div>
            </div>
            <div className='row m-1'>
              <div className='col-md-12'>
                <label>Amount</label>
                <input type="number" className='form-control' placeholder='AMOUNT' min='1' name='amount' onChange={handleDepositInput} value={depositVariables.amount} />
              </div>
            </div>
            <div className='row m-1'>
              <div className='col-md-12'>
                <button type="submit" className='btn btn-success btn-sm' disabled={depositing}>
                  {depositing
                    ? <><span className='spinner-border spinner-border-sm me-1' role='status' aria-hidden='true'></span>Processing...</>
                    : 'Deposit'}
                </button>
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <TopNav />
      <Sidebar />

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
                    <img className="img-circle elevation-2" src={auth.avatar} alt="User Avatar" />
                  </div>
                  <div className="widget-user-header bg-info">
                    <h5 className="widget-user-desc">{auth.username?.toLocaleUpperCase()}</h5>
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
                          <span className='btn btn-default btn-sm' onClick={openDepositModal}>
                            Deposit <span className='fas fa-arrow-up'></span>
                          </span>
                        </span>
                      </div>
                      <div style={{ width: '50%' }}>
                        <span className="small-box-footer" style={{ padding: '5px' }}>
                          <span className='btn btn-default btn-sm' onClick={openWithdrawalModal}>
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
                      <span className="btn btn-success btn-sm" onClick={openChallengeModal}>
                        New challenge
                      </span>
                    </div>
                  </div>

                  <div className="card-body table-responsive" style={{ paddingBottom: '80px' }}>
                    <table className="table table-hover text-nowrap">
                      <thead>
                        <tr>
                          <th style={{ fontSize: '14px' }}>#</th>
                          <th style={{ fontSize: '14px' }}>Date</th>
                          <th style={{ fontSize: '14px' }}>Challenge</th>
                          <th style={{ fontSize: '14px' }}>Entry Fee</th>
                          <th style={{ fontSize: '14px' }}>Status</th>
                          <th style={{ fontSize: '14px' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userChallenges?.map((challenge, index) => (
                          <tr key={index}>
                            <td style={{ fontSize: '14px' }}>{index + 1}</td>
                            <td style={{ fontSize: '14px' }}>{FormatTime(challenge.CreatedAt)}</td>
                            <td style={{ fontSize: '14px' }}>{challenge.Description}</td>
                            <td style={{ fontSize: '14px' }}>{challenge.Currency} {challenge.EntryFee}</td>
                            <td style={{ fontSize: '14px' }}>
                              {challenge.Status === 'canceled' && <><span className='fa fa-times-circle red'></span> canceled</>}
                              {challenge.Status === 'pending' && <><span className='fa fa-spinner'></span> pending</>}
                              {challenge.Status === 'complete' && <><span className='fa fa-check-circle green'></span> complete</>}
                              {challenge.Status === 'active' && <><span className='fa fa-circle-notch fa-spin green'></span> active</>}
                            </td>
                            <td style={{ fontSize: '14px' }}>
                              <Dropdown>
                                <Dropdown.Toggle variant="secondary" size="sm">action</Dropdown.Toggle>
                                <Dropdown.Menu>
                                  {challenge.Status === 'pending' && (
                                    challenge.AcceptedChallenge == 1
                                      ? <Dropdown.Item onClick={() => cancelGame(challenge.Challengeid)}><span className='fa fa-times-circle'></span> Cancel</Dropdown.Item>
                                      : <>
                                          <Dropdown.Item onClick={() => updateGame(challenge.ID, 1)}>Accept</Dropdown.Item>
                                          <Dropdown.Item onClick={() => updateGame(challenge.ID, 3)}>Reject</Dropdown.Item>
                                        </>
                                  )}
                                  {challenge.Status === 'active' && (
                                    <Dropdown.Item onClick={() => openGameSettleModal(challenge.ChallengeCode, challenge.GameType)}>
                                      <i className="fa fa-trophy"></i> Claim
                                    </Dropdown.Item>
                                  )}
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

export default PlayerDashboard;
