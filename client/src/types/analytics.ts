// ============================================================================
// Analytics Filters
// ============================================================================

export type AnalyticsRange =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "90d"
  | "6m"
  | "1y"
  | "custom";

export type AnalyticsGroupBy = "daily" | "weekly" | "monthly";

export interface AnalyticsFilters {
  range?: AnalyticsRange;
  groupBy?: AnalyticsGroupBy;
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// Common Types
// ============================================================================

export interface AnalyticsComparison {
  current: number;
  previous: number;
  difference: number;
  percentageChange: number;
  trend: "up" | "down" | "neutral";
}

export interface AnalyticsDateRange {
  range: AnalyticsRange;
  startDate: string;
  endDate: string;
  previousStartDate: string;
  previousEndDate: string;
}

// ============================================================================
// Summary
// ============================================================================

export interface SummaryAnalytics {
  totalRevenue: AnalyticsComparison;
  totalOrders: AnalyticsComparison;
  unitsSold: AnalyticsComparison;
  averageOrderValue: AnalyticsComparison;
  newCustomers: AnalyticsComparison;
  cancelledOrders: AnalyticsComparison;
  pendingRevenue: AnalyticsComparison;
}

// ============================================================================
// Revenue Trend
// ============================================================================

export interface RevenueTrendItem {
  date: string;
  revenue: number;
  orders: number;
  unitsSold: number;
  averageOrderValue: number;
}

// ============================================================================
// Order Analytics
// ============================================================================

export interface OrderStatusItem {
  status: string;
  count: number;
  percentage: number;
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

// ============================================================================
// Payment Analytics
// ============================================================================

export interface PaymentMethodItem {
  method: string;
  orders: number;
  revenue: number;
  percentage: number;
}

export interface PaymentStatusItem {
  status: string;
  orders: number;
  revenue: number;
  percentage: number;
}

// ============================================================================
// Product Analytics
// ============================================================================

export interface ProductAnalyticsItem {
  productId: string;
  name: string;
  image: string;
  views: number;
  wishlistCount: number;
  unitsSold: number;
  revenue: number;
  stockQuantity: number;
}

export interface TopProductItem {
  productId: string;
  name: string;
  image: string;
  unitsSold: number;
  orderCount: number;
  revenue: number;
}

export interface ProductPerformanceAnalytics {
  mostViewedProducts: ProductAnalyticsItem[];
  mostWishlistedProducts: ProductAnalyticsItem[];
  highestRevenueProducts: ProductAnalyticsItem[];
  highViewsLowSales: ProductAnalyticsItem[];
  productsWithNoSales: ProductAnalyticsItem[];
}

// ============================================================================
// Inventory
// ============================================================================

export interface InventoryProduct {
  productId: string;
  name: string;
  image: string;
  stockQuantity: number;
  inStock: boolean;
}

export interface InventoryAnalytics {
  lowStockCount: number;
  outOfStockCount: number;
  lowStockProducts: InventoryProduct[];
  outOfStockProducts: InventoryProduct[];
}

// ============================================================================
// Customers
// ============================================================================

export interface TopCustomer {
  userId: string;
  name: string;
  email: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
  customerType: string;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  oneTimeCustomers: number;
  repeatCustomers: number;
  repeatPurchaseRate: number;
  averageCustomerSpend: number;
  topCustomers: TopCustomer[];
}

// ============================================================================
// Reviews
// ============================================================================

export interface RatingDistributionItem {
  rating: number;
  count: number;
  percentage: number;
}

export interface ReviewAnalytics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: RatingDistributionItem[];
}

// ============================================================================
// Questions
// ============================================================================

export interface QuestionAnalytics {
  totalQuestions: number;
  pendingQuestions: number;
  answeredQuestions: number;
  answeredToday: number;
  averageResponseTimeHours: number;
}

// ============================================================================
// Coupons
// ============================================================================

export interface CouponAnalytics {
  totalCouponUsage: number;
  ordersWithCoupons: number;
  couponRevenue: number;
  totalDiscountGiven: number;
  averageOrderValueWithCoupons: number;
  mostUsedCoupon: string | null;
  topCoupons: any[];
}

// ============================================================================
// Insights
// ============================================================================

export interface AnalyticsInsight {
  type: "positive" | "negative" | "warning" | "info";
  title: string;
  message: string;
}

// ============================================================================
// Complete Response
// ============================================================================

export interface AdminAnalytics {
  dateRange: AnalyticsDateRange;

  summary: SummaryAnalytics;

  revenueTrend: RevenueTrendItem[];

  orderStatuses: OrderStatusItem[];

  orderPerformance: OrderPerformanceAnalytics;

  paymentMethods: PaymentMethodItem[];

  paymentStatuses: PaymentStatusItem[];

  topProducts: TopProductItem[];

  productPerformance: ProductPerformanceAnalytics;

  inventory: InventoryAnalytics;

  customers: CustomerAnalytics;

  reviews: ReviewAnalytics;

  questions: QuestionAnalytics;

  coupons: CouponAnalytics;

  insights: AnalyticsInsight[];
}
