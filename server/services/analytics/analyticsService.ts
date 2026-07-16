import type { AdminAnalyticsResponse } from "../../types/analytics";
import type { AnalyticsRange } from "../../utils/analyticsDateRange";

import { getAnalyticsDateRange } from "../../utils/analyticsDateRange";

import { getCouponAnalytics } from "./couponAnalytics";
import { getCustomerAnalytics } from "./customerAnalytics";
import { generateAnalyticsInsights } from "./insightsAnalytics";
import { getInventoryAnalytics } from "./inventoryAnalytics";
import { getOrderPerformanceAnalytics } from "./orderPerformanceAnalytics";
import { getOrderStatusAnalytics } from "./orderStatusAnalytics";
import { getPaymentMethodAnalytics } from "./paymentMethodAnalytics";
import { getPaymentStatusAnalytics } from "./paymentStatusAnalytics";
import { getProductPerformanceAnalytics } from "./productPerformanceAnalytics";
import { getQuestionAnalytics } from "./questionAnalytics";
import { getRevenueTrendAnalytics } from "./revenueTrendAnalytics";
import { getReviewAnalytics } from "./reviewAnalytics";
import { getSummaryAnalytics } from "./summaryAnalytics";
import { getTopProductsAnalytics } from "./topProductsAnalytics";

interface GetAdminAnalyticsOptions {
  range?: AnalyticsRange;
  startDate?: string;
  endDate?: string;
  groupBy?: "daily" | "weekly" | "monthly";
}

export const getAdminAnalytics = async ({
  range = "30d",
  startDate,
  endDate,
  groupBy = "daily",
}: GetAdminAnalyticsOptions): Promise<AdminAnalyticsResponse> => {
  const dateRange = getAnalyticsDateRange({
    range,
    startDate,
    endDate,
  });

  const currentRange = {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  };

  const previousRange = {
    startDate: dateRange.previousStartDate,
    endDate: dateRange.previousEndDate,
  };

  const [
    summary,
    revenueTrend,
    orderStatuses,
    paymentMethods,
    paymentStatuses,
    topProducts,
    inventory,
    customers,
    reviews,
    questions,
    coupons,
    orderPerformance,
    productPerformance,
  ] = await Promise.all([
    getSummaryAnalytics({
      currentRange,
      previousRange,
    }),

    getRevenueTrendAnalytics({
      startDate: currentRange.startDate,
      endDate: currentRange.endDate,
      groupBy,
    }),

    getOrderStatusAnalytics({
      startDate: currentRange.startDate,
      endDate: currentRange.endDate,
    }),

    getPaymentMethodAnalytics({
      startDate: currentRange.startDate,
      endDate: currentRange.endDate,
    }),

    getPaymentStatusAnalytics({
      startDate: currentRange.startDate,
      endDate: currentRange.endDate,
    }),

    getTopProductsAnalytics({
      startDate: currentRange.startDate,
      endDate: currentRange.endDate,
      limit: 10,
    }),

    getInventoryAnalytics({
      lowStockThreshold: 2,
      limit: 10,
    }),

    getCustomerAnalytics({
      startDate: currentRange.startDate,
      endDate: currentRange.endDate,
      limit: 10,
    }),

    getReviewAnalytics({
      startDate: currentRange.startDate,
      endDate: currentRange.endDate,
    }),

    getQuestionAnalytics({
      startDate: currentRange.startDate,
      endDate: currentRange.endDate,
    }),

    getCouponAnalytics({
      startDate: currentRange.startDate,
      endDate: currentRange.endDate,
    }),

    getOrderPerformanceAnalytics({
      startDate: currentRange.startDate,
      endDate: currentRange.endDate,
    }),

    getProductPerformanceAnalytics({
      startDate: currentRange.startDate,
      endDate: currentRange.endDate,
      limit: 10,
    }),
  ]);

  const insights = generateAnalyticsInsights({
    summary,
    inventory,
    questions,
    reviews,
    coupons,
    paymentMethods,
  });

  return {
    dateRange: {
      range,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      previousStartDate: dateRange.previousStartDate,
      previousEndDate: dateRange.previousEndDate,
    },

    summary,
    revenueTrend,
    orderStatuses,
    orderPerformance,
    paymentMethods,
    paymentStatuses,
    topProducts,
    productPerformance,
    inventory,
    customers,
    reviews,
    questions,
    coupons,
    insights,
  };
};
