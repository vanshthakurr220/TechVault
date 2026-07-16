import { Order } from "server/models/Order";

interface GetOrderStatusAnalyticsOptions {
  startDate: Date;
  endDate: Date;
}

const orderStatuses = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const getOrderStatusAnalytics = async ({
  startDate,
  endDate,
}: GetOrderStatusAnalyticsOptions) => {
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },

    {
      $group: {
        _id: "$status",

        count: {
          $sum: 1,
        },
      },
    },
  ]);

  const totalOrders = result.reduce((total, item) => total + item.count, 0);

  return orderStatuses.map((status) => {
    const matchingStatus = result.find((item) => item._id === status);

    const count = matchingStatus?.count ?? 0;

    const percentage =
      totalOrders > 0 ? Number(((count / totalOrders) * 100).toFixed(2)) : 0;

    return {
      status,
      count,
      percentage,
    };
  });
};
