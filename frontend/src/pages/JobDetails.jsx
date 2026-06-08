import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import JobDetailsContent from '../components/JobDetailsContent';
import './JobDetails.css';

const MOCK_JOB = {
  id: "job_01",
  title: "Senior Full Stack Developer",
  company: {
    name: "TechVerse Solutions",
    logo: "https://cdn-icons-png.flaticon.com/512/281/281764.png",
    description: "TechVerse is a pioneer in cloud-native infrastructure, serving over 500 enterprise clients globally. We foster a culture of innovation and continuous learning.",
    industry: "Information Technology",
    size: "1,000 - 5,000 Employees",
    founded: 2010,
    website: "https://techverse.example.com",
    social: { linkedin: "#", twitter: "#" }
  },
  location: "San Francisco, CA",
  type: "Full-time",
  workMode: "Hybrid",
  salary: "$140k - $190k",
  experience: "5+ Years",
  postedDate: "2 days ago",
  deadline: "July 15, 2026",
  openings: 3,
  description: "We are seeking a highly skilled Senior Full Stack Developer to lead our core platform team. You will be responsible for architecting scalable microservices and creating intuitive user experiences.",
  responsibilities: [
    "Design and implement scalable backend services using Node.js and PostgreSQL.",
    "Develop responsive and interactive frontend components using React.",
    "Mentor junior developers and participate in architectural design reviews.",
    "Optimize application performance and ensure high availability.",
    "Collaborate with product managers to define feature requirements."
  ],
  skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS", "Docker", "GraphQL"],
  education: "Bachelor's or Master's degree in Computer Science or related field.",
  preferredQualifications: [
    "Experience with Kubernetes and CI/CD pipelines.",
    "Previous experience in Fintech or SaaS industries.",
    "Contributions to open-source projects."
  ],
  benefits: [
    { label: "Health Insurance", icon: "bx-plus-medical" },
    { label: "Flexible Hours", icon: "bx-time-five" },
    { label: "Remote Work", icon: "bx-home-alt" },
    { label: "Paid Leave", icon: "bx-leaf" },
    { label: "Learning Budget", icon: "bx-book-open" },
    { label: "Annual Bonuses", icon: "bx-money" }
  ],
  hiringStages: ["Application Review", "Technical Interview", "System Design", "HR Round", "Offer"],
  currentStage: 1, // Index of current stage (Technical Interview)
  sidebarData: {
    applicantsCount: 156,
    urgency: "High",
    recruiter: {
      name: "Alex Thompson",
      role: "Senior Tech Recruiter",
      image: "https://i.pravatar.cc/150?u=alex"
    }
  }
};

const JobDetails = () => {
  const { id } = useParams();
  // In a real app, you would fetch job data here based on the ID from the URL
  const job = MOCK_JOB;

  return (
    <div className="job-details-page-wrapper">
      <Navbar />
      <main className="job-details-main container">
        {job ? (
          <JobDetailsContent job={job} />
        ) : (
          <div className="loading-state">Loading job details...</div>
        )}
      </main>
    </div>
  );
};

export default JobDetails;