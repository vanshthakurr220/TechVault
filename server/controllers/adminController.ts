import { Request, Response } from "express";

import { Contact } from "../models/Contact.js";
import { Order } from "../models/Order.js";
import { Product } from "server/models/Products.js";
import { User } from "server/models/User.js";
import Review from "server/models/Review.js";

// ===================================
// CONTACTS
// ===================================

// ===============================
// 📧 REPLY TO CONTACT MESSAGE
// ===============================
export const replyToContactMessage = async (req: Request, res: Response) => {
  try {
    const { contactId, replyMessage } = req.body;

    if (!contactId || !replyMessage?.trim()) {
      return res.status(400).json({
        message: "Contact ID and reply message are required",
      });
    }

    const contact = await Contact.findById(contactId);

    if (!contact) {
      return res.status(404).json({
        message: "Contact message not found",
      });
    }

    const emailSent = await sendContactReplyEmail(
      contact.email,
      contact.name,
      contact.message,
      replyMessage,
    );

    if (!emailSent) {
      return res.status(500).json({
        message: "Failed to send reply email",
      });
    }

    contact.replies.push({
      message: replyMessage,
    });

    contact.isRead = true;

    await contact.save();

    res.status(200).json({
      message: "Reply sent successfully",
      contact,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET ALL CONTACTS
export const getAllContacts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Contacts fetched successfully",
      contacts,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// MARK CONTACT AS READ
export const markContactRead = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      {
        isRead: true,
      },
      {
        new: true,
      },
    );

    if (!updatedContact) {
      res.status(404).json({
        message: "Contact not found",
      });

      return;
    }

    res.status(200).json({
      message: "Contact marked as read",
      contact: updatedContact,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// DELETE CONTACT
export const removeContact = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      res.status(404).json({
        message: "Contact not found",
      });

      return;
    }

    res.status(200).json({
      message: "Contact deleted successfully",
      contact: deletedContact,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ===================================
// ORDERS
// ===================================

// GET ALL ORDERS
export const getAdminOrders = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const orders = await Order.find().populate("userId", "name email").sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};

// DELETE ORDER
export const removeOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      res.status(404).json({
        message: "Order not found",
      });

      return;
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

// ===================================
// Products
// ===================================

export const getAdminProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
};

// ADD product
export const addProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const productData = {
      ...req.body,
      inStock: req.body.stockQuantity > 0,
    };

    const product = await Product.create(productData);

    res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    console.log("BODY:", req.body);

    res.status(500).json({
      message: "Failed to add product",
    });
  }
};

// ===============================
// DELETE PRODUCT
// ===============================
export const deleteProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      res.status(404).json({
        message: "Product not found",
      });
      return;
    }

    res.json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
    });
  }
};

// ===============================
// UPDATE PRODUCT
// ===============================
export const updateProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const updateData = {
      ...req.body,
    };

    if (updateData.stockQuantity !== undefined) {
      updateData.inStock = updateData.stockQuantity > 0;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      res.status(404).json({
        message: "Product not found",
      });
      return;
    }

    res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
    });
  }
};

//USER
// ===============================
// MARK USER AS ADMIN
// ===============================
export const markAsAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { role: "admin" },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User promoted to admin successfully",
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const removeAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { role: "user" },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Admin removed successfully",
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find()
      .select("username email mobile role createdAt addresses")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ===================================
// ORDERS
// ===================================

