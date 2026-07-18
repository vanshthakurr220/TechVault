import { useState, useMemo } from "react";
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

interface Order {
  _id: string;

  items: {
    productId?: {
      name?: string;
      images?: string[];
      image?: string;
    };

    name: string;
    images?: string[];
    image?: string;
    price: number;
    quantity: number;
  }[];

  totalAmount: number;

  couponCode?: string;
  couponDiscount?: number;

  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";

  statusHistory?: {
    pendingAt?: string;
    processingAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    cancelledAt?: string;
  };

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
  const { orders: contextOrders } = useApp();
  const orders = contextOrders as unknown as Order[];
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>(
    {},
  );

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

    const marginX = 18;
    const invoiceNo = `INV-${new Date().getFullYear()}-${order._id.slice(-6).toUpperCase()}`;

    const subtotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    

    const formatMoney = (amount: number) =>
      `Rs. ${Math.round(amount).toLocaleString("en-IN")}`;

    const formatDate = (date: string | Date) =>
      new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

    const addFooter = () => {
      const footerY = pageHeight - 28;

      doc.setDrawColor(226, 232, 240);
      doc.line(marginX, footerY, pageWidth - marginX, footerY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);

      doc.text(
        `Thank you for shopping with ${SITE_CONFIG.companyName}. This is a computer-generated invoice.`,
        pageWidth / 2,
        footerY + 8,
        { align: "center" },
      );

      doc.text(
        `For support: support@${SITE_CONFIG.companyName.toLowerCase()}.com`,
        pageWidth / 2,
        footerY + 14,
        { align: "center" },
      );

      doc.text(
        `© ${new Date().getFullYear()} ${SITE_CONFIG.companyName}. All rights reserved.`,
        pageWidth / 2,
        footerY + 20,
        { align: "center" },
      );
    };

    // =========================
    // HEADER
    // =========================
    doc.setFillColor(2, 6, 23);
    doc.rect(0, 0, pageWidth, 42, "F");

