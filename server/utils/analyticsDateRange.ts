export type AnalyticsRange =
  | "yesterday"
  | "today"
  | "7d"
  | "30d"
  | "90d"
  | "6m"
  | "1y"
  | "custom";

interface GetAnalyticsDateRangeOptions {
  range?: AnalyticsRange;
  startDate?: string;
  endDate?: string;
}

interface AnalyticsDateRangeResult {
  startDate: Date;
  endDate: Date;
  previousStartDate: Date;
  previousEndDate: Date;
}

const startOfDay = (date: Date): Date => {
  const value = new Date(date);

  value.setHours(0, 0, 0, 0);

  return value;
};

const endOfDay = (date: Date): Date => {
  const value = new Date(date);

  value.setHours(23, 59, 59, 999);

  return value;
};

export const getAnalyticsDateRange = ({
  range = "30d",
  startDate,
  endDate,
}: GetAnalyticsDateRangeOptions): AnalyticsDateRangeResult => {
  const now = new Date();

  let currentStartDate: Date;
  let currentEndDate: Date;

  if (range === "custom") {
    if (!startDate || !endDate) {
      throw new Error(
        "startDate and endDate are required when range is custom",
      );
    }

    currentStartDate = startOfDay(new Date(startDate));
    currentEndDate = endOfDay(new Date(endDate));

    if (
      Number.isNaN(currentStartDate.getTime()) ||
      Number.isNaN(currentEndDate.getTime())
    ) {
      throw new Error("Invalid custom date range");
    }

    if (currentStartDate > currentEndDate) {
      throw new Error("startDate cannot be after endDate");
    }
  } else {
    currentEndDate = endOfDay(now);

    switch (range) {
      case "today":
        currentStartDate = startOfDay(now);
        break;

      case "yesterday":
        currentStartDate = startOfDay(new Date(now));
        currentStartDate.setDate(currentStartDate.getDate() - 1);

        currentEndDate = endOfDay(new Date(now));
        currentEndDate.setDate(currentEndDate.getDate() - 1);
        break;

      case "7d":
        currentStartDate = startOfDay(now);
        currentStartDate.setDate(currentStartDate.getDate() - 6);
        break;

      case "30d":
        currentStartDate = startOfDay(now);
        currentStartDate.setDate(currentStartDate.getDate() - 29);
        break;

      case "90d":
        currentStartDate = startOfDay(now);
        currentStartDate.setDate(currentStartDate.getDate() - 89);
        break;
      case "6m":
        currentStartDate = startOfDay(now);
        currentStartDate.setMonth(currentStartDate.getMonth() - 6);
        currentStartDate.setDate(currentStartDate.getDate() + 1);
        break;

      case "1y":
        currentStartDate = startOfDay(now);
        currentStartDate.setFullYear(currentStartDate.getFullYear() - 1);
        currentStartDate.setDate(currentStartDate.getDate() + 1);
        break;

      default:
        throw new Error("Invalid analytics range");
    }
  }

  const periodDuration =
    currentEndDate.getTime() - currentStartDate.getTime() + 1;

  const previousEndDate = new Date(currentStartDate.getTime() - 1);

  const previousStartDate = new Date(
    previousEndDate.getTime() - periodDuration + 1,
  );

  return {
    startDate: currentStartDate,
    endDate: currentEndDate,
    previousStartDate,
    previousEndDate,
  };
};
