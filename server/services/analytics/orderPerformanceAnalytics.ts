import { Order } from "server/models/Order";

interface GetOrderPerformanceAnalyticsOptions {
  startDate: Date;
  endDate: Date;
}

export const getOrderPerformanceAnalytics = async ({
  startDate,
  endDate,
}: GetOrderPerformanceAnalyticsOptions) => {
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
        statusSummary: [
          {
            $group: {
              _id: null,

              totalOrders: {
                $sum: 1,
              },

              deliveredOrders: {
                $sum: {
                  $cond: [
                    {
                      $eq: ["$status", "delivered"],
                    },
                    1,
                    0,
                  ],
                },
              },

              cancelledOrders: {
                $sum: {
                  $cond: [
                    {
                      $eq: ["$status", "cancelled"],
                    },
                    1,
                    0,
                  ],
                },
              },

              pendingOrders: {
                $sum: {
                  $cond: [
                    {
                      $eq: ["$status", "pending"],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ],

        fulfilmentTimes: [
          {
            $match: {
              "statusHistory.deliveredAt": {
                $ne: null,
              },
            },
          },

          {
            $project: {
              fulfilmentMilliseconds: {
                $subtract: ["$statusHistory.deliveredAt", "$createdAt"],
              },
            },
          },

          {
            $group: {
              _id: null,

              averageFulfilmentMilliseconds: {
                $avg: "$fulfilmentMilliseconds",
              },
            },
          },
        ],

        processingTimes: [
          {
            $match: {
              "statusHistory.processingAt": {
                $ne: null,
              },
            },
          },

          {
            $project: {
              processingMilliseconds: {
                $subtract: ["$statusHistory.processingAt", "$createdAt"],
              },
            },
          },

          {
            $group: {
              _id: null,

              averageProcessingMilliseconds: {
                $avg: "$processingMilliseconds",
              },
            },
          },
        ],

        shippingTimes: [
          {
            $match: {
              "statusHistory.shippedAt": {
                $ne: null,
              },

              "statusHistory.processingAt": {
                $ne: null,
              },
            },
          },

          {
            $project: {
              shippingMilliseconds: {
                $subtract: [
                  "$statusHistory.shippedAt",
                  "$statusHistory.processingAt",
                ],
              },
            },
          },

          {
            $group: {
              _id: null,

              averageShippingMilliseconds: {
                $avg: "$shippingMilliseconds",
              },
            },
          },
        ],
      },
    },
  ]);

  const statusSummary = result[0]?.statusSummary?.[0];

  const totalOrders = statusSummary?.totalOrders ?? 0;
  const deliveredOrders = statusSummary?.deliveredOrders ?? 0;
  const cancelledOrders = statusSummary?.cancelledOrders ?? 0;
  const pendingOrders = statusSummary?.pendingOrders ?? 0;

  const averageFulfilmentMilliseconds =
    result[0]?.fulfilmentTimes?.[0]?.averageFulfilmentMilliseconds ?? 0;

  const averageProcessingMilliseconds =
    result[0]?.processingTimes?.[0]?.averageProcessingMilliseconds ?? 0;

  const averageShippingMilliseconds =
    result[0]?.shippingTimes?.[0]?.averageShippingMilliseconds ?? 0;

  const millisecondsInHour = 1000 * 60 * 60;

  return {
    totalOrders,

    deliveredOrders,

    cancelledOrders,

    pendingOrders,

    deliverySuccessRate:
      totalOrders > 0
        ? Number(((deliveredOrders / totalOrders) * 100).toFixed(2))
        : 0,

    cancellationRate:
      totalOrders > 0
        ? Number(((cancelledOrders / totalOrders) * 100).toFixed(2))
        : 0,

    pendingOrderPercentage:
      totalOrders > 0
        ? Number(((pendingOrders / totalOrders) * 100).toFixed(2))
        : 0,

    averageFulfilmentTimeHours: Number(
      (averageFulfilmentMilliseconds / millisecondsInHour).toFixed(2),
    ),

    averageProcessingTimeHours: Number(
      (averageProcessingMilliseconds / millisecondsInHour).toFixed(2),
    ),

    averageShippingTimeHours: Number(
      (averageShippingMilliseconds / millisecondsInHour).toFixed(2),
    ),
  };
};
