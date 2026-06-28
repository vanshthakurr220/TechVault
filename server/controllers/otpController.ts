import { Request, Response } from "express";
import { OTP } from "../models/OTP.js";
import { User } from "../models/User.js";
import { sendOTPEmail, generateOTP } from "../utils/emailService.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import twilioClient from "../utils/twilioService.js";

/**
 * Send OTP for signup
 * POST /api/auth/send-otp-signup
 */
export const sendOTPSignup = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Check if OTP already exists for this email
    const existingOTP = await OTP.findOne({
      email,
      purpose: "signup",
      verified: false,
    });

    if (existingOTP) {
      // Delete old OTP and create new one
      await OTP.deleteOne({ _id: existingOTP._id });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await OTP.create({
      email,
      otp,
      purpose: "signup",
      verified: false,
      expiresAt,
    });

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, "signup");

    if (!emailSent) {
      // Delete OTP if email sending fails
      await OTP.deleteOne({ email, purpose: "signup" });
      return res.status(500).json({
        message: "Failed to send OTP. Please try again.",
      });
    }

    res.status(200).json({
      message: "OTP sent successfully to your email",
      email,
    });
  } catch (error) {
    console.error("Error in sendOTPSignup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Verify OTP for signup
 * POST /api/auth/verify-otp-signup
 */
export const verifyOTPSignup = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({
      email,
      purpose: "signup",
      verified: false,
    });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ message: "OTP not found or already verified" });
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Check attempt limit
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        message: "Maximum attempts exceeded. Please request a new OTP.",
      });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({
        message: "Invalid OTP",
        attemptsLeft: 5 - otpRecord.attempts,
      });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    res.status(200).json({
      message: "OTP verified successfully",
      email,
      verified: true,
    });
  } catch (error) {
    console.error("Error in verifyOTPSignup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Send OTP for mobile signup
 * POST /api/auth/send-mobile-otp-signup
 */
export const sendMobileOTPSignup = async (req: Request, res: Response) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        message: "Mobile number is required",
      });
    }

    // Check if mobile already exists
    const existingUser = await User.findOne({ mobile });

    if (existingUser) {
      return res.status(400).json({
        message: "Mobile number is already registered",
      });
    }

    // Send OTP using Twilio Verify
    await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verifications.create({
        to: `+91${mobile}`,
        channel: "sms",
      });

    return res.status(200).json({
      message: "OTP sent successfully",
      mobile,
    });
  } catch (error) {
    console.error("Error in sendMobileOTPSignup:", error);

    return res.status(500).json({
      message: "Failed to send OTP",
    });
  }
};

/**
 * Verify Mobile OTP for signup
 * POST /api/auth/verify-mobile-otp-signup
 */
