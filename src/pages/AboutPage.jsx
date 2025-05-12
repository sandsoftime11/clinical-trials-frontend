// File: src/pages/AboutPage.jsx
import React from "react";
import "./AboutPage.css";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="about-container">
      <div style={{ marginBottom: "1.5rem" }}>
        <Link to="/" style={{ color: "#0077cc", textDecoration: "none", fontWeight: "bold" }}>
          ← Back to Home
        </Link>
      </div>

      <h1>About This Site</h1>

      <section>
        <h2>Clinical Trials Disclaimer</h2>
        <p>
          This website provides publicly available data from{" "}
          <a
            href="https://clinicaltrials.gov"
            target="_blank"
            rel="noopener noreferrer"
          >
            ClinicalTrials.gov
          </a>. While every effort has been made to accurately display trial
          information, we do not guarantee its completeness or correctness. This
          site is not affiliated with ClinicalTrials.gov or the U.S. National
          Institutes of Health.
        </p>
        <p>
          Content may be modified to improve clarity or formatting. Data is
          presented for informational purposes only and should not be used for
          medical decision-making.
        </p>
      </section>

      <section>
        <h2>OpenSearch and Licensing</h2>
        <p>
          This site uses{" "}
          <a
            href="https://opensearch.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenSearch
          </a>{" "}
          to index and search clinical trials data. OpenSearch is licensed
          under the{" "}
          <a
            href="https://www.apache.org/licenses/LICENSE-2.0"
            target="_blank"
            rel="noopener noreferrer"
          >
            Apache 2.0 License
          </a>.
        </p>
        <p>
          You may obtain a copy of the license at{" "}
          <a
            href="https://www.apache.org/licenses/LICENSE-2.0"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://www.apache.org/licenses/LICENSE-2.0
          </a>.
        </p>
        <p>
          This license allows free use, modification, and distribution,
          provided that proper attribution is maintained.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          <span role="img" aria-label="email" style={{ marginRight: "0.4rem" }}>
            📬
          </span>
          You can reach us at{" "}
          <a href="mailto:abc@xyz.com">info@searchclinicaltrial.com</a>.
        </p>
      </section>

      <section
        style={{
          marginTop: "2rem",
          fontStyle: "italic",
          fontSize: "0.9rem",
          color: "#666",
        }}
      >
        <p>
          Last updated: <strong>May 12, 2025</strong> — based on the most recent data from ClinicalTrials.gov.
        </p>
      </section>
    </div>
  );
}
