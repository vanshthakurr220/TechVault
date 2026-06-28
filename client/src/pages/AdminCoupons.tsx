import { useEffect, useMemo, useState } from "react";
import { Search, Grid3x3, List, TicketPercent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import Swal from "sweetalert2";

interface Coupon {
  _id: string;
  code: string;
  discountPercentage?: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  expiryDate: string;
  isActive: boolean;
}

type ViewMode = "card" | "table";

export default function AdminCoupons() {
  const { coupons, fetchCoupons, updateCoupon, deleteCoupon, createCoupon } =
    useApp();

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("card");

  useEffect(() => {
    loadCoupons();
  }, []);

  const toggleCouponStatus = async (coupon: Coupon) => {
    const result = await Swal.fire({
      title: coupon.isActive ? "Deactivate Coupon?" : "Activate Coupon?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: coupon.isActive ? "Deactivate" : "Activate",
    });

    if (!result.isConfirmed) return;

    const response = await updateCoupon(coupon._id, {
      isActive: !coupon.isActive,
    });

    if (response?.success) {
      Swal.fire({
        icon: "success",
        title: "Updated",
        timer: 1200,
        showConfirmButton: false,
      });
    }
  };

  const addCoupon = async () => {
    const result = await Swal.fire({
      title: "Create Coupon",
      width: "450px",

      html: `
      <div style="text-align:left">

        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:#374151;">
          Coupon Code
        </label>
        <input
          id="code"
          class="swal2-input"
          placeholder="SAVE10"
          style="margin-top:0;"
        />

        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:#374151;">
          Discount Percentage
        </label>
        <input
          id="discountPercentage"
          type="number"
          class="swal2-input"
          placeholder="10"
          style="margin-top:0;"
        />

        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:#374151;">
          Minimum Order Amount
        </label>
        <input
          id="minOrderAmount"
          type="number"
          class="swal2-input"
          placeholder="1000"
          style="margin-top:0;"
        />

        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:#374151;">
          Maximum Discount
        </label>
        <input
          id="maxDiscount"
          type="number"
          class="swal2-input"
          placeholder="500"
          style="margin-top:0;"
        />

        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:#374151;">
          Usage Limit
        </label>
        <input
          id="usageLimit"
          type="number"
          class="swal2-input"
          placeholder="100"
          style="margin-top:0;"
        />

        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:#374151;">
          Expiry Date
        </label>
        <input
          id="expiryDate"
          type="date"
          class="swal2-input"
          style="margin-top:0;"
        />

      </div>
    `,

      showCancelButton: true,
      confirmButtonText: "Create Coupon",

      preConfirm: () => ({
        code: (
          document.getElementById("code") as HTMLInputElement
        ).value.toUpperCase(),

        discountPercentage: Number(
          (document.getElementById("discountPercentage") as HTMLInputElement)
            .value,
        ),

        minOrderAmount: Number(
          (document.getElementById("minOrderAmount") as HTMLInputElement).value,
        ),

        maxDiscount: Number(
          (document.getElementById("maxDiscount") as HTMLInputElement).value,
        ),

        usageLimit: Number(
          (document.getElementById("usageLimit") as HTMLInputElement).value,
        ),

        expiryDate: (document.getElementById("expiryDate") as HTMLInputElement)
          .value,
      }),
    });

    if (!result.isConfirmed) return;

    try {
      const response = await createCoupon(result.value);

      if (response?.success) {
        Swal.fire({
          icon: "success",
          title: "Created",
          text: "Coupon created successfully",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: response?.message || "Could not create coupon",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Something went wrong",
      });
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    const result = await Swal.fire({
      title: "Delete Coupon?",
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
      const response = await deleteCoupon(couponId);

      if (response?.success) {
        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: "Coupon deleted successfully",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: response?.message || "Could not delete coupon",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Something went wrong",
      });
    }
  };

  const loadCoupons = async () => {
    try {
      setLoading(true);
      await fetchCoupons();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const editCoupon = async (coupon: Coupon) => {
    const result = await Swal.fire({
      title: "Edit Coupon",
      width: "500px",

      html: `
  <div style="text-align:left">

    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:#374151;">
      Coupon Code
    </label>
    <input
      id="code"
      class="swal2-input"
      value="${coupon.code}"
      style="margin-top:0;"
    />

    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:#374151;">
      Discount Percentage
    </label>
    <input
      id="discountPercentage"
      type="number"
      class="swal2-input"
      value="${coupon.discountPercentage}"
      style="margin-top:0;"
    />

    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:#374151;">
      Minimum Order Amount
    </label>
    <input
      id="minOrderAmount"
      type="number"
      class="swal2-input"
      value="${coupon.minOrderAmount}"
      style="margin-top:0;"
    />

    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:#374151;">
      Maximum Discount
    </label>
    <input
      id="maxDiscount"
      type="number"
      class="swal2-input"
      value="${coupon.maxDiscount || ""}"
      style="margin-top:0;"
    />

    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:#374151;">
      Usage Limit
    </label>
    <input
      id="usageLimit"
      type="number"
      class="swal2-input"
      value="${coupon.usageLimit}"
      style="margin-top:0;"
    />

    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:#374151;">
      Expiry Date
    </label>
    <input
      id="expiryDate"
      type="date"
      class="swal2-input"
      value="${new Date(coupon.expiryDate).toISOString().split("T")[0]}"
      style="margin-top:0;"
    />

  </div>
`,

      showCancelButton: true,
      confirmButtonText: "Update Coupon",

      preConfirm: () => ({
        code: (
          document.getElementById("code") as HTMLInputElement
        ).value.toUpperCase(),

        discountPercentage: Number(
          (document.getElementById("discountPercentage") as HTMLInputElement)
            .value,
        ),

        minOrderAmount: Number(
          (document.getElementById("minOrderAmount") as HTMLInputElement).value,
        ),

        maxDiscount: Number(
          (document.getElementById("maxDiscount") as HTMLInputElement).value,
        ),

        usageLimit: Number(
          (document.getElementById("usageLimit") as HTMLInputElement).value,
        ),

        expiryDate: (document.getElementById("expiryDate") as HTMLInputElement)
          .value,
      }),
    });

    if (!result.isConfirmed) return;

    try {
      const response = await updateCoupon(coupon._id, result.value);

      if (response?.success) {
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Coupon updated successfully",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: response?.message || "Could not update coupon",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Something went wrong",
      });
    }
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon: Coupon) => {
      const matchesSearch = coupon.code
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const isExpired = new Date(coupon.expiryDate).getTime() < Date.now();

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && coupon.isActive && !isExpired) ||
        (statusFilter === "expired" && isExpired);

      return matchesSearch && matchesStatus;
    });
  }, [coupons, searchTerm, statusFilter]);

  const analytics = useMemo(() => {
    const totalCoupons = coupons.length;

    const activeCoupons = coupons.filter(
      (coupon: Coupon) =>
        coupon.isActive && new Date(coupon.expiryDate).getTime() > Date.now(),
    ).length;

    const expiredCoupons = coupons.filter(
      (coupon: Coupon) => new Date(coupon.expiryDate).getTime() < Date.now(),
    ).length;

    const totalUsage = coupons.reduce(
      (sum: number, coupon: Coupon) => sum + coupon.usedCount,
      0,
    );

    return {
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      totalUsage,
    };
  }, [coupons]);

  if (loading) {
    return (
      <div className="mt-10 text-center">
        <p className="text-muted-foreground">Loading coupons...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in mt-8 px-4 md:px-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Manage Coupons</h2>

          <p className="text-muted-foreground mt-1">
            Create and manage discount coupons
          </p>
        </div>

        <Button onClick={addCoupon} className="gap-2">
          <TicketPercent size={18} />
          Add Coupon
        </Button>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Coupons</p>

          <h3 className="text-3xl font-bold mt-2">{analytics.totalCoupons}</h3>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Active Coupons</p>

          <h3 className="text-3xl font-bold mt-2 text-green-600">
            {analytics.activeCoupons}
          </h3>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Expired Coupons</p>

          <h3 className="text-3xl font-bold mt-2 text-red-600">
            {analytics.expiredCoupons}
          </h3>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Usage</p>

          <h3 className="text-3xl font-bold mt-2">{analytics.totalUsage}</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 bg-white rounded-3xl border shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Coupon Filters</h3>

            <p className="text-sm text-muted-foreground">
              Search and filter coupons
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
                placeholder="Search coupon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  h-10
                  pl-10
                  pr-4
                  border
                  rounded-xl
                  min-w-60
                  bg-background
                "
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-4 border rounded-xl"
            >
              <option value="all">All Coupons</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>

            <div className="flex gap-2 border rounded-xl p-1 bg-slate-50">
              <Button
                variant={viewMode === "card" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("card")}
              >
                <Grid3x3 size={16} />
              </Button>

              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                <List size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {filteredCoupons.length === 0 ? (
        <div className="rounded-3xl border bg-white p-10 text-center">
          <p className="text-muted-foreground">No coupons found</p>
        </div>
      ) : viewMode === "card" ? (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCoupons.map((coupon: Coupon) => {
            const isExpired =
              new Date(coupon.expiryDate).getTime() < Date.now();

            const usageReached = coupon.usedCount >= coupon.usageLimit;

            const usagePercentage =
              coupon.usageLimit > 0
                ? (coupon.usedCount / coupon.usageLimit) * 100
                : 0;

            return (
              <div
                key={coupon._id}
                className="
        bg-white
        border
        rounded-3xl
        shadow-sm
        hover:shadow-xl
        transition-all
        duration-300
        overflow-hidden
      "
              >
                <div className="bg-linear-to-r from-indigo-600 via-blue-600 to-cyan-600 p-5 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xl">{coupon.code}</h3>

                    <button
                      onClick={() => toggleCouponStatus(coupon)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition hover:scale-105 cursor-pointer ${
                        usageReached
                          ? "bg-yellow-100 text-yellow-700"
                          : isExpired
                            ? "bg-red-100 text-red-700"
                            : coupon.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {usageReached
                        ? "Limit Reached"
                        : isExpired
                          ? "Expired"
                          : coupon.isActive
                            ? "Active"
                            : "Inactive"}
                    </button>
                  </div>

                  <p className="mt-4 text-3xl font-bold">
                    {coupon.discountPercentage ?? 0}% OFF
                  </p>

                  {coupon.maxDiscount && (
                    <p className="text-sm text-blue-100 mt-1">
                      Max Discount ₹{coupon.maxDiscount}
                    </p>
                  )}
                </div>

                <div className="p-5">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Min Order</span>
                      <span className="font-medium">
                        ₹{coupon.minOrderAmount}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Usage</span>
                      <span className="font-medium">
                        {coupon.usedCount} / {coupon.usageLimit}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Expires</span>
                      <span className="font-medium">
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-muted-foreground">
                        Coupon Usage
                      </span>

                      <span className="font-medium">
                        {usagePercentage.toFixed(0)}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${Math.min(usagePercentage, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => editCoupon(coupon)}
                    >
                      Edit
                    </Button>

                    <Button
                      variant="outline"
                      className="flex-1 text-red-600"
                      onClick={() => handleDeleteCoupon(coupon._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left p-4">Code</th>
                <th className="text-left p-4">Discount</th>
                <th className="text-left p-4">Min Order</th>
                <th className="text-left p-4">Usage</th>
                <th className="text-left p-4">Expiry</th>
                <th className="text-left p-4">Status</th>
                <th className="text-center p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCoupons.map((coupon: Coupon) => {
                const isExpired =
                  new Date(coupon.expiryDate).getTime() < Date.now();

                const usageReached = coupon.usedCount >= coupon.usageLimit;

                return (
                  <tr key={coupon._id} className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold">{coupon.code}</td>

                    <td className="p-4">
                      {coupon.discountPercentage ?? 0}% OFF
                    </td>

                    <td className="p-4">₹{coupon.minOrderAmount}</td>

                    <td className="p-4">
                      {coupon.usedCount}/{coupon.usageLimit}
                    </td>

                    <td className="p-4">
                      {new Date(coupon.expiryDate).toLocaleDateString()}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => toggleCouponStatus(coupon)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          usageReached
                            ? "bg-yellow-100 text-yellow-700"
                            : isExpired
                              ? "bg-red-100 text-red-700"
                              : coupon.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {usageReached
                          ? "Limit Reached"
                          : isExpired
                            ? "Expired"
                            : coupon.isActive
                              ? "Active"
                              : "Inactive"}
                      </button>
                    </td>

                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editCoupon(coupon)}
                        >
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          onClick={() => handleDeleteCoupon(coupon._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
