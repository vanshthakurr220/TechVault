import { Order } from "server/models/Order";

interface GetPaymentMethodAnalyticsOptions {
  startDate: Date;
  endDate: Date;
}

const paymentMethods = ["cod", "card", "upi"] as const;

export const getPaymentMethodAnalytics = async ({
  startDate,
  endDate,
}: GetPaymentMethodAnalyticsOptions) => {
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
      $group: {
        _id: "$paymentMethod",

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

  return paymentMethods.map((method) => {
    const matchingMethod = result.find((item) => item._id === method);

    const orders = matchingMethod?.orders ?? 0;
    const revenue = matchingMethod?.revenue ?? 0;

    const percentage =
      totalOrders > 0 ? Number(((orders / totalOrders) * 100).toFixed(2)) : 0;

    return {
      method,
      orders,
      revenue: Number(revenue.toFixed(2)),
      percentage,
    };
  });
};
