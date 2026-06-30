import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import helmet from "helmet";
import compression from "compression";
import hpp from "hpp";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

import {
  publicApiLimiter,
  adminApiLimiter,
  uploadLimiter,
} from "./middleware/rateLimiter.js";

import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(compression());
app.use(hpp());
app.use(morgan("dev"));

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

// ============================================================================
// AUTH ROUTES
// Individual auth routes (login, signup, OTP, refresh) should use their own
// limiters inside authRoutes.ts
// ============================================================================
app.use("/api/auth", authRoutes);

// ============================================================================
// PUBLIC ROUTES
// ============================================================================
app.use("/api/contact", publicApiLimiter, contactRoutes);

app.use("/api/products", publicApiLimiter, productRoutes);

app.use("/api/orders", publicApiLimiter, orderRoutes);

app.use("/api/cart", publicApiLimiter, cartRoutes);

app.use("/api/wishlist", publicApiLimiter, wishlistRoutes);

app.use("/api/reviews", publicApiLimiter, reviewRoutes);

app.use("/api/coupons", publicApiLimiter, couponRoutes);

// ============================================================================
// ADMIN ROUTES
// ============================================================================
app.use("/api/admin", adminApiLimiter, adminRoutes);

// ============================================================================
// FILE UPLOADS
// ============================================================================
app.use("/api/upload", uploadLimiter, uploadRoutes);

// ============================================================================
// ERROR HANDLERS
// ============================================================================
app.use(notFound);
app.use(errorHandler);

export default app;
