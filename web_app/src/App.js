import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import PlayerStatus from "./components/PlayerStatus";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PlayerStatus/>} />
        <Route path="/register/:token" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
