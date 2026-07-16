import type { AnalyticsInsight } from "../../types/analytics";

interface GenerateInsightsOptions {
  summary: {
    totalRevenue: {
      current: number;
      previous: number;
      percentageChange: number | null;
      trend: "up" | "down" | "same";
    };

    totalOrders: {
      current: number;
      previous: number;
      percentageChange: number | null;
      trend: "up" | "down" | "same";
    };

    cancelledOrders: {
      current: number;
      previous: number;
      percentageChange: number | null;
      trend: "up" | "down" | "same";
    };

    pendingRevenue: {
      current: number;
      previous: number;
      percentageChange: number | null;
      trend: "up" | "down" | "same";
    };
  };

  inventory: {
    lowStockCount: number;
    outOfStockCount: number;
  };

  questions: {
    pendingQuestions: number;
    averageResponseTimeHours: number;
  };

  reviews: {
    totalReviews: number;
    averageRating: number;
  };

  coupons: {
    ordersWithCoupons: number;
    couponRevenue: number;
    totalDiscountGiven: number;
    mostUsedCoupon: {
      code: string;
      usageCount: number;
      revenue: number;
      discountGiven: number;
    } | null;
  };

  paymentMethods: Array<{
    method: "cod" | "card" | "upi";
    orders: number;
    revenue: number;
    percentage: number;
  }>;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

export const generateAnalyticsInsights = ({
  summary,
  inventory,
  questions,
  reviews,
  coupons,
  paymentMethods,
}: GenerateInsightsOptions): AnalyticsInsight[] => {
  const insights: AnalyticsInsight[] = [];

  const revenueChange = summary.totalRevenue.percentageChange;

  if (revenueChange !== null && summary.totalRevenue.trend === "up") {
    insights.push({
      type: "positive",
      title: "Revenue increased",
      message: `Revenue increased by ${Math.abs(
        revenueChange,
      )}% compared with the previous period.`,
    });
  }

  if (revenueChange !== null && summary.totalRevenue.trend === "down") {
    insights.push({
      type: "negative",
      title: "Revenue declined",
      message: `Revenue decreased by ${Math.abs(
        revenueChange,
      )}% compared with the previous period.`,
    });
  }

  const orderChange = summary.totalOrders.percentageChange;

  if (orderChange !== null && summary.totalOrders.trend === "down") {
    insights.push({
      type: "warning",
      title: "Order volume decreased",
      message: `Order volume decreased by ${Math.abs(
        orderChange,
      )}% compared with the previous period.`,
    });
  }

  const cancellationChange = summary.cancelledOrders.percentageChange;

  if (cancellationChange !== null && summary.cancelledOrders.trend === "up") {
    insights.push({
      type: "negative",
      title: "Cancellations increased",
      message: `Cancelled orders increased by ${Math.abs(
        cancellationChange,
      )}% compared with the previous period.`,
    });
  }

  if (summary.pendingRevenue.current > 0) {
    insights.push({
      type: "warning",
      title: "Pending revenue",
      message: `${formatCurrency(
        summary.pendingRevenue.current,
      )} is currently pending payment.`,
    });
  }

  if (inventory.outOfStockCount > 0) {
    insights.push({
      type: "negative",
      title: "Products out of stock",
      message: `${inventory.outOfStockCount} product${
        inventory.outOfStockCount === 1 ? " is" : "s are"
      } currently out of stock.`,
    });
  }

  if (inventory.lowStockCount > 0) {
    insights.push({
      type: "warning",
      title: "Low-stock products",
      message: `${inventory.lowStockCount} product${
        inventory.lowStockCount === 1 ? " has" : "s have"
      } reached the low-stock threshold.`,
    });
  }

  if (questions.pendingQuestions > 0) {
    insights.push({
      type: "warning",
      title: "Questions awaiting answers",
      message: `${questions.pendingQuestions} customer question${
        questions.pendingQuestions === 1 ? " is" : "s are"
      } still awaiting an admin response.`,
    });
  }

  if (questions.averageResponseTimeHours > 24) {
    insights.push({
      type: "warning",
      title: "Slow question response time",
      message: `The average question response time is ${questions.averageResponseTimeHours} hours.`,
    });
  }

  if (reviews.totalReviews > 0 && reviews.averageRating < 3) {
    insights.push({
      type: "negative",
      title: "Low customer rating",
      message: `The average rating for the selected period is ${reviews.averageRating} out of 5.`,
    });
  } else if (reviews.totalReviews > 0 && reviews.averageRating >= 4) {
    insights.push({
      type: "positive",
      title: "Strong customer rating",
      message: `The average rating for the selected period is ${reviews.averageRating} out of 5.`,
    });
  }

  const codAnalytics = paymentMethods.find((item) => item.method === "cod");

  if (codAnalytics && codAnalytics.percentage >= 60) {
    insights.push({
      type: "info",
      title: "High COD usage",
      message: `${codAnalytics.percentage}% of completed paid orders use Cash on Delivery.`,
    });
  }

  if (coupons.mostUsedCoupon) {
    insights.push({
      type: "info",
      title: "Most-used coupon",
      message: `${coupons.mostUsedCoupon.code} was used ${coupons.mostUsedCoupon.usageCount} times and generated ${formatCurrency(
        coupons.mostUsedCoupon.revenue,
      )} in revenue.`,
    });
  }

  if (
    coupons.ordersWithCoupons > 0 &&
    coupons.totalDiscountGiven > coupons.couponRevenue * 0.25
  ) {
    insights.push({
      type: "warning",
      title: "High coupon discount cost",
      message: `Coupon discounts account for more than 25% of coupon-order revenue.`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: "info",
      title: "No major issues detected",
      message:
        "No significant performance warnings were found for the selected period.",
    });
  }

  return insights.slice(0, 10);
};
