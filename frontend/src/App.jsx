import React from 'react'
import Navbar from './components/Navbar.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { Routes, Route } from "react-router-dom";
import Profile from "./pages/Profile.jsx"
import SavedJobs from "./pages/SavedJobs.jsx"
import BrowseJobs from "./pages/BrowseJobs.jsx"
import Home from "./pages/Home.jsx"
import Notifications from './pages/Notifications.jsx';



const App = () => {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/saved" element={<SavedJobs />} />
        <Route path="/browse" element={<BrowseJobs />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
