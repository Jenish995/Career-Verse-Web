const {
  getNotificationsByUserId,
  getUnreadCountByUserId,
  markAllReadForUser,
} = require("../model/NotificationModel");

const getNotifications = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    const notifications = await getNotificationsByUserId(userId);
    return res.status(200).json({ notifications });
  } catch (error) {
    console.error("Get notifications error:", error.message);
    return res.status(500).json({ message: "Server error while fetching notifications" });
  }
};

const getUnreadCount = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    const count = await getUnreadCountByUserId(userId);
    return res.status(200).json({ count });
  } catch (error) {
    console.error("Get unread count error:", error.message);
    return res.status(500).json({ message: "Server error while fetching unread count" });
  }
};

const markRead = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    await markAllReadForUser(userId);
    return res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Mark read error:", error.message);
    return res.status(500).json({ message: "Server error while marking notifications as read" });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markRead,
};
