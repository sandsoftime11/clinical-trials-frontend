// File: src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <div style={{
      marginTop: "2rem",
      textAlign: "center",
      padding: "1rem 0",
      borderTop: "1px solid #ddd",
      fontSize: "0.95rem",
    }}>
      <Link to="/about" style={{ color: "#0077cc", textDecoration: "none", fontWeight: "bold" }}>
        About this site
      </Link>
    </div>
  );
}
