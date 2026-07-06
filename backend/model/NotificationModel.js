const pool = require("../database/db");

/**
 * Insert one notification row per candidate user for a newly posted job.
 */
const createNotificationsForAllCandidates = async (jobId, title, message) => {
  // Fetch all candidate user IDs
  const candidatesResult = await pool.query(
    `SELECT user_id FROM candidates`
  );

  if (candidatesResult.rows.length === 0) {
    return;
  }

  // Build a bulk INSERT values string
  const values = candidatesResult.rows.map((_, i) => {
    const base = i * 4;
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
  });

  const params = [];
  for (const row of candidatesResult.rows) {
    params.push(row.user_id, jobId, title, message);
  }

  await pool.query(
    `INSERT INTO notifications (user_id, job_id, title, message)
     VALUES ${values.join(", ")}`,
    params
  );
};

/**
 * Get all notifications for a user, newest first.
 */
const getNotificationsByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT
       n.id,
       n.user_id,
       n.job_id,
       n.title,
       n.message,
       n.is_read,
       n.created_at,
       j.title AS job_title,
       c.company_name,
       c.logo_url
     FROM notifications n
     LEFT JOIN jobs j ON j.id = n.job_id
     LEFT JOIN companies c ON c.id = j.company_id
     WHERE n.user_id = $1
     ORDER BY n.created_at DESC`,
    [userId]
  );
  return result.rows;
};

/**
 * Return the count of unread notifications for a user.
 */
const getUnreadCountByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT COUNT(*) AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );
  return parseInt(result.rows[0].count, 10);
};

/**
 * Mark all notifications as read for a user.
 */
const markAllReadForUser = async (userId) => {
  await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );
};

module.exports = {
  createNotificationsForAllCandidates,
  getNotificationsByUserId,
  getUnreadCountByUserId,
  markAllReadForUser,
};
