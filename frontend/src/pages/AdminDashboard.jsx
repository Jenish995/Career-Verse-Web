import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Profile.css';

const AdminDashboard = () => {
  const user = useMemo(() => {
    const rawUser = localStorage.getItem('user');
    return rawUser ? JSON.parse(rawUser) : null;
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="profile-page-wrapper">
      <Navbar />
      <main className="profile-main container">
        <section className="profile-header-card">
          <div className="profile-banner"></div>
          <div className="profile-header-content">
            <div className="profile-title-info">
              <h1>Admin Dashboard</h1>
              <p className="profile-role">Manage Career Verse platform operations</p>
            </div>
          </div>
        </section>

        <div className="profile-grid">
          <div className="profile-content-left">
            <section className="profile-section-card">
              <h3>Welcome</h3>
              <p className="text-content">
                You are logged in as <strong>{user.email}</strong> with the <strong>admin</strong> role.
              </p>
              <p className="text-content">
                This page is ready for your admin features like managing users, recruiter approvals,
                jobs, reports, and analytics.
              </p>
            </section>
          </div>

          <aside className="profile-sidebar">
            <section className="profile-section-card">
              <h3>Admin Info</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <i className="bx bx-envelope"></i>
                  <span>{user.email}</span>
                </div>
                <div className="contact-item">
                  <i className="bx bx-shield-quarter"></i>
                  <span>{user.role}</span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
