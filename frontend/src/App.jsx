import React from 'react'
import Navbar from './components/Navbar.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

const App = () => {
  return (
    <ThemeProvider>
      <div className="app-shell">
        <Navbar />
      </div>
    </ThemeProvider>
  )
}

export default App
