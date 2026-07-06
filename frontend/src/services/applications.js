import { API_BASE_URL } from "./auth";

const parseJsonResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Unable to process application");
  }

  return data;
};

export const getApplicationStatus = async (jobId, candidateId) => {
  const query = new URLSearchParams({ jobId, candidateId });
  const response = await fetch(`${API_BASE_URL}/applications/check?${query.toString()}`);
  return parseJsonResponse(response);
};

export const applyToJob = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(response);
};

export const getCandidateApplications = async (candidateId) => {
  const response = await fetch(`${API_BASE_URL}/applications/candidate/${candidateId}`);
  return parseJsonResponse(response);
};

export const getJobApplications = async (jobId) => {
  const response = await fetch(`${API_BASE_URL}/applications/job/${jobId}`);
  return parseJsonResponse(response);
};

export const updateApplicationStatus = async (applicationId, status) => {
  const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  return parseJsonResponse(response);
};

