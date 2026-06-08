import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'
import Navbar from '../components/Navbar'
import JobCard from '../components/JobCard'
import { CategoryCard, FeatureCard, CompanyCard, TimelineItem, ResourceCard, TestimonialCard } from '../components/HomeComponents'
import './Home.css'

const heroIllustration = "https://img.freepik.com/free-vector/job-hunt-concept-illustration_114360-412.jpg";
const companyLogo1 = "https://cdn-icons-png.flaticon.com/512/281/281764.png";
const companyLogo2 = "https://cdn-icons-png.flaticon.com/512/732/732200.png";
const companyLogo3 = "https://cdn-icons-png.flaticon.com/512/5968/5968204.png";
const companyLogo4 = "https://cdn-icons-png.flaticon.com/512/732/732228.png";

const FEATURED_JOBS = [
  { id: 1, logo: companyLogo1, title: "Software Engineer", company: "Tech Solutions Inc.", location: "New York, USA", salary: "$80K - $120K", experience: "Mid-Level" },
  { id: 2, logo: companyLogo2, title: "UI/UX Designer", company: "Creative Minds Studio", location: "San Francisco, USA", salary: "$70K - $100K", experience: "Senior" },
  { id: 3, logo: companyLogo3, title: "Data Scientist", company: "Data Insights Corp.", location: "Remote", salary: "$90K - $130K", experience: "Entry-Level" },
  { id: 4, logo: companyLogo4, title: "Marketing Specialist", company: "Global Marketing Agency", location: "London, UK", salary: "£40K - £60K", experience: "Mid-Level" },
  { id: 5, logo: companyLogo1, title: "Product Manager", company: "Innovate Solutions", location: "Seattle, USA", salary: "$100K - $150K", experience: "Senior" },
  { id: 6, logo: companyLogo2, title: "Customer Support Rep", company: "Service First Co.", location: "Remote", salary: "$35K - $50K", experience: "Entry-Level" },
];

const CATEGORIES = [
  { icon: 'bx-code-alt', label: 'Software Development' },
  { icon: 'bx-palette', label: 'UI/UX Design' },
  { icon: 'bx-chart', label: 'Data Science' },
  { icon: 'bx-megaphone', label: 'Marketing' },
  { icon: 'bx-dollar-circle', label: 'Finance' },
  { icon: 'bx-group', label: 'Human Resources' },
  { icon: 'bx-headphone', label: 'Customer Support' },
  { icon: 'bx-cog', label: 'Engineering' },
];

const FEATURES = [
  { icon: 'bx-bulb', title: 'Smart Job Search', description: 'Advanced algorithms to match you with the perfect job.' },
  { icon: 'bx-line-chart', title: 'Application Tracking', description: 'Monitor your applications every step of the way.' },
  { icon: 'bx-bell', title: 'Real-Time Notifications', description: 'Get instant alerts for new job postings and updates.' },
  { icon: 'bx-badge-check', title: 'Verified Employers', description: 'Apply with confidence to jobs from trusted companies.' },
];

const TOP_COMPANIES = [
  { logo: companyLogo1, name: 'Tech Solutions Inc.', positions: '50+' },
  { logo: companyLogo2, name: 'Creative Minds Studio', positions: '25+' },
  { logo: companyLogo3, name: 'Data Insights Corp.', positions: '30+' },
  { logo: companyLogo4, name: 'Global Marketing Agency', positions: '15+' },
];

const HOW_IT_WORKS = [
  { icon: 'bx-user-plus', title: '1. Create Account', description: 'Sign up in minutes and start your journey.' },
  { icon: 'bx-id-card', title: '2. Build Profile', description: 'Showcase your skills and experience to employers.' },
  { icon: 'bx-send', title: '3. Apply for Jobs', description: 'Easily apply to thousands of jobs with a single click.' },
  { icon: 'bx-check-circle', title: '4. Get Hired', description: 'Land your dream job and advance your career.' },
];

const RESOURCES = [
  { icon: 'bx-file', title: 'Resume Tips', description: 'Craft a winning resume that stands out.' },
  { icon: 'bx-conversation', title: 'Interview Preparation', description: 'Ace your interviews with expert advice.' },
  { icon: 'bx-bulb', title: 'Career Advice', description: 'Navigate your career path with insightful guidance.' },
  { icon: 'bx-money', title: 'Salary Insights', description: 'Understand salary trends in your industry.' },
];

