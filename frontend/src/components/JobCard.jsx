import React from 'react';

const JobCard = ({ logo, title, company, location, salary, experience, postingDate }) => {
  return (
    <div className="job-card">
      <div className="company-info">
        <img src={logo} alt={`${company} Logo`} className="company-logo" />
        <div className="job-details">
          <h3>{title}</h3>
          <p className="company-name">{company}</p>
          <p className="location">
            <i className="bx bx-map"></i> {location}
          </p>
        </div>
      </div>
      <div className="job-meta">
        <span className="salary"><i className="bx bx-dollar"></i> {salary}</span>
        <span className="experience"><i className="bx bx-briefcase"></i> {experience}</span>
      </div>
      {postingDate && <p className="posting-date">{postingDate}</p>}
      <div className="job-actions">
        <button className="btn btn-apply">Apply Now</button>
        <button className="btn btn-save"><i className="bx bx-bookmark"></i></button>
      </div>
    </div>
  );
};

export default JobCard;