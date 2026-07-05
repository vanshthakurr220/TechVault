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
export const changeStatusOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id, status } = req.body;

    const allowedStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      res.status(400).json({
        message: "Invalid order status",
      });

      return;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        status,
      },
      {
        new: true,
      },
    ).populate("userId", "username email name");

    if (!updatedOrder) {
      res.status(404).json({
        message: "Order not found",
      });

      return;
    }

    try {
      const user: any = updatedOrder.userId;

      await sendOrderStatusEmail(
        user?.email || updatedOrder.userId,
        user?.username ||
          user?.name ||
          updatedOrder.shippingAddress?.fullName ||
          "Customer",
        updatedOrder,
        status,
      );
    } catch (emailError) {
      console.error("Order status updated but email failed:", emailError);
    }

    res.status(200).json({
      message: "Order status updated successfully",

      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);

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
} from "server/utils/emailService.js";

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
