import express from "express";

import {
  getAllContacts,
  markContactRead,
  removeContact,
  getAdminOrders,
  removeOrder,
  getAdminProducts,
  addProduct,
  deleteProduct,
  updateProduct,
  markAsAdmin,
  getAllUsers,
  deleteUser,
  removeAdmin,
  changeStatusOrder,
  fetchAllOrders,
  changePaymentStatusOrder,
  getAllReviews,
  getAllWishlists,
  replyToContactMessage,
} from "../controllers/adminController.js";

import { adminAuthorize } from "../middleware/adminAuthorize.js";
import { protect } from "server/middleware/authMiddleware.js";

const router = express.Router();

// Protect all admin routes
router.use(protect as express.RequestHandler);
router.use(adminAuthorize as express.RequestHandler);

// ==============================
// CONTACTS
// ==============================
router.get("/getAllContacts", getAllContacts);
router.put("/marksReadContact/:id/read", markContactRead);
router.post("/replyContact", replyToContactMessage);
router.delete("/deleteContact/:id", removeContact);

// ==============================
// PRODUCTS
// ==============================
router.get("/getAllProducts", getAdminProducts);
router.post("/addProduct", addProduct);
router.put("/updateProduct/:id", updateProduct);
router.delete("/deleteProduct/:id", deleteProduct);

// ==============================
// USERS
// ==============================
router.get("/getAllUsers", getAllUsers);
router.put("/user/:id/make-admin", markAsAdmin);
router.put("/user/:id/remove-admin", removeAdmin);
router.delete("/deleteUser/:id", deleteUser);

// ==============================
// ORDERS
// ==============================
router.get("/getAllOrders", getAdminOrders);
router.delete("/orders/:id", removeOrder);

router.get("/orders/fetchAllOrders", fetchAllOrders);
router.put("/orders/changeStatusOrder", changeStatusOrder);
router.put("/orders/changePaymentStatusOrder", changePaymentStatusOrder);

// ==============================
// REVIEWS & WISHLISTS
// ==============================
router.get("/getAllReviews", getAllReviews);
router.get("/getAllWishlists", getAllWishlists);

export default router;
