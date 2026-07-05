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

export const sendOrderConfirmationEmail = async (
  email: string,
  username: string,
  order: any,
): Promise<boolean> => {
  try {
    const mailTransporter =
      process.env.EMAIL_USER && process.env.EMAIL_PASSWORD
        ? transporter
        : await createTestTransporter();

    const itemsHtml = order.items
      .map(
        (item: any) => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align:center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align:right;">₹${item.price}</td>
          </tr>
        `,
      )
      .join("");

    const html = `
      <div style="font-family: Arial, sans-serif; background:#f8fafc; padding:24px;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e5e7eb;">
          <div style="background:#0f172a; color:white; padding:24px;">
            <h1 style="margin:0; font-size:24px;">TechVault</h1>
            <p style="margin:8px 0 0; color:#cbd5e1;">Order Confirmation</p>
          </div>

          <div style="padding:24px;">
            <h2 style="margin-top:0; color:#111827;">Hi ${username},</h2>
            <p style="color:#374151; font-size:15px;">Thank you for your order. We have received your order successfully.</p>

            <div style="background:#f1f5f9; padding:16px; border-radius:12px; margin:20px 0;">
              <p style="margin:0;"><strong>Order ID:</strong> ${order._id}</p>
              <p style="margin:8px 0 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
              <p style="margin:8px 0 0;"><strong>Order Status:</strong> ${order.status}</p>
            </div>

            <table style="width:100%; border-collapse:collapse; margin-top:20px;">
              <thead>
                <tr style="background:#f8fafc;">
                  <th style="padding:10px; text-align:left;">Product</th>
                  <th style="padding:10px; text-align:center;">Qty</th>
                  <th style="padding:10px; text-align:right;">Price</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>

            <div style="text-align:right; margin-top:20px;">
              <h2 style="color:#111827;">Total: ₹${order.totalAmount}</h2>
            </div>

            <p style="color:#64748b; font-size:14px; margin-top:24px;">We will notify you when your order status changes.</p>
          </div>

          <div style="background:#f8fafc; padding:16px; text-align:center; color:#64748b; font-size:13px;">
            © ${new Date().getFullYear()} TechVault. All rights reserved.
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@techvault.com",
      to: email,
      subject: "Your TechVault Order Has Been Placed Successfully",
      html,
    };

    await mailTransporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return false;
  }
};

export const sendOrderStatusEmail = async (
  email: string,
  username: string,
  order: any,
  status: string,
): Promise<boolean> => {
  try {
    const mailTransporter =
      process.env.EMAIL_USER && process.env.EMAIL_PASSWORD
        ? transporter
        : await createTestTransporter();

    const statusColors: Record<string, string> = {
      pending: "#f59e0b",
      processing: "#3b82f6",
      shipped: "#8b5cf6",
      delivered: "#16a34a",
      cancelled: "#dc2626",
    };

    const color = statusColors[status] || "#0f172a";

    const html = `
      <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:30px;">
        <div style="max-width:600px;margin:auto;background:#fff;border-radius:14px;border:1px solid #e5e7eb;overflow:hidden;">

          <div style="background:${color};padding:24px;color:white;">
            <h2 style="margin:0;">TechVault</h2>
            <p style="margin:8px 0 0;">Order Status Updated</p>
          </div>

          <div style="padding:24px;">
            <h2>Hello ${username},</h2>

            <p>Your order status has been updated.</p>

            <div style="background:#f8fafc;padding:18px;border-radius:10px;">
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Current Status:</strong>
                <span style="color:${color};font-weight:bold;text-transform:capitalize;">
                  ${status}
                </span>
              </p>

              <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>

              <p><strong>Total:</strong> ₹${order.totalAmount}</p>
            </div>

            ${
              status === "processing"
                ? "<p>We're preparing your order for shipment.</p>"
                : ""
            }

            ${
              status === "shipped"
                ? "<p>Your order has been shipped and is on its way.</p>"
                : ""
            }

            ${
              status === "delivered"
                ? "<p>Your order has been delivered successfully. Thank you for shopping with TechVault!</p>"
                : ""
            }

            ${
              status === "cancelled"
                ? "<p>Your order has been cancelled. If this wasn't expected, please contact our support team.</p>"
                : ""
            }

          </div>

          <div style="background:#f1f5f9;padding:16px;text-align:center;font-size:13px;color:#64748b;">
            © ${new Date().getFullYear()} TechVault
          </div>

        </div>
      </div>
    `;

    await mailTransporter.sendMail({
      from: `"TechVault" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your TechVault Order is ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      text: `Your order ${order._id} is now ${status}.`,
      html,
    });

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const sendContactReplyEmail = async (
  email: string,
  customerName: string,
  originalMessage: string,
  replyMessage: string,
): Promise<boolean> => {
  try {
    const mailTransporter =
      process.env.EMAIL_USER && process.env.EMAIL_PASSWORD
        ? transporter
        : await createTestTransporter();

    const html = `
      <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:30px;">
        <div style="max-width:650px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">

          <div style="background:#0f172a;padding:28px;color:white;">
            <h1 style="margin:0;font-size:28px;">TechVault</h1>
            <p style="margin-top:8px;color:#cbd5e1;">
              Customer Support
            </p>
          </div>

          <div style="padding:32px;">

            <h2 style="margin-top:0;color:#111827;">
              Hello ${customerName},
            </h2>

            <p style="color:#475569;font-size:15px;line-height:1.8;">
              Thank you for contacting <strong>TechVault</strong>.
              Below is our response regarding your enquiry.
            </p>

            <div style="
              margin-top:28px;
              border-left:4px solid #0f172a;
              background:#f8fafc;
              padding:20px;
              border-radius:12px;
            ">
              <h3 style="margin-top:0;color:#111827;">
                Our Reply
              </h3>

              <p style="
                white-space:pre-wrap;
                color:#374151;
                line-height:1.8;
              ">
                ${replyMessage}
              </p>
            </div>

            <div style="
              margin-top:28px;
              background:#f1f5f9;
              padding:20px;
              border-radius:12px;
            ">
              <h3 style="margin-top:0;color:#111827;">
                Your Original Message
              </h3>

              <p style="
                white-space:pre-wrap;
                color:#64748b;
                line-height:1.8;
              ">
                ${originalMessage}
              </p>
            </div>

            <p style="
              margin-top:32px;
              color:#475569;
              line-height:1.8;
            ">
              If you have any additional questions, simply reply to this email.
              We'll be happy to assist you.
            </p>

            <p style="margin-top:30px;">
              Regards,<br>
              <strong>TechVault Support Team</strong>
            </p>

          </div>

          <div style="
            background:#f8fafc;
            text-align:center;
            padding:18px;
            color:#94a3b8;
            font-size:13px;
          ">
            © ${new Date().getFullYear()} TechVault. All rights reserved.
          </div>

        </div>
      </div>
    `;

    await mailTransporter.sendMail({
      from: `"TechVault Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Re: Your message to TechVault",
      html,
    });

    return true;
  } catch (error) {
    console.error("Reply email error:", error);
    return false;
  }
};
