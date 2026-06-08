import React from 'react';
import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';
import { useWishlist } from '../context/WishlistContext';
import './Home.css'; // Reuse home grid styles

const SavedJobs = () => {
  const { wishlist } = useWishlist();

  return (
    <div className="saved-jobs-page">
      <Navbar />
      <main className="home-content container">
        <section className="featured-jobs-section" style={{ marginTop: '40px' }}>
          <h2 style={{ textAlign: 'left', marginBottom: '10px' }}>Saved Jobs</h2>
          <p style={{ marginBottom: '30px' }}>You have {wishlist.length} jobs saved in your wishlist.</p>
          
          <div className="job-grid">
            {wishlist.length > 0 ? (
              wishlist.map((job) => (
                <JobCard key={job.id} {...job} />
              ))
            ) : (
              <div className="no-results" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0' }}>
                <i className='bx bx-bookmark' style={{ fontSize: '4rem', color: 'var(--text-color-light)' }}></i>
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