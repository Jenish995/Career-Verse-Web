import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/Logo.png';
import { forgotPassword, verifyOtp, resetPassword } from '../services/auth';
import './Forgotpassword.css';

const Forgotpassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email request, 2: 6-digit OTP verification, 3: Reset password
  const [email, setEmail] = useState('');
  
  // State for split OTP digits (6 individual input boxes)
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));
  const [verifiedOtp, setVerifiedOtp] = useState('');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for the 6 input elements to control autofocus/focus transitions
  const inputRefs = useRef([]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    console.log("=> handleRequestOtp CLICKED! Email:", email);
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      console.log("Calling forgotPassword API...");
      const data = await forgotPassword(email);
      console.log("API Success:", data);
      setSuccess(data.message || 'OTP sent to your email.');
      setOtpDigits(Array(6).fill(''));
      setStep(2);
      
      // Delay focus slightly to ensure the DOM is rendered
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const autoVerifyOtp = async (otpValue) => {
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const data = await verifyOtp(email, otpValue);
      setSuccess('OTP verified successfully!');
      setVerifiedOtp(otpValue);
      setTimeout(() => {
        setStep(3);
        setSuccess('');
      }, 800);
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code.');
      setOtpDigits(Array(6).fill(''));
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 50);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = async (index, value) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const newOtp = [...otpDigits];
      newOtp[index] = '';
      setOtpDigits(newOtp);
      return;
    }

    const digit = cleaned.slice(-1);
    const newOtp = [...otpDigits];
    newOtp[index] = digit;
    setOtpDigits(newOtp);

    const fullOtp = newOtp.join('');
    if (fullOtp.length === 6) {
      await autoVerifyOtp(fullOtp);
    } else if (index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otpDigits[index] === '' && index > 0) {
        const newOtp = [...otpDigits];
        newOtp[index - 1] = '';
        setOtpDigits(newOtp);
        inputRefs.current[index - 1].focus();
      } else {
        const newOtp = [...otpDigits];
        newOtp[index] = '';
        setOtpDigits(newOtp);
      }
    }
  };

  const handleOtpPaste = async (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtpDigits(newOtp);
      await autoVerifyOtp(pastedData);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await resetPassword(email, verifiedOtp, password);
      setSuccess(data.message || 'Password reset successful!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await forgotPassword(email);
      setSuccess('A new OTP has been sent to your email.');
      setOtpDigits(Array(6).fill(''));
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 50);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="home-page-wrapper">
      <div className="auth-container">
        {step === 1 && (
          <div className="auth-form">
            <div className="Logo">
              <img src={logo} alt="Career Verse Logo" />
            </div>

            <h2>Forgot Password?</h2>
            <p className="subtitle">
              Enter your email address and we'll send you an OTP to reset your password.
            </p>

            {error && <p className="auth-message auth-error">{error}</p>}
            {success && <p className="auth-message auth-success">{success}</p>}

            <div className="wrapper">
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
              <i className="bx bx-envelope"></i>
            </div>

            <button
              type="button"
              onClick={handleRequestOtp}
              className="btn btn-primary auth-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
            </button>

            <div className="auth-footer">
              <Link to="/login">Back to Login</Link>
            </div>
          </div>
        )}

        {step === 2 && (
          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
            <div className="Logo">
              <img src={logo} alt="Career Verse Logo" />
            </div>

            <h2>Verify Code</h2>
            <p className="subtitle">
              We've sent a 6-digit OTP code to <strong>{email}</strong>. Enter it below.
            </p>

            {error && <p className="auth-message auth-error">{error}</p>}
            {success && <p className="auth-message auth-success">{success}</p>}

            <div className="otp-container">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  maxLength="1"
                  className="otp-input"
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  onPaste={handleOtpPaste}
                  disabled={isSubmitting}
                  required
                />
              ))}
            </div>

            <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              <p style={{ margin: 0 }}>
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isSubmitting}
                  className="link-btn"
                >
                  Resend OTP
                </button>
              </p>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError('');
                  setSuccess('');
                }}
                disabled={isSubmitting}
                className="link-btn"
              >
                Change Email
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form className="auth-form" onSubmit={handleResetPassword}>
            <div className="Logo">
              <img src={logo} alt="Career Verse Logo" />
            </div>

            <h2>Reset Password</h2>
            <p className="subtitle">
              Choose a strong, secure new password for your account.
            </p>

            {error && <p className="auth-message auth-error">{error}</p>}
            {success && <p className="auth-message auth-success">{success}</p>}

            <div className="wrapper">
              <input
                type={showPassword ? 'password' : 'text'}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <i
                className={showPassword ? 'bx bx-hide' : 'bx bx-show'}
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: 'pointer' }}
              ></i>
            </div>

            <div className="wrapper">
              <input
                type={showConfirmPassword ? 'password' : 'text'}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <i
                className={showConfirmPassword ? 'bx bx-hide' : 'bx bx-show'}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ cursor: 'pointer' }}
              ></i>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Forgotpassword;
