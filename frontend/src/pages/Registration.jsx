import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import Navbar from '../components/Navbar';
import { useState } from 'react';
import logo from '../assets/Logo.png';

import './Registration.css'; 

const Registration = () => {

  const[showPassword, setShowPassword] = useState(true);
  const[showConfirmPassword, setShowConfirmPassword] = useState(true);


  const togglePassword = () => {
    setShowPassword(!showPassword);
  };


  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };


  return (
    <div className="home-page-wrapper">
      <Navbar />
      <div className="auth-container">
        <form className='auth-form'>
          <div className="Logo">
            <img src={logo} alt="Career Verse Logo" />
          </div>  
          <h2>Create Account</h2>
          <p className="subtitle">Join Career Verse to find your dream job</p>

          <div className='wrapper'>
              <input type='text' placeholder='FullName' required></input>
              <i className='bx bx-user'></i> 
          </div>
          <div className='wrapper'>
              <input type='date' placeholder='Date of Birth' required></input>
              <i className='bx bx-calendar'></i>
          </div>
          <div className='wrapper'>
              <input type='email' placeholder='Email' required></input>
              <i className='bx bx-envelope'></i>
          </div>
          <div className='wrapper'>
              <input type={showPassword ? 'password' : 'text'} placeholder='Password' required></input>
              <i className={showPassword ? 'bx bx-hide' : 'bx bx-show'} onClick={togglePassword}></i>
          </div>

          <div className='wrapper'>
              <input type={showConfirmPassword ? 'password' : 'text'} placeholder='Confirm Password' required></input>
              <i className={showConfirmPassword ? 'bx bx-hide' : 'bx bx-show'} onClick={toggleConfirmPassword}></i>
          </div>

          <button type="submit" className="btn btn-primary auth-btn" >Sign Up</button>
          
          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Login</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registration;
