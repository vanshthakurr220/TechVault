import { useEffect, useState, useMemo } from "react";
import {
  Package,
  Calendar,
  MapPin,
  Download,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  TrendingUp,
  ShoppingBag,
  CreditCard as PaymentIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SITE_CONFIG } from "@/config/siteConfig";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import Loader from "@/components/Loader";

interface Order {
  _id: string;
  items: {
    productId?: {
      name?: string;
      images?: string[]; // ✅ updated from image → images[]
      image?: string;
    };

    name: string;

    images?: string[]; // ✅ new field (primary support for multi-images)

    image?: string; // ⚠️ legacy fallback for old orders

    price: number;
    quantity: number;
  }[];

  totalAmount: number;

  couponCode?: string;
  couponDiscount?: number;

  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";

  paymentStatus: "pending" | "paid" | "failed";

  paymentMethod: string;

  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };

  createdAt: string;
}

export default function Orders() {
  const {
    user,
    orders: contextOrders,
    fetchOrders: fetchUserOrders,
  } = useApp();
  const orders = contextOrders as unknown as Order[];
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      if (!user?.email) {
        setLoading(false);
        return;
      }
      await fetchUserOrders();
    } catch (error) {
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Analytics Calculations
  const analytics = useMemo(() => {
    const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(
      (o) => o.status !== "delivered" && o.status !== "cancelled",
    ).length;
    const deliveredOrders = orders.filter(
      (o) => o.status === "delivered",
    ).length;

    return { totalSpent, totalOrders, pendingOrders, deliveredOrders };
  }, [orders]);

  const getStatusStep = (status: string) => {
    switch (status) {
      case "pending":
        return 1;
      case "processing":
        return 2;
      case "shipped":
        return 3;
      case "delivered":
        return 4;
      case "cancelled":
        return -1;
      default:
        return 0;
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "processing":
        return "bg-sky-50 text-sky-700 border-sky-100";
      case "shipped":
        return "bg-violet-50 text-violet-700 border-violet-100";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  const downloadInvoice = (order: Order) => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const invoiceNo = `INV-${new Date().getFullYear()}-${order._id.slice(-6).toUpperCase()}`;

    // ==========================================
    // 1. HEADER DESIGN (MODERN DARK)
    // ==========================================
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, pageWidth, 45, "F");

    // Company Logo/Name
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text(SITE_CONFIG.companyName, 20, 25);

    // Invoice Label
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text("OFFICIAL INVOICE", pageWidth - 20, 18, { align: "right" });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`# ${invoiceNo}`, pageWidth - 20, 28, { align: "right" });

    // ==========================================
    // 2. INFO SECTION (SIDE BY SIDE)
    // ==========================================
    const startY = 60;

    // Left Side: Company Info
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("FROM:", 20, startY);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105); // Slate 600
    doc.text(
      [
        SITE_CONFIG.companyName,
        "New Delhi, India",
        `Email: support@${SITE_CONFIG.companyName.toLowerCase()}.com`,
        "Web: www.yourstore.com",
      ],
      20,
      startY + 7,
    );

    // Right Side: Billing Info
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 110, startY);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(
      [
        order.shippingAddress.fullName,
        order.shippingAddress.address,
        `${order.shippingAddress.city}, ${order.shippingAddress.state}`,
        `Pincode: ${order.shippingAddress.pincode}`,
        `Phone: ${order.shippingAddress.phone}`,
      ],
      110,
      startY + 7,
    );

    // ==========================================
    // 3. ORDER SUMMARY BAR
    // ==========================================
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.roundedRect(20, 105, pageWidth - 40, 15, 2, 2, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100);
    doc.text("ORDER DATE", 25, 114);
    doc.text("PAYMENT METHOD", 75, 114);
    doc.text("ORDER STATUS", 135, 114);

    doc.setTextColor(15, 23, 42);
    doc.text(new Date(order.createdAt).toLocaleDateString(), 48, 114);
    doc.text(order.paymentMethod.toUpperCase(), 108, 114);
    doc.text(order.status.toUpperCase(), 165, 114);

    // ==========================================
    // 4. PRODUCTS TABLE
    // ==========================================
    const tableRows = order.items.map((item, index) => [
      (index + 1).toString(),
      item.name || item.productId?.name || "Product",
      item.quantity.toString(),
      `Rs. ${item.price.toLocaleString()}`,
      `Rs. ${(item.quantity * item.price).toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: 130,
      head: [["#", "Description", "Qty", "Unit Price", "Total"]],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: 255,
        fontSize: 10,
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { cellWidth: "auto" },
        2: { halign: "center", cellWidth: 20 },
        3: { halign: "right", cellWidth: 35 },
        4: { halign: "right", cellWidth: 35 },
      },
      styles: {
        fontSize: 9,
        cellPadding: 5,
        lineColor: [226, 232, 240], // Slate 200
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    // ==========================================
    // 5. TOTAL CALCULATION BLOCK
    // ==========================================
    const finalY = (doc as any).lastAutoTable.finalY || 180;
    const totalBoxWidth = 70;
    const totalBoxX = pageWidth - 20 - totalBoxWidth;

    const subtotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);

    // Subtotal
    doc.text("Subtotal:", totalBoxX, finalY + 15);
    doc.text(`Rs. ${subtotal.toLocaleString()}`, pageWidth - 20, finalY + 15, {
      align: "right",
    });

    // Discount (if any)
    if (order.couponDiscount) {
      doc.setTextColor(16, 185, 129); // Emerald 500
      doc.text(`Discount (${order.couponCode}):`, totalBoxX, finalY + 22);
      doc.text(
        `- Rs. ${order.couponDiscount.toLocaleString()}`,
        pageWidth - 20,
        finalY + 22,
        { align: "right" },
      );
    }

    // Shipping
    doc.setTextColor(71, 85, 105);
    doc.text("Shipping:", totalBoxX, finalY + 29);
    doc.text("FREE", pageWidth - 20, finalY + 29, { align: "right" });

    // Grand Total Line
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.line(totalBoxX, finalY + 34, pageWidth - 20, finalY + 34);

    // Grand Total Amount
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Grand Total:", totalBoxX, finalY + 42);
    doc.text(
      `Rs. ${order.totalAmount.toLocaleString()}`,
      pageWidth - 20,
      finalY + 42,
      { align: "right" },
    );

    // ==========================================
    // 6. FOOTER & SIGNATURE
    // ==========================================
    const footerY = pageHeight - 40;

    doc.setDrawColor(226, 232, 240);
    doc.line(20, footerY, pageWidth - 20, footerY);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);

    doc.text(
      [
        "Thank you for choosing us! We hope you love your purchase.",
        `For returns or support, visit our website or contact us at support@${SITE_CONFIG.companyName.toLowerCase()}.com`,
        `© ${new Date().getFullYear()} ${SITE_CONFIG.companyName}. All Rights Reserved.`,
      ],
      pageWidth / 2,
      footerY + 10,
      { align: "center" },
    );

    // Professional Stamp/Seal (Visual Only)
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.1);
    doc.circle(pageWidth - 40, footerY + 15, 10, "S");
    doc.setFontSize(6);
    doc.text("OFFICIAL", pageWidth - 40, footerY + 14, { align: "center" });
    doc.text("STAMP", pageWidth - 40, footerY + 17, { align: "center" });

    doc.save(`${invoiceNo}.pdf`);
  };

  if (loading) {
    return (
      <Loader text="Retrieving orders..." variant="page" />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Premium Header */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 pt-16 pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
                My Orders
              </h1>
              <p className="text-slate-400">
                Track, manage and view your purchase history
              </p>
            </div>
            <div className="flex gap-3">
              <a href="/products">
                <Button className="bg-white text-slate-900 hover:bg-slate-100 font-semibold px-6">
                  Continue Shopping
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 -mt-12">
        {/* Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Spent",
              value: `₹${analytics.totalSpent.toLocaleString()}`,
              icon: TrendingUp,
              color: "text-emerald-600",
            },
            {
              label: "Total Orders",
              value: analytics.totalOrders,
              icon: ShoppingBag,
              color: "text-blue-600",
            },
            {
              label: "Delivered",
              value: analytics.deliveredOrders,
              icon: CheckCircle2,
              color: "text-indigo-600",
            },
            {
              label: "In Progress",
              value: analytics.pendingOrders,
              icon: Clock,
              color: "text-amber-600",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={cn("p-2 rounded-lg bg-slate-50", stat.color)}>
                  <stat.icon size={18} />
                </div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="bg-white text-center py-20 rounded-3xl shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={40} className="text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              No orders found
            </h2>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">
              Looks like you haven't placed any orders yet. Start exploring our
              premium collection.
            </p>
            <a href="/products">
              <Button size="lg" className="rounded-full px-8">
                Start Shopping
              </Button>
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isExpanded = expandedOrders[order._id];
              const currentStep = getStatusStep(order.status);

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-md"
                >
                  {/* Order Summary Row */}
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => toggleExpand(order._id)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                          <Package size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-slate-500">
                              Order
                            </span>
                            <span className="font-bold text-slate-900">
                              #{order._id.slice(-8).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />{" "}
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </span>
                            <span>•</span>
                            <span>
                              {order.items.length}{" "}
                              {order.items.length === 1 ? "Item" : "Items"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 lg:gap-8">
                        <div className="text-left lg:text-right">
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                            Total Amount
                          </p>
                          <p className="text-lg font-bold text-slate-900">
                            ₹{order.totalAmount.toLocaleString()}
                          </p>
                        </div>

                        <div
                          className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold border",
                            getStatusBadgeStyles(order.status),
                          )}
                        >
                          {order.status.toUpperCase()}
                        </div>

                        <div className="hidden sm:block">
                          {isExpanded ? (
                            <ChevronUp className="text-slate-300" />
                          ) : (
                            <ChevronDown className="text-slate-300" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  {isExpanded && (
                    <div className="px-6 pb-8 pt-2 border-t border-slate-50 animate-in fade-in slide-in-from-top-2 duration-300">
                      {/* Order Progress Timeline */}
                      <div className="mb-10 mt-4 px-4">
                        <div className="relative flex justify-between">
                          {/* Background Line */}
                          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>

                          {/* Steps */}
                          {[
                            { label: "Placed", icon: Clock, step: 1 },
                            { label: "Processing", icon: Package, step: 2 },
                            { label: "Shipped", icon: Truck, step: 3 },
                            { label: "Delivered", icon: CheckCircle2, step: 4 },
                          ].map((s, i) => {
                            const isCompleted = currentStep >= s.step;
                            const isActive = currentStep === s.step;
                            const isCancelled = order.status === "cancelled";

                            return (
                              <div
                                key={i}
                                className="relative z-10 flex flex-col items-center"
                              >
                                <div
                                  className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all duration-500",
                                    isCompleted
                                      ? "bg-primary text-white"
                                      : "bg-slate-100 text-slate-400",
                                    isActive &&
                                      "ring-4 ring-primary/20 scale-110",
                                    isCancelled &&
                                      i > 0 &&
                                      "bg-rose-50 text-rose-300",
                                  )}
                                >
                                  {isCancelled && i > 0 ? (
                                    <XCircle size={18} />
                                  ) : (
                                    <s.icon size={18} />
                                  )}
                                </div>
                                <span
                                  className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest mt-3",
                                    isCompleted
                                      ? "text-slate-900"
                                      : "text-slate-400",
                                  )}
                                >
                                  {s.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid lg:grid-cols-3 gap-8">
                        {/* Items Column */}
                        <div className="lg:col-span-2 space-y-4">
                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                            <Package size={16} className="text-primary" />
                            Order Items
                          </h4>
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="group flex gap-4 p-3 rounded-2xl bg-slate-50/50 border border-slate-100 transition-colors hover:bg-slate-50"
                            >
                              <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-slate-100 shrink-0">
                                <img
                                  src={
                                    item.images?.[0] ||
                                    item.productId?.images?.[0] ||
                                    item.image ||
                                    item.productId?.image ||
                                    "/placeholder.png"
                                  }
                                  alt={item.name}
                                  className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                                />
                              </div>
                              <div className="flex-1 flex flex-col justify-center">
                                <h5 className="font-bold text-slate-900 line-clamp-1">
                                  {item.name || item.productId?.name}
                                </h5>
                                <div className="flex justify-between items-center mt-1">
                                  <p className="text-sm text-slate-500">
                                    Qty: {item.quantity}
                                  </p>
                                  <p className="font-bold text-slate-900">
                                    ₹{item.price.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}

                          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                            <Button
                              variant="outline"
                              className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 flex gap-2"
                              onClick={() => downloadInvoice(order)}
                            >
                              <Download size={16} />
                              Download Invoice
                            </Button>
                            <div className="text-right">
                              {order.couponDiscount ? (
                                <p className="text-xs font-medium text-emerald-600 mb-1">
                                  Coupon Savings: -₹
                                  {order.couponDiscount.toLocaleString()}
                                </p>
                              ) : null}
                              <p className="text-sm text-slate-500">
                                Grand Total:{" "}
                                <span className="text-lg font-black text-slate-900 ml-2">
                                  ₹{order.totalAmount.toLocaleString()}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Details Column */}
                        <div className="space-y-6">
                          {/* Shipping & Payment Cards */}
                          <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <MapPin size={14} /> Shipping Details
                            </h4>
                            <div className="space-y-1 text-sm">
                              <p className="font-bold text-slate-900">
                                {order.shippingAddress.fullName}
                              </p>
                              <p className="text-slate-600">
                                {order.shippingAddress.phone}
                              </p>
                              <p className="text-slate-600 leading-relaxed">
                                {order.shippingAddress.address}
                              </p>
                              <p className="text-slate-600">
                                {order.shippingAddress.city},{" "}
                                {order.shippingAddress.state} -{" "}
                                {order.shippingAddress.pincode}
                              </p>
                            </div>
                          </div>

                          <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <PaymentIcon size={14} /> Payment Information
                            </h4>
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-sm text-slate-500">
                                Method
                              </span>
                              <span className="text-sm font-bold text-slate-900">
                                {order.paymentMethod.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-500">
                                Status
                              </span>
                              <span
                                className={cn(
                                  "text-xs font-black uppercase px-2 py-0.5 rounded",
                                  order.paymentStatus === "paid"
                                    ? "text-emerald-600 bg-emerald-50"
                                    : "text-amber-600 bg-amber-50",
                                )}
                              >
                                {order.paymentStatus}
                              </span>
                            </div>
                          </div>

                          {order.couponCode && (
                            <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100">
                              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <TrendingUp size={14} /> Coupon Applied
                              </h4>
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-black text-emerald-800">
                                  {order.couponCode}
                                </span>
                                <span className="text-sm font-bold text-emerald-700">
                                  -₹{order.couponDiscount?.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
