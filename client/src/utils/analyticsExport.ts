import type { AdminAnalytics } from "@/types/analytics";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = filename;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

const sanitizePDFText = (value: string | number | null | undefined) =>
  String(value ?? "")
    .replace(/₹/g, "Rs. ")
    .replace(/\u00A0/g, " ")
    .replace(/[^\x20-\x7E]/g, "");

const formatPDFCurrency = (value: number | null | undefined) => {
  const safeValue = Number(value) || 0;

  const formattedValue = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeValue);

  return `Rs. ${formattedValue}`;
};

const formatPDFNumber = (value: number) =>
  new Intl.NumberFormat("en-IN").format(Number(value) || 0);

const formatPDFDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const createSafeFilename = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const escapeCSV = (value: unknown) =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

export const exportAnalyticsCSV = (
  analytics: AdminAnalytics,
  rangeLabel: string,
) => {
  const rows: string[][] = [];

  rows.push(["TechVault Analytics Report"]);
  rows.push(["Generated", new Date().toLocaleString("en-IN")]);
  rows.push(["Range", rangeLabel]);
  rows.push([]);

  rows.push(["===== SUMMARY ====="]);

  rows.push(["Metric", "Current", "Previous", "Difference", "% Change"]);

  const summary = analytics.summary;

  rows.push([
    "Revenue",
    summary.totalRevenue.current.toString(),
    summary.totalRevenue.previous.toString(),
    summary.totalRevenue.difference.toString(),
    summary.totalRevenue.percentageChange.toFixed(2),
  ]);

  rows.push([
    "Orders",
    summary.totalOrders.current.toString(),
    summary.totalOrders.previous.toString(),
    summary.totalOrders.difference.toString(),
    summary.totalOrders.percentageChange.toFixed(2),
  ]);

  rows.push([
    "Units Sold",
    summary.unitsSold.current.toString(),
    summary.unitsSold.previous.toString(),
    summary.unitsSold.difference.toString(),
    summary.unitsSold.percentageChange.toFixed(2),
  ]);

  rows.push([]);

  rows.push(["===== TOP PRODUCTS ====="]);

  rows.push(["Product", "Units Sold", "Orders", "Revenue"]);

  analytics.topProducts.forEach((product) => {
    rows.push([
      product.name,
      product.unitsSold.toString(),
      product.orderCount.toString(),
      product.revenue.toString(),
    ]);
  });

  rows.push([]);

  rows.push(["===== CUSTOMERS ====="]);

  rows.push(["Customer", "Email", "Orders", "Total Spent"]);

  analytics.customers.topCustomers.forEach((customer) => {
    rows.push([
      customer.name,
      customer.email,
      customer.orderCount.toString(),
      customer.totalSpent.toString(),
    ]);
  });

  rows.push([]);

  rows.push(["===== INSIGHTS ====="]);

  analytics.insights.forEach((insight) => {
    rows.push([insight.type.toUpperCase(), insight.title, insight.message]);
  });

  const csv = rows.map((row) => row.map(escapeCSV).join(",")).join("\n");

  downloadFile(
    csv,
    `techvault-analytics-${Date.now()}.csv`,
    "text/csv;charset=utf-8;",
  );
};

