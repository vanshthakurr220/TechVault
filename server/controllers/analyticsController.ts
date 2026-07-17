import type { Request, Response } from "express";

import { getAdminAnalytics } from "../services/analytics/analyticsService";

import type { AnalyticsRange } from "../utils/analyticsDateRange";

export const fetchAdminAnalytics = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const groupBy =
      typeof req.query.groupBy === "string" ? req.query.groupBy : "daily";

    const allowedGroupBy = ["daily", "weekly", "monthly"];

    if (!allowedGroupBy.includes(groupBy)) {
      res.status(400).json({
        message: "Invalid groupBy. Use daily, weekly, or monthly.",
      });

      return;
    }
    const range = (req.query.range as AnalyticsRange | undefined) ?? "30d";

    const startDate =
      typeof req.query.startDate === "string" ? req.query.startDate : undefined;

    const endDate =
      typeof req.query.endDate === "string" ? req.query.endDate : undefined;

    const allowedRanges: AnalyticsRange[] = [
      "today",
      "yesterday",
      "7d",
      "30d",
      "90d",
      "6m",
      "1y",
      "custom",
    ];

    if (!allowedRanges.includes(range)) {
      res.status(400).json({
        message:
          "Invalid analytics range. Use today, yesterday, 7d, 30d, 90d, 6m, 1y, or custom.",
      });

      return;
    }

    if (range === "custom" && (!startDate || !endDate)) {
      res.status(400).json({
        message: "startDate and endDate are required when range is custom.",
      });

      return;
    }

    const analytics = await getAdminAnalytics({
      range,
      startDate,
      endDate,
      groupBy: groupBy as "daily" | "weekly" | "monthly",
    });

    res.status(200).json({
      message: "Analytics fetched successfully",
      analytics,
    });
  } catch (error) {
    console.error("Failed to fetch admin analytics:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch admin analytics";

    res.status(500).json({
      message,
    });
  }
};
