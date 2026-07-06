/**
 * OTP API Service — Frontend API calls for the OTP password reset flow.
 *
 * INTEGRATION: Update API_BASE_URL to match your backend.
 */

const API_BASE_URL = "http://localhost:5000/api"; // ← UPDATE THIS

const parseJsonResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

/**
 * Step 1: Request an OTP for the given email.
 * @param {string} email
 */
export const forgotPassword = async (email) => {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  return parseJsonResponse(response);
};

/**
 * Step 2: Verify the OTP code.
 * @param {string} email
 * @param {string} otp
 */
export const verifyOtp = async (email, otp) => {
  const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  return parseJsonResponse(response);
};

/**
 * Step 3: Reset the password.
 * @param {string} email
 * @param {string} otp
 * @param {string} password
 */
export const resetPassword = async (email, otp, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, password }),
  });

  return parseJsonResponse(response);
};
