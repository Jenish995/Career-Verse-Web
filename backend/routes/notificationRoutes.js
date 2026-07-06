const express = require("express");
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markRead,
} = require("../controller/notificationController");

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/mark-read", markRead);

module.exports = router;
