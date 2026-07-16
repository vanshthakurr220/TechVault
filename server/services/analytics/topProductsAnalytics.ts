import { Order } from "server/models/Order";

interface GetTopProductsAnalyticsOptions {
  startDate: Date;
  endDate: Date;
  limit?: number;
}

export const getTopProductsAnalytics = async ({
  startDate,
  endDate,
  limit = 10,
}: GetTopProductsAnalyticsOptions) => {
  const result = await Order.aggregate([
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

        name: {
          $first: "$items.name",
        },

        historicalImage: {
          $first: "$items.image",
        },

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

        orderIds: {
          $addToSet: "$_id",
        },
      },
    },

    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "currentProduct",
      },
    },

    {
      $addFields: {
        currentProduct: {
          $arrayElemAt: ["$currentProduct", 0],
        },

        orderCount: {
          $size: "$orderIds",
        },
      },
    },

    {
      $addFields: {
        currentProductImage: {
          $ifNull: [
            {
              $arrayElemAt: ["$currentProduct.images", 0],
            },
            "$currentProduct.image",
          ],
        },
      },
    },

    {
      $sort: {
        unitsSold: -1,
        revenue: -1,
      },
    },

    {
      $limit: limit,
    },

    {
      $project: {
        _id: 0,

        productId: {
          $toString: "$_id",
        },

        name: {
          $ifNull: [
            "$name",
            {
              $ifNull: ["$currentProduct.name", "Unknown Product"],
            },
          ],
        },

        image: {
          $ifNull: [
            "$historicalImage",
            {
              $ifNull: ["$currentProductImage", "/placeholder.png"],
            },
          ],
        },

        unitsSold: 1,

        revenue: {
          $round: ["$revenue", 2],
        },

        orderCount: 1,
      },
    },
  ]);

  return result;
};
