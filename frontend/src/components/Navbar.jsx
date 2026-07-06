import { useEffect, useState } from "react";
import "./Navbar.css";
import { useTheme } from "../context/ThemeContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import { clearAuthSession } from "../services/auth";
import { useWishlist } from "../context/useWishlist";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;

  const themeIcon = theme === "dark" ? "bx-sun" : "bx-moon";
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const profileRoute =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "recruiter"
        ? "/recruiter-profile"
        : "/profile";

  const profileLabel =
    user?.role === "admin"
      ? "Admin"
      : user?.role === "recruiter"
        ? "Recruiter"
        : "Profile";

  const handleLogout = () => {
    clearAuthSession();
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <div>
      <header>
        <nav className="nav-bar">
          <div className="nav-div">
            <div
              className={`nav-overlay ${isMenuOpen ? "active" : ""}`}
              onClick={() => setIsMenuOpen(false)}
            ></div>

            <div className="logo">
              <Link to="/">Career Verse</Link>
            </div>

            <div className="search-bar">
              <i className="bx bx-search"></i>
              <input
                type="search"
                placeholder="Search jobs, companies, skills"
                aria-label="Search"
              />
            </div>

            <button
              className="menu-toggle"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <i className={`bx ${isMenuOpen ? "bx-x" : "bx-menu"}`}></i>
            </button>

            <ul className={`left-elements ${isMenuOpen ? "active" : ""}`}>
              <li>
                <Link to="/" onClick={() => setIsMenuOpen(false)}>
                  <i className="bx bx-home"></i>
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/browse" onClick={() => setIsMenuOpen(false)}>
                  <i className="bx bx-briefcase"></i>
                  <span>Browse Jobs</span>
                </Link>
              </li>
              {user?.role === "recruiter" ? (
                <>
                  <li>
                    <Link to="/recruiter/jobs" onClick={() => setIsMenuOpen(false)}>
                      <i className="bx bx-list-ul"></i>
                      <span>My Jobs</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/post-job" onClick={() => setIsMenuOpen(false)}>
                      <i className="bx bx-plus-circle"></i>
                      <span>Post Job</span>
                    </Link>
                  </li>
                </>
              ) : null}
              <li>
                <Link to="/notifications" onClick={() => setIsMenuOpen(false)}>
                  <i className="bx bx-bell"></i>
                  <span>Notifications</span>
                </Link>
              </li>
              <li>
                <Link to="/saved" onClick={() => setIsMenuOpen(false)}>
                  <i className="bx bx-bookmark"></i>
                  <span>Saved Jobs{wishlist.length > 0 ? ` (${wishlist.length})` : ""}</span>
                </Link>
              </li>
              <li className="theme-item">
                <button
                  type="button"
                  className="theme-toggle"
                  onClick={toggleTheme}
                  aria-label={
                    theme === "dark"
                      ? "Switch to light mode"
                      : "Switch to dark mode"
                  }
                >
                  <i className={`bx ${themeIcon}`}></i>
                </button>
              </li>

              {user ? (
                <li
                  className={`profile-menu ${isProfileMenuOpen ? "open" : ""}`}
                  onMouseEnter={() => setIsProfileMenuOpen(true)}
                  onMouseLeave={() => setIsProfileMenuOpen(false)}
                >
                  <button
                    type="button"
                    className="profile-trigger"
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    aria-label="Open account menu"
                    aria-expanded={isProfileMenuOpen}
                  >
                    <i className="bx bx-user-circle"></i>
                    <span className="profile-trigger-label">Account</span>
                  </button>
                  <div className="profile-dropdown">
                    <Link
                      to={profileRoute}
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      <i className="bx bx-user"></i>
                      <span>{profileLabel}</span>
                    </Link>
                    <button
                      type="button"
                      className="logout-button"
                      onClick={handleLogout}
                    >
                      <i className="bx bx-log-out"></i>
                      <span>Logout</span>
                    </button>
                  </div>
                </li>
              ) : (
                <>
                  <li>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <i className="bx bx-log-in"></i>
                      <span>Login</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                      <i className="bx bx-user-plus"></i>
                      <span>Sign Up</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default Navbar;
