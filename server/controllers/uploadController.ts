import { Request, Response } from "express";
import fs from "fs";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

export const uploadImages = async (req: Request, res: Response) => {
  const productName = (req.body?.productName || "product")
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        message: "No files uploaded",
      });
    }

    const imageUrls = await Promise.all(
      files.map(async (file) => {

        const imageUrl = await uploadToCloudinary(file.path);

        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        return imageUrl;
      }),
    );

    return res.status(200).json({
      success: true,
      urls: imageUrls,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }
};
