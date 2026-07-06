import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getJobApplications, updateApplicationStatus } from "../services/applications";
import { getJobById } from "../services/jobs";
import { getCandidateProfile } from "../services/auth";
import "./JobApplications.css";

const JobApplications = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters and search
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Selected candidate for modal/drawer details
  const [selectedApp, setSelectedApp] = useState(null);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [jobData, appsData] = await Promise.all([
          getJobById(jobId),
          getJobApplications(jobId),
        ]);
        setJob(jobData.job);
        setApplications(appsData.applications || []);
      } catch (err) {
        setError(err.message || "Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  // Apply filters
  useEffect(() => {
    let result = [...applications];

    if (statusFilter !== "all") {
      result = result.filter((app) => app.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (app) =>
          app.candidate_name?.toLowerCase().includes(query) ||
          app.candidate_email?.toLowerCase().includes(query) ||
          app.candidate_location?.toLowerCase().includes(query)
      );
    }

    setFilteredApps(result);
  }, [applications, statusFilter, searchQuery]);

  // Load detailed profile for selected candidate
  const handleViewProfile = async (app) => {
    setSelectedApp(app);
    setIsLoadingProfile(true);
    setProfileError("");
    setCandidateProfile(null);
    try {
      const data = await getCandidateProfile(app.candidate_id);
      setCandidateProfile(data.profile);
    } catch (err) {
      setProfileError(err.message || "Could not fetch candidate details.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingStatus(true);
    setError("");
    setSuccess("");
    try {
      await updateApplicationStatus(appId, newStatus);
      
      // Update local state for candidate listing
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );

      // Update selected modal status locally
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp((prev) => ({ ...prev, status: newStatus }));
      }

      setSuccess("Candidate status updated successfully.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to update candidate status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "offered":
        return "badge-success";
      case "interviewing":
        return "badge-info";
      case "reviewing":
        return "badge-warning";
      case "applied":
        return "badge-secondary";
      case "rejected":
        return "badge-danger";
      case "withdrawn":
        return "badge-dark";
      default:
        return "badge-secondary";
    }
  };

  // Compute stat counts
  const stats = {
    total: applications.length,
    reviewing: applications.filter((app) => app.status === "reviewing").length,
    interviewing: applications.filter((app) => app.status === "interviewing").length,
    offered: applications.filter((app) => app.status === "offered").length,
    rejected: applications.filter((app) => app.status === "rejected").length,
  };

  return (
    <div className="applications-page-wrapper">
      <Navbar />
      <main className="applications-main container">
        {/* Header Section */}
        <div className="applications-header">
          <Link className="back-link" to="/recruiter/jobs">
            <i className="bx bx-left-arrow-alt"></i> Back to Posted Jobs
          </Link>
          <div className="header-title-row">
            <div>
              <p className="applications-eyebrow">Recruiter Dashboard</p>
              <h1>{job ? `Candidates for ${job.title}` : "Manage Candidates"}</h1>
              <p className="applications-sub">
                {job ? `${job.company_name} • ${job.location}` : "Hiring details"}
              </p>
            </div>
          </div>
        </div>

        {error ? <p className="auth-message auth-error">{error}</p> : null}
        {success ? <p className="auth-message auth-success">{success}</p> : null}

        {isLoading ? (
          <div className="applications-loading">
            <div className="spinner"></div>
            <p>Loading candidate list...</p>
          </div>
        ) : (
          <>
            {/* Stats Dashboard */}
            <section className="applications-stats-grid">
              <div className="stat-card total">
                <h3>Total Applicants</h3>
                <span className="number">{stats.total}</span>
              </div>
              <div className="stat-card reviewing">
                <h3>Reviewing</h3>
                <span className="number">{stats.reviewing}</span>
              </div>
              <div className="stat-card interviewing">
                <h3>Interviewing</h3>
                <span className="number">{stats.interviewing}</span>
              </div>
              <div className="stat-card offered">
                <h3>Offered</h3>
                <span className="number">{stats.offered}</span>
              </div>
              <div className="stat-card rejected">
                <h3>Rejected</h3>
                <span className="number">{stats.rejected}</span>
              </div>
            </section>

            {/* Filter and Search Bar */}
            <section className="filter-controls-card">
              <div className="search-box">
                <i className="bx bx-search"></i>
                <input
                  type="text"
                  placeholder="Search by candidate name, email or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-tabs-row">
                <span className="filter-label">Filter by Status:</span>
                <div className="filter-tabs">
                  {[
                    { id: "all", label: "All" },
                    { id: "applied", label: "Applied" },
                    { id: "reviewing", label: "Reviewing" },
                    { id: "interviewing", label: "Interviewing" },
                    { id: "offered", label: "Offered" },
                    { id: "rejected", label: "Rejected" },
                    { id: "withdrawn", label: "Withdrawn" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      className={`filter-tab-btn ${statusFilter === tab.id ? "active" : ""}`}
                      onClick={() => setStatusFilter(tab.id)}
                      type="button"
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Applicants Listing */}
            {filteredApps.length > 0 ? (
              <section className="applicants-list">
                {filteredApps.map((app) => (
                  <article className="applicant-card" key={app.id}>
                    <div className="applicant-info">
                      {app.candidate_avatar ? (
                        <img
                          className="applicant-avatar"
                          src={app.candidate_avatar}
                          alt={app.candidate_name}
                        />
                      ) : (
                        <div className="applicant-avatar-fallback">
                          {app.candidate_name?.charAt(0) || "C"}
                        </div>
                      )}
                      <div className="applicant-meta">
                        <h2>{app.candidate_name}</h2>
                        <div className="applicant-sub-meta">
                          <span>
                            <i className="bx bx-envelope"></i> {app.candidate_email}
                          </span>
                          {app.candidate_phone ? (
                            <span>
                              <i className="bx bx-phone"></i> {app.candidate_phone}
                            </span>
                          ) : null}
                          {app.candidate_location ? (
                            <span>
                              <i className="bx bx-map"></i> {app.candidate_location}
                            </span>
                          ) : null}
                        </div>
                        <p className="applied-time">
                          Applied on: {new Date(app.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="applicant-actions">
                      <span className={`status-badge ${getStatusBadgeClass(app.status)}`}>
                        {app.status}
                      </span>
                      <button
                        className="btn btn-outline"
                        type="button"
                        onClick={() => handleViewProfile(app)}
                      >
                        View Profile
                      </button>
                      {app.resume_url ? (
                        <a
                          className="btn btn-primary"
                          href={app.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <i className="bx bx-download"></i> Resume
                        </a>
                      ) : (
                        <span className="no-resume">No Resume</span>
                      )}
                    </div>
                  </article>
                ))}
              </section>
            ) : (
              <section className="empty-applicants-card">
                <i className="bx bx-user-x"></i>
                <h2>No candidates found</h2>
                <p>Try resetting the search filters or check back later.</p>
              </section>
            )}
          </>
        )}
      </main>

      {/* Candidate Profile Details Modal/Drawer */}
      {selectedApp ? (
        <div className="profile-modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setSelectedApp(null)}
              aria-label="Close modal"
            >
              <i className="bx bx-x"></i>
            </button>

            {isLoadingProfile ? (
              <div className="modal-loading">
                <div className="spinner"></div>
                <p>Loading candidate profile details...</p>
              </div>
            ) : profileError ? (
              <div className="modal-error">
                <p className="auth-message auth-error">{profileError}</p>
              </div>
            ) : (
              <>
                {/* Candidate Overview Header */}
                <div className="modal-candidate-header">
                  {selectedApp.candidate_avatar ? (
                    <img
                      className="modal-candidate-avatar"
                      src={selectedApp.candidate_avatar}
                      alt={selectedApp.candidate_name}
                    />
                  ) : (
                    <div className="modal-candidate-avatar-fallback">
                      {selectedApp.candidate_name?.charAt(0) || "C"}
                    </div>
                  )}
                  <div>
                    <h2>{selectedApp.candidate_name}</h2>
                    <p className="candidate-bio">
                      {candidateProfile?.bio || "No bio description provided."}
                    </p>
                    <div className="modal-contact-row">
                      <span>
                        <i className="bx bx-envelope"></i> {selectedApp.candidate_email}
                      </span>
                      {selectedApp.candidate_phone ? (
                        <span>
                          <i className="bx bx-phone"></i> {selectedApp.candidate_phone}
                        </span>
                      ) : null}
                      {selectedApp.candidate_location ? (
                        <span>
                          <i className="bx bx-map"></i> {selectedApp.candidate_location}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="modal-divider"></div>

                <div className="modal-body-layout">
                  {/* Left Column: Cover Letter & Experience */}
                  <div className="modal-left-panel">
                    <section className="modal-section">
                      <h3>Cover Letter</h3>
                      {selectedApp.cover_letter ? (
                        <div className="cover-letter-box">
                          <p>{selectedApp.cover_letter}</p>
                        </div>
                      ) : (
                        <p className="no-data-text">No cover letter was submitted.</p>
                      )}
                    </section>

                    <section className="modal-section">
                      <h3>Experience Timeline</h3>
                      {candidateProfile?.experience?.length > 0 ? (
                        <div className="modal-timeline">
                          {candidateProfile.experience.map((exp) => (
                            <div className="timeline-item" key={exp.id}>
                              <div className="timeline-dot"></div>
                              <div className="timeline-content">
                                <h4>{exp.role}</h4>
                                <p className="timeline-company">{exp.company_name}</p>
                                <span className="timeline-period">{exp.period}</span>
                                {exp.description ? <p>{exp.description}</p> : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-data-text">No experience history reported.</p>
                      )}
                    </section>
                  </div>

                  {/* Right Column: Status & Skills */}
                  <div className="modal-right-panel">
                    <section className="modal-section highlight-box">
                      <h3>Manage Application</h3>
                      <div className="status-management">
                        <label htmlFor="status-select">Current Status:</label>
                        <select
                          id="status-select"
                          value={selectedApp.status}
                          disabled={updatingStatus}
                          onChange={(e) => handleStatusChange(selectedApp.id, e.target.value)}
                        >
                          <option value="applied">Applied</option>
                          <option value="reviewing">Reviewing</option>
                          <option value="interviewing">Interviewing</option>
                          <option value="offered">Offered</option>
                          <option value="rejected">Rejected</option>
                          <option value="withdrawn">Withdrawn</option>
                        </select>
                      </div>

                      {selectedApp.resume_url ? (
                        <a
                          className="btn btn-primary btn-block modal-resume-btn"
                          href={selectedApp.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <i className="bx bx-download"></i> Download Resume
                        </a>
                      ) : (
                        <p className="no-resume-notice">No resume file attached.</p>
                      )}
                    </section>

                    <section className="modal-section">
                      <h3>Skills</h3>
                      {candidateProfile?.skills?.length > 0 ? (
                        <div className="modal-skills-list">
                          {candidateProfile.skills.map((skill) => (
                            <span className="skill-pill" key={skill.id}>
                              {skill.skill_name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="no-data-text">No skills listed.</p>
                      )}
                    </section>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default JobApplications;
