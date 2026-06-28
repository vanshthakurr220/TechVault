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
} from "../controllers/adminController.js";

const router = express.Router();

// CONTACTS
router.get("/getAllContacts", getAllContacts);

router.put("/marksReadContact/:id/read", markContactRead);

router.delete("/deleteContact/:id", removeContact);

// orders
router.get("/getAllOrders", getAdminOrders);

router.delete("/orders/:id", removeOrder);

//Products
router.get("/getAllProducts", getAdminProducts);
router.post("/addProduct", addProduct);
router.delete("/deleteProduct/:id", deleteProduct);
router.put("/updateProduct/:id", updateProduct);

//User
router.put("/user/:id/make-admin", markAsAdmin);
router.put("/user/:id/remove-admin", removeAdmin);
router.get("/getAllUsers", getAllUsers);
router.delete("/deleteUser/:id", deleteUser);

//Orders
router.get("/orders/fetchAllOrders", fetchAllOrders);
router.put("/orders/changeStatusOrder", changeStatusOrder);
router.put("/orders/changePaymentStatusOrder", changePaymentStatusOrder);

router.get("/getAllReviews", getAllReviews);
router.get("/getAllWishlists", getAllWishlists);

export default router;
