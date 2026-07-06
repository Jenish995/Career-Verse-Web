import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/useWishlist";

const JobCard = ({
  id,
  logo,
  title,
  company,
  location,
  salary,
  experience,
  postingDate,
  type,
  tags,
  companyInitials,
  isApplied = false,
}) => {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isSaved = isInWishlist(id);
  const companyName = company || "Unknown company";
  const displayTitle = title || "Untitled role";
  const displayLocation = location || "Location not listed";
  const displayTags = Array.isArray(tags) ? tags : [];

  return (
    <div className="job-card browse-job-card">
      <div className="company-info">
        {logo ? (
          <img
            src={logo}
            alt={`${companyName} Logo`}
            className="company-logo"
          />
        ) : (
          <div className="company-logo-placeholder">
            {companyInitials || companyName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="job-details">
          <h3>{displayTitle}</h3>
          <p className="company-name">{companyName}</p>
          <p className="location">
            <i className="bx bx-map"></i> {displayLocation}
          </p>
        </div>
      </div>
      <div className="job-meta">
        <span className="salary">
          <i className="bx bx-dollar"></i> {salary}
        </span>
        {experience && (
          <span className="experience">
            <i className="bx bx-briefcase"></i> {experience}
          </span>
        )}
        {type && (
          <span className="job-type">
            <i className="bx bx-time-five"></i> {type}
          </span>
        )}
      </div>

      {displayTags.length > 0 && (
        <div className="job-tags">
          {displayTags.map((tag) => (
            <span key={tag} className="job-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {postingDate && (
        <p className="posting-date">
          <i className="bx bx-history"></i> {postingDate}
        </p>
      )}

      <div className="job-actions">
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/job/${id}`)}
          disabled={isApplied}
        >
          {isApplied ? "Applied" : "Apply Now"}
        </button>
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate(`/job/${id}`)}
        >
          Details
        </button>
        <button
          className={`btn-icon-only ${isSaved ? "saved" : ""}`}
          onClick={async () => {
            const result = await toggleWishlist({
              id,
              logo,
              title: displayTitle,
              company: companyName,
              location: displayLocation,
              salary,
              experience,
              postingDate,
              type,
              tags: displayTags,
              companyInitials,
            });

            if (result?.requiresAuth) {
              navigate("/login");
            }
          }}
          aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
        >
          <i className={`bx ${isSaved ? "bxs-bookmark" : "bx-bookmark"}`}></i>
        </button>
      </div>
    </div>
  );
};

export default JobCard;