export const exportAnalyticsExcel = (
  analytics: AdminAnalytics,
  rangeLabel: string,
) => {
  const workbook = XLSX.utils.book_new();

  const generatedAt = new Date().toLocaleString("en-IN");

  // Executive Summary
  const summaryRows = [
    ["TechVault Analytics Report"],
    ["Generated", generatedAt],
    ["Selected Range", rangeLabel],
    [
      "Start Date",
      new Date(analytics.dateRange.startDate).toLocaleDateString("en-IN"),
    ],
    [
      "End Date",
      new Date(analytics.dateRange.endDate).toLocaleDateString("en-IN"),
    ],
    [],
    ["Metric", "Current", "Previous", "Difference", "% Change", "Trend"],
    [
      "Total Revenue",
      analytics.summary.totalRevenue.current,
      analytics.summary.totalRevenue.previous,
      analytics.summary.totalRevenue.difference,
      analytics.summary.totalRevenue.percentageChange,
      analytics.summary.totalRevenue.trend,
    ],
    [
      "Total Orders",
      analytics.summary.totalOrders.current,
      analytics.summary.totalOrders.previous,
      analytics.summary.totalOrders.difference,
      analytics.summary.totalOrders.percentageChange,
      analytics.summary.totalOrders.trend,
    ],
    [
      "Units Sold",
      analytics.summary.unitsSold.current,
      analytics.summary.unitsSold.previous,
      analytics.summary.unitsSold.difference,
      analytics.summary.unitsSold.percentageChange,
      analytics.summary.unitsSold.trend,
    ],
    [
      "Average Order Value",
      analytics.summary.averageOrderValue.current,
      analytics.summary.averageOrderValue.previous,
      analytics.summary.averageOrderValue.difference,
      analytics.summary.averageOrderValue.percentageChange,
      analytics.summary.averageOrderValue.trend,
    ],
    [
      "New Customers",
      analytics.summary.newCustomers.current,
      analytics.summary.newCustomers.previous,
      analytics.summary.newCustomers.difference,
      analytics.summary.newCustomers.percentageChange,
      analytics.summary.newCustomers.trend,
    ],
    [
      "Cancelled Orders",
      analytics.summary.cancelledOrders.current,
      analytics.summary.cancelledOrders.previous,
      analytics.summary.cancelledOrders.difference,
      analytics.summary.cancelledOrders.percentageChange,
      analytics.summary.cancelledOrders.trend,
    ],
    [
      "Pending Revenue",
      analytics.summary.pendingRevenue.current,
      analytics.summary.pendingRevenue.previous,
      analytics.summary.pendingRevenue.difference,
      analytics.summary.pendingRevenue.percentageChange,
      analytics.summary.pendingRevenue.trend,
    ],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);

  // Revenue Trend
  const revenueTrendSheet = XLSX.utils.json_to_sheet(
    analytics.revenueTrend.map((item) => ({
      Date: item.date,
      Revenue: item.revenue,
      Orders: item.orders,
      "Units Sold": item.unitsSold,
      "Average Order Value": item.averageOrderValue,
    })),
  );

  // Top Products
  const topProductsSheet = XLSX.utils.json_to_sheet(
    analytics.topProducts.map((product, index) => ({
      Rank: index + 1,
      Product: product.name,
      "Units Sold": product.unitsSold,
      Orders: product.orderCount,
      Revenue: product.revenue,
    })),
  );

  // Customers
  const customersSheet = XLSX.utils.json_to_sheet(
    analytics.customers.topCustomers.map((customer, index) => ({
      Rank: index + 1,
      Customer: customer.name,
      Email: customer.email,
      Orders: customer.orderCount,
      "Total Spent": customer.totalSpent,
      "Last Order": customer.lastOrderAt,
      Type: customer.customerType,
    })),
  );

  // Inventory
  const inventoryRows = [
    {
      Section: "Summary",
      Product: "",
      "Stock Quantity": "",
      "In Stock": "",
      "Low Stock Count": analytics.inventory.lowStockCount,
      "Out of Stock Count": analytics.inventory.outOfStockCount,
    },
    ...analytics.inventory.lowStockProducts.map((product) => ({
      Section: "Low Stock",
      Product: product.name,
      "Stock Quantity": product.stockQuantity,
      "In Stock": product.inStock ? "Yes" : "No",
      "Low Stock Count": "",
      "Out of Stock Count": "",
    })),
    ...analytics.inventory.outOfStockProducts.map((product) => ({
      Section: "Out of Stock",
      Product: product.name,
      "Stock Quantity": product.stockQuantity,
      "In Stock": product.inStock ? "Yes" : "No",
      "Low Stock Count": "",
      "Out of Stock Count": "",
    })),
  ];

  const inventorySheet = XLSX.utils.json_to_sheet(inventoryRows);

  // Coupons
  const couponsSheet = XLSX.utils.json_to_sheet(
    analytics.coupons.topCoupons.map((coupon, index) => ({
      Rank: index + 1,
      Code: coupon.code,
      "Usage Count": coupon.usageCount,
      Revenue: coupon.revenue,
      "Discount Given": coupon.discountGiven,
    })),
  );

  // Reviews
  const reviewRows = [
    {
      Rating: "Summary",
      Count: analytics.reviews.totalReviews,
      Percentage: "",
      "Average Rating": analytics.reviews.averageRating,
    },
    ...analytics.reviews.ratingDistribution.map((item) => ({
      Rating: item.rating,
      Count: item.count,
      Percentage: item.percentage,
      "Average Rating": "",
    })),
  ];

  const reviewsSheet = XLSX.utils.json_to_sheet(reviewRows);

  // Questions
  const questionsSheet = XLSX.utils.json_to_sheet([
    {
      "Total Questions": analytics.questions.totalQuestions,
      "Pending Questions": analytics.questions.pendingQuestions,
      "Answered Questions": analytics.questions.answeredQuestions,
      "Answered Today": analytics.questions.answeredToday,
      "Average Response Time (Hours)":
        analytics.questions.averageResponseTimeHours,
    },
  ]);

  // Insights
  const insightsSheet = XLSX.utils.json_to_sheet(
    analytics.insights.map((insight, index) => ({
      Number: index + 1,
      Type: insight.type,
      Title: insight.title,
      Message: insight.message,
    })),
  );

  const setColumnWidths = (sheet: XLSX.WorkSheet, widths: number[]) => {
    sheet["!cols"] = widths.map((width) => ({
      wch: width,
    }));
  };

  setColumnWidths(summarySheet, [28, 18, 18, 18, 14, 12]);
  setColumnWidths(revenueTrendSheet, [15, 18, 12, 14, 22]);
  setColumnWidths(topProductsSheet, [8, 35, 14, 12, 18]);
  setColumnWidths(customersSheet, [8, 24, 32, 12, 18, 22, 16]);
  setColumnWidths(inventorySheet, [18, 35, 18, 12, 18, 22]);
  setColumnWidths(couponsSheet, [8, 18, 16, 18, 18]);
  setColumnWidths(reviewsSheet, [18, 14, 16, 18]);
  setColumnWidths(questionsSheet, [20, 22, 22, 18, 32]);
  setColumnWidths(insightsSheet, [10, 14, 30, 70]);

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Executive Summary");
  XLSX.utils.book_append_sheet(workbook, revenueTrendSheet, "Revenue Trend");
  XLSX.utils.book_append_sheet(workbook, topProductsSheet, "Top Products");
  XLSX.utils.book_append_sheet(workbook, customersSheet, "Customers");
  XLSX.utils.book_append_sheet(workbook, inventorySheet, "Inventory");
  XLSX.utils.book_append_sheet(workbook, couponsSheet, "Coupons");
  XLSX.utils.book_append_sheet(workbook, reviewsSheet, "Reviews");
  XLSX.utils.book_append_sheet(workbook, questionsSheet, "Questions");
  XLSX.utils.book_append_sheet(workbook, insightsSheet, "Insights");

  const safeRangeLabel = rangeLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  XLSX.writeFile(
    workbook,
    `techvault-analytics-${safeRangeLabel || "report"}-${Date.now()}.xlsx`,
  );
};

