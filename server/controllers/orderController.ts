import { Request, Response } from "express";
import { Order } from "../models/Order.js";
import { User } from "server/models/User.js";
import Coupon from "server/models/Coupon.js";
import { Product } from "server/models/Products.js";
import { sendOrderConfirmationEmail } from "server/utils/emailService.js";

// ===============================
// 🛒 PLACE ORDER
// ===============================

export const createOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      email,
      items,
      shippingAddress,
      paymentMethod,
      couponCode,
      couponDiscount,
    } = req.body;

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

    const normalizedCouponDiscount = Math.max(0, Number(couponDiscount || 0));

    const totalAmount = Math.max(0, subtotal - normalizedCouponDiscount);

    // =====================
    // CREATE ORDER
    // =====================

    const order = await Order.create({
      userId: email,

      items: verifiedItems,

      totalAmount,

      couponCode: couponCode ? String(couponCode).trim().toUpperCase() : "",

      couponDiscount: normalizedCouponDiscount,

      shippingAddress,

      paymentMethod: payment,

      paymentStatus: "pending",

      status: "pending",
    });

    // =====================
    // UPDATE COUPON
    // =====================

    if (couponCode) {
      await Coupon.findOneAndUpdate(
        {
          code: String(couponCode).trim().toUpperCase(),
        },
        {
          $inc: {
            usedCount: 1,
          },
        },
      );
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
      .populate("items.productId", "name images")
      .select(`
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
`)

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

// ===============================
// 🟢 UPDATE ORDER STATUS
// ===============================
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status, paymentStatus },
      { new: true },
    );

    if (!updatedOrder) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update order",
    });
  }
};

// ===============================
// 🗑️ DELETE ORDER
// ===============================
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order deleted successfully",
      order: deletedOrder,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete order",
    });
  }
};
