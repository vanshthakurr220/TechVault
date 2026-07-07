import { useEffect, useState, useMemo } from "react";
import {
  Star,
  Search,
  Grid3x3,
  List,
  MessageSquare,
  Calendar,
  Mail,
  X,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";

interface Review {
  _id: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
  productId: {
    _id: string;
    name: string;
    image?: string;
    images?: string[];
    category: string;
  };
}

interface ProductGroup {
  productId: string;
  name: string;
  image?: string;
  images?: string[];
  category: string;
  avgRating: number;
  reviewCount: number;
  reviews: Review[];
}

type ViewMode = "card" | "table";

export default function AdminReviews() {
  const { allReviews } = useApp();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("card");

  // Filter States
  const [ratingFilter, setRatingFilter] = useState<string>("");
  const [performanceFilter, setPerformanceFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [sentimentFilter, setSentimentFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("reviewCountDesc");

  const [selectedProduct, setSelectedProduct] = useState<ProductGroup | null>(
    null,
  );
  const [reviewModalView, setReviewModalView] = useState<ViewMode>("card");

  const [detailsProduct, setDetailsProduct] = useState<ProductGroup | null>(
    null,
  );

  useEffect(() => {
    setReviews(allReviews as Review[]);
    setLoading(false);
  }, [allReviews]);

  const getRatingColor = (rating: number) => {
    if (rating <= 1.5) return "fill-red-500 text-red-500";
    if (rating <= 3.5) return "fill-yellow-400 text-yellow-400";
    return "fill-green-500 text-green-500";
  };

  const filteredRawReviews = useMemo(() => {
    return reviews.filter((review) => {
      // Rating Filter
      if (ratingFilter && review.rating !== Number(ratingFilter)) return false;

      // Sentiment Filter
      if (sentimentFilter) {
        if (sentimentFilter === "positive" && review.rating < 4) return false;
        if (sentimentFilter === "neutral" && review.rating !== 3) return false;
        if (sentimentFilter === "negative" && review.rating > 2) return false;
      }

      // Date Filter
      if (dateFilter) {
        const reviewDate = new Date(review.createdAt);
        const now = new Date();
        const diffDays =
          (now.getTime() - reviewDate.getTime()) / (1000 * 3600 * 24);

        if (dateFilter === "today" && diffDays > 1) return false;
        if (dateFilter === "week" && diffDays > 7) return false;
        if (dateFilter === "month" && diffDays > 30) return false;
      }

      // Search Filter
      const matchesSearch =
        review.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.productId?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        review.comment?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [reviews, ratingFilter, sentimentFilter, dateFilter, searchTerm]);

  const getProductInsights = (group: ProductGroup) => {
    const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: group.reviews.filter((review) => review.rating === rating).length,
    }));

    const positive = group.reviews.filter(
      (review) => review.rating >= 4,
    ).length;
    const neutral = group.reviews.filter(
      (review) => review.rating === 3,
    ).length;
    const negative = group.reviews.filter(
      (review) => review.rating <= 2,
    ).length;

    const bestReview = [...group.reviews].sort(
      (a, b) => b.rating - a.rating,
    )[0];
    const worstReview = [...group.reviews].sort(
      (a, b) => a.rating - b.rating,
    )[0];
    const latestReview = group.reviews[0];

    let recommendation =
      "This product has mixed feedback. Keep monitoring customer reviews.";

    if (group.avgRating >= 4 && positive >= negative) {
      recommendation =
        "This product is performing well with strong customer satisfaction.";
    } else if (group.avgRating < 3 || negative > positive) {
      recommendation =
        "This product needs attention because negative feedback is higher.";
    } else if (group.reviewCount >= 5 && group.avgRating >= 3.5) {
      recommendation =
        "This product has good review volume and stable performance.";
    }

    return {
      ratingCounts,
      positive,
      neutral,
      negative,
      bestReview,
      worstReview,
      latestReview,
      recommendation,
    };
  };

  const productGroups = useMemo(() => {
    const groups: Record<string, ProductGroup> = {};

    filteredRawReviews.forEach((review) => {
      const pId = review.productId?._id;
      if (!pId) return;

      if (!groups[pId]) {
        groups[pId] = {
          productId: pId,
          name: review.productId.name,
          image: review.productId.image,
          images: review.productId.images || [],
          category: review.productId.category,
          avgRating: 0,
          reviewCount: 0,
          reviews: [],
        };
      }
      groups[pId].reviews.push(review);
    });

    let result = Object.values(groups).map((group) => {
      const totalRating = group.reviews.reduce((sum, r) => sum + r.rating, 0);
      return {
        ...group,
        avgRating: Number((totalRating / group.reviews.length).toFixed(1)),
        reviewCount: group.reviews.length,
        reviews: [...group.reviews].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      };
    });

    // Performance Filter
    if (performanceFilter) {
      if (performanceFilter === "best")
        result = result.sort((a, b) => b.avgRating - a.avgRating).slice(0, 10);
      if (performanceFilter === "worst")
        result = result.sort((a, b) => a.avgRating - b.avgRating).slice(0, 10);
      if (performanceFilter === "mostReviewed")
        result = result
          .sort((a, b) => b.reviewCount - a.reviewCount)
          .slice(0, 10);
      if (performanceFilter === "leastReviewed")
        result = result
          .sort((a, b) => a.reviewCount - b.reviewCount)
          .slice(0, 10);
    }

    // Sort Result
    result.sort((a, b) => {
      switch (sortBy) {
        case "reviewCountDesc":
          return b.reviewCount - a.reviewCount;
        case "reviewCountAsc":
          return a.reviewCount - b.reviewCount;
        case "ratingDesc":
          return b.avgRating - a.avgRating;
        case "ratingAsc":
          return a.avgRating - b.avgRating;
        case "newest":
          return (
            new Date(b.reviews[0].createdAt).getTime() -
            new Date(a.reviews[0].createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.reviews[a.reviews.length - 1].createdAt).getTime() -
            new Date(b.reviews[b.reviews.length - 1].createdAt).getTime()
          );
        case "nameAsc":
          return a.name.localeCompare(b.name);
        case "nameDesc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return result;
  }, [filteredRawReviews, performanceFilter, sortBy]);

  const renderProductCard = (group: ProductGroup) => {
    const latestReview = group.reviews[0];
    const productImage = group.images?.[0] || group.image || "/placeholder.png";

    return (
      <div
        key={group.productId}
        className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
      >
        <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 p-4">
          <div className="flex h-44 items-center justify-center rounded-2xl bg-white p-4 shadow-inner sm:h-48">
            <img
              src={productImage}
              alt={group.name}
              className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>

          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-slate-700 shadow-sm">
            {group.category}
          </span>

          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-slate-900 shadow-sm">
            <Star
              size={13}
              className={getRatingColor(group.avgRating)}
              fill="currentColor"
            />
            {group.avgRating}
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div>
            <h3 className="line-clamp-2 min-h-[44px] text-base font-black leading-snug text-slate-900">
              {group.name}
            </h3>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Reviews
                </p>
                <p className="mt-1 text-lg font-black text-slate-900">
                  {group.reviewCount}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Rating
                </p>
                <div className="mt-1 flex items-center gap-1">
                  <Star
                    size={16}
                    className={getRatingColor(group.avgRating)}
                    fill="currentColor"
                  />
                  <span className="text-lg font-black text-slate-900">
                    {group.avgRating}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                Latest Feedback
              </p>

              {latestReview && (
                <span className="shrink-0 text-[11px] font-bold text-slate-400">
                  {new Date(latestReview.createdAt).toLocaleDateString("en-IN")}
                </span>
              )}
            </div>

            {latestReview ? (
              <>
                <div className="mb-2 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={13}
                      className={
                        index < latestReview.rating
                          ? getRatingColor(latestReview.rating)
                          : "text-slate-300"
                      }
                      fill="currentColor"
                    />
                  ))}
                </div>

                <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                  “{latestReview.comment}”
                </p>

                <p className="mt-3 truncate text-xs font-bold text-slate-500">
                  {latestReview.userEmail}
                </p>
              </>
            ) : (
              <p className="text-sm font-medium text-slate-500">
                No feedback available.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedProduct(group);
                setReviewModalView("card");
              }}
              className="h-10 rounded-xl font-bold hover:bg-slate-950 hover:text-white"
            >
              View All Reviews
            </Button>

            <Button
              onClick={() => setDetailsProduct(group)}
              className="h-10 rounded-xl bg-slate-950 font-bold text-white hover:bg-slate-800"
            >
              Details
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderProductTable = () => (
  <div className="space-y-4">
    {/* Mobile Card Table */}
    <div className="grid grid-cols-1 gap-4 lg:hidden">
      {productGroups.map((group) => {
        const latestReview = group.reviews[0];
        const productImage = group.images?.[0] || group.image || "/placeholder.png";

        return (
          <div key={group.productId} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-50 p-2">
                <img src={productImage} alt={group.name} className="h-full w-full object-contain" loading="lazy" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-sm font-black text-slate-900">
                  {group.name}
                </h3>

                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {group.category}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                    <Star size={13} className={getRatingColor(group.avgRating)} fill="currentColor" />
                    {group.avgRating}
                  </span>

                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                    {group.reviewCount} Reviews
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-3">
              <p className="mb-1 text-[11px] font-black uppercase tracking-wide text-slate-400">
                Latest Feedback
              </p>

              <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                “{latestReview?.comment || "No feedback available."}”
              </p>

              {latestReview && (
                <p className="mt-2 truncate text-xs font-bold text-slate-400">
                  {latestReview.userEmail} •{" "}
                  {new Date(latestReview.createdAt).toLocaleDateString("en-IN")}
                </p>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedProduct(group);
                  setReviewModalView("card");
                }}
                className="h-10 rounded-xl font-bold hover:bg-slate-950 hover:text-white"
              >
                View Reviews
              </Button>

              <Button
                onClick={() => setDetailsProduct(group)}
                className="h-10 rounded-xl bg-slate-950 font-bold text-white hover:bg-slate-800"
              >
                Details
              </Button>
            </div>
          </div>
        );
      })}
    </div>

    {/* Desktop Table */}
    <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:block">
      <div className="border-b bg-slate-950 px-6 py-5">
        <h3 className="text-lg font-black text-white">Product Review Summary</h3>
        <p className="mt-1 text-sm text-slate-300">
          Review performance grouped by product
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px]">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                Product
              </th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                Rating
              </th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                Reviews
              </th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                Latest Feedback
              </th>
              <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {productGroups.map((group) => {
              const latestReview = group.reviews[0];
              const productImage = group.images?.[0] || group.image || "/placeholder.png";

              return (
                <tr key={group.productId} className="transition hover:bg-slate-50/80">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-2">
                        <img src={productImage} alt={group.name} className="h-full w-full object-contain" loading="lazy" />
                      </div>

                      <div className="min-w-0">
                        <p className="line-clamp-2 max-w-[260px] text-sm font-black leading-5 text-slate-900">
                          {group.name}
                        </p>

                        <p className="mt-1 text-xs font-bold text-slate-500">
                          {group.category}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                      <Star size={15} className={getRatingColor(group.avgRating)} fill="currentColor" />
                      <span className="text-sm font-black text-slate-900">
                        {group.avgRating}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span className="inline-flex rounded-full bg-indigo-50 px-4 py-2 text-sm font-black text-indigo-700">
                      {group.reviewCount} Reviews
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="max-w-sm rounded-2xl bg-slate-50 p-3">
                      <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                        “{latestReview?.comment || "No feedback available."}”
                      </p>

                      {latestReview && (
                        <p className="mt-2 truncate text-xs font-bold text-slate-400">
                          {latestReview.userEmail} •{" "}
                          {new Date(latestReview.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedProduct(group);
                          setReviewModalView("card");
                        }}
                        className="h-10 rounded-xl px-4 font-bold hover:bg-slate-950 hover:text-white"
                      >
                        View Reviews
                      </Button>

                      <Button
                        onClick={() => setDetailsProduct(group)}
                        className="h-10 rounded-xl bg-slate-950 px-4 font-bold text-white hover:bg-slate-800"
                      >
                        Details
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

  return (
    <div className="animate-fade-in mt-8 px-4 md:px-6">
      <div className="mb-10">
        <h2 className="text-3xl font-bold">Advanced Review Insights</h2>
        <p className="text-muted-foreground mt-1">
          Deep analysis of customer feedback and product performance.
        </p>
      </div>

      <div className="mb-8 bg-white rounded-3xl border shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {/* Search */}
          <div className="relative col-span-1 md:col-span-2">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search product, customer or review..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-10 pr-4 border rounded-xl bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="h-10 px-4 border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
            <option value="4">4 Stars ⭐⭐⭐⭐</option>
            <option value="3">3 Stars ⭐⭐⭐</option>
            <option value="2">2 Stars ⭐⭐</option>
            <option value="1">1 Star ⭐</option>
          </select>

          {/* Sentiment Filter */}
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="h-10 px-4 border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">All Sentiments</option>
            <option value="positive">Positive (4-5★)</option>
            <option value="neutral">Neutral (3★)</option>
            <option value="negative">Negative (1-2★)</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-10 px-4 border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>

          {/* Performance Filter */}
          <select
            value={performanceFilter}
            onChange={(e) => setPerformanceFilter(e.target.value)}
            className="h-10 px-4 border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">All Products</option>
            <option value="best">Best Rated Products</option>
            <option value="worst">Worst Rated Products</option>
            <option value="mostReviewed">Most Reviewed</option>
            <option value="leastReviewed">Least Reviewed</option>
          </select>

          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 px-4 border rounded-xl bg-background focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="reviewCountDesc">Most Reviews</option>
            <option value="reviewCountAsc">Least Reviews</option>
            <option value="ratingDesc">Highest Rated</option>
            <option value="ratingAsc">Lowest Rated</option>
            <option value="newest">Newest Reviews</option>
            <option value="oldest">Oldest Reviews</option>
            <option value="nameAsc">Product A-Z</option>
            <option value="nameDesc">Product Z-A</option>
          </select>

          {/* View Toggle */}
          <div className="flex gap-2 border rounded-xl p-1 bg-slate-50 w-full">
            <Button
              variant={viewMode === "card" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("card")}
              className="flex-1 gap-2"
            >
              <Grid3x3 size={16} /> Card
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="flex-1 gap-2"
            >
              <List size={16} /> Table
            </Button>
          </div>

          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={() => {
              setSearchTerm("");
              setRatingFilter("");
              setPerformanceFilter("");
              setDateFilter("");
              setSentimentFilter("");
              setSortBy("reviewCountDesc");
            }}
          >
            Reset All
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 border-t pt-6">
          <div className="px-4 py-2 rounded-xl bg-slate-50 text-sm">
            Total Products:{" "}
            <span className="font-semibold ml-1">{productGroups.length}</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-amber-50 text-sm text-amber-700">
            Filtered Reviews:{" "}
            <span className="font-semibold ml-1">
              {filteredRawReviews.length}
            </span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-indigo-50 text-sm text-indigo-700">
            Average Rating:{" "}
            <span className="font-semibold ml-1">
              {(
                filteredRawReviews.reduce((acc, r) => acc + r.rating, 0) /
                (filteredRawReviews.length || 1)
              ).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">
          Loading...
        </div>
      ) : productGroups.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border shadow-sm">
          <MessageSquare
            size={60}
            className="mx-auto mb-4 text-muted-foreground opacity-20"
          />
          <h3 className="text-xl font-semibold mb-2">
            No Reviews Match Your Filters
          </h3>
          <p className="text-muted-foreground">
            Try resetting your filters to see more results.
          </p>
        </div>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {productGroups.map((group) => renderProductCard(group))}
        </div>
      ) : (
        renderProductTable()
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 p-3 pt-16 backdrop-blur-md sm:p-6 sm:pt-20 mt-5">
          <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-5 sm:p-7">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-slate-950"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col gap-4 pr-12 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white p-3 shadow-lg">
                  <img
                    src={
                      selectedProduct.images?.[0] ||
                      selectedProduct.image ||
                      "/placeholder.png"
                    }
                    alt={selectedProduct.name}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="min-w-0">
                  <p className="mb-2 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">
                    {selectedProduct.category}
                  </p>

                  <h3 className="line-clamp-2 text-xl font-black text-white sm:text-2xl">
                    {selectedProduct.name}
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-3">
                    <span className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-white">
                      ⭐ {selectedProduct.avgRating} Avg Rating
                    </span>

                    <span className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-white">
                      {selectedProduct.reviewCount} Reviews
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b bg-white p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    All Reviews
                  </h4>
                  <p className="text-sm text-slate-500">
                    View customer feedback for this product
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-xl border bg-slate-50 p-1 sm:w-auto">
                  <Button
                    variant={reviewModalView === "card" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setReviewModalView("card")}
                    className="gap-2"
                  >
                    <Grid3x3 size={16} />
                    Card
                  </Button>

                  <Button
                    variant={reviewModalView === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setReviewModalView("table")}
                    className="gap-2"
                  >
                    <List size={16} />
                    Table
                  </Button>
                </div>
              </div>
            </div>

            <div className="max-h-[65vh] overflow-y-auto bg-slate-50 p-4 sm:p-6">
              {reviewModalView === "card" ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {selectedProduct.reviews.map((review) => (
                    <div
                      key={review._id}
                      className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-900">
                            {review.userEmail}
                          </p>

                          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
                            <Calendar size={13} />
                            {new Date(review.createdAt).toLocaleDateString(
                              "en-IN",
                            )}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1 rounded-full bg-slate-50 px-3 py-1">
                          <Star
                            size={14}
                            className={getRatingColor(review.rating)}
                            fill="currentColor"
                          />
                          <span className="text-sm font-black">
                            {review.rating}
                          </span>
                        </div>
                      </div>

                      <div className="mb-3 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            size={15}
                            className={
                              index < review.rating
                                ? getRatingColor(review.rating)
                                : "text-slate-300"
                            }
                            fill="currentColor"
                          />
                        ))}
                      </div>

                      <p className="text-sm leading-6 text-slate-600">
                        “{review.comment}”
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full min-w-[760px]">
                    <thead className="border-b bg-slate-50">
                      <tr>
                        <th className="px-5 py-4 text-left text-sm font-black text-slate-700">
                          Customer
                        </th>
                        <th className="px-5 py-4 text-left text-sm font-black text-slate-700">
                          Rating
                        </th>
                        <th className="px-5 py-4 text-left text-sm font-black text-slate-700">
                          Review
                        </th>
                        <th className="px-5 py-4 text-left text-sm font-black text-slate-700">
                          Date
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedProduct.reviews.map((review) => (
                        <tr
                          key={review._id}
                          className="border-b hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Mail size={15} className="text-slate-400" />
                              <span className="break-all text-sm font-bold text-slate-700">
                                {review.userEmail}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1">
                              <Star
                                size={15}
                                className={getRatingColor(review.rating)}
                                fill="currentColor"
                              />
                              <span className="text-sm font-black">
                                {review.rating}/5
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="max-w-md text-sm text-slate-600">
                              {review.comment}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-slate-500">
                            {new Date(review.createdAt).toLocaleDateString(
                              "en-IN",
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="border-t bg-white p-4 sm:p-5">
              <Button
                variant="outline"
                onClick={() => setSelectedProduct(null)}
                className="h-11 w-full rounded-xl font-black hover:bg-slate-950 hover:text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {detailsProduct &&
        (() => {
          const insights = getProductInsights(detailsProduct);

          return (
            <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 p-3 pt-16 backdrop-blur-md sm:p-6 sm:pt-20 mt-10">
              <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-5 sm:p-7">
                  <button
                    onClick={() => setDetailsProduct(null)}
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-slate-950"
                  >
                    <X size={20} />
                  </button>

                  <div className="flex flex-col gap-4 pr-12 sm:flex-row sm:items-center">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white p-3 shadow-lg">
                      <img
                        src={
                          detailsProduct.images?.[0] ||
                          detailsProduct.image ||
                          "/placeholder.png"
                        }
                        alt={detailsProduct.name}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="mb-2 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">
                        {detailsProduct.category}
                      </p>

                      <h3 className="line-clamp-2 text-xl font-black text-white sm:text-2xl">
                        {detailsProduct.name}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-3">
                        <span className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-white">
                          ⭐ {detailsProduct.avgRating} Avg Rating
                        </span>

                        <span className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-white">
                          {detailsProduct.reviewCount} Reviews
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="max-h-[70vh] overflow-y-auto bg-slate-50 p-4 sm:p-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border bg-white p-5 shadow-sm">
                      <p className="text-sm font-black text-slate-500">
                        Positive Reviews
                      </p>
                      <p className="mt-2 text-3xl font-black text-emerald-600">
                        {insights.positive}
                      </p>
                    </div>

                    <div className="rounded-3xl border bg-white p-5 shadow-sm">
                      <p className="text-sm font-black text-slate-500">
                        Neutral Reviews
                      </p>
                      <p className="mt-2 text-3xl font-black text-yellow-500">
                        {insights.neutral}
                      </p>
                    </div>

                    <div className="rounded-3xl border bg-white p-5 shadow-sm">
                      <p className="text-sm font-black text-slate-500">
                        Negative Reviews
                      </p>
                      <p className="mt-2 text-3xl font-black text-red-500">
                        {insights.negative}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-3xl border bg-white p-5 shadow-sm">
                    <h4 className="mb-4 text-lg font-black text-slate-900">
                      Rating Breakdown
                    </h4>

                    <div className="space-y-3">
                      {insights.ratingCounts.map((item) => {
                        const percentage =
                          detailsProduct.reviewCount > 0
                            ? (item.count / detailsProduct.reviewCount) * 100
                            : 0;

                        return (
                          <div
                            key={item.rating}
                            className="flex items-center gap-3"
                          >
                            <div className="flex w-16 items-center gap-1 text-sm font-black">
                              {item.rating}
                              <Star
                                size={14}
                                className={getRatingColor(item.rating)}
                                fill="currentColor"
                              />
                            </div>

                            <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-slate-950"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>

                            <span className="w-10 text-right text-sm font-bold text-slate-600">
                              {item.count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {[
                      {
                        title: "Latest Review",
                        review: insights.latestReview,
                      },
                      {
                        title: "Best Review",
                        review: insights.bestReview,
                      },
                      {
                        title: "Worst Review",
                        review: insights.worstReview,
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="rounded-3xl border bg-white p-5 shadow-sm"
                      >
                        <h4 className="mb-3 text-base font-black text-slate-900">
                          {item.title}
                        </h4>

                        {item.review ? (
                          <>
                            <div className="mb-2 flex items-center gap-1">
                              <Star
                                size={15}
                                className={getRatingColor(item.review.rating)}
                                fill="currentColor"
                              />
                              <span className="text-sm font-black">
                                {item.review.rating}/5
                              </span>
                            </div>

                            <p className="line-clamp-4 text-sm leading-6 text-slate-600">
                              “{item.review.comment}”
                            </p>

                            <p className="mt-3 truncate text-xs font-bold text-slate-500">
                              {item.review.userEmail}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-slate-500">
                            No review found.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h4 className="mb-2 text-lg font-black text-slate-900">
                      Admin Recommendation
                    </h4>

                    <p className="text-sm leading-6 text-slate-600">
                      {insights.recommendation}
                    </p>
                  </div>
                </div>

                <div className="border-t bg-white p-4 sm:p-5">
                  <Button
                    variant="outline"
                    onClick={() => setDetailsProduct(null)}
                    className="h-11 w-full rounded-xl font-black hover:bg-slate-950 hover:text-white"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
