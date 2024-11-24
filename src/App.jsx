import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import Cookies from 'js-cookie';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';

import Login from './pages/Login.jsx'
import PlayerDashboard from './pages/PlayerDashboard.jsx'
import PrivateRoutes from './components/authentication/PrivateRoutes.jsx'
import RegistrationPage from './pages/Registrationpage.jsx';

axios.defaults.baseURL = "http://127.0.0.1:8888";
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['Accept'] = 'application/json';
axios.defaults.withCredentials = true;

axios.interceptors.request.use(function (config) {
  const token = Cookies.get("Authorization");
  config.headers.Authorization = token ? `${token}` : '';
  return config;
});

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<RegistrationPage />} />
        
        <Route element={<PrivateRoutes />} >
          <Route path="/dashboard" element={<PlayerDashboard />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
