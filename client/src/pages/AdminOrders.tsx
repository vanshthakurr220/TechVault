import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  X,
  CreditCard,
  MapPin,
  User,
  Calendar,
} from "lucide-react";
import Swal from "sweetalert2";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";

interface Order {
  _id: string;
  userId: string;
  items: {
    name?: string;
    quantity: number;
    price: number;
    image?: string;
    images?: string[];
  }[];
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethod: string;
  createdAt: string;
}

export default function AdminOrders() {
  const {
    allOrders,
    fetchAllOrders,
    updateOrderStatus: updateOrderStatusInContext,
    updatePaymentStatus: updatePaymentStatusInContext,
  } = useApp();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setOrders(Array.isArray(allOrders) ? (allOrders as Order[]) : []);
  }, [allOrders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      await fetchAllOrders();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: Order["status"],
  ) => {
    const currentOrder = orders.find((o) => o._id === orderId);
    if (!currentOrder) return;

    if (newStatus === "delivered" || newStatus === "cancelled") {
      const result = await Swal.fire({
        title:
          newStatus === "delivered"
            ? "Mark Order as Delivered?"
            : "Cancel Order?",
        text:
          newStatus === "delivered"
            ? "This confirms the customer has received the order."
            : "This action may affect refunds and inventory.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: newStatus === "delivered" ? "#16a34a" : "#dc2626",
        cancelButtonColor: "#64748b",
        confirmButtonText:
          newStatus === "delivered"
            ? "Yes, Mark Delivered"
            : "Yes, Cancel Order",
      });

      if (!result.isConfirmed) return;
    }

    try {
      await updateOrderStatusInContext(orderId, newStatus);

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)),
      );

      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: newStatus } : null,
        );
      }
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  const updatePaymentStatus = async (
    orderId: string,
    newStatus: Order["paymentStatus"],
  ) => {
    const currentOrder = orders.find((o) => o._id === orderId);
    if (!currentOrder) return;

    if (newStatus === "paid" || newStatus === "failed") {
      const result = await Swal.fire({
        title:
          newStatus === "paid"
            ? "Mark Payment as Paid?"
            : "Mark Payment as Failed?",
        text:
          newStatus === "paid"
            ? "This confirms payment has been received."
            : "This indicates the payment was unsuccessful.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: newStatus === "paid" ? "#16a34a" : "#dc2626",
        cancelButtonColor: "#64748b",
        confirmButtonText:
          newStatus === "paid" ? "Yes, Mark Paid" : "Yes, Mark Failed",
      });

      if (!result.isConfirmed) return;
    }

    try {
      await updatePaymentStatusInContext(orderId, newStatus);

      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, paymentStatus: newStatus } : o,
        ),
      );

      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, paymentStatus: newStatus } : null,
        );
      }
    } catch (error) {
      console.error("Payment update failed:", error);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const customerName = order.shippingAddress?.fullName || "";
        const phone = order.shippingAddress?.phone || "";

        const matchesSearch =
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          phone.includes(searchTerm);

        const matchesStatus =
          statusFilter === "" || order.status === statusFilter;

        const matchesPayment =
          paymentFilter === "" || order.paymentStatus === paymentFilter;

        return matchesSearch && matchesStatus && matchesPayment;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "newest":
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          case "oldest":
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          case "amountDesc":
            return b.totalAmount - a.totalAmount;
          case "amountAsc":
            return a.totalAmount - b.totalAmount;
          default:
            return 0;
        }
      });
  }, [orders, searchTerm, statusFilter, paymentFilter, sortBy]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      revenue: orders
        .filter((o) => o.paymentStatus === "paid")
        .reduce((acc, o) => acc + o.totalAmount, 0),
    };
  }, [orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "shipped":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "processing":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "pending":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "failed":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="animate-fade-in mt-6 px-3 sm:px-4 md:px-6 pb-20">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold">Order Management</h2>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Track and manage customer orders and fulfillment.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-sm">
          <Package className="mb-3 text-slate-600" size={22} />
          <p className="text-xs sm:text-sm text-muted-foreground">
            Total Orders
          </p>
          <h3 className="text-xl sm:text-2xl font-bold">{stats.total}</h3>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-sm">
          <Clock className="mb-3 text-amber-600" size={22} />
          <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
          <h3 className="text-xl sm:text-2xl font-bold">{stats.pending}</h3>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-sm">
          <CheckCircle className="mb-3 text-emerald-600" size={22} />
          <p className="text-xs sm:text-sm text-muted-foreground">Delivered</p>
          <h3 className="text-xl sm:text-2xl font-bold">{stats.delivered}</h3>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-sm">
          <CreditCard className="mb-3 text-blue-600" size={22} />
          <p className="text-xs sm:text-sm text-muted-foreground">Revenue</p>
          <h3 className="text-lg sm:text-2xl font-bold">
            ₹{stats.revenue.toLocaleString()}
          </h3>
        </div>
      </div>

      <div className="mb-6 bg-white rounded-2xl sm:rounded-3xl border shadow-sm p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="relative md:col-span-2">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search order, customer, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 pl-10 pr-4 border rounded-xl bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-4 border rounded-xl bg-background outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="h-11 px-4 border rounded-xl bg-background outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-11 px-4 border rounded-xl bg-background outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amountDesc">Highest Amount</option>
            <option value="amountAsc">Lowest Amount</option>
          </select>

          <Button
            variant="outline"
            className="rounded-xl h-11 lg:col-span-5 xl:col-span-1"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("");
              setPaymentFilter("");
              setSortBy("newest");
            }}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                  Order ID
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                  Customer
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                  Items
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                  Amount
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                  Payment
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                  Status
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-20 text-center text-muted-foreground"
                  >
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-20 text-center text-muted-foreground"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-medium text-slate-500">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold">
                        {order.shippingAddress?.fullName || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.shippingAddress?.phone || "N/A"}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {order.items?.length || 0}{" "}
                        {order.items?.length === 1 ? "item" : "items"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-bold">
                        ₹{order.totalAmount.toLocaleString()}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) =>
                          updatePaymentStatus(order._id, e.target.value as any)
                        }
                        className={`text-[10px] font-bold py-1.5 px-2 rounded-lg border outline-none cursor-pointer uppercase ${getPaymentColor(
                          order.paymentStatus,
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order._id, e.target.value as any)
                        }
                        className={`text-[11px] font-bold py-1.5 px-2 rounded-lg border outline-none cursor-pointer ${getStatusColor(
                          order.status,
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye size={16} className="text-slate-500" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="bg-white rounded-3xl border p-8 text-center text-muted-foreground">
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border p-8 text-center text-muted-foreground">
            No orders found.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl border shadow-sm p-4 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-mono font-bold text-slate-500">
                    #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-full bg-slate-50"
                  onClick={() => setSelectedOrder(order)}
                >
                  <Eye size={16} />
                </Button>
              </div>

              <div>
                <p className="text-sm font-bold">
                  {order.shippingAddress?.fullName || "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {order.shippingAddress?.phone || "N/A"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-[11px] text-muted-foreground">Items</p>
                  <p className="font-bold">{order.items?.length || 0}</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-[11px] text-muted-foreground">Amount</p>
                  <p className="font-bold">
                    ₹{order.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <select
                  value={order.paymentStatus}
                  onChange={(e) =>
                    updatePaymentStatus(order._id, e.target.value as any)
                  }
                  className={`w-full text-xs font-bold py-2.5 px-3 rounded-xl border outline-none uppercase ${getPaymentColor(
                    order.paymentStatus,
                  )}`}
                >
                  <option value="pending">Payment Pending</option>
                  <option value="paid">Payment Paid</option>
                  <option value="failed">Payment Failed</option>
                </select>

                <select
                  value={order.status}
                  onChange={(e) =>
                    updateOrderStatus(order._id, e.target.value as any)
                  }
                  className={`w-full text-xs font-bold py-2.5 px-3 rounded-xl border outline-none uppercase ${getStatusColor(
                    order.status,
                  )}`}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-4 sm:px-8 py-5 sm:py-6 border-b flex items-start justify-between gap-4 bg-slate-50">
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold">Order Details</h3>
                <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1 break-all">
                  #{selectedOrder._id.toUpperCase()}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
                <div className="lg:col-span-1 space-y-5">
                  <div className="bg-slate-50 p-5 sm:p-6 rounded-3xl space-y-4 border">
                    <h4 className="font-bold flex items-center gap-2">
                      <User size={18} /> Customer Info
                    </h4>
                    <p className="text-sm font-semibold">
                      {selectedOrder.shippingAddress?.fullName || "N/A"}
                    </p>
                    <p className="text-sm text-slate-600">
                      {selectedOrder.shippingAddress?.phone || "N/A"}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-5 sm:p-6 rounded-3xl space-y-4 border">
                    <h4 className="font-bold flex items-center gap-2">
                      <MapPin size={18} /> Shipping Address
                    </h4>
                    <div className="text-sm text-slate-600 leading-relaxed">
                      <p>{selectedOrder.shippingAddress?.address}</p>
                      <p>
                        {selectedOrder.shippingAddress?.city},{" "}
                        {selectedOrder.shippingAddress?.state}
                      </p>
                      <p className="font-bold mt-1">
                        {selectedOrder.shippingAddress?.pincode}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 sm:p-6 rounded-3xl space-y-4 border">
                    <h4 className="font-bold flex items-center gap-2">
                      <CreditCard size={18} /> Payment Details
                    </h4>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500 uppercase font-bold">
                        Method
                      </span>
                      <span className="text-sm font-bold uppercase">
                        {selectedOrder.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-5">
                  <div className="bg-white rounded-3xl border p-5 sm:p-6 space-y-4">
                    <h4 className="font-bold flex items-center gap-2">
                      <Package size={18} /> Ordered Items
                    </h4>

                    <div className="divide-y">
                      {selectedOrder.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="py-4 flex items-center gap-3 sm:gap-4"
                        >
                          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-2xl flex items-center justify-center p-2 border shrink-0">
                            {item.images?.[0] || item.image ? (
                              <img
                                src={
                                  item.images?.[0] ||
                                  item.image ||
                                  "/placeholder.png"
                                }
                                alt={item.name}
                                className="w-full h-full object-contain rounded-md"
                              />
                            ) : (
                              <Package className="text-slate-300" size={24} />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">
                              {item.name || "Product Name"}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              ₹{item.price.toLocaleString()} × {item.quantity}
                            </p>
                          </div>

                          <p className="text-sm font-bold text-primary shrink-0">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t flex justify-between items-center">
                      <span className="text-base sm:text-lg font-bold">
                        Total
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-primary">
                        ₹{selectedOrder.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border p-5 sm:p-6 space-y-5">
                    <h4 className="font-bold flex items-center gap-2">
                      <Calendar size={18} /> Update Status
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {[
                        "pending",
                        "processing",
                        "shipped",
                        "delivered",
                        "cancelled",
                      ].map((status) => (
                        <button
                          key={status}
                          onClick={() =>
                            updateOrderStatus(selectedOrder._id, status as any)
                          }
                          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                            selectedOrder.status === status
                              ? "bg-primary text-white border-primary"
                              : "bg-slate-50 text-slate-500 border-slate-100"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}