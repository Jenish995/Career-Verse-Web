import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import Navbar from '../components/Navbar';

import logo from '../assets/Logo.png';
import './Registration.css'; 

const Login = () => {
  const [showPassword, setShowPassword] = useState(true);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="home-page-wrapper">
      <Navbar />
      <div className="auth-container">
        <form className='auth-form'>
          <div className="Logo">
            <img src={logo} alt="Career Verse Logo" />
          </div>

          <h2>Welcome Back</h2>
          <p className="subtitle">Login to your account</p>

          <div className='wrapper'>
              <input type='email' placeholder='Email' required></input>
              <i className='bx bx-envelope'></i>
          </div>
          <div className='wrapper'>
              <input 
                type={showPassword ? 'password' : 'text'} 
                placeholder='Password' 
                required 
              />
              <i 
                className={showPassword ? 'bx bx-hide' : 'bx bx-show'} 
                onClick={togglePassword}
              ></i>
          </div>

          <button type="submit" className="btn btn-primary auth-btn">Login</button>
          
          <div className="auth-footer">
            <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;