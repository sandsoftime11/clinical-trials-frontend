// File: src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ResultsPage from "./pages/ResultsPage";
import NearbyPage from "./pages/NearbyPage";
import AboutPage from "./pages/AboutPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/results" element={<ResultsPage />} />
		<Route path="/nearby" element={<NearbyPage />} />
		<Route path="/about" element={<AboutPage />} />
      </Routes>
    </Router>
  );
}