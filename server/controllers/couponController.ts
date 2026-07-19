import { Request, Response } from "express";
import Coupon from "../models/Coupon";
import CouponUsage from "server/models/CouponUsage";
import { Product } from "server/models/Products";

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
    const { code, subtotal, email, items } = req.body;

    if (!code || subtotal === undefined || subtotal === null) {
      res.status(400).json({
        success: false,
        message: "Coupon code and subtotal are required",
      });

      return;
    }

    const normalizedCode = String(code).trim().toUpperCase();

    const normalizedEmail = email ? String(email).trim().toLowerCase() : "";

    const numericSubtotal = Number(subtotal);

    if (!Number.isFinite(numericSubtotal) || numericSubtotal < 0) {
      res.status(400).json({
        success: false,
        message: "Invalid subtotal",
      });

      return;
    }

    const coupon = await Coupon.findOne({
      code: normalizedCode,
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
        message: "Coupon is inactive",
      });

      return;
    }

    if (coupon.expiryDate < new Date()) {
      res.status(400).json({
        success: false,
        message: "Coupon has expired",
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

    if (numericSubtotal < coupon.minOrderAmount) {
      res.status(400).json({
        success: false,
        message: `Minimum order amount is ₹${coupon.minOrderAmount}`,
      });

      return;
    }

    // ==========================================
    // CHECK CATEGORY RESTRICTIONS
    // ==========================================

    const applicableCategories = Array.isArray(coupon.applicableCategories)
      ? coupon.applicableCategories
          .map((category) => String(category).trim().toLowerCase())
          .filter(Boolean)
      : [];

    if (applicableCategories.length > 0) {
      if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json({
          success: false,
          message: "Cart items are required to validate this coupon",
        });

        return;
      }

      const productIds = items
        .map((item: any) => item?.productId)
        .filter(Boolean);

      if (productIds.length === 0) {
        res.status(400).json({
          success: false,
          message: "Valid product IDs are required to validate this coupon",
        });

        return;
      }

      const products = await Product.find({
        _id: {
          $in: productIds,
        },
      }).select("category");

      if (products.length !== productIds.length) {
        res.status(400).json({
          success: false,
          message: "One or more cart products are invalid",
        });

        return;
      }

      const cartCategories = products.map((product) =>
        String(product.category).trim().toLowerCase(),
      );

      const hasEligibleProduct = cartCategories.some((category) =>
        applicableCategories.includes(category),
      );

      if (!hasEligibleProduct) {
        res.status(400).json({
          success: false,
          message: "This coupon is not applicable to the products in your cart",
        });

        return;
      }
    }

    // ==========================================
    // CHECK WELCOME COUPON USAGE
    // ==========================================

    if (coupon.couponType === "WELCOME") {
      if (!normalizedEmail) {
        res.status(400).json({
          success: false,
          message: "Email is required for welcome coupons",
        });

        return;
      }

      const existingUsage = await CouponUsage.findOne({
        couponId: coupon._id,
        userEmail: normalizedEmail,
      });

      if (existingUsage) {
        res.status(400).json({
          success: false,
          message: "You have already used this welcome coupon",
        });

        return;
      }
    }

    // ==========================================
    // CALCULATE DISCOUNT
    // ==========================================

    let discount = (numericSubtotal * coupon.discountPercentage) / 100;

    if (
      coupon.maxDiscount !== undefined &&
      coupon.maxDiscount !== null &&
      discount > coupon.maxDiscount
    ) {
      discount = coupon.maxDiscount;
    }

    discount = Number(discount.toFixed(2));

    const finalAmount = Number(
      Math.max(0, numericSubtotal - discount).toFixed(2),
    );

    res.status(200).json({
      success: true,
      coupon,
      discount,
      finalAmount,
    });
  } catch (error) {
    console.error("Validate coupon error:", error);

    res.status(500).json({
      success: false,
      message: "Coupon validation failed",
    });
  }
};

export const getEligibleCoupons = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, items, subtotal } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: "Cart items are required",
      });

      return;
    }

    const numericSubtotal = Number(subtotal);

    if (!Number.isFinite(numericSubtotal) || numericSubtotal < 0) {
      res.status(400).json({
        success: false,
        message: "Invalid subtotal",
      });

      return;
    }

    const normalizedEmail = email
      ? String(email).trim().toLowerCase()
      : "";

    const productIds = items
      .map((item: any) => item?.productId)
      .filter(Boolean);

    if (productIds.length === 0) {
      res.status(400).json({
        success: false,
        message: "Valid product IDs are required",
      });

      return;
    }

    const products = await Product.find({
      _id: {
        $in: productIds,
      },
    }).select("category");

    if (products.length !== productIds.length) {
      res.status(400).json({
        success: false,
        message: "One or more cart products are invalid",
      });

      return;
    }

    const cartCategories = products.map((product) =>
      String(product.category).trim().toLowerCase(),
    );

    const currentDate = new Date();

    const coupons = await Coupon.find({
      isActive: true,

      expiryDate: {
        $gte: currentDate,
      },

      $expr: {
        $lt: ["$usedCount", "$usageLimit"],
      },

      minOrderAmount: {
        $lte: numericSubtotal,
      },
    }).sort({
      discountPercentage: -1,
      createdAt: -1,
    });

    const welcomeCouponIds = coupons
      .filter((coupon) => coupon.couponType === "WELCOME")
      .map((coupon) => coupon._id);

    const usedWelcomeCouponIds = normalizedEmail
      ? await CouponUsage.find({
          userEmail: normalizedEmail,

          couponId: {
            $in: welcomeCouponIds,
          },
        }).distinct("couponId")
      : [];

    const usedWelcomeCouponIdSet = new Set(
      usedWelcomeCouponIds.map((couponId) => couponId.toString()),
    );

    const eligibleCoupons = coupons
      .filter((coupon) => {
        const applicableCategories = Array.isArray(
          coupon.applicableCategories,
        )
          ? coupon.applicableCategories
              .map((category: string) =>
                String(category).trim().toLowerCase(),
              )
              .filter(Boolean)
          : [];

        const categoryMatches =
          applicableCategories.length === 0 ||
          cartCategories.some((category) =>
            applicableCategories.includes(category),
          );

        if (!categoryMatches) {
          return false;
        }

        if (coupon.couponType === "WELCOME") {
          if (!normalizedEmail) {
            return false;
          }

          if (
            usedWelcomeCouponIdSet.has(
              coupon._id.toString(),
            )
          ) {
            return false;
          }
        }

        return true;
      })
      .map((coupon) => {
        let discount =
          (numericSubtotal * coupon.discountPercentage) / 100;

        if (
          coupon.maxDiscount !== undefined &&
          coupon.maxDiscount !== null &&
          discount > coupon.maxDiscount
        ) {
          discount = coupon.maxDiscount;
        }

        discount = Number(discount.toFixed(2));

        return {
          _id: coupon._id,
          code: coupon.code,
          couponType: coupon.couponType,
          discountPercentage: coupon.discountPercentage,
          minOrderAmount: coupon.minOrderAmount,
          maxDiscount: coupon.maxDiscount,
          applicableCategories: coupon.applicableCategories,
          expiryDate: coupon.expiryDate,
          discount,
          finalAmount: Number(
            Math.max(0, numericSubtotal - discount).toFixed(2),
          ),
        };
      });

    res.status(200).json({
      success: true,
      count: eligibleCoupons.length,
      coupons: eligibleCoupons,
    });
  } catch (error) {
    console.error("Get eligible coupons error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch eligible coupons",
    });
  }
};
