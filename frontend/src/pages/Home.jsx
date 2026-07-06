import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import JobCard from "../components/JobCard";
import {
  CategoryCard,
  FeatureCard,
  CompanyCard,
  TimelineItem,
  ResourceCard,
  TestimonialCard,
} from "../components/HomeComponents";
import { getCandidateApplications } from "../services/applications";
import { getJobs, mapJobSummary } from "../services/jobs";
import "./Home.css";

const heroIllustration =
  "https://img.freepik.com/free-vector/job-hunt-concept-illustration_114360-412.jpg";
const companyLogo1 = "https://cdn-icons-png.flaticon.com/512/281/281764.png";
const companyLogo2 = "https://cdn-icons-png.flaticon.com/512/732/732200.png";
const companyLogo3 = "https://cdn-icons-png.flaticon.com/512/5968/5968204.png";
const companyLogo4 = "https://cdn-icons-png.flaticon.com/512/732/732228.png";

const CATEGORIES = [
  { icon: "bx-code-alt", label: "Software Development" },
  { icon: "bx-palette", label: "UI/UX Design" },
  { icon: "bx-chart", label: "Data Science" },
  { icon: "bx-megaphone", label: "Marketing" },
  { icon: "bx-dollar-circle", label: "Finance" },
  { icon: "bx-group", label: "Human Resources" },
  { icon: "bx-headphone", label: "Customer Support" },
  { icon: "bx-cog", label: "Engineering" },
];

const FEATURES = [
  {
    icon: "bx-bulb",
    title: "Smart Job Search",
    description: "Advanced algorithms to match you with the perfect job.",
  },
  {
    icon: "bx-line-chart",
    title: "Application Tracking",
    description: "Monitor your applications every step of the way.",
  },
  {
    icon: "bx-bell",
    title: "Real-Time Notifications",
    description: "Get instant alerts for new job postings and updates.",
  },
  {
    icon: "bx-badge-check",
    title: "Verified Employers",
    description: "Apply with confidence to jobs from trusted companies.",
  },
];

const TOP_COMPANIES = [
  { logo: companyLogo1, name: "Tech Solutions Inc.", positions: "50+" },
  { logo: companyLogo2, name: "Creative Minds Studio", positions: "25+" },
  { logo: companyLogo3, name: "Data Insights Corp.", positions: "30+" },
  { logo: companyLogo4, name: "Global Marketing Agency", positions: "15+" },
];

const HOW_IT_WORKS = [
  {
    icon: "bx-user-plus",
    title: "1. Create Account",
    description: "Sign up in minutes and start your journey.",
  },
  {
    icon: "bx-id-card",
    title: "2. Build Profile",
    description: "Showcase your skills and experience to employers.",
  },
  {
    icon: "bx-send",
    title: "3. Apply for Jobs",
    description: "Easily apply to thousands of jobs with a single click.",
  },
  {
    icon: "bx-check-circle",
    title: "4. Get Hired",
    description: "Land your dream job and advance your career.",
  },
];

const RESOURCES = [
  {
    icon: "bx-file",
    title: "Resume Tips",
    description: "Craft a winning resume that stands out.",
  },
  {
    icon: "bx-conversation",
    title: "Interview Preparation",
    description: "Ace your interviews with expert advice.",
  },
  {
    icon: "bx-bulb",
    title: "Career Advice",
    description: "Navigate your career path with insightful guidance.",
  },
  {
    icon: "bx-money",
    title: "Salary Insights",
    description: "Understand salary trends in your industry.",
  },
];