interface ExportAnalyticsPDFOptions {
  analytics: AdminAnalytics;
  rangeLabel: string;
  revenueChartElement?: HTMLElement | null;
}

export const exportAnalyticsPDF = async ({
  analytics,
  rangeLabel,
  revenueChartElement,
}: ExportAnalyticsPDFOptions) => {
  const document = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = document.internal.pageSize.getWidth();
  const pageHeight = document.internal.pageSize.getHeight();

  const leftMargin = 14;
  const rightMargin = 14;
  const contentWidth = pageWidth - leftMargin - rightMargin;

  let currentY = 14;

  const addNewPage = () => {
    document.addPage();
    currentY = 18;
  };

  const ensurePageSpace = (requiredHeight: number) => {
    if (currentY + requiredHeight > pageHeight - 18) {
      addNewPage();
    }
  };

  const addSectionTitle = (title: string, description?: string) => {
    ensurePageSpace(description ? 18 : 12);

    document.setFont("helvetica", "bold");
    document.setFontSize(15);
    document.setTextColor(15, 23, 42);
    document.text(title, leftMargin, currentY);

    currentY += 6;

    if (description) {
      document.setFont("helvetica", "normal");
      document.setFontSize(9);
      document.setTextColor(100, 116, 139);

      const descriptionLines = document.splitTextToSize(
        description,
        contentWidth,
      );

      document.text(descriptionLines, leftMargin, currentY);

      currentY += descriptionLines.length * 4 + 3;
    } else {
      currentY += 3;
    }
  };

  // ============================================================
  // Report Header
  // ============================================================

  document.setFillColor(15, 23, 42);
  document.roundedRect(leftMargin, currentY, contentWidth, 35, 4, 4, "F");

  document.setFont("helvetica", "bold");
  document.setFontSize(21);
  document.setTextColor(255, 255, 255);
  document.text("TECHVAULT", leftMargin + 7, currentY + 11);

  document.setFontSize(13);
  document.text("Executive Analytics Report", leftMargin + 7, currentY + 20);

  document.setFont("helvetica", "normal");
  document.setFontSize(8);
  document.setTextColor(203, 213, 225);
  document.text(
    `Generated ${new Date().toLocaleString("en-IN")}`,
    leftMargin + 7,
    currentY + 28,
  );

  document.setFont("helvetica", "bold");
  document.setFontSize(9);
  document.setTextColor(255, 255, 255);

  const rangeText = document.splitTextToSize(rangeLabel, 52);

  document.text(rangeText, pageWidth - rightMargin - 7, currentY + 13, {
    align: "right",
  });

  document.setFont("helvetica", "normal");
  document.setFontSize(7);
  document.setTextColor(203, 213, 225);

  document.text(
    `${formatPDFDate(analytics.dateRange.startDate)} - ${formatPDFDate(
      analytics.dateRange.endDate,
    )}`,
    pageWidth - rightMargin - 7,
    currentY + 25,
    {
      align: "right",
    },
  );

  currentY += 43;

  // ============================================================
  // Executive Summary
  // ============================================================

  addSectionTitle(
    "Executive Summary",
    "Key performance indicators for the selected reporting period.",
  );

  const summaryCards = [
    {
      title: "Total Revenue",
      value: formatPDFCurrency(
        Number(analytics.summary.totalRevenue.current) || 0,
      ),
      change: Number(analytics.summary.totalRevenue.percentageChange) || 0,
    },
    {
      title: "Total Orders",
      value: formatPDFNumber(
        Number(analytics.summary.totalOrders.current) || 0,
      ),
      change: Number(analytics.summary.totalOrders.percentageChange) || 0,
    },
    {
      title: "Units Sold",
      value: formatPDFNumber(Number(analytics.summary.unitsSold.current) || 0),
      change: Number(analytics.summary.unitsSold.percentageChange) || 0,
    },
    {
      title: "Average Order Value",
      value: formatPDFCurrency(
        Number(analytics.summary.averageOrderValue.current) || 0,
      ),
      change: Number(analytics.summary.averageOrderValue.percentageChange) || 0,
    },
    {
      title: "New Customers",
      value: formatPDFNumber(
        Number(analytics.summary.newCustomers.current) || 0,
      ),
      change: Number(analytics.summary.newCustomers.percentageChange) || 0,
    },
    {
      title: "Pending Revenue",
      value: formatPDFCurrency(
        Number(analytics.summary.pendingRevenue.current) || 0,
      ),
      change: Number(analytics.summary.pendingRevenue.percentageChange) || 0,
    },
  ];

  const cardGap = 4;
  const cardsPerRow = 3;

  const cardWidth = (contentWidth - cardGap * (cardsPerRow - 1)) / cardsPerRow;

  const cardHeight = 24;

  summaryCards.forEach((card, index) => {
    const safeChange = Number(card.change) || 0;
    const column = index % cardsPerRow;
    const row = Math.floor(index / cardsPerRow);

    const cardX = leftMargin + column * (cardWidth + cardGap);

    const cardY = currentY + row * (cardHeight + cardGap);

    document.setFillColor(248, 250, 252);
    document.setDrawColor(226, 232, 240);

    document.roundedRect(cardX, cardY, cardWidth, cardHeight, 3, 3, "FD");

    document.setFont("helvetica", "normal");
    document.setFontSize(7.5);
    document.setTextColor(100, 116, 139);
    document.text(card.title, cardX + 4, cardY + 7);

    document.setFont("helvetica", "bold");
    document.setFontSize(11);
    document.setTextColor(15, 23, 42);

    const valueLines = document.splitTextToSize(card.value, cardWidth - 8);

    document.text(valueLines, cardX + 4, cardY + 14);

    const changeText = `${safeChange > 0 ? "+" : ""}${safeChange.toFixed(2)}%`;

    if (safeChange > 0) {
      document.setTextColor(5, 150, 105);
    } else if (safeChange < 0) {
      document.setTextColor(220, 38, 38);
    } else {
      document.setTextColor(100, 116, 139);
    }

    document.setFontSize(7);
    document.text(changeText, cardX + cardWidth - 4, cardY + 20, {
      align: "right",
    });
  });

  currentY +=
    Math.ceil(summaryCards.length / cardsPerRow) * (cardHeight + cardGap) + 5;

  // ============================================================
  // Revenue Chart
  // ============================================================

  if (revenueChartElement) {
    ensurePageSpace(85);

    addSectionTitle(
      "Revenue Trend",
      "Revenue and order movement across the selected period.",
    );

    try {
      const chartCanvas = await html2canvas(revenueChartElement, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const chartImage = chartCanvas.toDataURL("image/png");

      const imageWidth = contentWidth;
      const imageHeight = (chartCanvas.height * imageWidth) / chartCanvas.width;

      const limitedImageHeight = Math.min(imageHeight, 72);

      document.setFillColor(255, 255, 255);
      document.setDrawColor(226, 232, 240);

      document.roundedRect(
        leftMargin,
        currentY,
        contentWidth,
        limitedImageHeight + 6,
        3,
        3,
        "FD",
      );

      document.addImage(
        chartImage,
        "PNG",
        leftMargin + 3,
        currentY + 3,
        contentWidth - 6,
        limitedImageHeight,
      );

      currentY += limitedImageHeight + 12;
    } catch (error) {
      console.error("Failed to capture revenue chart:", error);

      document.setFont("helvetica", "normal");
      document.setFontSize(9);
      document.setTextColor(100, 116, 139);

      document.text(
        "The revenue chart could not be captured.",
        leftMargin,
        currentY,
      );

      currentY += 10;
    }
  }

  // ============================================================
  // Revenue Trend Data
  // ============================================================

  if (analytics.revenueTrend.length > 0) {
    ensurePageSpace(55);

    addSectionTitle("Revenue Trend Data");

    autoTable(document, {
      startY: currentY,
      margin: {
        left: leftMargin,
        right: rightMargin,
      },
      head: [["Date", "Revenue", "Orders", "Units", "Avg. Order"]],
      body: analytics.revenueTrend.map((item) => [
        item.date,
        formatPDFCurrency(item.revenue),
        formatPDFNumber(item.orders),
        formatPDFNumber(item.unitsSold),
        formatPDFCurrency(item.averageOrderValue),
      ]),
      theme: "grid",
      styles: {
        fontSize: 7.5,
        cellPadding: 2.5,
        textColor: [51, 65, 85],
        lineColor: [226, 232, 240],
        lineWidth: 0.15,
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    currentY =
      (
        document as jsPDF & {
          lastAutoTable?: { finalY: number };
        }
      ).lastAutoTable?.finalY ?? currentY;

    currentY += 10;
  }

  // ============================================================
  // Top Products
  // ============================================================

  if (analytics.topProducts.length > 0) {
    ensurePageSpace(55);

    addSectionTitle(
      "Top Selling Products",
      "Products producing the strongest sales and revenue.",
    );

    autoTable(document, {
      startY: currentY,
      margin: {
        left: leftMargin,
        right: rightMargin,
      },
      head: [["#", "Product", "Units Sold", "Orders", "Revenue"]],
      body: analytics.topProducts.map((product, index) => [
        index + 1,
        product.name,
        formatPDFNumber(product.unitsSold),
        formatPDFNumber(product.orderCount),
        formatPDFCurrency(product.revenue),
      ]),
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: [51, 65, 85],
        lineColor: [226, 232, 240],
        lineWidth: 0.15,
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: {
          cellWidth: 10,
          halign: "center",
        },
        1: {
          cellWidth: 70,
        },
        2: {
          halign: "right",
        },
        3: {
          halign: "right",
        },
        4: {
          halign: "right",
        },
      },
    });

    currentY =
      (
        document as jsPDF & {
          lastAutoTable?: { finalY: number };
        }
      ).lastAutoTable?.finalY ?? currentY;

    currentY += 10;
  }

  // ============================================================
  // Customer Analytics
  // ============================================================

  ensurePageSpace(55);

  addSectionTitle(
    "Customer Overview",
    "Customer acquisition, retention and spending metrics.",
  );

  autoTable(document, {
    startY: currentY,
    margin: {
      left: leftMargin,
      right: rightMargin,
    },
    head: [["Metric", "Value"]],
    body: [
      ["Total Customers", formatPDFNumber(analytics.customers.totalCustomers)],
      ["New Customers", formatPDFNumber(analytics.customers.newCustomers)],
      [
        "Returning Customers",
        formatPDFNumber(analytics.customers.returningCustomers),
      ],
      [
        "Repeat Customers",
        formatPDFNumber(analytics.customers.repeatCustomers),
      ],
      [
        "Repeat Purchase Rate",
        `${analytics.customers.repeatPurchaseRate.toFixed(2)}%`,
      ],
      [
        "Average Customer Spend",
        formatPDFCurrency(analytics.customers.averageCustomerSpend),
      ],
    ],
    theme: "grid",
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  currentY =
    (
      document as jsPDF & {
        lastAutoTable?: { finalY: number };
      }
    ).lastAutoTable?.finalY ?? currentY;

  currentY += 10;

  // ============================================================
  // Inventory
  // ============================================================

  ensurePageSpace(45);

  addSectionTitle(
    "Inventory Summary",
    "Products requiring stock-management attention.",
  );

  autoTable(document, {
    startY: currentY,
    margin: {
      left: leftMargin,
      right: rightMargin,
    },
    head: [["Metric", "Value"]],
    body: [
      [
        "Low-stock Products",
        formatPDFNumber(analytics.inventory.lowStockCount),
      ],
      [
        "Out-of-stock Products",
        formatPDFNumber(analytics.inventory.outOfStockCount),
      ],
      [
        "Total Inventory Alerts",
        formatPDFNumber(
          analytics.inventory.lowStockCount +
            analytics.inventory.outOfStockCount,
        ),
      ],
    ],
    theme: "grid",
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  currentY =
    (
      document as jsPDF & {
        lastAutoTable?: { finalY: number };
      }
    ).lastAutoTable?.finalY ?? currentY;

  currentY += 10;

  // ============================================================
  // Business Insights
  // ============================================================

  if (analytics.insights.length > 0) {
    ensurePageSpace(50);

    addSectionTitle(
      "Business Insights",
      "Automatically generated observations based on current performance.",
    );

    analytics.insights.forEach((insight) => {
      const insightMessage = sanitizePDFText(insight.message);

      const insightLines = document.splitTextToSize(
        insightMessage,
        contentWidth - 12,
      );

      const requiredHeight = 15 + insightLines.length * 4;

      ensurePageSpace(requiredHeight);

      if (insight.type === "positive") {
        document.setFillColor(236, 253, 245);
        document.setDrawColor(167, 243, 208);
      } else if (insight.type === "negative" || insight.type === "warning") {
        document.setFillColor(255, 247, 237);
        document.setDrawColor(253, 186, 116);
      } else {
        document.setFillColor(239, 246, 255);
        document.setDrawColor(191, 219, 254);
      }

      document.roundedRect(
        leftMargin,
        currentY,
        contentWidth,
        requiredHeight,
        3,
        3,
        "FD",
      );

      document.setFont("helvetica", "bold");
      document.setFontSize(9);
      document.setTextColor(15, 23, 42);

      document.text(
        sanitizePDFText(insight.title),
        leftMargin + 5,
        currentY + 7,
      );

      document.setFont("helvetica", "normal");
      document.setFontSize(8);
      document.setTextColor(71, 85, 105);

      document.text(insightLines, leftMargin + 5, currentY + 13);

      currentY += requiredHeight + 4;
    });
  }

  // ============================================================
  // Footer and Page Numbers
  // ============================================================

  const totalPages = document.getNumberOfPages();

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    document.setPage(pageNumber);

    document.setDrawColor(226, 232, 240);

    document.line(
      leftMargin,
      pageHeight - 12,
      pageWidth - rightMargin,
      pageHeight - 12,
    );

    document.setFont("helvetica", "normal");
    document.setFontSize(7.5);
    document.setTextColor(100, 116, 139);

    document.text("TechVault Executive Analytics", leftMargin, pageHeight - 7);

    document.text(
      `Page ${pageNumber} of ${totalPages}`,
      pageWidth - rightMargin,
      pageHeight - 7,
      {
        align: "right",
      },
    );
  }

  const safeRange = createSafeFilename(rangeLabel) || "report";

  document.save(`techvault-executive-analytics-${safeRange}-${Date.now()}.pdf`);
};
