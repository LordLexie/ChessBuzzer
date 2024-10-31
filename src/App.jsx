import { useState } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';

import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Login from './pages/Login.jsx'
import PlayerDashboard from './pages/PlayerDashboard.jsx'

function App() {

  return (
    <Router> 
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<PlayerDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
