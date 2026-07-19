import mongoose, { Schema, Document } from "mongoose";

export interface ICouponUsage extends Document {
  couponId: mongoose.Types.ObjectId;

  couponCode: string;

  userEmail: string;

  orderId?: mongoose.Types.ObjectId;

  usedAt: Date;

  createdAt: Date;

  updatedAt: Date;
}

const couponUsageSchema = new Schema<ICouponUsage>(
  {
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },

    couponCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    usedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

couponUsageSchema.index(
  {
    couponId: 1,
    userEmail: 1,
  },
  {
    unique: true,
  },
);

const CouponUsage = mongoose.model<ICouponUsage>(
  "CouponUsage",
  couponUsageSchema,
);

export default CouponUsage;
