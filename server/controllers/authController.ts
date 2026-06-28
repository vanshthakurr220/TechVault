import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { OTP } from "../models/OTP.js";
import { Request, Response } from "express";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import { AuthRequest } from "server/middleware/authMiddleware.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "server/middleware/asyncHandler.js";

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password, mobile } = req.body;

    // Validate required fields
    if (!username || !email || !password || !mobile) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        message: "Email is already registered",
      });
    }

    // Check if mobile already exists
    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) {
      return res.status(400).json({
        message: "Mobile number is already registered",
      });
    }

    // Verify email OTP
    const emailOTP = await OTP.findOne({
      email,
      purpose: "signup",
      verified: true,
    });

    if (!emailOTP) {
      return res.status(400).json({
        message: "Email not verified. Please verify your email first.",
      });
    }

    // Verify mobile OTP
    const mobileOTP = await OTP.findOne({
      mobile,
      purpose: "signup",
      verified: true,
    });

    if (!mobileOTP) {
      return res.status(400).json({
        message: "Mobile not verified. Please verify your mobile first.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      mobile,
    });

    // Delete OTP records
    await OTP.deleteMany({
      _id: {
        $in: [emailOTP._id, mobileOTP._id],
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // change to true in production with HTTPS
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User created successfully",
      accessToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in signup:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error("Invalid email or password");
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    res.status(400);
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    message: "Login successful",
    accessToken,
    user: {
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
    },
  });
});

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;

    if (!token) {
      res.status(401);
      throw new Error("Refresh token missing");
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
      userId: string;
    };

    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    const accessToken = generateAccessToken(user._id.toString());

    res.status(200).json({
      accessToken,
    });
  },
);

export const logout = (req: Request, res: Response) => {
  res.clearCookie("refreshToken");

  res.status(200).json({
    message: "Logout successful",
  });
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { username, mobile } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Email changes are now handled through OTP verification endpoint
    // This prevents direct email updates without verification

    user.username = username || user.username;
    user.mobile = mobile || user.mobile;

    await user.save();

    res.status(200).json({
      message:
        "Profile updated successfully. Note: Email changes require OTP verification.",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// =====================================
// ADDRESS MANAGEMENT
// =====================================

export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.addresses || []);
  } catch (error) {
    console.error("Error in getAddresses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { address } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (address.isDefault) {
      user.addresses.forEach((addr: any) => (addr.isDefault = false));
    }

    user.addresses.push(address);
    await user.save();

    res.status(201).json({
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error in addAddress:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { addressId, updatedAddress } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (updatedAddress.isDefault) {
      user.addresses.forEach((addr: any) => (addr.isDefault = false));
    }

    const addressIndex = user.addresses.findIndex(
      (addr: any) => addr._id.toString() === addressId,
    );
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      ...updatedAddress,
    };
    await user.save();

    res.status(200).json({
      message: "Address updated successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error in updateAddress:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.addresses = user.addresses.filter(
      (addr: any) => addr._id.toString() !== addressId,
    );
    await user.save();

    res.status(200).json({
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error in deleteAddress:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId;

  const user = await User.findById(userId).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    user: {
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
    },
  });
});

export const setDefaultAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { addressId } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.addresses.forEach((addr: any) => {
      addr.isDefault = addr._id.toString() === addressId;
    });

    await user.save();

    res.status(200).json({
      message: "Default address set successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error in setDefaultAddress:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
