import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext.jsx';
import JobFilters from '../components/JobFilters.jsx';
import JobCard from '../components/JobCard.jsx';
import './BrowseJobs.css';

const MOCK_JOBS = [
  {
    id: 1,
    title: "Senior Frontend Engineer",
    company: "TechFlow Systems",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$130k - $180k",
    posted: "2h ago",
    category: "Software Development",
    tags: ["React", "TypeScript", "Node.js"]
  },
  {
    id: 2,
    title: "Product Designer",
    company: "Creative Studio",
    location: "Remote",
    type: "Contract",
    salary: "$90k - $120k",
    posted: "5h ago",
    category: "UI/UX Design",
    tags: ["Figma", "UI/UX", "Prototyping"]
  },
  {
    id: 3,
    title: "Data Scientist",
    company: "DataMetrics AI",
    location: "New York, NY",
    type: "Full-time",
    salary: "$140k - $190k",
    posted: "1d ago",
    category: "Data Science",
    tags: ["Python", "PyTorch", "SQL"]
  },
  {
    id: 4,
    title: "Marketing Manager",
    company: "Growth Boost",
    location: "Austin, TX",
    type: "Part-time",
    salary: "$50k - $70k",
    posted: "2d ago",
    category: "Marketing",
    tags: ["SEO", "AdWords", "Analytics"]
  }
];

const BrowseJobs = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    jobType: [],
    experience: [],
    category: []
  });

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredJobs = MOCK_JOBS.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedFilters.jobType.length === 0 || 
      selectedFilters.jobType.includes(job.type);

    const matchesCategory = selectedFilters.category.length === 0 || 
      selectedFilters.category.includes(job.category);

    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="browse-jobs-page">
      <Navbar />
      
      <header className="browse-header">
        <div className="container">
          <h1>Browse Opportunities</h1>
          <p>Find your next career move from thousands of verified listings.</p>
          
          <div className="search-container-main">
            <div className="search-input-group">
              <i className='bx bx-search'></i>
              <input 
                type="text" 
                placeholder="Search job titles, companies, or keywords..." 
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div className="search-input-group location">
              <i className='bx bx-map'></i>
              <input type="text" placeholder="Location (e.g. Remote, NYC)" />
            </div>
            <button className="btn btn-primary search-btn">Find Jobs</button>
          </div>
        </div>
      </header>

      <main className="browse-content container">
        <aside className="filters-sidebar">
          <JobFilters 
            selectedFilters={selectedFilters} 
            setSelectedFilters={setSelectedFilters} 
          />
        </aside>

        <section className="job-listings-results">
          <div className="results-meta">
            <span>Showing <strong>{filteredJobs.length}</strong> jobs</span>
            <div className="sort-dropdown">
              <label>Sort by:</label>
              <select>
                <option>Newest First</option>
                <option>Salary: High to Low</option>
                <option>Relevance</option>
              </select>
            </div>
          </div>

          <div className="jobs-list">
            {filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <JobCard 
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  company={job.company}
                  location={job.location}
                  salary={job.salary}
                  type={job.type}
                  postingDate={job.posted}
                  tags={job.tags}
                />
              ))
            ) : (
              <div className="no-results">
                <i className='bx bx-search-alt'></i>
                <h3>No jobs found matching your criteria</h3>
                <p>Try adjusting your filters or search keywords.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default BrowseJobs;