// File: src/pages/LandingPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import Footer from "../components/Footer";

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/results?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="landing-container">
      <div className="top-ad">{/* Top Ad Space */}</div>

      <div className="main-content-wrapper">
        <div className="left-ad">{/* Left Ad Space */}</div>

        <div className="center-content">
          <div className="landing-box">
    	    <div className="mobile-top-ad"></div>
            <h1 className="landing-title">Search Clinical Trial Reports</h1>
            <p className="landing-subtitle">
              Discoverable and downloadable by location or keyword.
            </p>
            <input
              type="text"
              className="landing-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Search by condition, NCT ID, or intervention"
            />
            <div className="landing-buttons">
              <button onClick={handleSearch} className="search-btn">Search</button>
            </div>
            <p className="landing-tips">
              Try keywords like <i>cancer</i>, <i>aspirin</i>, <i>NCT04368728</i>, or <i>immunotherapy</i>.
            </p>
          </div>

          <p className="landing-disclaimer">
            Disclaimer: This site uses publicly available data from ClinicalTrials.gov. We are not affiliated with or endorsed by ClinicalTrials.gov or the U.S. National Institutes of Health. Data was last processed on <strong>04/26/2025</strong>.
          </p>
        </div>

        <div className="right-ad">{/* Right Ad Space */}</div>
      </div>
	  <Footer />
    </div>
  );
}
