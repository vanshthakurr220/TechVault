import mongoose, { Schema, Document } from "mongoose";

// ===============================
// ORDER ITEM TYPE
// ===============================

interface IOrderItem {
  productId: mongoose.Types.ObjectId;

  name?: string;

  images: string[];

  price: number;

  quantity: number;
}

// ===============================
// ORDER TYPE
// ===============================

export interface IOrder extends Document {
  userId: string;

  items: IOrderItem[];

  totalAmount: number;

  couponCode: string;

  couponDiscount: number;

  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";

  paymentStatus: "pending" | "paid" | "failed";

  paymentMethod: "cod" | "card" | "upi";

  shippingAddress: {
    fullName: string;

    phone: string;

    address: string;

    city: string;

    state: string;

    pincode: string;
  };

  createdAt: Date;

  updatedAt: Date;
}

// ===============================
// ORDER SCHEMA
// ===============================

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: String,

      required: true,

      index: true,
    },

    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,

          ref: "Product",

          required: true,
        },

        name: {
          type: String,

          trim: true,
        },

        images: {
          type: [String],
          default: [],
        },

        price: {
          type: Number,

          required: true,

          min: 0,
        },

        quantity: {
          type: Number,

          required: true,

          min: 1,
        },
      },
    ],

    totalAmount: {
      type: Number,

      required: true,

      min: 0,
    },

    couponCode: {
      type: String,
      default: "",
    },

    couponDiscount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,

      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],

      default: "pending",
    },

    paymentStatus: {
      type: String,

      enum: ["pending", "paid", "failed"],

      default: "pending",
    },

    paymentMethod: {
      type: String,

      enum: ["cod", "card", "upi"],

      default: "cod",
    },

    shippingAddress: {
      fullName: {
        type: String,

        required: true,

        trim: true,
      },

      phone: {
        type: String,

        required: true,
      },

      address: {
        type: String,

        required: true,
      },

      city: {
        type: String,

        required: true,
      },

      state: {
        type: String,

        required: true,
      },

      pincode: {
        type: String,

        required: true,
      },
    },
  },

  {
    timestamps: true,
  },
);

export const Order = mongoose.model<IOrder>("Order", orderSchema);
