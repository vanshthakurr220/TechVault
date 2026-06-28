import { Request, Response } from "express";
import Coupon from "../models/Coupon";

export const createCoupon = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const coupon = await Coupon.create(req.body);

    res.status(201).json({
      success: true,
      coupon,
    });
  } catch (error: any) {
    console.error("CREATE COUPON ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllCoupons = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const coupons = await Coupon.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      coupons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
    });
  }
};

export const deleteCoupon = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Coupon deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
    });
  }
};

export const updateCoupon = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json({
      success: true,
      coupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update coupon",
    });
  }
};

export const validateCoupon = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { code, subtotal } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (!coupon) {
      res.status(400).json({
        success: false,
        message: "Invalid coupon",
      });
      return;
    }

    if (!coupon.isActive) {
      res.status(400).json({
        success: false,
        message: "Coupon inactive",
      });
      return;
    }

    if (coupon.expiryDate < new Date()) {
      res.status(400).json({
        success: false,
        message: "Coupon expired",
      });
      return;
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      res.status(400).json({
        success: false,
        message: "Coupon usage limit reached",
      });
      return;
    }

    if (subtotal < coupon.minOrderAmount) {
      res.status(400).json({
        success: false,
        message: `Minimum order amount is ₹${coupon.minOrderAmount}`,
      });
      return;
    }

    let discount = (subtotal * coupon.discountPercentage) / 100;

    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }

    res.status(200).json({
      success: true,
      coupon,
      discount,
      finalAmount: subtotal - discount,
    });
  } catch (error) {
    console.error("Validate coupon error:", error);

    res.status(500).json({
      success: false,
      message: "Coupon validation failed",
    });
  }
};
