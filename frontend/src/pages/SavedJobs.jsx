import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import JobCard from "../components/JobCard";
import { useWishlist } from "../context/useWishlist";
import { getCandidateApplications } from "../services/applications";
import "./Home.css";
import "./BrowseJobs.css";
import "./SavedJobs.css";

const SavedJobs = () => {
  const { wishlist, isLoading, error, currentUser } = useWishlist();
  const [appliedJobIds, setAppliedJobIds] = useState([]);

  useEffect(() => {
    const loadApplications = async () => {
      if (currentUser?.role !== "candidate") {
        setAppliedJobIds([]);
        return;
      }

      try {
        const data = await getCandidateApplications(currentUser.id);
        setAppliedJobIds(
          (data.applications || []).map((application) => application.job_id),
        );
      } catch {
        setAppliedJobIds([]);
      }
    };

    loadApplications();
  }, [currentUser]);

  return (
    <div className="saved-jobs-page">
      <Navbar />
      <main className="home-content container">
        <section className="saved-jobs-section">
          <h2>Saved Jobs</h2>
          <p>You have {wishlist.length} jobs saved in your wishlist.</p>

          <div className="job-grid">
            {!currentUser ? (
              <div className="no-results saved-jobs-empty">
                <i className="bx bx-log-in-circle"></i>
                <h3>Login to view saved jobs</h3>
                <p>Your saved jobs are now stored in your database account.</p>
              </div>
            ) : isLoading ? (
              <div className="no-results saved-jobs-empty">
                <i className="bx bx-loader-circle"></i>
                <h3>Loading saved jobs...</h3>
              </div>
            ) : error ? (
              <div className="no-results saved-jobs-empty">
                <i className="bx bx-error-circle"></i>
                <h3>{error}</h3>
              </div>
            ) : wishlist.length > 0 ? (
              wishlist.map((job) => (
                <JobCard
                  key={job.id}
                  {...job}
                  isApplied={appliedJobIds.includes(job.id)}
                />
              ))
            ) : (
              <div className="no-results saved-jobs-empty">
                <i className="bx bx-bookmark"></i>
                <h3>Your wishlist is empty</h3>
                <p>Browse jobs and save them to see them here later!</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default SavedJobs;
