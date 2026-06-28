import express from "express";

import {
  createReview,
  getProductReviews,
} from "../controllers/reviewController";

const router = express.Router();

router.post("/create", createReview);

router.get("/product/:productId", getProductReviews);


export default router;
