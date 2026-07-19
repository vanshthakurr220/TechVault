import { Request, Response } from "express";
import Review from "../models/Review";

export const createReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userEmail, productId, rating, comment } = req.body;

    if (!userEmail || !productId || !rating || !comment) {
      res.status(400).json({
        message: "All fields are required",
      });

      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({
        message: "Rating must be between 1 and 5",
      });

      return;
    }

    const existingReview = await Review.findOne({
      userEmail,
      productId,
    });

    if (existingReview) {
      res.status(400).json({
        message: "You already reviewed this product",
      });

      return;
    }

    const review = await Review.create({
      userEmail,
      productId,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create review",
    });
  }
};

export const getProductReviews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({
      productId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};


export const updateReview = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const { userEmail, rating, comment } = req.body;

    const normalizedEmail = String(userEmail || "").trim().toLowerCase();
    const normalizedRating = Number(rating);
    const normalizedComment = String(comment || "").trim();

    if (!reviewId) {
      res.status(400).json({
        success: false,
        message: "Review ID is required",
      });

      return;
    }

    if (!normalizedEmail) {
      res.status(400).json({
        success: false,
        message: "User email is required",
      });

      return;
    }

    if (!normalizedRating || !normalizedComment) {
      res.status(400).json({
        success: false,
        message: "Rating and comment are required",
      });

      return;
    }

    if (normalizedRating < 1 || normalizedRating > 5) {
      res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });

      return;
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      res.status(404).json({
        success: false,
        message: "Review not found",
      });

      return;
    }

    if (review.userEmail.toLowerCase() !== normalizedEmail) {
      res.status(403).json({
        success: false,
        message: "You can only edit your own review",
      });

      return;
    }

    review.rating = normalizedRating;
    review.comment = normalizedComment;

    await review.save();

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error("Update review error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update review",
    });
  }
};