import mongoose from "mongoose";

import { Order } from "server/models/Order";
import { User } from "server/models/User";

interface GetCustomerAnalyticsOptions {
  startDate: Date;
  endDate: Date;
  limit?: number;
}

export const getCustomerAnalytics = async ({
  startDate,
  endDate,
  limit = 10,
}: GetCustomerAnalyticsOptions) => {
  const [totalCustomers, newCustomers, customerOrderStats] = await Promise.all([
    User.countDocuments({
      role: {
        $ne: "admin",
      },
    }),

    User.countDocuments({
      role: {
        $ne: "admin",
      },

      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }),

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
        $group: {
          _id: "$userId",

          orderCount: {
            $sum: 1,
          },

          totalSpent: {
            $sum: "$totalAmount",
          },

          lastOrderAt: {
            $max: "$createdAt",
          },
        },
      },

      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,

                customersWithOrders: {
                  $sum: 1,
                },

                oneTimeCustomers: {
                  $sum: {
                    $cond: [
                      {
                        $eq: ["$orderCount", 1],
                      },
                      1,
                      0,
                    ],
                  },
                },

                repeatCustomers: {
                  $sum: {
                    $cond: [
                      {
                        $gt: ["$orderCount", 1],
                      },
                      1,
                      0,
                    ],
                  },
                },

                totalCustomerSpend: {
                  $sum: "$totalSpent",
                },
              },
            },
          ],

          topCustomers: [
            {
              $sort: {
                totalSpent: -1,
                orderCount: -1,
              },
            },

            {
              $limit: limit,
            },

            {
              $project: {
                _id: 0,

                userId: "$_id",

                orderCount: 1,

                totalSpent: {
                  $round: ["$totalSpent", 2],
                },

                lastOrderAt: 1,

                customerType: {
                  $cond: [
                    {
                      $gt: ["$orderCount", 1],
                    },
                    "Returning",
                    "One-time",
                  ],
                },
              },
            },
          ],
        },
      },
    ]),
  ]);

  const stats = customerOrderStats[0]?.summary?.[0];

  const topCustomerOrders = customerOrderStats[0]?.topCustomers ?? [];

  const customersWithOrders = stats?.customersWithOrders ?? 0;

  const oneTimeCustomers = stats?.oneTimeCustomers ?? 0;

  const repeatCustomers = stats?.repeatCustomers ?? 0;

  const totalCustomerSpend = stats?.totalCustomerSpend ?? 0;

  const returningCustomers = repeatCustomers;

  const repeatPurchaseRate =
    customersWithOrders > 0
      ? Number(((repeatCustomers / customersWithOrders) * 100).toFixed(2))
      : 0;

  const averageCustomerSpend =
    customersWithOrders > 0
      ? Number((totalCustomerSpend / customersWithOrders).toFixed(2))
      : 0;

  const customerIdentifiers: string[] = topCustomerOrders
    .map((customer: { userId?: string }) => customer.userId)
    .filter((userId: string | undefined): userId is string => Boolean(userId));

  const customerObjectIds = customerIdentifiers
    .filter((identifier) => mongoose.Types.ObjectId.isValid(identifier))
    .map((identifier) => new mongoose.Types.ObjectId(identifier));

  const customerEmails = customerIdentifiers.filter((identifier) =>
    identifier.includes("@"),
  );

  const customerFilters: Array<Record<string, unknown>> = [];

  if (customerObjectIds.length > 0) {
    customerFilters.push({
      _id: {
        $in: customerObjectIds,
      },
    });
  }

  if (customerEmails.length > 0) {
    customerFilters.push({
      email: {
        $in: customerEmails,
      },
    });
  }

  const customerDocuments =
    customerFilters.length > 0
      ? await User.find({
          $or: customerFilters,
        })
          .select("_id username email")
          .lean()
      : [];

  const topCustomers = topCustomerOrders.map(
    (customer: {
      userId: string;
      orderCount: number;
      totalSpent: number;
      lastOrderAt: Date;
      customerType: string;
    }) => {
      const customerIdentifier = customer.userId?.toString() ?? "";

      const customerDocument = customerDocuments.find(
        (user) =>
          user._id.toString() === customerIdentifier ||
          user.email === customerIdentifier,
      );

      return {
        userId: customerIdentifier,

        name: customerDocument?.username ?? "Unknown Customer",

        email:
          customerDocument?.email ??
          (customerIdentifier.includes("@") ? customerIdentifier : ""),

        orderCount: customer.orderCount,

        totalSpent: Number((customer.totalSpent ?? 0).toFixed(2)),

        lastOrderAt: customer.lastOrderAt,

        customerType: customer.customerType,
      };
    },
  );

  return {
    totalCustomers,
    newCustomers,
    returningCustomers,
    oneTimeCustomers,
    repeatCustomers,
    repeatPurchaseRate,
    averageCustomerSpend,
    topCustomers,
  };
};
