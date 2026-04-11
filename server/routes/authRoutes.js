import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getMe,
  login,
  register,
  resendOtp,
  requestChangePasswordOtp,
  requestForgotPasswordOtp,
  resetPasswordWithOtp,
  verifyChangePasswordOtp,
  verifyLoginOtp,
  verifyRegisterOtp,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-register-otp", verifyRegisterOtp);
router.post("/login", login);
router.post("/verify-login-otp", verifyLoginOtp);
router.post("/forgot-password/request-otp", requestForgotPasswordOtp);
router.post("/forgot-password/reset", resetPasswordWithOtp);
router.post("/resend-otp", resendOtp);
router.get("/me", protect, getMe);
router.post("/change-password/request-otp", protect, requestChangePasswordOtp);
router.post("/change-password/verify", protect, verifyChangePasswordOtp);

export default router;
