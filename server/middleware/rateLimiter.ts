import rateLimit from "express-rate-limit";

// ============================================================================
// PUBLIC APIs (Products, Cart, Wishlist, Orders, Reviews, Coupons)
// ============================================================================

export const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 50000,
  message: {
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================================================
// AUTH APIs (Login, Signup, OTP, Password Reset)
// ============================================================================

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: {
    message:
      "Too many authentication attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================================================
// REFRESH TOKEN API
// ============================================================================

export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  message: {
    message: "Too many session refresh requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================================================
// ADMIN APIs
// ============================================================================

export const adminApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: {
    message: "Too many admin requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================================================
// FILE UPLOAD APIs
// ============================================================================

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: {
    message: "Too many upload requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
