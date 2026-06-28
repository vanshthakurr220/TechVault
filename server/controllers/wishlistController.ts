import { Request, Response } from "express";
import { Wishlist } from "../models/Wishlist.js";
import { User } from "../models/User.js";

// =====================================
// ADD TO WISHLIST
// =====================================

export const addToWishlist = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, productId } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });

      return;
    }

    let wishlist = await Wishlist.findOne({ userId: user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId: user._id,
        items: [
          {
            productId,
            addedAt: new Date(),
          },
        ],
      });
    } else {
      const existingItem = wishlist.items.find(
        (item) => item.productId.toString() === productId,
      );

      if (!existingItem) {
        wishlist.items.push({
          productId,
          addedAt: new Date(),
        });

        await wishlist.save();
      }
    }

    res.status(200).json({
      message: "Product added to wishlist",
      wishlist,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed adding product to wishlist",
    });
  }
};

// =====================================
// FETCH WISHLIST
// =====================================

export const getUserWishlist = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });

      return;
    }

    const wishlist = await Wishlist.findOne({
      userId: user._id,
    }).populate("items.productId", "name image images price brand inStock");

    if (!wishlist) {
      res.status(200).json({
        items: [],
      });

      return;
    }

    res.status(200).json(wishlist);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed fetching wishlist",
    });
  }
};

// =====================================
// REMOVE ITEM FROM WISHLIST
// =====================================

export const removeWishlistItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, productId } = req.params;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });

      return;
    }

    const wishlist = await Wishlist.findOne({
      userId: user._id,
    });

    if (!wishlist) {
      res.status(404).json({
        message: "Wishlist not found",
      });

      return;
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.productId.toString() !== productId,
    );

    await wishlist.save();

    res.status(200).json({
      message: "Item removed from wishlist",
      wishlist,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed removing item from wishlist",
    });
  }
};

// =====================================
// CLEAR WISHLIST
// =====================================

export const clearWishlist = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });

      return;
    }

    await Wishlist.findOneAndUpdate(
      {
        userId: user._id,
      },
      {
        items: [],
      },
    );

    res.status(200).json({
      message: "Wishlist cleared",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed clearing wishlist",
    });
  }
};

// =====================================
// CHECK IF PRODUCT IN WISHLIST
// =====================================

export const isProductInWishlist = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, productId } = req.params;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });

      return;
    }

    const wishlist = await Wishlist.findOne({
      userId: user._id,
    });

    if (!wishlist) {
      res.status(200).json({
        inWishlist: false,
      });

      return;
    }

    const inWishlist = wishlist.items.some(
      (item) => item.productId.toString() === productId,
    );

    res.status(200).json({
      inWishlist,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed checking wishlist",
    });
  }
};
