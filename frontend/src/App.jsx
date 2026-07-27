import { ThemeProvider } from "./context/ThemeContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { Routes, Route } from "react-router-dom";
import Profile from "./pages/Profile.jsx";
import SavedJobs from "./pages/SavedJobs.jsx";
import BrowseJobs from "./pages/BrowseJobs.jsx";
import Home from "./pages/Home.jsx";
import Notifications from "./pages/Notifications.jsx";
import Login from "./pages/Login.jsx";
import Registration from "./pages/Registration.jsx";
import Forgotpassword from "./pages/Forgotpassword.jsx";
import Otp from "./pages/Otp.jsx";
import JobDetails from "./pages/JobDetails.jsx";
import RecruiterForm from "./pages/RecruiterForm.jsx";
import RecruiterProfile from "./pages/RecruiterProfile.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import PostJob from "./pages/PostJob.jsx";
import RecruiterJobs from "./pages/RecruiterJobs.jsx";
import JobApplications from "./pages/JobApplications.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";

const App = () => {
  return (
    <ThemeProvider>
      <WishlistProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/saved" element={<SavedJobs />} />
            <Route path="/browse" element={<BrowseJobs />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Registration />} />
            <Route path="/forgot-password" element={<Forgotpassword />} />
            <Route path="/otpverification" element={<Otp />} />
            <Route path="/job/:id" element={<JobDetails />} />
            <Route path="/recruiter-signup" element={<RecruiterForm />} />
            <Route path="/recruiter-profile" element={<RecruiterProfile />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/post-job/:id" element={<PostJob />} />
            <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
            <Route path="/recruiter/jobs/:jobId/applications" element={<JobApplications />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/change-password" element={<ChangePassword />} />
          </Routes>
        </NotificationProvider>
      </WishlistProvider>
    </ThemeProvider>
  );
};

export default App;
