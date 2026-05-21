import React from 'react'
import "./Navbar.css"
import { useTheme } from '../context/ThemeContext.jsx'

const Navbar = () => {
  const { theme, toggleTheme } = useTheme()
  const themeIcon = theme === 'dark' ? 'bx-sun' : 'bx-moon'

  return (
    <div>
      <header>
        <nav className='nav-bar'>
            <div className='nav-div'>

                <div className='logo' ><a href='#'>Career Verse</a></div>

               <ul className='left-elements'>
                    <li><a href='#'><i className='bx bx-home'></i><span>Home</span></a></li>
                    <li><a href='#'><i className='bx bx-briefcase'></i><span>Browse Jobs</span></a></li>
                    <li><a href='#'><i className='bx bx-bell'></i><span>Notifications</span></a></li>
                    <li className='theme-item'>
                      <button type='button' className='theme-toggle' onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                        <i className={`bx ${themeIcon}`}></i>
                      </button>
                    </li>
                    <li><a href='#'><i className='bx bx-user-circle'></i><span>Profile</span></a></li>
               </ul>
                    
            </div>
        </nav>
      </header>
    </div>
  )
}

export default Navbar
