import { API_BASE_URL } from "./auth";

const parseJsonResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Unable to process saved jobs");
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

export const mapSavedJob = (job) => ({
  id: job.job_id || job.id,
  logo: job.logo_url || "",
  title: job.title || "Untitled role",
  company: job.company_name || "Unknown company",
  location: job.location || "Location not listed",
  salary: job.salary_label || "Salary not disclosed",
  experience: job.experience_level || "",
  postingDate: formatRelativeTime(job.created_at),
  type: job.job_type || "",
  tags: job.skills || [],
  companyInitials: (job.company_name || "C").charAt(0).toUpperCase(),
  savedJobId: job.saved_job_id || job.id,
  savedAt: job.saved_at || job.created_at,
});

export const getSavedJobs = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/saved-jobs/${userId}`);
  return parseJsonResponse(response);
};

export const getSavedJobStatus = async (userId, jobId) => {
  const query = new URLSearchParams({ userId, jobId });
  const response = await fetch(
    `${API_BASE_URL}/saved-jobs/check?${query.toString()}`,
  );
  return parseJsonResponse(response);
};

export const saveJob = async ({ userId, jobId }) => {
  const response = await fetch(`${API_BASE_URL}/saved-jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, jobId }),
  });

  return parseJsonResponse(response);
};

export const unsaveJob = async ({ userId, jobId }) => {
  const query = new URLSearchParams({ userId, jobId });
  const response = await fetch(
    `${API_BASE_URL}/saved-jobs?${query.toString()}`,
    {
      method: "DELETE",
    },
  );

  return parseJsonResponse(response);
};
