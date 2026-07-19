import express from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/order", createOrder);
router.get("/order/user/:email", getUserOrders);
router.get("/order", getAllOrders);

export default router;
