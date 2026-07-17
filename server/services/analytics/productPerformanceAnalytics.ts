import mongoose from "mongoose";
import { Order } from "server/models/Order";
import { Product } from "server/models/Products";
import { Wishlist } from "server/models/Wishlist";

interface GetProductPerformanceAnalyticsOptions {
  startDate: Date;
  endDate: Date;
  limit?: number;
}

interface ProductDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  image?: string;
  images?: string[];
  views?: number;
  wishlistCount?: number;
  unitsSold?: number;
  revenue?: number;
  stockQuantity?: number;
}

const formatProduct = (product: ProductDocument) => ({
  productId: product._id.toString(),

  name: product.name,

  image: product.images?.[0] || product.image || "",

  views: product.views ?? 0,

  wishlistCount: product.wishlistCount ?? 0,

  unitsSold: product.unitsSold ?? 0,

  revenue: Number((product.revenue ?? 0).toFixed(2)),

  stockQuantity: product.stockQuantity ?? 0,
});

export const getProductPerformanceAnalytics = async ({
  startDate,
  endDate,
  limit = 10,
}: GetProductPerformanceAnalyticsOptions) => {
  const [
    mostViewedProducts,
    mostWishlistedProducts,
    highestRevenueProducts,
    periodSales,
  ] = await Promise.all([
    // 1. Most viewed products
    Product.find({
      views: {
        $gt: 0,
      },
    })
      .select(
        "_id name image images views wishlistCount unitsSold revenue stockQuantity",
      )
      .sort({
        views: -1,
      })
      .limit(limit)
      .lean(),

    // 2. Most wishlisted products
    Wishlist.aggregate([
      {
        $unwind: "$items",
      },

      // Keep this stage when wishlist analytics should follow the selected range.
      {
        $match: {
          "items.addedAt": {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },

      {
        $group: {
          _id: "$items.productId",

          wishlistCount: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          wishlistCount: -1,
        },
      },

      {
        $limit: limit,
      },

      {
        $lookup: {
          from: Product.collection.name,
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },

      {
        $unwind: "$product",
      },

      {
        $project: {
          _id: "$product._id",
          name: "$product.name",
          image: "$product.image",
          images: "$product.images",

          views: {
            $ifNull: ["$product.views", 0],
          },

          wishlistCount: 1,

          unitsSold: {
            $ifNull: ["$product.unitsSold", 0],
          },

          revenue: {
            $ifNull: ["$product.revenue", 0],
          },

          stockQuantity: {
            $ifNull: ["$product.stockQuantity", 0],
          },
        },
      },
    ]),

    // 3. Highest revenue products
    Product.find({
      revenue: {
        $gt: 0,
      },
    })
      .select(
        "_id name image images views wishlistCount unitsSold revenue stockQuantity",
      )
      .sort({
        revenue: -1,
      })
      .limit(limit)
      .lean(),

    // 4. Sales made during the selected period
    Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },

          status: "delivered",
          paymentStatus: "paid",
        },
      },

      {
        $unwind: "$items",
      },

      {
        $group: {
          _id: "$items.productId",

          unitsSold: {
            $sum: {
              $ifNull: ["$items.quantity", 0],
            },
          },

          revenue: {
            $sum: {
              $multiply: [
                {
                  $ifNull: ["$items.price", 0],
                },
                {
                  $ifNull: ["$items.quantity", 0],
                },
              ],
            },
          },
        },
      },
    ]),
  ]);

  const soldProductIds = new Set(
    periodSales.map((item) => item._id?.toString()),
  );

  const soldObjectIds = Array.from(soldProductIds)
    .filter((id): id is string => Boolean(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  const unsoldQuery =
    soldObjectIds.length > 0
      ? {
          _id: {
            $nin: soldObjectIds,
          },
        }
      : {};

  const unsoldProducts = await Product.find(unsoldQuery)
    .select(
      "_id name image images views wishlistCount unitsSold revenue stockQuantity",
    )
    .sort({
      views: -1,
    })
    .limit(limit)
    .lean();

  const highViewsLowSales = unsoldProducts
    .filter((product) => (product.views ?? 0) > 0)
    .slice(0, limit);

  return {
    mostViewedProducts: mostViewedProducts.map(formatProduct),

    mostWishlistedProducts: mostWishlistedProducts.map(formatProduct),

    highestRevenueProducts: highestRevenueProducts.map(formatProduct),

    highViewsLowSales: highViewsLowSales.map(formatProduct),

    productsWithNoSales: unsoldProducts.map(formatProduct),
  };
};
