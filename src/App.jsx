import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';

import Login from './pages/Login.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminTransactions from './pages/admin/AdminTransactions.jsx'
import AdminPlayers from './pages/admin/AdminPlayers.jsx'
import AdminPlayerDetail from './pages/admin/AdminPlayerDetail.jsx'
import AdminWallets from './pages/admin/AdminWallets.jsx'
import AdminCentralWallets from './pages/admin/AdminCentralWallets.jsx'
import AdminCentralWalletDetail from './pages/admin/AdminCentralWalletDetail.jsx'
import AdminChallenges from './pages/admin/AdminChallenges.jsx'
import AdminLeaderboard from './pages/admin/AdminLeaderboard.jsx'
import AdminPlayerArchives from './pages/admin/AdminPlayerArchives.jsx'
import AdminPlayerArchiveProfile from './pages/admin/AdminPlayerArchiveProfile.jsx'
import AdminMarketingTargets from './pages/admin/AdminMarketingTargets.jsx'
import AdminTimeAnalytics from './pages/admin/AdminTimeAnalytics.jsx'
import AdminSettings from './pages/admin/AdminSettings.jsx'
import AdminTournaments from './pages/admin/AdminTournaments.jsx'
import AdminTournamentDetail from './pages/admin/AdminTournamentDetail.jsx'
import AdminPayouts from './pages/admin/AdminPayouts.jsx'
import AboutUs from './pages/AboutUs.jsx'
import PublicLeaderboard from './pages/PublicLeaderboard.jsx'
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
import OpenChallenges from './pages/OpenChallenges.jsx';
import Tournaments from './pages/Tournaments.jsx';
import TournamentView from './pages/TournamentView.jsx';
import TournamentCreate from './pages/TournamentCreate.jsx';
import TournamentEdit from './pages/TournamentEdit.jsx';
import TournamentOrganizerView from './pages/TournamentOrganizerView.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8888';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['Accept'] = 'application/json';
axios.defaults.withCredentials = true;

// Global response interceptor — redirects to login on 401
axios.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('userInfo');
      localStorage.removeItem('adminInfo');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

function App() {

  return (
    <ErrorBoundary>
      <Toaster position="top-right" toastOptions={{ duration: 1500, style: { zIndex: 9999 } }} />
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/rankings" element={<PublicLeaderboard />} />
        <Route path="/admin" element={<AdminLogin />} />

        <Route element={<AdminPrivateRoutes />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/players" element={<AdminPlayers />} />
          <Route path="/admin/players/:userId" element={<AdminPlayerDetail />} />
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
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/tournaments" element={<AdminTournaments />} />
          <Route path="/admin/tournaments/:tournamentId" element={<AdminTournamentDetail />} />
          <Route path="/admin/payouts" element={<AdminPayouts />} />
        </Route>

        <Route element={<PrivateRoutes />} >
          <Route path="/dashboard" element={<PlayerDashboard />} />
          <Route path="/transactions" element={<PlayerTransactions />} />
          <Route path="/profile" element={<PlayerProfile />} />
          <Route path="/analytics" element={<PlayerAnalytics />} />
          <Route path="/archives" element={<PlayerArchives />} />
          <Route path="/leaderboard" element={<PlayerLeaderboard />} />
          <Route path="/open-challenges" element={<OpenChallenges />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/new" element={<TournamentCreate />} />
          <Route path="/tournaments/:tournamentId/edit" element={<TournamentEdit />} />
          <Route path="/tournaments/:tournamentId/manage" element={<TournamentOrganizerView />} />
          <Route path="/tournaments/:tournamentId" element={<TournamentView />} />
        </Route>
      </Routes>
    </Router>
    </ErrorBoundary>
  )
}

export default App
