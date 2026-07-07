import { useEffect, useState } from "react";
import {
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Grid3x3,
  List,
  X,
  UserCircle,
  Mail,
  Phone,
  Shield,
  Calendar,
  Hash,
  MapPin,
  ShoppingBag,
  Heart,
  Star,
  Clock,
  Copy,
} from "lucide-react";
import Swal from "sweetalert2";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import jsPDF from "jspdf";
import { useNotification } from "@/components/Notification";

interface User {
  _id: string;
  username: string;
  email: string;
  mobile: string;
  role: string;
  createdAt: string;
  addresses?: any[];
  ordersCount?: number;
  wishlistCount?: number;
  reviewsCount?: number;
}

type ViewMode = "card" | "table";

export default function AdminUsers() {
  const {
    allOrders,
    allReviews,
    allWishlists,
    allUsers,
    deleteUser: deleteUserFromContext,
    makeAdmin,
    removeAdmin: removeAdminFromContext,
  } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof User | null;
    direction: "asc" | "desc";
  }>({
    key: "createdAt",
    direction: "desc",
  });

  useEffect(() => {
    setUsers(Array.isArray(allUsers) ? (allUsers as User[]) : []);
  }, [allUsers]);

  const getSelectedUserExportData = (stats: {
    orders: number;
    wishlistItems: number;
    reviews: number;
  }) => {
    if (!selectedUser) return [];

    return [
      ["Field", "Value"],
      ["Name", selectedUser.username || "N/A"],
      ["Email", selectedUser.email || "N/A"],
      ["Mobile", selectedUser.mobile || "N/A"],
      ["Role", selectedUser.role || "N/A"],
      [
        "Joined",
        new Date(selectedUser.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      ],
      ["User ID", selectedUser._id],
      ["Addresses", selectedUser.addresses?.length || 0],
      ["Orders", stats.orders],
      ["Wishlist Items", stats.wishlistItems],
      ["Reviews", stats.reviews],
    ];
  };

  const downloadBlob = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  };

  const exportUserCSV = () => {
    if (!selectedUser) return;

    const stats = getSelectedUserStats(selectedUser);
    const rows = getSelectedUserExportData(stats);

    const csvContent = rows
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    downloadBlob(
      csvContent,
      `${selectedUser.username || "user"}-details.csv`,
      "text/csv;charset=utf-8;",
    );

    setShowExportMenu(false);
  };

  const exportUserExcel = () => {
    if (!selectedUser) return;

    const stats = getSelectedUserStats(selectedUser);
    const rows = getSelectedUserExportData(stats);

    const tableRows = rows
      .map(
        ([label, value]) =>
          `<tr><td style="font-weight:bold">${label}</td><td>${value}</td></tr>`,
      )
      .join("");

    const excelContent = `
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <table border="1">
          <tr>
            <th colspan="2">User Details</th>
          </tr>
          ${tableRows}
        </table>
      </body>
    </html>
  `;

    downloadBlob(
      excelContent,
      `${selectedUser.username || "user"}-details.xls`,
      "application/vnd.ms-excel",
    );

    setShowExportMenu(false);
  };

  const exportUserPDF = () => {
    if (!selectedUser) return;
    const stats = getSelectedUserStats(selectedUser);

    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const primary = [15, 23, 42];
    const blue = [37, 99, 235];
    const slate = [100, 116, 139];
    const lightBg = [248, 250, 252];

    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.rect(0, 0, pageWidth, 42, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("User Profile Report", 14, 18);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on ${new Date().toLocaleDateString("en-IN")}`, 14, 28);

    doc.setFillColor(255, 255, 255);
    doc.circle(178, 22, 13, "F");

    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(selectedUser.username?.charAt(0).toUpperCase() || "U", 174, 27);

    let y = 58;

    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(selectedUser.username || "User", 14, y);

    doc.setFontSize(11);
    doc.setTextColor(slate[0], slate[1], slate[2]);
    doc.setFont("helvetica", "normal");
    doc.text(selectedUser.email || "N/A", 14, y + 8);

    doc.setFillColor(
      selectedUser.role === "admin" ? blue[0] : 16,
      selectedUser.role === "admin" ? blue[1] : 185,
      selectedUser.role === "admin" ? blue[2] : 129,
    );
    doc.roundedRect(150, y - 6, 42, 11, 5, 5, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(selectedUser.role.toUpperCase(), 158, y + 1);

    y += 24;

    const infoCards = [
      ["Mobile", selectedUser.mobile || "N/A"],
      [
        "Joined",
        new Date(selectedUser.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      ],
      ["User ID", selectedUser._id],
      ["Addresses", selectedUser.addresses?.length || 0],
      ["Orders", stats.orders],
      ["Wishlist Items", stats.wishlistItems],
      ["Reviews", stats.reviews],
    ];

    infoCards.forEach(([label, value], index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);

      const x = col === 0 ? 14 : 108;
      const cardY = y + row * 24;

      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, cardY, 84, 18, 3, 3, "FD");

      doc.setFontSize(8);
      doc.setTextColor(slate[0], slate[1], slate[2]);
      doc.setFont("helvetica", "bold");
      doc.text(String(label).toUpperCase(), x + 5, cardY + 6);

      doc.setFontSize(10);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.setFont("helvetica", "bold");

      const valueText = doc.splitTextToSize(String(value), 72);
      doc.text(valueText.slice(0, 2), x + 5, cardY + 13);
    });

    y += Math.ceil(infoCards.length / 2) * 24 + 8;

    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.roundedRect(14, y, 182, 12, 3, 3, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Saved Addresses", 20, y + 8);

    y += 20;

    if (!selectedUser.addresses || selectedUser.addresses.length === 0) {
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, y, 182, 22, 3, 3, "FD");

      doc.setTextColor(slate[0], slate[1], slate[2]);
      doc.setFontSize(10);
      doc.text("No address added yet.", 20, y + 13);
    } else {
      selectedUser.addresses.forEach((address, index) => {
        if (y > pageHeight - 45) {
          doc.addPage();
          y = 20;
        }

        const fullAddress =
          [address.street, address.city, address.state, address.zipCode]
            .filter(Boolean)
            .join(", ") || "Address details not available";

        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, y, 182, 34, 3, 3, "FD");

        doc.setTextColor(primary[0], primary[1], primary[2]);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`Address ${index + 1}`, 20, y + 8);

        if (address.isDefault) {
          doc.setFillColor(16, 185, 129);
          doc.roundedRect(166, y + 4, 22, 7, 3, 3, "F");

          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.text("DEFAULT", 169, y + 9);
        }

        doc.setTextColor(slate[0], slate[1], slate[2]);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(address.name || "N/A", 20, y + 16);

        doc.setFont("helvetica", "normal");
        const addressLines = doc.splitTextToSize(fullAddress, 160);
        doc.text(addressLines.slice(0, 2), 20, y + 23);

        doc.setFont("helvetica", "bold");
        doc.text(`Phone: ${address.phone || "N/A"}`, 20, y + 31);

        y += 40;
      });
    }

    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.rect(0, pageHeight - 12, pageWidth, 12, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("TechVault Admin User Export", 14, pageHeight - 5);

    doc.save(`${selectedUser.username || "user"}-profile-report.pdf`);

    setShowExportMenu(false);
  };

  const notify = useNotification();

  const copyUserId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);

      notify.success("User ID copied");
    } catch (error) {
      console.error(error);

      notify.error("Failed to copy User ID.");
    }
  };

  const deleteUser = async (_id: string) => {
    const result = await Swal.fire({
      title: "Delete User?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      width: "420px",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteUserFromContext(_id);

      setUsers((prev) => prev.filter((user) => user._id !== _id));
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const toggleAdmin = async (_id: string) => {
    const result = await Swal.fire({
      title: "Make this user Admin?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Make Admin",
      confirmButtonColor: "#2563eb",
      width: "420px",
    });

    if (!result.isConfirmed) return;

    try {
      await makeAdmin(_id);

      setUsers((prev) =>
        prev.map((user) =>
          user._id === _id ? { ...user, role: "admin" } : user,
        ),
      );
    } catch (error) {
      console.error("Failed to make user admin:", error);
    }
  };

  const removeAdmin = async (_id: string) => {
    const result = await Swal.fire({
      title: "Remove Admin Access?",
      text: "User role will become normal user.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Remove Admin",
      confirmButtonColor: "#eab308",
      width: "420px",
    });

    if (!result.isConfirmed) return;

    try {
      await removeAdminFromContext(_id);

      setUsers((prev) =>
        prev.map((user) =>
          user._id === _id ? { ...user, role: "user" } : user,
        ),
      );
    } catch (error) {
      console.error("Failed to remove admin access:", error);
    }
  };

  const handleSort = (key: keyof User) => {
    let direction: "asc" | "desc" = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({
      key,
      direction,
    });
  };

  const getSortIcon = (key: keyof User) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown size={14} className="ml-1 opacity-50" />;
    }

    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} className="ml-1 text-primary" />
    ) : (
      <ArrowDown size={14} className="ml-1 text-primary" />
    );
  };

  const sortedUsers = [...users]
    .filter(
      (user) =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (!sortConfig.key) return 0;

      const aValue = a[sortConfig.key] ?? "";
      const bValue = b[sortConfig.key] ?? "";

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }

      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }

      return 0;
    });

  if (loading) {
    return <Loader text="Loading Users" variant="page" />;
  }

  const getAvatarColor = (email: string) => {
    const colors = [
      "bg-rose-100 text-rose-700",
      "bg-orange-100 text-orange-700",
      "bg-amber-100 text-amber-700",
      "bg-emerald-100 text-emerald-700",
      "bg-teal-100 text-teal-700",
      "bg-cyan-100 text-cyan-700",
      "bg-sky-100 text-sky-700",
      "bg-indigo-100 text-indigo-700",
      "bg-violet-100 text-violet-700",
      "bg-fuchsia-100 text-fuchsia-700",
    ];

    const hash = email
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return colors[hash % colors.length];
  };

  const getSelectedUserStats = (selectedUser: User) => {
    const userOrders = allOrders.filter(
      (order) => order.userId === selectedUser.email,
    );

    const userReviews = allReviews.filter(
      (review) => review.userEmail === selectedUser.email,
    );

    const userWishlist = allWishlists.find(
      (wishlist) =>
        wishlist.userId === selectedUser._id ||
        wishlist.userId?._id === selectedUser._id,
    );

    return {
      orders: userOrders.length,
      reviews: userReviews.length,
      wishlistItems: userWishlist?.items?.length || 0,
    };
  };

  const renderUserCard = (user: User) => (
    <div
      key={user._id}
      onClick={() => setSelectedUser(user)}
      className="group cursor-pointer rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-black shadow-md ${getAvatarColor(user.email)}`}
        >
          {user.username?.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-3">
            <h3 className="truncate text-lg font-black text-slate-900">
              {user.username}
            </h3>

            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold capitalize ${
                user.role === "admin"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {user.role}
            </span>
          </div>

          <p className="break-all text-sm font-medium text-slate-500">
            {user.email}
          </p>
        </div>
      </div>
    </div>
  );

  const renderUserTable = () => (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[760px]">
        <thead className="border-b bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-black text-slate-700">
              <button
                onClick={() => handleSort("username")}
                className="flex items-center gap-1 hover:text-primary"
              >
                Name {getSortIcon("username")}
              </button>
            </th>

            <th className="px-6 py-4 text-left text-sm font-black text-slate-700">
              <button
                onClick={() => handleSort("email")}
                className="flex items-center gap-1 hover:text-primary"
              >
                Email {getSortIcon("email")}
              </button>
            </th>

            <th className="px-6 py-4 text-left text-sm font-black text-slate-700">
              <button
                onClick={() => handleSort("role")}
                className="flex items-center gap-1 hover:text-primary"
              >
                Role {getSortIcon("role")}
              </button>
            </th>

            <th className="px-6 py-4 text-center text-sm font-black text-slate-700">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {sortedUsers.map((user) => (
            <tr
              key={user._id}
              className="border-b transition hover:bg-slate-50"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black ${getAvatarColor(user.email)}`}
                  >
                    {user.username?.charAt(0).toUpperCase()}
                  </div>

                  <span className="text-sm font-bold text-slate-900">
                    {user.username}
                  </span>
                </div>
              </td>

              <td className="px-6 py-4">
                <span className="break-all text-sm font-medium text-slate-500">
                  {user.email}
                </span>
              </td>

              <td className="px-6 py-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                    user.role === "admin"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {user.role}
                </span>
              </td>

              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                  >
                    View User
                  </button>

                  {user.role === "admin" ? (
                    <button
                      onClick={() => removeAdmin(user._id)}
                      className="rounded-lg bg-yellow-100 px-3 py-2 text-xs font-bold text-yellow-800 transition hover:bg-yellow-200"
                    >
                      Remove Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleAdmin(user._id)}
                      className="rounded-lg bg-blue-100 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-200"
                    >
                      Make Admin
                    </button>
                  )}

                  <button
                    onClick={() => deleteUser(user._id)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 transition hover:bg-red-50"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="animate-fade-in mt-8 px-4 md:px-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Manage Users</h2>
        <p className="text-muted-foreground mt-1">
          Manage users and admin permissions
        </p>
      </div>

      {/* Filters Card */}
      <div className="mb-8 rounded-3xl border bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold">User Management</h3>
            <p className="text-sm text-muted-foreground">
              Search, sort and manage users
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <div className="relative w-full sm:w-auto">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-xl border bg-background pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary sm:min-w-62.5"
              />
            </div>

            <select
              onChange={(e) =>
                setSortConfig({
                  key: e.target.value as keyof User,
                  direction: "asc",
                })
              }
              className="h-10 w-full rounded-xl border bg-background px-4 sm:w-auto"
            >
              <option value="createdAt">Joined Date</option>
              <option value="username">Username</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
            </select>

            <div className="grid grid-cols-2 gap-2 rounded-xl border bg-slate-50 p-1 sm:flex">
              <Button
                variant={viewMode === "card" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("card")}
                className="gap-2"
              >
                <Grid3x3 size={16} />
                Card
              </Button>

              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="gap-2"
              >
                <List size={16} />
                Table
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm">
            Total Users:
            <span className="ml-1 font-semibold">{users.length}</span>
          </div>

          <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm text-blue-700">
            Admins:
            <span className="ml-1 font-semibold">
              {users.filter((u) => u.role === "admin").length}
            </span>
          </div>

          <div className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            Users:
            <span className="ml-1 font-semibold">
              {users.filter((u) => u.role !== "admin").length}
            </span>
          </div>

          <div className="rounded-xl bg-indigo-50 px-4 py-2 text-sm text-indigo-700">
            Showing:
            <span className="ml-1 font-semibold">{sortedUsers.length}</span>
          </div>
        </div>
      </div>

      {/* Users View */}
      {sortedUsers.length === 0 ? (
        <div className="col-span-full text-center py-16 bg-white rounded-3xl border">
          <p className="text-muted-foreground">No users found</p>
        </div>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedUsers.map((user) => renderUserCard(user))}
        </div>
      ) : (
        renderUserTable()
      )}

      {selectedUser &&
        (() => {
          const stats = getSelectedUserStats(selectedUser);

          return (
            <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 backdrop-blur-md p-3 pt-14 sm:p-5 sm:pt-20 mt-5">
              <div className="w-full max-w-4xl overflow-hidden rounded-[1.75rem] bg-white shadow-2xl">
                <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-5 py-6 sm:px-7">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white hover:text-slate-950"
                  >
                    <X size={20} />
                  </button>

                  <div className="flex items-center gap-4 pr-12">
                    <div
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-black shadow-lg ${getAvatarColor(selectedUser.email)}`}
                    >
                      {selectedUser.username?.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-xl font-black text-white sm:text-2xl">
                        {selectedUser.username}
                      </h3>
                      <p className="mt-1 break-all text-sm font-medium text-slate-300">
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="max-h-[75vh] overflow-y-auto bg-slate-50 p-4 sm:p-7">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[
                      { label: "Email", value: selectedUser.email, icon: Mail },
                      {
                        label: "Mobile",
                        value: selectedUser.mobile || "N/A",
                        icon: Phone,
                      },
                      { label: "Role", value: selectedUser.role, icon: Shield },
                      {
                        label: "Joined",
                        value: new Date(
                          selectedUser.createdAt,
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }),
                        icon: Calendar,
                      },
                      { label: "User ID", value: selectedUser._id, icon: Hash },
                      {
                        label: "Orders",
                        value: stats.orders,
                        icon: ShoppingBag,
                      },
                      {
                        label: "Wishlist Items",
                        value: stats.wishlistItems,
                        icon: Heart,
                      },
                      { label: "Reviews", value: stats.reviews, icon: Star },
                    ].map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                            <Icon size={15} />
                            {item.label}
                          </div>

                          {item.label === "User ID" ? (
                            <div className="flex items-center justify-between gap-3">
                              <p className="break-all text-sm font-bold text-slate-800">
                                {item.value}
                              </p>

                              <button
                                onClick={() => copyUserId(String(item.value))}
                                className="rounded-lg p-2 transition hover:bg-slate-100"
                                title="Copy User ID"
                              >
                                <Copy size={16} />
                              </button>
                            </div>
                          ) : (
                            <p className="break-words text-sm font-bold text-slate-800">
                              {item.value}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="flex items-center gap-2 text-base font-black text-slate-900">
                          <MapPin size={18} />
                          Addresses
                        </h4>
                        <p className="mt-1 text-sm text-slate-500">
                          {selectedUser.addresses?.length || 0} saved address
                          {(selectedUser.addresses?.length || 0) !== 1
                            ? "es"
                            : ""}
                        </p>
                      </div>
                    </div>

                    {!selectedUser.addresses ||
                    selectedUser.addresses.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                        <p className="text-sm font-semibold text-slate-500">
                          No address added yet
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {selectedUser.addresses.map((address, index) => (
                          <div
                            key={address._id || index}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                          >
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <h5 className="text-sm font-black text-slate-900">
                                Address {index + 1}
                              </h5>

                              {address.isDefault && (
                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                                  Default
                                </span>
                              )}
                            </div>

                            <div className="space-y-2 text-sm">
                              <p className="font-bold text-slate-800">
                                {address.name || "N/A"}
                              </p>

                              <p className="leading-6 text-slate-600">
                                {[
                                  address.street,
                                  address.city,
                                  address.state,
                                  address.zipCode,
                                ]
                                  .filter(Boolean)
                                  .join(", ") ||
                                  "Address details not available"}
                              </p>

                              <p className="font-semibold text-slate-700">
                                Phone: {address.phone || "N/A"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t bg-white p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    {/* Export */}
                    <div className="relative w-full sm:w-auto">
                      <Button
                        onClick={() => setShowExportMenu((prev) => !prev)}
                        className="h-11 w-full rounded-xl bg-slate-950 px-5 font-black text-white hover:bg-slate-800 sm:w-auto"
                      >
                        Export User
                      </Button>

                      {showExportMenu && (
                        <div className="absolute bottom-13 left-0 z-20 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:w-44">
                          <button
                            onClick={exportUserCSV}
                            className="block w-full px-4 py-3 text-left text-sm font-bold hover:bg-slate-100"
                          >
                            CSV
                          </button>

                          <button
                            onClick={exportUserExcel}
                            className="block w-full px-4 py-3 text-left text-sm font-bold hover:bg-slate-100"
                          >
                            Excel
                          </button>

                          <button
                            onClick={exportUserPDF}
                            className="block w-full px-4 py-3 text-left text-sm font-bold hover:bg-slate-100"
                          >
                            PDF
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Make / Remove Admin */}
                    {selectedUser.role === "admin" ? (
                      <Button
                        onClick={() => removeAdmin(selectedUser._id)}
                        className="h-11 rounded-xl bg-yellow-500 px-5 font-bold text-white hover:bg-yellow-600"
                      >
                        Remove Admin
                      </Button>
                    ) : (
                      <Button
                        onClick={() => toggleAdmin(selectedUser._id)}
                        className="h-11 rounded-xl bg-blue-600 px-5 font-bold text-white hover:bg-blue-700"
                      >
                        Make Admin
                      </Button>
                    )}

                    {/* Delete */}
                    <Button
                      onClick={() => {
                        setSelectedUser(null);
                        deleteUser(selectedUser._id);
                      }}
                      className="h-11 rounded-xl bg-red-600 px-5 font-bold text-white hover:bg-red-700"
                    >
                      <Trash2 size={17} className="mr-2" />
                      Delete User
                    </Button>

                    {/* Close */}
                    <Button
                      variant="outline"
                      onClick={() => setSelectedUser(null)}
                      className="h-11 flex-1 rounded-xl font-black hover:bg-slate-950 hover:text-white"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
