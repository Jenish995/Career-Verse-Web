import { useWishlist } from '../context/useWishlist';

const JobDetailsContent = ({ job }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isSaved = isInWishlist(job.id);

  return (
    <div className="job-details-grid">
      {/* Left Column: Main Content */}
      <div className="job-content-left">
        {/* Header Section */}
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

        {/* Description & Responsibilities */}
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

        {/* Skills & Education */}
        <section className="job-card-section">
          <h2 className="section-title">Skills & Qualifications</h2>
          <div className="skill-tags">
            {job.skills.map(skill => (
              <span key={skill} className="skill-badge">{skill}</span>
            ))}
          </div>
          <div className="education-box">
            <h4>Education</h4>
            <p>{job.education}</p>
          </div>
        </section>

        {/* Benefits */}
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

        {/* Hiring Process */}
        <section className="job-card-section">
          <h2 className="section-title">Application Process</h2>
          <div className="hiring-stepper">
            {job.hiringStages.map((stage, index) => (
              <div key={index} className={`step ${index <= job.currentStage ? 'active' : ''}`}>
                <div className="step-circle">{index + 1}</div>
                <span className="step-label">{stage}</span>
                {index < job.hiringStages.length - 1 && <div className="step-line"></div>}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Right Column: Sticky Sidebar */}
      <aside className="job-sidebar-right">
        <div className="sidebar-sticky-card">
          <div className="action-buttons">
            <button className="btn btn-primary btn-block">Apply Now</button>
            <div className="secondary-actions">
              <button 
                className={`btn btn-outline ${isSaved ? 'saved' : ''}`}
                onClick={() => toggleWishlist(job)}
              >
                <i className={`bx ${isSaved ? 'bxs-bookmark' : 'bx-bookmark'}`}></i> Save
              </button>
              <button className="btn btn-outline"><i className='bx bx-share-alt'></i> Share</button>
            </div>
          </div>

          <div className="sidebar-divider"></div>

          <div className="sidebar-info-list">
            <div className="info-row">
              <span className="label"><i className='bx bx-group'></i> Applicants</span>
              <span className="value">{job.sidebarData.applicantsCount}</span>
            </div>
            <div className="info-row">
              <span className="label"><i className='bx bx-calendar-exclamation'></i> Deadline</span>
              <span className="value">{job.deadline}</span>
            </div>
            <div className="info-row">
              <span className="label"><i className='bx bx-bolt-circle'></i> Urgency</span>
              <span className="value urgency-badge">{job.sidebarData.urgency}</span>
            </div>
          </div>

          <div className="sidebar-recruiter">
            <p className="recruiter-label">Hiring Manager</p>
            <div className="recruiter-profile">
              <img src={job.sidebarData.recruiter.image} alt={job.sidebarData.recruiter.name} />
              <div className="recruiter-details">
                <p className="name">{job.sidebarData.recruiter.name}</p>
                <p className="role">{job.sidebarData.recruiter.role}</p>
              </div>
            </div>
            <button className="btn btn-text">Message Recruiter</button>
          </div>
          <button className="btn-report"><i className='bx bx-flag'></i> Report this job</button>
        </div>
      </aside>
    </div>
  );
};

export default JobDetailsContent;
