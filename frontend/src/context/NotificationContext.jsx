import { useCallback, useEffect, useMemo, useState } from "react";
import { AUTH_CHANGED_EVENT } from "../services/auth";
import {
  getUnreadCount,
  markNotificationsRead,
} from "../services/notifications";
import { NotificationContext } from "./notificationStore";

const getCurrentUser = () => {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  // Fetch the current unread count from the server
  const refreshCount = useCallback(async () => {
    const user = getCurrentUser();
    setCurrentUser(user);

    if (!user?.id || user.role !== "candidate") {
      setUnreadCount(0);
      return;
    }

    try {
      const data = await getUnreadCount(user.id);
      setUnreadCount(data.count ?? 0);
    } catch {
      // Silently fail — badge just won't update
    }
  }, []);

  // Mark all as read and immediately zero out the badge
  const markAllRead = useCallback(async () => {
    const user = getCurrentUser();
    if (!user?.id) return;
    try {
      await markNotificationsRead(user.id);
      setUnreadCount(0);
    } catch {
      // Silently fail
    }
  }, []);

  // Initial load
  useEffect(() => {
    const id = window.setTimeout(refreshCount, 0);
    return () => window.clearTimeout(id);
  }, [refreshCount]);

  // Poll every 30 seconds to catch new notifications while the page is open
  useEffect(() => {
    const interval = window.setInterval(refreshCount, 30_000);
    return () => window.clearInterval(interval);
  }, [refreshCount]);

  // Re-sync when the user logs in / out
  useEffect(() => {
    window.addEventListener(AUTH_CHANGED_EVENT, refreshCount);
    window.addEventListener("storage", refreshCount);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, refreshCount);
      window.removeEventListener("storage", refreshCount);
    };
  }, [refreshCount]);

  const value = useMemo(
    () => ({ unreadCount, refreshCount, markAllRead, currentUser }),
    [unreadCount, refreshCount, markAllRead, currentUser]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
