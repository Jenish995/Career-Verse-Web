import React, { useState, useEffect } from 'react'
import "./Navbar.css"
import { useTheme } from '../context/ThemeContext.jsx'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const { theme, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const themeIcon = theme === 'dark' ? 'bx-sun' : 'bx-moon'
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <div>
      <header>
        <nav className='nav-bar'>
            <div className='nav-div'>
                <div className={`nav-overlay ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}></div>

                <div className='logo' ><Link to='/'>Career Verse</Link></div>

                <div className='search-bar'>
                  <i className='bx bx-search'></i>
                  <input type='search' placeholder='Search jobs, companies, skills' aria-label='Search' />
                </div>

                <button className='menu-toggle' onClick={toggleMenu} aria-label='Toggle menu'>
                  <i className={`bx ${isMenuOpen ? 'bx-x' : 'bx-menu'}`}></i>
                </button>

               <ul className={`left-elements ${isMenuOpen ? 'active' : ''}`}>
                    <li><Link to='/' onClick={() => setIsMenuOpen(false)}><i className='bx bx-home'></i><span>Home</span></Link></li>
                    <li><Link to='/browse' onClick={() => setIsMenuOpen(false)}><i className='bx bx-briefcase'></i><span>Browse Jobs</span></Link></li>
                    <li><Link to='/notifications' onClick={() => setIsMenuOpen(false)}><i className='bx bx-bell'></i><span>Notifications</span></Link></li>
                    <li><Link to='/saved' onClick={() => setIsMenuOpen(false)}><i className='bx bx-bookmark'></i><span>Saved Jobs</span></Link></li>
                    <li className='theme-item'>
                      <button type='button' className='theme-toggle' onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                        <i className={`bx ${themeIcon}`}></i>
                      </button>
                    </li>
                    <li><Link to='/profile' onClick={() => setIsMenuOpen(false)}><i className='bx bx-user-circle'></i><span>Profile</span></Link></li>
               </ul>
                    
            </div>
        </nav>
      </header>
    </div>
  )
}

export default Navbar
