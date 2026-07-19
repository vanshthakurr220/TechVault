import { useMemo, useState } from "react";
import { Search, Grid3x3, List, TicketPercent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp, type Coupon } from "@/contexts/AppContext";
import Swal from "sweetalert2";
import { PRODUCT_CATEGORIES } from "@/constants/productCategories";

type ViewMode = "card" | "table";

// const PRODUCT_CATEGORIES = ["gpu", "ram", "ssd", "monitor", "laptop"];

export default function AdminCoupons() {
  const { coupons, fetchCoupons, updateCoupon, deleteCoupon, createCoupon } =
    useApp();

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("card");

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
    }
  };

  const addCoupon = async () => {
    const isMobile = window.innerWidth < 640;

    const result = await Swal.fire({
      title: "Create Coupon",

      width: isMobile ? "94%" : "500px",

      padding: isMobile ? "0.9rem" : "1.1rem",

      customClass: {
        popup: "rounded-3xl",
        title: "text-xl font-bold",
        confirmButton: "rounded-xl px-5 py-2.5",
        cancelButton: "rounded-xl px-5 py-2.5",
      },

      html: `
      <div
        style="
          display:flex;
          flex-direction:column;
          gap:11px;
          text-align:left;
          width:100%;
          max-height:${isMobile ? "62vh" : "64vh"};
          overflow-y:auto;
          overflow-x:hidden;
          padding:2px 5px 2px 1px;
          box-sizing:border-box;
        "
      >
        <div>
          <label
            for="code"
            style="
              display:block;
              margin-bottom:5px;
              font-size:12px;
              font-weight:700;
              color:#334155;
            "
          >
            Coupon Code
          </label>

          <input
            id="code"
            type="text"
            class="swal2-input"
            placeholder="SAVE10"
            autocomplete="off"
            style="
              width:100%;
              height:40px;
              margin:0;
              padding:0 12px;
              box-sizing:border-box;
              border-radius:11px;
              font-size:14px;
              text-transform:uppercase;
            "
          />
        </div>

        <div>
          <label
            for="couponType"
            style="
              display:block;
              margin-bottom:5px;
              font-size:12px;
              font-weight:700;
              color:#334155;
            "
          >
            Coupon Type
          </label>

          <select
            id="couponType"
            class="swal2-select"
            style="
              width:100%;
              height:40px;
              margin:0;
              padding:0 12px;
              box-sizing:border-box;
              border:1px solid #d1d5db;
              border-radius:11px;
              background:#ffffff;
              color:#334155;
              font-size:14px;
              outline:none;
            "
          >
            <option value="GENERAL">General Coupon</option>
            <option value="WELCOME">Welcome Coupon</option>
          </select>
        </div>

        <div id="categoriesSection">
          <div
            style="
              display:flex;
              align-items:center;
              justify-content:space-between;
              gap:10px;
              margin-bottom:7px;
            "
          >
            <label
              style="
                font-size:12px;
                font-weight:700;
                color:#334155;
              "
            >
              Applicable Categories
            </label>

            <span
              id="categoryHint"
              style="
                font-size:10px;
                font-weight:600;
                color:#64748b;
              "
            >
              Empty means all products
            </span>
          </div>

          <div
            id="categoryChips"
            style="
              display:flex;
              flex-wrap:wrap;
              gap:7px;
            "
          >
            ${PRODUCT_CATEGORIES.map(
              (category) => `
                <label
                  class="coupon-category-chip"
                  data-category="${category}"
                  style="
                    display:inline-flex;
                    align-items:center;
                    justify-content:center;
                    min-height:32px;
                    padding:6px 11px;
                    border:1px solid #dbe3ee;
                    border-radius:999px;
                    background:#f8fafc;
                    color:#475569;
                    font-size:12px;
                    font-weight:700;
                    cursor:pointer;
                    user-select:none;
                    transition:all 0.2s ease;
                  "
                >
                  <input
                    type="checkbox"
                    class="coupon-category-checkbox"
                    value="${category}"
                    style="display:none;"
                  />

                  ${category.toUpperCase()}
                </label>
              `,
            ).join("")}
          </div>

          <p
            id="welcomeCouponNotice"
            style="
              display:none;
              margin:6px 0 0;
              font-size:11px;
              color:#7c3aed;
              font-weight:600;
            "
          >
            Welcome coupons apply to the customer's first eligible order.
          </p>
        </div>

        <div
          style="
            display:grid;
            grid-template-columns:${isMobile ? "1fr" : "1fr 1fr"};
            gap:10px;
          "
        >
          <div>
            <label
              for="discountPercentage"
              style="
                display:block;
                margin-bottom:5px;
                font-size:12px;
                font-weight:700;
                color:#334155;
              "
            >
              Discount Percentage
            </label>

            <div style="position:relative;">
              <input
                id="discountPercentage"
                type="number"
                min="1"
                max="100"
                class="swal2-input"
                placeholder="10"
                style="
                  width:100%;
                  height:40px;
                  margin:0;
                  padding:0 36px 0 12px;
                  box-sizing:border-box;
                  border-radius:11px;
                  font-size:14px;
                "
              />

              <span
                style="
                  position:absolute;
                  right:13px;
                  top:50%;
                  transform:translateY(-50%);
                  color:#64748b;
                  font-size:13px;
                  font-weight:700;
                  pointer-events:none;
                "
              >
                %
              </span>
            </div>
          </div>

          <div>
            <label
              for="minOrderAmount"
              style="
                display:block;
                margin-bottom:5px;
                font-size:12px;
                font-weight:700;
                color:#334155;
              "
            >
              Minimum Order
            </label>

            <div style="position:relative;">
              <span
                style="
                  position:absolute;
                  left:13px;
                  top:50%;
                  transform:translateY(-50%);
                  color:#64748b;
                  font-size:13px;
                  font-weight:700;
                  pointer-events:none;
                "
              >
                ₹
              </span>

              <input
                id="minOrderAmount"
                type="number"
                min="0"
                class="swal2-input"
                placeholder="1000"
                style="
                  width:100%;
                  height:40px;
                  margin:0;
                  padding:0 12px 0 28px;
                  box-sizing:border-box;
                  border-radius:11px;
                  font-size:14px;
                "
              />
            </div>
          </div>

          <div>
            <label
              for="maxDiscount"
              style="
                display:block;
                margin-bottom:5px;
                font-size:12px;
                font-weight:700;
                color:#334155;
              "
            >
              Maximum Discount
            </label>

            <div style="position:relative;">
              <span
                style="
                  position:absolute;
                  left:13px;
                  top:50%;
                  transform:translateY(-50%);
                  color:#64748b;
                  font-size:13px;
                  font-weight:700;
                  pointer-events:none;
                "
              >
                ₹
              </span>

              <input
                id="maxDiscount"
                type="number"
                min="0"
                class="swal2-input"
                placeholder="500"
                style="
                  width:100%;
                  height:40px;
                  margin:0;
                  padding:0 12px 0 28px;
                  box-sizing:border-box;
                  border-radius:11px;
                  font-size:14px;
                "
              />
            </div>
          </div>

          <div>
            <label
              for="usageLimit"
              style="
                display:block;
                margin-bottom:5px;
                font-size:12px;
                font-weight:700;
                color:#334155;
              "
            >
              Usage Limit
            </label>

            <input
              id="usageLimit"
              type="number"
              min="1"
              class="swal2-input"
              placeholder="100"
              style="
                width:100%;
                height:40px;
                margin:0;
                padding:0 12px;
                box-sizing:border-box;
                border-radius:11px;
                font-size:14px;
              "
            />
          </div>
        </div>

        <div>
          <label
            for="expiryDate"
            style="
              display:block;
              margin-bottom:5px;
              font-size:12px;
              font-weight:700;
              color:#334155;
            "
          >
            Expiry Date
          </label>

          <input
            id="expiryDate"
            type="date"
            class="swal2-input"
            style="
              width:100%;
              height:40px;
              margin:0;
              padding:0 12px;
              box-sizing:border-box;
              border-radius:11px;
              font-size:14px;
            "
          />
        </div>
      </div>
    `,

      showCancelButton: true,

      confirmButtonText: "Create Coupon",

      cancelButtonText: "Cancel",

      focusConfirm: false,

      didOpen: () => {
        const popup = Swal.getPopup();

        const couponTypeSelect = popup?.querySelector(
          "#couponType",
        ) as HTMLSelectElement | null;

        const categoriesSection = popup?.querySelector(
          "#categoriesSection",
        ) as HTMLElement | null;

        const categoryHint = popup?.querySelector(
          "#categoryHint",
        ) as HTMLElement | null;

        const welcomeCouponNotice = popup?.querySelector(
          "#welcomeCouponNotice",
        ) as HTMLElement | null;

        const categoryChips = Array.from(
          popup?.querySelectorAll(".coupon-category-chip") ?? [],
        ) as HTMLLabelElement[];

        const categoryCheckboxes = Array.from(
          popup?.querySelectorAll(".coupon-category-checkbox") ?? [],
        ) as HTMLInputElement[];

        const updateCategoryChipStyle = (
          chip: HTMLLabelElement,
          checked: boolean,
        ) => {
          chip.style.background = checked ? "#0f172a" : "#f8fafc";
          chip.style.color = checked ? "#ffffff" : "#475569";
          chip.style.borderColor = checked ? "#0f172a" : "#dbe3ee";
          chip.style.boxShadow = checked
            ? "0 4px 12px rgba(15, 23, 42, 0.16)"
            : "none";
        };

        categoryChips.forEach((chip) => {
          const checkbox = chip.querySelector(
            ".coupon-category-checkbox",
          ) as HTMLInputElement | null;

          if (!checkbox) return;

          updateCategoryChipStyle(chip, checkbox.checked);

          checkbox.addEventListener("change", () => {
            updateCategoryChipStyle(chip, checkbox.checked);
          });
        });

        const handleCouponTypeChange = () => {
          const isWelcome = couponTypeSelect?.value === "WELCOME";

          categoryCheckboxes.forEach((checkbox) => {
            checkbox.checked = false;
            checkbox.disabled = isWelcome;

            const chip = checkbox.closest(
              ".coupon-category-chip",
            ) as HTMLLabelElement | null;

            if (!chip) return;

            updateCategoryChipStyle(chip, false);

            chip.style.opacity = isWelcome ? "0.45" : "1";
            chip.style.cursor = isWelcome ? "not-allowed" : "pointer";
            chip.style.pointerEvents = isWelcome ? "none" : "auto";
          });

          if (categoriesSection) {
            categoriesSection.style.opacity = isWelcome ? "0.8" : "1";
          }

          if (categoryHint) {
            categoryHint.style.display = isWelcome ? "none" : "inline";
          }

          if (welcomeCouponNotice) {
            welcomeCouponNotice.style.display = isWelcome ? "block" : "none";
          }
        };

        couponTypeSelect?.addEventListener("change", handleCouponTypeChange);

        handleCouponTypeChange();

        const actions = popup?.querySelector(
          ".swal2-actions",
        ) as HTMLElement | null;

        if (actions) {
          actions.style.width = "100%";
          actions.style.margin = "14px 0 0";
          actions.style.gap = "9px";

          if (isMobile) {
            actions.style.flexDirection = "column-reverse";
          }

          actions.querySelectorAll("button").forEach((button) => {
            const element = button as HTMLElement;

            element.style.minHeight = "40px";

            if (isMobile) {
              element.style.width = "100%";
              element.style.margin = "0";
            }
          });
        }
      },

      preConfirm: () => {
        const popup = Swal.getPopup();

        const code = (
          popup?.querySelector("#code") as HTMLInputElement | null
        )?.value
          .trim()
          .toUpperCase();

        const couponType = (
          popup?.querySelector("#couponType") as HTMLSelectElement | null
        )?.value as "GENERAL" | "WELCOME";

        const discountPercentage = Number(
          (
            popup?.querySelector(
              "#discountPercentage",
            ) as HTMLInputElement | null
          )?.value,
        );

        const minOrderAmount = Number(
          (popup?.querySelector("#minOrderAmount") as HTMLInputElement | null)
            ?.value,
        );

        const maxDiscountInput = (
          popup?.querySelector("#maxDiscount") as HTMLInputElement | null
        )?.value;

        const maxDiscount = maxDiscountInput
          ? Number(maxDiscountInput)
          : undefined;

        const usageLimit = Number(
          (popup?.querySelector("#usageLimit") as HTMLInputElement | null)
            ?.value,
        );

        const expiryDate = (
          popup?.querySelector("#expiryDate") as HTMLInputElement | null
        )?.value;

        const applicableCategories =
          couponType === "WELCOME"
            ? []
            : Array.from(
                popup?.querySelectorAll(".coupon-category-checkbox:checked") ??
                  [],
              ).map((checkbox) => (checkbox as HTMLInputElement).value);

        if (!code) {
          Swal.showValidationMessage("Please enter a coupon code.");
          return false;
        }

        if (!/^[A-Z0-9_-]+$/.test(code)) {
          Swal.showValidationMessage(
            "Coupon code can only contain letters, numbers, hyphens and underscores.",
          );

          return false;
        }

        if (
          !Number.isFinite(discountPercentage) ||
          discountPercentage <= 0 ||
          discountPercentage > 100
        ) {
          Swal.showValidationMessage(
            "Discount percentage must be between 1 and 100.",
          );

          return false;
        }

        if (!Number.isFinite(minOrderAmount) || minOrderAmount < 0) {
          Swal.showValidationMessage(
            "Minimum order amount cannot be negative.",
          );

          return false;
        }

        if (
          maxDiscount !== undefined &&
          (!Number.isFinite(maxDiscount) || maxDiscount <= 0)
        ) {
          Swal.showValidationMessage(
            "Maximum discount must be greater than zero.",
          );

          return false;
        }

        if (!Number.isFinite(usageLimit) || usageLimit < 1) {
          Swal.showValidationMessage("Usage limit must be at least 1.");

          return false;
        }

        if (!expiryDate) {
          Swal.showValidationMessage("Please choose an expiry date.");
          return false;
        }

        const expiry = new Date(`${expiryDate}T23:59:59.999`);

        if (expiry.getTime() <= Date.now()) {
          Swal.showValidationMessage("Expiry date must be in the future.");

          return false;
        }

        return {
          code,
          couponType,
          applicableCategories,
          discountPercentage,
          minOrderAmount,
          maxDiscount,
          usageLimit,
          expiryDate,
          isActive: true,
        };
      },
    });

    if (!result.isConfirmed || !result.value) return;

    try {
      setLoading(true);

      const response = await createCoupon(result.value);

      if (response?.success) {
        await fetchCoupons();
      }
    } catch (error) {
      console.error("Create coupon error:", error);
    } finally {
      setLoading(false);
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
      } else {
      }
    } catch {}
  };

  const editCoupon = async (coupon: Coupon) => {
    const isMobile = window.innerWidth < 640;

    const selectedCategories = Array.isArray(coupon.applicableCategories)
      ? coupon.applicableCategories
      : [];

    const result = await Swal.fire({
      title: "Edit Coupon",

      width: isMobile ? "94%" : "500px",

      padding: isMobile ? "0.9rem" : "1.1rem",

      customClass: {
        popup: "rounded-3xl",
        title: "text-xl font-bold",
        confirmButton: "rounded-xl px-5 py-2.5",
        cancelButton: "rounded-xl px-5 py-2.5",
      },

      html: `
      <div
        style="
          display:flex;
          flex-direction:column;
          gap:11px;
          text-align:left;
          width:100%;
          max-height:${isMobile ? "62vh" : "64vh"};
          overflow-y:auto;
          overflow-x:hidden;
          padding:2px 5px 2px 1px;
          box-sizing:border-box;
        "
      >
        <div>
          <label
            for="code"
            style="
              display:block;
              margin-bottom:5px;
              font-size:12px;
              font-weight:700;
              color:#334155;
            "
          >
            Coupon Code
          </label>

          <input
            id="code"
            type="text"
            class="swal2-input"
            value="${coupon.code}"
            autocomplete="off"
            style="
              width:100%;
              height:40px;
              margin:0;
              padding:0 12px;
              box-sizing:border-box;
              border-radius:11px;
              font-size:14px;
              text-transform:uppercase;
            "
          />
        </div>

        <div>
          <label
            for="couponType"
            style="
              display:block;
              margin-bottom:5px;
              font-size:12px;
              font-weight:700;
              color:#334155;
            "
          >
            Coupon Type
          </label>

          <select
            id="couponType"
            class="swal2-select"
            style="
              width:100%;
              height:40px;
              margin:0;
              padding:0 12px;
              box-sizing:border-box;
              border:1px solid #d1d5db;
              border-radius:11px;
              background:#ffffff;
              color:#334155;
              font-size:14px;
              outline:none;
            "
          >
            <option
              value="GENERAL"
              ${(coupon.couponType ?? "GENERAL") === "GENERAL" ? "selected" : ""}
            >
              General Coupon
            </option>

            <option
              value="WELCOME"
              ${coupon.couponType === "WELCOME" ? "selected" : ""}
            >
              Welcome Coupon
            </option>
          </select>
        </div>

        <div id="categoriesSection">
          <div
            style="
              display:flex;
              align-items:center;
              justify-content:space-between;
              gap:10px;
              margin-bottom:7px;
            "
          >
            <label
              style="
                font-size:12px;
                font-weight:700;
                color:#334155;
              "
            >
              Applicable Categories
            </label>

            <span
              id="categoryHint"
              style="
                font-size:10px;
                font-weight:600;
                color:#64748b;
              "
            >
              Empty means all products
            </span>
          </div>

          <div
            id="categoryChips"
            style="
              display:flex;
              flex-wrap:wrap;
              gap:7px;
            "
          >
            ${PRODUCT_CATEGORIES.map((category) => {
              const checked = selectedCategories.includes(category);

              return `
                <label
                  class="coupon-category-chip"
                  data-category="${category}"
                  style="
                    display:inline-flex;
                    align-items:center;
                    justify-content:center;
                    min-height:32px;
                    padding:6px 11px;
                    border:1px solid ${checked ? "#0f172a" : "#dbe3ee"};
                    border-radius:999px;
                    background:${checked ? "#0f172a" : "#f8fafc"};
                    color:${checked ? "#ffffff" : "#475569"};
                    font-size:12px;
                    font-weight:700;
                    cursor:pointer;
                    user-select:none;
                    transition:all 0.2s ease;
                    box-shadow:${
                      checked ? "0 4px 12px rgba(15, 23, 42, 0.16)" : "none"
                    };
                  "
                >
                  <input
                    type="checkbox"
                    class="coupon-category-checkbox"
                    value="${category}"
                    ${checked ? "checked" : ""}
                    style="display:none;"
                  />

                  ${category.toUpperCase()}
                </label>
              `;
            }).join("")}
          </div>

          <p
            id="welcomeCouponNotice"
            style="
              display:none;
              margin:6px 0 0;
              font-size:11px;
              color:#7c3aed;
              font-weight:600;
            "
          >
            Welcome coupons apply to the customer's first eligible order.
          </p>
        </div>

        <div
          style="
            display:grid;
            grid-template-columns:${isMobile ? "1fr" : "1fr 1fr"};
            gap:10px;
          "
        >
          <div>
            <label
              for="discountPercentage"
              style="
                display:block;
                margin-bottom:5px;
                font-size:12px;
                font-weight:700;
                color:#334155;
              "
            >
              Discount Percentage
            </label>

            <div style="position:relative;">
              <input
                id="discountPercentage"
                type="number"
                min="1"
                max="100"
                class="swal2-input"
                value="${coupon.discountPercentage ?? ""}"
                style="
                  width:100%;
                  height:40px;
                  margin:0;
                  padding:0 36px 0 12px;
                  box-sizing:border-box;
                  border-radius:11px;
                  font-size:14px;
                "
              />

              <span
                style="
                  position:absolute;
                  right:13px;
                  top:50%;
                  transform:translateY(-50%);
                  color:#64748b;
                  font-size:13px;
                  font-weight:700;
                  pointer-events:none;
                "
              >
                %
              </span>
            </div>
          </div>

          <div>
            <label
              for="minOrderAmount"
              style="
                display:block;
                margin-bottom:5px;
                font-size:12px;
                font-weight:700;
                color:#334155;
              "
            >
              Minimum Order
            </label>

            <div style="position:relative;">
              <span
                style="
                  position:absolute;
                  left:13px;
                  top:50%;
                  transform:translateY(-50%);
                  color:#64748b;
                  font-size:13px;
                  font-weight:700;
                  pointer-events:none;
                "
              >
                ₹
              </span>

              <input
                id="minOrderAmount"
                type="number"
                min="0"
                class="swal2-input"
                value="${coupon.minOrderAmount}"
                style="
                  width:100%;
                  height:40px;
                  margin:0;
                  padding:0 12px 0 28px;
                  box-sizing:border-box;
                  border-radius:11px;
                  font-size:14px;
                "
              />
            </div>
          </div>

          <div>
            <label
              for="maxDiscount"
              style="
                display:block;
                margin-bottom:5px;
                font-size:12px;
                font-weight:700;
                color:#334155;
              "
            >
              Maximum Discount
            </label>

            <div style="position:relative;">
              <span
                style="
                  position:absolute;
                  left:13px;
                  top:50%;
                  transform:translateY(-50%);
                  color:#64748b;
                  font-size:13px;
                  font-weight:700;
                  pointer-events:none;
                "
              >
                ₹
              </span>

              <input
                id="maxDiscount"
                type="number"
                min="0"
                class="swal2-input"
                value="${coupon.maxDiscount ?? ""}"
                placeholder="Optional"
                style="
                  width:100%;
                  height:40px;
                  margin:0;
                  padding:0 12px 0 28px;
                  box-sizing:border-box;
                  border-radius:11px;
                  font-size:14px;
                "
              />
            </div>
          </div>

          <div>
            <label
              for="usageLimit"
              style="
                display:block;
                margin-bottom:5px;
                font-size:12px;
                font-weight:700;
                color:#334155;
              "
            >
              Usage Limit
            </label>

            <input
              id="usageLimit"
              type="number"
              min="1"
              class="swal2-input"
              value="${coupon.usageLimit}"
              style="
                width:100%;
                height:40px;
                margin:0;
                padding:0 12px;
                box-sizing:border-box;
                border-radius:11px;
                font-size:14px;
              "
            />
          </div>
        </div>

        <div>
          <label
            for="expiryDate"
            style="
              display:block;
              margin-bottom:5px;
              font-size:12px;
              font-weight:700;
              color:#334155;
            "
          >
            Expiry Date
          </label>

          <input
            id="expiryDate"
            type="date"
            class="swal2-input"
            value="${new Date(coupon.expiryDate).toISOString().split("T")[0]}"
            style="
              width:100%;
              height:40px;
              margin:0;
              padding:0 12px;
              box-sizing:border-box;
              border-radius:11px;
              font-size:14px;
            "
          />
        </div>
      </div>
    `,

      showCancelButton: true,

      confirmButtonText: "Update Coupon",

      cancelButtonText: "Cancel",

      focusConfirm: false,

      didOpen: () => {
        const popup = Swal.getPopup();

        const couponTypeSelect = popup?.querySelector(
          "#couponType",
        ) as HTMLSelectElement | null;

        const categoriesSection = popup?.querySelector(
          "#categoriesSection",
        ) as HTMLElement | null;

        const categoryHint = popup?.querySelector(
          "#categoryHint",
        ) as HTMLElement | null;

        const welcomeCouponNotice = popup?.querySelector(
          "#welcomeCouponNotice",
        ) as HTMLElement | null;

        const categoryChips = Array.from(
          popup?.querySelectorAll(".coupon-category-chip") ?? [],
        ) as HTMLLabelElement[];

        const categoryCheckboxes = Array.from(
          popup?.querySelectorAll(".coupon-category-checkbox") ?? [],
        ) as HTMLInputElement[];

        const updateCategoryChipStyle = (
          chip: HTMLLabelElement,
          checked: boolean,
        ) => {
          chip.style.background = checked ? "#0f172a" : "#f8fafc";
          chip.style.color = checked ? "#ffffff" : "#475569";
          chip.style.borderColor = checked ? "#0f172a" : "#dbe3ee";

          chip.style.boxShadow = checked
            ? "0 4px 12px rgba(15, 23, 42, 0.16)"
            : "none";
        };

        categoryChips.forEach((chip) => {
          const checkbox = chip.querySelector(
            ".coupon-category-checkbox",
          ) as HTMLInputElement | null;

          if (!checkbox) return;

          updateCategoryChipStyle(chip, checkbox.checked);

          checkbox.addEventListener("change", () => {
            updateCategoryChipStyle(chip, checkbox.checked);
          });
        });

        const handleCouponTypeChange = () => {
          const isWelcome = couponTypeSelect?.value === "WELCOME";

          categoryCheckboxes.forEach((checkbox) => {
            checkbox.disabled = isWelcome;

            const chip = checkbox.closest(
              ".coupon-category-chip",
            ) as HTMLLabelElement | null;

            if (!chip) return;

            chip.style.opacity = isWelcome ? "0.45" : "1";
            chip.style.cursor = isWelcome ? "not-allowed" : "pointer";
            chip.style.pointerEvents = isWelcome ? "none" : "auto";
          });

          if (categoriesSection) {
            categoriesSection.style.opacity = isWelcome ? "0.8" : "1";
          }

          if (categoryHint) {
            categoryHint.style.display = isWelcome ? "none" : "inline";
          }

          if (welcomeCouponNotice) {
            welcomeCouponNotice.style.display = isWelcome ? "block" : "none";
          }
        };

        couponTypeSelect?.addEventListener("change", handleCouponTypeChange);

        handleCouponTypeChange();

        const actions = popup?.querySelector(
          ".swal2-actions",
        ) as HTMLElement | null;

        if (actions) {
          actions.style.width = "100%";
          actions.style.margin = "14px 0 0";
          actions.style.gap = "9px";

          if (isMobile) {
            actions.style.flexDirection = "column-reverse";
          }

          actions.querySelectorAll("button").forEach((button) => {
            const element = button as HTMLElement;

            element.style.minHeight = "40px";

            if (isMobile) {
              element.style.width = "100%";
              element.style.margin = "0";
            }
          });
        }
      },

      preConfirm: () => {
        const popup = Swal.getPopup();

        const code = (
          popup?.querySelector("#code") as HTMLInputElement | null
        )?.value
          .trim()
          .toUpperCase();

        const couponType = (
          popup?.querySelector("#couponType") as HTMLSelectElement | null
        )?.value as "GENERAL" | "WELCOME";

        const discountPercentage = Number(
          (
            popup?.querySelector(
              "#discountPercentage",
            ) as HTMLInputElement | null
          )?.value,
        );

        const minOrderAmount = Number(
          (popup?.querySelector("#minOrderAmount") as HTMLInputElement | null)
            ?.value,
        );

        const maxDiscountInput = (
          popup?.querySelector("#maxDiscount") as HTMLInputElement | null
        )?.value;

        const maxDiscount = maxDiscountInput
          ? Number(maxDiscountInput)
          : undefined;

        const usageLimit = Number(
          (popup?.querySelector("#usageLimit") as HTMLInputElement | null)
            ?.value,
        );

        const expiryDate = (
          popup?.querySelector("#expiryDate") as HTMLInputElement | null
        )?.value;

        const applicableCategories =
          couponType === "WELCOME"
            ? []
            : Array.from(
                popup?.querySelectorAll(".coupon-category-checkbox:checked") ??
                  [],
              ).map((checkbox) => (checkbox as HTMLInputElement).value);

        if (!code) {
          Swal.showValidationMessage("Please enter a coupon code.");
          return false;
        }

        if (!/^[A-Z0-9_-]+$/.test(code)) {
          Swal.showValidationMessage(
            "Coupon code can only contain letters, numbers, hyphens and underscores.",
          );

          return false;
        }

        if (
          !Number.isFinite(discountPercentage) ||
          discountPercentage <= 0 ||
          discountPercentage > 100
        ) {
          Swal.showValidationMessage(
            "Discount percentage must be between 1 and 100.",
          );

          return false;
        }

        if (!Number.isFinite(minOrderAmount) || minOrderAmount < 0) {
          Swal.showValidationMessage(
            "Minimum order amount cannot be negative.",
          );

          return false;
        }

        if (
          maxDiscount !== undefined &&
          (!Number.isFinite(maxDiscount) || maxDiscount <= 0)
        ) {
          Swal.showValidationMessage(
            "Maximum discount must be greater than zero.",
          );

          return false;
        }

        if (!Number.isFinite(usageLimit) || usageLimit < 1) {
          Swal.showValidationMessage("Usage limit must be at least 1.");

          return false;
        }

        if (!expiryDate) {
          Swal.showValidationMessage("Please choose an expiry date.");
          return false;
        }

        const expiry = new Date(`${expiryDate}T23:59:59.999`);

        if (expiry.getTime() <= Date.now()) {
          Swal.showValidationMessage("Expiry date must be in the future.");

          return false;
        }

        return {
          code,
          couponType,
          applicableCategories,
          discountPercentage,
          minOrderAmount,
          maxDiscount,
          usageLimit,
          expiryDate,
        };
      },
    });

    if (!result.isConfirmed || !result.value) return;

    try {
      setLoading(true);

      const response = await updateCoupon(coupon._id, result.value);

      if (response?.success) {
        await fetchCoupons();
      }
    } catch (error) {
      console.error("Update coupon error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
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
      (coupon) =>
        coupon.isActive && new Date(coupon.expiryDate).getTime() > Date.now(),
    ).length;

    const expiredCoupons = coupons.filter(
      (coupon) => new Date(coupon.expiryDate).getTime() < Date.now(),
    ).length;

    const totalUsage = coupons.reduce(
      (sum, coupon) => sum + Number(coupon.usedCount ?? 0),
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
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Manage Coupons</h2>

          <p className="text-muted-foreground mt-1">
            Create and manage discount coupons
          </p>
        </div>

        <Button onClick={addCoupon} className="gap-2 w-full sm:w-auto">
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

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 w-full lg:w-auto">
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

            <div className="hidden md:flex gap-2 border rounded-xl p-1 bg-slate-50">
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
      ) : viewMode === "card" || window.innerWidth < 768 ? (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCoupons.map((coupon) => {
            const isExpired =
              new Date(coupon.expiryDate).getTime() < Date.now();

            const usageReached =
              Number(coupon.usedCount ?? 0) >= Number(coupon.usageLimit ?? 0);

            const usagePercentage =
              Number(coupon.usageLimit ?? 0) > 0
                ? (Number(coupon.usedCount ?? 0) / Number(coupon.usageLimit)) *
                  100
                : 0;

            const couponType = coupon.couponType ?? "GENERAL";

            const categories = Array.isArray(coupon.applicableCategories)
              ? coupon.applicableCategories
              : [];

            const isAllProducts = categories.length === 0;

            return (
              <div
                key={String(coupon._id)}
                className="
            overflow-hidden
            rounded-3xl
            border
            bg-white
            shadow-sm
            transition-all
            duration-300
            hover:-translate-y-1
            hover:shadow-xl
          "
              >
                <div className="bg-linear-to-r from-indigo-600 via-blue-600 to-cyan-600 p-5 text-white">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-xl font-bold">
                        {String(coupon.code ?? "")}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            couponType === "WELCOME"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-white/20 text-white"
                          }`}
                        >
                          {couponType === "WELCOME"
                            ? "Welcome Coupon"
                            : "General Coupon"}
                        </span>

                        <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white">
                          {isAllProducts
                            ? "All Products"
                            : `${categories.length} ${
                                categories.length === 1
                                  ? "Category"
                                  : "Categories"
                              }`}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleCouponStatus(coupon)}
                      className={`shrink-0 cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition hover:scale-105 ${
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
                    {Number(coupon.discountPercentage ?? 0).toFixed(0)}% OFF
                  </p>

                  <p className="mt-1 text-sm text-blue-100">
                    Maximum discount:{" "}
                    {coupon.maxDiscount
                      ? `₹${Number(coupon.maxDiscount).toLocaleString()}`
                      : "No maximum limit"}
                  </p>
                </div>

                <div className="p-5">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Applicable on
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {isAllProducts ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          All Products
                        </span>
                      ) : (
                        categories.map((category) => (
                          <span
                            key={category}
                            className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold uppercase text-blue-700"
                          >
                            {category}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">Coupon Type</span>

                      <span className="text-right font-medium">
                        {couponType === "WELCOME" ? "Welcome" : "General"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Minimum Order
                      </span>

                      <span className="text-right font-medium">
                        ₹{Number(coupon.minOrderAmount ?? 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Maximum Discount
                      </span>

                      <span className="text-right font-medium">
                        {coupon.maxDiscount
                          ? `₹${Number(coupon.maxDiscount).toLocaleString()}`
                          : "Unlimited"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">Usage</span>

                      <span className="text-right font-medium">
                        {Number(coupon.usedCount ?? 0)} /{" "}
                        {Number(coupon.usageLimit ?? 0)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">Expires</span>

                      <span className="text-right font-medium">
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Coupon Usage
                      </span>

                      <span className="font-medium">
                        {usagePercentage.toFixed(1)}%
                      </span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            Math.max(usagePercentage, 0),
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <Button
                      variant="outline"
                      className="
                  flex-1
                  border-slate-300
                  transition-all
                  duration-200
                  hover:border-slate-900
                  hover:bg-slate-900
                  hover:text-white
                "
                      onClick={() => editCoupon(coupon)}
                    >
                      Edit
                    </Button>

                    <Button
                      variant="outline"
                      className="
                  flex-1
                  border-red-300
                  text-red-600
                  transition-all
                  duration-200
                  hover:border-red-600
                  hover:bg-red-600
                  hover:text-white
                "
                      onClick={() => handleDeleteCoupon(String(coupon._id))}
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
          <table className="min-w-[1250px] w-full">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-4 text-left">Code</th>

                <th className="p-4 text-left">Type</th>

                <th className="p-4 text-left">Categories</th>

                <th className="p-4 text-left">Discount</th>

                <th className="p-4 text-left">Min Order</th>

                <th className="p-4 text-left">Max Discount</th>

                <th className="p-4 text-left">Usage</th>

                <th className="p-4 text-left">Usage %</th>

                <th className="p-4 text-left">Expiry</th>

                <th className="p-4 text-left">Status</th>

                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCoupons.map((coupon) => {
                const isExpired =
                  new Date(coupon.expiryDate).getTime() < Date.now();

                const usageReached =
                  Number(coupon.usedCount ?? 0) >=
                  Number(coupon.usageLimit ?? 0);

                const usagePercentage =
                  Number(coupon.usageLimit ?? 0) > 0
                    ? (Number(coupon.usedCount ?? 0) /
                        Number(coupon.usageLimit)) *
                      100
                    : 0;

                const couponType = coupon.couponType ?? "GENERAL";

                const categories = Array.isArray(coupon.applicableCategories)
                  ? coupon.applicableCategories
                  : [];

                return (
                  <tr
                    key={String(coupon._id)}
                    className="border-b transition hover:bg-slate-50"
                  >
                    <td className="p-4">
                      <div className="font-semibold">
                        {String(coupon.code ?? "")}
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          couponType === "WELCOME"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {couponType === "WELCOME" ? "Welcome" : "General"}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex max-w-60 flex-wrap gap-1.5">
                        {categories.length === 0 ? (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                            All Products
                          </span>
                        ) : (
                          categories.map((category) => (
                            <span
                              key={category}
                              className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium uppercase text-blue-700"
                            >
                              {category}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    <td className="p-4 font-medium">
                      {Number(coupon.discountPercentage ?? 0).toFixed(0)}% OFF
                    </td>

                    <td className="p-4">
                      ₹{Number(coupon.minOrderAmount ?? 0).toLocaleString()}
                    </td>

                    <td className="p-4">
                      {coupon.maxDiscount
                        ? `₹${Number(coupon.maxDiscount).toLocaleString()}`
                        : "Unlimited"}
                    </td>

                    <td className="p-4">
                      {Number(coupon.usedCount ?? 0)} /{" "}
                      {Number(coupon.usageLimit ?? 0)}
                    </td>

                    <td className="p-4">
                      <div className="min-w-28">
                        <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                          <span className="font-medium">
                            {usagePercentage.toFixed(1)}%
                          </span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${Math.min(
                                Math.max(usagePercentage, 0),
                                100,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      {new Date(coupon.expiryDate).toLocaleDateString()}
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => toggleCouponStatus(coupon)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
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
                          variant="outline"
                          size="sm"
                          className="
                      border-slate-300
                      hover:border-slate-900
                      hover:bg-slate-900
                      hover:text-white
                    "
                          onClick={() => editCoupon(coupon)}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="
                      border-red-300
                      text-red-600
                      hover:border-red-600
                      hover:bg-red-600
                      hover:text-white
                    "
                          onClick={() => handleDeleteCoupon(String(coupon._id))}
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