    doc.setFillColor(37, 99, 235);
    doc.roundedRect(marginX, 12, 10, 10, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text(SITE_CONFIG.companyName, marginX + 15, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text("Premium Electronics Store", marginX + 15, 27);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("INVOICE", pageWidth - marginX, 18, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text(invoiceNo, pageWidth - marginX, 26, { align: "right" });

    // =========================
    // INVOICE META CARD
    // =========================
    const metaY = 52;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(marginX, metaY, pageWidth - marginX * 2, 24, 3, 3, "F");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);

    doc.text("ORDER DATE", marginX + 8, metaY + 9);
    doc.text("PAYMENT", marginX + 58, metaY + 9);
    doc.text("STATUS", marginX + 105, metaY + 9);
    doc.text("INVOICE NO", marginX + 145, metaY + 9);

    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);

    doc.text(formatDate(order.createdAt), marginX + 8, metaY + 17);
    doc.text(order.paymentMethod.toUpperCase(), marginX + 58, metaY + 17);

    doc.setFillColor(
      order.status === "delivered"
        ? 22
        : order.status === "cancelled"
          ? 239
          : 245,
      order.status === "delivered"
        ? 163
        : order.status === "cancelled"
          ? 68
          : 158,
      order.status === "delivered"
        ? 74
        : order.status === "cancelled"
          ? 68
          : 11,
    );
    doc.roundedRect(marginX + 105, metaY + 12, 28, 7, 2, 2, "F");

    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(order.status.toUpperCase(), marginX + 119, metaY + 17, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(invoiceNo, marginX + 145, metaY + 17);

    // =========================
    // ADDRESS CARDS
    // =========================
    const cardY = 88;
    const cardW = (pageWidth - marginX * 2 - 8) / 2;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(marginX, cardY, cardW, 44, 3, 3, "FD");
    doc.roundedRect(marginX + cardW + 8, cardY, cardW, 44, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(37, 99, 235);
    doc.text("FROM", marginX + 7, cardY + 9);
    doc.text("BILL TO", marginX + cardW + 15, cardY + 9);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(SITE_CONFIG.companyName, marginX + 7, cardY + 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      [
        "New Delhi, India",
        `Email: support@${SITE_CONFIG.companyName.toLowerCase()}.com`,
        "Website: www.techvault.com",
      ],
      marginX + 7,
      cardY + 25,
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(order.shippingAddress.fullName, marginX + cardW + 15, cardY + 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);

    const billingLines = doc.splitTextToSize(
      `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`,
      cardW - 14,
    );

    doc.text(billingLines, marginX + cardW + 15, cardY + 25);
    doc.text(
      `Phone: ${order.shippingAddress.phone}`,
      marginX + cardW + 15,
      cardY + 38,
    );

    // =========================
    // PRODUCTS TABLE
    // =========================
    const tableRows = order.items.map((item, index) => [
      String(index + 1).padStart(2, "0"),
      item.name || item.productId?.name || "Product",
      item.quantity.toString(),
      formatMoney(item.price),
      formatMoney(item.quantity * item.price),
    ]);

    autoTable(doc, {
      startY: 145,
      head: [["#", "Product Description", "Qty", "Unit Price", "Amount"]],
      body: tableRows,
      theme: "plain",
      margin: { left: marginX, right: marginX },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
        cellPadding: 4,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [51, 65, 85],
        cellPadding: 4,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 14, halign: "center" },
        1: { cellWidth: 76 },
        2: { cellWidth: 18, halign: "center" },
        3: { cellWidth: 34, halign: "right" },
        4: { cellWidth: 34, halign: "right", fontStyle: "bold" },
      },
      didDrawPage: () => {
        addFooter();
      },
    });

    // =========================
    // TOTAL SUMMARY CARD
    // =========================
    let finalY = (doc as any).lastAutoTable.finalY + 12;

    if (finalY > pageHeight - 85) {
      doc.addPage();
      finalY = 25;
    }

    const summaryW = 76;
    const summaryX = pageWidth - marginX - summaryW;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(summaryX, finalY, summaryW, 52, 3, 3, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);

    doc.text("Subtotal", summaryX + 7, finalY + 10);
    doc.text(formatMoney(subtotal), summaryX + summaryW - 7, finalY + 10, {
      align: "right",
    });

    let rowY = finalY + 19;

    if (order.couponDiscount && order.couponDiscount > 0) {
      doc.setTextColor(22, 163, 74);
      doc.text(
        `Discount${order.couponCode ? ` (${order.couponCode})` : ""}`,
        summaryX + 7,
        rowY,
      );
      doc.text(
        `- ${formatMoney(order.couponDiscount)}`,
        summaryX + summaryW - 7,
        rowY,
        {
          align: "right",
        },
      );
      rowY += 9;
    }

    doc.setTextColor(71, 85, 105);
    doc.text("Shipping", summaryX + 7, rowY);
    doc.text("FREE", summaryX + summaryW - 7, rowY, { align: "right" });

    doc.setDrawColor(203, 213, 225);
    doc.line(summaryX + 7, finalY + 35, summaryX + summaryW - 7, finalY + 35);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Grand Total", summaryX + 7, finalY + 45);
    doc.text(
      formatMoney(order.totalAmount),
      summaryX + summaryW - 7,
      finalY + 45,
      {
        align: "right",
      },
    );

    // =========================
    // NOTES SECTION
    // =========================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("Notes", marginX, finalY + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);

    doc.text(
      [
        "1. Please keep this invoice for warranty and return purposes.",
        "2. Items once delivered are subject to the return policy of TechVault.",
        "3. This invoice is valid without signature as it is system generated.",
      ],
      marginX,
      finalY + 18,
    );

    // =========================
    // SAVE
    // =========================
    doc.save(`${invoiceNo}.pdf`);
  };

  const formatStatusTime = (date?: string) => {
  if (!date) return "";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

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
                <Button
                  variant="outline"
                  className="bg-white text-slate-900 hover:bg-gray-100 hover:text-slate-900 font-bold px-6"
                >
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
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 wrap-break-words leading-tight">
                {stat.value}
              </p>
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
              console.log("ORDER STATUS HISTORY:", order._id, order.statusHistory);

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
                      <div className="mb-16 mt-6 px-4">
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
                                className="relative z-10 flex flex-col items-center w-28"
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
                                <p className="mt-2 min-h-[34px] text-center text-[11px] leading-4 text-slate-500 font-medium">
  {s.step === 1 && formatStatusTime(order.statusHistory?.pendingAt)}

  {s.step === 2 && formatStatusTime(order.statusHistory?.processingAt)}

  {s.step === 3 && formatStatusTime(order.statusHistory?.shippedAt)}

  {s.step === 4 && formatStatusTime(order.statusHistory?.deliveredAt)}
</p>
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
