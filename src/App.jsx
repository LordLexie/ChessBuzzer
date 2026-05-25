import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';

import Login from './pages/Login.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminTransactions from './pages/admin/AdminTransactions.jsx'
import AdminPlayers from './pages/admin/AdminPlayers.jsx'
import AdminWallets from './pages/admin/AdminWallets.jsx'
import AdminCentralWallets from './pages/admin/AdminCentralWallets.jsx'
import AdminCentralWalletDetail from './pages/admin/AdminCentralWalletDetail.jsx'
import AdminChallenges from './pages/admin/AdminChallenges.jsx'
import AdminLeaderboard from './pages/admin/AdminLeaderboard.jsx'
import AdminPlayerArchives from './pages/admin/AdminPlayerArchives.jsx'
import AdminPlayerArchiveProfile from './pages/admin/AdminPlayerArchiveProfile.jsx'
import AdminMarketingTargets from './pages/admin/AdminMarketingTargets.jsx'
import AdminTimeAnalytics from './pages/admin/AdminTimeAnalytics.jsx'
import PlayerDashboard from './pages/PlayerDashboard.jsx'
import PlayerTransactions from './pages/PlayerTransactions.jsx'
import PlayerProfile from './pages/PlayerProfile.jsx'
import PrivateRoutes from './components/authentication/PrivateRoutes.jsx'
import AdminPrivateRoutes from './components/authentication/AdminPrivateRoutes.jsx'
import RegistrationPage from './components/layouts/Registrationpage.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import PlayerAnalytics from './pages/PlayerAnalytics.jsx';
import PlayerArchives from './pages/PlayerArchives.jsx';
import PlayerLeaderboard from './pages/PlayerLeaderboard.jsx';

axios.defaults.baseURL = "http://localhost:8888";
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['Accept'] = 'application/json';
axios.defaults.withCredentials = true;

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin" element={<AdminLogin />} />

        <Route element={<AdminPrivateRoutes />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/players" element={<AdminPlayers />} />
          <Route path="/admin/transactions" element={<AdminTransactions />} />
          <Route path="/admin/wallets" element={<AdminWallets />} />
          <Route path="/admin/central-wallets" element={<AdminCentralWallets />} />
          <Route path="/admin/central-wallets/:walletCode/transactions" element={<AdminCentralWalletDetail />} />
          <Route path="/admin/challenges" element={<AdminChallenges />} />
          <Route path="/admin/leaderboard" element={<AdminLeaderboard />} />
          <Route path="/admin/player-archives" element={<AdminPlayerArchives />} />
          <Route path="/admin/player-archives/:userId" element={<AdminPlayerArchiveProfile />} />
          <Route path="/admin/marketing" element={<AdminMarketingTargets />} />
          <Route path="/admin/time-analytics" element={<AdminTimeAnalytics />} />
        </Route>

        <Route element={<PrivateRoutes />} >
          <Route path="/dashboard" element={<PlayerDashboard />} />
          <Route path="/transactions" element={<PlayerTransactions />} />
          <Route path="/profile" element={<PlayerProfile />} />
          <Route path="/analytics" element={<PlayerAnalytics />} />
          <Route path="/archives" element={<PlayerArchives />} />
          <Route path="/leaderboard" element={<PlayerLeaderboard />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
