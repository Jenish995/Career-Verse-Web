import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getRecruiterProfile } from "../services/auth";
import { closeJob, getJobs, mapJobSummary } from "../services/jobs";
import "./Profile.css";
import "./RecruiterJobs.css";

const RecruiterJobs = () => {
  const storedUser = useMemo(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  }, []);

  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [closingJobId, setClosingJobId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadJobs = async () => {
      if (!storedUser?.id || storedUser.role !== "recruiter") {
        setError("Only recruiters can manage posted jobs.");
        setIsLoading(false);
        return;
      }

      try {
        const profileData = await getRecruiterProfile(storedUser.id);
        setProfile(profileData.profile);

        if (!profileData.profile.company_id) {
          setJobs([]);
          return;
        }

        const jobsData = await getJobs({
          companyId: profileData.profile.company_id,
        });
        setJobs(jobsData.jobs.map(mapJobSummary));
      } catch (err) {
        setError(err.message || "Unable to load posted jobs.");
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, [storedUser?.id, storedUser?.role]);

  const handleCloseJob = async (jobId) => {
    if (!profile?.company_id) {
      setError("Company profile is required to close a job.");
      return;
    }

    setClosingJobId(jobId);
    setError("");
    setSuccess("");

    try {
      await closeJob(jobId, profile.company_id);
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
      setSuccess("Job closed successfully.");
    } catch (err) {
      setError(err.message || "Unable to close job.");
    } finally {
      setClosingJobId(null);
    }
  };

  return (
    <div className="profile-page-wrapper">
      <Navbar />
      <main className="profile-main container recruiter-jobs-page">
        <div className="recruiter-jobs-header">
          <div>
            <p className="recruiter-jobs-eyebrow">Recruiter tools</p>
            <h1>My Posted Jobs</h1>
            <p>
              Manage active roles for {profile?.company_name || "your company"}.
            </p>
          </div>
          <Link className="btn btn-primary" to="/post-job">
            <i className="bx bx-plus"></i> Post Job
          </Link>
        </div>

        {error ? <p className="auth-message auth-error">{error}</p> : null}
        {success ? <p className="auth-message auth-success">{success}</p> : null}

        {isLoading ? (
          <section className="profile-section-card">
            <p>Loading posted jobs...</p>
          </section>
        ) : jobs.length > 0 ? (
          <section className="recruiter-jobs-list">
            {jobs.map((job) => (
              <article className="recruiter-job-card" key={job.id}>
                <div className="recruiter-job-main">
                  {job.logo ? (
                    <img src={job.logo} alt={`${job.company} logo`} />
                  ) : (
                    <div className="recruiter-job-logo">
                      {job.company?.charAt(0) || "C"}
                    </div>
                  )}
                  <div>
                    <h2>{job.title}</h2>
                    <p>{job.company}</p>
                    <div className="recruiter-job-meta">
                      <span>
                        <i className="bx bx-map"></i> {job.location}
                      </span>
                      <span>
                        <i className="bx bx-time-five"></i> {job.type}
                      </span>
                      <span>
                        <i className="bx bx-briefcase"></i> {job.experience}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="recruiter-job-actions">
                  <Link className="btn btn-outline" to={`/job/${job.id}`}>
                    View
                  </Link>
                  <Link className="btn btn-success" to={`/recruiter/jobs/${job.id}/applications`}>
                    Applicants ({job.applicantsCount || 0})
                  </Link>
                  <Link className="btn btn-primary" to={`/post-job/${job.id}`}>
                    Edit
                  </Link>
                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={() => handleCloseJob(job.id)}
                    disabled={closingJobId === job.id}
                  >
                    {closingJobId === job.id ? "Closing..." : "Close"}
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="profile-section-card recruiter-jobs-empty">
            <i className="bx bx-briefcase-alt-2"></i>
            <h2>No active jobs yet</h2>
            <p>Post your first role when you are ready to start hiring.</p>
            <Link className="btn btn-primary" to="/post-job">
              Post Job
            </Link>
          </section>
        )}
      </main>
    </div>
  );
};

export default RecruiterJobs;
