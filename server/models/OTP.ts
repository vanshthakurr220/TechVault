import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    default: null,
    lowercase: true,
    trim: true,
    index: true,
  },

  mobile: {
    type: String,
    default: null,
    trim: true,
    index: true,
  },

  otp: {
    type: String,
    required: true,
  },

  purpose: {
  type: String,
  enum: ["signup", "email_change", "forgot_password"],
  required: true,
},

  verified: {
    type: Boolean,
    default: false,
  },

  attempts: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Auto-delete after 10 minutes
  },

  expiresAt: {
    type: Date,
    required: true,
  },
});

export const OTP = mongoose.model("OTP", otpSchema);
