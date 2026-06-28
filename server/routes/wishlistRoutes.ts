import express from "express";

import {
  addToWishlist,
  getUserWishlist,
  removeWishlistItem,
  clearWishlist,
  isProductInWishlist,
} from "../controllers/wishlistController.js";

const router = express.Router();

router.post("/addToWishlist", addToWishlist);

router.get("/getUserWishlist/:email", getUserWishlist);

router.delete("/removeWishlistItem/:email/:productId", removeWishlistItem);

router.delete("/clearWishlist/:email", clearWishlist);

router.get("/isProductInWishlist/:email/:productId", isProductInWishlist);

export default router;
