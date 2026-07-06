import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useNotifications } from "../context/useNotifications";
import { getNotifications } from "../services/notifications";
import "./Notifications.css";

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const NotificationCard = ({ notif }) => (
  <Link
    to={notif.job_id ? `/job/${notif.job_id}` : "/browse"}
    className={`notif-card ${notif.is_read ? "notif-card--read" : "notif-card--unread"}`}
    aria-label={notif.title}
  >
    <div className="notif-card__logo-wrap">
      {notif.logo_url ? (
        <img src={notif.logo_url} alt={notif.company_name || "Company"} className="notif-card__logo" />
      ) : (
        <div className="notif-card__logo-placeholder">
          <i className="bx bx-briefcase"></i>
        </div>
      )}
      {!notif.is_read && <span className="notif-card__unread-dot" />}
    </div>

    <div className="notif-card__body">
      <p className="notif-card__title">{notif.title}</p>
      <p className="notif-card__message">{notif.message}</p>
      {notif.company_name && (
        <p className="notif-card__meta">
          <i className="bx bx-building-house"></i> {notif.company_name}
          {notif.job_title && <> &middot; {notif.job_title}</>}
        </p>
      )}
    </div>

    <div className="notif-card__time">
      <i className="bx bx-time-five"></i>
      {timeAgo(notif.created_at)}
    </div>
  </Link>
);

const Notifications = () => {
  const { markAllRead, unreadCount } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const data = await getNotifications(user.id);
        setNotifications(data.notifications || []);
      } catch (err) {
        setError(err.message || "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    load();

    // Mark all as read as soon as the page is opened
    markAllRead();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const unread = notifications.filter((n) => !n.is_read);
  const read = notifications.filter((n) => n.is_read);

  return (
    <div className="notif-page">
      <Navbar />

      <main className="notif-main">
        <div className="notif-container">
          {/* Header */}
          <div className="notif-header">
            <div className="notif-header__left">
              <div className="notif-header__icon">
                <i className="bx bx-bell"></i>
              </div>
              <div>
                <h1 className="notif-header__title">Notifications</h1>
                <p className="notif-header__subtitle">
                  {loading
                    ? "Loading…"
                    : notifications.length === 0
                    ? "You're all caught up!"
                    : `${notifications.length} notification${notifications.length !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <span className="notif-header__badge">{unreadCount} new</span>
            )}
          </div>

          {/* Not logged in */}
          {!user && (
            <div className="notif-empty">
              <i className="bx bx-lock-alt notif-empty__icon"></i>
              <p className="notif-empty__title">You're not signed in</p>
              <p className="notif-empty__sub">
                <Link to="/login" className="notif-empty__link">Log in</Link> to see your notifications.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="notif-error">
              <i className="bx bx-error-circle"></i> {error}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && user && (
            <div className="notif-skeleton-list">
              {[1, 2, 3].map((i) => (
                <div key={i} className="notif-skeleton" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && user && notifications.length === 0 && (
            <div className="notif-empty">
              <i className="bx bx-bell-off notif-empty__icon"></i>
              <p className="notif-empty__title">No notifications yet</p>
              <p className="notif-empty__sub">
                When recruiters post new jobs you'll see them here.
              </p>
              <Link to="/browse" className="notif-empty__cta">Browse Jobs</Link>
            </div>
          )}

          {/* Unread section */}
          {!loading && unread.length > 0 && (
            <section className="notif-section">
              <h2 className="notif-section__label">
                <span className="notif-section__dot notif-section__dot--new"></span>
                New
                <span className="notif-section__count">{unread.length}</span>
              </h2>
              <div className="notif-list">
                {unread.map((n) => (
                  <NotificationCard key={n.id} notif={n} />
                ))}
              </div>
            </section>
          )}

          {/* Read section */}
          {!loading && read.length > 0 && (
            <section className="notif-section">
              <h2 className="notif-section__label">
                <span className="notif-section__dot"></span>
                Earlier
              </h2>
              <div className="notif-list">
                {read.map((n) => (
                  <NotificationCard key={n.id} notif={n} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;
