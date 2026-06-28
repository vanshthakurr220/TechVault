import { Router } from "express";
import upload from "../middleware/upload.js";
import { uploadImages } from "../controllers/uploadController.js";

const router = Router();

router.post(
  "/",
  (req, res, next) => {
    console.log("Route hit");
    next();
  },
  upload.array("images", 10),
  uploadImages,
);

export default router;
