import { useEffect, useState, useMemo } from "react";
import { Star, Search, Grid3x3, List, MessageSquare } from "lucide-react";
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
  const { allReviews, fetchAllReviews } = useApp();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("card");

  // Filter States
  const [ratingFilter, setRatingFilter] = useState<string>("");
  const [performanceFilter, setPerformanceFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [sentimentFilter, setSentimentFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("reviewCountDesc");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      await fetchAllReviews();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setReviews(allReviews as Review[]);
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

  const renderProductCard = (group: ProductGroup) => (
    <div
      key={group.productId}
      className="group rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white border text-slate-900 flex flex-col"
    >
      <div className="h-28 bg-slate-50 flex items-center justify-center p-3 border-b">
        <img
          src={group.images?.[0] || group.image || "/placeholder.png"}
          alt={group.name}
          className="w-32 h-32 object-contain"
          loading="lazy"
        />
      </div>

      <div className="p-4 flex-1 flex flex-col space-y-3">
        <div>
          <h3 className="font-bold text-sm line-clamp-1">{group.name}</h3>
          <p className="text-xs text-muted-foreground">{group.category}</p>
        </div>

        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
          <div className="flex items-center gap-1">
            <Star
              size={14}
              className={getRatingColor(group.avgRating)}
              fill="currentColor"
            />
            <span className="text-sm font-bold">{group.avgRating}</span>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {group.reviewCount} Reviews
          </span>
        </div>

        <div className="flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Recent Feedback
          </p>
          <div className="space-y-2">
            {group.reviews.slice(0, 2).map((r) => (
              <div
                key={r._id}
                className="text-xs border-l-2 border-slate-100 pl-2 py-1"
              >
                <div className="flex items-center gap-1 mb-1">
                  <Star
                    size={10}
                    className={getRatingColor(r.rating)}
                    fill="currentColor"
                  />
                  <span className="text-[10px] font-semibold">
                    {r.rating}/5
                  </span>
                </div>
                <p className="line-clamp-2 text-slate-600 italic">
                  "{r.comment}"
                </p>
                <div className="flex justify-between mt-1 text-[9px] text-slate-400">
                  <span>{r.userEmail.split("@")[0]}</span>
                  <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProductTable = () => (
    <div className="rounded-3xl border bg-card overflow-hidden shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              Product
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              Avg. Rating
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              Total Reviews
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              Latest Feedback
            </th>
          </tr>
        </thead>
        <tbody>
          {productGroups.map((group) => (
            <tr
              key={group.productId}
              className="border-b hover:bg-slate-50 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <img
                    src={group.images?.[0] || group.image || "/placeholder.png"}
                    alt={group.name}
                    className="w-10 h-10 object-contain rounded-lg bg-slate-100 p-1"
                    loading="lazy"
                  />
                  <div>
                    <p className="font-medium text-sm line-clamp-1">
                      {group.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {group.category}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1">
                  <Star
                    size={14}
                    className={getRatingColor(group.avgRating)}
                    fill="currentColor"
                  />
                  <span className="text-sm font-bold">{group.avgRating}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-medium px-3 py-1 rounded-full bg-slate-100">
                  {group.reviewCount}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="max-w-xs">
                  <p className="text-sm text-slate-600 line-clamp-1 italic">
                    "{group.reviews[0]?.comment}"
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {group.reviews[0]?.userEmail} •{" "}
                    {new Date(group.reviews[0]?.createdAt).toLocaleDateString()}
                  </p>
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
    </div>
  );
}
