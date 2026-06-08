import React from 'react'
import Navbar from './components/Navbar.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { Routes, Route } from "react-router-dom";
import Profile from "./pages/Profile.jsx"
import SavedJobs from "./pages/SavedJobs.jsx"
import BrowseJobs from "./pages/BrowseJobs.jsx"
import Home from "./pages/Home.jsx"
import Notifications from './pages/Notifications.jsx';
import Login from './pages/Login.jsx';
import Registration from './pages/Registration.jsx';
import Forgotpassword from './pages/Forgotpassword.jsx';
import Otp from './pages/Otp.jsx';
import JobDetails from './pages/JobDetails.jsx';



const App = () => {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/saved" element={<SavedJobs />} />
        <Route path="/browse" element={<BrowseJobs />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Registration />} />
        <Route path="/forgot-password" element={<Forgotpassword />} />
        <Route path="/otpverification" element={<Otp />}/>
        <Route path="/job/:id" element={<JobDetails />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