// FETCH ALL ORDERS
export const fetchAllOrders = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const orders = await Order.find()
      .populate("userId", "username email name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};

// CHANGE ORDER STATUS
type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

const validOrderStatuses: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const allowedOrderStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const orderStatusHistoryFields: Record<
  OrderStatus,
  "pendingAt" | "processingAt" | "shippedAt" | "deliveredAt" | "cancelledAt"
> = {
  pending: "pendingAt",
  processing: "processingAt",
  shipped: "shippedAt",
  delivered: "deliveredAt",
  cancelled: "cancelledAt",
};

// ===============================
// CHANGE ORDER STATUS
// ===============================
export const changeStatusOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id, status } = req.body;

    if (!id) {
      res.status(400).json({
        message: "Order ID is required",
      });

      return;
    }

    const requestedStatus = String(status || "")
      .trim()
      .toLowerCase() as OrderStatus;

    if (!requestedStatus) {
      res.status(400).json({
        message: "Order status is required",
      });

      return;
    }

    if (!validOrderStatuses.includes(requestedStatus)) {
      res.status(400).json({
        message: "Invalid order status",
        validStatuses: validOrderStatuses,
      });

      return;
    }

    const order = await Order.findById(id).populate(
      "userId",
      "username email name",
    );

    if (!order) {
      res.status(404).json({
        message: "Order not found",
      });

      return;
    }

    const previousStatus = order.status as OrderStatus;

    if (previousStatus === requestedStatus) {
      res.status(400).json({
        message: `Order is already ${requestedStatus}`,
        currentStatus: previousStatus,
        allowedNextStatuses:
          allowedOrderStatusTransitions[previousStatus] || [],
      });

      return;
    }

    const allowedNextStatuses =
      allowedOrderStatusTransitions[previousStatus] || [];

    if (!allowedNextStatuses.includes(requestedStatus)) {
      res.status(400).json({
        message: `Order status cannot be changed from ${previousStatus} to ${requestedStatus}`,
        currentStatus: previousStatus,
        allowedNextStatuses,
      });

      return;
    }

    order.status = requestedStatus;

    if (!order.statusHistory) {
      order.statusHistory = {};
    }

    const historyField = orderStatusHistoryFields[requestedStatus];

    if (!order.statusHistory[historyField]) {
      order.statusHistory[historyField] = new Date();
    }

    // COD orders become paid after successful delivery.
    if (
      requestedStatus === "delivered" &&
      order.paymentMethod === "cod" &&
      order.paymentStatus !== "paid"
    ) {
      order.paymentStatus = "paid";
    }

    await order.save();

    try {
      const populatedUser = order.userId as any;

      const customerEmail =
        populatedUser?.email ||
        (typeof order.userId === "string" ? order.userId : "");

      const customerName =
        populatedUser?.username ||
        populatedUser?.name ||
        order.shippingAddress?.fullName ||
        "Customer";

      if (customerEmail) {
        const emailSent = await sendOrderStatusEmail(
          customerEmail,
          customerName,
          order,
          requestedStatus,
        );

        if (!emailSent) {
          console.error(
            `Order ${order._id} status updated, but email could not be sent`,
          );
        }
      } else {
        console.warn(
          `Order ${order._id} status updated, but customer email was unavailable`,
        );
      }
    } catch (emailError) {
      console.error(
        "Order status updated successfully, but email failed:",
        emailError,
      );
    }

    res.status(200).json({
      message: `Order status changed from ${previousStatus} to ${requestedStatus}`,
      previousStatus,
      currentStatus: requestedStatus,
      allowedNextStatuses: allowedOrderStatusTransitions[requestedStatus] || [],
      order,
    });
  } catch (error: any) {
    console.error("Change order status error:", error);

    if (error?.name === "CastError") {
      res.status(400).json({
        message: "Invalid order ID",
      });

      return;
    }

    res.status(500).json({
      message: "Failed to update order status",
    });
  }
};

export const changePaymentStatusOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id, paymentStatus } = req.body;

    const allowedPaymentStatuses = ["pending", "paid", "failed"];

    if (!allowedPaymentStatuses.includes(paymentStatus)) {
      res.status(400).json({
        message: "Invalid payment status",
      });

      return;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        paymentStatus,
      },
      {
        new: true,
      },
    ).populate("userId", "username email");

    if (!updatedOrder) {
      res.status(404).json({
        message: "Order not found",
      });

      return;
    }

    res.status(200).json({
      message: "Payment status updated successfully",

      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update payment status",
    });
  }
};

export const getAllReviews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const reviews = await Review.find()
      .populate("productId", "name images category")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

