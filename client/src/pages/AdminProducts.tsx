import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Edit2,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  Star,
  Grid3x3,
  List,
  Package,
  DollarSign,
  ShoppingCart,
  Heart,
  Eye,
  ImageIcon,
  Camera,
} from "lucide-react";
import Swal from "sweetalert2";
import { useApp } from "@/contexts/AppContext";
import { PRODUCT_CATEGORIES } from "@/constants/productCategories";
import Loader from "@/components/Loader";

interface Product {
  _id: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image: string; // Primary image (for backward compatibility)
  images: string[]; // Full gallery of images
  description: string;
  specifications: Record<string, any>;
  inStock: boolean;
  stockQuantity: number;
  createdAt: string;
  views?: number;
  unitsSold?: number; // Added for analytics
  revenue?: number; // Added for analytics
  wishlistCount?: number; // Added for analytics
}

type SortConfig = {
  key: keyof Product | "avgRating" | "reviewCount" | null;
  direction: "asc" | "desc";
};

type ViewMode = "card" | "table";

export default function AdminProducts() {
  const {
    adminProducts,
    allReviews,
    fetchAdminProducts,
    fetchAllReviews,
    allWishlists,
    fetchAllWishlists,
    addProduct: addProductInContext,
    addingProduct,
    updateProduct: updateProductInContext,
    deleteProduct: deleteProductInContext,
  } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "createdAt",
    direction: "desc",
  });
  const [viewMode, setViewMode] = useState<ViewMode>("card");

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const toggleRow = (productId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const fetchReviews = async () => {
    try {
      await fetchAllReviews();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
  if (adminProducts.length > 0) {
    setProducts(adminProducts as Product[]);
    setLoading(false);
    return;
  }

  fetchProducts();
  fetchReviews();
  fetchAllWishlists();
}, []);

  useEffect(() => {
  setProducts(adminProducts as Product[]);

  if (adminProducts.length > 0) {
    setLoading(false);
  }
}, [adminProducts]);

  useEffect(() => {
    setReviews(allReviews || []);
  }, [allReviews]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      await fetchAdminProducts();
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const sortedProducts = useMemo(() => {
    const filteredItems = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "instock" && product.inStock) ||
        (stockFilter === "outofstock" && !product.inStock);

      return matchesSearch && matchesCategory && matchesStock;
    });

    const sortableItems = [...filteredItems];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (
          sortConfig.key === "avgRating" ||
          sortConfig.key === "reviewCount"
        ) {
          const aReviews = reviews.filter((r) => r.productId?._id === a._id);
          const bReviews = reviews.filter((r) => r.productId?._id === b._id);

          if (sortConfig.key === "avgRating") {
            aValue =
              aReviews.length > 0
                ? aReviews.reduce((sum, r) => sum + r.rating, 0) /
                  aReviews.length
                : 0;
            bValue =
              bReviews.length > 0
                ? bReviews.reduce((sum, r) => sum + r.rating, 0) /
                  bReviews.length
                : 0;
          } else {
            aValue = aReviews.length;
            bValue = bReviews.length;
          }
        } else {
          aValue = a[sortConfig.key as keyof Product];
          bValue = b[sortConfig.key as keyof Product];
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [products, sortConfig, reviews, searchTerm, categoryFilter, stockFilter]);

  const analytics = useMemo(() => {
    const totalProducts = products.length;

    const totalOrdersCount = products.reduce(
      (sum, product) => sum + (product.unitsSold || 0),
      0,
    );

    const totalRevenueSum = products.reduce(
      (sum, product) => sum + (product.revenue || 0),
      0,
    );

    const wishlistCounts: Record<string, number> = {};
    allWishlists?.forEach((wishlist: any) => {
      wishlist.items?.forEach((item: any) => {
        const id = item.productId?._id || item.productId;
        wishlistCounts[id] = (wishlistCounts[id] || 0) + 1;
      });
    });

    let maxWishlistId = "";
    let maxWishlistCount = 0;
    Object.entries(wishlistCounts).forEach(([id, count]) => {
      if (count > maxWishlistCount) {
        maxWishlistCount = count;
        maxWishlistId = id;
      }
    });
    const mostWishlisted =
      products.find((p) => p._id === maxWishlistId)?.name || "N/A";

    const mostViewedProduct =
      products.length > 0
        ? products.reduce((prev, curr) =>
            (prev.views || 0) > (curr.views || 0) ? prev : curr,
          )
        : null;
    const mostViewed = mostViewedProduct ? mostViewedProduct.name : "N/A";

    const totalRating = allReviews?.reduce(
      (acc: number, r: any) => acc + r.rating,
      0,
    );
    const avgRating =
      allReviews?.length > 0
        ? (totalRating / allReviews.length).toFixed(1)
        : "0.0";

    return {
      totalProducts,
      totalOrders: totalOrdersCount,
      totalRevenue: totalRevenueSum,
      mostWishlisted,
      mostViewed,
      avgRating,
    };
  }, [products, allWishlists, allReviews]);

  const deleteProduct = async (_id: string) => {
    const result = await Swal.fire({
      title: "Delete Product?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteProductInContext(_id);

      setProducts((prev) => prev.filter((product) => product._id !== _id));
    } catch (error) {
      console.error("Delete product failed:", error);
    }
  };

  if (loading) {
    return <Loader text="Loading Products" variant="button" />;
  }

  const editProduct = async (product: Product) => {
    let images = [...(product.images || [])];

    const result = await Swal.fire({
      title: "Edit Product",
      width: "800px",
      customClass: {
        popup: "rounded-2xl",
        title: "text-xl font-bold border-b pb-4",
        htmlContainer: "mt-4",
      },
      html: `
<div style="text-align:left; font-family: 'Inter', sans-serif;">
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
    <div style="grid-column: 1 / span 2;">
      <label style="font-size:11px; font-weight:700; color:#374151; text-transform:uppercase; margin-bottom:4px; display:block;">Product Name</label>
      <input id="swal-name" class="swal2-input" value="${product.name}" style="width:100%; margin:0; height:38px; font-size:14px;" />
    </div>
    <div>
  <label
    style="
      font-size:11px;
      font-weight:700;
      color:#374151;
      text-transform:uppercase;
      margin-bottom:4px;
      display:block;
    "
  >
    Category
  </label>

  <select
    id="swal-category"
    style="
      width:100%;
      height:42px;
      padding:0 12px;
      border:2px solid #e5e7eb;
      border-radius:4px;
      background:#f9fafb;
      font-size:14px;
      font-weight:500;
      cursor:pointer;
      appearance:auto;
      box-shadow:0 1px 2px rgba(0,0,0,0.05);
    "
  >
    ${PRODUCT_CATEGORIES.map(
      (category) => `
        <option
          value="${category}"
          ${product.category === category ? "selected" : ""}
        >
          ${category}
        </option>
      `,
    ).join("")}
  </select>
</div>
    <div>
      <label style="font-size:11px; font-weight:700; color:#374151; text-transform:uppercase; margin-bottom:4px; display:block;">Brand</label>
      <input id="swal-brand" class="swal2-input" value="${product.brand || ""}" style="width:100%; margin:0; height:38px; font-size:14px;" />
    </div>
    <div>
      <label style="font-size:11px; font-weight:700; color:#374151; text-transform:uppercase; margin-bottom:4px; display:block;">Model</label>
      <input id="swal-model" class="swal2-input" value="${product.model || ""}" style="width:100%; margin:0; height:38px; font-size:14px;" />
    </div>
    <div>
      <label style="font-size:11px; font-weight:700; color:#374151; text-transform:uppercase; margin-bottom:4px; display:block;">Price (₹)</label>
      <input id="swal-price" type="number" class="swal2-input" value="${product.price}" style="width:100%; margin:0; height:38px; font-size:14px;" />
    </div>
    <div>
      <label style="font-size:11px; font-weight:700; color:#374151; text-transform:uppercase; margin-bottom:4px; display:block;">Original Price (₹)</label>
      <input id="swal-originalPrice" type="number" class="swal2-input" value="${product.originalPrice || 0}" style="width:100%; margin:0; height:38px; font-size:14px;" />
    </div>
       <div>
  <label style="font-size:11px; font-weight:700; color:#374151; text-transform:uppercase; margin-bottom:4px; display:block;">
    Stock Quantity
  </label>

  <input
    id="swal-stockQuantity"
    type="number"
    min="0"
    class="swal2-input"
    value="${product.stockQuantity || 0}"
    style="width:100%; margin:0; height:38px; font-size:14px;"
  />
</div>
    <div style="grid-column: 1 / span 2; border-top: 1px solid #eee; padding-top: 12px; margin-top: 4px;">
      <label style="font-size:11px; font-weight:700; color:#374151; text-transform:uppercase; margin-bottom:8px; display:block;">Product Images</label>
      <div id="image-gallery" style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px;"></div>
      <div style="display:flex; gap:8px; align-items:center;">
        <input id="new-image-files" type="file" multiple accept="image/*" class="swal2-input" style="margin:0; flex:1; height:36px; font-size:12px;" />
        <button type="button" id="upload-images-btn" class="swal2-confirm swal2-styled" style="margin:0; padding:6px 12px; font-size:12px;">Upload</button>
      </div>
    </div>
    <div style="grid-column: 1 / span 2;">
      <label style="font-size:11px; font-weight:700; color:#374151; text-transform:uppercase; margin-bottom:4px; display:block;">Description</label>
      <textarea id="swal-description" class="swal2-textarea" style="width:100%; margin:0; height:70px; font-size:14px; padding:8px;">${product.description || ""}</textarea>
    </div>
    <div style="grid-column: 1 / span 2;">
      <label style="font-size:11px; font-weight:700; color:#374151; text-transform:uppercase; margin-bottom:4px; display:block;">Specifications (JSON)</label>
      <textarea id="swal-specifications" class="swal2-textarea" style="width:100%; margin:0; height:70px; font-size:14px; padding:8px; font-family:monospace;">${JSON.stringify(product.specifications || {}, null, 2)}</textarea>
    </div>
  </div>
</div>
`,

      didOpen: () => {
        const renderImages = () => {
          const gallery = document.getElementById("image-gallery");

          if (!gallery) return;

          gallery.innerHTML = images
            .map(
              (img, index) => `
        <div style="position:relative;">
          <img
            src="${img}"
            style="
              width:100px;
              height:100px;
              object-fit:contain;
              border:1px solid #ddd;
              border-radius:10px;
              background:white;
              padding:4px;
            "
          />

          <button
            type="button"
            class="delete-image"
            data-index="${index}"
            style="
              position:absolute;
              top:-6px;
              right:-6px;
              width:24px;
              height:24px;
              border:none;
              border-radius:50%;
              background:red;
              color:white;
              cursor:pointer;
              font-weight:bold;
            "
          >
            ×
          </button>
        </div>
      `,
            )
            .join("");

          gallery.querySelectorAll(".delete-image").forEach((btn) => {
            btn.addEventListener("click", (e) => {
              const index = Number(
                (e.currentTarget as HTMLElement).dataset.index,
              );

              images.splice(index, 1);
              renderImages();
            });
          });
        };

        renderImages();

        // ==============================
        // ✅ NEW: FILE UPLOAD SUPPORT
        // ==============================
        document
          .getElementById("upload-images-btn")
          ?.addEventListener("click", async () => {
            const input = document.getElementById(
              "new-image-files",
            ) as HTMLInputElement;

            const files = input.files;

            if (!files || files.length === 0) return;

            const formData = new FormData();

            Array.from(files).forEach((file) => {
              formData.append("images", file);
            });

            try {
              const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
              });

              const data = await res.json();

              if (!data.success) {
                Swal.showValidationMessage("Image upload failed");
                return;
              }

              // Append uploaded images
              images.push(...data.urls);

              // reset input
              input.value = "";

              renderImages();
            } catch (err) {
              console.error(err);
              Swal.showValidationMessage("Upload error");
            }
          });
      },

      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Update",

      preConfirm: () => {
        try {
          return {
            name: (document.getElementById("swal-name") as HTMLInputElement)
              .value,

            category: (
              document.getElementById("swal-category") as HTMLInputElement
            ).value,

            brand: (document.getElementById("swal-brand") as HTMLInputElement)
              .value,

            model: (document.getElementById("swal-model") as HTMLInputElement)
              .value,

            price: Number(
              (document.getElementById("swal-price") as HTMLInputElement).value,
            ),

            originalPrice: Number(
              (
                document.getElementById(
                  "swal-originalPrice",
                ) as HTMLInputElement
              ).value,
            ),

            images,

            description: (
              document.getElementById("swal-description") as HTMLTextAreaElement
            ).value,

            specifications: JSON.parse(
              (
                document.getElementById(
                  "swal-specifications",
                ) as HTMLTextAreaElement
              ).value || "{}",
            ),

            stockQuantity: Number(
              (
                document.getElementById(
                  "swal-stockQuantity",
                ) as HTMLInputElement
              ).value || 0,
            ),
          };
        } catch {
          Swal.showValidationMessage("Specifications must be valid JSON");

          return false;
        }
      },
    });

    if (!result.isConfirmed) return;

    try {
      await updateProductInContext(product._id, result.value);

      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id
            ? {
                ...p,
                ...result.value,
              }
            : p,
        ),
      );
    } catch (error) {
      console.error("Update product failed:", error);
    }
  };

  const addProduct = async () => {
    const result = await Swal.fire({
      title: "Add Product",
      width: "800px",
      customClass: {
        popup: "rounded-2xl",
        title: "text-xl font-bold border-b pb-4",
        htmlContainer: "mt-4",
      },
      html: `
<div style="text-align:left; font-family: 'Inter', sans-serif;">
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
    <div style="grid-column: 1 / span 2;">
      <label style="font-size:11px; font-weight:700; color:#374151; text-transform:uppercase; margin-bottom:4px; display:block;">Product Name</label>
      <input id="name" class="swal2-input" placeholder="Enter product name" style="width:100%; margin:0; height:38px; font-size:14px;" />
    </div>
    <div>
  <label style="font-size:11px; font-weight:700; color:#374151; text-transform:uppercase; margin-bottom:4px; display:block;">
    Category
  </label>

  <select
  id="category"
  style="
    width:100%;
    height:40px;
    padding:0 12px;
    border:2px solid #d1d5db;
    border-radius:4px;
    background:white;
    font-size:14px;
    font-weight:500;
    cursor:pointer;
    appearance:auto;
    outline:none;
  "
>
    ${PRODUCT_CATEGORIES.map(
      (category) => `<option value="${category}">${category}</option>`,
    ).join("")}
  </select>
</div>
    <div>
      <label style="font-size:11px; font-weight:700; color:#374151; text-transform:uppercase; margin-bottom:4px; display:block;">Brand</label>
      <input id="brand" class="swal2-input" placeholder="e.g. Apple" style="width:100%; margin:0; height:38px; font-size:14px;" />
    </div>
    <div>
      <label style="font-size:11px; font-weight:700; color:#374151; text-transform:uppercase; margin-bottom:4px; display:block;">Model</label>
      <input id="model" class="swal2-input" placeholder="e.g. iPhone 15" style="width:100%; margin:0; height:38px; font-size:14px;" />
    </div>
    <div>
      <label style="font-size:11px; font-weight:700; color:#374151; text-transform:uppercase; margin-bottom:4px; display:block;">Price (₹)</label>
      <input id="price" type="number" class="swal2-input" placeholder="0.00" style="width:100%; margin:0; height:38px; font-size:14px;" />
    </div>
    <div>
      <label style="font-size:11px; font-weight:700; color:#374151; text-transform:uppercase; margin-bottom:4px; display:block;">Original Price (₹)</label>
      <input id="originalPrice" type="number" class="swal2-input" placeholder="0.00" style="width:100%; margin:0; height:38px; font-size:14px;" />
    </div>
    <div>
  <label style="font-size:11px; font-weight:700; color:#374151; text-transform:uppercase; margin-bottom:4px; display:block;">
    Stock Quantity
  </label>

  <input
    id="stockQuantity"
    type="number"
    min="0"
    class="swal2-input"
    placeholder="Enter stock quantity"
    style="width:100%; margin:0; height:38px; font-size:14px;"
  />
</div>
    <div style="grid-column: 1 / span 2; border-top: 1px solid #eee; padding-top: 12px; margin-top: 4px;">
      <label style="font-size:11px; font-weight:700; color:#374151; text-transform:uppercase; margin-bottom:4px; display:block;">Product Images</label>
      <input id="images" type="file" multiple accept="image/*" class="swal2-input" style="width:100%; margin:0; height:38px; font-size:13px;" />
    </div>
    <div style="grid-column: 1 / span 2;">
      <label style="font-size:11px; font-weight:700; color:#374151; text-transform:uppercase; margin-bottom:4px; display:block;">Description</label>
      <textarea id="description" class="swal2-textarea" placeholder="Enter product description" style="width:100%; margin:0; height:70px; font-size:14px; padding:8px;"></textarea>
    </div>
    <div style="grid-column: 1 / span 2;">
      <label style="font-size:11px; font-weight:700; color:#374151; text-transform:uppercase; margin-bottom:4px; display:block;">Specifications (JSON)</label>
      <textarea id="specifications" class="swal2-textarea" placeholder='{"Display": "6.1 inch", "Storage": "128GB"}' style="width:100%; margin:0; height:70px; font-size:14px; padding:8px; font-family:monospace;"></textarea>
    </div>
  </div>
</div>
`,

      showCancelButton: true,
      confirmButtonText: "Add Product",
      cancelButtonText: "Cancel",

      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),

      preConfirm: async () => {
        try {
          // Get the raw input string
          const imageInput = document.getElementById(
            "images",
          ) as HTMLInputElement;

          const files = imageInput.files;

          if (!files || files.length === 0) {
            Swal.showValidationMessage("Please select at least one image");
            return false;
          }

          const formData = new FormData();

          Array.from(files).forEach((file) => {
            formData.append("images", file);
          });

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const uploadData = await uploadResponse.json();

          if (!uploadData.success) {
            Swal.showValidationMessage("Image upload failed");
            return false;
          }

          const imageUrls = uploadData.urls;
          const specificationsText =
            (document.getElementById("specifications") as HTMLTextAreaElement)
              .value || "{}";

          return {
            name: (document.getElementById("name") as HTMLInputElement).value,

            category: (document.getElementById("category") as HTMLInputElement)
              .value,

            brand: (document.getElementById("brand") as HTMLInputElement).value,

            model: (document.getElementById("model") as HTMLInputElement).value,

            price: Number(
              (document.getElementById("price") as HTMLInputElement).value,
            ),

            originalPrice: Number(
              (document.getElementById("originalPrice") as HTMLInputElement)
                .value || 0,
            ),

            images: imageUrls,

            description: (
              document.getElementById("description") as HTMLTextAreaElement
            ).value,

            stockQuantity: Number(
              (document.getElementById("stockQuantity") as HTMLInputElement)
                .value || 0,
            ),

            specifications: JSON.parse(specificationsText),
          };
        } catch {
          Swal.showValidationMessage("Specifications must be valid JSON");
        }
      },
    });

    if (!result.isConfirmed) return;

    try {
      await addProductInContext(result.value);
      await fetchAdminProducts();
    } catch (error) {
      console.error("Add product failed:", error);
    }
  };

  const viewProduct = (product: Product) => {
    const stats = getProductStats(product._id);

    const productImages =
      product.images && product.images.length > 0
        ? product.images
        : [product.image];

    const imagesJson = JSON.stringify(productImages).replace(/"/g, "&quot;");

    const stockStatus =
      product.stockQuantity <= 0
        ? {
            text: "Out of Stock",
            bg: "#fee2e2",
            color: "#991b1b",
            dot: "#ef4444",
          }
        : product.stockQuantity <= 5
          ? {
              text: `Low Stock • ${product.stockQuantity} left`,
              bg: "#fef3c7",
              color: "#92400e",
              dot: "#f59e0b",
            }
          : {
              text: `In Stock • ${product.stockQuantity} available`,
              bg: "#dcfce7",
              color: "#166534",
              dot: "#22c55e",
            };

    Swal.fire({
      width: "min(94vw, 720px)",
      padding: "0",
      showConfirmButton: true,
      confirmButtonText: "Close",
      customClass: {
        popup: "rounded-3xl overflow-hidden",
        confirmButton: "rounded-xl px-8 py-3 font-bold",
      },
      html: `
<div style="font-family:Inter,sans-serif;background:#f8fafc;text-align:left;color:#0f172a;">

  <div style="background:white;border-bottom:1px solid #e5e7eb;padding:20px 22px;">
    <p style="margin:0 0 6px;color:#64748b;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.7px;">
      Product Overview
    </p>
    <h2 style="margin:0;font-size:clamp(22px,5vw,30px);font-weight:900;line-height:1.2;">
      ${product.name}
    </h2>
  </div>

  <div style="padding:18px;">

    <div style="background:white;border:1px solid #e5e7eb;border-radius:24px;padding:14px;box-shadow:0 16px 40px rgba(15,23,42,.08);">
      <div style="position:relative;height:300px;background:linear-gradient(180deg,#f8fafc,#ffffff);border-radius:20px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
        <img id="swal-main-image" src="${productImages[0]}" data-index="0" style="width:100%;height:100%;object-fit:contain;padding:24px;" />

        ${
          productImages.length > 1
            ? `
          <button onclick="const imgs=${imagesJson};let i=parseInt(document.getElementById('swal-main-image').getAttribute('data-index'));i=(i-1+imgs.length)%imgs.length;const img=document.getElementById('swal-main-image');img.src=imgs[i];img.setAttribute('data-index',i);" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);width:36px;height:36px;border:none;border-radius:50%;background:white;box-shadow:0 6px 18px rgba(15,23,42,.18);cursor:pointer;font-size:24px;">‹</button>

          <button onclick="const imgs=${imagesJson};let i=parseInt(document.getElementById('swal-main-image').getAttribute('data-index'));i=(i+1)%imgs.length;const img=document.getElementById('swal-main-image');img.src=imgs[i];img.setAttribute('data-index',i);" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);width:36px;height:36px;border:none;border-radius:50%;background:white;box-shadow:0 6px 18px rgba(15,23,42,.18);cursor:pointer;font-size:24px;">›</button>
        `
            : ""
        }
      </div>

      ${
        productImages.length > 1
          ? `
        <div style="display:flex;gap:8px;margin-top:12px;overflow-x:auto;padding-bottom:4px;">
          ${productImages
            .map(
              (img, idx) => `
              <img src="${img}" onclick="document.getElementById('swal-main-image').src='${img}';document.getElementById('swal-main-image').setAttribute('data-index','${idx}')" style="width:58px;height:58px;object-fit:contain;background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:5px;cursor:pointer;flex:0 0 auto;" />
            `,
            )
            .join("")}
        </div>
      `
          : ""
      }
    </div>

    <div style="margin-top:16px;background:white;border:1px solid #e5e7eb;border-radius:22px;padding:16px;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap;">
        <div>
          <p style="margin:0;color:#64748b;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;">Selling Price</p>
          <div style="margin-top:5px;">
            <span style="font-size:clamp(30px,6vw,42px);font-weight:950;color:#020617;">₹${product.price.toLocaleString()}</span>
            ${
              product.originalPrice > product.price
                ? `<span style="margin-left:10px;color:#94a3b8;text-decoration:line-through;font-size:18px;">₹${product.originalPrice.toLocaleString()}</span>`
                : ""
            }
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end;" class="tv-badge-wrap">
          <span style="background:#eef2ff;color:#4338ca;padding:8px 13px;border-radius:999px;font-size:12px;font-weight:800;">
            ${product.category}
          </span>

          <span style="background:${stockStatus.bg};color:${stockStatus.color};padding:8px 13px;border-radius:999px;font-size:12px;font-weight:900;display:flex;align-items:center;gap:7px;">
            <span style="width:8px;height:8px;border-radius:999px;background:${stockStatus.dot};display:inline-block;"></span>
            ${stockStatus.text}
          </span>
        </div>
      </div>

      <div style="margin-top:14px;padding-top:14px;border-top:1px solid #e5e7eb;display:flex;gap:22px;flex-wrap:wrap;">
        <div>
          <p style="margin:0 0 3px;color:#64748b;font-size:11px;font-weight:800;text-transform:uppercase;">Brand</p>
          <p style="margin:0;font-size:15px;font-weight:900;color:#020617;">${product.brand}</p>
        </div>

        <div>
          <p style="margin:0 0 3px;color:#64748b;font-size:11px;font-weight:800;text-transform:uppercase;">Model</p>
          <p style="margin:0;font-size:15px;font-weight:900;color:#020617;">${product.model}</p>
        </div>

        <div>
          <p style="margin:0 0 3px;color:#64748b;font-size:11px;font-weight:800;text-transform:uppercase;">Created</p>
          <p style="margin:0;font-size:15px;font-weight:900;color:#020617;">${new Date(product.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:16px;" class="tv-stats-grid">
      ${[
        ["Views", product.views || 0, "👁"],
        ["Wishlist", stats.wishlistCount, "❤️"],
        ["Orders", stats.totalOrdered, "📦"],
        ["Revenue", `₹${stats.totalRevenue.toLocaleString()}`, "₹"],
      ]
        .map(
          ([label, value, icon]) => `
          <div style="background:white;border:1px solid #e5e7eb;border-radius:20px;padding:16px;display:flex;align-items:center;gap:13px;box-shadow:0 8px 22px rgba(15,23,42,.04);">
            <div style="width:42px;height:42px;border-radius:15px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;">
              ${icon}
            </div>
            <div>
              <p style="margin:0 0 3px;color:#64748b;font-size:11px;text-transform:uppercase;font-weight:800;">${label}</p>
              <p style="margin:0;color:#020617;font-size:18px;font-weight:950;word-break:break-word;">${value}</p>
            </div>
          </div>
        `,
        )
        .join("")}
    </div>

    <div style="margin-top:16px;background:white;border:1px solid #e5e7eb;border-radius:22px;padding:17px;">
      <h3 style="margin:0 0 10px;font-size:18px;font-weight:900;color:#020617;">Description</h3>
      <p style="margin:0;color:#475569;font-size:14px;line-height:1.8;">
        ${product.description || "No description available."}
      </p>
    </div>

    <div style="margin-top:16px;background:white;border:1px solid #e5e7eb;border-radius:22px;padding:16px;">
  <h3 style="margin:0 0 14px;font-size:18px;font-weight:900;color:#020617;">
    Specifications
  </h3>

  ${
    Object.keys(product.specifications || {}).length > 0
      ? `
      <table style="width:100%;border-collapse:collapse;font-size:13px;table-layout:fixed;">
        <tbody>
          ${Object.entries(product.specifications)
            .map(
              ([key, value], index) => `
              <tr style="background:${index % 2 === 0 ? "#ffffff" : "#f8fafc"};">
                <td
                  style="
                    width:34%;
                    padding:10px 8px;
                    border-bottom:1px solid #e5e7eb;
                    color:#64748b;
                    font-weight:700;
                    font-size:12px;
                    vertical-align:top;
                    word-break:break-word;
                  "
                >
                  ${key}
                </td>

                <td
                  style="
                    padding:10px 8px;
                    border-bottom:1px solid #e5e7eb;
                    color:#111827;
                    font-weight:600;
                    font-size:12px;
                    vertical-align:top;
                    word-break:break-word;
                  "
                >
                  ${value}
                </td>
              </tr>
            `,
            )
            .join("")}
        </tbody>
      </table>
    `
      : `<p style="margin:0;color:#64748b;">No specifications available.</p>`
  }
</div>

  </div>

  <style>
    @media (max-width: 640px) {
      div[style*="height:300px"] {
        height: 220px !important;
      }

      #swal-main-image {
        padding: 16px !important;
      }

      .tv-stats-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 10px !important;
      }

      .tv-stats-grid > div {
        padding: 13px !important;
        align-items: flex-start !important;
      }

      .tv-stats-grid > div > div:first-child {
        width: 36px !important;
        height: 36px !important;
        font-size: 17px !important;
        border-radius: 13px !important;
      }

      .tv-stats-grid p:last-child {
        font-size: 15px !important;
      }

      .tv-badge-wrap {
        align-items: flex-start !important;
        width: 100% !important;
      }
    }

    @media (max-width: 420px) {
      .tv-stats-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }

      .tv-stats-grid > div {
        flex-direction: column !important;
        gap: 8px !important;
      }
    }
  </style>
</div>
`,
    });
  };

  const categories = ["all", ...new Set(products.map((p) => p.category))];

  const getProductStats = (productId: string) => {
    const product = products.find((p) => p._id === productId);

    const wishlistCount =
      allWishlists?.reduce((count: number, wishlist: any) => {
        const exists = wishlist.items?.some(
          (item: any) => (item.productId?._id || item.productId) === productId,
        );

        return exists ? count + 1 : count;
      }, 0) || 0;

    return {
      totalOrdered: product?.unitsSold || 0,
      totalRevenue: product?.revenue || 0,
      wishlistCount,
    };
  };

  const renderProductCard = (product: Product) => {
    const productReviews = reviews.filter(
      (review) => review.productId?._id === product._id,
    );

    const stats = getProductStats(product._id);

    const avgRating =
      productReviews.length > 0
        ? (
            productReviews.reduce((sum, review) => sum + review.rating, 0) /
            productReviews.length
          ).toFixed(1)
        : "0";

    const discount =
      product.originalPrice > product.price
        ? Math.round(
            ((product.originalPrice - product.price) / product.originalPrice) *
              100,
          )
        : 0;

    return (
      <div
        key={product._id}
        className="
        group
        relative
        overflow-hidden
        rounded-[28px]
        border
        border-slate-200/70
        bg-white
        shadow-[0_10px_40px_rgba(0,0,0,0.06)]
        hover:shadow-[0_25px_70px_rgba(0,0,0,0.12)]
        hover:-translate-y-2
        transition-all
        duration-500
      "
      >
        {/* ================= IMAGE SECTION ================= */}
        <div className="relative overflow-hidden">
          <div className="relative aspect-16/10 bg-linear-to-br from-slate-50 via-white to-slate-100">
            {/* Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95)_0%,transparent_70%)]" />

            {/* Image wrapper */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Main image */}
                <img
                  src={product.images?.[0] || product.image}
                  alt={product.name}
                  className={`
                  absolute
                  max-h-full
                  max-w-full
                  object-contain
                  transition-all
                  duration-700
                  ease-out
                  ${
                    product.images?.length > 1
                      ? "group-hover:opacity-0 group-hover:scale-110"
                      : "group-hover:scale-110"
                  }
                `}
                />

                {/* Hover image */}
                {product.images?.length > 1 && (
                  <img
                    src={product.images[1]}
                    alt={`${product.name} alternate`}
                    className="
                    absolute
                    max-h-full
                    max-w-full
                    object-contain
                    opacity-0
                    scale-95
                    transition-all
                    duration-700
                    ease-out
                    group-hover:opacity-100
                    group-hover:scale-110
                  "
                  />
                )}
              </div>
            </div>

            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute top-4 left-4 z-20">
                <span className="px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-bold shadow-lg">
                  -{discount}%
                </span>
              </div>
            )}

            {/* Stock Badge */}
            <div className="absolute top-4 right-4 z-20">
              {product.stockQuantity === 0 ? (
                <span className="px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-semibold shadow-lg">
                  Out of Stock
                </span>
              ) : product.stockQuantity <= 5 ? (
                <span className="px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs font-semibold shadow-lg">
                  Only {product.stockQuantity} Left
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-semibold shadow-lg">
                  In Stock
                </span>
              )}
            </div>

            {/* Gallery indicator */}
            {product.images?.length > 1 && (
              <>
                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border shadow-md text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  {product.images.length}
                  <Camera size={15} className="text-slate-500 opacity-80" />
                </div>

                {/* dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {product.images.slice(0, 5).map((_, i) => (
                    <span
                      key={i}
                      className={`h-2 rounded-full bg-white shadow-md transition-all ${
                        i === 0 ? "w-6" : "w-2 opacity-60"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="p-6">
          {/* Category + ID */}
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
              {product.category}
            </span>

            <span className="text-xs text-slate-400">ID#{product._id}</span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold tracking-tight text-slate-900 line-clamp-1">
            {product.name}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {product.brand} • {product.model}
          </p>

          {/* Description */}
          <p className="mt-4 text-sm text-slate-500 line-clamp-2 min-h-11">
            {product.description}
          </p>

          {/* Price */}
          <div className="mt-5">
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-slate-900">
                ₹{product.price.toLocaleString()}
              </span>

              {product.originalPrice > product.price && (
                <span className="text-sm text-slate-400 line-through pb-1">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {discount > 0 && (
              <p className="text-xs mt-1 text-emerald-600 font-medium">
                You save ₹
                {(product.originalPrice - product.price).toLocaleString()}
              </p>
            )}
          </div>

          {/* Rating */}
          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50">
              <Star size={14} className="text-amber-500" fill="currentColor" />
              <span className="font-semibold">{avgRating}</span>
              <span className="text-xs text-slate-500">
                ({productReviews.length})
              </span>
            </div>

            <span className="text-xs text-slate-500">{product.brand}</span>
          </div>

          {/* Analytics */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { label: "Views", value: product.views || 0 },
              { label: "Wishlist", value: stats.wishlistCount },
              { label: "Orders", value: stats.totalOrdered },
              {
                label: "Revenue",
                value: `₹${stats.totalRevenue.toLocaleString()}`,
              },
              { label: "Stock", value: product.stockQuantity },
              { label: "Reviews", value: productReviews.length },
            ].map((item, idx) => (
              <div
                key={idx}
                className="
                rounded-2xl
                border
                bg-slate-50/70
                p-3
                text-center
                hover:bg-white
                hover:shadow-md
                transition
              "
              >
                <p className="text-[10px] uppercase text-slate-400">
                  {item.label}
                </p>
                <p className="text-sm font-bold mt-1">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-2">
            <Button
              className="flex-1 rounded-xl"
              onClick={() => viewProduct(product)}
            >
              View Details
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="rounded-xl"
              onClick={() => editProduct(product)}
            >
              <Edit2 size={16} />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="rounded-xl text-red-600 hover:bg-red-50"
              onClick={() => deleteProduct(product._id)}
            >
              <Trash2 size={16} />
            </Button>
          </div>

          {/* Reviews */}
          {productReviews.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <button
                onClick={() => toggleRow(product._id)}
                className="text-sm font-medium flex items-center gap-2"
              >
                Reviews ({productReviews.length})
                {expandedRows[product._id] ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </button>

              {expandedRows[product._id] && (
                <div className="mt-3 space-y-3">
                  {productReviews.map((review, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border bg-slate-50"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">⭐ {review.rating}</span>
                        <span className="text-xs text-slate-500">
                          {review.userId?.email}
                        </span>
                      </div>
                      <p className="text-sm mt-2 text-slate-600">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProductTable = () => {
    return (
      <div className="overflow-x-auto rounded-2xl border shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                Product
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                Category
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                Price
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                Views
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                Wishlist
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                Ordered
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                Revenue
              </th>

              <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map((product) => {
              const productReviews = reviews.filter(
                (review) => review.productId?._id === product._id,
              );

              const avgRating =
                productReviews.length > 0
                  ? (
                      productReviews.reduce(
                        (sum, review) => sum + review.rating,
                        0,
                      ) / productReviews.length
                    ).toFixed(1)
                  : "0";
              const stats = getProductStats(product._id);

              return (
                <tr
                  key={product._id}
                  className="border-b hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images?.[0] || product.image}
                        alt={product.name}
                        className="w-12 h-12 object-contain rounded-lg bg-slate-100 p-1"
                      />
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.brand} • {product.model}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-sm">
                        ₹{product.price.toLocaleString()}
                      </p>
                      {product.originalPrice > product.price && (
                        <p className="text-xs line-through text-muted-foreground">
                          ₹{product.originalPrice.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 w-fit">
                      <Star size={14} fill="currentColor" />
                      <span className="text-sm font-medium">{avgRating}</span>
                      <span className="text-xs">({productReviews.length})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {product.inStock ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        In Stock
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">👁 {product.views || 0}</td>
                  <td className="px-6 py-4 text-sm">
                    ❤️ {stats.wishlistCount}
                  </td>
                  <td className="px-6 py-4 text-sm">📦 {stats.totalOrdered}</td>
                  <td className="px-6 py-4 text-sm">
                    ₹{stats.totalRevenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewProduct(product)}
                      >
                        View
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => editProduct(product)}
                      >
                        <Edit2 size={16} />
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteProduct(product._id)}
                        className="text-red-600"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="animate-fade-in mt-8 px-4 md:px-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 gap-4">
        <h2 className="text-2xl font-bold monospace">Manage Products</h2>

        <Button
          onClick={addProduct}
          disabled={addingProduct}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex gap-2"
        >
          {addingProduct ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus size={18} />
              Add Product
            </>
          )}
        </Button>
      </div>

      {/* Filters & Sorting */}
      <div className="mb-8 bg-white rounded-2xl sm:rounded-3xl border shadow-sm p-4 sm:p-6">
        <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Product Filters</h3>

            <p className="text-sm text-muted-foreground">
              Filter, search and sort products
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 w-full xl:w-auto">
            {/* Search */}
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-auto
          h-10
          px-4
          border
          rounded-xl
          bg-background
          min-w-55
          focus:outline-none
          focus:ring-2
          focus:ring-primary
        "
            />

            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 px-4 border rounded-xl bg-background"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>

            {/* Stock */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="h-10 px-4 border rounded-xl bg-background"
            >
              <option value="all">All Stock</option>
              <option value="instock">In Stock</option>
              <option value="outofstock">Out Of Stock</option>
            </select>

            {/* Sort */}
            <select
              value={`${sortConfig.key}-${sortConfig.direction}`}
              onChange={(e) => {
                const [key, direction] = e.target.value.split("-");

                setSortConfig({
                  key: key as any,
                  direction: direction as "asc" | "desc",
                });
              }}
              className="h-10 px-4 border rounded-xl bg-background"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="avgRating-desc">Highest Rated</option>
              <option value="reviewCount-desc">Most Reviews</option>
              <option value="views-desc">Most Viewed</option>
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

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
                setStockFilter("all");

                setSortConfig({
                  key: "createdAt",
                  direction: "desc",
                });
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-50 text-sm">
            Total Products:
            <span className="font-semibold ml-1">{products.length}</span>
          </div>

          <div className="px-4 py-2 rounded-xl bg-emerald-50 text-sm text-emerald-700">
            In Stock:
            <span className="font-semibold ml-1">
              {products.filter((p) => p.inStock).length}
            </span>
          </div>

          <div className="px-4 py-2 rounded-xl bg-red-50 text-sm text-red-700">
            Out Of Stock:
            <span className="font-semibold ml-1">
              {products.filter((p) => !p.inStock).length}
            </span>
          </div>

          <div className="px-4 py-2 rounded-xl bg-indigo-50 text-sm text-indigo-700">
            Showing:
            <span className="font-semibold ml-1">{sortedProducts.length}</span>
          </div>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-8">
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Package size={20} />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Total Products
            </span>
          </div>
          <p className="text-2xl font-bold">{analytics.totalProducts}</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign size={20} />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </span>
          </div>
          <p className="text-2xl font-bold">
            ₹{analytics.totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <ShoppingCart size={20} />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Total Orders
            </span>
          </div>
          <p className="text-2xl font-bold">{analytics.totalOrders}</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-pink-50 text-pink-600 rounded-xl">
              <Heart size={20} />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Most Wishlisted
            </span>
          </div>
          <p
            className="text-lg font-bold line-clamp-1"
            title={analytics.mostWishlisted}
          >
            {analytics.mostWishlisted}
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Eye size={20} />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Most Viewed
            </span>
          </div>
          <p
            className="text-lg font-bold line-clamp-1"
            title={analytics.mostViewed}
          >
            {analytics.mostViewed}
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Star size={20} fill="currentColor" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Avg Rating
            </span>
          </div>
          <p className="text-2xl font-bold">{analytics.avgRating}</p>
        </div>
      </div>

      {/* Products View */}
      {viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedProducts.map((product) => renderProductCard(product))}
        </div>
      ) : (
        renderProductTable()
      )}
    </div>
  );
}
