import React from 'react';

export const CategoryCard = ({ icon, label }) => (
  <div className="category-card">
    <i className={`bx ${icon}`}></i>
    <p>{label}</p>
  </div>
);

export const FeatureCard = ({ icon, title, description }) => (
  <div className="feature-card">
    <i className={`bx ${icon}`}></i>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

export const CompanyCard = ({ logo, name, positions }) => (
  <div className="company-card">
    <img src={logo} alt={`${name} Logo`} className="company-logo" />
    <h3>{name}</h3>
    <p>{positions} Open Positions</p>
    <button className="btn btn-outline">View Jobs</button>
  </div>
);

export const TimelineItem = ({ icon, title, description }) => (
  <div className="timeline-item">
    <div className="timeline-icon"><i className={`bx ${icon}`}></i></div>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

export const ResourceCard = ({ icon, title, description }) => (
  <div className="resource-card">
    <i className={`bx ${icon}`}></i>
    <h3>{title}</h3>
    <p>{description}</p>
    <a href="#" className="read-more">Read More <i className="bx bx-right-arrow-alt"></i></a>
  </div>
);

export const TestimonialCard = ({ image, name, role, rating, quote }) => {
  const renderStars = (num) => {
    return [...Array(5)].map((_, i) => (
      <i key={i} className={`bx ${i < Math.floor(num) ? 'bxs-star' : (i < num ? 'bxs-star-half' : 'bx-star')}`}></i>
    ));
  };

  return (
    <div className="testimonial-card">
      <div className="testimonial-header">
        <img src={image} alt={name} className="profile-pic" />
        <div>
          <h4>{name}</h4>
          <p>{role}</p>
        </div>
      </div>
      <div className="stars">{renderStars(rating)}</div>
      <p className="quote">"{quote}"</p>
    </div>
  );
};