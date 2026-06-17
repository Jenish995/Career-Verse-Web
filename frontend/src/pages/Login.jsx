import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import logo from "../assets/Logo.png";
import { loginUser, persistAuthSession } from "../services/auth";
import "./Registration.css";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const data = await loginUser(formData);
      persistAuthSession(data);
      setSuccess("Login successful");

      setTimeout(() => {
        if (data.user.role === "admin") {
          navigate("/admin");
        } else if (data.user.role === "recruiter") {
          navigate("/recruiter-profile");
        } else {
          navigate("/profile");
        }
      }, 700);
    } catch {
      setError("Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="home-page-wrapper">
      <Navbar />
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="Logo">
            <img src={logo} alt="Career Verse Logo" />
          </div>

          <h2>Welcome Back</h2>
          <p className="subtitle">Login to your account</p>

          {error ? <p className="auth-message auth-error">{error}</p> : null}
          {success ? (
            <p className="auth-message auth-success">{success}</p>
          ) : null}

          <div className="wrapper">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <i className="bx bx-envelope"></i>
          </div>
          <div className="wrapper">
            <input
              type={showPassword ? "password" : "text"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <i
              className={showPassword ? "bx bx-hide" : "bx bx-show"}
              onClick={togglePassword}
            ></i>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          <div className="auth-footer">
            <p>
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
