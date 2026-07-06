/**
 * OTP Controller — Express route handlers for password reset via OTP.
 *
 * INTEGRATION:
 * 1. Update the `findUserByEmail` import to point to YOUR user model.
 *    It must accept an email string and return a user object with { id, email, password_hash }
 *    or null if not found.
 *
 * 2. Update the otpModel import path if you move the files.
 */
const bcrypt = require("bcrypt");
const { findUserByEmail } = require("../../model/UserModel"); // ← UPDATE THIS to your user model
const {
  createOtp,
  findLatestActiveOtpByUserId,
  incrementOtpAttempts,
  markOtpVerified,
  updatePasswordAndUseOtp,
} = require("../model/otpModel");
const { sendOtpEmail } = require("./otpEmailService");

// ──────────────────────────────────────
// Configuration — adjust these as needed
// ──────────────────────────────────────
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 15;
const MIN_PASSWORD_LENGTH = 6;

/**
 * Step 1: Request an OTP for password reset.
 * Generates a random numeric OTP, hashes it, stores it, and emails it.
 *
 * POST /forgot-password
 * Body: { email: string }
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist" });
    }

    // Generate a random numeric OTP
    const otpMin = Math.pow(10, OTP_LENGTH - 1);
    const otpMax = Math.pow(10, OTP_LENGTH) - 1;
    const otp = Math.floor(otpMin + Math.random() * (otpMax - otpMin + 1)).toString();

    // Hash the OTP before storing (never store plaintext)
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await createOtp({
      userId: user.id,
      otpHash,
      expiresAt,
    });

    await sendOtpEmail({
      to: normalizedEmail,
      otp,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });

    return res.status(200).json({ message: "OTP sent to email successfully" });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error during forgot password" });
  }
};

/**
 * Step 2: Verify the OTP code.
 * Checks expiration, attempt limits, and bcrypt comparison.
 *
 * POST /verify-otp
 * Body: { email: string, otp: string }
 */
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const activeOtp = await findLatestActiveOtpByUserId(user.id);
    if (!activeOtp) {
      return res
        .status(400)
        .json({ message: "No active password reset request found" });
    }

    // Check expiration
    if (new Date() > new Date(activeOtp.expires_at)) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Check attempt limit
    if (activeOtp.attempts >= activeOtp.max_attempts) {
      return res.status(400).json({
        message:
          "Too many incorrect OTP attempts. Please request a new one.",
      });
    }

    // Compare the provided OTP against the stored hash
    const isMatch = await bcrypt.compare(otp.trim(), activeOtp.otp_hash);
    if (!isMatch) {
      await incrementOtpAttempts(activeOtp.id);
      const remaining = activeOtp.max_attempts - (activeOtp.attempts + 1);
      return res.status(400).json({
        message:
          remaining > 0
            ? `Invalid OTP. ${remaining} attempts remaining.`
            : "Invalid OTP. Max attempts exceeded.",
      });
    }

    await markOtpVerified(activeOtp.id);
    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("Verify OTP error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error during OTP verification" });
  }
};

/**
 * Step 3: Reset the password using a verified OTP.
 * Re-validates the OTP and updates the user's password.
 *
 * POST /reset-password
 * Body: { email: string, otp: string, password: string }
 */
const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !otp || !password) {
    return res
      .status(400)
      .json({ message: "Email, OTP, and password are required" });
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
    });
  }

  try {
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const activeOtp = await findLatestActiveOtpByUserId(user.id);
    if (!activeOtp) {
      return res
        .status(400)
        .json({ message: "No active password reset request found" });
    }

    if (new Date() > new Date(activeOtp.expires_at)) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (activeOtp.attempts >= activeOtp.max_attempts) {
      return res.status(400).json({
        message:
          "Too many incorrect OTP attempts. Please request a new one.",
      });
    }

    const isMatch = await bcrypt.compare(otp.trim(), activeOtp.otp_hash);
    if (!isMatch) {
      await incrementOtpAttempts(activeOtp.id);
      const remaining = activeOtp.max_attempts - (activeOtp.attempts + 1);
      return res.status(400).json({
        message:
          remaining > 0
            ? `Invalid OTP. ${remaining} attempts remaining.`
            : "Invalid OTP. Max attempts exceeded.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await updatePasswordAndUseOtp({
      userId: user.id,
      otpId: activeOtp.id,
      passwordHash,
    });

    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error during password reset" });
  }
};

module.exports = { forgotPassword, verifyOtp, resetPassword };
