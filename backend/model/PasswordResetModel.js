const pool = require("../database/db");

const createPasswordResetOtp = async ({ userId, otpHash, expiresAt }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE password_reset_otps
       SET used_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND used_at IS NULL`,
      [userId],
    );

    const result = await client.query(
      `INSERT INTO password_reset_otps (user_id, otp_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, expires_at, attempts, max_attempts, created_at`,
      [userId, otpHash, expiresAt],
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const findLatestActiveOtpByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT id, user_id, otp_hash, expires_at, verified_at, used_at, attempts, max_attempts, created_at
     FROM password_reset_otps
     WHERE user_id = $1
       AND used_at IS NULL
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId],
  );

  return result.rows[0] || null;
};

const incrementOtpAttempts = async (otpId) => {
  await pool.query(
    `UPDATE password_reset_otps
     SET attempts = attempts + 1
     WHERE id = $1`,
    [otpId],
  );
};

const markOtpVerified = async (otpId) => {
  const result = await pool.query(
    `UPDATE password_reset_otps
     SET verified_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, user_id, expires_at, verified_at, attempts, max_attempts`,
    [otpId],
  );

  return result.rows[0] || null;
};

const updatePasswordAndUseOtp = async ({ userId, otpId, passwordHash }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE users
       SET password_hash = $1,
           password_changed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [passwordHash, userId],
    );

    await client.query(
      `UPDATE password_reset_otps
       SET used_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [otpId],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createPasswordResetOtp,
  findLatestActiveOtpByUserId,
  incrementOtpAttempts,
  markOtpVerified,
  updatePasswordAndUseOtp,
};
