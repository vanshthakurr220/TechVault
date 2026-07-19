import express from "express";

import {
  createReview,
  getProductReviews,
  updateReview,
} from "../controllers/reviewController";
import { protect } from "server/middleware/authMiddleware";

const router = express.Router();

router.post("/create", createReview);

router.get("/product/:productId", getProductReviews);

router.put("/:reviewId", protect, updateReview);

export default router;
