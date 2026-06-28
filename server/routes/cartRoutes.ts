import express from "express";

import {
  addToCart,
  getUserCart,
  updateCartQuantity,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.post("/addToCart", addToCart);

router.get("/getUserCart/:email", getUserCart);

router.put("/updateCart", updateCartQuantity);

router.delete("/removeCartItem/:email/:productId", removeCartItem);

router.delete("/clearCart/:email", clearCart);

export default router;
