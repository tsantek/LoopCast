import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PlayerStatus from "./components/player-login-registration/PlayerStatus";
import Register from "./components/player-login-registration/Register";
import Dashboard from "./components/dashboard/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PlayerStatus/>} />
        <Route path="/register/:token" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<p>Page not found</p>} />

      </Routes>
    </Router>
  );
}

export default App;
