import { useEffect, useState } from "react";
import { navigate } from "wouter/use-browser-location";
import { useApp } from "@/contexts/AppContext";
import { useRoute } from "wouter";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import {
  Star,
  ShoppingCart,
  Check,
  X,
  Zap,
  Heart,
  ChevronLeft,
  ChevronRight,
  Truck,
  Shield,
  RotateCcw,
  Share2,
} from "lucide-react";
import Swal from "sweetalert2";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

interface Product {
  _id: string;
  name: string;
  category: string;
  model?: string;
  image: string;
  images: string[];
  price: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  inStock: boolean;
  stockQuantity: number;
  description: string;
  brand: string;
  views?: number;
  unitsSold?: number;
  revenue?: number;
  wishlistCount?: number;
  specifications?: Record<string, string>;
}

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const {
    user,
    reviews,
    getProductById,
    addToCart: addProductToCart,
    fetchProductReviews,
    submitReview: submitProductReview,
    incrementProductView,
    addToWishlist,
    removeFromWishlist,
    isProductInWishlist,
  } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const getRatingColor = (value: number) => {
    if (value <= 2) return "fill-red-500 text-red-500";
    if (value <= 4) return "fill-yellow-400 text-yellow-400";
    return "fill-green-500 text-green-500";
  };

  const fetchReviews = async (productId: string) => {
    try {
      setReviewLoading(true);
      await fetchProductReviews(productId);
    } catch (error) {
      console.error("Review fetch error:", error);
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    if (!params?.id) return;
    const loadProduct = async () => {
      setLoading(true);
      await fetchReviews(params.id);
      try {
        const data = await getProductById(params.id);
        setProduct(data as unknown as Product | null);
        await fetchProductReviews(params.id);

        // View tracking
        const viewKey = `viewed_product_${params.id}`;
        const lastViewed = localStorage.getItem(viewKey);
        const now = Date.now();
        if (!lastViewed || now - Number(lastViewed) > 24 * 60 * 60 * 1000) {
          await incrementProductView(params.id);
          localStorage.setItem(viewKey, now.toString());
        }
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [params?.id]);

  const submitReview = async () => {
    if (!params?.id) return;
    if (!comment.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Review Required",
        text: "Please write a review comment",
      });
      return;
    }
    try {
      setSubmittingReview(true);
      await submitProductReview(params.id, rating, comment);
      setComment("");
      setRating(5);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error.message || "Could not submit review",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const checkWishlist = async () => {
      if (!product?._id || !user?.email) return;
      try {
        const exists = await isProductInWishlist(product._id);
        setIsWishlisted(exists);
      } catch (error) {
        console.error("Wishlist check failed:", error);
      }
    };
    checkWishlist();
  }, [product?._id, user?.email]);

  const toggleWishlist = async () => {
    if (!product || !user?.email) {
      if (!user?.email)
        Swal.fire({
          icon: "warning",
          title: "Login Required",
          text: "Please login first",
        });
      return;
    }
    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id);
        setIsWishlisted(false);
      } else {
        await addToWishlist(product._id);
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    }
  };

  const buyNow = () => {
    if (!product || !user?.email) {
      if (!user?.email)
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
          image: product.images[0] || product.image,
          price: product.price,
        },
        quantity: quantity,
      },
    ];
    sessionStorage.setItem("buyNowItems", JSON.stringify(buyNowItem));
    navigate("/checkout?mode=buynow");
  };

  const addToCart = async () => {
    if (!product || !user?.email) {
      if (!user?.email)
        Swal.fire({
          icon: "warning",
          title: "Login Required",
          text: "Please login first",
        });
      return;
    }
    try {
      await addProductToCart(product._id, quantity);
    } catch (error) {
      console.log("Failed to add in cart: ", error);
    }
  };

  if (loading) {
    return <Loader text="Loading product..." variant="page" />;
  }

  if (!product)
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-slate-900">
            Product Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist.
          </p>
          <a
            href="/products"
            className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Back to Products
          </a>
        </div>
      </div>
    );

  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  const avgRating = product.rating || 0;
  const totalReviews = product.reviews || 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-slate-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <a
            href="/products"
            className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            ← Back to Products
          </a>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery Section */}
          <div className="space-y-4">
            {/* Main Image Viewer */}
            {/* Main Image Viewer */}
            <div className="relative bg-white rounded-2xl overflow-hidden h-96 md:h-125 flex items-center justify-center shadow-lg border border-slate-100 group">
              {/* Wishlist Button */}
              <button
                onClick={toggleWishlist}
                className="absolute top-6 right-6 z-30 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all hover:scale-110 border border-slate-100"
              >
                <Heart
                  size={24}
                  className={cn(
                    "transition-all",
                    isWishlisted
                      ? "fill-red-500 text-red-500"
                      : "text-slate-300 hover:text-red-500",
                  )}
                />
              </button>

              {/* Discount Badge */}
              {discount > 0 && (
                <div className="absolute top-6 left-6 bg-linear-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  Save {discount}%
                </div>
              )}

              {/* Main Product Image */}
              <img
                src={productImages[activeImageIndex]}
                alt={product.name}
                className="max-w-full max-h-full object-contain transition-all duration-500"
              />

              {/* Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === 0 ? productImages.length - 1 : prev - 1,
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/95 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 border border-slate-100"
                  >
                    <ChevronLeft size={24} className="text-slate-700" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === productImages.length - 1 ? 0 : prev + 1,
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/95 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 border border-slate-100"
                  >
                    <ChevronRight size={24} className="text-slate-700" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 p-4">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={cn(
                      "w-24 h-24 rounded-xl border-2 overflow-hidden shrink-0 transition-all hover:shadow-md",
                      activeImageIndex === idx
                        ? "border-primary shadow-md scale-105 ring-2 ring-primary/20"
                        : "border-slate-200 hover:border-slate-300",
                    )}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-contain bg-slate-50"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="space-y-8">
            {/* Header Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                  {product.category}
                </span>
                {product.brand && (
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {product.brand}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                {product.name}
              </h1>
              {product.model && (
                <p className="text-lg text-slate-500 font-medium">
                  Model: {product.model}
                </p>
              )}
            </div>

            {/* Rating Section */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={
                      i < Math.floor(avgRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-200"
                    }
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900">
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-sm text-slate-600">
                  ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
                </span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-3">
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-bold text-primary">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <div className="flex items-center gap-2">
                      <span className="line-through text-2xl text-slate-400">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                      <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                        {discount}% OFF
                      </span>
                    </div>
                  )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="space-y-2">
              {product.stockQuantity > 0 ? (
                <>
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-semibold">
                    <Check size={18} />
                    <span>In Stock</span>
                  </div>

                  {product.stockQuantity > 0 && product.stockQuantity <= 3 && (
                    <div
                      className={cn(
                        "animate-pulse text-sm font-semibold",
                        product.stockQuantity === 1
                          ? "text-red-600"
                          : "text-orange-600",
                      )}
                    >
                      ⚡ Hurry! Only {product.stockQuantity} left in stock
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg font-semibold">
                  <X size={18} />
                  <span>Out of Stock</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-slate-700">
                Quantity:
              </span>
              <div className="flex items-center border border-slate-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  −
                </button>

                <input
                  type="text"
                  value={quantity}
                  readOnly
                  className="w-16 text-center border-l border-r border-slate-300 py-2 font-semibold bg-white"
                />

                <button
                  onClick={() => {
                    if (quantity >= product.stockQuantity) {
                      toast.error(
                        `Only ${product.stockQuantity} units available`,
                      );
                      return;
                    }

                    setQuantity(quantity + 1);
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <Button
                onClick={addToCart}
                disabled={product.stockQuantity <= 0}
                className="h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <ShoppingCart size={20} className="mr-2" />
                Add to Cart
              </Button>
              <Button
                onClick={buyNow}
                disabled={product.stockQuantity <= 0}
                variant="outline"
                className="h-14 text-lg font-bold rounded-xl border-2 hover:bg-slate-50 transition-all"
              >
                <Zap size={20} className="mr-2" />
                Buy Now
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <Truck size={24} className="text-blue-600" />
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  Free Shipping
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                  <Shield size={24} className="text-green-600" />
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  Secure Payment
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                  <RotateCcw size={24} className="text-purple-600" />
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  Easy Returns
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Specifications Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Description */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-md border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              About This Product
            </h2>

            <p className="text-slate-600 text-lg leading-8 text-justify">
              {product.description}
            </p>
          </div>

          {/* Brand Info */}
          <div className="bg-linear-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-lg">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-3 opacity-80">
              Brand
            </h3>
            <p className="text-4xl font-bold mb-4">{product.brand}</p>
            <p className="text-sm opacity-90">
              Trusted by thousands of customers worldwide
            </p>
          </div>
        </div>

        {/* Specifications Section */}
        {product.specifications &&
          Object.keys(product.specifications).length > 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-md border border-slate-100 mb-16">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Specifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between items-start pb-4 border-b border-slate-100 last:border-b-0"
                  >
                    <span className="font-semibold text-slate-700 capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-slate-600 text-right max-w-xs">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Reviews Section */}
        <div className="max-w-8xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-900">
              Customer Reviews
            </h2>
            <span className="bg-primary text-white px-4 py-2 rounded-full font-semibold text-sm">
              {reviews.length} Reviews
            </span>
          </div>

          {/* Review Submission Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT SIDE - REVIEW FORM */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-2xl p-8 shadow-md border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6">
                  Share Your Feedback
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Rating
                    </label>

                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            size={32}
                            className={cn(
                              "transition-all",
                              star <= rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300",
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Your Review
                    </label>

                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                      className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      rows={6}
                    />
                  </div>

                  <Button
                    onClick={submitReview}
                    disabled={submittingReview}
                    className="w-full h-12 font-semibold rounded-lg"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - REVIEWS */}
            <div className="lg:col-span-2">
              {reviewLoading ? (
                <Loader text="Loading reviews..." variant="section" />
              ) : reviews.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
                  <p className="text-slate-600 text-lg font-medium">
                    No reviews yet. Be the first to share your thoughts!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center font-bold text-white text-lg">
                            {review.userEmail.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <h4 className="font-bold text-slate-900">
                              {review.userEmail.split("@")[0]}
                            </h4>

                            <p className="text-xs text-slate-500">
                              {new Date(review.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={
                                i < review.rating
                                  ? getRatingColor(review.rating)
                                  : "text-slate-200"
                              }
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-slate-700 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
