import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
    },
    mobileVerified: {
      type: Boolean,
      default: false,
    },
    role: { type: String, default: "user" },
    addresses: [addressSchema],
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
