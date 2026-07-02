import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create a transporter using Gmail (you can configure other services)
// For production, use environment variables for credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "your-app-password",
  },
});

// Alternative: Using Ethereal for testing (no real email sent)
export const createTestTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

export const sendOTPEmail = async (
  email: string,
  otp: string,
  purpose: "signup" | "email_change" | "forgot_password",
): Promise<boolean> => {
  try {
    // Use test transporter in development if EMAIL_USER is not set
    const mailTransporter =
      process.env.EMAIL_USER && process.env.EMAIL_PASSWORD
        ? transporter
        : await createTestTransporter();

    const subject =
      purpose === "signup"
        ? "Verify Your Email - TechVault Signup"
        : purpose === "email_change"
          ? "Verify Your New Email - TechVault"
          : "Reset Your Password - TechVault";

    const htmlContent =
      purpose === "signup"
        ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to TechVault!</h2>

        <p>
          Thank you for signing up. Please verify your email address using the OTP below:
        </p>

        <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">
            ${otp}
          </h1>
        </div>

        <p>This OTP will expire in 10 minutes.</p>

        <p>
          If you didn't sign up for TechVault, please ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

        <p style="color: #666; font-size: 12px;">
          © 2026 TechVault. All rights reserved.
        </p>
      </div>
    `
        : purpose === "email_change"
          ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Change Request</h2>

        <p>
          You requested to change your email address on TechVault.
          Please verify your new email using the OTP below:
        </p>

        <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">
            ${otp}
          </h1>
        </div>

        <p>This OTP will expire in 10 minutes.</p>

        <p>
          If you didn't request this change, please ignore this email and contact support.
        </p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

        <p style="color: #666; font-size: 12px;">
          © 2026 TechVault. All rights reserved.
        </p>
      </div>
    `
          : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>

        <p>
          We received a request to reset the password for your
          <strong>TechVault</strong> account.
        </p>

        <p>
          Please use the OTP below to reset your password:
        </p>

        <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">
            ${otp}
          </h1>
        </div>

        <p>
          This OTP will expire in <strong>10 minutes</strong>.
        </p>

        <p>
          If you did not request a password reset, you can safely ignore this email.
          Your password will remain unchanged.
        </p>

        <p>
          For your security, never share this OTP with anyone.
        </p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

        <p style="color: #666; font-size: 12px;">
          © 2026 TechVault. All rights reserved.
        </p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@techvault.com",
      to: email,
      subject,
      html: htmlContent,
    };

    const info = await mailTransporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
