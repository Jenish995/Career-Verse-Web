import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";
import { persistAuthSession, registerUser } from "../services/auth";
import "./Registration.css";

const Registration = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("candidate");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Authentication failed");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: "candidate",
      });

      persistAuthSession(data);
      setSuccess("Registration successful");
      setTimeout(() => navigate("/profile"), 700);
    } catch {
      setError("Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="Logo">
          <Link to="/">
            <img src={logo} alt="Career Verse Logo" />
          </Link>
        </div>
        <h2>Create Account</h2>
        <p className="subtitle">
          Join Career Verse to explore opportunities or find top talent.
        </p>

        <div className="role-selection">
          <div
            className={`role-option ${role === "candidate" ? "active" : ""}`}
            onClick={() => setRole("candidate")}
          >
            Candidate
          </div>
          <div
            className={`role-option ${role === "recruiter" ? "active" : ""}`}
            onClick={() => setRole("recruiter")}
          >
            Recruiter
          </div>
        </div>

        {error ? <p className="auth-message auth-error">{error}</p> : null}
        {success ? (
          <p className="auth-message auth-success">{success}</p>
        ) : null}

        {role === "candidate" ? (
          <form onSubmit={handleSubmit}>
            <div className="wrapper">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name *"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              <i className="bx bxs-user"></i>
            </div>
            <div className="wrapper">
              <input
                type="email"
                name="email"
                placeholder="Email *"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <i className="bx bxs-envelope"></i>
            </div>
            <div className="wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password *"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <i
                className={showPassword ? "bx bx-show" : "bx bx-hide"}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>
            <div className="wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password *"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <i
                className={showConfirmPassword ? "bx bx-show" : "bx bx-hide"}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              ></i>
            </div>
            <button type="submit" className="auth-btn" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Sign Up as Candidate"}
            </button>
          </form>
        ) : (
          <div style={{ padding: "20px 0" }}>
            <p
              style={{ color: "var(--text-color-light)", marginBottom: "25px" }}
            >
              Looking to hire? Register your company to start posting jobs.
            </p>
            <Link
              to="/recruiter-signup"
              className="auth-btn"
              style={{
                display: "flex",
                textDecoration: "none",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Register as Recruiter
            </Link>
          </div>
        )}

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registration;
