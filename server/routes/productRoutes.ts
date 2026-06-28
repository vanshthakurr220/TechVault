import express from "express";
import {
  getProducts,
  getSingleProduct,
  incrementProductView,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/getAllProducts", getProducts);
router.get("/getProduct/:id", getSingleProduct);
router.put("/products/:id/view", incrementProductView);

export default router;
