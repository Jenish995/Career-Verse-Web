import React from 'react'
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import logo from '../assets/Logo.png';
import './Forgotpassword.css'

const Forgotpassword = () => {
  return (
    <div className="home-page-wrapper">
      <Navbar />
      <div className='auth-container'>
        <form className='auth-form'>
          <div className='Logo'>
            <img src={logo} alt='Career Verse Logo' />
          </div>

          <h2>Forgot Password?</h2>
          <p className="subtitle">Enter your email address and we'll send you a link to reset your password.</p>

          <div className='wrapper'>
            <input type='email' placeholder='Email' required />
            <i className='bx bx-envelope'></i>
          </div>

          <button type='submit' className='btn btn-primary auth-btn'>Reset Password</button>

          <div className="auth-footer">
            <Link to="/login">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Forgotpassword
