import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    brand: {
      type: String,
      required: true,
    },

    model: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    originalPrice: {
      type: Number,
    },

    // Updated to support multiple images
    // The first image in the array can be treated as the 'primary' image
    images: {
      type: [String],
      required: true,
      default: [],
    },

    rating: {
      type: Number,
      default: 0,
    },

    reviews: {
      type: Number,
      default: 0,
    },

    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    inStock: {
      type: Boolean,
      default: true,
    },

    description: {
      type: String,
      required: true,
    },

    specifications: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // ==========================
    // ANALYTICS FIELDS
    // ==========================

    views: {
      type: Number,
      default: 0,
    },

    unitsSold: {
      type: Number,
      default: 0,
    },

    revenue: {
      type: Number,
      default: 0,
    },

    wishlistCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);


export const Product = mongoose.model("Product", productSchema);
