/**
 * OTP Model — Database operations for password reset OTPs.
 *
 * INTEGRATION: Update the pool import below to point to YOUR project's
 * PostgreSQL connection pool (a `pg.Pool` instance).
 */
const pool = require("../../database/db"); // ← UPDATE THIS to your db module

/**
 * Create a new OTP record for a user.
 * Automatically invalidates any previous unused OTPs for the same user.
 *
 * @param {Object} params
 * @param {string} params.userId - UUID of the user
 * @param {string} params.otpHash - bcrypt hash of the OTP
 * @param {Date}   params.expiresAt - expiration timestamp
 * @returns {Object} The created OTP record
 */
const createOtp = async ({ userId, otpHash, expiresAt }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Invalidate all previous unused OTPs for this user
    await client.query(
      `UPDATE password_reset_otps
       SET used_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND used_at IS NULL`,
      [userId],
    );

    // Insert the new OTP
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

/**
 * Find the latest active (unused) OTP for a user.
 *
 * @param {string} userId - UUID of the user
 * @returns {Object|null} The active OTP record, or null
 */
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

/**
 * Increment the attempt counter for an OTP record.
 *
 * @param {string} otpId - UUID of the OTP record
 */
const incrementOtpAttempts = async (otpId) => {
  await pool.query(
    `UPDATE password_reset_otps
     SET attempts = attempts + 1
     WHERE id = $1`,
    [otpId],
  );
};

/**
 * Mark an OTP as verified (but not yet consumed).
 *
 * @param {string} otpId - UUID of the OTP record
 * @returns {Object|null} The updated OTP record
 */
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

/**
 * Update the user's password and mark the OTP as used.
 * Runs in a transaction to ensure atomicity.
 *
 * @param {Object} params
 * @param {string} params.userId - UUID of the user
 * @param {string} params.otpId - UUID of the OTP record
 * @param {string} params.passwordHash - new bcrypt password hash
 */
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
  createOtp,
  findLatestActiveOtpByUserId,
  incrementOtpAttempts,
  markOtpVerified,
  updatePasswordAndUseOtp,
};
