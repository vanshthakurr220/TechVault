import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  Users,
  Package,
  Mail,
  ShoppingBag,
  Heart,
  Star,
  TicketPercent,
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
  const { fetchDashboardStats: fetchStatsFromContext } = useApp();

  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    messages: 0,
    orders: 0,
    wishlists: 0,
    reviews: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
      props;

    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 12}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    );
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await fetchStatsFromContext();
      setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const analyticsData = [
    {
      name: "Users",
      value: stats.users,
    },
    {
      name: "Products",
      value: stats.products,
    },
    {
      name: "Orders",
      value: stats.orders,
    },
    {
      name: "Reviews",
      value: stats.reviews,
    },
    {
      name: "Wishlists",
      value: stats.wishlists,
    },
    {
      name: "Messages",
      value: stats.messages,
    },
  ];

  const pieData = [
    {
      name: "Orders",
      value: stats.orders,
    },
    {
      name: "Products",
      value: stats.products,
    },
    {
      name: "Users",
      value: stats.users,
    },
    {
      name: "Reviews",
      value: stats.reviews,
    },
  ];

  const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-10">
        <p className="uppercase tracking-[0.25em] text-sm text-muted-foreground mb-2">
          Admin Analytics
        </p>

        <h1 className="text-5xl font-bold mb-3">Dashboard Overview</h1>

        <p className="text-muted-foreground text-lg">
          Monitor platform performance, users, products and activity.
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
        <Link to="/admin/users">
          <StatCard
            title="Total Users"
            value={stats.users}
            icon={<Users size={24} />}
            loading={loading}
          />
        </Link>

        <Link to="/admin/products">
          <StatCard
            title="Products"
            value={stats.products}
            icon={<Package size={24} />}
            loading={loading}
          />
        </Link>

        <Link to="/admin/orders">
          <StatCard
            title="Orders"
            value={stats.orders}
            icon={<ShoppingBag size={24} />}
            loading={loading}
          />
        </Link>

        <Link to="/admin/contacts">
          <StatCard
            title="Messages"
            value={stats.messages}
            icon={<Mail size={24} />}
            loading={loading}
          />
        </Link>

        <Link to="/admin/wishlists">
          <StatCard
            title="Wishlists"
            value={stats.wishlists}
            icon={<Heart size={24} />}
            loading={loading}
          />
        </Link>

        <Link to="/admin/reviews">
          <StatCard
            title="Reviews"
            value={stats.reviews}
            icon={<Star size={24} />}
            loading={loading}
          />
        </Link>

        <Link to="/admin/coupons">
          <StatCard
            title="Coupons"
            value={stats.reviews}
            icon={<TicketPercent size={24} />}
            loading={loading}
          />
        </Link>
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        {/* Bar Chart */}
        <div className="lg:col-span-2 rounded-3xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Platform Analytics</h2>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="value"
                radius={[12, 12, 0, 0]}
                animationDuration={1500}
              >
                {analyticsData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={
                      [
                        "#3b82f6",
                        "#8b5cf6",
                        "#10b981",
                        "#f59e0b",
                        "#ef4444",
                        "#06b6d4",
                      ][index % 6]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Distribution</h2>

          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                innerRadius={60}
                label
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={1800}
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

      {/* QUICK ACCESS */}
      <div className="rounded-3xl border bg-card p-8">
        <h2 className="text-2xl font-semibold mb-6">Quick Navigation</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          <NavCard to="/admin/users" icon={<Users />} title="Users" />

          <NavCard to="/admin/products" icon={<Package />} title="Products" />

          <NavCard to="/admin/orders" icon={<ShoppingBag />} title="Orders" />

          <NavCard to="/admin/contacts" icon={<Mail />} title="Messages" />

          <NavCard to="/admin/wishlists" icon={<Heart />} title="Wishlists" />

          <NavCard to="/admin/reviews" icon={<Star />} title="Reviews" />
          <NavCard
            to="/admin/coupons"
            icon={<TicketPercent size={24} />}
            title="Coupons"
          />
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid md:grid-cols-2 gap-6 mt-10">
        <div className="rounded-3xl border bg-card p-6">
          <h3 className="text-xl font-semibold mb-4">Store Summary</h3>

          <div className="space-y-4">
            <SummaryItem label="Registered Users" value={stats.users} />

            <SummaryItem label="Available Products" value={stats.products} />

            <SummaryItem label="Orders Received" value={stats.orders} />

            <SummaryItem label="Customer Reviews" value={stats.reviews} />
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-6">
          <h3 className="text-xl font-semibold mb-4">Engagement</h3>

          <div className="space-y-4">
            <SummaryItem label="Wishlist Entries" value={stats.wishlists} />

            <SummaryItem label="Messages Received" value={stats.messages} />

            <SummaryItem label="Products Catalog" value={stats.products} />

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
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-muted-foreground text-sm">{title}</p>

          <h2 className="text-4xl font-bold mt-2">{loading ? "..." : value}</h2>
        </div>

        <div className="p-4 rounded-2xl bg-primary/10">{icon}</div>
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
      <div className="cursor-pointer rounded-2xl border p-5 hover:border-primary hover:shadow-md transition">
        <div className="mb-4">{icon}</div>

        <h3 className="font-semibold">{title}</h3>
      </div>
    </Link>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center border-b pb-3">
      <span className="text-muted-foreground">{label}</span>

      <span className="font-semibold">{value}</span>
    </div>
  );
}
