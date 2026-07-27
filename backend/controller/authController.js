const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  findUserByEmail,
  findUserById,
  findCandidateByUserId,
  findRecruiterByUserId,
  createUserWithProfile,
  updateUserPassword,
} = require("../model/UserModel");
const {
  createPasswordResetOtp,
  findLatestActiveOtpByUserId,
  incrementOtpAttempts,
  markOtpVerified,
  updatePasswordAndUseOtp,
} = require("../model/PasswordResetModel");
const { sendPasswordResetOtp } = require("./emailController");

const VALID_ROLES = new Set(["candidate", "recruiter"]);

const signToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || "career_verse_secret",
    { expiresIn: "24h" },
  );

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  created_at: user.created_at,
  updated_at: user.updated_at,
});

const register = async (req, res) => {
  const { email, password, role, fullName, companyName, companyLocation } =
    req.body;

  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedRole = role?.trim().toLowerCase();

  if (!normalizedEmail || !password || !normalizedRole) {
    return res.status(400).json({
      message: "Email, password, and role are required",
    });
  }

  if (!VALID_ROLES.has(normalizedRole)) {
    return res.status(400).json({
      message: "Role must be either candidate or recruiter",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long",
    });
  }

  if (!fullName?.trim()) {
    return res.status(400).json({
      message:
        normalizedRole === "candidate"
          ? "Full name is required for candidate registration"
          : "Recruiter name is required for recruiter registration",
    });
  }

  if (normalizedRole === "recruiter" && !companyName?.trim()) {
    return res.status(400).json({
      message: "Company name is required for recruiter registration",
    });
  }

  try {
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { user, profile } = await createUserWithProfile({
      email: normalizedEmail,
      passwordHash,
      role: normalizedRole,
      fullName: fullName?.trim(),
      companyName: companyName?.trim(),
      companyLocation: companyLocation?.trim(),
    });

    const token = signToken(user);

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: sanitizeUser(user),
      profile,
    });
  } catch (err) {
    console.error("Registration error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error during registration" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  try {
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    let profile = null;

    if (user.role === "candidate") {
      profile = await findCandidateByUserId(user.id);
    } else if (user.role === "recruiter") {
      profile = await findRecruiterByUserId(user.id);
    }

    return res.status(200).json({
      message: "Login successful",
      token,
      user: sanitizeUser(user),
      profile,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ message: "Server error during login" });
  }
};

const forgotPassword = async (req, res) => {
  console.log("=> /api/auth/forgot-password HIT! Body:", req.body);
  const { email } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist" });
    }

    // Generate dynamic 6-digit numeric OTP for presentation
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`\n========================================`);
    console.log(`🔑 OTP GENERATED FOR ${normalizedEmail}: ${otp}`);
    console.log(`========================================\n`);
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresInMinutes = 15;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    await createPasswordResetOtp({
      userId: user.id,
      otpHash,
      expiresAt,
    });

    await sendPasswordResetOtp({
      to: normalizedEmail,
      otp,
      expiresInMinutes,
    });

    return res.status(200).json({ message: "OTP sent to email successfully" });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    return res.status(500).json({ message: "Server error during forgot password" });
  }
};

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
      return res.status(400).json({ message: "No active password reset request found" });
    }

    if (new Date() > new Date(activeOtp.expires_at)) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (activeOtp.attempts >= activeOtp.max_attempts) {
      return res.status(400).json({ message: "Too many incorrect OTP attempts. Please request a new one." });
    }

    const isMatch = await bcrypt.compare(otp.trim(), activeOtp.otp_hash);
    if (!isMatch) {
      await incrementOtpAttempts(activeOtp.id);
      const remaining = activeOtp.max_attempts - (activeOtp.attempts + 1);
      return res.status(400).json({
        message: remaining > 0
          ? `Invalid OTP. ${remaining} attempts remaining.`
          : "Invalid OTP. Max attempts exceeded."
      });
    }

    await markOtpVerified(activeOtp.id);
    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("Verify OTP error:", err.message);
    return res.status(500).json({ message: "Server error during OTP verification" });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !otp || !password) {
    return res.status(400).json({ message: "Email, OTP, and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  try {
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const activeOtp = await findLatestActiveOtpByUserId(user.id);
    if (!activeOtp) {
      return res.status(400).json({ message: "No active password reset request found" });
    }

    if (new Date() > new Date(activeOtp.expires_at)) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (activeOtp.attempts >= activeOtp.max_attempts) {
      return res.status(400).json({ message: "Too many incorrect OTP attempts. Please request a new one." });
    }

    const isMatch = await bcrypt.compare(otp.trim(), activeOtp.otp_hash);
    if (!isMatch) {
      await incrementOtpAttempts(activeOtp.id);
      const remaining = activeOtp.max_attempts - (activeOtp.attempts + 1);
      return res.status(400).json({
        message: remaining > 0
          ? `Invalid OTP. ${remaining} attempts remaining.`
          : "Invalid OTP. Max attempts exceeded."
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
    return res.status(500).json({ message: "Server error during password reset" });
  }
};

const changePassword = async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      message: "New password must be at least 6 characters long",
    });
  }

  try {
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(userId, passwordHash);

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error during password change" });
  }
};

module.exports = { register, login, forgotPassword, verifyOtp, resetPassword, changePassword };
