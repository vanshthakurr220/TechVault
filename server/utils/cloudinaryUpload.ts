import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = async (filePath: string): Promise<string> => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "products",
  });

  return result.secure_url;
};
