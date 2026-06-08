import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';

const JobCard = ({ id, logo, title, company, location, salary, experience, postingDate, type, tags, companyInitials }) => {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isSaved = isInWishlist(id);

  return (
    <div className="job-card browse-job-card">
      <div className="company-info">
        {logo ? (
          <img src={logo} alt={`${company} Logo`} className="company-logo" />
        ) : (
          <div className="company-logo-placeholder">{companyInitials || company.charAt(0)}</div>
        )}
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
        {experience && <span className="experience"><i className="bx bx-briefcase"></i> {experience}</span>}
        {type && <span className="job-type"><i className="bx bx-time-five"></i> {type}</span>}
      </div>
      
      {tags && tags.length > 0 && (
        <div className="job-tags">
          {tags.map(tag => <span key={tag} className="job-tag">{tag}</span>)}
        </div>
      )}

      {postingDate && <p className="posting-date"><i className='bx bx-history'></i> {postingDate}</p>}
      
      <div className="job-actions">
        <button className="btn btn-primary">Apply Now</button>
        <button 
          className="btn btn-outline-primary" 
          onClick={() => navigate(`/job/${id}`)}
        >
          Details
        </button>
        <button 
          className={`btn-icon-only ${isSaved ? 'saved' : ''}`}
          onClick={() => toggleWishlist({ id, logo, title, company, location, salary, experience, postingDate, type, tags, companyInitials })}
        >
          <i className={`bx ${isSaved ? 'bxs-bookmark' : 'bx-bookmark'}`}></i>
        </button>
      </div>
    </div>
  );
};

export default JobCard;