const TESTIMONIALS = [
  {
    image: "https://via.placeholder.com/50",
    name: "Jane Doe",
    role: "Frontend Developer",
    rating: 5,
    quote:
      "Career Verse helped me land my dream job in just a few weeks! The platform is intuitive and the job matching is spot on.",
  },
  {
    image: "https://via.placeholder.com/50",
    name: "John Smith",
    role: "HR Manager",
    rating: 4.5,
    quote:
      "Finding qualified candidates has never been easier. Career Verse's talent pool is exceptional and the tools are fantastic.",
  },
];

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const currentUser = useMemo(() => {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  }, []);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const requests = [getJobs({ limit: 8 })];

        if (currentUser?.role === "candidate") {
          requests.push(getCandidateApplications(currentUser.id));
        }

        const [jobData, applicationData] = await Promise.all(requests);
        setJobs(jobData.jobs.map(mapJobSummary));
        setAppliedJobIds(
          currentUser?.role === "candidate"
            ? (applicationData?.applications || []).map(
                (application) => application.job_id,
              )
            : [],
        );
      } catch {
        setJobs([]);
        setAppliedJobIds([]);
      }
    };

    loadJobs();
  }, [currentUser]);

  const featuredJobs = jobs.slice(0, 6);
  const latestJobs = jobs.slice(0, 2);

  return (
    <div className="home-page-wrapper">
      <Navbar />
      <main className="home-content">
        <section className="hero-section">
          <div className="hero-main-content">
            <div className="hero-text">
              <h1>Find Your Dream Job With Career Verse</h1>
              <p className="subtitle">
                Your ultimate platform for discovering exciting career
                opportunities and connecting with top companies.
              </p>
              <div className="cta-buttons">
                <Link to="/browse" className="btn btn-primary">
                  Browse Jobs
                </Link>
                <Link to="/signup" className="btn btn-secondary">
                  Create Account
                </Link>
              </div>
            </div>
            <div className="hero-illustration">
              <img src={heroIllustration} alt="Career-themed illustration" />
              <div className="floating-cards">
                <div className="floating-card">Frontend Developer</div>
                <div className="floating-card">UI/UX Designer</div>
                <div className="floating-card">Data Analyst</div>
              </div>
            </div>
          </div>
          <div className="stats-section">
            <div className="stat-item">
              <h3>10K+</h3>
              <p>Jobs Posted</p>
            </div>
            <div className="stat-item">
              <h3>500+</h3>
              <p>Companies</p>
            </div>
            <div className="stat-item">
              <h3>20K+</h3>
              <p>Applicants</p>
            </div>
          </div>
        </section>

        <section className="job-search-section">
          <h2>Discover Your Next Opportunity</h2>
          <div className="search-bar-large">
            <input
              type="text"
              placeholder="Job title, keywords..."
              aria-label="Job title"
            />
            <input type="text" placeholder="Location" aria-label="Location" />
            <select aria-label="Category">
              <option value="">Category</option>
              <option value="software">Software Development</option>
              <option value="design">UI/UX Design</option>
              <option value="data">Data Science</option>
              <option value="marketing">Marketing</option>
            </select>
            <button className="btn btn-primary">
              <i className="bx bx-search"></i> Search
            </button>
          </div>
        </section>

        <section className="featured-jobs-section">
          <h2>Featured Jobs</h2>
          <div className="job-grid">
            {featuredJobs.length > 0 ? (
              featuredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  {...job}
                  isApplied={appliedJobIds.includes(job.id)}
                />
              ))
            ) : (
              <p>No featured jobs available right now.</p>
            )}
          </div>
        </section>

        <section className="browse-categories-section">
          <h2>Browse by Category</h2>
          <div className="category-grid">
            {CATEGORIES.map((cat, index) => (
              <CategoryCard key={index} {...cat} />
            ))}
          </div>
        </section>

        <section className="why-choose-section">
          <h2>Why Choose Career Verse?</h2>
          <div className="feature-grid">
            {FEATURES.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </section>

        <section className="top-companies-section">
          <h2>Top Companies Hiring</h2>
          <div className="company-grid">
            {TOP_COMPANIES.map((company, index) => (
              <CompanyCard key={index} {...company} />
            ))}
          </div>
        </section>

        <section className="how-it-works-section">
          <h2>How It Works</h2>
          <div className="timeline">
            {HOW_IT_WORKS.map((step, index) => (
              <TimelineItem key={index} {...step} />
            ))}
          </div>
        </section>

        <section className="career-resources-section">
          <h2>Career Resources</h2>
          <div className="resource-grid">
            {RESOURCES.map((resource, index) => (
              <ResourceCard key={index} {...resource} />
            ))}
          </div>
        </section>

        <section className="latest-jobs-section">
          <h2>Latest Jobs</h2>
          <div className="job-grid">
            {latestJobs.length > 0 ? (
              latestJobs.map((job) => (
                <JobCard
                  key={job.id}
                  {...job}
                  isApplied={appliedJobIds.includes(job.id)}
                />
              ))
            ) : (
              <p>No latest jobs available right now.</p>
            )}
          </div>
        </section>

        <section className="testimonials-section">
          <h2>What Our Users Say</h2>
          <div className="testimonial-grid">
            {TESTIMONIALS.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </section>

        <section className="cta-bottom-section">
          <h2>Ready to Start Your Career Journey?</h2>
          <Link to="/signup">
            <button className="btn btn-primary">
              Create Account
            </button>
          </Link>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-about">
            <div className="logo">Career Verse</div>
            <p>
              Your trusted partner in career advancement. Find the best jobs and
              grow your professional network.
            </p>
          </div>
          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <a href="/about">About Us</a>
              </li>
              <li>
                <a href="/browse">Browse Jobs</a>
              </li>
              <li>
                <a href="/companies">Companies</a>
              </li>
              <li>
                <a href="/contact">Contact</a>
              </li>
            </ul>
          </div>
          <div className="footer-social">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a href="#">
                <i className="bx bxl-facebook-circle"></i>
              </a>
              <a href="#">
                <i className="bx bxl-twitter"></i>
              </a>
              <a href="#">
                <i className="bx bxl-linkedin-square"></i>
              </a>
              <a href="#">
                <i className="bx bxl-instagram"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Career Verse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
