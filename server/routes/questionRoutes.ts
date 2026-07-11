import express from "express";

import {
  askProductQuestion,
  getProductQuestions,
  voteOnAnswer,
} from "../controllers/questionController.js";

import { optionalProtect, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: get all visible questions for one product
router.get("/:productId", optionalProtect, getProductQuestions);

// Logged-in user: ask a product question
router.post("/ask", protect, askProductQuestion);

// Logged-in user: like or dislike an admin answer
router.put("/:questionId/vote", protect, voteOnAnswer);

export default router;
