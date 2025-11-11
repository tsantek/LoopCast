import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import PlayerStatus from "./components/PlayerStatus";
import Dashboard from "./components/Dashboard";

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
