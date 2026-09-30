const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const { authLimiter, emailLimiter } = require("../middlewares/rateLimiterMiddleware")

router.post("/register", emailLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/logout", protect, authController.logout);
router.patch("/change-password", protect, authLimiter, authController.changePassword);
router.post("/forget-password", emailLimiter, authController.forgotPassword);
router.post(
  "/verify-reset-password-otp",
  authLimiter,
  authController.verifyResetPasswordOTP,
);
router.patch("/reset-password", authLimiter, authController.resetPassword);
router.post("/refresh-token", authController.createRefreshToken);
router.post("/verify-email", authLimiter, authController.verifyEmail);
router.post("/resend-verify-email", emailLimiter, authController.resendVerifyEmail);

module.exports = router;
