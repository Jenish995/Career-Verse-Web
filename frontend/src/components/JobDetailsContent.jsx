import { useMemo, useState } from "react";
import { useWishlist } from "../context/useWishlist";

const JobDetailsContent = ({
  job,
  currentUser,
  hasApplied,
  application,
  isApplying,
  applicationMessage,
  applicationError,
  onApply,
  onRequestLogin,
}) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isSaved = isInWishlist(job.id);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  const applyHint = useMemo(() => {
    if (!currentUser) {
      return "Login as a candidate to apply for this job.";
    }

    if (currentUser.role !== "candidate") {
      return "Only candidate accounts can submit job applications.";
    }

    if (hasApplied) {
      return `You already applied to this role${application?.status ? ` (${application.status})` : ""}.`;
    }

    return "You can optionally upload your resume and add a short cover letter.";
  }, [application?.status, currentUser, hasApplied]);

  const primaryButtonLabel = !currentUser
    ? "Login to Apply"
    : currentUser.role !== "candidate"
      ? "Candidates Only"
      : hasApplied
        ? "Applied"
        : showApplyForm
          ? "Close Application Form"
          : "Apply Now";

  const handlePrimaryAction = () => {
    if (!currentUser) {
      onRequestLogin();
      return;
    }

    if (currentUser.role !== "candidate" || hasApplied) {
      return;
    }

    setShowApplyForm((prev) => !prev);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const didApply = await onApply({ resumeFile, coverLetter });

    if (didApply) {
      setShowApplyForm(false);
      setResumeFile(null);
      setCoverLetter("");
    }
  };

  return (
    <div className="job-details-grid">
      <div className="job-content-left">
        <section className="job-card-section header-section">
          <div className="job-header-top">
            <div className="company-logo-large">
              <img src={job.company.logo} alt={job.company.name} />
            </div>
            <div className="job-title-group">
              <h1>{job.title}</h1>
              <div className="job-meta-row">
                <span className="company-name">{job.company.name}</span>
                <span className="dot-separator">•</span>
                <span>{job.location}</span>
                <span className="dot-separator">•</span>
                <span className="posted-date">Posted {job.postedDate}</span>
              </div>
            </div>
          </div>

          <div className="job-quick-stats">
            <div className="stat-item">
              <span className="label">Salary</span>
              <span className="value">{job.salary}</span>
            </div>
            <div className="stat-item">
              <span className="label">Job Type</span>
              <span className="value">{job.type}</span>
            </div>
            <div className="stat-item">
              <span className="label">Experience</span>
              <span className="value">{job.experience}</span>
            </div>
            <div className="stat-item">
              <span className="label">Work Mode</span>
              <span className="value">{job.workMode}</span>
            </div>
          </div>
        </section>

        <section className="job-card-section">
          <h2 className="section-title">About the Role</h2>
          <p className="text-content">{job.description}</p>

          <h3 className="section-subtitle">Key Responsibilities</h3>
          <ul className="bullet-list">
            {job.responsibilities.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="job-card-section">
          <h2 className="section-title">Skills & Qualifications</h2>
          <div className="skill-tags">
            {job.skills.map((skill) => (
              <span key={skill} className="skill-badge">
                {skill}
              </span>
            ))}
          </div>
          <div className="education-box">
            <h4>Education</h4>
            <p>{job.education}</p>
          </div>
        </section>

        <section className="job-card-section">
          <h2 className="section-title">Benefits & Perks</h2>
          <div className="benefits-grid">
            {job.benefits.map((benefit, index) => (
              <div key={index} className="benefit-item">
                <i className={`bx ${benefit.icon}`}></i>
                <span>{benefit.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="job-card-section">
          <h2 className="section-title">Application Process</h2>
          <div className="hiring-stepper">
            {job.hiringStages.map((stage, index) => (
              <div
                key={index}
                className={`step ${index <= job.currentStage ? "active" : ""}`}
              >
                <div className="step-circle">{index + 1}</div>
                <span className="step-label">{stage}</span>
                {index < job.hiringStages.length - 1 && (
                  <div className="step-line"></div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="job-sidebar-right">
        <div className="sidebar-sticky-card">
          <div className="action-buttons">
            <button
              className="btn btn-primary btn-block"
              onClick={handlePrimaryAction}
              disabled={
                hasApplied ||
                isApplying ||
                currentUser?.role === "recruiter" ||
                currentUser?.role === "admin"
              }
            >
              {isApplying ? "Submitting..." : primaryButtonLabel}
            </button>

            <p className="application-helper-text">{applyHint}</p>

            {applicationMessage ? (
              <div className="application-feedback success">
                {applicationMessage}
              </div>
            ) : null}
            {applicationError ? (
              <div className="application-feedback error">
                {applicationError}
              </div>
            ) : null}

            {hasApplied && application ? (
              <div className="application-status-card">
                <div className="application-status-row">
                  <span>Status</span>
                  <strong>{application.status}</strong>
                </div>
                <div className="application-status-row">
                  <span>Applied</span>
                  <strong>
                    {new Date(application.applied_at).toLocaleDateString()}
                  </strong>
                </div>
                {application.resume_url ? (
                  <a
                    className="application-link"
                    href={application.resume_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View uploaded resume
                  </a>
                ) : null}
              </div>
            ) : null}

            {showApplyForm &&
            currentUser?.role === "candidate" &&
            !hasApplied ? (
              <form className="application-form" onSubmit={handleSubmit}>
                <label className="application-field">
                  <span>Resume (optional)</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(event) =>
                      setResumeFile(event.target.files?.[0] || null)
                    }
                  />
                </label>

                {resumeFile ? (
                  <p className="selected-file-name">
                    Selected: {resumeFile.name}
                  </p>
                ) : null}

                <label className="application-field">
                  <span>Cover Letter (optional)</span>
                  <textarea
                    rows="5"
                    placeholder="Tell the recruiter why you are a strong fit for this role"
                    value={coverLetter}
                    onChange={(event) => setCoverLetter(event.target.value)}
                  />
                </label>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={isApplying}
                >
                  {isApplying ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            ) : null}

            <div className="secondary-actions">
              <button
                className={`btn btn-outline ${isSaved ? "saved" : ""}`}
                onClick={async () => {
                  const result = await toggleWishlist(job);
                  if (result?.requiresAuth) {
                    onRequestLogin();
                  }
                }}
              >
                <i
                  className={`bx ${isSaved ? "bxs-bookmark" : "bx-bookmark"}`}
                ></i>{" "}
                Save
              </button>
              <button className="btn btn-outline">
                <i className="bx bx-share-alt"></i> Share
              </button>
            </div>
          </div>

          <div className="sidebar-divider"></div>

          <div className="sidebar-info-list">
            <div className="info-row">
              <span className="label">
                <i className="bx bx-group"></i> Applicants
              </span>
              <span className="value">{job.sidebarData.applicantsCount}</span>
            </div>
            <div className="info-row">
              <span className="label">
                <i className="bx bx-calendar-exclamation"></i> Deadline
              </span>
              <span className="value">{job.deadline}</span>
            </div>
            <div className="info-row">
              <span className="label">
                <i className="bx bx-bolt-circle"></i> Urgency
              </span>
              <span className="value urgency-badge">
                {job.sidebarData.urgency}
              </span>
            </div>
          </div>

          <div className="sidebar-recruiter">
            <p className="recruiter-label">Hiring Manager</p>
            <div className="recruiter-profile">
              <img
                src={job.sidebarData.recruiter.image}
                alt={job.sidebarData.recruiter.name}
              />
              <div className="recruiter-details">
                <p className="name">{job.sidebarData.recruiter.name}</p>
                <p className="role">{job.sidebarData.recruiter.role}</p>
              </div>
            </div>
            <button className="btn btn-text">Message Recruiter</button>
          </div>
          <button className="btn-report">
            <i className="bx bx-flag"></i> Report this job
          </button>
        </div>
      </aside>
    </div>
  );
};

export default JobDetailsContent;
