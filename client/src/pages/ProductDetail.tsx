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
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Clock3,
  BadgeCheck,
  Send,
} from "lucide-react";
import Swal from "sweetalert2";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { useNotification } from "@/components/Notification";

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
    accessToken,
    user,
    reviews,
    productQuestions,
    getProductById,
    addToCart: addProductToCart,
    fetchProductReviews,
    submitReview: submitProductReview,
    fetchProductQuestions,
    askProductQuestion,
    voteProductAnswer,
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
  const [questionText, setQuestionText] = useState("");
  const [questionLoading, setQuestionLoading] = useState(true);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [votingQuestionId, setVotingQuestionId] = useState<string | null>(null);
  const notify = useNotification();

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

  useEffect(() => {
    if (!params?.id) return;

    fetchQuestions(params.id);
  }, [params?.id, accessToken]);

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

  const fetchQuestions = async (productId: string) => {
    try {
      setQuestionLoading(true);
      await fetchProductQuestions(productId);
    } catch (error) {
      console.error("Product question fetch error:", error);
    } finally {
      setQuestionLoading(false);
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

  const submitQuestion = async () => {
    if (!params?.id) return;

    if (!user?.email) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to ask a product question.",
      });
      return;
    }

    const cleanedQuestion = questionText.trim();

    if (!cleanedQuestion) {
      Swal.fire({
        icon: "warning",
        title: "Question Required",
        text: "Please enter your question.",
      });
      return;
    }

    if (cleanedQuestion.length < 5) {
      Swal.fire({
        icon: "warning",
        title: "Question Too Short",
        text: "Your question must contain at least 5 characters.",
      });
      return;
    }

    try {
      setSubmittingQuestion(true);

      await askProductQuestion(params.id, cleanedQuestion);

      setQuestionText("");
    } catch (error) {
      console.error("Submit product question error:", error);
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleQuestionVote = async (
    questionId: string,
    voteType: "like" | "dislike",
  ) => {
    if (!user?.email) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to vote on this answer.",
      });
      return;
    }

    try {
      setVotingQuestionId(questionId);

      await voteProductAnswer(questionId, voteType);
    } catch (error) {
      console.error("Question vote error:", error);
    } finally {
      setVotingQuestionId(null);
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

  const handleShare = async () => {
    if (!product) return;

    const productUrl = window.location.href;

    // Native sharing (Mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on TechVault`,
          url: productUrl,
        });
        return;
      } catch (error) {
        // User cancelled sharing
        return;
      }
    }
    const shareMessage = `🔥 Found this on TechVault and thought you might like it!

🛍️ ${product.name}
💰 Price: ₹${product.price.toLocaleString("en-IN")}

Take a look here:
${productUrl}`;

    const instagramMessage = `🔥 Found this on TechVault and thought you might like it!

🛍️ ${product.name}
💰 Price: ₹${product.price.toLocaleString("en-IN")}

🔗 ${productUrl}`;

    // Desktop
    Swal.fire({
      width: 520,
      padding: 0,
      showConfirmButton: false,
      showCloseButton: true,
      customClass: {
        popup: "techvault-share-popup",
        closeButton: "techvault-share-close",
      },

      html: `
    <div class="share-modal">
      <div class="share-header">
        <div class="share-header-icon">
          <svg
            width="23"
            height="23"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        </div>

        <div class="share-header-content">
          <h2>Share Product</h2>
          <p>Share this product with your friends and family.</p>
        </div>
      </div>

      <div class="share-product-preview">
        <div class="share-product-image-wrapper">
          <img
            src="${productImages[activeImageIndex] || product.image}"
            alt="${product.name}"
            class="share-product-image"
          />
        </div>

        <div class="share-product-content">
          <p class="share-product-name">${product.name}</p>
          <p class="share-product-price">
            ₹${product.price.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div class="share-options">
      
        <a
          href="https://wa.me/?text=${encodeURIComponent(shareMessage)}",
          )}"
          target="_blank"
          rel="noopener noreferrer"
          class="share-option"
        >
          <span class="share-option-icon whatsapp-icon">
            <svg
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.52 3.48A11.82 11.82 0 0 0 12.07 0C5.5 0 .16 5.34.16 11.91c0 2.1.55 4.15 1.59 5.96L.06 24l6.29-1.65a11.9 11.9 0 0 0 5.71 1.45h.01c6.57 0 11.91-5.34 11.91-11.91 0-3.18-1.23-6.17-3.46-8.41ZM12.07 21.8h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.73.98 1-3.64-.24-.37a9.83 9.83 0 0 1-1.51-5.27c0-5.46 4.44-9.9 9.91-9.9a9.84 9.84 0 0 1 7.01 2.9 9.84 9.84 0 0 1 2.9 7.01c-.01 5.45-4.45 9.88-9.94 9.88Zm5.43-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47a8.94 8.94 0 0 1-1.65-2.05c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.21 5.09 4.5.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z"/>
            </svg>
          </span>

          <span class="share-option-content">
            <span class="share-option-title">WhatsApp</span>
            <span class="share-option-description">Send to a contact</span>
          </span>

          <span class="share-option-arrow">›</span>
        </a>

        <a
          href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            productUrl,
          )}"
          target="_blank"
          rel="noopener noreferrer"
          class="share-option"
        >
          <span class="share-option-icon facebook-icon">
            <svg
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07Z"/>
            </svg>
          </span>

          <span class="share-option-content">
            <span class="share-option-title">Facebook</span>
            <span class="share-option-description">Share on Facebook</span>
          </span>

          <span class="share-option-arrow">›</span>
        </a>

        <button id="instagram-share-btn" class="share-option">
          <span class="share-option-icon instagram-icon">
            <svg
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="2" y="2" width="20" height="20" rx="5"></rect>
              <circle cx="12" cy="12" r="4"></circle>
              <circle cx="18" cy="6" r="1" fill="currentColor" stroke="none"></circle>
            </svg>
          </span>

          <span class="share-option-content">
            <span class="share-option-title">Instagram</span>
            <span class="share-option-description">Copy link and open Instagram</span>
          </span>

          <span class="share-option-arrow">›</span>
        </button>
      </div>

      <div class="share-link-section">
        <p class="share-link-label">Product link</p>

        <div class="share-link-box">
          <span class="share-link-text">${productUrl}</span>

          <button id="copy-link-btn" class="share-copy-button">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Copy</span>
          </button>
        </div>
      </div>
    </div>
  `,

      didOpen: () => {
        const copyButton = document.getElementById("copy-link-btn");
        const instagramButton = document.getElementById("instagram-share-btn");

        copyButton?.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(productUrl);

            const buttonText = copyButton.querySelector("span");

            if (buttonText) {
              buttonText.textContent = "Copied";
            }

            copyButton.classList.add("copied");

            notify.success("Product link copied!");

            window.setTimeout(() => {
              if (buttonText) {
                buttonText.textContent = "Copy";
              }

              copyButton.classList.remove("copied");
            }, 1800);
          } catch {
            notify.error("Unable to copy product link");
          }
        });

        instagramButton?.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(instagramMessage);

            window.open("https://www.instagram.com/", "_blank");

            Swal.close();
          } catch {}
        });
      },
    });
  };

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
              <div className="absolute top-6 right-6 z-30 flex flex-col gap-3">
                {/* Wishlist */}
                <button
                  onClick={toggleWishlist}
                  className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all hover:scale-110 border border-slate-100"
                >
                  <Heart
                    size={24}
                    className={cn(
                      isWishlisted
                        ? "fill-red-500 text-red-500"
                        : "text-slate-300 hover:text-red-500",
                    )}
                  />
                </button>

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all hover:scale-110 border border-slate-100"
                >
                  <Share2
                    size={22}
                    className="text-slate-500 hover:text-primary transition-colors"
                  />
                </button>
              </div>

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
        {/* Product Questions Section */}
        <div className="max-w-8xl mx-auto mt-16">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageCircle size={23} className="text-primary" />
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    Product Questions & Answers
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Ask about compatibility, specifications, warranty, or
                    product features.
                  </p>
                </div>
              </div>
            </div>

            <span className="self-start sm:self-auto bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-semibold">
              {productQuestions.length}{" "}
              {productQuestions.length === 1 ? "Question" : "Questions"}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ask Question Form */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm">
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-slate-900">
                    Have a question?
                  </h3>

                  <p className="text-sm text-slate-500 mt-2 leading-6">
                    Ask about this product and TechVault Support will respond
                    with an official answer.
                  </p>
                </div>

                {user?.email ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Your Question
                      </label>

                      <textarea
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="For example: Does this product support Windows 11?"
                        rows={6}
                        maxLength={1000}
                        className="w-full resize-none rounded-xl border border-slate-300 bg-white p-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />

                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-slate-500">
                          Please avoid sharing personal information.
                        </p>

                        <span className="text-xs text-slate-400">
                          {questionText.length}/1000
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={submitQuestion}
                      disabled={submittingQuestion || !questionText.trim()}
                      className="w-full h-12 rounded-xl font-semibold"
                    >
                      <Send size={18} className="mr-2" />

                      {submittingQuestion ? "Submitting..." : "Submit Question"}
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                    <p className="text-sm font-semibold text-amber-900">
                      Login required
                    </p>

                    <p className="text-sm text-amber-700 mt-1 leading-6">
                      Please login to ask a question about this product.
                    </p>

                    <Button
                      onClick={() => navigate("/login")}
                      className="w-full mt-4 h-11 rounded-xl"
                    >
                      Login to Ask
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Questions List */}
            <div className="lg:col-span-2">
              {questionLoading ? (
                <Loader text="Loading product questions..." variant="section" />
              ) : productQuestions.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl px-6 py-14 text-center">
                  <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <MessageCircle size={26} className="text-slate-500" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    No questions yet
                  </h3>

                  <p className="text-slate-500 text-sm mt-2">
                    Be the first customer to ask about this product.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {productQuestions.map((item) => {
                    const currentUserId = user?._id;

                    const hasLiked =
                      !!currentUserId &&
                      Array.isArray(item.likes) &&
                      item.likes.some((id) => id === currentUserId);

                    const hasDisliked =
                      !!currentUserId &&
                      Array.isArray(item.dislikes) &&
                      item.dislikes.some((id) => id === currentUserId);

                    return (
                      <div
                        key={item._id}
                        className={cn(
                          "bg-white border rounded-2xl overflow-hidden shadow-sm transition hover:shadow-md",
                          item.isPinned
                            ? "border-primary/40 ring-1 ring-primary/10"
                            : "border-slate-200",
                        )}
                      >
                        {/* Question */}
                        <div className="p-5 sm:p-6">
                          <div className="flex items-start gap-4">
                            <div className="shrink-0 w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                              Q
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                  Customer Question
                                </span>

                                {item.isPinned && (
                                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                                    Pinned
                                  </span>
                                )}
                              </div>

                              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-7 wrap-break-word">
                                {item.question}
                              </h3>

                              <p className="text-xs sm:text-sm text-slate-500 mt-3">
                                Asked by{" "}
                                <span className="font-semibold text-slate-700">
                                  {item.userId?.username || "Customer"}
                                </span>{" "}
                                •{" "}
                                {new Date(item.createdAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Answered */}
                        {item.status === "answered" && item.answer ? (
                          <div className="border-t border-slate-200 bg-emerald-50/50 p-5 sm:p-6">
                            <div className="flex items-start gap-4">
                              <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                <BadgeCheck size={21} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-slate-900">
                                    Official TechVault Response
                                  </p>

                                  <BadgeCheck
                                    size={19}
                                    className="fill-blue-500 text-white"
                                  />
                                </div>

                                <p className="text-slate-700 leading-7 mt-3 wrap-break-word">
                                  {item.answer}
                                </p>

                                {item.answeredAt && (
                                  <p className="text-xs text-slate-500 mt-3">
                                    Answered on{" "}
                                    {new Date(
                                      item.answeredAt,
                                    ).toLocaleDateString("en-IN", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </p>
                                )}

                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-5 pt-4 border-t border-emerald-200/70">
                                  <span className="text-sm font-medium text-slate-600">
                                    Was this answer helpful?
                                  </span>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleQuestionVote(item._id, "like")
                                      }
                                      disabled={votingQuestionId === item._id}
                                      className={cn(
                                        "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60",
                                        item.userVote === "like"
                                          ? "border-green-600 bg-green-600 text-white shadow-sm"
                                          : "border-slate-300 bg-white text-slate-700 hover:border-green-500 hover:text-green-600",
                                      )}
                                    >
                                      <ThumbsUp
                                        size={17}
                                        className={cn(
                                          "transition-all",
                                          item.userVote === "like" &&
                                            "fill-current",
                                        )}
                                      />

                                      {item.likesCount || 0}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleQuestionVote(item._id, "dislike")
                                      }
                                      disabled={votingQuestionId === item._id}
                                      className={cn(
                                        "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60",
                                        item.userVote === "dislike"
                                          ? "border-red-600 bg-red-600 text-white shadow-sm"
                                          : "border-slate-300 bg-white text-slate-700 hover:border-red-500 hover:text-red-600",
                                      )}
                                    >
                                      <ThumbsDown
                                        size={17}
                                        className={cn(
                                          "transition-all",
                                          item.userVote === "dislike" &&
                                            "fill-current",
                                        )}
                                      />

                                      {item.dislikesCount || 0}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Awaiting Answer */
                          <div className="border-t border-slate-200 bg-amber-50 p-5 sm:p-6">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 shrink-0 rounded-full bg-amber-100 flex items-center justify-center">
                                <Clock3 size={18} className="text-amber-700" />
                              </div>

                              <div>
                                <p className="font-semibold text-amber-900">
                                  Awaiting response from TechVault Support
                                </p>

                                <p className="text-sm text-amber-700 mt-1 leading-6">
                                  Our support team has received this question
                                  and will provide an official response soon.
                                </p>
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
        </div>
      </div>
    </div>
  );
}
