import { Request, Response } from "express";
import { Product } from "../models/Products.js";

// GET all products
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
};

export const getSingleProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({
        message: "Product not found",
      });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
    });
  }
};

export const incrementProductView = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      {
        $inc: {
          views: 1,
        },
      },
      {
        new: true,
      },
    );

    if (!product) {
      res.status(404).json({
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      views: product.views,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update product views",
    });
  }
};
