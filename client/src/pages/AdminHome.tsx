import { useState, type ReactNode } from "react";
import { Link } from "wouter";
import {
  Users,
  Package,
  Mail,
  ShoppingBag,
  Heart,
  Star,
  TicketPercent,
  ArrowUpRight,
  LayoutDashboard,
  Activity,
  Layers3,
  ChevronRight,
  MessageCircleQuestion,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts";

const BAR_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#059669",
  "#f59e0b",
  "#e11d48",
  "#0891b2",
  "#4f46e5",
  "#ea580c",
];

const PIE_COLORS = ["#2563eb", "#7c3aed", "#059669", "#f59e0b"];

interface ActiveShapeProps {
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  fill?: string;
}

export default function AdminHome() {
  const { dashboardStats } = useApp();

  const [activeIndex, setActiveIndex] = useState(0);

  const stats = dashboardStats;

  const analyticsData = [
  { name: "Users", shortName: "Users", value: stats.users },
  { name: "Products", shortName: "Products", value: stats.products },
  { name: "Orders", shortName: "Orders", value: stats.orders },
  { name: "Reviews", shortName: "Reviews", value: stats.reviews },
  { name: "Wishlists", shortName: "Wishlist", value: stats.wishlists },
  { name: "Messages", shortName: "Messages", value: stats.messages },
  {
    name: "Product Questions",
    shortName: "Questions",
    value: stats.productQuestions,
  },
  { name: "Coupons", shortName: "Coupons", value: stats.coupons },
];

  const distributionData = [
  { name: "Orders", value: stats.orders },
  { name: "Products", value: stats.products },
  { name: "Users", value: stats.users },
  {
    name: "Questions",
    value: stats.productQuestions,
  },
];

  const totalRecords = analyticsData.reduce(
    (total, item) => total + item.value,
    0,
  );

  const activeDistributionItem =
    distributionData[activeIndex] || distributionData[0];

  const renderActiveShape = ({
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle = 0,
    endAngle = 0,
    fill = "#2563eb",
  }: ActiveShapeProps) => {
    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 7}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    );
  };

  const statCards = [
    {
      title: "Total Users",
      mobileTitle: "Users",
      value: stats.users,
      description: "Registered customer accounts",
      to: "/admin/users",
      icon: <Users size={21} />,
      iconStyle: "bg-blue-50 text-blue-600",
      indicatorStyle: "bg-blue-500",
    },
    {
      title: "Products",
      mobileTitle: "Products",
      value: stats.products,
      description: "Products currently in catalogue",
      to: "/admin/products",
      icon: <Package size={21} />,
      iconStyle: "bg-violet-50 text-violet-600",
      indicatorStyle: "bg-violet-500",
    },
    {
      title: "Total Orders",
      mobileTitle: "Orders",
      value: stats.orders,
      description: "Orders placed on the store",
      to: "/admin/orders",
      icon: <ShoppingBag size={21} />,
      iconStyle: "bg-emerald-50 text-emerald-600",
      indicatorStyle: "bg-emerald-500",
    },
    {
      title: "Messages",
      mobileTitle: "Messages",
      value: stats.messages,
      description: "Customer contact requests",
      to: "/admin/contacts",
      icon: <Mail size={21} />,
      iconStyle: "bg-cyan-50 text-cyan-600",
      indicatorStyle: "bg-cyan-500",
    },
    {
      title: "Wishlists",
      mobileTitle: "Wishlists",
      value: stats.wishlists,
      description: "Saved customer product entries",
      to: "/admin/wishlists",
      icon: <Heart size={21} />,
      iconStyle: "bg-rose-50 text-rose-600",
      indicatorStyle: "bg-rose-500",
    },
    {
      title: "Reviews",
      mobileTitle: "Reviews",
      value: stats.reviews,
      description: "Customer product feedback",
      to: "/admin/reviews",
      icon: <Star size={21} />,
      iconStyle: "bg-amber-50 text-amber-600",
      indicatorStyle: "bg-amber-500",
    },

    {
  title: "Product Questions",
  mobileTitle: "Questions",
  value: stats.productQuestions,
  description: "Customer questions submitted on product pages",
  to: "/admin/product-questions",
  icon: <MessageCircleQuestion size={21} />,
  iconStyle: "bg-indigo-50 text-indigo-600",
  indicatorStyle: "bg-indigo-500",
},
    {
      title: "Coupons",
      mobileTitle: "Coupons",
      value: stats.coupons,
      description: "Promotional coupon records",
      to: "/admin/coupons",
      icon: <TicketPercent size={21} />,
      iconStyle: "bg-orange-50 text-orange-600",
      indicatorStyle: "bg-orange-500",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50/80">
      <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
        {/* Hero section */}
        <section className="relative mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm sm:mb-6 sm:rounded-3xl lg:mb-8">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-14 -top-16 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl sm:h-72 sm:w-72" />
            <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl" />
            <div className="absolute right-[20%] top-1/2 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
          </div>

          <div className="relative p-5 sm:p-7 lg:p-9">
            <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                  <LayoutDashboard size={14} className="text-blue-300" />

                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-200">
                    Admin control centre
                  </span>
                </div>

                <h1 className="text-2xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Store dashboard
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
                  Review your store activity, monitor customer engagement and
                  quickly open every management section from one place.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:max-w-md">
                <HeroMetric
                  icon={<Layers3 size={18} />}
                  label="Total records"
                  value={totalRecords}
                />

                <HeroMetric
                  icon={<Activity size={18} />}
                  label="Store sections"
                  value={statCards.length}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stat cards */}
        <section className="mb-5 sm:mb-6 lg:mb-8">
          <div className="mb-4 flex items-end justify-between gap-4 px-1">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                Store overview
              </p>

              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                Key statistics
              </h2>
            </div>

            <span className="hidden text-sm text-slate-500 sm:block">
              Select a card to manage the section
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-4">
            {statCards.map((card) => (
              <StatCard key={card.to} {...card} />
            ))}
          </div>
        </section>

        {/* Charts */}
        <section className="mb-5 grid gap-5 sm:mb-6 lg:mb-8 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.8fr)]">
          {/* Bar chart */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
            <SectionHeader
              eyebrow="Analytics"
              title="Platform activity"
              description="A comparison of the main records stored across your platform."
              icon={<Activity size={19} />}
            />

            <div className="px-2 pb-4 pt-1 sm:px-5 sm:pb-6">
              <div className="h-[290px] w-full sm:h-[350px] lg:h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData}
                    margin={{
                      top: 18,
                      right: 6,
                      left: -22,
                      bottom: 2,
                    }}
                    barCategoryGap="24%"
                  >
                    <CartesianGrid
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="shortName"
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      tick={{
                        fontSize: 10,
                        fill: "#64748b",
                        fontWeight: 600,
                      }}
                      tickMargin={12}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      width={45}
                      tick={{
                        fontSize: 11,
                        fill: "#94a3b8",
                      }}
                    />

                    <Tooltip
                      cursor={{
                        fill: "#f8fafc",
                        radius: 12,
                      }}
                      content={<CustomBarTooltip />}
                    />

                    <Bar
                      dataKey="value"
                      radius={[8, 8, 2, 2]}
                      maxBarSize={52}
                      animationDuration={1000}
                    >
                      {analyticsData.map((item, index) => (
                        <Cell
                          key={item.name}
                          fill={BAR_COLORS[index % BAR_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Pie chart */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
            <SectionHeader
              eyebrow="Distribution"
              title="Core records"
              description="The proportional distribution of your primary store data."
              icon={<Layers3 size={19} />}
            />

            <div className="px-4 pb-5 sm:px-6 sm:pb-6">
              <div className="relative mx-auto h-[250px] w-full max-w-[370px] sm:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      onClick={(_, index) => setActiveIndex(index)}
                      data={distributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="55%"
                      outerRadius="77%"
                      paddingAngle={3}
                      stroke="none"
                      animationDuration={1100}
                    >
                      {distributionData.map((item, index) => (
                        <Cell
                          key={item.name}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="max-w-[90px] truncate text-xs font-semibold text-slate-500">
                      {activeDistributionItem.name}
                    </p>

                    <p className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                      {activeDistributionItem.value}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {distributionData.map((item, index) => (
                  <button
                    key={item.name}
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                    onClick={() => setActiveIndex(index)}
                    className={`flex min-w-0 items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition ${
                      activeIndex === index
                        ? "border-slate-300 bg-slate-50"
                        : "border-slate-100 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            PIE_COLORS[index % PIE_COLORS.length],
                        }}
                      />

                      <span className="truncate text-xs font-semibold text-slate-600">
                        {item.name}
                      </span>
                    </span>

                    <span className="shrink-0 text-xs font-black text-slate-950">
                      {item.value}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Navigation and summary */}
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.65fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                  Management
                </p>

                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                  Quick navigation
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Open a management area without searching through the menu.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {statCards.map((item) => (
                <NavigationCard
                  key={item.to}
                  to={item.to}
                  title={item.mobileTitle}
                  description={item.description}
                  icon={item.icon}
                  iconStyle={item.iconStyle}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                Summary
              </p>

              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                Store records
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                A compact overview of all available dashboard counts.
              </p>
            </div>

            <div className="space-y-2.5">
              {analyticsData.map((item, index) => (
                <SummaryItem
                  key={item.name}
                  label={item.name}
                  value={item.value}
                  indicatorStyle={
                    [
                      "bg-blue-500",
                      "bg-violet-500",
                      "bg-emerald-500",
                      "bg-amber-500",
                      "bg-rose-500",
                      "bg-cyan-500",
                       "bg-indigo-500",
                      "bg-orange-500",
                    ][index]
                  }
                />
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Combined records
              </p>

              <div className="mt-2 flex items-end justify-between gap-4">
                <p className="text-3xl font-black tracking-tight">
                  {totalRecords}
                </p>

                <Layers3 size={24} className="text-blue-300" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function HeroMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-sm sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-blue-200">
          {icon}
        </span>

        <span className="text-xl font-black text-white sm:text-2xl">
          {value}
        </span>
      </div>

      <p className="mt-3 truncate text-xs font-semibold text-slate-300">
        {label}
      </p>
    </div>
  );
}

interface StatCardProps {
  title: string;
  mobileTitle: string;
  value: number;
  description: string;
  to: string;
  icon: ReactNode;
  iconStyle: string;
  indicatorStyle: string;
}

function StatCard({
  title,
  mobileTitle,
  value,
  description,
  to,
  icon,
  iconStyle,
  indicatorStyle,
}: StatCardProps) {
  return (
    <Link
      to={to}
      className="group block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:rounded-3xl"
    >
      <article className="relative flex h-full min-h-[148px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-slate-300 group-hover:shadow-lg sm:min-h-[190px] sm:rounded-3xl sm:p-5">
        <div
          className={`absolute inset-x-0 top-0 h-1 ${indicatorStyle}`}
        />

        <div className="flex items-start justify-between gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${iconStyle}`}
          >
            {icon}
          </div>

          <ArrowUpRight
            size={17}
            className="text-slate-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-950"
          />
        </div>

        <div className="mt-4 flex flex-1 flex-col">
          <p className="text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {value}
          </p>

          <h3 className="mt-1 text-sm font-bold text-slate-700 sm:text-base">
            <span className="sm:hidden">{mobileTitle}</span>
            <span className="hidden sm:inline">{title}</span>
          </h3>

          <p className="mt-2 hidden text-xs leading-5 text-slate-500 sm:line-clamp-2 sm:block">
            {description}
          </p>
        </div>

        <div className="mt-3 hidden items-center gap-1 text-xs font-bold text-slate-400 transition group-hover:text-slate-700 sm:flex">
          Manage section
          <ChevronRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </div>
      </article>
    </Link>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 p-4 sm:p-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600 sm:text-xs">
          {eyebrow}
        </p>

        <h2 className="mt-0.5 text-lg font-black tracking-tight text-slate-950 sm:text-xl">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

function NavigationCard({
  to,
  title,
  description,
  icon,
  iconStyle,
}: {
  to: string;
  title: string;
  description: string;
  icon: ReactNode;
  iconStyle: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <article className="flex h-full min-h-[118px] flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-slate-300 group-hover:bg-white group-hover:shadow-md sm:min-h-[150px] sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconStyle}`}
          >
            {icon}
          </div>

          <ArrowUpRight
            size={16}
            className="text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-800"
          />
        </div>

        <h3 className="mt-4 text-sm font-black text-slate-950 sm:text-base">
          {title}
        </h3>

        <p className="mt-1 hidden text-xs leading-5 text-slate-500 sm:line-clamp-2 sm:block">
          {description}
        </p>
      </article>
    </Link>
  );
}

function SummaryItem({
  label,
  value,
  indicatorStyle,
}: {
  label: string;
  value: number;
  indicatorStyle: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-3 transition hover:border-slate-200 hover:bg-white">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${indicatorStyle}`} />

        <span className="truncate text-sm font-semibold text-slate-600">
          {label}
        </span>
      </div>

      <span className="shrink-0 text-sm font-black text-slate-950">
        {value}
      </span>
    </div>
  );
}

interface TooltipPayloadItem {
  value?: number;
  name?: string;
  payload?: {
    name?: string;
  };
}

function CustomBarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;

  const item = payload[0];

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-xl">
      <p className="text-xs font-semibold text-slate-500">
        {item.payload?.name}
      </p>

      <p className="mt-0.5 text-base font-black text-slate-950">
        {item.value ?? 0}
      </p>
    </div>
  );
}

function CustomPieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;

  const item = payload[0];

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-xl">
      <p className="text-xs font-semibold text-slate-500">
        {item.name}
      </p>

      <p className="mt-0.5 text-base font-black text-slate-950">
        {item.value ?? 0}
      </p>
    </div>
  );
}