import express from "express";

import {
  createCoupon,
  getAllCoupons,
  deleteCoupon,
  updateCoupon,
  validateCoupon,
} from "../controllers/couponController";

const router = express.Router();

router.post("/", createCoupon);

router.get("/", getAllCoupons);

router.put("/:id", updateCoupon);

router.delete("/:id", deleteCoupon);

router.post("/validate", validateCoupon);

export default router;
