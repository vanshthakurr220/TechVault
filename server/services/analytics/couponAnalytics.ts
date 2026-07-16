import { Order } from "server/models/Order";

interface GetCouponAnalyticsOptions {
  startDate: Date;
  endDate: Date;
}

export const getCouponAnalytics = async ({
  startDate,
  endDate,
}: GetCouponAnalyticsOptions) => {
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },

        status: "delivered",
paymentStatus: "paid",

        couponCode: {
          $exists: true,
          $nin: [null, ""],
        },
      },
    },

    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,

              ordersWithCoupons: {
                $sum: 1,
              },

              couponRevenue: {
                $sum: "$totalAmount",
              },

              totalDiscountGiven: {
                $sum: {
                  $ifNull: ["$couponDiscount", 0],
                },
              },
            },
          },
        ],

        couponUsage: [
          {
            $group: {
              _id: "$couponCode",

              usageCount: {
                $sum: 1,
              },

              revenue: {
                $sum: "$totalAmount",
              },

              discountGiven: {
                $sum: {
                  $ifNull: ["$couponDiscount", 0],
                },
              },
            },
          },

          {
            $sort: {
              usageCount: -1,
              revenue: -1,
            },
          },

          {
            $limit: 10,
          },

          {
            $project: {
              _id: 0,

              code: "$_id",

              usageCount: 1,

              revenue: {
                $round: ["$revenue", 2],
              },

              discountGiven: {
                $round: ["$discountGiven", 2],
              },
            },
          },
        ],
      },
    },
  ]);

  const summary = result[0]?.summary?.[0];

  const ordersWithCoupons = summary?.ordersWithCoupons ?? 0;
  const couponRevenue = summary?.couponRevenue ?? 0;
  const totalDiscountGiven = summary?.totalDiscountGiven ?? 0;

  const averageOrderValueWithCoupons =
    ordersWithCoupons > 0
      ? Number((couponRevenue / ordersWithCoupons).toFixed(2))
      : 0;

  const topCoupons = result[0]?.couponUsage ?? [];

  const mostUsedCoupon = topCoupons[0] ?? null;

  return {
    totalCouponUsage: ordersWithCoupons,

    ordersWithCoupons,

    couponRevenue: Number(couponRevenue.toFixed(2)),

    totalDiscountGiven: Number(totalDiscountGiven.toFixed(2)),

    averageOrderValueWithCoupons,

    mostUsedCoupon,

    topCoupons,
  };
};