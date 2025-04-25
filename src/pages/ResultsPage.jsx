// File: src/pages/ResultsPage.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ResultsPage.css";
import Footer from "../components/Footer";

export default function ResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get("q") || "";

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedTrials, setSelectedTrials] = useState([]);
  const [batchFormat, setBatchFormat] = useState("docx");
  const [batchMode, setBatchMode] = useState(false);
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  const isMobile = window.innerWidth <= 768;  
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  useEffect(() => {
  console.log("Using API base URL:", import.meta.env.VITE_API_BASE_URL);
}, []);
  
  const handleDownload = async (nctId, type) => {
  const endpoint = `${import.meta.env.VITE_API_BASE_URL}/downloads/${nctId}.${type}`;
  try {
    const res = await fetch(endpoint, {
      method: "GET",
      mode: "cors",
    });
    if (!res.ok) throw new Error("Failed to download");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${nctId}.${type}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert(`Failed to download ${type.toUpperCase()} for ${nctId}`);
    console.error(err);
  }
};
 
  const handleBatchDownload = async (fileType) => {
  if (selectedTrials.length === 0) {
    alert("Please select at least one trial.");
    return;
  }

  try {
    const endpoint = `${import.meta.env.VITE_API_BASE_URL}/batch_download`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nct_ids: selectedTrials, format: fileType }),
    });

    if (!res.ok) throw new Error("Batch download failed");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const filename = `clinical_trials_batch.${fileType === "excel" ? "xlsx" : "zip"}`;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert(`Failed to download ${fileType.toUpperCase()} batch.`);
    console.error(err);
  }
};

  const [filterOptions, setFilterOptions] = useState({
    statuses: [],
	facilities: [],
    cities: [],
    states: [],
    countries: [],
    study_types: [],
    age_groups: [],
    sexes: [],
	intervention_types: [],
  });

  const [filters, setFilters] = useState({
    phase: "",
    status: "",
	facility: "",
    city: "",
    state: "",
    country: "",
    study_type: "",
    intervention: "",
    age_group: "",
    sex: "",
    has_results: false,
    start_date_from: "",
    start_date_to: "",
	intervention_type: "",
  });

  const limit = 10;
  const offset = (page - 1) * limit;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchResults();
  }, [query, sortBy, page, filters]);

  const fetchFilterOptions = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/filters`);
      setFilterOptions(res.data);
    } catch (err) {
      console.error("Failed to fetch filter options:", err);
    }
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/search`, {
        params: {
          q: query,
          limit,
          offset,
          sort: sortBy,
          ...filters,
        },
      });
      if (Array.isArray(res.data.results)) {
        setResults(res.data.results);
        setTotal(res.data.total);
      } else {
        setError("Invalid response format.");
        setResults([]);
        setTotal(0);
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError("Failed to fetch results.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setQuery(searchInput.trim());
    navigate(`/results?q=${encodeURIComponent(searchInput.trim())}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
	setPage(1);
  };

  const handleApplyFilters = () => {
    setPage(1);
    fetchResults();
  };

  const handleResetFilters = () => {
    setFilters({
      phase: "",
      status: "",
	  facility: "",
      city: "",
      state: "",
      country: "",
      study_type: "",
      intervention: "",
	  intervention_type: "",
      age_group: "",
      sex: "",
      has_results: "",
      start_date_from: "",
      start_date_to: "",
    });
    setPage(1);
    fetchResults();
  };
  
  const handleTrialSelect = (nctId) => {
  setSelectedTrials((prev) => {
    const updated = prev.includes(nctId)
      ? prev.filter((id) => id !== nctId)
      : [...prev, nctId];
    console.log("Selected NCT IDs:", updated);  // ← Add this
    return updated;
  });
};

  const renderPagination = () => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  const maxVisible = 5;
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + maxVisible - 1);

  for (let i = start; i <= end; i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <div className="pagination">
        <button disabled={page === 1} onClick={() => handlePageChange(page - 1)}>
          &laquo; Previous
        </button>
        {pageNumbers.map((p) => (
          <button
            key={p}
            className={`page-button ${p === page ? "active-page" : ""}`}
            onClick={() => handlePageChange(p)}
          >
            {p}
          </button>
        ))}
        {end < totalPages && <span>... {totalPages}</span>}
        <button disabled={page === totalPages} onClick={() => handlePageChange(page + 1)}>
          Next &raquo;
        </button>
      </div>
      <div style={{ textAlign: "center", marginTop: "0.5rem", fontSize: "0.9rem", color: "#666" }}>
        Page {page} of {totalPages}
      </div>
    </>
  );
};
  
  return (
    <div className="page-wrapper">
      <div className="results-page-content">

        {/* 🔗 Home Link + Title */}
		<div className="results-header-bar">
		  <div
			style={{
			  display: "flex",
			  justifyContent: "space-between",
			  alignItems: "center",
			  paddingBottom: "-5rem",
			  borderBottom: "1px solid #ccc",
			  marginBottom: "-5.5rem",
			}}
		  >
			<a
			  href="/"
			  style={{
				color: "#0077cc",
				textDecoration: "none",
				fontWeight: "bold",
				fontSize: "1rem",
			  }}
			>
			  ← Home
			</a>
			<span style={{ fontWeight: "bold", color: "#333", fontSize: "1.1rem" }}>
			  Search Results
			</span>
		  </div>
		</div>

        <div className="top-search-bar">
          <input
            type="text"
            placeholder="Search clinical trials..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        <div className="results-container">
          {/* Sidebar */}
		  {isMobile && (
          <div className="mobile-filter-toggle">
			  <button onClick={() => setMobileFiltersVisible(!mobileFiltersVisible)}>
				{mobileFiltersVisible ? "Hide Filters ▲" : "Show Filters ▼"}
			  </button>
			</div>
		  )}
		  <div className="results-sidebar">
			<button
			  onClick={() => navigate("/nearby")}
			  style={{
				marginBottom: "1rem",
				padding: "10px 16px",
				backgroundColor: "#0077cc",
				color: "white",
				border: "none",
				borderRadius: "6px",
				fontWeight: "bold",
				cursor: "pointer",
				width: "100%"
			  }}
			>
			  📍 Look Nearby
			</button>
			{(!isMobile || mobileFiltersVisible) && (
            <div className="filters-bar">
              <h4>Filters</h4>

				<label>Phase:</label>
				<select value={filters.phase} onChange={(e) => handleFilterChange("phase", e.target.value)}>
				  <option value="">All</option>
				  <option value="Phase 1">Phase 1</option>
				  <option value="Phase 2">Phase 2</option>
				  <option value="Phase 3">Phase 3</option>
				  <option value="Phase 4">Phase 4</option>
				  <option value="N/A">N/A</option>
				</select>

				<label>Status:</label>
				<select value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)}>
				  <option value="">All</option>
				  <option value="Recruiting">Recruiting</option>
				  <option value="Active">Active (Not Recruiting)</option>
				  <option value="Completed">Completed / Ended</option>
				  <option value="Other">Other / Unknown</option>
				</select>

				<label>Study Type:</label>
				<select value={filters.study_type} onChange={(e) => handleFilterChange("study_type", e.target.value)}>
				  <option value="">All</option>
				  <option value="Interventional">Interventional</option>
				  <option value="Observational">Observational</option>
				  <option value="Other">Other</option>
				</select>

				<label>Intervention Type:</label>
				<select value={filters.intervention_type} onChange={(e) => handleFilterChange("intervention_type", e.target.value)}>
				  <option value="">All</option>
				  {filterOptions.intervention_types.map((type) => (
					<option key={type} value={type}>
					  {type
						.toLowerCase()
						.split("_")
						.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
						.join(" ")}
				  </option>
				 ))}
				</select>

				<label>Age Group:</label>
				<select value={filters.age_group} onChange={(e) => handleFilterChange("age_group", e.target.value)}>
				  <option value="">All</option>
				  {filterOptions.age_groups.map((group) => (
					<option key={group} value={group}>{group}</option>
				  ))}
				</select>

				<label>Sex:</label>
				<select value={filters.sex} onChange={(e) => handleFilterChange("sex", e.target.value)}>
				  <option value="">All</option>
				  {filterOptions.sexes
					.filter((s) => s && s.toLowerCase() !== "unknown") // filter out nulls and "unknown"
					.map((s) => {
					  const label = s.toLowerCase() === "all" ? "All Genders" : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
					  return (
						<option key={s} value={s}>{label}</option>
					  );
					})}
				  <option value="Other">Other / Unknown</option>
				</select>

				<label>Results Available:</label>
				<select
				  value={filters.has_results ? "true" : ""}
				  onChange={(e) =>
					setFilters({ ...filters, has_results: e.target.value === "true" })
				  }
				>
				  <option value="">No</option>
				  <option value="true">Yes</option>
				</select>
				
				<label>Facility:</label>
				<input
				  type="text"
				  placeholder="Enter facility name"
				  value={filters.facility}
				  onChange={(e) => handleFilterChange("facility", e.target.value)}
				/>

				<label>City:</label>
				<input
				  type="text"
				  placeholder="Enter city name"
				  value={filters.city}
				  onChange={(e) => handleFilterChange("city", e.target.value)}
				/>

				<label>State:</label>
				<input
				  type="text"
				  placeholder="Enter state name"
				  value={filters.state}
				  onChange={(e) => handleFilterChange("state", e.target.value)}
				/>

				<label>Country:</label>
				<select value={filters.country} onChange={(e) => handleFilterChange("country", e.target.value)}>
				  <option value="">All</option>
				  {filterOptions.countries.map((c) => (
					<option key={c} value={c}>{c}</option>
				  ))}
				</select>

				<label>Start Date From:</label>
				<input type="date" value={filters.start_date_from} onChange={(e) => handleFilterChange("start_date_from", e.target.value)} />

				<label>Start Date To:</label>
				<input type="date" value={filters.start_date_to} onChange={(e) => handleFilterChange("start_date_to", e.target.value)} />

              <div className="filter-buttons">
                <button onClick={handleApplyFilters}>Apply</button>
                <button onClick={handleResetFilters}>Reset</button>
              </div>
            </div>
		    )}
          </div>

          {/* Main Results */}
          <div className="results-main">
            <div
			  style={{
				display: "flex",
				alignItems: "center",
				gap: "8px",
				marginBottom: "1rem",
				background: "#f4f4f4",
				padding: "10px 14px",
				borderRadius: "8px",
				width: "fit-content",
				}}
>
			<label style={{ fontWeight: "bold", color: "#333" }}>Sort by:</label>
			<select
			  value={sortBy}
			  onChange={(e) => setSortBy(e.target.value)}
			  style={{
			    padding: "6px 10px",
			    borderRadius: "6px",
			    border: "1px solid #ccc",
			    fontSize: "0.95rem",
				}}
  >
			<option value="relevance">Relevance</option>
			<option value="newest">Newest</option>
			<option value="oldest">Oldest</option>
		   </select>
		  </div>

		<div style={{ marginBottom: "1rem", position: "relative" }}>
		  <button
			onClick={() => {
			  setBatchMode((prev) => !prev);
			  setShowFormatMenu((prev) => !prev);
			}}
			style={{
			  background: batchMode ? "#ccc" : "#0077cc",
			  color: "#fff",
			  border: "none",
			  padding: "8px 14px",
			  borderRadius: "6px",
			  cursor: "pointer",
			  fontWeight: "bold",
			}}
		  >
			{batchMode ? "Cancel Batch Mode" : "Batch Download"}
		  </button>

		  {showFormatMenu && batchMode && (
			<div style={{
			  position: "absolute",
			  background: "#fff",
			  border: "1px solid #ccc",
			  padding: "8px",
			  marginTop: "4px",
			  borderRadius: "6px",
			  zIndex: 10,
			  width: "180px",
			}}>
			  <div
				style={{ padding: "6px", cursor: "pointer" }}
				onClick={() => handleBatchDownload("docx")}
			  >
				📄 Download DOCX
			  </div>
			  <div
				style={{ padding: "6px", cursor: "pointer" }}
				onClick={() => handleBatchDownload("pdf")}
			  >
				🧾 Download PDF
			  </div>
			  <div
				style={{ padding: "6px", cursor: "pointer" }}
				onClick={() => handleBatchDownload("excel")}
			  >
				📊 Download Excel
			  </div>
			</div>
		  )}
		</div>
            <h2 style={{ color: "#003366" }}>Search results for “{query}”</h2>

            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="error">{error}</p>
            ) : results.length === 0 ? (
              <p>No results found.</p>
            ) : (
              <>
                <p>Showing {results.length} of {total} results</p>
                <div className="results-list">
				  {results.length > 0 && (
					<>
					  {batchMode && (
						<div style={{ marginBottom: "1rem", marginTop: "2.2rem" }}>
						  <label>
							<input
							  type="checkbox"
							  checked={results.every((r) => selectedTrials.includes(r.nct_id))}
							  onChange={(e) => {
								if (e.target.checked) {
								  const newIds = results.map((r) => r.nct_id);
								  setSelectedTrials((prev) => Array.from(new Set([...prev, ...newIds])));
								} else {
								  const newSelected = selectedTrials.filter(
									(id) => !results.map((r) => r.nct_id).includes(id)
								  );
								  setSelectedTrials(newSelected);
								}
							  }}
							/>{" "}
							<strong>Select all on this page</strong>
						  </label>
						</div>
					  )}

					  {results.map((r, i) => (
						<div className="result-card" key={i}>
						  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
							{batchMode && (
							  <input
								type="checkbox"
								checked={selectedTrials.includes(r.nct_id)}
								onChange={() => handleTrialSelect(r.nct_id)}
							  />
							)}
							<h3 style={{ margin: 0 }}>
							  {r.nct_id} —{" "}
							  <a
								href={`https://clinicaltrials.gov/study/${r.nct_id}`}
								target="_blank"
								rel="noreferrer"
							  >
								{r.title || "Untitled Study"}
							  </a>
							</h3>
						  </div>
						  <p>{r.summary?.slice(0, 300)}...</p>
						  <p className="meta">
							Status: {r.status || "N/A"} | Phase: {r.phase || "N/A"}
							{r.age_group ? ` | Age Group: ${r.age_group}` : ""}
							{r.interventions?.length
							  ? ` | Intervention: ${r.interventions.slice(0, 2).join(", ")}`
							  : ""}
							| Start: {r.start_date || "N/A"} | Completed: {r.completion_date || "N/A"}
						  </p>
						  <div className="download-links">
							<a
							  href="#"
							  title="Download DOCX"
							  onClick={(e) => {
								e.preventDefault();
								handleDownload(r.nct_id, "docx");
							  }}
							>
							  <img src="/icons/docx.png" alt="DOCX" className="download-icon" />
							</a>
							<a
							  href="#"
							  title="Download PDF"
							  onClick={(e) => {
								e.preventDefault();
								handleDownload(r.nct_id, "pdf");
							  }}
							>
							  <img src="/icons/pdf.png" alt="PDF" className="download-icon" />
							</a>
						  </div>
						</div>
					  ))}
					</>
				  )}
				</div>
				{renderPagination()}
				<div style={{ textAlign: "center", marginTop: "1rem" }}>
				  <a href="/about" style={{ fontSize: "0.95rem", color: "#0077cc", textDecoration: "none" }}>
					ℹ️ About this site
				  </a>
				</div>
              </>
            )}
          </div>
        </div>
      </div>
	 </div>
  );
}
