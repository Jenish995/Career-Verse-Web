const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const parseJsonResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Unable to fetch jobs");
  }

  return data;
};

const formatRelativeTime = (dateString) => {
  if (!dateString) {
    return "Recently posted";
  }

  const createdAt = new Date(dateString).getTime();
  const diffMs = Date.now() - createdAt;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return `${diffMinutes}m ago`;
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const formatSalaryLabel = (job) => {
  if (job.salary_label) {
    return job.salary_label;
  }

  if (job.salary_min && job.salary_max) {
    const currency = job.salary_currency || "USD";
    const symbol = currency === "USD" ? "$" : `${currency} `;
    return `${symbol}${Math.round(job.salary_min / 1000)}k - ${symbol}${Math.round(job.salary_max / 1000)}k`;
  }

  return "Salary not disclosed";
};

export const mapJobSummary = (job) => ({
  id: job.id,
  title: job.title,
  company: job.company_name,
  logo: job.logo_url,
  location: job.location,
  salary: formatSalaryLabel(job),
  type: job.job_type,
  workMode: job.work_mode,
  experience: job.experience_level,
  postingDate: formatRelativeTime(job.created_at),
  postedDate: new Date(job.created_at),
  category: job.category,
  tags: job.skills || [],
});

export const mapJobDetails = (job) => ({
  id: job.id,
  title: job.title,
  company: {
    name: job.company_name,
    logo: job.logo_url,
    banner: job.banner_url,
    description: job.company_description,
    industry: job.industry,
    size: job.size,
    founded: job.founded,
    website: job.website,
    social: { linkedin: "#", twitter: "#" },
  },
  location: job.location,
  type: job.job_type,
  workMode: job.work_mode,
  salary: formatSalaryLabel(job),
  experience: job.experience_level,
  postedDate: formatRelativeTime(job.created_at),
  deadline: job.deadline ? new Date(job.deadline).toLocaleDateString() : "Open until filled",
  openings: job.openings,
  description: job.description,
  responsibilities: job.responsibilities || [],
  skills: job.skills || [],
  education: job.education || "Not specified",
  preferredQualifications: job.preferred_qualifications || [],
  benefits: job.benefits || [],
  hiringStages: job.hiring_stages || [],
  currentStage: job.current_stage || 0,
  sidebarData: {
    applicantsCount: job.applicants_count || 0,
    urgency: job.urgency || "Medium",
    recruiter: {
      name: job.recruiter_name || "Hiring Team",
      role: job.recruiter_role || "Recruiter",
      image: job.recruiter_image || "https://i.pravatar.cc/150?u=careerverse-recruiter",
    },
  },
});

export const getJobs = async (params = {}) => {
  const query = new URLSearchParams();

  if (params.limit) {
    query.set("limit", params.limit);
  }

  if (params.sortBy) {
    query.set("sortBy", params.sortBy);
  }

  const queryString = query.toString();
  const response = await fetch(`${API_BASE_URL}/jobs${queryString ? `?${queryString}` : ""}`);
  return parseJsonResponse(response);
};

export const getJobById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/jobs/${id}`);
  return parseJsonResponse(response);
};
