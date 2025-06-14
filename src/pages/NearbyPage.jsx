// File: src/pages/NearbyPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./NearbyPage.css";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "../components/Footer";

export default function NearbyPage() {
  const [filterOptions, setFilterOptions] = useState({ age_groups: [],
													  phases: [],
													  statuses: [],
													  study_types: [],
													  intervention_types: [],
													  });
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [coords, setCoords] = useState({ lat: "", lon: "" });
  const [manualLocation, setManualLocation] = useState({ city: "", state: "", country: "" });
  const isMobile = window.innerWidth <= 768;
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearchTerm = searchParams.get('q') || "";
  const [searchInput, setSearchInput] = useState(initialSearchTerm);
  const [sortBy, setSortBy] = useState("relevance");
  
	const smartApplyFiltersFromQuery = () => {
	  const tokens = searchInput.trim().toLowerCase().split(/\s+/);
	  const newFilters = { ...filters };

	  // Match intervention types by keyword
	  const interventionMap = {
		"drug": "Drug",
		"device": "Device",
		"procedure": "Procedure",
		"test": "Diagnostic_Test",
		"biological": "Biological",
		"radiation": "Radiation",
		"dietary": "Dietary_Supplement",
		"genetic": "Genetic"
	  };

	  for (const word of tokens) {
		if (interventionMap[word]) {
		  newFilters.intervention_type = interventionMap[word];
		  break;
		}
	  }

	  // Match city from dynamic list
	  const matchingCity = filterOptions.cities?.find(city =>
		tokens.includes(city.toLowerCase())
	  );
	  if (matchingCity) {
		newFilters.city = matchingCity;
	  }

	  // ✅ Match state from filterOptions.states
	  const matchingState = filterOptions.states?.find(state =>
		tokens.includes(state.toLowerCase())
	  );
	  if (matchingState) {
		newFilters.state = matchingState;
	  }

	  // ✅ Match country from filterOptions.countries
	  const matchingCountry = filterOptions.countries?.find(country =>
		tokens.includes(country.toLowerCase())
	  );
	  if (matchingCountry) {
		newFilters.country = matchingCountry;
	  }

	  setFilters(newFilters);
	};

  const [filters, setFilters] = useState({
	  facility: "",
	  phase: "",
	  status: "",
	  study_type: "",
	  intervention_type: "",
	  age_group: "",
	  sex: "",
	  has_results: false,
	  start_date_from: "",
	  start_date_to: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const [radius, setRadius] = useState("5mi");
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [useMyLocation, setUseMyLocation] = useState(true);
  const limit = 10;
  const offset = (page - 1) * limit;
  const navigate = useNavigate();

  const fetchFilterOptions = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/filters`);
      setFilterOptions({   age_groups: res.data.age_groups,
						  phases: res.data.phases,
						  statuses: res.data.statuses,
						  study_types: res.data.study_types,
						  intervention_types: res.data.intervention_types,
						  });
    } catch (err) {
      console.error("Failed to fetch filter options:", err);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocationAllowed(true);
      },
      () => {
        setLocationDenied(true);
      }
    );
  }, []);
  
  useEffect(() => {
	  if (initialSearchTerm && (locationAllowed || locationDenied)) {
		handleNearbySearch();
	  }
	}, [locationAllowed, locationDenied]);

  useEffect(() => {
    if ((locationAllowed || locationDenied) && !searchInput.trim()) {
      fetchNearbyTrials();
    }
  }, [page, appliedFilters, coords, manualLocation, radius]);
  
   useEffect(() => {
	  handleNearbySearch();
	}, [sortBy]);

  const fetchNearbyTrials = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        limit,
        offset,
		sort: sortBy,
        ...filters
      };

      if (useMyLocation && locationAllowed) {
        params.lat = coords.lat;
        params.lon = coords.lon;
        params.radius = radius;
      } else {
        params.city = manualLocation.city;
        params.state = manualLocation.state;
        params.country = manualLocation.country;
      }

      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/nearby`, { params });
      setResults(res.data.results || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError("Failed to fetch nearby trials.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
    setPage(1);
	fetchNearbyTrials();
  };

  const handleResetFilters = () => {
    const reset = {
      facility: "",
      status: "",
      age_group: "",
      sex: "",
      start_date_from: "",
      start_date_to: ""
    };

    setFilters(reset);
    setAppliedFilters(reset);
    setManualLocation({ city: "", state: "", country: "" });
    setRadius("5mi");
    setPage(1);
  };

  const handleNearbySearch = async () => {
	  smartApplyFiltersFromQuery();
	  try {
		setLoading(true);
		setError("");
		setPage(1);

		const params = {
		  limit,
		  offset: 0,
		  sort: sortBy,
		  ...filters
		};

		if (useMyLocation && locationAllowed) {
		  params.lat = coords.lat;
		  params.lon = coords.lon;
		  params.radius = radius;
		} else {
		  params.city = manualLocation.city;
		  params.state = manualLocation.state;
		  params.country = manualLocation.country;
		}

		if (searchInput.trim()) {
		  params.q = searchInput.trim();
		}

		const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/nearby`, { params });
		setResults(res.data.results || []);
		setTotal(res.data.total || 0);
	  } catch (err) {
		console.error("❌ Nearby search error:", err);
		setError("Failed to fetch nearby trials.");
	  } finally {
		setLoading(false);
	  }
	};


  const renderPagination = () => {
    const totalPages = Math.ceil(total / limit);
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisible = 5;
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + maxVisible - 1);
    for (let i = start; i <= end; i++) pageNumbers.push(i);

    return (
      <>
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>&laquo; Previous</button>
          {pageNumbers.map((p) => (
            <button
              key={p}
              className={`page-button ${p === page ? "active-page" : ""}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          {end < totalPages && <span>... {totalPages}</span>}
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next &raquo;</button>
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
        <div className="nearby-top-bar">
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <a href="/" className="back-link">← Home</a>
            <a href="/results" className="back-link">← Back to Results</a>
          </div>
          <h2 style={{ textAlign: "center" }}>Find Nearby Clinical Trials</h2>
        </div>
		<div className="top-search-bar">
		  <input
			type="text"
			placeholder="Search nearby clinical trials..."
			value={searchInput}
			onChange={(e) => setSearchInput(e.target.value)}
			onKeyDown={(e) => {
			  if (e.key === "Enter") handleNearbySearch();
			}}
		  />
		  <button
			onClick={handleNearbySearch}
		  >
			Search
		  </button>
		</div>
        <div className="results-container">
		{isMobile && (
		  <div className="mobile-filter-toggle">
			<button onClick={() => setMobileFiltersVisible(!mobileFiltersVisible)}>
			  {mobileFiltersVisible ? "Hide Filters ▲" : "Show Filters ▼"}
			</button>
		  </div>
		)}
		{(!isMobile || mobileFiltersVisible) && (
          <div className="results-sidebar">
            <div className="switch-wrapper">
              <label className="switch">
                <input type="checkbox" checked={useMyLocation} onChange={() => setUseMyLocation((prev) => !prev)} />
                <span className="slider"></span>
              </label>
              <span className="switch-label">Use My Location</span>
            </div>

            {!useMyLocation && (
              <>
                <label>City:</label>
                <input type="text" value={manualLocation.city} onChange={(e) => setManualLocation({ ...manualLocation, city: e.target.value })} />
                <label>State:</label>
                <input type="text" value={manualLocation.state} onChange={(e) => setManualLocation({ ...manualLocation, state: e.target.value })} />
                <label>Country:</label>
                <input type="text" value={manualLocation.country} onChange={(e) => setManualLocation({ ...manualLocation, country: e.target.value })} />
              </>
            )}

            <label>Facility:</label>
            <input type="text" value={filters.facility} onChange={(e) => setFilters({ ...filters, facility: e.target.value })} />

			<label>Phase:</label>
			<select
			  value={filters.phase}
			  onChange={(e) => setFilters({ ...filters, phase: e.target.value })}
			>
			  <option value="">All</option>
			  {filterOptions.phases?.map((p) => (
				<option key={p} value={p}>{p}</option>
			  ))}
			</select>

            <label>Status:</label>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All</option>
              <option value="Recruiting">Recruiting</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Other">Other</option>
            </select>
			
			<label>Study Type:</label>
			<select
			  value={filters.study_type}
			  onChange={(e) => setFilters({ ...filters, study_type: e.target.value })}
			>
			  <option value="">All</option>
			  {filterOptions.study_types?.map((type) => (
				<option key={type} value={type}>{type}</option>
			  ))}
			</select>
			
			<label>Intervention Type:</label>
			<select
			  value={filters.intervention_type}
			  onChange={(e) => setFilters({ ...filters, intervention_type: e.target.value })}
			>
			  <option value="">All</option>
			  {filterOptions.intervention_types?.map((type) => (
				<option key={type} value={type}>{type}</option>
			  ))}
			</select>

            <label>Age Group:</label>
            <select value={filters.age_group} onChange={(e) => setFilters({ ...filters, age_group: e.target.value })}>
              <option value="">All</option>
              {filterOptions.age_groups.map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>

            <label>Sex:</label>
            <select value={filters.sex} onChange={(e) => setFilters({ ...filters, sex: e.target.value })}>
              <option value="">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="All">All Genders</option>
              <option value="Other">Other</option>
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

            <label>Start Date From:</label>
            <input type="date" value={filters.start_date_from} onChange={(e) => setFilters({ ...filters, start_date_from: e.target.value })} />

            <label>Start Date To:</label>
            <input type="date" value={filters.start_date_to} onChange={(e) => setFilters({ ...filters, start_date_to: e.target.value })} />

            {useMyLocation && (
              <>
                <label>Distance Radius:</label>
                <select value={radius} onChange={(e) => setRadius(e.target.value)}>
                  {["5mi", "10mi", "20mi", "50mi", "100mi", "200mi"].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </>
            )}

            <button className="nearby-button" onClick={applyFilters}>
              🔍 Apply Filters
            </button>
            <button className="nearby-button" style={{ marginTop: "0.5rem", background: "#ccc", color: "#333" }} onClick={handleResetFilters}>
              ♻️ Reset
            </button>
          </div>
		)}

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
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="error">{error}</p>
            ) : results.length === 0 ? (
              <p>No nearby trials found.</p>
            ) : (
              <>
                <p>Showing {results.length} of {total} results near you.</p>
                <div className="results-list">
                  {results.map((r, i) => (
                    <div className="result-card" key={i}>
                      <h3>
                        {r.nct_id} — <a href={`https://clinicaltrials.gov/study/${r.nct_id}`} target="_blank" rel="noreferrer">{r.title || "Untitled Study"}</a>
                      </h3>
                      <p>{r.summary?.slice(0, 250)}...</p>
                      <p className="meta">
                        Facility: {r.facility || "N/A"} <br />
                        Location: {r.city || ""}, {r.state || ""}, {r.country || ""} <br />
                        Status: {r.status || "N/A"} | Phase: {r.phase || "N/A"} <br />
                        Start Date: {r.start_date || "N/A"}
                      </p>
                    </div>
                  ))}
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
