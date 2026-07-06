import { useContext } from "react";
import { NotificationContext } from "./notificationStore";

export const useNotifications = () => useContext(NotificationContext);
