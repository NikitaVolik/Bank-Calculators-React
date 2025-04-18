// client/src/App.js

// import logo from './logo.svg';
import './App.sass';
import React, { useEffect } from "react";
import { Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import LoanCalculator from "./components/LoanCalculator";
import DepositCalculator from "./components/DepositCalculator";
import NavBar from "./components/NavBar";
import AdminPanel from "./components/AdminPanel";
import { initGA, trackPageview } from "./components/GA";

function App() {

  const location = useLocation()

  useEffect(() => {
    initGA()
  }, [])

  useEffect (() => {
    console.log('Current location', location)
    trackPageview(location.pathname + location.search)
  }, [location])

  return (
    <>
      <NavBar />
      <Routes>
        <Route path='/' element={<LoanCalculator />} />
        <Route path='/deposit' element={<DepositCalculator />} />
        <Route path='/admin' element={<AdminPanel />} />
      </Routes>
    </>
  )
}

export default App;