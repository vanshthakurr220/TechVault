import express from "express";

import {
  signup,
  login,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  updateProfile,
  refreshToken,
  logout,
  getMe,
} from "../controllers/authController.js";
import {
  sendOTPSignup,
  verifyOTPSignup,
  sendOTPEmailChange,
  verifyOTPEmailChange,
  sendMobileOTPSignup,
  verifyMobileOTPSignup,
  sendOTPMobileChange,
  verifyOTPMobileChange,
} from "../controllers/otpController.js";
import { protect } from "server/middleware/authMiddleware.js";
import { authLimiter } from "server/middleware/rateLimiter.js";

const router = express.Router();

// OTP endpoints for signup
router.post("/send-otp-signup", authLimiter, sendOTPSignup);
router.post("/verify-otp-signup", authLimiter, verifyOTPSignup);

router.post("/send-mobile-otp-signup", authLimiter, sendMobileOTPSignup);
router.post("/verify-mobile-otp-signup", authLimiter, verifyMobileOTPSignup);

// OTP endpoints for email change
router.post("/send-otp-email-change", protect, sendOTPEmailChange);
router.post("/verify-otp-email-change", protect, verifyOTPEmailChange);

// OTP endpoints for mobile change
router.post("/send-otp-mobile-change", protect, sendOTPMobileChange);
router.post("/verify-otp-mobile-change", protect, verifyOTPMobileChange);

// Auth endpoints
router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);

router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.put("/profile", protect, updateProfile);

router.get("/me", protect, getMe);

// Address routes
router.get("/addresses", protect, getAddresses);
router.post("/add-address", protect, addAddress);
router.put("/update-address", protect, updateAddress);
router.delete("/delete-address/:addressId", protect, deleteAddress);
router.put("/set-default-address", protect, setDefaultAddress);

export default router;
