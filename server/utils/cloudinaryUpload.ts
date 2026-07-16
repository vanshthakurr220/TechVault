import fs from "fs";
import path from "path";
import sharp from "sharp";
import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = async (
  filePath: string,
): Promise<string> => {
  const parsedPath = path.parse(filePath);

  const processedFilePath = path.join(
    parsedPath.dir,
    `${parsedPath.name}-processed.webp`,
  );

  try {
    await sharp(filePath)
      .rotate()
      .trim({
        background: "#ffffff",
        threshold: 18,
      })
      .extend({
        top: 35,
        bottom: 35,
        left: 35,
        right: 35,
        background: {
          r: 255,
          g: 255,
          b: 255,
          alpha: 0,
        },
      })
      .resize({
        width: 1400,
        height: 1400,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: 88,
        effort: 4,
      })
      .toFile(processedFilePath);

    const result = await cloudinary.uploader.upload(processedFilePath, {
      folder: "products",
      resource_type: "image",
      format: "webp",
      transformation: [
        {
          quality: "auto:good",
          fetch_format: "auto",
        },
      ],
    });

    return result.secure_url;
  } catch (error) {
    console.error("Image processing/upload failed:", error);
    throw error;
  } finally {
    if (fs.existsSync(processedFilePath)) {
      fs.unlinkSync(processedFilePath);
    }
  }
};