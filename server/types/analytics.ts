import type { AnalyticsComparison } from "../utils/analyticsComparison";

export interface AnalyticsDateRange {
  range: string;
  startDate: Date;
  endDate: Date;
  previousStartDate: Date;
  previousEndDate: Date;
}

export interface AnalyticsSummaryMetric extends AnalyticsComparison {}

export interface AnalyticsSummary {
  totalRevenue: AnalyticsSummaryMetric;
  totalOrders: AnalyticsSummaryMetric;
  unitsSold: AnalyticsSummaryMetric;
  averageOrderValue: AnalyticsSummaryMetric;
  newCustomers: AnalyticsSummaryMetric;
  cancelledOrders: AnalyticsSummaryMetric;
  pendingRevenue: AnalyticsSummaryMetric;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
  orders: number;
  unitsSold: number;
  averageOrderValue: number;
}

export interface OrderStatusAnalytics {
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  count: number;
  percentage: number;
}

export interface PaymentMethodAnalytics {
  method: "cod" | "card" | "upi";
  orders: number;
  revenue: number;
  percentage: number;
}

export interface PaymentStatusAnalytics {
  status: "pending" | "paid" | "failed";
  orders: number;
  revenue: number;
  percentage: number;
}

export interface TopProductAnalytics {
  productId: string;
  name: string;
  image?: string;
  unitsSold: number;
  revenue: number;
  orderCount: number;
}

export interface InventoryProduct {
  productId: string;
  name: string;
  image?: string;
  stockQuantity: number;
  inStock: boolean;
}

export interface InventoryAnalytics {
  lowStockCount: number;
  outOfStockCount: number;
  lowStockProducts: InventoryProduct[];
  outOfStockProducts: InventoryProduct[];
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  oneTimeCustomers: number;
  repeatCustomers: number;
  repeatPurchaseRate: number;
  averageCustomerSpend: number;
  topCustomers: TopCustomerAnalytics[];
}

export interface RatingDistributionItem {
  rating: 1 | 2 | 3 | 4 | 5;
  count: number;
  percentage: number;
}

export interface ReviewAnalytics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: RatingDistributionItem[];
}

export interface QuestionAnalytics {
  totalQuestions: number;
  pendingQuestions: number;
  answeredQuestions: number;
  answeredToday: number;
  averageResponseTimeHours: number;
}

export interface AnalyticsInsight {
  type: "positive" | "warning" | "negative" | "info";
  title: string;
  message: string;
}

export interface CouponPerformanceItem {
  code: string;
  usageCount: number;
  revenue: number;
  discountGiven: number;
}

export interface CouponAnalytics {
  totalCouponUsage: number;
  ordersWithCoupons: number;
  couponRevenue: number;
  totalDiscountGiven: number;
  averageOrderValueWithCoupons: number;
  mostUsedCoupon: CouponPerformanceItem | null;
  topCoupons: CouponPerformanceItem[];
}

export interface OrderPerformanceAnalytics {
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  deliverySuccessRate: number;
  cancellationRate: number;
  pendingOrderPercentage: number;
  averageFulfilmentTimeHours: number;
  averageProcessingTimeHours: number;
  averageShippingTimeHours: number;
}

export interface ProductPerformanceItem {
  productId: string;
  name: string;
  image: string;
  views: number;
  wishlistCount: number;
  unitsSold: number;
  revenue: number;
  stockQuantity: number;
}

export interface ProductPerformanceAnalytics {
  mostViewedProducts: ProductPerformanceItem[];
  mostWishlistedProducts: ProductPerformanceItem[];
  highestRevenueProducts: ProductPerformanceItem[];
  highViewsLowSales: ProductPerformanceItem[];
  productsWithNoSales: ProductPerformanceItem[];
}

export interface TopCustomerAnalytics {
  userId: string;
  name: string;
  email: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: Date;
  customerType: string;
}

export interface AdminAnalyticsResponse {
  productPerformance: ProductPerformanceAnalytics;
  dateRange: AnalyticsDateRange;

  summary: AnalyticsSummary;

  revenueTrend: RevenueTrendPoint[];

  orderStatuses: OrderStatusAnalytics[];

  paymentMethods: PaymentMethodAnalytics[];

  paymentStatuses: PaymentStatusAnalytics[];

  topProducts: TopProductAnalytics[];

  inventory: InventoryAnalytics;

  customers: CustomerAnalytics;

  reviews: ReviewAnalytics;

  questions: QuestionAnalytics;

  coupons: CouponAnalytics;

  orderPerformance: OrderPerformanceAnalytics;

  insights: AnalyticsInsight[];
}
