const express = require("express");
const router = express.Router();
const { register, login, forgotPassword, verifyOtp, resetPassword, changePassword } = require("../controller/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.put("/change-password", changePassword);

module.exports = router;