import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import helmet from "helmet";
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
import { apiLimiter } from "./middleware/rateLimiter.js";
import compression from "compression";
import hpp from "hpp";
import morgan from "morgan";
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

app.use(apiLimiter);
app.use("/api/auth", authRoutes);

app.use("/api/contact", contactRoutes);

app.use("/api/products", productRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/wishlist", wishlistRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/coupons", couponRoutes);

app.use("/api/upload", uploadRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
