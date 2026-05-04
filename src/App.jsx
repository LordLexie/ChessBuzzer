import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';

import Login from './pages/Login.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminTransactions from './pages/AdminTransactions.jsx'
import AdminPlayers from './pages/AdminPlayers.jsx'
import PlayerDashboard from './pages/PlayerDashboard.jsx'
import PlayerTransactions from './pages/PlayerTransactions.jsx'
import PrivateRoutes from './components/authentication/PrivateRoutes.jsx'
import AdminPrivateRoutes from './components/authentication/AdminPrivateRoutes.jsx'
import RegistrationPage from './components/layouts/Registrationpage.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

axios.defaults.baseURL = "http://127.0.0.1:8888";
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
        </Route>

        <Route element={<PrivateRoutes />} >
          <Route path="/dashboard" element={<PlayerDashboard />} />
          <Route path="/transactions" element={<PlayerTransactions />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
