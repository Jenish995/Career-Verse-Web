import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { changePassword } from "../services/auth";
import "./Forgotpassword.css";

const ChangePassword = () => {
  const navigate = useNavigate();

  const storedUser = useMemo(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  }, []);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    newPwd: false,
    confirm: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!storedUser) {
    navigate("/login");
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const toggleShow = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (formData.newPassword === formData.currentPassword) {
      setError("New password must be different from the current password.");
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(storedUser.id, formData.currentPassword, formData.newPassword);
      setSuccess("Password changed successfully! You can now log in with your new password.");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.message || "Failed to change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <h2>Change Password</h2>
          <p className="subtitle">
            Update your account password. You&apos;ll need your current password to confirm.
          </p>

          {error && (
            <div className="auth-message auth-error" role="alert">
              <i className="bx bx-error-circle" style={{ marginRight: "6px" }} />
              {error}
            </div>
          )}
          {success && (
            <div className="auth-message auth-success" role="status">
              <i className="bx bx-check-circle" style={{ marginRight: "6px" }} />
              {success}
            </div>
          )}

          {/* Current Password */}
          <div className="wrapper">
            <input
              id="change-current-password"
              type={showPasswords.current ? "text" : "password"}
              name="currentPassword"
              placeholder="Current password"
              value={formData.currentPassword}
              onChange={handleChange}
              autoComplete="current-password"
              disabled={isLoading}
            />
            <i
              className={`bx ${showPasswords.current ? "bx-hide" : "bx-show"}`}
              style={{ cursor: "pointer" }}
              onClick={() => toggleShow("current")}
              role="button"
              aria-label={showPasswords.current ? "Hide password" : "Show password"}
            />
          </div>

          {/* New Password */}
          <div className="wrapper">
            <input
              id="change-new-password"
              type={showPasswords.newPwd ? "text" : "password"}
              name="newPassword"
              placeholder="New password (min. 6 characters)"
              value={formData.newPassword}
              onChange={handleChange}
              autoComplete="new-password"
              disabled={isLoading}
            />
            <i
              className={`bx ${showPasswords.newPwd ? "bx-hide" : "bx-show"}`}
              style={{ cursor: "pointer" }}
              onClick={() => toggleShow("newPwd")}
              role="button"
              aria-label={showPasswords.newPwd ? "Hide password" : "Show password"}
            />
          </div>

          {/* Confirm New Password */}
          <div className="wrapper">
            <input
              id="change-confirm-password"
              type={showPasswords.confirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              disabled={isLoading}
            />
            <i
              className={`bx ${showPasswords.confirm ? "bx-hide" : "bx-show"}`}
              style={{ cursor: "pointer" }}
              onClick={() => toggleShow("confirm")}
              role="button"
              aria-label={showPasswords.confirm ? "Hide password" : "Show password"}
            />
          </div>

          <button
            id="change-password-submit"
            type="submit"
            className="auth-btn"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>

          <div className="auth-footer">
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate(-1)}
            >
              ← Go back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
