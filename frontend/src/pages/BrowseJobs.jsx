import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import JobFilters from "../components/JobFilters.jsx";
import JobCard from "../components/JobCard.jsx";
import { getCandidateApplications } from "../services/applications";
import { getJobs, mapJobSummary } from "../services/jobs";
import "./BrowseJobs.css";

const BrowseJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [sortBy, setSortBy] = useState("Newest First");
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    jobType: [],
    experience: [],
    category: [],
  });

  const currentUser = useMemo(() => {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  }, []);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const requests = [getJobs()];

        if (currentUser?.role === "candidate") {
          requests.push(getCandidateApplications(currentUser.id));
        }

        const [jobData, applicationData] = await Promise.all(requests);
        setJobs(jobData.jobs.map(mapJobSummary));
        setAppliedJobIds(
          currentUser?.role === "candidate"
            ? (applicationData?.applications || []).map(
                (application) => application.job_id,
              )
            : [],
        );
      } catch (err) {
        setError(err.message || "Unable to fetch jobs");
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, [currentUser]);

  const filteredJobs = useMemo(() => {
    let result = jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesLocation = job.location
        .toLowerCase()
        .includes(locationQuery.toLowerCase());
      const matchesType =
        selectedFilters.jobType.length === 0 ||
        selectedFilters.jobType.includes(job.type);
      const matchesCategory =
        selectedFilters.category.length === 0 ||
        selectedFilters.category.includes(job.category);
      const matchesExperience =
        selectedFilters.experience.length === 0 ||
        selectedFilters.experience.includes(job.experience);

      return (
        matchesSearch &&
        matchesLocation &&
        matchesType &&
        matchesCategory &&
        matchesExperience
      );
    });

    if (sortBy === "Salary: High to Low") {
      result = [...result].sort((a, b) => {
        const getVal = (salary) =>
          parseInt(String(salary).replace(/[^0-9]/g, ""), 10) || 0;
        return getVal(b.salary) - getVal(a.salary);
      });
    } else if (sortBy === "Newest First") {
      result = [...result].sort((a, b) => b.postedDate - a.postedDate);
    }

    return result;
  }, [jobs, searchQuery, locationQuery, selectedFilters, sortBy]);

  return (
    <div className="browse-jobs-page">
      <Navbar />

      <header className="browse-header">
        <div className="container">
          <h1>Browse Opportunities</h1>
          <p>Find your next career move from thousands of verified listings.</p>

          <div className="search-container-main">
            <div className="search-input-group">
              <i className="bx bx-search"></i>
              <input
                type="text"
                placeholder="Search job titles, companies, or keywords..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <div className="search-input-group location">
              <i className="bx bx-map"></i>
              <input
                type="text"
                placeholder="Location (e.g. Remote, NYC)"
                value={locationQuery}
                onChange={(event) => setLocationQuery(event.target.value)}
              />
            </div>
            <button className="btn btn-primary search-btn">Find Jobs</button>
          </div>
        </div>
      </header>

      <main className="browse-content container">
        <aside className="filters-sidebar">
          <JobFilters
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
          />
        </aside>

        <section className="job-listings-results">
          <div className="results-meta">
            <span>
              Showing <strong>{filteredJobs.length}</strong> jobs
            </span>
            <div className="sort-dropdown">
              <label>Sort by:</label>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option>Newest First</option>
                <option>Salary: High to Low</option>
                <option>Relevance</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="no-results">
              <h3>Loading jobs...</h3>
            </div>
          ) : error ? (
            <div className="no-results">
              <i className="bx bx-error-circle"></i>
              <h3>{error}</h3>
            </div>
          ) : (
            <div className="jobs-list">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    {...job}
                    isApplied={appliedJobIds.includes(job.id)}
                  />
                ))
              ) : (
                <div className="no-results">
                  <i className="bx bx-search-alt"></i>
                  <h3>No jobs found matching your criteria</h3>
                  <p>Try adjusting your filters or search keywords.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default BrowseJobs;
