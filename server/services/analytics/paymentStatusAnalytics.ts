import { Order } from "server/models/Order";

interface GetPaymentStatusAnalyticsOptions {
  startDate: Date;
  endDate: Date;
}

const paymentStatuses = ["pending", "paid", "failed"] as const;

export const getPaymentStatusAnalytics = async ({
  startDate,
  endDate,
}: GetPaymentStatusAnalyticsOptions) => {
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },

        status: {
          $ne: "cancelled",
        },
      },
    },

    {
      $group: {
        _id: "$paymentStatus",

        orders: {
          $sum: 1,
        },

        revenue: {
          $sum: "$totalAmount",
        },
      },
    },
  ]);

  const totalOrders = result.reduce((total, item) => total + item.orders, 0);

  return paymentStatuses.map((status) => {
    const matchingStatus = result.find((item) => item._id === status);

    const orders = matchingStatus?.orders ?? 0;
    const revenue = matchingStatus?.revenue ?? 0;

    const percentage =
      totalOrders > 0 ? Number(((orders / totalOrders) * 100).toFixed(2)) : 0;

    return {
      status,
      orders,
      revenue: Number(revenue.toFixed(2)),
      percentage,
    };
  });
};
