import { Request, Response } from "express";
import mongoose from "mongoose";
import ProductQuestion from "../models/ProductQuestion.js";
import { Product } from "../models/Products.js";
import { AuthRequest, OptionalAuthRequest } from "../middleware/authMiddleware.js";

// ======================================================
// ASK A PRODUCT QUESTION
// Logged-in customer only
// ======================================================

export const askProductQuestion = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { productId, question } = req.body;
    const userId = req.userId;

    if (!productId || !question?.trim()) {
      res.status(400).json({
        success: false,
        message: "Product ID and question are required",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
      return;
    }

    const cleanedQuestion = question.trim();

    if (cleanedQuestion.length < 5) {
      res.status(400).json({
        success: false,
        message: "Question must contain at least 5 characters",
      });
      return;
    }

    if (cleanedQuestion.length > 1000) {
      res.status(400).json({
        success: false,
        message: "Question cannot exceed 1000 characters",
      });
      return;
    }

    const productExists = await Product.exists({
      _id: productId,
    });

    if (!productExists) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    const newQuestion = await ProductQuestion.create({
      productId,
      userId,
      question: cleanedQuestion,
      status: "pending",
      likes: [],
      dislikes: [],
      isVisible: true,
      isPinned: false,
    });

    const populatedQuestion = await ProductQuestion.findById(
      newQuestion._id,
    ).populate("userId", "username");

    res.status(201).json({
      success: true,
      message: "Question submitted successfully",
      question: populatedQuestion,
    });
  } catch (error) {
    console.error("Ask product question error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit question",
    });
  }
};

// ======================================================
// GET QUESTIONS FOR ONE PRODUCT
// Public route
// ======================================================

export const getProductQuestions = async (
  req: OptionalAuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { productId } = req.params;
    const currentUserId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
      return;
    }

    const questions = await ProductQuestion.find({
      productId,
      isVisible: true,
    })
      .populate("userId", "username")
      .populate("answeredBy", "username")
      .sort({
        isPinned: -1,
        createdAt: -1,
      })
      .lean();

    const formattedQuestions = questions.map((item) => {
      const hasLiked =
        !!currentUserId &&
        item.likes?.some((id) => id.toString() === currentUserId.toString());

      const hasDisliked =
        !!currentUserId &&
        item.dislikes?.some((id) => id.toString() === currentUserId.toString());

      let userVote: "like" | "dislike" | null = null;

      if (hasLiked) {
        userVote = "like";
      } else if (hasDisliked) {
        userVote = "dislike";
      }

      return {
        ...item,
        likesCount: item.likes?.length || 0,
        dislikesCount: item.dislikes?.length || 0,
        userVote,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedQuestions.length,
      questions: formattedQuestions,
    });
  } catch (error) {
    console.error("Fetch product questions error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product questions",
    });
  }
};

// ======================================================
// VOTE ON ADMIN ANSWER
// Logged-in user only
// voteType must be "like" or "dislike"
// ======================================================

export const voteOnAnswer = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { questionId } = req.params;
    const { voteType } = req.body;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
      return;
    }

    if (!["like", "dislike"].includes(voteType)) {
      res.status(400).json({
        success: false,
        message: "Vote type must be like or dislike",
      });
      return;
    }

    const productQuestion = await ProductQuestion.findById(questionId);

    if (!productQuestion) {
      res.status(404).json({
        success: false,
        message: "Question not found",
      });
      return;
    }

    if (
      productQuestion.status !== "answered" ||
      !productQuestion.answer?.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "You can vote only after the admin has answered",
      });
      return;
    }

    if (!productQuestion.isVisible) {
      res.status(400).json({
        success: false,
        message: "This question is not available",
      });
      return;
    }

    const hasLiked = productQuestion.likes.some(
      (id: mongoose.Types.ObjectId) => id.toString() === userId,
    );

    const hasDisliked = productQuestion.dislikes.some(
      (id: mongoose.Types.ObjectId) => id.toString() === userId,
    );

    let userVote: "like" | "dislike" | null = null;

    if (voteType === "like") {
      if (hasLiked) {
        // Clicking like again removes the vote
        productQuestion.likes = productQuestion.likes.filter(
          (id: mongoose.Types.ObjectId) => id.toString() !== userId,
        );

        userVote = null;
      } else {
        // Add like and remove existing dislike
        productQuestion.likes.push(new mongoose.Types.ObjectId(userId));

        productQuestion.dislikes = productQuestion.dislikes.filter(
          (id: mongoose.Types.ObjectId) => id.toString() !== userId,
        );

        userVote = "like";
      }
    }

    if (voteType === "dislike") {
      if (hasDisliked) {
        // Clicking dislike again removes the vote
        productQuestion.dislikes = productQuestion.dislikes.filter(
          (id: mongoose.Types.ObjectId) => id.toString() !== userId,
        );

        userVote = null;
      } else {
        // Add dislike and remove existing like
        productQuestion.dislikes.push(new mongoose.Types.ObjectId(userId));

        productQuestion.likes = productQuestion.likes.filter(
          (id: mongoose.Types.ObjectId) => id.toString() !== userId,
        );

        userVote = "dislike";
      }
    }

    await productQuestion.save();

    res.status(200).json({
      success: true,
      message:
        userVote === null
          ? "Vote removed successfully"
          : "Vote recorded successfully",
      likesCount: productQuestion.likes.length,
      dislikesCount: productQuestion.dislikes.length,
      userVote,
    });
  } catch (error) {
    console.error("Vote on answer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to record vote",
    });
  }
};
