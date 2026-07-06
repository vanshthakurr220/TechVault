import { useState } from "react";
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

export default function AdminHome() {
  const { dashboardStats } = useApp();

  const [activeIndex, setActiveIndex] = useState(0);
  const stats = dashboardStats;
  const loading = false;

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
      props;

    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    );
  };

  const analyticsData = [
    { name: "Users", value: stats.users },
    { name: "Products", value: stats.products },
    { name: "Orders", value: stats.orders },
    { name: "Reviews", value: stats.reviews },
    { name: "Wishlists", value: stats.wishlists },
    { name: "Messages", value: stats.messages },
    { name: "Coupons", value: stats.coupons },
  ];

  const pieData = [
    { name: "Orders", value: stats.orders },
    { name: "Products", value: stats.products },
    { name: "Users", value: stats.users },
    { name: "Reviews", value: stats.reviews },
  ];

  const COLORS = ["#2563eb", "#7c3aed", "#059669", "#f59e0b"];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-100 blur-3xl" />
          <div className="absolute bottom-0 right-32 h-32 w-32 rounded-full bg-violet-100 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-blue-600">
                Admin Analytics
              </p>

              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Dashboard Overview
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Monitor real-time platform activity, users, orders, products,
                reviews, messages and coupons.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Records
              </p>

              <h2 className="mt-1 text-3xl font-black text-slate-950">
                {analyticsData.reduce((total, item) => total + item.value, 0)}
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link to="/admin/users">
          <StatCard
            title="Total Users"
            value={stats.users}
            icon={<Users size={22} />}
            loading={loading}
            accent="bg-blue-50 text-blue-600"
          />
        </Link>

        <Link to="/admin/products">
          <StatCard
            title="Products"
            value={stats.products}
            icon={<Package size={22} />}
            loading={loading}
            accent="bg-violet-50 text-violet-600"
          />
        </Link>

        <Link to="/admin/orders">
          <StatCard
            title="Orders"
            value={stats.orders}
            icon={<ShoppingBag size={22} />}
            loading={loading}
            accent="bg-emerald-50 text-emerald-600"
          />
        </Link>

        <Link to="/admin/contacts">
          <StatCard
            title="Messages"
            value={stats.messages}
            icon={<Mail size={22} />}
            loading={loading}
            accent="bg-cyan-50 text-cyan-600"
          />
        </Link>

        <Link to="/admin/wishlists">
          <StatCard
            title="Wishlists"
            value={stats.wishlists}
            icon={<Heart size={22} />}
            loading={loading}
            accent="bg-rose-50 text-rose-600"
          />
        </Link>

        <Link to="/admin/reviews">
          <StatCard
            title="Reviews"
            value={stats.reviews}
            icon={<Star size={22} />}
            loading={loading}
            accent="bg-amber-50 text-amber-600"
          />
        </Link>

        <Link to="/admin/coupons">
          <StatCard
            title="Coupons"
            value={stats.coupons}
            icon={<TicketPercent size={22} />}
            loading={loading}
            accent="bg-orange-50 text-orange-600"
          />
        </Link>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Platform Analytics
              </h2>
              <p className="text-sm text-slate-500">
                Real numbers fetched from your dashboard stats.
              </p>
            </div>
          </div>

          <div className="h-[320px] w-full sm:h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="value"
                  radius={[14, 14, 0, 0]}
                  animationDuration={1400}
                >
                  {analyticsData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={
                        [
                          "#2563eb",
                          "#7c3aed",
                          "#059669",
                          "#f59e0b",
                          "#e11d48",
                          "#0891b2",
                          "#ea580c",
                        ][index % 7]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-950">Distribution</h2>
            <p className="text-sm text-slate-500">
              Orders, products, users and reviews.
            </p>
          </div>

          <div className="h-[320px] w-full sm:h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  innerRadius={58}
                  label
                  isAnimationActive
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-950">Quick Navigation</h2>
          <p className="text-sm text-slate-500">
            Manage each admin section quickly.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <NavCard to="/admin/users" icon={<Users size={20} />} title="Users" />
          <NavCard
            to="/admin/products"
            icon={<Package size={20} />}
            title="Products"
          />
          <NavCard
            to="/admin/orders"
            icon={<ShoppingBag size={20} />}
            title="Orders"
          />
          <NavCard
            to="/admin/contacts"
            icon={<Mail size={20} />}
            title="Messages"
          />
          <NavCard
            to="/admin/wishlists"
            icon={<Heart size={20} />}
            title="Wishlists"
          />
          <NavCard
            to="/admin/reviews"
            icon={<Star size={20} />}
            title="Reviews"
          />
          <NavCard
            to="/admin/coupons"
            icon={<TicketPercent size={20} />}
            title="Coupons"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="mb-5 text-xl font-bold text-slate-950">
            Store Summary
          </h3>

          <div className="space-y-3">
            <SummaryItem label="Registered Users" value={stats.users} />
            <SummaryItem label="Available Products" value={stats.products} />
            <SummaryItem label="Orders Received" value={stats.orders} />
            <SummaryItem label="Customer Reviews" value={stats.reviews} />
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="mb-5 text-xl font-bold text-slate-950">Engagement</h3>

          <div className="space-y-3">
            <SummaryItem label="Wishlist Entries" value={stats.wishlists} />
            <SummaryItem label="Messages Received" value={stats.messages} />
            <SummaryItem label="Active Coupons" value={stats.coupons} />
            <SummaryItem label="Platform Orders" value={stats.orders} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  loading,
  accent,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  loading: boolean;
  accent: string;
}) {
  return (
    <div className="group h-full cursor-pointer rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>

          <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
            {loading ? "..." : value}
          </h2>
        </div>

        <div className={`rounded-2xl p-3 ${accent}`}>{icon}</div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-slate-400">
        <span>View details</span>
        <ArrowUpRight
          size={16}
          className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
        />
      </div>
    </div>
  );
}

function NavCard({
  to,
  title,
  icon,
}: {
  to: string;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <Link to={to}>
      <div className="group cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:bg-slate-950 hover:shadow-lg">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm transition group-hover:bg-white/10 group-hover:text-white">
          {icon}
        </div>

        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-slate-950 transition group-hover:text-white">
            {title}
          </h3>

          <ArrowUpRight
            size={15}
            className="text-slate-400 transition group-hover:text-white"
          />
        </div>
      </div>
    </Link>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <span className="text-sm font-medium text-slate-500">{label}</span>

      <span className="text-base font-black text-slate-950">{value}</span>
    </div>
  );
}
