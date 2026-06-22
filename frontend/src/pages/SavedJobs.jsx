import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';
import { useWishlist } from '../context/useWishlist';
import './Home.css';
import './BrowseJobs.css';
import './SavedJobs.css';

const SavedJobs = () => {
  const { wishlist } = useWishlist();

  return (
    <div className="saved-jobs-page">
      <Navbar />
      <main className="home-content container">
        <section className="saved-jobs-section">
          <h2>Saved Jobs</h2>
          <p>You have {wishlist.length} jobs saved in your wishlist.</p>
          
          <div className="job-grid">
            {wishlist.length > 0 ? (
              wishlist.map((job) => (
                <JobCard key={job.id} {...job} />
              ))
            ) : (
              <div className="no-results saved-jobs-empty">
                <i className='bx bx-bookmark'></i>
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
