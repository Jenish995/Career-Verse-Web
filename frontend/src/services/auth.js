const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const parseJsonResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Authentication failed");
  }

  return data;
};

export const registerUser = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(response);
};

export const loginUser = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(response);
};

export const getCandidateProfile = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`);
  return parseJsonResponse(response);
};

export const updateCandidateProfile = async (userId, payload) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(response);
};

export const getRecruiterProfile = async (userId) => {
  const response = await fetch(
    `${API_BASE_URL}/users/${userId}/recruiter-profile`,
  );
  return parseJsonResponse(response);
};

export const updateRecruiterProfile = async (userId, payload) => {
  const response = await fetch(
    `${API_BASE_URL}/users/${userId}/recruiter-profile`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  return parseJsonResponse(response);
};

export const persistAuthSession = (data) => {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  if (data.profile) {
    localStorage.setItem("profile", JSON.stringify(data.profile));
  } else {
    localStorage.removeItem("profile");
  }
};

export const persistProfile = (profile) => {
  localStorage.setItem("profile", JSON.stringify(profile));
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE_URL}/uploads/image`, {
    method: "POST",
    body: formData,
  });

  return parseJsonResponse(response);
};

export const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("profile");
};

export { API_BASE_URL };
