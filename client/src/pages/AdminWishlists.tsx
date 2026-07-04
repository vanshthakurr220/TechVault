import { useEffect, useState, useMemo } from "react";
import {
  Heart,
  Search,
  Grid3x3,
  List,
  User,
  Mail,
  Package,
  Clock,
  DollarSign,
  ChevronRight,
  Activity,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";

interface WishlistRow {
  _id: string;

  userId: {
    _id: string;
    username: string;
    email: string;
  } | null;

  productId: {
    _id: string;
    name: string;
    image?: string;
    images?: string[];
    price: number;
    category: string;
  };

  createdAt: string;
}

interface UserGroupedWishlist {
  userId: string;
  username: string;
  email: string;
  items: {
    productId: string;
    name: string;
    price: number;
    addedOn: string;
  }[];
  totalValue: number;
  lastActivity: string;
}

type ViewMode = "card" | "table";

export default function AdminWishlists() {
  const { allWishlists } = useApp();
  const [wishlistItems, setWishlistItems] = useState<WishlistRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("card");

  const [selectedUser, setSelectedUser] = useState<UserGroupedWishlist | null>(
    null,
  );

  useEffect(() => {
    const flattenedData: WishlistRow[] =
      allWishlists?.flatMap((wishlist: any) =>
        (wishlist.items || [])
          .filter((item: any) => item.productId)
          .map((item: any) => ({
            _id: item._id,
            userId: wishlist.userId,
            productId: item.productId,
            createdAt: item.addedAt || wishlist.createdAt,
          })),
      ) || [];

    setWishlistItems(flattenedData);
    setLoading(false);
  }, [allWishlists]);

  const groupedWishlists = useMemo(() => {
    const groups: Record<string, UserGroupedWishlist> = {};

    wishlistItems.forEach((item) => {
      const uId = item.userId?._id || "anonymous";
      if (!groups[uId]) {
        groups[uId] = {
          userId: uId,
          username: item.userId?.username || "Anonymous User",
          email: item.userId?.email || "N/A",
          items: [],
          totalValue: 0,
          lastActivity: item.createdAt,
        };
      }

      groups[uId].items.push({
        productId: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        addedOn: item.createdAt,
      });

      groups[uId].totalValue += item.productId.price;

      if (new Date(item.createdAt) > new Date(groups[uId].lastActivity)) {
        groups[uId].lastActivity = item.createdAt;
      }
    });

    Object.values(groups).forEach((group) => {
      group.items.sort(
        (a, b) => new Date(b.addedOn).getTime() - new Date(a.addedOn).getTime(),
      );
    });

    return Object.values(groups).filter(
      (group) =>
        group.username.toLowerCase().includes(search.toLowerCase()) ||
        group.email.toLowerCase().includes(search.toLowerCase()) ||
        group.items.some((i) =>
          i.name.toLowerCase().includes(search.toLowerCase()),
        ),
    );
  }, [wishlistItems, search]);

  const renderUserWishlistCard = (group: UserGroupedWishlist) => (
    <div
      key={group.userId}
      className="bg-white rounded-3x1` border border-slate-200 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 overflow-hidden flex flex-col h-full group/card"
    >
      {/* User Header Section - Gradient Background */}
      <div className="p-6 border-b border-slate-100 bg-linear-to-br from-slate-50 to-white relative overflow-hidden">
        <Heart className="absolute -right-4 -top-4 w-24 h-24 text-primary/5 -rotate-12 group-hover/card:scale-110 transition-transform duration-700" />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center text-white transform group-hover/card:rotate-6 transition-transform duration-300">
              <User size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover/card:text-primary transition-colors">
                {group.username}
              </h3>
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1.5 font-medium">
                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                  <Mail size={10} className="text-slate-400" />
                </div>
                <span className="truncate max-w-40">{group.email}</span>
              </div>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
            <span className="text-[9px] font-semibold text-slate-500">ID</span>

            <span className="font-mono text-[10px] font-bold text-primary">
              #{group.userId.slice(-6).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-white/60 backdrop-blur-sm p-3 rounded-2xl border border-slate-100/50 shadow-sm group-hover/card:bg-white transition-colors">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-center">
              Items
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="p-1 rounded-lg bg-indigo-50 text-indigo-500">
                <Package size={12} />
              </div>
              <span className="text-sm font-bold text-slate-700">
                {group.items.length}
              </span>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-3 rounded-2xl border border-slate-100/50 shadow-sm group-hover/card:bg-white transition-colors">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-center">
              Total
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                ₹{group.totalValue.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-3 rounded-2xl border border-slate-100/50 shadow-sm group-hover/card:bg-white transition-colors">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-center">
              Last Activity
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="p-1 rounded-lg bg-amber-50 text-amber-500">
                <Activity size={12} />
              </div>
              <span className="text-[11px] font-bold text-slate-600">
                {new Date(group.lastActivity).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Products List Section */}
      <div className="flex-1 p-0 overflow-hidden flex flex-col">
        <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Saved Products
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Added Date
          </span>
        </div>
        <div className="max-h-70 overflow-y-auto custom-scrollbar">
          {group.items.map((item, idx) => (
            <div
              key={`${group.userId}-${item.productId}-${idx}`}
              className="px-6 py-4 hover:bg-slate-50 transition-all flex justify-between items-center gap-4 group/item border-b border-slate-50 last:border-0"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 truncate group-hover/item:text-primary transition-colors">
                  {item.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100/50">
                    ₹{item.price.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1.5 justify-end text-slate-500">
                  <Calendar size={10} className="text-slate-400" />
                  <p className="text-[11px] font-bold">
                    {new Date(item.addedOn).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 justify-end text-slate-400 mt-1">
                  <Clock size={10} />
                  <p className="text-[10px] font-medium">
                    {new Date(item.addedOn).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in mt-8 px-4 md:px-6 pb-16 bg-slate-50/30 min-h-screen">
      {/* Header */}
      <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="relative">
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary rounded-full hidden md:block"></div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            Wishlist <span className="text-primary">Intelligence</span>
          </h2>
          <p className="text-slate-500 mt-2 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} className="text-primary" />
            Customer Preference Tracking System
          </p>
        </div>

        <div className="grid grid-cols-2 lg:flex gap-3 lg:gap-4">
          {/* Total Items */}
          <div className="bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-2xl lg:rounded-[28px] p-4 lg:px-6 lg:py-4 flex items-center gap-3 lg:gap-4 group hover:border-primary/30 transition-all">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
              <Heart size={18} className="lg:w-5 lg:h-5 fill-primary" />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Total Items
              </p>

              <p className="text-xl lg:text-2xl font-black text-slate-900 leading-none mt-1.5 lg:mt-2 tracking-tighter">
                {wishlistItems.length}
              </p>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-2xl lg:rounded-[28px] p-4 lg:px-6 lg:py-4 flex items-center gap-3 lg:gap-4 group hover:border-blue-500/30 transition-all">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-110 transition-transform">
              <User size={18} className="lg:w-5 lg:h-5 fill-blue-500/20" />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Active Users
              </p>

              <p className="text-xl lg:text-2xl font-black text-slate-900 leading-none mt-1.5 lg:mt-2 tracking-tighter">
                {groupedWishlists.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Summary Box - RESTORED & IMPROVED */}
      <div className="mb-10 bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/40 p-8">
        <div className="flex flex-col xl:flex-row gap-8 xl:items-center xl:justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Wishlist Analytics Summary
            </h3>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">
              Holistic overview of user engagement and saved assets
            </p>
          </div>

          <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-3 lg:gap-4">
            {/* Unique Products */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 lg:px-5 lg:py-3 flex items-center gap-3">
              <div className="w-10 h-10 lg:w-auto lg:h-auto p-2 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Package size={18} className="lg:w-[18px] lg:h-[18px]" />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  Unique Products
                </p>

                <p className="text-xl lg:text-lg font-black text-slate-900 mt-1">
                  {new Set(wishlistItems.map((i) => i.productId?._id)).size}
                </p>
              </div>
            </div>

            {/* Total Value */}
            <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-3 sm:p-4 lg:px-5 lg:py-3 flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-10 h-10 lg:w-auto lg:h-auto p-2 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <DollarSign size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                  Total Value
                </p>

                <p className="text-base sm:text-xl lg:text-lg font-black text-slate-900 mt-1 break-all leading-tight">
                  ₹
                  {wishlistItems
                    .reduce(
                      (acc, curr) => acc + (curr.productId?.price || 0),
                      0,
                    )
                    .toLocaleString()}
                </p>
              </div>
            </div>

            {/* Avg Per User */}
            <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-4 lg:px-5 lg:py-3 flex items-center gap-3 col-span-2 lg:col-span-1">
              <div className="w-10 h-10 lg:w-auto lg:h-auto p-2 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Activity size={18} className="lg:w-[18px] lg:h-[18px]" />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  Avg. Per User
                </p>

                <p className="text-xl lg:text-lg font-black text-slate-900 mt-1">
                  {(
                    wishlistItems.length / (groupedWishlists.length || 1)
                  ).toFixed(1)}{" "}
                  Items
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="mb-10 flex flex-col xl:flex-row gap-6 items-center justify-between bg-white/80 backdrop-blur-md p-6 rounded-4x1 border border-white shadow-2xl shadow-slate-200/40">
        <div className="relative w-full xl:max-w-2xl group">
          <Search
            size={20}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
          />
          <input
            type="text"
            placeholder="Search by customer name, email or specific product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full
              h-14
              pl-14
              pr-6
              bg-slate-100/50
              border-2
              border-transparent
              rounded-[20px]
              text-base
              font-bold
              placeholder:text-slate-400
              focus:bg-white
              focus:border-primary/20
              focus:ring-4
              focus:ring-primary/5
              transition-all
              shadow-inner
            "
          />
        </div>

        <div className="flex items-center gap-4 w-full xl:w-auto">
          <div className="flex p-1.5 bg-slate-100 rounded-[22px] w-full xl:w-auto shadow-inner">
            <button
              onClick={() => setViewMode("card")}
              className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-black tracking-wide transition-all ${
                viewMode === "card"
                  ? "bg-white text-primary shadow-lg shadow-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Grid3x3 size={18} />
              GRID
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-black tracking-wide transition-all ${
                viewMode === "table"
                  ? "bg-white text-primary shadow-lg shadow-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <List size={18} />
              TABLE
            </button>
          </div>
          <Button
            variant="outline"
            className="h-14 px-8 rounded-[20px] font-black text-sm tracking-widest border-2 border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
            onClick={() => setSearch("")}
          >
            RESET
          </Button>
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
            <Heart
              size={24}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse"
            />
          </div>
          <p className="text-slate-400 font-black tracking-widest text-xs uppercase">
            Processing Wishlist Intelligence...
          </p>
        </div>
      ) : groupedWishlists.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[60px] border-4 border-dashed border-slate-100 shadow-inner">
          <div className="w-24 h-24 bg-slate-50 rounded-4xl flex items-center justify-center mx-auto mb-8 rotate-12 group hover:rotate-0 transition-transform duration-500">
            <Heart
              size={40}
              className="text-slate-200 group-hover:text-primary/20 transition-colors"
            />
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
            Intelligence Gap
          </h3>
          <p className="text-slate-400 max-w-sm mx-auto font-bold text-sm uppercase tracking-widest">
            {search
              ? `No data points found for "${search}"`
              : "Awaiting customer preference data"}
          </p>
        </div>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {groupedWishlists.map((group) => renderUserWishlistCard(group))}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Customer Profile
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Asset Count
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Portfolio Value
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Recent Signal
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {groupedWishlists.map((group) => (
                <tr
                  key={group.userId}
                  className="hover:bg-slate-50/80 transition-all group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black text-lg group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        {group.username.charAt(0)}
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 group-hover:text-primary transition-colors">
                          {group.username}
                        </p>
                        <p className="text-xs text-slate-400 font-bold tracking-tight">
                          {group.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-xl bg-indigo-50 text-[11px] font-black text-indigo-600 border border-indigo-100/50 uppercase tracking-wider w-fit">
                        {group.items.length} Units
                      </span>
                      <p className="text-[10px] text-slate-400 font-bold ml-1 uppercase">
                        Saved Products
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-base font-black text-slate-900">
                      ₹{group.totalValue.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                      <DollarSign size={10} /> Market Value
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-amber-50 text-amber-500">
                        <Clock size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-700">
                          {new Date(group.lastActivity).toLocaleDateString(
                            "en-IN",
                            { day: "2-digit", month: "short", year: "numeric" },
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                          {new Date(group.lastActivity).toLocaleTimeString(
                            "en-IN",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Button
                      onClick={() => setSelectedUser(group)}
                      variant="outline"
                      className="rounded-2xl border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest px-4 py-2 h-10 hover:bg-primary hover:text-white hover:border-primary transition-all group/btn"
                    >
                      <span>View Details</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Wishlist Details Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-999 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="
        relative
        w-full
        max-w-4xl
        max-h-[90vh]
        overflow-hidden
        bg-white
        rounded-[36px]
        border
        border-slate-200
        shadow-[0_25px_80px_rgba(0,0,0,0.25)]
        animate-in
        fade-in
        zoom-in-95
        duration-200
      "
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedUser(null)}
              className="
    absolute top-5    right-5    z-20    flex    items-center    justify-center    w-11    h-11    rounded-2xl    bg-linear-to-br    from-red-500    to-red-600    text-white    shadow-lg    shadow-red-500/20    hover:shadow-red-500/40    hover:scale-105    active:scale-95    transition-all    duration-300    font-black  "
            >
              ✕
            </button>

            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[90vh]">
              {/* Header */}
              <div className="p-8 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
                <Heart className="absolute -right-4 -top-4 w-32 h-32 text-primary/5 -rotate-12" />

                <div className="flex items-start justify-between relative z-10">
                  <div className="flex gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center text-white">
                      <User size={28} />
                    </div>

                    <div>
                      <h2 className="font-black text-2xl text-slate-900">
                        {selectedUser.username}
                      </h2>

                      <div className="flex items-center gap-2 text-slate-500 text-sm mt-2">
                        <Mail size={14} />
                        <span>{selectedUser.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/10 text-[10px] font-bold text-primary uppercase tracking-widest">
                    ID: {selectedUser.userId}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Items
                    </p>

                    <div className="flex justify-center items-center gap-2 mt-2">
                      <Package size={14} className="text-indigo-500" />

                      <span className="font-black text-lg text-slate-800">
                        {selectedUser.items.length}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Total
                    </p>

                    <div className="text-center mt-2">
                      <span className="font-black text-lg text-slate-900">
                        ₹{selectedUser.totalValue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Last Activity
                    </p>

                    <div className="flex justify-center items-center gap-2 mt-2">
                      <Activity size={14} className="text-amber-500" />

                      <span className="font-black text-sm text-slate-700">
                        {new Date(selectedUser.lastActivity).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Section */}
              <div>
                <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>

                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                      Saved Products
                    </span>
                  </div>

                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Added Date
                  </span>
                </div>

                {selectedUser.items.map((item, idx) => (
                  <div
                    key={`${item.productId}-${idx}`}
                    className="
                px-8
                py-5
                border-b
                border-slate-50
                hover:bg-slate-50
                transition-all
                flex
                justify-between
                items-center
                gap-4
              "
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">
                        {item.name}
                      </h4>

                      <span className="inline-flex mt-2 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-black">
                        ₹{item.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end text-slate-600">
                        <Calendar size={12} />

                        <span className="font-bold text-sm">
                          {new Date(item.addedOn).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 justify-end mt-2 text-slate-400">
                        <Clock size={12} />

                        <span className="text-xs font-semibold">
                          {new Date(item.addedOn).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <div>
                  <span className="text-sm text-slate-500 font-semibold">
                    Total Wishlist Value
                  </span>

                  <span className="ml-2 text-xl font-black text-slate-900">
                    ₹{selectedUser.totalValue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
