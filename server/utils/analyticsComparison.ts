export interface AnalyticsComparison {
  current: number;
  previous: number;
  difference: number;
  percentageChange: number | null;
  trend: "up" | "down" | "same";
}

export const calculateAnalyticsComparison = (
  current: number,
  previous: number,
): AnalyticsComparison => {
  const difference = Number((current - previous).toFixed(2));

  let percentageChange: number | null;

  if (previous === 0) {
    percentageChange = current === 0 ? 0 : null;
  } else {
    percentageChange = (difference / previous) * 100;
  }

  let trend: AnalyticsComparison["trend"] = "same";

  if (difference > 0) {
    trend = "up";
  } else if (difference < 0) {
    trend = "down";
  }

  return {
    current,
    previous,
    difference,
    percentageChange:
      percentageChange === null ? null : Number(percentageChange.toFixed(2)),
    trend,
  };
};
