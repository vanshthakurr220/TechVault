import { Request, Response } from "express";
import { Cart } from "../models/Cart.js";
import { User } from "../models/User.js";

// =====================================
// ADD TO CART
// =====================================

export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, productId, quantity } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });

      return;
    }

    let cart = await Cart.findOne({ userId: user._id });

    if (!cart) {
      cart = await Cart.create({
        userId: user._id,

        items: [
          {
            productId,
            quantity: quantity || 1,
          },
        ],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId,
      );

      if (existingItem) {
        existingItem.quantity += quantity || 1;
      } else {
        cart.items.push({
          productId,
          quantity: quantity || 1,
        });
      }

      await cart.save();
    }

    res.status(200).json({
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed adding product to cart",
    });
  }
};

// =====================================
// FETCH CART
// =====================================

export const getUserCart = async (
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

    const cart = await Cart.findOne({
      userId: user._id,
    }).populate(
      "items.productId",
      "name images price brand category model rating inStock",
    );

    if (!cart) {
      res.status(200).json({
        items: [],
      });

      return;
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed fetching cart",
    });
  }
};

// =====================================
// UPDATE QUANTITY
// =====================================

export const updateCartQuantity = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, productId, quantity } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });

      return;
    }

    const cart = await Cart.findOne({
      userId: user._id,
    });

    if (!cart) {
      res.status(404).json({
        message: "Cart not found",
      });

      return;
    }

    const item = cart.items.find((i) => i.productId.toString() === productId);

    if (!item) {
      res.status(404).json({
        message: "Item not found",
      });

      return;
    }

    item.quantity = quantity;

    await cart.save();

    res.status(200).json({
      message: "Quantity updated",
      cart,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed updating quantity",
    });
  }
};

// =====================================
// REMOVE ITEM
// =====================================

export const removeCartItem = async (
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

    const cart = await Cart.findOne({
      userId: user._id,
    });

    if (!cart) {
      res.status(404).json({
        message: "Cart not found",
      });

      return;
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId,
    );

    await cart.save();

    res.status(200).json({
      message: "Item removed",
      cart,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed removing item",
    });
  }
};

// =====================================
// CLEAR CART
// =====================================

export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });

      return;
    }

    await Cart.findOneAndUpdate(
      {
        userId: user._id,
      },
      {
        items: [],
      },
    );

    res.status(200).json({
      message: "Cart cleared",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed clearing cart",
    });
  }
};
