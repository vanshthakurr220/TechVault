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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => (
                <a
                  key={product._id}
                  href={`/product/${product._id}`}
                  className="
        product-card
        group
        overflow-hidden
        rounded-2xl
        border border-border/40
        bg-background
        hover:shadow-xl
        hover:-translate-y-1
        transition-all
        duration-300
      "
                  style={{
                    animation: `slideUp 0.4s ease-out ${index * 50}ms both`,
                  }}
                >
                  {/* Product Image */}
                  <div className="relative h-64 bg-white overflow-hidden rounded-t-2xl flex items-center justify-center p-5">
                    {/* Wishlist Heart Icon - Top Left */}
                    <button
                      onClick={(e) =>
                        toggleWishlist(e, product._id, product.name)
                      }
                      className="absolute top-3 left-3 z-30 p-2 rounded-full bg-white/80 hover:bg-white transition-all duration-200 shadow-md"
                    >
                      <Heart
                        size={20}
                        className={`transition-all duration-200 ${
                          wishlistStatus[product._id]
                            ? "fill-red-500 text-red-500"
                            : "text-gray-400 hover:text-red-500"
                        }`}
                      />
                    </button>

                    {/* Soft overlay */}
                    <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/2 z-10" />

                    <img
                      src={product.images?.[0] || product.image}
                      alt={product.name}
                      className="
    max-h-full
    max-w-full
    object-contain
    transition-all
    duration-500
    ease-out
    group-hover:scale-105
    relative
    z-20
  "
                    />

                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
                        <span className="text-white font-bold monospace">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-5">
                    <p className="text-xs text-muted-foreground monospace mb-1">
                      {product.brand}
                    </p>

                    <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200 min-h-10">
                      {product.name}
                    </h3>

                    <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                      {product.model}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={`${
                              i < Math.floor(product.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({product.reviews || 0})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-lg font-bold text-primary">
                        ₹{product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      {product.stockQuantity <= 0 && (
                        <div className="absolute top-3 right-3 z-30">
                          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {product.stockQuantity <= 3 &&
                      product.stockQuantity > 0 && (
                        <p className="mt-2 mb-2 text-xs font-bold text-orange-600 animate-pulse">
                          ⚠ Hurry! Only {product.stockQuantity} unit
                          {product.stockQuantity > 1 ? "s" : ""} left
                        </p>
                      )}
                    {/* Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product._id);
                        }}
                        disabled={product.stockQuantity <= 0}
                        className="flex-1 bg-primary text-primary-foreground py-2 px-3 rounded-md text-xs font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-1"
                      >
                        <ShoppingCart size={14} />
                        Add
                      </button>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          buyNow(product);
                        }}
                        disabled={product.stockQuantity <= 0}
                        className="flex-1 border border-primary text-primary py-2 px-3 rounded-md text-xs font-bold hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-1"
                      >
                        <Zap size={14} />
                        Buy
                      </button>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