const LATEST_JOBS = [
  { id: 7, logo: companyLogo3, title: "Cloud Engineer", company: "Cloud Innovations", location: "Austin, USA", salary: "$95K - $140K", experience: "Senior", postingDate: "Posted 2 days ago" },
  { id: 8, logo: companyLogo4, title: "Content Creator", company: "Digital Storytellers", location: "Remote", salary: "$45K - $70K", experience: "Entry-Level", postingDate: "Posted 3 days ago" },
];

const TESTIMONIALS = [
  { image: "https://via.placeholder.com/50", name: "Jane Doe", role: "Frontend Developer", rating: 5, quote: "Career Verse helped me land my dream job in just a few weeks! The platform is intuitive and the job matching is spot on." },
  { image: "https://via.placeholder.com/50", name: "John Smith", role: "HR Manager", rating: 4.5, quote: "Finding qualified candidates has never been easier. Career Verse's talent pool is exceptional and the tools are fantastic." },
];

const Home = () => {
  const { theme } = useTheme();

  return (
    <div className="home-page-wrapper">
      <Navbar />
      <main className="home-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-main-content">
            <div className="hero-text">
              <h1>Find Your Dream Job With Career Verse</h1>
              <p className="subtitle">
                Your ultimate platform for discovering exciting career opportunities and connecting with top companies.
              </p>
              <div className="cta-buttons">
                <Link to="/browse" className="btn btn-primary">Browse Jobs</Link>
                <Link to="/signup" className="btn btn-secondary">Create Account</Link>
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

        {/* Job Search Section */}
        <section className="job-search-section">
          <h2>Discover Your Next Opportunity</h2>
          <div className="search-bar-large">
            <input type="text" placeholder="Job title, keywords..." aria-label="Job title" />
            <input type="text" placeholder="Location" aria-label="Location" />
            <select aria-label="Category">
              <option value="">Category</option>
              <option value="software">Software Development</option>
              <option value="design">UI/UX Design</option>
              <option value="data">Data Science</option>
              <option value="marketing">Marketing</option>
            </select>
            <button className="btn btn-primary">
              <i className='bx bx-search'></i> Search
            </button>
          </div>
        </section>

        {/* Featured Jobs Section */}
        <section className="featured-jobs-section">
          <h2>Featured Jobs</h2>
          <div className="job-grid">
            {FEATURED_JOBS.map((job, index) => (
              <JobCard key={index} {...job} />
            ))}
          </div>
        </section>

        {/* Browse Categories Section */}
        <section className="browse-categories-section">
          <h2>Browse by Category</h2>
          <div className="category-grid">
            {CATEGORIES.map((cat, index) => (
              <CategoryCard key={index} {...cat} />
            ))}
          </div>
        </section>

        {/* Why Choose Career Verse Section */}
        <section className="why-choose-section">
          <h2>Why Choose Career Verse?</h2>
          <div className="feature-grid">
            {FEATURES.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </section>

        {/* Top Companies Hiring Section */}
        <section className="top-companies-section">
          <h2>Top Companies Hiring</h2>
          <div className="company-grid">
            {TOP_COMPANIES.map((company, index) => (
              <CompanyCard key={index} {...company} />
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works-section">
          <h2>How It Works</h2>
          <div className="timeline">
            {HOW_IT_WORKS.map((step, index) => (
              <TimelineItem key={index} {...step} />
            ))}
          </div>
        </section>

        {/* Career Resources Section */}
        <section className="career-resources-section">
          <h2>Career Resources</h2>
          <div className="resource-grid">
            {RESOURCES.map((resource, index) => (
              <ResourceCard key={index} {...resource} />
            ))}
          </div>
        </section>

        {/* Latest Jobs Section */}
        <section className="latest-jobs-section">
          <h2>Latest Jobs</h2>
          <div className="job-grid">
            {LATEST_JOBS.map((job, index) => (
              <JobCard key={index} {...job} />
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials-section">
          <h2>What Our Users Say</h2>
          <div className="testimonial-grid">
            {TESTIMONIALS.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </section>

        {/* Call To Action Section (Bottom) */}
        <section className="cta-bottom-section">
          <h2>Ready to Start Your Career Journey?</h2>
          <button className="btn btn-primary">Create Account</button>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-about">
            <div className="logo">Career Verse</div>
            <p>Your trusted partner in career advancement. Find the best jobs and grow your professional network.</p>
          </div>
          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/browse">Browse Jobs</a></li>
              <li><a href="/companies">Companies</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-social">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a href="#"><i className='bx bxl-facebook-circle'></i></a>
              <a href="#"><i className='bx bxl-twitter'></i></a>
              <a href="#"><i className='bx bxl-linkedin-square'></i></a>
              <a href="#"><i className='bx bxl-instagram'></i></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Career Verse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
