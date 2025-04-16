// client/src/App.js

// import logo from './logo.svg';
import './App.sass';
import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import LoanCalculator from "./components/LoanCalculator";
import DepositCalculator from "./components/DepositCalculator";
import NavBar from './components/NavBar';
import AdminPanel from "./components/AdminPanel";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path='/' element={<LoanCalculator />} />
        <Route path='/deposit' element={<DepositCalculator />} />
        <Route path='/admin' element={<AdminPanel />} />
      </Routes>
    </Router>
  )
}

export default App;