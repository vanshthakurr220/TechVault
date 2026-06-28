import express from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/order", createOrder);
router.get("/order/user/:email", getUserOrders);
router.get("/order", getAllOrders);
router.put("/order/:id", updateOrderStatus);
router.delete("/order/:id", deleteOrder);

export default router;
