import { Request, Response } from "express";
import { Order } from "../models/Order.js";
import { User } from "server/models/User.js";
import Coupon from "server/models/Coupon.js";
import { Product } from "server/models/Products.js";
import {
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
} from "server/utils/emailService.js";
import CouponUsage from "server/models/CouponUsage.js";

// ===============================
// 🛒 PLACE ORDER
// ===============================

export const createOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, items, shippingAddress, paymentMethod, couponCode } =
      req.body;

    // =====================
    // VALIDATION
    // =====================

    if (
      !email ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !shippingAddress ||
      !paymentMethod
    ) {
      res.status(400).json({
        message: "Missing required fields",
      });

      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const payment = String(paymentMethod).toLowerCase();

    const validPaymentMethods = ["cod", "card", "upi"];

    if (!validPaymentMethods.includes(payment)) {
      res.status(400).json({
        message: "Invalid payment method",
      });

      return;
    }

    // =====================
    // VERIFY PRODUCTS
    // =====================

    const verifiedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        res.status(404).json({
          message: "Product not found",
        });

        return;
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        res.status(400).json({
          message: `Invalid quantity for ${product.name}`,
        });

        return;
      }

      if (product.stockQuantity < quantity) {
        res.status(400).json({
          message: `${product.name} has only ${product.stockQuantity} units available`,
        });

        return;
      }

      const productImages = Array.isArray(product.images)
        ? product.images.filter(
            (image): image is string =>
              typeof image === "string" && image.trim().length > 0,
          )
        : [];

      const legacyImage =
        typeof (product as any).image === "string" &&
        (product as any).image.trim().length > 0
          ? (product as any).image.trim()
          : "";

      verifiedItems.push({
        productId: product._id,
        name: product.name,
        category: String(product.category).trim().toLowerCase(),
        images:
          productImages.length > 0
            ? productImages
            : legacyImage
              ? [legacyImage]
              : [],
        price: Number(product.price),
        quantity,
      });
    }

    // =====================
    // CALCULATE TOTAL
    // =====================

    const subtotal = verifiedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    let validatedCoupon: InstanceType<typeof Coupon> | null = null;

    let normalizedCouponCode = "";

    let calculatedCouponDiscount = 0;

    if (couponCode) {
      normalizedCouponCode = String(couponCode).trim().toUpperCase();

      validatedCoupon = await Coupon.findOne({
        code: normalizedCouponCode,
      });

      if (!validatedCoupon) {
        res.status(400).json({
          message: "Invalid coupon",
        });

        return;
      }

      if (!validatedCoupon.isActive) {
        res.status(400).json({
          message: "Coupon is inactive",
        });

        return;
      }

      if (validatedCoupon.expiryDate < new Date()) {
        res.status(400).json({
          message: "Coupon has expired",
        });

        return;
      }

      if (validatedCoupon.usedCount >= validatedCoupon.usageLimit) {
        res.status(400).json({
          message: "Coupon usage limit reached",
        });

        return;
      }

      if (subtotal < validatedCoupon.minOrderAmount) {
        res.status(400).json({
          message: `Minimum order amount is ₹${validatedCoupon.minOrderAmount}`,
        });

        return;
      }

      // =====================
      // CHECK CATEGORY RULES
      // =====================

      const applicableCategories = Array.isArray(
        validatedCoupon.applicableCategories,
      )
        ? validatedCoupon.applicableCategories
            .map((category: string) => String(category).trim().toLowerCase())
            .filter(Boolean)
        : [];

      if (applicableCategories.length > 0) {
        const hasEligibleProduct = verifiedItems.some((item) =>
          applicableCategories.includes(item.category),
        );

        if (!hasEligibleProduct) {
          res.status(400).json({
            message:
              "This coupon is not applicable to the products in your cart",
          });

          return;
        }
      }

      if (validatedCoupon.couponType === "WELCOME") {
        const existingUsage = await CouponUsage.findOne({
          couponId: validatedCoupon._id,
          userEmail: normalizedEmail,
        });

        if (existingUsage) {
          res.status(400).json({
            message: "You have already used this welcome coupon",
          });

          return;
        }
      }

      calculatedCouponDiscount =
        (subtotal * validatedCoupon.discountPercentage) / 100;

      if (
        validatedCoupon.maxDiscount !== undefined &&
        validatedCoupon.maxDiscount !== null &&
        calculatedCouponDiscount > validatedCoupon.maxDiscount
      ) {
        calculatedCouponDiscount = validatedCoupon.maxDiscount;
      }

      calculatedCouponDiscount = Number(calculatedCouponDiscount.toFixed(2));
    }

    const totalAmount = Number(
      Math.max(0, subtotal - calculatedCouponDiscount).toFixed(2),
    );

    // =====================
    // CREATE ORDER
    // =====================

    const order = await Order.create({
      userId: normalizedEmail,

      items: verifiedItems,

      totalAmount,

      couponCode: normalizedCouponCode,

      couponDiscount: calculatedCouponDiscount,

      shippingAddress,

      paymentMethod: payment,

      paymentStatus: "pending",

      status: "pending",
    });

    // =====================
    // RECORD COUPON USAGE
    // =====================

    const couponToUse = validatedCoupon;

    if (couponToUse !== null) {
      const couponId = couponToUse._id;

      if (couponToUse.couponType === "WELCOME") {
        try {
          await CouponUsage.create({
            couponId,
            couponCode: couponToUse.code,
            userEmail: normalizedEmail,
            orderId: order._id,
          });
        } catch (usageError: any) {
          await Order.findByIdAndDelete(order._id);

          if (usageError?.code === 11000) {
            res.status(400).json({
              message: "You have already used this welcome coupon",
            });

            return;
          }

          throw usageError;
        }
      }

      await Coupon.findByIdAndUpdate(couponId, {
        $inc: {
          usedCount: 1,
        },
      });
    }

    // =====================
    // UPDATE PRODUCTS
    // =====================

    for (const item of verifiedItems) {
      const product = await Product.findById(item.productId);

      if (!product) continue;

      product.stockQuantity = Math.max(
        0,
        product.stockQuantity - item.quantity,
      );

      product.inStock = product.stockQuantity > 0;

      product.unitsSold = (product.unitsSold || 0) + item.quantity;

      product.revenue = (product.revenue || 0) + item.quantity * item.price;

      await product.save();
    }

    // =====================
    // SEND EMAIL
    // =====================

    try {
      await sendOrderConfirmationEmail(
        email,
        shippingAddress.fullName || "Customer",
        order,
      );
    } catch (emailError) {
      console.error("Order placed but email failed:", emailError);
    }

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      message: "Failed to place order",
    });
  }
};

// ===============================
// 📦 GET ORDERS OF SINGLE USER
// ===============================
export const getUserOrders = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });

      return;
    }

    const orders = await Order.find({
      userId: user.email,
    })
      .sort({ createdAt: -1 })
      .populate("items.productId", "name images").select(`
  items
  totalAmount
  couponCode
  couponDiscount
  status
  statusHistory
  paymentStatus
  paymentMethod
  shippingAddress
  createdAt
`);

    res.status(200).json({
      message: "User orders fetched successfully",
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch user orders",
    });
  }
};

// ===============================
// 📖 GET ALL ORDERS (ADMIN)
// ===============================
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "All orders fetched",
      orders,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};


