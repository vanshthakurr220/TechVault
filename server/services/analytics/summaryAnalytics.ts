import { Order } from "server/models/Order";
import { User } from "server/models/User";

import { calculateAnalyticsComparison } from "../../utils/analyticsComparison";

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface OrderSummaryResult {
  totalRevenue: number;
  totalOrders: number;
  unitsSold: number;
  averageOrderValue: number;
  cancelledOrders: number;
  pendingRevenue: number;
}

const getOrderSummaryForPeriod = async ({
  startDate,
  endDate,
}: DateRange): Promise<OrderSummaryResult> => {
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
      $facet: {
        completedOrders: [
          {
            $match: {
              status: "delivered",
              paymentStatus: "paid",
            },
          },

          {
            $unwind: {
              path: "$items",
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $group: {
              _id: "$_id",

              totalAmount: {
                $first: "$totalAmount",
              },

              unitsSold: {
                $sum: {
                  $ifNull: ["$items.quantity", 0],
                },
              },
            },
          },

          {
            $group: {
              _id: null,

              totalRevenue: {
                $sum: "$totalAmount",
              },

              totalOrders: {
                $sum: 1,
              },

              unitsSold: {
                $sum: "$unitsSold",
              },
            },
          },
        ],

        pendingRevenue: [
          {
            $match: {
              status: {
                $in: ["pending", "processing", "shipped"],
              },
            },
          },

          {
            $group: {
              _id: null,

              amount: {
                $sum: "$totalAmount",
              },
            },
          },
        ],

        cancelledOrders: [
          {
            $match: {
              status: "cancelled",
            },
          },

          {
            $count: "count",
          },
        ],
      },
    },

    {
      $project: {
        completedOrders: {
          $arrayElemAt: ["$completedOrders", 0],
        },

        pendingRevenue: {
          $arrayElemAt: ["$pendingRevenue", 0],
        },

        cancelledOrders: {
          $arrayElemAt: ["$cancelledOrders", 0],
        },
      },
    },
  ]);

  const completedOrders = result[0]?.completedOrders;

  const totalRevenue = completedOrders?.totalRevenue ?? 0;
  const totalOrders = completedOrders?.totalOrders ?? 0;
  const unitsSold = completedOrders?.unitsSold ?? 0;

  const pendingRevenue =
    result[0]?.pendingRevenue?.amount ?? 0;

  const cancelledOrders =
    result[0]?.cancelledOrders?.count ?? 0;

  const averageOrderValue =
    totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalOrders,
    unitsSold,
    averageOrderValue: Number(
      averageOrderValue.toFixed(2),
    ),
    cancelledOrders,
    pendingRevenue: Number(
      pendingRevenue.toFixed(2),
    ),
  };
};

const getNewCustomerCount = async ({
  startDate,
  endDate,
}: DateRange): Promise<number> => {
  return User.countDocuments({
    role: {
      $ne: "admin",
    },

    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  });
};

interface GetSummaryAnalyticsOptions {
  currentRange: DateRange;
  previousRange: DateRange;
}

export const getSummaryAnalytics = async ({
  currentRange,
  previousRange,
}: GetSummaryAnalyticsOptions) => {
  const [
    currentOrderSummary,
    previousOrderSummary,
    currentNewCustomers,
    previousNewCustomers,
  ] = await Promise.all([
    getOrderSummaryForPeriod(currentRange),
    getOrderSummaryForPeriod(previousRange),
    getNewCustomerCount(currentRange),
    getNewCustomerCount(previousRange),
  ]);

  return {
    totalRevenue: calculateAnalyticsComparison(
      currentOrderSummary.totalRevenue,
      previousOrderSummary.totalRevenue,
    ),

    totalOrders: calculateAnalyticsComparison(
      currentOrderSummary.totalOrders,
      previousOrderSummary.totalOrders,
    ),

    unitsSold: calculateAnalyticsComparison(
      currentOrderSummary.unitsSold,
      previousOrderSummary.unitsSold,
    ),

    averageOrderValue: calculateAnalyticsComparison(
      currentOrderSummary.averageOrderValue,
      previousOrderSummary.averageOrderValue,
    ),

    newCustomers: calculateAnalyticsComparison(
      currentNewCustomers,
      previousNewCustomers,
    ),

    cancelledOrders: calculateAnalyticsComparison(
      currentOrderSummary.cancelledOrders,
      previousOrderSummary.cancelledOrders,
    ),

    pendingRevenue: calculateAnalyticsComparison(
      currentOrderSummary.pendingRevenue,
      previousOrderSummary.pendingRevenue,
    ),
  };
};