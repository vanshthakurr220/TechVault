import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Zap, Heart, Search } from "lucide-react";
import Swal from "sweetalert2";
import { useApp } from "@/contexts/AppContext";
import { navigate } from "wouter/use-browser-location";
import Loader from "@/components/Loader";

export default function AllProducts() {
  const {
    user,
    products,
    wishlistItems,
    addToCart,
    addToWishlist,
    removeFromWishlist,
  } = useApp();
  const [loading, setLoading] = useState(false);
  const [wishlistStatus, setWishlistStatus] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("featured");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200000);
  const [searchQuery, setSearchQuery] = useState("");

  const safeProducts = useMemo(() => {
    if (Array.isArray(products)) return products;
    return [];
  }, [products]);

  const categories = useMemo(
    () =>
      [...new Set(safeProducts.map((p) => p.category))].filter(Boolean).sort(),
    [safeProducts],
  );

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  useEffect(() => {
    if (!user?.email) {
      setWishlistStatus({});
      return;
    }

    const wishlistMap: { [key: string]: boolean } = {};

    wishlistItems.forEach((item: any) => {
      const productId = item.productId?._id || item.productId;
      if (productId) {
        wishlistMap[productId] = true;
      }
    });

    setWishlistStatus(wishlistMap);
  }, [wishlistItems, user?.email]);

  const handleAddToCart = async (productId: string) => {
    try {
      if (!user?.email) {
        Swal.fire({
          icon: "warning",
          title: "Login Required",
          text: "Please login first",
        });

        return;
      }

      await addToCart(productId, 1);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const toggleWishlist = async (
    e: React.MouseEvent,
    productId: string,
    productName: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (!user?.email) {
        Swal.fire({
          icon: "warning",
          title: "Login Required",
          text: "Please login first",
        });

        return;
      }

      const isCurrentlyInWishlist = wishlistStatus[productId];

      if (isCurrentlyInWishlist) {
        await removeFromWishlist(productId);

        setWishlistStatus((prev) => ({
          ...prev,
          [productId]: false,
        }));
      } else {
        await addToWishlist(productId);

        setWishlistStatus((prev) => ({
          ...prev,
          [productId]: true,
        }));
      }
    } catch (error) {
      console.error("Failed to add to wishlist: ", error);
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...safeProducts];

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.model.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) =>
        selectedCategories.includes(p.category),
      );
    }

    filtered = filtered.filter(
      (p) => p.price >= minPrice && p.price <= maxPrice,
    );

    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  }, [
    safeProducts,
    searchQuery,
    selectedCategories,
    sortBy,
    minPrice,
    maxPrice,
  ]);

  if (loading) {
    return <Loader text="Loading products..." variant="page" />;
  }

  const buyNow = async (product: any) => {
    try {
      if (!user?.email) {
        Swal.fire({
          icon: "warning",
          title: "Login Required",
          text: "Please login first",
        });

        return;
      }

      const buyNowItem = [
        {
          productId: {
            _id: product._id,
            name: product.name,
            images: product.images,
            price: product.price,
          },
          quantity: 1,
        },
      ];

      sessionStorage.setItem("buyNowItems", JSON.stringify(buyNowItem));

      navigate("/checkout?mode=buynow");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold monospace text-foreground mb-2">
            All Products
          </h1>
          <p className="text-muted-foreground">
            Browse our complete collection of tech components
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="md:col-span-1">
            <div className="bg-card text-card-foreground p-6 rounded-lg border border-border space-y-6 sticky top-24">
              {/* Search Bar */}
              <div>
                <h3 className="font-bold monospace text-sm mb-3">Search</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <h3 className="font-bold monospace text-sm mb-3">Categories</h3>

                <div className="space-y-3">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                          className="h-4 w-4 rounded border-gray-300 accent-primary"
                        />

                        <span className="text-sm group-hover:text-primary transition-colors">
                          {category}
                        </span>
                      </div>

                      <span className="text-xs text-muted-foreground">
                        {products.filter((p) => p.category === category).length}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="font-bold monospace text-sm mb-3">
                  Price Range
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">
                      Min: ₹{minPrice}
                    </label>

                    <input
                      type="range"
                      min="0"
                      max="50000"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground">
                      Max: ₹{maxPrice}
                    </label>

                    <input
                      type="range"
                      min="0"
                      max="50000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="font-bold monospace text-sm mb-3">Sort By</h3>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              <Button
                onClick={() => {
                  setSelectedCategories([]);
                  setSortBy("featured");
                  setMinPrice(0);
                  setMaxPrice(200000);
                  setSearchQuery("");
                }}
                variant="outline"
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3">
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredProducts.length} products
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-7">
              {filteredProducts.map((product, index) => {
                const productImage =
                  product.images?.[0] || product.image || "/placeholder.png";

                const discountPercentage =
                  product.originalPrice && product.originalPrice > product.price
                    ? Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100,
                      )
                    : 0;

                const isOutOfStock =
                  product.stockQuantity <= 0 || product.inStock === false;

                const isLowStock =
                  product.stockQuantity > 0 && product.stockQuantity <= 3;

                return (
                  <a
                    key={product._id}
                    href={`/product/${product._id}`}
                    className="
          group
          relative
          flex
          h-full
          flex-col
          overflow-hidden
          rounded-3xl
          border
          border-slate-200/80
          bg-white
          shadow-[0_8px_30px_rgba(15,23,42,0.06)]
          transition-all
          duration-500
          ease-out
          hover:-translate-y-2
          hover:border-primary/30
          hover:shadow-[0_24px_60px_rgba(15,23,42,0.15)]
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-primary
          focus-visible:ring-offset-2
        "
                    style={{
                      animation: `productCardEntrance 0.55s cubic-bezier(0.22, 1, 0.36, 1) ${
                        index * 70
                      }ms both`,
                    }}
                  >
                    {/* Animated top highlight */}
                    <div
                      className="
            pointer-events-none
            absolute
            inset-x-8
            top-0
            z-40
            h-px
            origin-left
            scale-x-0
            bg-linear-to-r
            from-transparent
            via-primary
            to-transparent
            transition-transform
            duration-500
            group-hover:scale-x-100
          "
                    />

                    {/* Product Image Area */}
                    <div
                      className="
            relative
            m-2
            h-60
            overflow-hidden
            rounded-[1.25rem]
            border
            border-slate-100
            bg-linear-to-br
            from-slate-50
            via-white
            to-slate-100/80
            sm:h-64
          "
                    >
                      {/* Decorative background */}
                      <div
                        className="
              pointer-events-none
              absolute
              -right-16
              -top-16
              h-40
              w-40
              rounded-full
              bg-primary/8
              blur-3xl
              transition-all
              duration-700
              group-hover:scale-150
              group-hover:bg-primary/12
            "
                      />

                      <div
                        className="
              pointer-events-none
              absolute
              -bottom-20
              -left-12
              h-40
              w-40
              rounded-full
              bg-blue-500/5
              blur-3xl
              transition-transform
              duration-700
              group-hover:scale-125
            "
                      />

                      {/* Wishlist */}
                      <button
                        type="button"
                        aria-label={
                          wishlistStatus[product._id]
                            ? `Remove ${product.name} from wishlist`
                            : `Add ${product.name} to wishlist`
                        }
                        onClick={(e) =>
                          toggleWishlist(e, product._id, product.name)
                        }
                        className={`
              absolute
              right-3
              top-3
              z-30
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              backdrop-blur-md
              transition-all
              duration-300
              hover:scale-110
              active:scale-90
              ${
                wishlistStatus[product._id]
                  ? "border-red-200 bg-red-50 text-red-500 shadow-[0_8px_24px_rgba(239,68,68,0.18)]"
                  : "border-white/80 bg-white/85 text-slate-500 shadow-lg hover:border-red-200 hover:bg-red-50 hover:text-red-500"
              }
            `}
                      >
                        <Heart
                          size={19}
                          className={`transition-all duration-300 ${
                            wishlistStatus[product._id]
                              ? "scale-110 fill-red-500 text-red-500"
                              : ""
                          }`}
                        />
                      </button>

                      {/* Badges */}
                      <div className="absolute left-3 top-3 z-30 flex flex-col items-start gap-2">
                        {discountPercentage > 0 && !isOutOfStock && (
                          <span
                            className="
                  rounded-full
                  bg-emerald-600
                  px-3
                  py-1.5
                  text-[10px]
                  font-extrabold
                  uppercase
                  tracking-wider
                  text-white
                  shadow-[0_8px_20px_rgba(5,150,105,0.25)]
                "
                          >
                            {discountPercentage}% off
                          </span>
                        )}

                        {isLowStock && (
                          <span
                            className="
                  rounded-full
                  border
                  border-orange-200
                  bg-orange-50/95
                  px-3
                  py-1.5
                  text-[10px]
                  font-bold
                  text-orange-700
                  shadow-sm
                  backdrop-blur-md
                "
                          >
                            Only {product.stockQuantity} left
                          </span>
                        )}
                      </div>

                      {/* Image */}
                      <div className="absolute inset-0 flex items-center justify-center p-7 sm:p-8">
                        <img
                          src={productImage}
                          alt={product.name}
                          loading="lazy"
                          className="
                relative
                z-10
                max-h-full
                max-w-full
                object-contain
                drop-shadow-[0_16px_18px_rgba(15,23,42,0.12)]
                transition-all
                duration-700
                ease-out
                group-hover:-translate-y-1
                group-hover:scale-110
                group-hover:drop-shadow-[0_22px_24px_rgba(15,23,42,0.18)]
              "
                        />
                      </div>

                      {/* Bottom image gradient */}
                      <div
                        className="
              pointer-events-none
              absolute
              inset-x-0
              bottom-0
              h-24
              bg-linear-to-t
              from-slate-900/5
              to-transparent
            "
                      />

                      {/* Out of stock overlay */}
                      {isOutOfStock && (
                        <div
                          className="
                absolute
                inset-0
                z-30
                flex
                items-center
                justify-center
                bg-white/70
                backdrop-blur-[3px]
              "
                        >
                          <span
                            className="
                  rounded-full
                  border
                  border-red-200
                  bg-red-600
                  px-5
                  py-2.5
                  text-xs
                  font-extrabold
                  uppercase
                  tracking-[0.14em]
                  text-white
                  shadow-[0_12px_30px_rgba(220,38,38,0.3)]
                "
                          >
                            Out of stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Information */}
                    <div className="flex flex-1 flex-col px-5 pb-5 pt-3">
                      {/* Brand and model */}
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span
                          className="
                max-w-[60%]
                truncate
                text-[11px]
                font-extrabold
                uppercase
                tracking-[0.14em]
                text-primary
              "
                        >
                          {product.brand}
                        </span>

                        <span
                          className="
                max-w-[40%]
                truncate
                rounded-full
                bg-slate-100
                px-2.5
                py-1
                text-[10px]
                font-semibold
                text-slate-500
              "
                        >
                          {product.model}
                        </span>
                      </div>

                      {/* Name */}
                      <h3
                        className="
              mb-3
              min-h-12
              line-clamp-2
              text-base
              font-bold
              leading-6
              text-slate-900
              transition-colors
              duration-300
              group-hover:text-primary
            "
                      >
                        {product.name}
                      </h3>

                      {/* Rating */}
                      <div className="mb-4 flex items-center gap-2">
                        <div
                          className="
                flex
                items-center
                gap-1
                rounded-full
                border
                border-amber-100
                bg-amber-50
                px-2.5
                py-1.5
              "
                        >
                          <Star
                            size={13}
                            className="fill-amber-400 text-amber-400"
                          />

                          <span className="text-xs font-bold text-slate-800">
                            {Number(product.rating || 0).toFixed(1)}
                          </span>
                        </div>

                        <span className="text-xs text-slate-500">
                          {product.reviews || 0}{" "}
                          {(product.reviews || 0) === 1 ? "review" : "reviews"}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="mb-5 flex flex-wrap items-end gap-x-2 gap-y-1">
                        <span className="text-2xl font-extrabold tracking-tight text-slate-950">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>

                        {product.originalPrice &&
                          product.originalPrice > product.price && (
                            <span className="pb-0.5 text-sm font-medium text-slate-400 line-through">
                              ₹{product.originalPrice.toLocaleString("en-IN")}
                            </span>
                          )}

                        {discountPercentage > 0 && (
                          <span className="pb-0.5 text-xs font-bold text-emerald-600">
                            Save ₹
                            {(
                              product.originalPrice! - product.price
                            ).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      {/* Low stock message */}
                      <div className="mb-4 min-h-5">
                        {isLowStock && (
                          <div className="flex items-center gap-2 text-xs font-semibold text-orange-600">
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
                            </span>
                            Selling fast — order soon
                          </div>
                        )}

                        {!isLowStock && !isOutOfStock && (
                          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            In stock and ready to dispatch
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-auto grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(product._id);
                          }}
                          disabled={isOutOfStock}
                          className="
                relative
                flex
                min-h-11
                items-center
                justify-center
                gap-2
                overflow-hidden
                rounded-xl
                bg-slate-950
                px-3
                text-xs
                font-bold
                text-white
                shadow-md
                transition-all
                duration-300
                before:absolute
                before:inset-0
                before:-translate-x-full
                before:bg-linear-to-r
                before:from-transparent
                before:via-white/15
                before:to-transparent
                before:transition-transform
                before:duration-700
                hover:-translate-y-0.5
                hover:bg-primary
                hover:shadow-lg
                hover:before:translate-x-full
                active:translate-y-0
                disabled:pointer-events-none
                disabled:opacity-45
              "
                        >
                          <ShoppingCart
                            size={15}
                            className="relative z-10 transition-transform duration-300 group-hover:scale-110"
                          />
                          <span className="relative z-10">
                            {isOutOfStock ? "Unavailable" : "Add to Cart"}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            buyNow(product);
                          }}
                          disabled={isOutOfStock}
                          className="
                relative
                flex
                min-h-11
                items-center
                justify-center
                gap-2
                overflow-hidden
                rounded-xl
                border
                border-primary/25
                bg-primary/5
                px-3
                text-xs
                font-bold
                text-primary
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-primary
                hover:bg-primary
                hover:text-white
                hover:shadow-lg
                active:translate-y-0
                disabled:pointer-events-none
                disabled:opacity-45
              "
                        >
                          <Zap
                            size={15}
                            className="transition-transform duration-300 group-hover:scale-110"
                          />
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
