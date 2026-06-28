import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  discountPercentage: number;

  minOrderAmount: number;

  maxDiscount?: number;

  usageLimit: number;
  usedCount: number;

  expiryDate: Date;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    discountPercentage: {
      type: Number,
      required: true,
    },

    minOrderAmount: {
      type: Number,
      default: 0,
    },

    maxDiscount: {
      type: Number,
      default: null,
    },

    usageLimit: {
      type: Number,
      default: 100,
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<ICoupon>("Coupon", couponSchema);
