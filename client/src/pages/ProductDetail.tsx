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

  const notify = useNotification();
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

  useEffect(() => {
    if (window.location.hash !== "#product-questions") return;

    const timer = setTimeout(() => {
      document.getElementById("product-questions")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [product, productQuestions]);

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
    <div className="relative min-h-screen overflow-hidden bg-[#f8fafc]">
      {/* Decorative page background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-160 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-125 w-125 rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute -right-40 top-28 h-115 w-115 rounded-full bg-blue-500/8 blur-[120px]" />
        <div className="absolute left-1/2 top-0 h-75 w-75 -translate-x-1/2 rounded-full bg-viylet-500/5 blur-[100px]" />
      </div>

      {/* Breadcrumb */}
      <div className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto flex min-h-16 items-center px-4">
          <a
            href="/products"
            className="
          group
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          border-slate-200
          bg-white
          px-4
          py-2
          text-sm
          font-semibold
          text-slate-700
          shadow-sm
          transition-all
          duration-300
          hover:-translate-x-1
          hover:border-primary/30
          hover:text-primary
          hover:shadow-md
        "
          >
            <ChevronLeft
              size={17}
              className="transition-transform duration-300 group-hover:-translate-x-0.5"
            />
            Back to Products
          </a>
        </div>
      </div>

      <main className="relative z-10">
        <div className="container mx-auto px-4 py-6 sm:py-10 lg:py-14">
          {/* Main Product Hero */}
          <section
            className="
          overflow-hidden
          rounded-[1.75rem]
          border
          border-white/80
          bg-white/80
          shadow-[0_30px_100px_rgba(15,23,42,0.10)]
          backdrop-blur-xl
          lg:rounded-[2.25rem]
        "
            style={{
              animation:
                "productHeroEntrance 0.7s cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
              {/* Image Gallery */}
              <div className="relative border-b border-slate-200/70 bg-linear-to-br from-slate-50 via-white to-slate-100/80 p-3 sm:p-5 lg:border-b-0 lg:border-r lg:p-7">
                <div className="lg:sticky lg:top-24">
                  {/* Main image viewer */}
                  <div
                    className="
                  group/image
                  relative
                  flex
                  h-90
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-[1.5rem]
                  border
                  border-white
                  bg-white
                  p-8
                  shadow-[0_20px_60px_rgba(15,23,42,0.08)]
                  sm:h-120
                  sm:p-12
                  lg:h-145
                "
                  >
                    {/* Image background effects */}
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_55%)]" />

                    <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/7 blur-3xl transition-transform duration-1000 group-hover/image:scale-125" />

                    <div className="pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-violet-500/7 blur-3xl transition-transform duration-1000 group-hover/image:scale-125" />

                    {/* Discount badge */}
                    {discount > 0 && (
                      <div
                        className="
                      absolute
                      left-4
                      top-4
                      z-30
                      overflow-hidden
                      rounded-full
                      bg-slate-950
                      px-4
                      py-2
                      text-xs
                      font-extrabold
                      uppercase
                      tracking-wider
                      text-white
                      shadow-[0_10px_30px_rgba(15,23,42,0.25)]
                      sm:left-6
                      sm:top-6
                    "
                      >
                        Save {discount}%
                      </div>
                    )}

                    {/* Wishlist and share */}
                    <div className="absolute right-4 top-4 z-30 flex flex-col gap-2.5 sm:right-6 sm:top-6">
                      <button
                        type="button"
                        onClick={toggleWishlist}
                        aria-label={
                          isWishlisted
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                        className={cn(
                          `
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-full
                        border
                        shadow-lg
                        backdrop-blur-xl
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:scale-110
                        active:scale-90
                        sm:h-12
                        sm:w-12
                      `,
                          isWishlisted
                            ? "border-red-200 bg-red-50/95 text-red-500 shadow-red-500/15"
                            : "border-white/80 bg-white/90 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-500",
                        )}
                      >
                        <Heart
                          size={21}
                          className={cn(
                            "transition-all duration-300",
                            isWishlisted &&
                              "scale-110 fill-red-500 text-red-500",
                          )}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={handleShare}
                        aria-label="Share product"
                        className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/80
                      bg-white/90
                      text-slate-500
                      shadow-lg
                      backdrop-blur-xl
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:scale-110
                      hover:border-primary/20
                      hover:bg-primary
                      hover:text-white
                      active:scale-90
                      sm:h-12
                      sm:w-12
                    "
                      >
                        <Share2 size={20} />
                      </button>
                    </div>

                    {/* Main product image */}
                    <img
                      key={activeImageIndex}
                      src={productImages[activeImageIndex]}
                      alt={product.name}
                      className="
                    relative
                    z-10
                    max-h-full
                    max-w-full
                    object-contain
                    drop-shadow-[0_25px_30px_rgba(15,23,42,0.15)]
                    transition-transform
                    duration-700
                    ease-out
                    group-hover/image:scale-[1.04]
                  "
                      style={{
                        animation:
                          "productImageEntrance 0.45s cubic-bezier(0.22,1,0.36,1) both",
                      }}
                    />

                    {/* Navigation arrows */}
                    {productImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          aria-label="Previous product image"
                          onClick={() =>
                            setActiveImageIndex((prev) =>
                              prev === 0 ? productImages.length - 1 : prev - 1,
                            )
                          }
                          className="
                        absolute
                        left-3
                        top-1/2
                        z-30
                        flex
                        h-11
                        w-11
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white
                        bg-white/90
                        text-slate-700
                        shadow-lg
                        backdrop-blur-xl
                        transition-all
                        duration-300
                        hover:-translate-x-1
                        hover:-translate-y-1/2
                        hover:bg-slate-950
                        hover:text-white
                        active:scale-90
                        sm:left-5
                        lg:opacity-0
                        lg:group-hover/image:opacity-100
                      "
                        >
                          <ChevronLeft size={22} />
                        </button>

                        <button
                          type="button"
                          aria-label="Next product image"
                          onClick={() =>
                            setActiveImageIndex((prev) =>
                              prev === productImages.length - 1 ? 0 : prev + 1,
                            )
                          }
                          className="
                        absolute
                        right-3
                        top-1/2
                        z-30
                        flex
                        h-11
                        w-11
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white
                        bg-white/90
                        text-slate-700
                        shadow-lg
                        backdrop-blur-xl
                        transition-all
                        duration-300
                        hover:translate-x-1
                        hover:-translate-y-1/2
                        hover:bg-slate-950
                        hover:text-white
                        active:scale-90
                        sm:right-5
                        lg:opacity-0
                        lg:group-hover/image:opacity-100
                      "
                        >
                          <ChevronRight size={22} />
                        </button>
                      </>
                    )}

                    {/* Image counter */}
                    {productImages.length > 1 && (
                      <div
                        className="
                      absolute
                      bottom-4
                      left-1/2
                      z-30
                      -translate-x-1/2
                      rounded-full
                      border
                      border-white/80
                      bg-slate-950/75
                      px-3.5
                      py-1.5
                      text-xs
                      font-bold
                      text-white
                      shadow-lg
                      backdrop-blur-xl
                    "
                      >
                        {activeImageIndex + 1} / {productImages.length}
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {productImages.length > 1 && (
                    <div className="mt-4 flex gap-3 overflow-x-auto px-1 pb-2 pt-1 sm:mt-5">
                      {productImages.map((img, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          aria-label={`View product image ${idx + 1}`}
                          className={cn(
                            `
                          relative
                          h-20
                          w-20
                          shrink-0
                          overflow-hidden
                          rounded-2xl
                          border
                          bg-white
                          p-2
                          shadow-sm
                          transition-all
                          duration-300
                          hover:-translate-y-1
                          hover:shadow-md
                          sm:h-24
                          sm:w-24
                        `,
                            activeImageIndex === idx
                              ? "border-primary ring-4 ring-primary/10 shadow-md"
                              : "border-slate-200 hover:border-primary/30",
                          )}
                        >
                          <img
                            src={img}
                            alt={`${product.name} ${idx + 1}`}
                            className={cn(
                              "h-full w-full object-contain transition-transform duration-300",
                              activeImageIndex === idx
                                ? "scale-105"
                                : "hover:scale-105",
                            )}
                          />

                          {activeImageIndex === idx && (
                            <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Purchase Information */}
              <div className="relative flex flex-col p-5 sm:p-8 lg:p-10 xl:p-12">
                {/* Top badges */}
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <span
                    className="
                  rounded-full
                  border
                  border-primary/15
                  bg-primary/8
                  px-3.5
                  py-1.5
                  text-[11px]
                  font-extrabold
                  uppercase
                  tracking-[0.16em]
                  text-primary
                "
                  >
                    {product.category}
                  </span>

                  {product.brand && (
                    <span
                      className="
                    rounded-full
                    border
                    border-slate-200
                    bg-slate-50
                    px-3.5
                    py-1.5
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-slate-600
                  "
                    >
                      {product.brand}
                    </span>
                  )}
                </div>

                {/* Product title */}
                <div
                  style={{
                    animation:
                      "productContentEntrance 0.65s cubic-bezier(0.22,1,0.36,1) 100ms both",
                  }}
                >
                  <h1 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-[2.75rem] xl:text-5xl">
                    {product.name}
                  </h1>

                  {product.model && (
                    <p className="mt-3 text-sm font-medium text-slate-500 sm:text-base">
                      Model:{" "}
                      <span className="font-bold text-slate-700">
                        {product.model}
                      </span>
                    </p>
                  )}
                </div>

                {/* Rating */}
                <div className="mt-6 flex flex-wrap items-center gap-3 border-b border-slate-200/80 pb-6">
                  <div
                    className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-amber-200/80
                  bg-amber-50
                  px-3
                  py-2
                "
                  >
                    <Star size={17} className="fill-amber-400 text-amber-400" />

                    <span className="text-sm font-extrabold text-slate-900">
                      {avgRating.toFixed(1)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={17}
                        className={
                          i < Math.floor(avgRating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }
                      />
                    ))}
                  </div>

                  <span className="text-sm font-medium text-slate-500">
                    {totalReviews}{" "}
                    {totalReviews === 1
                      ? "verified review"
                      : "verified reviews"}
                  </span>
                </div>

                {/* Pricing */}
                <div className="py-7">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                    Current price
                  </p>

                  <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
                    <span className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>

                    {product.originalPrice &&
                      product.originalPrice > product.price && (
                        <span className="pb-1 text-lg font-semibold text-slate-400 line-through sm:text-xl">
                          ₹{product.originalPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                  </div>

                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700">
                          {discount}% OFF
                        </span>

                        <span className="text-sm font-semibold text-emerald-600">
                          You save ₹
                          {(
                            product.originalPrice - product.price
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                </div>

                {/* Stock section */}
                <div
                  className={cn(
                    `
                  rounded-2xl
                  border
                  p-4
                  transition-all
                  duration-300
                  sm:p-5
                `,
                    product.stockQuantity > 0
                      ? "border-emerald-200/80 bg-emerald-50/70"
                      : "border-red-200/80 bg-red-50/70",
                  )}
                >
                  {product.stockQuantity > 0 ? (
                    <div className="flex items-start gap-3">
                      <span className="relative mt-1 flex h-3 w-3 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                      </span>

                      <div>
                        <p className="font-extrabold text-emerald-900">
                          In stock and ready to dispatch
                        </p>

                        {product.stockQuantity <= 3 ? (
                          <p
                            className={cn(
                              "mt-1 text-sm font-semibold",
                              product.stockQuantity === 1
                                ? "text-red-600"
                                : "text-orange-600",
                            )}
                          >
                            Selling fast — only {product.stockQuantity}{" "}
                            {product.stockQuantity === 1 ? "unit" : "units"}{" "}
                            left
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-emerald-700">
                            Order now for fast and secure delivery.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                        <X size={17} className="text-red-600" />
                      </div>

                      <div>
                        <p className="font-extrabold text-red-900">
                          Currently out of stock
                        </p>
                        <p className="mt-1 text-sm text-red-700">
                          This product is temporarily unavailable.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-extrabold text-slate-800">
                      Select quantity
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Choose how many units you need.
                    </p>
                  </div>

                  <div className="inline-flex w-fit items-center rounded-2xl border border-slate-200 bg-slate-50 p-1.5 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-white
                    text-lg
                    font-bold
                    text-slate-700
                    shadow-sm
                    transition-all
                    hover:bg-slate-950
                    hover:text-white
                    active:scale-90
                  "
                    >
                      −
                    </button>

                    <input
                      type="text"
                      value={quantity}
                      readOnly
                      aria-label="Selected quantity"
                      className="h-10 w-14 border-0 bg-transparent text-center text-base font-extrabold text-slate-900 outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        if (product.stockQuantity <= 1) {
                          notify.info(
                            "Only 1 quantity is available for this product.",
                          );
                          return;
                        }

                        if (quantity >= product.stockQuantity) {
                          notify.error(
                            `Only ${product.stockQuantity} quantities are available.`,
                          );
                          return;
                        }

                        setQuantity((prev) => prev + 1);
                      }}
                      className="
    flex
    h-10
    w-10
    items-center
    justify-center
    rounded-xl
    bg-white
    text-lg
    font-bold
    text-slate-700
    shadow-sm
    transition-all
    hover:bg-slate-950
    hover:text-white
    active:scale-90
    disabled:cursor-not-allowed
    disabled:bg-slate-100
    disabled:text-slate-300
    disabled:shadow-none
  "
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button
                    onClick={addToCart}
                    disabled={product.stockQuantity <= 0}
                    className="
                  group/cart
                  relative
                  h-14
                  overflow-hidden
                  rounded-2xl
                  bg-slate-950
                  text-base
                  font-extrabold
                  text-white
                  shadow-[0_14px_35px_rgba(15,23,42,0.22)]
                  transition-all
                  duration-300
                  before:absolute
                  before:inset-0
                  before:-translate-x-full
                  before:bg-linear-to-r
                  before:from-transparent
                  before:via-white/20
                  before:to-transparent
                  before:transition-transform
                  before:duration-700
                  hover:-translate-y-1
                  hover:bg-primary
                  hover:shadow-[0_18px_40px_rgba(37,99,235,0.25)]
                  hover:before:translate-x-full
                  disabled:translate-y-0
                "
                  >
                    <ShoppingCart
                      size={20}
                      className="relative z-10 mr-2 transition-transform duration-300 group-hover/cart:scale-110"
                    />
                    <span className="relative z-10">Add to Cart</span>
                  </Button>

                  <Button
                    onClick={buyNow}
                    disabled={product.stockQuantity <= 0}
                    variant="outline"
                    className="
                  group/buy
                  h-14
                  rounded-2xl
                  border-2
                  border-primary/20
                  bg-primary/5
                  text-base
                  font-extrabold
                  text-primary
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-primary
                  hover:bg-primary
                  hover:text-white
                  hover:shadow-[0_18px_40px_rgba(37,99,235,0.20)]
                  disabled:translate-y-0
                "
                  >
                    <Zap
                      size={20}
                      className="mr-2 transition-transform duration-300 group-hover/buy:scale-110"
                    />
                    Buy Now
                  </Button>
                </div>

                {/* Trust features */}
                <div className="mt-8 grid grid-cols-1 gap-3 border-t border-slate-200/80 pt-7 sm:grid-cols-3">
                  <div className="group/trust flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition-transform duration-300 group-hover/trust:scale-110">
                      <Truck size={20} />
                    </div>

                    <div>
                      <p className="text-xs font-extrabold text-slate-800">
                        Free Shipping
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        Selected orders
                      </p>
                    </div>
                  </div>

                  <div className="group/trust flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:bg-emerald-50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition-transform duration-300 group-hover/trust:scale-110">
                      <Shield size={20} />
                    </div>

                    <div>
                      <p className="text-xs font-extrabold text-slate-800">
                        Secure Payment
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        Protected checkout
                      </p>
                    </div>
                  </div>

                  <div className="group/trust flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:bg-violet-50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition-transform duration-300 group-hover/trust:scale-110">
                      <RotateCcw size={20} />
                    </div>

                    <div>
                      <p className="text-xs font-extrabold text-slate-800">
                        Easy Returns
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        Hassle-free support
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Product Details Overview */}
          <section className="mt-10 space-y-8 sm:mt-12 lg:mt-16">
            <div
              className="
      grid
      grid-cols-1
      gap-6
      lg:grid-cols-[1.65fr_0.85fr]
      lg:gap-8
    "
            >
              {/* Description */}
              <div
                className="
        group/description
        relative
        overflow-hidden
        rounded-[1.75rem]
        border
        border-slate-200/80
        bg-white
        p-6
        shadow-[0_18px_55px_rgba(15,23,42,0.07)]
        transition-all
        duration-500
        hover:-translate-y-1
        hover:border-primary/20
        hover:shadow-[0_24px_65px_rgba(15,23,42,0.11)]
        sm:p-8
        lg:p-10
      "
                style={{
                  animation:
                    "productSectionEntrance 0.65s cubic-bezier(0.22,1,0.36,1) both",
                }}
              >
                {/* Decorative background */}
                <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/6 blur-3xl transition-transform duration-700 group-hover/description:scale-125" />

                <div className="relative z-10">
                  <div className="mb-6 flex items-start gap-4">
                    <div
                      className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              border
              border-primary/10
              bg-primary/8
              text-primary
              shadow-sm
            "
                    >
                      <MessageCircle size={22} />
                    </div>

                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
                        Product overview
                      </p>

                      <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                        About This Product
                      </h2>

                      <p className="mt-2 text-sm text-slate-500">
                        Everything you should know before making your purchase.
                      </p>
                    </div>
                  </div>

                  <div
                    className="
            rounded-2xl
            border
            border-slate-100
            bg-slate-50/70
            p-5
            sm:p-6
          "
                  >
                    <p className="text-base leading-8 text-slate-700 sm:text-lg sm:leading-9">
                      {product.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Brand card */}
              <div
                className="
        group/brand
        relative
        overflow-hidden
        rounded-[1.75rem]
        border
        border-slate-800
        bg-linear-to-br
        from-slate-950
        via-slate-900
        to-slate-800
        p-6
        text-white
        shadow-[0_24px_70px_rgba(15,23,42,0.25)]
        transition-all
        duration-500
        hover:-translate-y-1
        hover:shadow-[0_30px_80px_rgba(15,23,42,0.32)]
        sm:p-8
        lg:p-9
      "
                style={{
                  animation:
                    "productSectionEntrance 0.65s cubic-bezier(0.22,1,0.36,1) 100ms both",
                }}
              >
                {/* Decorative effects */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl transition-transform duration-700 group-hover/brand:scale-125" />

                <div className="pointer-events-none absolute -bottom-20 -left-14 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl transition-transform duration-700 group-hover/brand:scale-125" />

                <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:28px_28px]" />

                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className="
              rounded-full
              border
              border-white/15
              bg-white/10
              px-3
              py-1.5
              text-[10px]
              font-extrabold
              uppercase
              tracking-[0.18em]
              text-white/80
              backdrop-blur-md
            "
                    >
                      Featured brand
                    </span>

                    <BadgeCheck
                      size={24}
                      className="fill-blue-500 text-white drop-shadow-md"
                    />
                  </div>

                  <div className="my-auto py-10">
                    <p className="text-sm font-bold uppercase tracking-[0.15em] text-white/55">
                      Manufactured by
                    </p>

                    <h3 className="mt-3 break-words text-4xl font-black tracking-tight sm:text-5xl">
                      {product.brand}
                    </h3>

                    {product.model && (
                      <p className="mt-4 text-sm font-semibold text-white/65">
                        Model: {product.model}
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-md">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                        <Shield size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-white">
                          Trusted product quality
                        </p>

                        <p className="mt-1 text-xs leading-5 text-white/60">
                          Carefully selected and quality checked for TechVault
                          customers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications */}
            {product.specifications &&
              Object.keys(product.specifications).length > 0 && (
                <div
                  className="
          relative
          overflow-hidden
          rounded-[1.75rem]
          border
          border-slate-200/80
          bg-white
          p-6
          shadow-[0_18px_55px_rgba(15,23,42,0.07)]
          sm:p-8
          lg:p-10
        "
                  style={{
                    animation:
                      "productSectionEntrance 0.65s cubic-bezier(0.22,1,0.36,1) 180ms both",
                  }}
                >
                  <div className="pointer-events-none absolute right-0 top-0 h-60 w-60 rounded-full bg-blue-500/5 blur-3xl" />

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
                          Technical details
                        </p>

                        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                          Product Specifications
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                          Detailed hardware, compatibility, and product
                          information.
                        </p>
                      </div>

                      <span
                        className="
                w-fit
                rounded-full
                border
                border-slate-200
                bg-slate-50
                px-4
                py-2
                text-xs
                font-bold
                text-slate-600
              "
                      >
                        {Object.keys(product.specifications).length}{" "}
                        specifications
                      </span>
                    </div>

                    {/* Specification cards */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4">
                      {Object.entries(product.specifications).map(
                        ([key, value], index) => (
                          <div
                            key={key}
                            className="
                    group/spec
                    relative
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50/75
                    p-4
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-primary/25
                    hover:bg-white
                    hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)]
                    sm:p-5
                  "
                            style={{
                              animation: `specificationEntrance 0.45s cubic-bezier(0.22,1,0.36,1) ${
                                index * 55
                              }ms both`,
                            }}
                          >
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-linear-to-r from-transparent via-primary to-transparent transition-transform duration-500 group-hover/spec:scale-x-100" />

                            <div className="flex items-start justify-between gap-5">
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-slate-400">
                                  {key
                                    .replace(/([a-z])([A-Z])/g, "$1 $2")
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (char) =>
                                      char.toUpperCase(),
                                    )}
                                </p>

                                <p className="mt-2 break-words text-sm font-bold leading-6 text-slate-900 sm:text-base">
                                  {String(value)}
                                </p>
                              </div>

                              <div
                                className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        text-xs
                        font-extrabold
                        text-slate-400
                        shadow-sm
                        transition-all
                        duration-300
                        group-hover/spec:border-primary/20
                        group-hover/spec:bg-primary
                        group-hover/spec:text-white
                      "
                              >
                                {String(index + 1).padStart(2, "0")}
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )}
          </section>

          {/* Reviews Section */}
          <section
            className="mt-10 sm:mt-12 lg:mt-16"
            style={{
              animation:
                "productSectionEntrance 0.65s cubic-bezier(0.22,1,0.36,1) 220ms both",
            }}
          >
            {/* Header */}
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
                  Customer feedback
                </p>

                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                  Customer Reviews
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Read genuine experiences from customers who purchased this
                  product.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2">
                  <Star size={16} className="fill-amber-400 text-amber-400" />

                  <span className="text-sm font-extrabold text-slate-900">
                    {avgRating.toFixed(1)}
                  </span>
                </div>

                <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm">
                  {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-7 lg:grid-cols-[0.8fr_1.4fr] lg:gap-8">
              {/* Review form */}
              <div>
                <div
                  className="
          sticky
          top-24
          overflow-hidden
          rounded-[1.75rem]
          border
          border-slate-200/80
          bg-white
          p-6
          shadow-[0_18px_55px_rgba(15,23,42,0.07)]
          sm:p-8
        "
                >
                  <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/7 blur-3xl" />

                  <div className="relative z-10">
                    <div className="mb-6">
                      <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-primary">
                        Share your experience
                      </p>

                      <h3 className="mt-1 text-xl font-extrabold text-slate-950 sm:text-2xl">
                        Write a Review
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Tell other customers what you liked or disliked about
                        this product.
                      </p>
                    </div>

                    <div className="space-y-5">
                      {/* Rating selector */}
                      <div>
                        <label className="mb-3 block text-sm font-bold text-slate-800">
                          Your rating
                        </label>

                        <div className="flex flex-wrap gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setRating(star)}
                              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                              className={cn(
                                `
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:scale-105
                        active:scale-90
                      `,
                                star <= rating
                                  ? "border-amber-200 bg-amber-50 shadow-[0_8px_20px_rgba(245,158,11,0.14)]"
                                  : "border-slate-200 bg-slate-50 hover:border-amber-200 hover:bg-amber-50",
                              )}
                            >
                              <Star
                                size={24}
                                className={cn(
                                  "transition-all duration-300",
                                  star <= rating
                                    ? "scale-110 fill-amber-400 text-amber-400"
                                    : "text-slate-300",
                                )}
                              />
                            </button>
                          ))}
                        </div>

                        <p className="mt-3 text-xs font-semibold text-slate-500">
                          Selected rating:{" "}
                          <span className="text-slate-900">
                            {rating} out of 5
                          </span>
                        </p>
                      </div>

                      {/* Review input */}
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <label className="text-sm font-bold text-slate-800">
                            Your review
                          </label>

                          <span className="text-xs font-medium text-slate-400">
                            {comment.length} characters
                          </span>
                        </div>

                        <div className="relative">
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience with this product..."
                            rows={7}
                            className="
                    w-full
                    resize-none
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50/70
                    p-4
                    text-sm
                    leading-6
                    text-slate-900
                    outline-none
                    transition-all
                    duration-300
                    placeholder:text-slate-400
                    focus:border-primary/40
                    focus:bg-white
                    focus:ring-4
                    focus:ring-primary/10
                  "
                          />

                          <div className="pointer-events-none absolute inset-x-4 bottom-3 h-px scale-x-0 bg-linear-to-r from-transparent via-primary to-transparent transition-transform duration-500 focus-within:scale-x-100" />
                        </div>
                      </div>

                      <Button
                        onClick={submitReview}
                        disabled={submittingReview}
                        className="
                group/review
                relative
                h-13
                w-full
                overflow-hidden
                rounded-2xl
                bg-slate-950
                text-sm
                font-extrabold
                text-white
                shadow-[0_14px_35px_rgba(15,23,42,0.20)]
                transition-all
                duration-300
                before:absolute
                before:inset-0
                before:-translate-x-full
                before:bg-linear-to-r
                before:from-transparent
                before:via-white/20
                before:to-transparent
                before:transition-transform
                before:duration-700
                hover:-translate-y-1
                hover:bg-primary
                hover:shadow-[0_18px_40px_rgba(37,99,235,0.24)]
                hover:before:translate-x-full
              "
                      >
                        <span className="relative z-10">
                          {submittingReview ? "Submitting..." : "Submit Review"}
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews list */}
              <div>
                {reviewLoading ? (
                  <Loader text="Loading reviews..." variant="section" />
                ) : reviews.length === 0 ? (
                  <div
                    className="
            flex
            min-h-80
            flex-col
            items-center
            justify-center
            rounded-[1.75rem]
            border-2
            border-dashed
            border-slate-300
            bg-white/70
            px-6
            py-14
            text-center
          "
                  >
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                      <Star size={28} />
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-950">
                      No reviews yet
                    </h3>

                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Be the first customer to share an honest review about this
                      product.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review, index) => (
                      <article
                        key={review._id}
                        className="
                group/review-card
                relative
                overflow-hidden
                rounded-[1.5rem]
                border
                border-slate-200/80
                bg-white
                p-5
                shadow-[0_10px_35px_rgba(15,23,42,0.05)]
                transition-all
                duration-400
                hover:-translate-y-1
                hover:border-primary/20
                hover:shadow-[0_20px_48px_rgba(15,23,42,0.10)]
                sm:p-6
              "
                        style={{
                          animation: `reviewCardEntrance 0.5s cubic-bezier(0.22,1,0.36,1) ${
                            index * 70
                          }ms both`,
                        }}
                      >
                        <div className="pointer-events-none absolute inset-x-8 top-0 h-px origin-left scale-x-0 bg-linear-to-r from-transparent via-primary to-transparent transition-transform duration-500 group-hover/review-card:scale-x-100" />

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      bg-linear-to-br
                      from-slate-950
                      to-slate-700
                      text-lg
                      font-extrabold
                      text-white
                      shadow-md
                    "
                            >
                              {review.userEmail.charAt(0).toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <h4 className="truncate font-extrabold text-slate-950">
                                {review.userEmail.split("@")[0]}
                              </h4>

                              <p className="mt-1 text-xs font-medium text-slate-500">
                                {new Date(review.createdAt).toLocaleDateString(
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

                          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={15}
                                className={
                                  i < review.rating
                                    ? getRatingColor(review.rating)
                                    : "text-slate-200"
                                }
                              />
                            ))}
                          </div>
                        </div>

                        <div className="mt-5 rounded-2xl bg-slate-50/80 p-4 sm:p-5">
                          <p className="break-words text-sm leading-7 text-slate-700 sm:text-base">
                            {review.comment}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-400">
                          <BadgeCheck size={15} className="text-blue-500" />
                          Verified customer feedback
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Product Questions Section */}
          <section
            id="product-questions"
            className="mt-10 scroll-mt-28 sm:mt-12 lg:mt-16"
            style={{
              animation:
                "productSectionEntrance 0.65s cubic-bezier(0.22,1,0.36,1) 280ms both",
            }}
          >
            {/* Header */}
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
                  Product support
                </p>

                <div className="mt-2 flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/10 bg-primary/8 text-primary shadow-sm">
                    <MessageCircle size={23} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                      Product Questions & Answers
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      Ask about compatibility, warranty, specifications,
                      installation, or product features.
                    </p>
                  </div>
                </div>
              </div>

              <span className="w-fit rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm">
                {productQuestions.length}{" "}
                {productQuestions.length === 1 ? "Question" : "Questions"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-7 lg:grid-cols-[0.8fr_1.4fr] lg:gap-8">
              {/* Ask Question Form */}
              <div>
                <div
                  className="
          sticky
          top-24
          overflow-hidden
          rounded-[1.75rem]
          border
          border-slate-200/80
          bg-white
          p-6
          shadow-[0_18px_55px_rgba(15,23,42,0.07)]
          sm:p-8
        "
                >
                  <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-primary/7 blur-3xl" />

                  <div className="relative z-10">
                    <div className="mb-6">
                      <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-primary">
                        Need more information?
                      </p>

                      <h3 className="mt-1 text-xl font-extrabold text-slate-950 sm:text-2xl">
                        Ask a Question
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        TechVault Support will review your question and provide
                        an official response.
                      </p>
                    </div>

                    {user?.email ? (
                      <div className="space-y-5">
                        <div>
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <label className="text-sm font-bold text-slate-800">
                              Your question
                            </label>

                            <span
                              className={cn(
                                "text-xs font-semibold",
                                questionText.length >= 900
                                  ? "text-orange-600"
                                  : "text-slate-400",
                              )}
                            >
                              {questionText.length}/1000
                            </span>
                          </div>

                          <textarea
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            placeholder="For example: Does this product support Windows 11?"
                            rows={7}
                            maxLength={1000}
                            className="
                    w-full
                    resize-none
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50/70
                    p-4
                    text-sm
                    leading-6
                    text-slate-900
                    outline-none
                    transition-all
                    duration-300
                    placeholder:text-slate-400
                    focus:border-primary/40
                    focus:bg-white
                    focus:ring-4
                    focus:ring-primary/10
                  "
                          />

                          <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
                            <Shield
                              size={15}
                              className="mt-0.5 shrink-0 text-slate-400"
                            />

                            <p className="text-xs leading-5 text-slate-500">
                              Avoid sharing personal details such as phone
                              numbers, addresses, passwords, or payment
                              information.
                            </p>
                          </div>
                        </div>

                        <Button
                          onClick={submitQuestion}
                          disabled={submittingQuestion || !questionText.trim()}
                          className="
                  group/question
                  relative
                  h-13
                  w-full
                  overflow-hidden
                  rounded-2xl
                  bg-slate-950
                  text-sm
                  font-extrabold
                  text-white
                  shadow-[0_14px_35px_rgba(15,23,42,0.20)]
                  transition-all
                  duration-300
                  before:absolute
                  before:inset-0
                  before:-translate-x-full
                  before:bg-linear-to-r
                  before:from-transparent
                  before:via-white/20
                  before:to-transparent
                  before:transition-transform
                  before:duration-700
                  hover:-translate-y-1
                  hover:bg-primary
                  hover:shadow-[0_18px_40px_rgba(37,99,235,0.24)]
                  hover:before:translate-x-full
                "
                        >
                          <Send
                            size={18}
                            className="relative z-10 mr-2 transition-transform duration-300 group-hover/question:translate-x-0.5 group-hover/question:-translate-y-0.5"
                          />

                          <span className="relative z-10">
                            {submittingQuestion
                              ? "Submitting..."
                              : "Submit Question"}
                          </span>
                        </Button>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-2xl border border-amber-200 bg-linear-to-br from-amber-50 to-orange-50 p-5">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                            <Shield size={19} />
                          </div>

                          <div>
                            <p className="font-extrabold text-amber-950">
                              Login required
                            </p>

                            <p className="mt-1 text-sm leading-6 text-amber-800">
                              Sign in to ask a question about this product and
                              receive an official response.
                            </p>
                          </div>
                        </div>

                        <Button
                          onClick={() => navigate("/login")}
                          className="mt-5 h-12 w-full rounded-2xl bg-amber-950 font-extrabold text-white hover:bg-slate-950"
                        >
                          Login to Ask
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div>
                {questionLoading ? (
                  <Loader
                    text="Loading product questions..."
                    variant="section"
                  />
                ) : productQuestions.length === 0 ? (
                  <div
                    className="
            flex
            min-h-80
            flex-col
            items-center
            justify-center
            rounded-[1.75rem]
            border-2
            border-dashed
            border-slate-300
            bg-white/70
            px-6
            py-14
            text-center
          "
                  >
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                      <MessageCircle size={28} />
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-950">
                      No questions yet
                    </h3>

                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Be the first customer to ask about compatibility,
                      installation, warranty, or product specifications.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {productQuestions.map((item, index) => {
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
                        <article
                          key={item._id}
                          className={cn(
                            `
                    group/question-card
                    relative
                    overflow-hidden
                    rounded-[1.65rem]
                    border
                    bg-white
                    shadow-[0_12px_40px_rgba(15,23,42,0.06)]
                    transition-all
                    duration-400
                    hover:-translate-y-1
                    hover:shadow-[0_22px_55px_rgba(15,23,42,0.11)]
                  `,
                            item.isPinned
                              ? "border-primary/35 ring-1 ring-primary/10"
                              : "border-slate-200/80 hover:border-primary/20",
                          )}
                          style={{
                            animation: `questionCardEntrance 0.5s cubic-bezier(0.22,1,0.36,1) ${
                              index * 75
                            }ms both`,
                          }}
                        >
                          {/* Top hover line */}
                          <div className="pointer-events-none absolute inset-x-8 top-0 h-px origin-left scale-x-0 bg-linear-to-r from-transparent via-primary to-transparent transition-transform duration-500 group-hover/question-card:scale-x-100" />

                          {/* Pinned ribbon */}
                          {item.isPinned && (
                            <div className="absolute right-0 top-0 z-20 rounded-bl-2xl bg-primary px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-white shadow-md">
                              Pinned
                            </div>
                          )}

                          {/* Question */}
                          <div className="p-5 sm:p-6">
                            <div className="flex items-start gap-4">
                              <div
                                className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        bg-linear-to-br
                        from-slate-950
                        to-slate-700
                        text-sm
                        font-black
                        text-white
                        shadow-md
                      "
                              >
                                Q
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="mb-2 flex flex-wrap items-center gap-2 pr-16">
                                  <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400">
                                    Customer question
                                  </span>

                                  {item.status === "answered" &&
                                    item.answer && (
                                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">
                                        Answered
                                      </span>
                                    )}
                                </div>

                                <h3 className="wrap-break-word text-base font-extrabold leading-7 text-slate-950 sm:text-lg">
                                  {item.question}
                                </h3>

                                <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                                  <span>
                                    Asked by{" "}
                                    <span className="font-bold text-slate-700">
                                      {item.userId?.username || "Customer"}
                                    </span>
                                  </span>

                                  <span className="hidden text-slate-300 sm:inline">
                                    •
                                  </span>

                                  <span>
                                    {new Date(
                                      item.createdAt,
                                    ).toLocaleDateString("en-IN", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Answered */}
                          {item.status === "answered" && item.answer ? (
                            <div className="border-t border-emerald-200/70 bg-linear-to-br from-emerald-50/90 via-white to-teal-50/60 p-5 sm:p-6">
                              <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-[0_10px_24px_rgba(5,150,105,0.24)]">
                                  <BadgeCheck size={21} />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-extrabold text-slate-950">
                                      Official TechVault Response
                                    </p>

                                    <BadgeCheck
                                      size={18}
                                      className="fill-blue-500 text-white"
                                    />
                                  </div>

                                  <div className="mt-4 rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-5">
                                    <p className="wrap-break-word text-sm leading-7 text-slate-700 sm:text-base">
                                      {item.answer}
                                    </p>
                                  </div>

                                  {item.answeredAt && (
                                    <p className="mt-3 text-xs font-medium text-slate-500">
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

                                  {/* Helpful voting */}
                                  <div className="mt-5 flex flex-col gap-3 border-t border-emerald-200/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="text-sm font-semibold text-slate-600">
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
                                          `
                                  inline-flex
                                  min-w-18
                                  items-center
                                  justify-center
                                  gap-2
                                  rounded-xl
                                  border
                                  px-3.5
                                  py-2.5
                                  text-sm
                                  font-extrabold
                                  transition-all
                                  duration-300
                                  hover:-translate-y-0.5
                                  active:scale-95
                                  disabled:cursor-not-allowed
                                  disabled:opacity-60
                                `,
                                          item.userVote === "like" || hasLiked
                                            ? "border-emerald-600 bg-emerald-600 text-white shadow-[0_8px_22px_rgba(5,150,105,0.20)]"
                                            : "border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700",
                                        )}
                                      >
                                        <ThumbsUp
                                          size={17}
                                          className={cn(
                                            "transition-transform duration-300",
                                            (item.userVote === "like" ||
                                              hasLiked) &&
                                              "fill-current",
                                          )}
                                        />

                                        {item.likesCount || 0}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleQuestionVote(
                                            item._id,
                                            "dislike",
                                          )
                                        }
                                        disabled={votingQuestionId === item._id}
                                        className={cn(
                                          `
                                  inline-flex
                                  min-w-18
                                  items-center
                                  justify-center
                                  gap-2
                                  rounded-xl
                                  border
                                  px-3.5
                                  py-2.5
                                  text-sm
                                  font-extrabold
                                  transition-all
                                  duration-300
                                  hover:-translate-y-0.5
                                  active:scale-95
                                  disabled:cursor-not-allowed
                                  disabled:opacity-60
                                `,
                                          item.userVote === "dislike" ||
                                            hasDisliked
                                            ? "border-red-600 bg-red-600 text-white shadow-[0_8px_22px_rgba(220,38,38,0.18)]"
                                            : "border-slate-200 bg-white text-slate-700 hover:border-red-400 hover:bg-red-50 hover:text-red-700",
                                        )}
                                      >
                                        <ThumbsDown
                                          size={17}
                                          className={cn(
                                            "transition-transform duration-300",
                                            (item.userVote === "dislike" ||
                                              hasDisliked) &&
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
                            <div className="border-t border-amber-200/70 bg-linear-to-br from-amber-50 via-orange-50/70 to-white p-5 sm:p-6">
                              <div className="flex items-start gap-4">
                                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                                  <span className="absolute inset-0 animate-ping rounded-2xl bg-amber-200/40" />
                                  <Clock3 size={19} className="relative z-10" />
                                </div>

                                <div>
                                  <p className="font-extrabold text-amber-950">
                                    Awaiting response from TechVault Support
                                  </p>

                                  <p className="mt-2 text-sm leading-6 text-amber-800">
                                    Our support team has received this question
                                    and will provide an official response soon.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
