import React from 'react'
import "./Navbar.css"
import { useTheme } from '../context/ThemeContext.jsx'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const { theme, toggleTheme } = useTheme()
  const themeIcon = theme === 'dark' ? 'bx-sun' : 'bx-moon'

  return (
    <div>
      <header>
        <nav className='nav-bar'>
            <div className='nav-div'>

                <div className='logo' ><Link to='/'>Career Verse</Link></div>

                <div className='search-bar'>
                  <i className='bx bx-search'></i>
                  <input type='search' placeholder='Search jobs, companies, skills' aria-label='Search' />
                </div>

               <ul className='left-elements'>
                    <li><Link to='/'><i className='bx bx-home'></i><span>Home</span></Link></li>
                    <li><Link to='/browse'><i className='bx bx-briefcase'></i><span>Browse Jobs</span></Link></li>
                    <li><Link to='/notifications'><i className='bx bx-bell'></i><span>Notifications</span></Link></li>
                    <li><Link to='/saved'><i className='bx bx-bookmark'></i><span>Saved Jobs</span></Link></li>
                    <li className='theme-item'>
                      <button type='button' className='theme-toggle' onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                        <i className={`bx ${themeIcon}`}></i>
                      </button>
                    </li>
                    <li><Link to='/profile'><i className='bx bx-user-circle'></i><span>Profile</span></Link></li>
               </ul>
                    
            </div>
        </nav>
      </header>
    </div>
  )
}

export default Navbar
