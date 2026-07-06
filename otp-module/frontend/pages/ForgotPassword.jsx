/**
 * ForgotPassword Page — Complete 3-step password reset flow.
 *
 * Step 1: Enter email → request OTP
 * Step 2: Enter 6-digit OTP → auto-verify
 * Step 3: Enter new password → reset
 *
 * INTEGRATION:
 * - Update the import paths for OtpInput and otpApi
 * - Replace the logo import with your app's logo
 * - This page uses react-router-dom's useNavigate for redirect after success
 */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OtpInput from "../components/OtpInput";
import { forgotPassword, verifyOtp, resetPassword } from "../services/otpApi";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
  const [verifiedOtp, setVerifiedOtp] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Step 1: Request OTP ────────────────────────────
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const data = await forgotPassword(email);
      setSuccess(data.message || "OTP sent to your email.");
      setOtpDigits(Array(6).fill(""));
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 2: Auto-verify when all 6 digits entered ──
  const handleOtpComplete = async (otpValue) => {
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await verifyOtp(email, otpValue);
      setSuccess("OTP verified successfully!");
      setVerifiedOtp(otpValue);
      setTimeout(() => {
        setStep(3);
        setSuccess("");
      }, 800);
    } catch (err) {
      setError(err.message || "Verification failed. Please check the code.");
      setOtpDigits(Array(6).fill(""));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 3: Reset password ─────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await resetPassword(email, verifiedOtp, password);
      setSuccess(data.message || "Password reset successful!");
      setTimeout(() => {
        navigate("/login"); // ← UPDATE this to your login route
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────
  const handleResendOtp = async () => {
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await forgotPassword(email);
      setSuccess("A new OTP has been sent to your email.");
      setOtpDigits(Array(6).fill(""));
    } catch (err) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="otp-page-wrapper">
      <div className="otp-auth-container">
        {/* ── Step 1: Email Input ── */}
        {step === 1 && (
          <div className="otp-auth-form">
            <h2>Forgot Password?</h2>
            <p className="otp-subtitle">
              Enter your email address and we'll send you an OTP to reset your
              password.
            </p>

            {error && <p className="otp-message otp-error">{error}</p>}
            {success && <p className="otp-message otp-success">{success}</p>}

            <div className="otp-input-wrapper">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <button
              type="button"
              onClick={handleRequestOtp}
              className="otp-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending OTP..." : "Send OTP"}
            </button>

            <div className="otp-footer">
              <Link to="/login">Back to Login</Link>
            </div>
          </div>
        )}

        {/* ── Step 2: OTP Verification ── */}
        {step === 2 && (
          <form
            className="otp-auth-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <h2>Verify Code</h2>
            <p className="otp-subtitle">
              We've sent a 6-digit OTP code to <strong>{email}</strong>.
              Enter it below.
            </p>

            {error && <p className="otp-message otp-error">{error}</p>}
            {success && <p className="otp-message otp-success">{success}</p>}

            <OtpInput
              length={6}
              value={otpDigits}
              onChange={setOtpDigits}
              onComplete={handleOtpComplete}
              disabled={isSubmitting}
            />

            <div
              className="otp-footer"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <p style={{ margin: 0 }}>
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isSubmitting}
                  className="otp-link-btn"
                >
                  Resend OTP
                </button>
              </p>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError("");
                  setSuccess("");
                }}
                disabled={isSubmitting}
                className="otp-link-btn"
              >
                Change Email
              </button>
            </div>
          </form>
        )}

        {/* ── Step 3: New Password ── */}
        {step === 3 && (
          <form className="otp-auth-form" onSubmit={handleResetPassword}>
            <h2>Reset Password</h2>
            <p className="otp-subtitle">
              Choose a strong, secure new password for your account.
            </p>

            {error && <p className="otp-message otp-error">{error}</p>}
            {success && <p className="otp-message otp-success">{success}</p>}

            <div className="otp-input-wrapper">
              <input
                type={showPassword ? "password" : "text"}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <span
                className="otp-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁" : "👁‍🗨"}
              </span>
            </div>

            <div className="otp-input-wrapper">
              <input
                type={showConfirmPassword ? "password" : "text"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <span
                className="otp-toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "👁" : "👁‍🗨"}
              </span>
            </div>

            <button
              type="submit"
              className="otp-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
