import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import type {
  AnalyticsComparison,
  AnalyticsGroupBy,
  AnalyticsRange,
  InventoryProduct,
  ProductAnalyticsItem,
} from "@/types/analytics";

import {
  CalendarDays,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  BadgeIndianRupee,
  Banknote,
  BarChart3,
  Box,
  CircleDollarSign,
  CreditCard,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Trophy,
  UserPlus,
  WalletCards,
  XCircle,
  Eye,
  Heart,
  IndianRupee,
  Boxes,
  PackageX,
  PackageMinus,
  AlertTriangle,
  Repeat,
  Users,
  UserCheck,
  Star,
  MessageSquareText,
  MessagesSquare,
  MessageCircleQuestion,
  CircleHelp,
  Clock3,
  ReceiptIndianRupee,
  Gift,
  BadgePercent,
  TicketPercent,
  Info,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  Lightbulb,
  Package,
} from "lucide-react";
import { Link } from "wouter";
import AnimatedCounter from "@/components/admin/AnimatedCounter";

interface SummaryCardProps {
  title: string;
  value: number;
  valueType?: "number" | "currency";
  comparison?: AnalyticsComparison;
  description: string;
  icon: React.ElementType;
  iconClassName: string;
  iconBackgroundClassName: string;
}

type ProductMetric = "views" | "wishlistCount" | "revenue";



interface ProductPerformanceCardProps {
  title: string;
  description: string;
  products: ProductAnalyticsItem[];
  metric: ProductMetric;
  icon: React.ElementType;
  iconClassName: string;
  iconBackgroundClassName: string;
  progressClassName: string;
  emptyMessage: string;
}

interface InventoryProductListProps {
  title: string;
  description: string;
  products: InventoryProduct[];
  icon: React.ElementType;
  iconClassName: string;
  iconBackgroundClassName: string;
  stockBadgeClassName: string;
  emptyTitle: string;
  emptyMessage: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value);

const ANALYTICS_SECTIONS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "revenue-orders", label: "Revenue & Orders", icon: TrendingUp },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "products", label: "Products", icon: Package },
  { id: "inventory", label: "Inventory", icon: Boxes },
  { id: "customers", label: "Customers", icon: Users },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "questions", label: "Questions", icon: MessageSquareText },
  { id: "coupons", label: "Coupons", icon: TicketPercent },
  { id: "insights", label: "Insights", icon: Lightbulb },
];

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  processing: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

const PAYMENT_METHOD_COLORS: Record<string, string> = {
  cod: "#0f172a",
  card: "#3b82f6",
  upi: "#8b5cf6",
};
const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  paid: "#10b981",
  failed: "#ef4444",
};

const formatChartDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

const formatCompactCurrency = (value: number) => {
  if (value >= 10_000_000) {
    return `₹${(value / 10_000_000).toFixed(1)}Cr`;
  }

  if (value >= 100_000) {
    return `₹${(value / 100_000).toFixed(1)}L`;
  }

  if (value >= 1_000) {
    return `₹${(value / 1_000).toFixed(1)}K`;
  }

  return `₹${value}`;
};

const capitalizeText = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

function RevenueChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const chartData = payload[0]?.payload;

  return (
    <div className="min-w-52 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {formatChartDate(label)}
      </p>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-6">
          <span className="text-sm text-slate-500">Revenue</span>
          <span className="text-sm font-bold text-slate-950">
            {formatCurrency(chartData?.revenue || 0)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-6">
          <span className="text-sm text-slate-500">Orders</span>
          <span className="text-sm font-semibold text-slate-800">
            {formatNumber(chartData?.orders || 0)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-6">
          <span className="text-sm text-slate-500">Units sold</span>
          <span className="text-sm font-semibold text-slate-800">
            {formatNumber(chartData?.unitsSold || 0)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-6">
          <span className="text-sm text-slate-500">Avg. order</span>
          <span className="text-sm font-semibold text-slate-800">
            {formatCurrency(chartData?.averageOrderValue || 0)}
          </span>
        </div>
      </div>
    </div>
  );
}

function PieChartTooltip({
  active,
  payload,
  valueKey,
}: {
  active?: boolean;
  payload?: any[];
  valueKey: "count" | "orders";
}) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;
  const name = item?.status || item?.method || "Unknown";

  return (
    <div className="min-w-44 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
      <p className="text-sm font-bold text-slate-950">{capitalizeText(name)}</p>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-6">
          <span className="text-xs text-slate-500">Orders</span>
          <span className="text-sm font-semibold text-slate-800">
            {formatNumber(item?.[valueKey] || 0)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-6">
          <span className="text-xs text-slate-500">Share</span>
          <span className="text-sm font-semibold text-slate-800">
            {(item?.percentage || 0).toFixed(2)}%
          </span>
        </div>

        {"revenue" in item && (
          <div className="flex items-center justify-between gap-6">
            <span className="text-xs text-slate-500">Revenue</span>
            <span className="text-sm font-semibold text-slate-800">
              {formatCurrency(item?.revenue || 0)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  valueType = "number",
  comparison,
  description,
  icon: Icon,
  iconClassName,
  iconBackgroundClassName,
}: SummaryCardProps) {
  const safeComparison: AnalyticsComparison = {
    current: Number(comparison?.current) || 0,
    previous: Number(comparison?.previous) || 0,
    difference: Number(comparison?.difference) || 0,
    percentageChange: Number(comparison?.percentageChange) || 0,
    trend: comparison?.trend ?? "neutral",
  };

  const isUp = safeComparison.trend === "up";
  const isDown = safeComparison.trend === "down";

  const trendClassName = isUp
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : isDown
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-slate-200 bg-slate-100 text-slate-600";

  const TrendIcon = isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <article
      className="
        group relative overflow-hidden rounded-3xl border border-slate-200
        bg-white p-5 shadow-sm transition-all duration-300
        hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl
      "
    >
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-slate-100/70 transition-transform duration-500 group-hover:scale-125" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconBackgroundClassName}`}
          >
            <Icon size={22} className={iconClassName} />
          </div>

          <div
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${trendClassName}`}
          >
            {safeComparison.trend !== "neutral" && <TrendIcon size={14} />}

            <span>
              {safeComparison.percentageChange > 0 ? "+" : ""}
              {safeComparison.percentageChange.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-slate-500">{title}</p>

          {value}
          <h2 className="mt-1 break-words text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            <AnimatedCounter
              value={value}
              formatter={(animatedValue) =>
                valueType === "currency"
                  ? formatCurrency(animatedValue)
                  : formatNumber(Math.round(animatedValue))
              }
            />
          </h2>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-500">Previous period</span>

            <span className="font-semibold text-slate-700">
              {title.toLowerCase().includes("revenue") ||
              title.toLowerCase().includes("order value")
                ? formatCurrency(safeComparison.previous)
                : formatNumber(safeComparison.previous)}
            </span>
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p>
        </div>
      </div>
    </article>
  );
}

function ProductPerformanceCard({
  title,
  description,
  products,
  metric,
  icon: Icon,
  iconClassName,
  iconBackgroundClassName,
  progressClassName,
  emptyMessage,
}: ProductPerformanceCardProps) {
  const maximumValue = Math.max(
    ...products.map((product) => Number(product[metric]) || 0),
    1,
  );

  const formatMetricValue = (product: ProductAnalyticsItem) => {
    const value = Number(product[metric]) || 0;

    if (metric === "revenue") {
      return formatCurrency(value);
    }

    if (metric === "views") {
      return `${formatNumber(value)} ${value === 1 ? "view" : "views"}`;
    }

    return `${formatNumber(value)} ${value === 1 ? "wishlist" : "wishlists"}`;
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconBackgroundClassName}`}
          >
            <Icon size={21} className={iconClassName} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-950">{title}</h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {products.length > 0 ? (
          <div className="space-y-3">
            {products.slice(0, 5).map((product, index) => {
              const metricValue = Number(product[metric]) || 0;

              const progressWidth = (metricValue / maximumValue) * 100;

              return (
                <Link
                  key={`${title}-${product.productId}`}
                  href={`/product/${product.productId}`}
                  className="group block rounded-2xl border border-slate-200 bg-slate-50 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="h-full w-full object-contain p-1 transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <Box size={19} className="text-slate-300" />
                      )}

                      <span className="absolute left-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-br-lg bg-slate-950 px-1 text-[10px] font-bold text-white">
                        {index + 1}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-blue-700">
                            {product.name}
                          </h4>

                          <p className="mt-1 text-[11px] text-slate-400">
                            {formatNumber(product.unitsSold)} sold
                            {" • "}
                            {formatNumber(product.stockQuantity)} in stock
                          </p>
                        </div>

                        <span className="shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 shadow-sm">
                          {formatMetricValue(product)}
                        </span>
                      </div>

                      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${progressClassName}`}
                          style={{
                            width: `${Math.max(
                              progressWidth,
                              metricValue > 0 ? 4 : 0,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl bg-slate-50">
            <div className="text-center">
              <Icon size={28} className="mx-auto text-slate-300" />

              <p className="mt-3 text-sm font-semibold text-slate-700">
                No product data
              </p>

              <p className="mx-auto mt-1 max-w-48 text-xs leading-5 text-slate-400">
                {emptyMessage}
              </p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function InventoryProductList({
  title,
  description,
  products,
  icon: Icon,
  iconClassName,
  iconBackgroundClassName,
  stockBadgeClassName,
  emptyTitle,
  emptyMessage,
}: InventoryProductListProps) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconBackgroundClassName}`}
          >
            <Icon size={21} className={iconClassName} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-950">{title}</h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {products.length > 0 ? (
          <div className="space-y-3">
            {products.slice(0, 6).map((product, index) => (
              <Link
                key={product.productId}
                href={`/product/${product.productId}`}
                className="group block rounded-2xl border border-slate-200 bg-slate-50 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-bold text-white">
                    {index + 1}
                  </div>

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <Box size={20} className="text-slate-300" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-blue-700">
                          {product.name}
                        </h4>

                        <p className="mt-1 text-xs text-slate-400">
                          Product inventory status
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${stockBadgeClassName}`}
                      >
                        {formatNumber(product.stockQuantity)} left
                      </span>
                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          product.stockQuantity <= 0
                            ? "bg-red-500"
                            : product.stockQuantity <= 3
                              ? "bg-red-500"
                              : "bg-amber-500"
                        }`}
                        style={{
                          width:
                            product.stockQuantity <= 0
                              ? "100%"
                              : `${Math.max(
                                  Math.min(
                                    (product.stockQuantity / 10) * 100,
                                    100,
                                  ),
                                  8,
                                )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl bg-slate-50">
            <div className="text-center">
              <Icon size={30} className="mx-auto text-slate-300" />

              <p className="mt-3 text-sm font-semibold text-slate-700">
                {emptyTitle}
              </p>

              <p className="mx-auto mt-1 max-w-52 text-xs leading-5 text-slate-400">
                {emptyMessage}
              </p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;

        return (
          <Star
            key={starValue}
            size={18}
            className={
              starValue <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-100 text-slate-200"
            }
          />
        );
      })}
    </div>
  );
}

const INSIGHT_STYLES = {
  positive: {
    icon: CheckCircle2,
    iconClassName: "text-emerald-700",
    iconBackgroundClassName: "bg-emerald-100",
    cardClassName: "border-emerald-200 bg-emerald-50/60",
    titleClassName: "text-emerald-950",
    messageClassName: "text-emerald-700",
    badgeClassName: "border-emerald-200 bg-white text-emerald-700",
    label: "Positive",
  },

  negative: {
    icon: TrendingDown,
    iconClassName: "text-red-700",
    iconBackgroundClassName: "bg-red-100",
    cardClassName: "border-red-200 bg-red-50/60",
    titleClassName: "text-red-950",
    messageClassName: "text-red-700",
    badgeClassName: "border-red-200 bg-white text-red-700",
    label: "Negative",
  },

  warning: {
    icon: AlertCircle,
    iconClassName: "text-amber-700",
    iconBackgroundClassName: "bg-amber-100",
    cardClassName: "border-amber-200 bg-amber-50/60",
    titleClassName: "text-amber-950",
    messageClassName: "text-amber-700",
    badgeClassName: "border-amber-200 bg-white text-amber-700",
    label: "Warning",
  },

  info: {
    icon: Info,
    iconClassName: "text-blue-700",
    iconBackgroundClassName: "bg-blue-100",
    cardClassName: "border-blue-200 bg-blue-50/60",
    titleClassName: "text-blue-950",
    messageClassName: "text-blue-700",
    badgeClassName: "border-blue-200 bg-white text-blue-700",
    label: "Information",
  },
};

const ANALYTICS_RANGE_OPTIONS: {
  label: string;
  value: AnalyticsRange;
}[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "Last 6 months", value: "6m" },
  { label: "Last 1 year", value: "1y" },
  { label: "Custom range", value: "custom" },
];

const ANALYTICS_GROUP_OPTIONS: {
  label: string;
  value: AnalyticsGroupBy;
}[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

export default function AdminAnalytics() {
  const quickNavigationRef = useRef<HTMLElement | null>(null);
  const {
    adminAnalytics,
    analyticsLoading,
    analyticsError,
    fetchAdminAnalytics,
  } = useApp();

  const [selectedRange, setSelectedRange] = useState<AnalyticsRange>("today");

  const [selectedGroupBy, setSelectedGroupBy] =
    useState<AnalyticsGroupBy>("daily");

  const [customStartDate, setCustomStartDate] = useState("");

  const [customEndDate, setCustomEndDate] = useState("");

  const [appliedStartDate, setAppliedStartDate] = useState("");

  const [appliedEndDate, setAppliedEndDate] = useState("");

  const questionAnalytics = adminAnalytics?.questions;

  const selectedRangeLabel =
    selectedRange === "custom" && appliedStartDate && appliedEndDate
      ? `${new Date(appliedStartDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        })} – ${new Date(appliedEndDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        })}`
      : (ANALYTICS_RANGE_OPTIONS.find(
          (option) => option.value === selectedRange,
        )?.label ?? "Selected range");

  const questionAnswerRate =
    (questionAnalytics?.totalQuestions ?? 0) > 0
      ? ((questionAnalytics?.answeredQuestions ?? 0) /
          (questionAnalytics?.totalQuestions ?? 1)) *
        100
      : 0;

  const pendingQuestionRate =
    (questionAnalytics?.totalQuestions ?? 0) > 0
      ? ((questionAnalytics?.pendingQuestions ?? 0) /
          (questionAnalytics?.totalQuestions ?? 1)) *
        100
      : 0;

  const couponAnalytics = adminAnalytics?.coupons;

  const topCoupons = couponAnalytics?.topCoupons ?? [];

  const couponUsageRate =
    (couponAnalytics?.ordersWithCoupons ?? 0) > 0 &&
    (adminAnalytics?.summary.totalOrders.current ?? 0) > 0
      ? ((couponAnalytics?.ordersWithCoupons ?? 0) /
          (adminAnalytics?.summary.totalOrders.current ?? 1)) *
        100
      : 0;

  const averageDiscountPerCouponOrder =
    (couponAnalytics?.ordersWithCoupons ?? 0) > 0
      ? (couponAnalytics?.totalDiscountGiven ?? 0) /
        (couponAnalytics?.ordersWithCoupons ?? 1)
      : 0;

  const insights = adminAnalytics?.insights ?? [];

  const positiveInsightCount = insights.filter(
    (insight) => insight.type === "positive",
  ).length;

  const warningInsightCount = insights.filter(
    (insight) => insight.type === "warning" || insight.type === "negative",
  ).length;

  const informationalInsightCount = insights.filter(
    (insight) => insight.type === "info",
  ).length;

  useEffect(() => {
    if (selectedRange === "custom" && (!appliedStartDate || !appliedEndDate)) {
      return;
    }

    fetchAdminAnalytics({
      range: selectedRange,
      groupBy: selectedGroupBy,
      startDate: selectedRange === "custom" ? appliedStartDate : undefined,
      endDate: selectedRange === "custom" ? appliedEndDate : undefined,
    });
  }, [
    selectedRange,
    selectedGroupBy,
    appliedStartDate,
    appliedEndDate,
    fetchAdminAnalytics,
  ]);

  const customerAnalytics = adminAnalytics?.customers;

  const topCustomers = customerAnalytics?.topCustomers ?? [];

  const reviewAnalytics = adminAnalytics?.reviews;

  const ratingDistribution = reviewAnalytics?.ratingDistribution ?? [];

  const totalReviewDistribution = ratingDistribution.reduce(
    (total, item) => total + item.count,
    0,
  );

  const positiveReviews = ratingDistribution
    .filter((item) => item.rating >= 4)
    .reduce((total, item) => total + item.count, 0);

  const positiveReviewPercentage =
    totalReviewDistribution > 0
      ? (positiveReviews / totalReviewDistribution) * 100
      : 0;
  const summary = adminAnalytics?.summary;

  const revenueTrend = adminAnalytics?.revenueTrend ?? [];

  const orderStatusData =
    adminAnalytics?.orderStatuses.filter((item) => item.count > 0) ?? [];

  const paymentMethodData =
    adminAnalytics?.paymentMethods.filter((item) => item.orders > 0) ?? [];

  const paymentStatusData =
    adminAnalytics?.paymentStatuses.filter((item) => item.orders > 0) ?? [];

  const topProducts = adminAnalytics?.topProducts ?? [];

  const productPerformance = adminAnalytics?.productPerformance;

  const mostViewedProducts = productPerformance?.mostViewedProducts ?? [];

  const mostWishlistedProducts =
    productPerformance?.mostWishlistedProducts ?? [];

  const highestRevenueProducts =
    productPerformance?.highestRevenueProducts ?? [];

  const inventory = adminAnalytics?.inventory;

  const lowStockProducts = inventory?.lowStockProducts ?? [];

  const outOfStockProducts = inventory?.outOfStockProducts ?? [];

  const totalInventoryAlerts =
    (inventory?.lowStockCount ?? 0) + (inventory?.outOfStockCount ?? 0);

  const inventoryHealthPercentage =
    totalInventoryAlerts === 0
      ? 100
      : Math.max(100 - totalInventoryAlerts * 10, 0);

  const totalStatusOrders = orderStatusData.reduce(
    (total, item) => total + item.count,
    0,
  );

  const totalPaymentOrders = paymentMethodData.reduce(
    (total, item) => total + item.orders,
    0,
  );

  const totalPaymentStatusOrders = paymentStatusData.reduce(
    (total, item) => total + item.orders,
    0,
  );

  const totalPendingPaymentRevenue =
    adminAnalytics?.paymentStatuses.find((item) => item.status === "pending")
      ?.revenue ?? 0;

  const totalPaidRevenue =
    adminAnalytics?.paymentStatuses.find((item) => item.status === "paid")
      ?.revenue ?? 0;

  const totalTopProductRevenue = topProducts.reduce(
    (total, product) => total + product.revenue,
    0,
  );

  const totalTopProductUnits = topProducts.reduce(
    (total, product) => total + product.unitsSold,
    0,
  );

  const totalChartRevenue = revenueTrend.reduce(
    (total, item) => total + item.revenue,
    0,
  );

  const activeRevenueDays = revenueTrend.filter(
    (item) => item.revenue > 0,
  ).length;

  const handleRangeChange = (range: AnalyticsRange) => {
    setSelectedRange(range);

    if (range !== "custom") {
      setCustomStartDate("");
      setCustomEndDate("");
      setAppliedStartDate("");
      setAppliedEndDate("");
    }
  };

  const handleApplyCustomRange = () => {
    if (!customStartDate || !customEndDate) return;

    setAppliedStartDate(customStartDate);
    setAppliedEndDate(customEndDate);
  };

  const handleRefreshAnalytics = () => {
    fetchAdminAnalytics({
      range: selectedRange,
      groupBy: selectedGroupBy,
      startDate: selectedRange === "custom" ? appliedStartDate : undefined,
      endDate: selectedRange === "custom" ? appliedEndDate : undefined,
    });
  };

  const scrollToSection = (sectionId: string) => {
  const section = document.getElementById(sectionId);

  if (!section) return;

  const mainNavbarHeight = 80;
  const quickNavigationHeight =
    quickNavigationRef.current?.getBoundingClientRect().height ?? 0;

  const extraSpacing = 20;

  const totalOffset =
    mainNavbarHeight + quickNavigationHeight + extraSpacing;

  const sectionTop =
    section.getBoundingClientRect().top + window.scrollY - totalOffset;

  window.scrollTo({
    top: sectionTop,
    behavior: "smooth",
  });
};

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative p-5 sm:p-6">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-slate-100" />
            <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-slate-50" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
                  <BarChart3 size={23} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                      Admin Analytics
                    </h1>

                    <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {selectedRangeLabel}
                    </span>
                  </div>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    Track revenue, orders, customers, product sales and pending
                    business performance.
                  </p>

                  {adminAnalytics?.dateRange && (
                    <p className="mt-2 text-xs font-medium text-slate-400">
                      {new Date(
                        adminAnalytics.dateRange.startDate,
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      {" — "}
                      {new Date(
                        adminAnalytics.dateRange.endDate,
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleRefreshAnalytics}
                disabled={analyticsLoading}
                className="h-11 rounded-xl border-slate-300 bg-white px-5 shadow-sm "
              >
                <RefreshCw
                  size={16}
                  className={analyticsLoading ? "animate-spin" : ""}
                />

                {analyticsLoading ? "Refreshing..." : "Refresh Data"}
              </Button>
            </div>
          </div>
        </section>

        {/* Analytics Filters */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <Filter size={20} />
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-950">
                    Analytics Filters
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Change the reporting period and chart grouping.
                  </p>
                </div>
              </div>

              {adminAnalytics?.dateRange && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Current period
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {new Date(
                      adminAnalytics.dateRange.startDate,
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                    {" — "}
                    {new Date(
                      adminAnalytics.dateRange.endDate,
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Date range
              </p>

              <div className="flex flex-wrap gap-2">
                {ANALYTICS_RANGE_OPTIONS.map((option) => {
                  const isActive = selectedRange === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleRangeChange(option.value)}
                      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                        isActive
                          ? "border-slate-950 bg-slate-950 text-white shadow-md"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Group chart data
              </p>

              <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-100 p-1">
                {ANALYTICS_GROUP_OPTIONS.map((option) => {
                  const isActive = selectedGroupBy === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedGroupBy(option.value)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-white text-slate-950 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedRange === "custom" && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                    <CalendarDays size={19} />
                  </div>

                  <div className="w-full">
                    <h3 className="text-sm font-bold text-blue-950">
                      Select custom dates
                    </h3>

                    <p className="mt-1 text-xs text-blue-700">
                      Choose a start and end date, then apply the range.
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                          Start date
                        </span>

                        <input
                          type="date"
                          value={customStartDate}
                          max={customEndDate || undefined}
                          onChange={(event) =>
                            setCustomStartDate(event.target.value)
                          }
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                          End date
                        </span>

                        <input
                          type="date"
                          value={customEndDate}
                          min={customStartDate || undefined}
                          onChange={(event) =>
                            setCustomEndDate(event.target.value)
                          }
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={handleApplyCustomRange}
                        disabled={
                          !customStartDate || !customEndDate || analyticsLoading
                        }
                        className="h-11 self-end rounded-xl bg-blue-700 px-5 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Apply Range
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Analytics Section Navigation */}
        <section
        ref={quickNavigationRef}
          className="
    sticky top-20 z-30
    mb-6 rounded-3xl
    border border-slate-200
    bg-white/95 p-4
    shadow-lg backdrop-blur-xl
  "
        >
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900">
              Quick Navigation
            </h3>

            <p className="text-sm text-slate-500">
              Jump directly to any analytics section.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-5">
            {ANALYTICS_SECTIONS.map((section) => {
              const Icon = section.icon;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className="
            group
            flex flex-col items-center justify-center
            rounded-xl border border-slate-200
            bg-slate-50 p-2.5
            transition-all duration-300
            hover:-translate-y-1
            hover:border-slate-900
            hover:bg-slate-900
            hover:shadow-lg
            active:scale-95
          "
                >
                  <div
                    className="
              mb-1 flex h-8 w-8 items-center justify-center
              rounded-lg bg-white text-slate-700
              transition-all
              group-hover:bg-slate-800
              group-hover:text-white
            "
                  >
                    <Icon size={16} />
                  </div>

                  <span
                    className="
              text-center text-[9px]
              font-bold leading-tight
              text-slate-600
              transition-colors
              group-hover:text-white
            "
                  >
                    {section.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {analyticsLoading && !adminAnalytics ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <RefreshCw size={24} className="animate-spin text-slate-700" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Loading analytics
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Preparing the latest store performance report.
            </p>
          </section>
        ) : analyticsError ? (
          <section className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-red-900">
              Analytics could not be loaded
            </h2>

            <p className="mt-2 text-sm text-red-700">{analyticsError}</p>

            <Button
              type="button"
              onClick={handleRefreshAnalytics}
              disabled={analyticsLoading}
              className="mt-4 rounded-xl"
            >
              <RefreshCw
                size={16}
                className={analyticsLoading ? "animate-spin" : ""}
              />
              Try Again
            </Button>
          </section>
        ) : summary ? (
          <section id="overview" className="scroll-mt-72">
            <div className="mb-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-950">
                Performance Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current period performance compared with the previous period.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Total Revenue"
                value={summary.totalRevenue?.current ?? 0}
                valueType="currency"
                comparison={summary.totalRevenue}
                description="Revenue collected from completed and paid orders."
                icon={BadgeIndianRupee}
                iconClassName="text-emerald-700"
                iconBackgroundClassName="bg-emerald-100"
              />

              <SummaryCard
                title="Total Orders"
                value={summary.totalOrders?.current ?? 0}
                comparison={summary.totalOrders}
                description="Orders placed during the selected analytics period."
                icon={ShoppingBag}
                iconClassName="text-blue-700"
                iconBackgroundClassName="bg-blue-100"
              />

              <SummaryCard
                title="Units Sold"
                value={summary.unitsSold?.current ?? 0}
                comparison={summary.unitsSold}
                description="Total product quantity sold across all orders."
                icon={PackageCheck}
                iconClassName="text-violet-700"
                iconBackgroundClassName="bg-violet-100"
              />

              <SummaryCard
                title="Average Order Value"
                value={summary.averageOrderValue?.current ?? 0}
                valueType="currency"
                comparison={summary.averageOrderValue}
                description="Average revenue generated by each completed order."
                icon={CircleDollarSign}
                iconClassName="text-amber-700"
                iconBackgroundClassName="bg-amber-100"
              />

              <SummaryCard
                title="New Customers"
                value={summary.newCustomers?.current ?? 0}
                comparison={summary.newCustomers}
                description="New customer accounts created in this period."
                icon={UserPlus}
                iconClassName="text-cyan-700"
                iconBackgroundClassName="bg-cyan-100"
              />

              <SummaryCard
                title="Cancelled Orders"
                value={summary.cancelledOrders?.current ?? 0}
                comparison={summary.cancelledOrders}
                description="Orders cancelled during the selected period."
                icon={XCircle}
                iconClassName="text-rose-700"
                iconBackgroundClassName="bg-rose-100"
              />

              <SummaryCard
                title="Pending Revenue"
                value={summary.pendingRevenue?.current ?? 0}
                valueType="currency"
                comparison={summary.pendingRevenue}
                description="Revenue associated with payments that are still pending."
                icon={ShoppingCart}
                iconClassName="text-orange-700"
                iconBackgroundClassName="bg-orange-100"
              />
            </div>
            <div
              id="revenue-orders"
              className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3 scroll-mt-72"
            >
              {/* Revenue Trend */}
              <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <TrendingUp size={21} />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-950">
                        Revenue Trend
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Daily revenue and order performance for this period.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Revenue
                      </p>

                      <p className="mt-0.5 text-sm font-bold text-slate-900">
                        {formatCurrency(totalChartRevenue)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Active days
                      </p>

                      <p className="mt-0.5 text-sm font-bold text-slate-900">
                        {activeRevenueDays}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 sm:p-6">
                  {revenueTrend.length > 0 ? (
                    <div className="h-80 w-full sm:h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={revenueTrend}
                          margin={{
                            top: 12,
                            right: 10,
                            left: -10,
                            bottom: 0,
                          }}
                        >
                          <defs>
                            <linearGradient
                              id="revenueGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#10b981"
                                stopOpacity={0.35}
                              />

                              <stop
                                offset="95%"
                                stopColor="#10b981"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>

                          <CartesianGrid
                            strokeDasharray="4 4"
                            vertical={false}
                            stroke="#e2e8f0"
                          />

                          <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={formatChartDate}
                            tick={{
                              fill: "#64748b",
                              fontSize: 11,
                            }}
                            minTickGap={28}
                          />

                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={formatCompactCurrency}
                            tick={{
                              fill: "#64748b",
                              fontSize: 11,
                            }}
                            width={62}
                          />

                          <Tooltip
                            content={<RevenueChartTooltip />}
                            cursor={{
                              stroke: "#94a3b8",
                              strokeDasharray: "4 4",
                            }}
                          />

                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#059669"
                            strokeWidth={3}
                            fill="url(#revenueGradient)"
                            activeDot={{
                              r: 6,
                              strokeWidth: 3,
                              stroke: "#ffffff",
                              fill: "#059669",
                            }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex h-80 items-center justify-center rounded-2xl bg-slate-50">
                      <div className="text-center">
                        <TrendingUp
                          size={28}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 text-sm font-semibold text-slate-700">
                          No revenue data
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Revenue activity will appear here.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </article>

              {/* Order Status */}
              <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                      <ShoppingBag size={21} />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-950">
                        Order Status
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Distribution of all order stages.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  {orderStatusData.length > 0 ? (
                    <>
                      <div className="relative h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={orderStatusData}
                              dataKey="count"
                              nameKey="status"
                              cx="50%"
                              cy="50%"
                              innerRadius={68}
                              outerRadius={96}
                              paddingAngle={4}
                              cornerRadius={6}
                              stroke="none"
                            >
                              {orderStatusData.map((item) => (
                                <Cell
                                  key={item.status}
                                  fill={
                                    ORDER_STATUS_COLORS[item.status] ||
                                    "#94a3b8"
                                  }
                                />
                              ))}
                            </Pie>

                            <Tooltip
                              content={<PieChartTooltip valueKey="count" />}
                            />
                          </PieChart>
                        </ResponsiveContainer>

                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-slate-950">
                            {formatNumber(totalStatusOrders)}
                          </span>

                          <span className="text-xs font-medium text-slate-400">
                            Orders
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 space-y-3">
                        {adminAnalytics?.orderStatuses.map((item) => (
                          <div
                            key={item.status}
                            className="flex items-center justify-between gap-3"
                          >
                            <div className="flex min-w-0 items-center gap-2.5">
                              <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{
                                  backgroundColor:
                                    ORDER_STATUS_COLORS[item.status] ||
                                    "#94a3b8",
                                }}
                              />

                              <span className="truncate text-sm font-medium text-slate-600">
                                {capitalizeText(item.status)}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-xs text-slate-400">
                                {item.percentage.toFixed(1)}%
                              </span>

                              <span className="min-w-6 text-right text-sm font-bold text-slate-900">
                                {item.count}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-50">
                      <p className="text-sm text-slate-500">
                        No order status data available.
                      </p>
                    </div>
                  )}
                </div>
              </article>
            </div>

            {/* Payment Methods */}
            <article
              id="payments"
              className="scroll-mt-72 mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                    <CreditCard size={21} />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-950">
                      Payment Methods
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Compare order volume and revenue by payment option.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Payment orders
                  </p>

                  <p className="mt-0.5 text-sm font-bold text-slate-900">
                    {formatNumber(totalPaymentOrders)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 lg:grid-cols-[320px_1fr]">
                {paymentMethodData.length > 0 ? (
                  <>
                    <div className="relative h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={paymentMethodData}
                            dataKey="orders"
                            nameKey="method"
                            cx="50%"
                            cy="50%"
                            innerRadius={75}
                            outerRadius={108}
                            paddingAngle={5}
                            cornerRadius={7}
                            stroke="none"
                          >
                            {paymentMethodData.map((item) => (
                              <Cell
                                key={item.method}
                                fill={
                                  PAYMENT_METHOD_COLORS[item.method] ||
                                  "#94a3b8"
                                }
                              />
                            ))}
                          </Pie>

                          <Tooltip
                            content={<PieChartTooltip valueKey="orders" />}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-slate-950">
                          {formatNumber(totalPaymentOrders)}
                        </span>

                        <span className="text-xs font-medium text-slate-400">
                          Payments
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 content-center gap-4 sm:grid-cols-3">
                      {adminAnalytics?.paymentMethods.map((item) => (
                        <div
                          key={item.method}
                          className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="h-3 w-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    PAYMENT_METHOD_COLORS[item.method] ||
                                    "#94a3b8",
                                }}
                              />

                              <span className="text-sm font-bold text-slate-900">
                                {item.method.toLowerCase() === "cod"
                                  ? "Cash on Delivery"
                                  : item.method.toUpperCase()}
                              </span>
                            </div>

                            <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-500 shadow-sm">
                              {item.percentage.toFixed(1)}%
                            </span>
                          </div>

                          <div className="mt-5">
                            <p className="text-xs font-medium text-slate-400">
                              Revenue
                            </p>

                            <p className="mt-1 break-words text-xl font-bold text-slate-950">
                              {formatCurrency(item.revenue)}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                            <span className="text-xs text-slate-500">
                              Total orders
                            </span>

                            <span className="text-sm font-bold text-slate-900">
                              {formatNumber(item.orders)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-50 lg:col-span-2">
                    <p className="text-sm text-slate-500">
                      No payment method data available.
                    </p>
                  </div>
                )}
              </div>
            </article>

            {/* Payment Status and Top Products */}
            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
              {/* Payment Status */}
              <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                      <WalletCards size={21} />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-950">
                        Payment Status
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Monitor collected, pending and failed payments.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  {paymentStatusData.length > 0 ? (
                    <>
                      <div className="relative h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={paymentStatusData}
                              dataKey="orders"
                              nameKey="status"
                              cx="50%"
                              cy="50%"
                              innerRadius={68}
                              outerRadius={96}
                              paddingAngle={4}
                              cornerRadius={6}
                              stroke="none"
                            >
                              {paymentStatusData.map((item) => (
                                <Cell
                                  key={item.status}
                                  fill={
                                    PAYMENT_STATUS_COLORS[item.status] ||
                                    "#94a3b8"
                                  }
                                />
                              ))}
                            </Pie>

                            <Tooltip
                              content={<PieChartTooltip valueKey="orders" />}
                            />
                          </PieChart>
                        </ResponsiveContainer>

                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-slate-950">
                            {formatNumber(totalPaymentStatusOrders)}
                          </span>

                          <span className="text-xs font-medium text-slate-400">
                            Orders
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 space-y-3">
                        {adminAnalytics?.paymentStatuses.map((item) => (
                          <div
                            key={item.status}
                            className="rounded-2xl border border-slate-100 bg-slate-50 p-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-2.5">
                                <span
                                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                                  style={{
                                    backgroundColor:
                                      PAYMENT_STATUS_COLORS[item.status] ||
                                      "#94a3b8",
                                  }}
                                />

                                <span className="truncate text-sm font-semibold text-slate-700">
                                  {capitalizeText(item.status)}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-400">
                                  {item.percentage.toFixed(1)}%
                                </span>

                                <span className="min-w-6 text-right text-sm font-bold text-slate-900">
                                  {formatNumber(item.orders)}
                                </span>
                              </div>
                            </div>

                            <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
                              <span className="text-xs text-slate-400">
                                Revenue
                              </span>

                              <span className="text-sm font-bold text-slate-800">
                                {formatCurrency(item.revenue)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-50">
                      <div className="text-center">
                        <WalletCards
                          size={28}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 text-sm font-semibold text-slate-700">
                          No payment data
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Payment status information will appear here.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </article>

              {/* Top Products */}
              <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
                      <Trophy size={21} />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-950">
                        Top Selling Products
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Products generating the highest sales during this
                        period.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Product revenue
                      </p>

                      <p className="mt-0.5 text-sm font-bold text-slate-900">
                        {formatCurrency(totalTopProductRevenue)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Units sold
                      </p>

                      <p className="mt-0.5 text-sm font-bold text-slate-900">
                        {formatNumber(totalTopProductUnits)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  {topProducts.length > 0 ? (
                    <div className="space-y-3">
                      {topProducts.map((product, index) => {
                        const maximumRevenue = Math.max(
                          ...topProducts.map((item) => item.revenue),
                          1,
                        );

                        const revenuePercentage =
                          (product.revenue / maximumRevenue) * 100;

                        return (
                          <Link
                            key={product.productId}
                            href={`/product/${product.productId}`}
                            className="group block rounded-2xl border border-slate-200 bg-slate-50 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-lg sm:p-4"
                          >
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-bold text-white">
                                {index + 1}
                              </div>

                              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white sm:h-16 sm:w-16">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-full w-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-110"
                                    loading="lazy"
                                  />
                                ) : (
                                  <Box size={22} className="text-slate-300" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                  <div className="min-w-0">
                                    <h4 className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-blue-700 sm:text-base">
                                      {product.name}
                                    </h4>

                                    <p className="mt-1 text-xs text-slate-500">
                                      {formatNumber(product.unitsSold)} units
                                      across {formatNumber(product.orderCount)}{" "}
                                      orders
                                    </p>
                                  </div>

                                  <div className="shrink-0 sm:text-right">
                                    <p className="text-base font-bold text-slate-950">
                                      {formatCurrency(product.revenue)}
                                    </p>

                                    <p className="text-xs text-slate-400">
                                      Revenue
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                                  <div
                                    className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                                    style={{
                                      width: `${Math.max(
                                        revenuePercentage,
                                        product.revenue > 0 ? 4 : 0,
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-50">
                      <div className="text-center">
                        <Trophy size={30} className="mx-auto text-slate-300" />

                        <p className="mt-3 text-sm font-semibold text-slate-700">
                          No product sales yet
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Top-selling products will appear after completed
                          sales.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            </div>

            {/* Payment Collection Summary */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <article className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm sm:p-6">
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-100" />

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">
                      Collected Revenue
                    </p>

                    <p className="mt-2 break-words text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
                      {formatCurrency(totalPaidRevenue)}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-emerald-700">
                      Revenue associated with successfully paid orders.
                    </p>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                    <Banknote size={22} />
                  </div>
                </div>
              </article>

              <article className="relative overflow-hidden rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6">
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-amber-100" />

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-amber-700">
                      Awaiting Collection
                    </p>

                    <p className="mt-2 break-words text-2xl font-bold tracking-tight text-amber-950 sm:text-3xl">
                      {formatCurrency(totalPendingPaymentRevenue)}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-amber-700">
                      Revenue still waiting for successful payment confirmation.
                    </p>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm">
                    <WalletCards size={22} />
                  </div>
                </div>
              </article>
            </div>

            {/* Product Performance */}
            <section id="products" className="scroll-mt-72 mt-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-950">
                  Product Performance
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Compare customer attention, wishlist demand and revenue
                  generation across products.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                <ProductPerformanceCard
                  title="Most Viewed Products"
                  description="Products attracting the highest customer attention."
                  products={mostViewedProducts}
                  metric="views"
                  icon={Eye}
                  iconClassName="text-blue-700"
                  iconBackgroundClassName="bg-blue-100"
                  progressClassName="bg-blue-500"
                  emptyMessage="Product view activity will appear here."
                />

                <ProductPerformanceCard
                  title="Most Wishlisted Products"
                  description="Products customers are saving for future purchases."
                  products={mostWishlistedProducts}
                  metric="wishlistCount"
                  icon={Heart}
                  iconClassName="text-rose-700"
                  iconBackgroundClassName="bg-rose-100"
                  progressClassName="bg-rose-500"
                  emptyMessage="Products added to customer wishlists will appear here."
                />

                <ProductPerformanceCard
                  title="Highest Revenue Products"
                  description="Products generating the greatest total revenue."
                  products={highestRevenueProducts}
                  metric="revenue"
                  icon={IndianRupee}
                  iconClassName="text-emerald-700"
                  iconBackgroundClassName="bg-emerald-100"
                  progressClassName="bg-emerald-500"
                  emptyMessage="Products with recorded sales revenue will appear here."
                />
              </div>
            </section>

            {/* Inventory Analytics */}
            <section id="inventory" className="scroll-mt-72 mt-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-950">
                  Inventory Analytics
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Identify products that need immediate restocking before sales
                  are lost.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-slate-100" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                        <Boxes size={22} />
                      </div>

                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
                        Inventory
                      </span>
                    </div>

                    <p className="mt-5 text-sm font-medium text-slate-500">
                      Total Stock Alerts
                    </p>

                    <h3 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                      {formatNumber(totalInventoryAlerts)}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      Products currently requiring inventory attention.
                    </p>
                  </div>
                </article>

                <article className="relative overflow-hidden rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-amber-100" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm">
                        <PackageMinus size={22} />
                      </div>

                      <span className="rounded-full border border-amber-200 bg-white px-2.5 py-1 text-xs font-semibold text-amber-700">
                        Restock soon
                      </span>
                    </div>

                    <p className="mt-5 text-sm font-medium text-amber-700">
                      Low Stock Products
                    </p>

                    <h3 className="mt-1 text-3xl font-bold tracking-tight text-amber-950">
                      {formatNumber(inventory?.lowStockCount ?? 0)}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-amber-700">
                      Products approaching their out-of-stock level.
                    </p>
                  </div>
                </article>

                <article className="relative overflow-hidden rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-red-100" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-red-700 shadow-sm">
                        <PackageX size={22} />
                      </div>

                      <span className="rounded-full border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-700">
                        Critical
                      </span>
                    </div>

                    <p className="mt-5 text-sm font-medium text-red-700">
                      Out of Stock
                    </p>

                    <h3 className="mt-1 text-3xl font-bold tracking-tight text-red-950">
                      {formatNumber(inventory?.outOfStockCount ?? 0)}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-red-700">
                      Products unavailable for customers to purchase.
                    </p>
                  </div>
                </article>

                <article className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-100" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                        <PackageCheck size={22} />
                      </div>

                      <span className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        Health
                      </span>
                    </div>

                    <p className="mt-5 text-sm font-medium text-emerald-700">
                      Inventory Health
                    </p>

                    <h3 className="mt-1 text-3xl font-bold tracking-tight text-emerald-950">
                      {inventoryHealthPercentage.toFixed(0)}%
                    </h3>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-200">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all duration-700"
                        style={{
                          width: `${inventoryHealthPercentage}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-xs leading-5 text-emerald-700">
                      Estimated health based on current stock alerts.
                    </p>
                  </div>
                </article>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                <InventoryProductList
                  title="Low Stock Products"
                  description="Products that should be restocked before inventory is depleted."
                  products={lowStockProducts}
                  icon={AlertTriangle}
                  iconClassName="text-amber-700"
                  iconBackgroundClassName="bg-amber-100"
                  stockBadgeClassName="border-amber-200 bg-amber-50 text-amber-700"
                  emptyTitle="No low stock products"
                  emptyMessage="All available products currently have a healthy stock quantity."
                />

                <InventoryProductList
                  title="Out of Stock Products"
                  description="Unavailable products that may be causing missed sales."
                  products={outOfStockProducts}
                  icon={PackageX}
                  iconClassName="text-red-700"
                  iconBackgroundClassName="bg-red-100"
                  stockBadgeClassName="border-red-200 bg-red-50 text-red-700"
                  emptyTitle="Everything is available"
                  emptyMessage="There are currently no products marked as out of stock."
                />
              </div>
            </section>

            {/* Customer Analytics */}
            <section id="customers" className=" scroll-mt-72 mt-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-950">
                  Customer Analytics
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Monitor customer growth, repeat purchases and highest value
                  customers.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {/* Total Customers */}

                <article className="rounded-3xl border bg-white p-5 shadow-sm hover:shadow-lg transition">
                  <div className="flex justify-between items-start">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                      <Users className="text-blue-700" size={22} />
                    </div>

                    <span className="text-xs rounded-full bg-slate-100 px-3 py-1">
                      Customers
                    </span>
                  </div>

                  <p className="mt-5 text-sm text-slate-500">Total Customers</p>

                  <h3 className="mt-1 text-3xl font-bold">
                    {formatNumber(customerAnalytics?.totalCustomers ?? 0)}
                  </h3>
                </article>

                {/* New */}

                <article className="rounded-3xl border bg-white p-5 shadow-sm hover:shadow-lg transition">
                  <div className="flex justify-between items-start">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                      <UserPlus className="text-emerald-700" size={22} />
                    </div>

                    <span className="text-xs rounded-full bg-emerald-100 text-emerald-700 px-3 py-1">
                      New
                    </span>
                  </div>

                  <p className="mt-5 text-sm text-slate-500">New Customers</p>

                  <h3 className="mt-1 text-3xl font-bold">
                    {formatNumber(customerAnalytics?.newCustomers ?? 0)}
                  </h3>
                </article>

                {/* Repeat */}

                <article className="rounded-3xl border bg-white p-5 shadow-sm hover:shadow-lg transition">
                  <div className="flex justify-between items-start">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100">
                      <Repeat className="text-violet-700" size={22} />
                    </div>

                    <span className="text-xs rounded-full bg-violet-100 text-violet-700 px-3 py-1">
                      Loyal
                    </span>
                  </div>

                  <p className="mt-5 text-sm text-slate-500">
                    Repeat Customers
                  </p>

                  <h3 className="mt-1 text-3xl font-bold">
                    {formatNumber(customerAnalytics?.repeatCustomers ?? 0)}
                  </h3>
                </article>

                {/* Repeat Rate */}

                <article className="rounded-3xl border bg-white p-5 shadow-sm hover:shadow-lg transition">
                  <div className="flex justify-between items-start">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
                      <UserCheck className="text-amber-700" size={22} />
                    </div>

                    <span className="text-xs rounded-full bg-amber-100 text-amber-700 px-3 py-1">
                      Rate
                    </span>
                  </div>

                  <p className="mt-5 text-sm text-slate-500">
                    Repeat Purchase Rate
                  </p>

                  <h3 className="mt-1 text-3xl font-bold">
                    {(customerAnalytics?.repeatPurchaseRate ?? 0).toFixed(1)}%
                  </h3>
                </article>
              </div>
            </section>

            {/* Review Analytics */}
            <section id="reviews" className="mt-6 scroll-mt-72">
              <div className="mb-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-950">
                  Review Analytics
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Understand product satisfaction through customer ratings and
                  review distribution.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Review Summary */}
                <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-50" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                        <Star size={23} className="fill-amber-500" />
                      </div>

                      <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        Customer rating
                      </span>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-end gap-2">
                        <h3 className="text-5xl font-bold tracking-tight text-slate-950">
                          {(reviewAnalytics?.averageRating ?? 0).toFixed(1)}
                        </h3>

                        <span className="mb-1 text-lg font-semibold text-slate-400">
                          / 5
                        </span>
                      </div>

                      <div className="mt-3">
                        <RatingStars
                          rating={reviewAnalytics?.averageRating ?? 0}
                        />
                      </div>

                      <p className="mt-4 text-sm text-slate-500">
                        Based on{" "}
                        <span className="font-bold text-slate-800">
                          {formatNumber(reviewAnalytics?.totalReviews ?? 0)}
                        </span>{" "}
                        customer reviews.
                      </p>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs font-medium text-slate-400">
                          Total reviews
                        </p>

                        <p className="mt-1 text-xl font-bold text-slate-950">
                          {formatNumber(reviewAnalytics?.totalReviews ?? 0)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-emerald-50 p-3">
                        <p className="text-xs font-medium text-emerald-600">
                          Positive reviews
                        </p>

                        <p className="mt-1 text-xl font-bold text-emerald-900">
                          {positiveReviewPercentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </article>

                {/* Rating Distribution */}
                <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
                  <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                        <MessageSquareText size={21} />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-950">
                          Rating Distribution
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Breakdown of customer ratings from one to five stars.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Total responses
                      </p>

                      <p className="mt-0.5 text-sm font-bold text-slate-900">
                        {formatNumber(totalReviewDistribution)}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    {ratingDistribution.length > 0 ? (
                      <div className="space-y-5">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const item = ratingDistribution.find(
                            (distribution) => distribution.rating === rating,
                          );

                          const count = item?.count ?? 0;
                          const percentage = item?.percentage ?? 0;

                          return (
                            <div key={rating}>
                              <div className="flex items-center gap-3">
                                <div className="flex w-16 shrink-0 items-center gap-1">
                                  <span className="text-sm font-bold text-slate-700">
                                    {rating}
                                  </span>

                                  <Star
                                    size={15}
                                    className="fill-amber-400 text-amber-400"
                                  />
                                </div>

                                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className={`h-full rounded-full transition-all duration-700 ${
                                      rating >= 4
                                        ? "bg-emerald-500"
                                        : rating === 3
                                          ? "bg-amber-500"
                                          : "bg-red-500"
                                    }`}
                                    style={{
                                      width: `${Math.max(
                                        percentage,
                                        count > 0 ? 2 : 0,
                                      )}%`,
                                    }}
                                  />
                                </div>

                                <div className="flex w-24 shrink-0 items-center justify-end gap-2 text-right">
                                  <span className="text-xs text-slate-400">
                                    {percentage.toFixed(1)}%
                                  </span>

                                  <span className="min-w-7 text-sm font-bold text-slate-900">
                                    {formatNumber(count)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex h-64 items-center justify-center rounded-2xl bg-slate-50">
                        <div className="text-center">
                          <Star size={30} className="mx-auto text-slate-300" />

                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            No reviews available
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Customer rating activity will appear here.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              </div>
            </section>

            {/* Product Question Analytics */}
            <section id="questions" className="scroll-mt-72 mt-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-950">
                  Product Question Analytics
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Track customer questions, pending responses and admin response
                  speed.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {/* Total Questions */}
                <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-50" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                        <MessagesSquare size={22} />
                      </div>

                      <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        Questions
                      </span>
                    </div>

                    <p className="mt-5 text-sm font-medium text-slate-500">
                      Total Questions
                    </p>

                    <h3 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                      {formatNumber(questionAnalytics?.totalQuestions ?? 0)}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      Questions submitted by customers during the selected
                      period.
                    </p>
                  </div>
                </article>

                {/* Answered Questions */}
                <article className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-100" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                        <MessageCircleQuestion size={22} />
                      </div>

                      <span className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {questionAnswerRate.toFixed(1)}%
                      </span>
                    </div>

                    <p className="mt-5 text-sm font-medium text-emerald-700">
                      Answered Questions
                    </p>

                    <h3 className="mt-1 text-3xl font-bold tracking-tight text-emerald-950">
                      {formatNumber(questionAnalytics?.answeredQuestions ?? 0)}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-emerald-700">
                      Customer questions that received an admin response.
                    </p>
                  </div>
                </article>

                {/* Pending Questions */}
                <article className="relative overflow-hidden rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-amber-100" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm">
                        <CircleHelp size={22} />
                      </div>

                      <span className="rounded-full border border-amber-200 bg-white px-2.5 py-1 text-xs font-semibold text-amber-700">
                        {pendingQuestionRate.toFixed(1)}%
                      </span>
                    </div>

                    <p className="mt-5 text-sm font-medium text-amber-700">
                      Pending Questions
                    </p>

                    <h3 className="mt-1 text-3xl font-bold tracking-tight text-amber-950">
                      {formatNumber(questionAnalytics?.pendingQuestions ?? 0)}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-amber-700">
                      Questions still waiting for an answer from the admin team.
                    </p>
                  </div>
                </article>

                {/* Answered Today */}
                <article className="relative overflow-hidden rounded-3xl border border-violet-200 bg-violet-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-violet-100" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-violet-700 shadow-sm">
                        <MessageCircleQuestion size={22} />
                      </div>

                      <span className="rounded-full border border-violet-200 bg-white px-2.5 py-1 text-xs font-semibold text-violet-700">
                        Today
                      </span>
                    </div>

                    <p className="mt-5 text-sm font-medium text-violet-700">
                      Answered Today
                    </p>

                    <h3 className="mt-1 text-3xl font-bold tracking-tight text-violet-950">
                      {formatNumber(questionAnalytics?.answeredToday ?? 0)}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-violet-700">
                      Questions answered by administrators today.
                    </p>
                  </div>
                </article>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Response Time */}
                <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-50" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
                        <Clock3 size={23} />
                      </div>

                      <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                        Response time
                      </span>
                    </div>

                    <p className="mt-6 text-sm font-medium text-slate-500">
                      Average Response Time
                    </p>

                    <div className="mt-2 flex items-end gap-2">
                      <h3 className="text-4xl font-bold tracking-tight text-slate-950">
                        {(
                          questionAnalytics?.averageResponseTimeHours ?? 0
                        ).toFixed(1)}
                      </h3>

                      <span className="mb-1 text-sm font-semibold text-slate-400">
                        hours
                      </span>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-slate-400">
                      Average time taken by administrators to answer product
                      questions.
                    </p>
                  </div>
                </article>

                {/* Completion Progress */}
                <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <MessageCircleQuestion size={21} />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-950">
                        Question Resolution
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Overall completion rate for customer product questions.
                      </p>
                    </div>
                  </div>

                  <div className="mt-7">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          Answer completion
                        </p>

                        <p className="mt-1 text-3xl font-bold text-slate-950">
                          {questionAnswerRate.toFixed(1)}%
                        </p>
                      </div>

                      <p className="text-right text-xs text-slate-400">
                        {formatNumber(
                          questionAnalytics?.answeredQuestions ?? 0,
                        )}{" "}
                        of{" "}
                        {formatNumber(questionAnalytics?.totalQuestions ?? 0)}{" "}
                        answered
                      </p>
                    </div>

                    <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                        style={{
                          width: `${Math.min(questionAnswerRate, 100)}%`,
                        }}
                      />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-emerald-50 p-4">
                        <p className="text-xs font-medium text-emerald-600">
                          Resolved
                        </p>

                        <p className="mt-1 text-xl font-bold text-emerald-950">
                          {formatNumber(
                            questionAnalytics?.answeredQuestions ?? 0,
                          )}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-amber-50 p-4">
                        <p className="text-xs font-medium text-amber-600">
                          Awaiting reply
                        </p>

                        <p className="mt-1 text-xl font-bold text-amber-950">
                          {formatNumber(
                            questionAnalytics?.pendingQuestions ?? 0,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            {/* Coupon Analytics */}
            <section id="coupons" className="scroll-mt-72 mt-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-950">
                  Coupon Analytics
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Measure coupon usage, generated revenue and total discounts
                  given.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <article className="relative overflow-hidden rounded-3xl border border-violet-200 bg-violet-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-violet-100" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-violet-700 shadow-sm">
                        <TicketPercent size={22} />
                      </div>

                      <span className="rounded-full border border-violet-200 bg-white px-2.5 py-1 text-xs font-semibold text-violet-700">
                        Usage
                      </span>
                    </div>

                    <p className="mt-5 text-sm font-medium text-violet-700">
                      Coupon Uses
                    </p>

                    <h3 className="mt-1 text-3xl font-bold tracking-tight text-violet-950">
                      {formatNumber(couponAnalytics?.totalCouponUsage ?? 0)}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-violet-700">
                      Total coupon redemptions during the selected period.
                    </p>
                  </div>
                </article>

                <article className="relative overflow-hidden rounded-3xl border border-blue-200 bg-blue-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-100" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
                        <ReceiptIndianRupee size={22} />
                      </div>

                      <span className="rounded-full border border-blue-200 bg-white px-2.5 py-1 text-xs font-semibold text-blue-700">
                        Revenue
                      </span>
                    </div>

                    <p className="mt-5 text-sm font-medium text-blue-700">
                      Coupon Revenue
                    </p>

                    <h3 className="mt-1 text-3xl font-bold tracking-tight text-blue-950">
                      {formatCurrency(couponAnalytics?.couponRevenue ?? 0)}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-blue-700">
                      Revenue generated from orders where coupons were applied.
                    </p>
                  </div>
                </article>

                <article className="relative overflow-hidden rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-red-100" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-red-700 shadow-sm">
                        <Gift size={22} />
                      </div>

                      <span className="rounded-full border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-700">
                        Discount
                      </span>
                    </div>

                    <p className="mt-5 text-sm font-medium text-red-700">
                      Total Discount Given
                    </p>

                    <h3 className="mt-1 text-3xl font-bold tracking-tight text-red-950">
                      {formatCurrency(couponAnalytics?.totalDiscountGiven ?? 0)}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-red-700">
                      Total discount value granted through coupon redemptions.
                    </p>
                  </div>
                </article>

                <article className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-100" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                        <BadgePercent size={22} />
                      </div>

                      <span className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {couponUsageRate.toFixed(1)}%
                      </span>
                    </div>

                    <p className="mt-5 text-sm font-medium text-emerald-700">
                      Orders With Coupons
                    </p>

                    <h3 className="mt-1 text-3xl font-bold tracking-tight text-emerald-950">
                      {formatNumber(couponAnalytics?.ordersWithCoupons ?? 0)}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-emerald-700">
                      Percentage of orders completed using a coupon.
                    </p>
                  </div>
                </article>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
                <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
                  <div className="border-b border-slate-100 p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                        <TicketPercent size={21} />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-950">
                          Top Coupons
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Most-used coupons and their performance.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    {topCoupons.length > 0 ? (
                      <div className="space-y-3">
                        {topCoupons
                          .slice(0, 6)
                          .map((coupon: any, index: number) => (
                            <div
                              key={coupon.code ?? index}
                              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:border-slate-300 hover:bg-white hover:shadow-md"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
                                    {index + 1}
                                  </div>

                                  <div>
                                    <p className="font-bold text-slate-950">
                                      {coupon.code ?? "Unknown coupon"}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                      {formatNumber(
                                        coupon.usageCount ??
                                          coupon.usedCount ??
                                          coupon.orders ??
                                          0,
                                      )}{" "}
                                      uses
                                    </p>
                                  </div>
                                </div>

                                <div className="text-left sm:text-right">
                                  <p className="font-bold text-slate-950">
                                    {formatCurrency(
                                      coupon.revenue ??
                                        coupon.couponRevenue ??
                                        0,
                                    )}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {formatCurrency(
                                      coupon.discountGiven ??
                                        coupon.totalDiscount ??
                                        0,
                                    )}{" "}
                                    discount
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="flex h-64 items-center justify-center rounded-2xl bg-slate-50">
                        <div className="text-center">
                          <TicketPercent
                            size={30}
                            className="mx-auto text-slate-300"
                          />

                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            No coupon usage available
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Coupon performance will appear after customers
                            redeem coupons.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </article>

                <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <Gift size={22} />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-950">
                    Coupon Summary
                  </h3>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-medium text-slate-500">
                        Most-used coupon
                      </p>

                      <p className="mt-1 break-all text-lg font-bold text-slate-950">
                        {typeof couponAnalytics?.mostUsedCoupon === "string"
                          ? couponAnalytics.mostUsedCoupon
                          : couponAnalytics?.mostUsedCoupon?.code ||
                            "No coupon"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-blue-50 p-4">
                      <p className="text-xs font-medium text-blue-600">
                        Coupon order AOV
                      </p>

                      <p className="mt-1 text-xl font-bold text-blue-950">
                        {formatCurrency(
                          couponAnalytics?.averageOrderValueWithCoupons ?? 0,
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-red-50 p-4">
                      <p className="text-xs font-medium text-red-600">
                        Average discount per order
                      </p>

                      <p className="mt-1 text-xl font-bold text-red-950">
                        {formatCurrency(averageDiscountPerCouponOrder)}
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            {/* Business Insights */}
            <section id="insights" className="scroll-mt-72 mt-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-950">
                    Business Insights
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Actionable observations generated from your store analytics.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {formatNumber(positiveInsightCount)} positive
                  </span>

                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    {formatNumber(warningInsightCount)} attention
                  </span>

                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {formatNumber(informationalInsightCount)} informational
                  </span>
                </div>
              </div>

              <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="relative overflow-hidden border-b border-slate-100 bg-slate-950 p-5 text-white sm:p-6">
                  <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/5" />
                  <div className="absolute -bottom-20 right-20 h-40 w-40 rounded-full bg-violet-500/10" />

                  <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                        <Lightbulb size={23} />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold">
                          Analytics Recommendations
                        </h3>

                        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
                          Review these insights to identify growth
                          opportunities, operational risks and areas requiring
                          attention.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Total insights
                      </p>

                      <p className="mt-1 text-xl font-bold text-white">
                        {formatNumber(insights.length)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  {insights.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      {insights.map((insight, index) => {
                        const style =
                          INSIGHT_STYLES[insight.type] ?? INSIGHT_STYLES.info;

                        const InsightIcon = style.icon;

                        return (
                          <article
                            key={`${insight.title}-${index}`}
                            className={`group relative overflow-hidden rounded-3xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${style.cardClassName}`}
                          >
                            <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/40" />

                            <div className="relative">
                              <div className="flex items-start justify-between gap-4">
                                <div
                                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${style.iconBackgroundClassName}`}
                                >
                                  <InsightIcon
                                    size={21}
                                    className={style.iconClassName}
                                  />
                                </div>

                                <span
                                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${style.badgeClassName}`}
                                >
                                  {style.label}
                                </span>
                              </div>

                              <h4
                                className={`mt-5 text-base font-bold ${style.titleClassName}`}
                              >
                                {insight.title}
                              </h4>

                              <p
                                className={`mt-2 text-sm leading-6 ${style.messageClassName}`}
                              >
                                {insight.message}
                              </p>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex min-h-72 items-center justify-center rounded-3xl bg-slate-50 px-6">
                      <div className="max-w-md text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200 text-slate-500">
                          <Lightbulb size={25} />
                        </div>

                        <p className="mt-4 text-base font-bold text-slate-800">
                          No insights available
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          Business insights will appear when enough analytics
                          data is available for the selected period.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            </section>

            <article className="mt-6 overflow-hidden rounded-3xl border bg-white shadow-sm">
              <div className="border-b p-6">
                <h3 className="text-lg font-bold">Top Customers</h3>

                <p className="text-sm text-slate-500 mt-1">
                  Customers generating the highest revenue.
                </p>
              </div>

              <div className="divide-y">
                {topCustomers.map((customer, index) => (
                  <div
                    key={customer.userId}
                    className="flex items-center justify-between gap-4 p-5 hover:bg-slate-50 transition"
                  >
                    <div>
                      <p className="font-semibold">
                        #{index + 1} {customer.name}
                      </p>

                      <p className="text-sm text-slate-500">{customer.email}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold">
                        {formatCurrency(customer.totalSpent)}
                      </p>

                      <p className="text-xs text-slate-500">
                        {customer.orderCount} Orders
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>
        ) : (
          <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              No analytics data
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Refresh the page to request analytics data.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