export const verifyMobileOTPSignup = async (req: Request, res: Response) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        message: "Mobile number and OTP are required",
      });
    }

    // Verify OTP with Twilio Verify
    const verificationCheck = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verificationChecks.create({
        to: `+91${mobile}`,
        code: otp,
      });

    if (verificationCheck.status !== "approved") {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // Store only the verification status in MongoDB
    const existingOTP = await OTP.findOne({
      mobile,
      purpose: "signup",
    });

    if (existingOTP) {
      await OTP.deleteOne({ _id: existingOTP._id });
    }

    await OTP.create({
      mobile,
      purpose: "signup",
      verified: true,
      otp: "TWILIO_VERIFIED",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    return res.status(200).json({
      message: "Mobile OTP verified successfully",
      mobile,
      verified: true,
    });
  } catch (error) {
    console.error("Error in verifyMobileOTPSignup:", error);

    return res.status(500).json({
      message: "OTP verification failed",
    });
  }
};

/**
 * Send OTP for email change during profile edit
 * POST /api/auth/send-otp-email-change
 * Protected route - requires authentication
 */
export const sendOTPEmailChange = async (req: AuthRequest, res: Response) => {
  try {
    const { newEmail } = req.body;
    const userId = req.userId;

    if (!newEmail) {
      return res.status(400).json({ message: "New email is required" });
    }

    // Get current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if new email is same as current email
    if (newEmail === user.email) {
      return res
        .status(400)
        .json({ message: "New email is same as current email" });
    }

    // Check if new email already exists
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Delete old OTP if exists
    const existingOTP = await OTP.findOne({
      email: newEmail,
      purpose: "email_change",
      verified: false,
    });

    if (existingOTP) {
      await OTP.deleteOne({ _id: existingOTP._id });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await OTP.create({
      email: newEmail,
      otp,
      purpose: "email_change",
      verified: false,
      expiresAt,
    });

    // Send OTP email
    const emailSent = await sendOTPEmail(newEmail, otp, "email_change");

    if (!emailSent) {
      await OTP.deleteOne({ email: newEmail, purpose: "email_change" });
      return res.status(500).json({
        message: "Failed to send OTP. Please try again.",
      });
    }

    res.status(200).json({
      message: "OTP sent successfully to your new email",
      newEmail,
    });
  } catch (error) {
    console.error("Error in sendOTPEmailChange:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Verify OTP for email change
 * POST /api/auth/verify-otp-email-change
 * Protected route - requires authentication
 */
export const verifyOTPEmailChange = async (req: AuthRequest, res: Response) => {
  try {
    const { newEmail, otp } = req.body;
    const userId = req.userId;

    if (!newEmail || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Get current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({
      email: newEmail,
      purpose: "email_change",
      verified: false,
    });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ message: "OTP not found or already verified" });
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Check attempt limit
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        message: "Maximum attempts exceeded. Please request a new OTP.",
      });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({
        message: "Invalid OTP",
        attemptsLeft: 5 - otpRecord.attempts,
      });
    }

    // Update user email
    user.email = newEmail;
    await user.save();

    // Mark OTP as verified and delete
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      message: "Email updated successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in verifyOTPEmailChange:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Send OTP for mobile change
 * POST /api/auth/send-otp-mobile-change
 */
export const sendOTPMobileChange = async (req: AuthRequest, res: Response) => {
  try {
    const { newMobile } = req.body;
    const userId = req.userId;

    if (!newMobile) {
      return res.status(400).json({
        message: "New mobile number is required",
      });
    }

    // Get current user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Same mobile?
    if (user.mobile === newMobile) {
      return res.status(400).json({
        message: "New mobile number must be different",
      });
    }

    // Already registered?
    const existingUser = await User.findOne({
      mobile: newMobile,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Mobile number is already registered",
      });
    }

    // Send OTP using Twilio Verify
    await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verifications.create({
        to: `+91${newMobile}`,
        channel: "sms",
      });

    return res.status(200).json({
      message: "OTP sent successfully",
      mobile: newMobile,
    });
  } catch (error) {
    console.error("Error in sendOTPMobileChange:", error);

    return res.status(500).json({
      message: "Failed to send OTP",
    });
  }
};

/**
 * Verify OTP for mobile change
 * POST /api/auth/verify-otp-mobile-change
 */
export const verifyOTPMobileChange = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { newMobile, otp } = req.body;
    const userId = req.userId;

    if (!newMobile || !otp) {
      return res.status(400).json({
        message: "Mobile number and OTP are required",
      });
    }

    // Get current user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Verify OTP using Twilio Verify
    const verificationCheck = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verificationChecks.create({
        to: `+91${newMobile}`,
        code: otp,
      });

    if (verificationCheck.status !== "approved") {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // Check again if another user already claimed this number
    const existingUser = await User.findOne({
      mobile: newMobile,
      _id: { $ne: userId },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Mobile number is already registered",
      });
    }

    // Update mobile number
    user.mobile = newMobile;
    await user.save();

    return res.status(200).json({
      message: "Mobile number updated successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in verifyOTPMobileChange:", error);

    return res.status(500).json({
      message: "OTP verification failed",
    });
  }
};
