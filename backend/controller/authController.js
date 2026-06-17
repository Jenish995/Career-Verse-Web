const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  findUserByEmail,
  findCandidateByUserId,
  findRecruiterByUserId,
  createUserWithProfile,
} = require("../model/UserModel");

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

module.exports = { register, login };