import { Wishlist } from "../models/Wishlist";
import {
  sendContactReplyEmail,
  sendOrderStatusEmail,
  sendProductQuestionReplyEmail,
} from "server/utils/emailService.js";
import ProductQuestion from "server/models/ProductQuestion.js";

export const getAllWishlists = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const wishlists = await Wishlist.find()
      .populate("userId", "username email")
      .populate("items.productId", "name images category price brand inStock")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      wishlists,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlists",
    });
  }
};

// ===================================
// Product Question
// ===================================
export const getAllProductQuestions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const questions = await ProductQuestion.find()
      .populate("productId", "name images category")
      .populate("userId", "username email")
      .populate("answeredBy", "username")
      .sort({
        isPinned: -1,
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product questions",
    });
  }
};

export const replyProductQuestion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    const adminId = (req as any).userId;
    const cleanedAnswer = answer?.trim();

    if (!cleanedAnswer) {
      res.status(400).json({
        success: false,
        message: "Answer is required",
      });
      return;
    }

    const question = await ProductQuestion.findById(id)
      .populate("productId", "name images category")
      .populate("userId", "username email");

    if (!question) {
      res.status(404).json({
        success: false,
        message: "Product question not found",
      });
      return;
    }

    const wasAlreadyAnswered =
      question.status === "answered" && Boolean(question.answer?.trim());

    question.answer = cleanedAnswer;
    question.status = "answered";
    question.answeredBy = adminId;
    question.answeredAt = new Date();

    await question.save();

    const populatedQuestion = await ProductQuestion.findById(question._id)
      .populate("productId", "name images category")
      .populate("userId", "username email")
      .populate("answeredBy", "username email");

    if (!populatedQuestion) {
      res.status(404).json({
        success: false,
        message: "Updated product question could not be loaded",
      });
      return;
    }

    try {
      const customer = populatedQuestion.userId as any;
      const product = populatedQuestion.productId as any;

      if (customer?.email) {
        await sendProductQuestionReplyEmail(
          customer.email,
          customer.username || "Customer",
          product?.name || "TechVault Product",
          product?._id?.toString() || "",
          populatedQuestion.question,
          populatedQuestion.answer,
        );
      } else {
        console.warn(
          `Question ${populatedQuestion._id} was answered, but customer email was unavailable.`,
        );
      }
    } catch (emailError) {
      console.error(
        "Question answered successfully but reply email failed:",
        emailError,
      );
    }

    res.status(200).json({
      success: true,
      message: wasAlreadyAnswered
        ? "Question reply updated successfully"
        : "Question answered successfully and customer notified",
      question: populatedQuestion,
    });
  } catch (error) {
    console.error("Reply product question error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to answer product question",
    });
  }
};

export const deleteProductQuestion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedQuestion = await ProductQuestion.findByIdAndDelete(id);

    if (!deletedQuestion) {
      res.status(404).json({
        success: false,
        message: "Product question not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product question deleted successfully",
      question: deletedQuestion,
    });
  } catch (error) {
    console.error("Delete product question error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete product question",
    });
  }
};

export const toggleProductQuestionVisibility = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const question = await ProductQuestion.findById(id);

    if (!question) {
      res.status(404).json({
        success: false,
        message: "Product question not found",
      });
      return;
    }

    question.isVisible = !question.isVisible;

    await question.save();

    res.status(200).json({
      success: true,
      message: question.isVisible
        ? "Product question is now visible"
        : "Product question has been hidden",
      question,
    });
  } catch (error) {
    console.error("Toggle question visibility error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update question visibility",
    });
  }
};

export const toggleProductQuestionPin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const question = await ProductQuestion.findById(id);

    if (!question) {
      res.status(404).json({
        success: false,
        message: "Product question not found",
      });
      return;
    }

    question.isPinned = !question.isPinned;

    await question.save();

    res.status(200).json({
      success: true,
      message: question.isPinned
        ? "Product question pinned successfully"
        : "Product question unpinned successfully",
      question,
    });
  } catch (error) {
    console.error("Toggle question pin error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update question pin status",
    });
  }
};
