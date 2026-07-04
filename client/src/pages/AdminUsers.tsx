import { useEffect, useState } from "react";
import {
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Grid3x3,
  List,
} from "lucide-react";
import Swal from "sweetalert2";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";

interface User {
  _id: string;
  username: string;
  email: string;
  mobile: string;
  role: string;
  createdAt: string;
}

type ViewMode = "card" | "table";

export default function AdminUsers() {
  const {
    allUsers,
    deleteUser: deleteUserFromContext,
    makeAdmin,
    removeAdmin: removeAdminFromContext,
  } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("card");

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

      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

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

  const renderUserCard = (user: User) => (
    <div
      key={user._id}
      className="
      group
      bg-white
      rounded-3xl
      border
      shadow-sm
      hover:shadow-xl
      transition-all
      duration-300
      overflow-hidden
    "
    >
      {/* Card Header */}
      <div className="h-20 bg-linear-to-r from-[#1e3a8a] via-[#1e48a3] to-[#0a1830]" />

      <div className="p-6 -mt-10">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow flex items-center justify-center text-2xl font-bold mb-4">
          {user.username?.charAt(0).toUpperCase()}
        </div>

        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg">{user.username}</h3>

            <p className="text-sm text-muted-foreground break-all">
              {user.email}
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              user.role === "admin"
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {user.role}
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mobile</span>

            <span>{user.mobile || "N/A"}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Joined</span>

            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">User ID</span>

            <span className="text-xs break-all">{user._id}</span>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          {user.role === "admin" ? (
            <button
              onClick={() => removeAdmin(user._id)}
              className="
              flex-1
              py-2
              rounded-xl
              bg-yellow-100
              text-yellow-800
              hover:bg-yellow-200
              transition
              text-sm
              font-medium
            "
            >
              Remove Admin
            </button>
          ) : (
            <button
              onClick={() => toggleAdmin(user._id)}
              className="
              flex-1
              py-2
              rounded-xl
              bg-blue-100
              text-blue-700
              hover:bg-blue-200
              transition
              text-sm
              font-medium
            "
            >
              Make Admin
            </button>
          )}

          <button
            onClick={() => deleteUser(user._id)}
            className="
            h-10
            w-10
            flex
            items-center
            justify-center
            rounded-xl
            border
            hover:bg-red-50
            transition
          "
          >
            <Trash2 size={16} className="text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderUserTable = () => (
    <div className="overflow-x-auto rounded-2xl border shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              <button
                onClick={() => handleSort("username")}
                className="flex items-center gap-1 hover:text-primary transition"
              >
                Username
                {getSortIcon("username")}
              </button>
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              <button
                onClick={() => handleSort("email")}
                className="flex items-center gap-1 hover:text-primary transition"
              >
                Email
                {getSortIcon("email")}
              </button>
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              Mobile
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              <button
                onClick={() => handleSort("role")}
                className="flex items-center gap-1 hover:text-primary transition"
              >
                Role
                {getSortIcon("role")}
              </button>
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              <button
                onClick={() => handleSort("createdAt")}
                className="flex items-center gap-1 hover:text-primary transition"
              >
                Joined
                {getSortIcon("createdAt")}
              </button>
            </th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user) => (
            <tr
              key={user._id}
              className="border-b hover:bg-slate-50 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-sm">{user.username}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-muted-foreground break-all">
                  {user.email}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm">{user.mobile || "N/A"}</span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.role === "admin"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2 justify-center">
                  {user.role === "admin" ? (
                    <button
                      onClick={() => removeAdmin(user._id)}
                      className="px-3 py-1 rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition text-xs font-medium"
                    >
                      Remove Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleAdmin(user._id)}
                      className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition text-xs font-medium"
                    >
                      Make Admin
                    </button>
                  )}

                  <button
                    onClick={() => deleteUser(user._id)}
                    className="h-9 w-9 flex items-center justify-center rounded-lg border hover:bg-red-50 transition"
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
      <div className="mb-8 bg-white rounded-3xl border shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">User Management</h3>
            <p className="text-sm text-muted-foreground">
              Search, sort and manage users
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                h-10
                pl-10
                pr-4
                border
                rounded-xl
                min-w-62.5
                bg-background
                focus:outline-none
                focus:ring-2
                focus:ring-primary
              "
              />
            </div>

            <select
              onChange={(e) =>
                setSortConfig({
                  key: e.target.value as keyof User,
                  direction: "asc",
                })
              }
              className="h-10 px-4 border rounded-xl bg-background"
            >
              <option value="createdAt">Joined Date</option>
              <option value="username">Username</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
            </select>

            {/* View Toggle */}
            <div className="flex gap-2 border rounded-xl p-1 bg-slate-50">
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

        <div className="mt-5 flex flex-wrap gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-50 text-sm">
            Total Users:
            <span className="font-semibold ml-1">{users.length}</span>
          </div>

          <div className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm">
            Admins:
            <span className="font-semibold ml-1">
              {users.filter((u) => u.role === "admin").length}
            </span>
          </div>

          <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm">
            Users:
            <span className="font-semibold ml-1">
              {users.filter((u) => u.role !== "admin").length}
            </span>
          </div>

          <div className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-sm">
            Showing:
            <span className="font-semibold ml-1">{sortedUsers.length}</span>
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
    </div>
  );
}
