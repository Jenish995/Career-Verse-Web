import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import logo from '../assets/Logo.png';
import './Otp.css';

const Otp = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);

  // Focus the first input box on component mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (value, index) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    // Ensure only the last character entered is kept
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move focus to the next input if a digit was entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Move focus back on backspace if current field is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const data = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(data)) return; // Only allow numeric pastes

    const pasteData = data.slice(0, 6).split('');
    const newOtp = [...otp];
    
    pasteData.forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    
    setOtp(newOtp);
    inputRefs.current[Math.min(pasteData.length - 1, 5)].focus();
  };

  return (
    <div className="home-page-wrapper">
      <Navbar />
      <div className="auth-container">
        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <div className="Logo">
            <img src={logo} alt="Career Verse Logo" />
          </div>

          <h2>OTP Verification</h2>
          <p className="subtitle">Enter the 6-digit code we sent to your email to verify your identity.</p>

          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
              />
            ))}
          </div>

          <button type="submit" className="btn btn-primary auth-btn">Verify</button>

          <div className="otp-footer-text">
            <p>Didn't receive the code? <Link to="#">Resend</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Otp;