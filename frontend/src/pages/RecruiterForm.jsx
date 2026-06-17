import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";
import { persistAuthSession, registerUser } from "../services/auth";
import "./Registration.css";

const RecruiterForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    recruiterName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyLocation: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

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
        email: formData.email,
        password: formData.password,
        role: "recruiter",
        companyName: formData.companyName,
        companyLocation: formData.companyLocation,
        fullName: formData.recruiterName,
      });

      persistAuthSession(data);
      setSuccess("Registration successful");
      setTimeout(() => navigate("/recruiter-profile"), 700);
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
        <h2>Recruiter Registration</h2>
        <p className="subtitle">
          Join Career Verse to find top talent for your company.
        </p>

        {error ? <p className="auth-message auth-error">{error}</p> : null}
        {success ? (
          <p className="auth-message auth-success">{success}</p>
        ) : null}

        <form onSubmit={handleSubmit}>
          <div className="wrapper">
            <input
              type="text"
              name="companyName"
              placeholder="Company Name *"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
            <i className="bx bxs-business"></i>
          </div>

          <div className="wrapper">
            <input
              type="text"
              name="recruiterName"
              placeholder="Recruiter Name *"
              value={formData.recruiterName}
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
              onClick={togglePassword}
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
              onClick={toggleConfirmPassword}
            ></i>
          </div>

          <div className="wrapper">
            <input
              type="text"
              name="companyLocation"
              placeholder="Company Location *"
              value={formData.companyLocation}
              onChange={handleChange}
              required
            />
            <i className="bx bxs-map"></i>
          </div>

          <button type="submit" className="auth-btn" disabled={isSubmitting}>
            {isSubmitting
              ? "Creating recruiter account..."
              : "Register as Recruiter"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Registering as a candidate?{" "}
            <Link to="/signup">Candidate Signup</Link>
          </p>
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecruiterForm;
