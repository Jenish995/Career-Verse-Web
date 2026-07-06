import { API_BASE_URL } from "./auth";

const parseJsonResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Unable to process notification request");
  }
  return data;
};

export const getNotifications = async (userId) => {
  const response = await fetch(
    `${API_BASE_URL}/notifications?userId=${encodeURIComponent(userId)}`
  );
  return parseJsonResponse(response);
};

export const getUnreadCount = async (userId) => {
  const response = await fetch(
    `${API_BASE_URL}/notifications/unread-count?userId=${encodeURIComponent(userId)}`
  );
  return parseJsonResponse(response);
};

export const markNotificationsRead = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/notifications/mark-read`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  return parseJsonResponse(response);
};
