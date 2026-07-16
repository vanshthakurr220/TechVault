import { Order } from "server/models/Order";

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface GetRevenueTrendOptions {
  startDate: Date;
  endDate: Date;
  groupBy?: "daily" | "weekly" | "monthly";
}

export const getRevenueTrendAnalytics = async ({
  startDate,
  endDate,
  groupBy = "daily",
}: GetRevenueTrendOptions) => {
  let dateFormat: string;

  switch (groupBy) {
    case "weekly":
      dateFormat = "%G-W%V";
      break;

    case "monthly":
      dateFormat = "%Y-%m";
      break;

    case "daily":
    default:
      dateFormat = "%Y-%m-%d";
      break;
  }

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
      $unwind: {
        path: "$items",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $group: {
        _id: {
          orderId: "$_id",

          date: {
            $dateToString: {
              format: dateFormat,
              date: "$createdAt",
              timezone: "Asia/Kolkata",
            },
          },
        },

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
        _id: "$_id.date",

        revenue: {
          $sum: "$totalAmount",
        },

        orders: {
          $sum: 1,
        },

        unitsSold: {
          $sum: "$unitsSold",
        },
      },
    },

    {
      $addFields: {
        averageOrderValue: {
          $cond: [
            {
              $gt: ["$orders", 0],
            },
            {
              $divide: ["$revenue", "$orders"],
            },
            0,
          ],
        },
      },
    },

    {
      $sort: {
        _id: 1,
      },
    },

    {
      $project: {
        _id: 0,

        date: "$_id",

        revenue: {
          $round: ["$revenue", 2],
        },

        orders: 1,

        unitsSold: 1,

        averageOrderValue: {
          $round: ["$averageOrderValue", 2],
        },
      },
    },
  ]);

  return fillMissingTrendPeriods(result, startDate, endDate, groupBy);
};

type TrendGroupBy = "daily" | "weekly" | "monthly";

interface RevenueTrendItem {
  date: string;
  revenue: number;
  orders: number;
  unitsSold: number;
  averageOrderValue: number;
}

const formatDailyKey = (date: Date): string => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const formatMonthlyKey = (date: Date): string => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).format(date);
};

const getISOWeekKey = (date: Date): string => {
  const value = new Date(date);

  value.setUTCHours(0, 0, 0, 0);

  const day = value.getUTCDay() || 7;

  value.setUTCDate(value.getUTCDate() + 4 - day);

  const yearStart = new Date(Date.UTC(value.getUTCFullYear(), 0, 1));

  const weekNumber = Math.ceil(
    ((value.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );

  return `${value.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
};

const createEmptyTrendItem = (date: string): RevenueTrendItem => ({
  date,
  revenue: 0,
  orders: 0,
  unitsSold: 0,
  averageOrderValue: 0,
});

const fillMissingTrendPeriods = (
  data: RevenueTrendItem[],
  startDate: Date,
  endDate: Date,
  groupBy: TrendGroupBy,
): RevenueTrendItem[] => {
  const trendMap = new Map(data.map((item) => [item.date, item]));

  const result: RevenueTrendItem[] = [];

  const cursor = new Date(startDate);

  if (groupBy === "monthly") {
    cursor.setDate(1);
    cursor.setHours(0, 0, 0, 0);

    while (cursor <= endDate) {
      const key = formatMonthlyKey(cursor);

      result.push(trendMap.get(key) ?? createEmptyTrendItem(key));

      cursor.setMonth(cursor.getMonth() + 1);
    }

    return result;
  }

  if (groupBy === "weekly") {
    cursor.setHours(0, 0, 0, 0);

    while (cursor <= endDate) {
      const key = getISOWeekKey(cursor);

      if (!result.some((item) => item.date === key)) {
        result.push(trendMap.get(key) ?? createEmptyTrendItem(key));
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    return result;
  }

  cursor.setHours(0, 0, 0, 0);

  while (cursor <= endDate) {
    const key = formatDailyKey(cursor);

    result.push(trendMap.get(key) ?? createEmptyTrendItem(key));

    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
};
