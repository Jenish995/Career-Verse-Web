/**
 * OTP Routes — Express router for password reset OTP endpoints.
 *
 * Mount this on your Express app:
 *   app.use('/api/auth', require('./otp-module/backend/routes/otpRoutes'));
 */
const express = require("express");
const router = express.Router();
const {
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("../controller/otpController");

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
