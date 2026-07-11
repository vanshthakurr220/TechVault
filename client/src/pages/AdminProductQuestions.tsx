import { useEffect, useMemo, useState } from "react";
import {
  MessageSquare,
  Clock3,
  CheckCircle2,
  EyeOff,
  Eye,
  Search,
  Pin,
  PinOff,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Trash2,
  Pencil,
  Package,
  User,
  CalendarDays,
  Send,
  Loader2,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "pending" | "answered";
type VisibilityFilter = "all" | "visible" | "hidden";
type PinFilter = "all" | "pinned" | "notPinned";
type SortBy = "newest" | "oldest" | "mostLiked" | "mostDisliked";

export default function AdminProductQuestions() {
  const {
    allProductQuestions,
    fetchAllProductQuestions,
    deleteProductQuestion,
    toggleProductQuestionVisibility,
    toggleProductQuestionPin,
    replyProductQuestion,
  } = useApp();

  const [replyQuestion, setReplyQuestion] = useState<
    (typeof allProductQuestions)[number] | null
  >(null);

  const [detailsQuestion, setDetailsQuestion] = useState<
    (typeof allProductQuestions)[number] | null
  >(null);

  const [replyText, setReplyText] = useState("");
  const [savingReply, setSavingReply] = useState(false);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null,
  );

  const [visibilityFilter, setVisibilityFilter] =
    useState<VisibilityFilter>("all");

  const [pinFilter, setPinFilter] = useState<PinFilter>("all");

  const [sortBy, setSortBy] = useState<SortBy>("newest");

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        await fetchAllProductQuestions();
      } catch (error) {
        console.error("Failed to load product questions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [fetchAllProductQuestions]);

  const stats = useMemo(() => {
    const questions = Array.isArray(allProductQuestions)
      ? allProductQuestions
      : [];

    return {
      total: questions.length,

      pending: questions.filter((item) => item.status === "pending").length,

      answered: questions.filter((item) => item.status === "answered").length,

      hidden: questions.filter((item) => !item.isVisible).length,
    };
  }, [allProductQuestions]);

  const filteredQuestions = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return [...allProductQuestions]
      .filter((item) => {
        const product =
          typeof item.productId === "string" ? null : item.productId;

        const productName = product?.name || "";
        const customerName = item.userId?.username || "";
        const customerEmail = item.userId?.email || "";
        const questionText = item.question || "";
        const answerText = item.answer || "";

        const matchesSearch =
          !search ||
          productName.toLowerCase().includes(search) ||
          customerName.toLowerCase().includes(search) ||
          customerEmail.toLowerCase().includes(search) ||
          questionText.toLowerCase().includes(search) ||
          answerText.toLowerCase().includes(search);

        const matchesStatus =
          statusFilter === "all" || item.status === statusFilter;

        const matchesVisibility =
          visibilityFilter === "all" ||
          (visibilityFilter === "visible" && item.isVisible) ||
          (visibilityFilter === "hidden" && !item.isVisible);

        const matchesPin =
          pinFilter === "all" ||
          (pinFilter === "pinned" && item.isPinned) ||
          (pinFilter === "notPinned" && !item.isPinned);

        return (
          matchesSearch && matchesStatus && matchesVisibility && matchesPin
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "oldest":
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

          case "mostLiked":
            return (b.likes?.length || 0) - (a.likes?.length || 0);

          case "mostDisliked":
            return (b.dislikes?.length || 0) - (a.dislikes?.length || 0);

          case "newest":
          default:
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        }
      });
  }, [
    allProductQuestions,
    searchTerm,
    statusFilter,
    visibilityFilter,
    pinFilter,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setVisibilityFilter("all");
    setPinFilter("all");
    setSortBy("newest");
  };

  const handleDeleteQuestion = async (questionId: string) => {
    const question = allProductQuestions.find(
      (item) => item._id === questionId,
    );

    const result = await Swal.fire({
      title: "Delete Product Question?",
      html: `
      <div style="text-align:left;">
        <p style="margin-bottom:10px;">
          This will permanently delete the customer question and its official reply.
        </p>

        ${
          question
            ? `<div style="
                padding:12px;
                background:#f8fafc;
                border:1px solid #e2e8f0;
                border-radius:12px;
                font-size:14px;
                color:#334155;
              ">
                ${question.question}
              </div>`
            : ""
        }

        <p style="
          margin-top:12px;
          color:#dc2626;
          font-size:13px;
          font-weight:600;
        ">
          This action cannot be undone.
        </p>
      </div>
    `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) return;

    try {
      setSelectedQuestionId(questionId);

      await deleteProductQuestion(questionId);

      if (detailsQuestion?._id === questionId) {
        setDetailsQuestion(null);
      }

      if (replyQuestion?._id === questionId) {
        setReplyQuestion(null);
        setReplyText("");
      }
    } catch (error) {
      console.error("Delete question failed:", error);
    } finally {
      setSelectedQuestionId(null);
    }
  };

  const handleToggleVisibility = async (questionId: string) => {
    try {
      setSelectedQuestionId(questionId);
      await toggleProductQuestionVisibility(questionId);
    } catch (error) {
      console.error("Visibility update failed:", error);
    } finally {
      setSelectedQuestionId(null);
    }
  };

  const handleTogglePin = async (questionId: string, isPinned: boolean) => {
    const result = await Swal.fire({
      title: isPinned ? "Unpin Question?" : "Pin Question?",
      text: isPinned
        ? "This question will return to its normal position."
        : "This question will be shown before other questions on the product page.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: isPinned ? "#64748b" : "#2563eb",
      cancelButtonColor: "#64748b",
      confirmButtonText: isPinned ? "Yes, Unpin" : "Yes, Pin It",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setSelectedQuestionId(questionId);

      await toggleProductQuestionPin(questionId);
    } catch (error) {
      console.error("Pin update failed:", error);
    } finally {
      setSelectedQuestionId(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (replyQuestion && !savingReply) {
          setReplyQuestion(null);
          setReplyText("");
          return;
        }

        if (detailsQuestion) {
          setDetailsQuestion(null);
        }
      }

      if (
        event.ctrlKey &&
        event.key === "Enter" &&
        replyQuestion &&
        replyText.trim() &&
        !savingReply
      ) {
        event.preventDefault();
        handleSaveReply();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [replyQuestion, replyText, savingReply, detailsQuestion]);

  const openReplyModal = (question: (typeof allProductQuestions)[number]) => {
    setReplyQuestion(question);
    setReplyText(question.answer || "");
  };

  const handleSaveReply = async () => {
    if (!replyQuestion) return;

    const cleanedReply = replyText.trim();

    if (!cleanedReply) {
      Swal.fire({
        icon: "warning",
        title: "Reply Required",
        text: "Please enter an official response before saving.",
      });

      return;
    }

    try {
      setSavingReply(true);

      const updatedQuestion = await replyProductQuestion(
        replyQuestion._id,
        cleanedReply,
      );

      if (updatedQuestion) {
        setReplyQuestion(null);
        setReplyText("");
      }
    } catch (error) {
      console.error("Save question reply failed:", error);
    } finally {
      setSavingReply(false);
    }
  };

  return (
    <div className="animate-fade-in mt-6 px-3 sm:px-4 md:px-6 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Product Questions
        </h1>

        <p className="mt-1 text-sm sm:text-base text-muted-foreground">
          Review customer questions, send official replies, and manage
          visibility.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="rounded-2xl sm:rounded-3xl border bg-white p-4 sm:p-6 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <MessageSquare size={21} />
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground">
            Total Questions
          </p>

          <h3 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">
            {stats.total}
          </h3>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border bg-white p-4 sm:p-6 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Clock3 size={21} />
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>

          <h3 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">
            {stats.pending}
          </h3>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border bg-white p-4 sm:p-6 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={21} />
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground">Answered</p>

          <h3 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">
            {stats.answered}
          </h3>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border bg-white p-4 sm:p-6 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
            <EyeOff size={21} />
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground">Hidden</p>

          <h3 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">
            {stats.hidden}
          </h3>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl sm:rounded-3xl border bg-white p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3 sm:gap-4">
          <div className="relative md:col-span-2 xl:col-span-2">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search product, customer, question..."
              className="h-11 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
            className="h-11 rounded-xl border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="answered">Answered</option>
          </select>

          <select
            value={visibilityFilter}
            onChange={(event) =>
              setVisibilityFilter(event.target.value as VisibilityFilter)
            }
            className="h-11 rounded-xl border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Visibility</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>

          <select
            value={pinFilter}
            onChange={(event) => setPinFilter(event.target.value as PinFilter)}
            className="h-11 rounded-xl border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Questions</option>
            <option value="pinned">Pinned</option>
            <option value="notPinned">Not Pinned</option>
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortBy)}
            className="h-11 rounded-xl border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="mostLiked">Most Liked</option>
            <option value="mostDisliked">Most Disliked</option>
          </select>

          <Button
            variant="outline"
            onClick={resetFilters}
            className="h-11 rounded-xl md:col-span-2 xl:col-span-6 hover:bg-slate-950 hover:text-white"
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="rounded-3xl border bg-white px-6 py-20 text-center shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Loading product questions...
          </p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl border border-dashed bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <MessageSquare size={26} />
          </div>

          <h3 className="text-lg font-bold text-slate-900">
            No questions found
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            No product questions match the selected filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {filteredQuestions.map((item) => {
            const product =
              typeof item.productId === "string" ? null : item.productId;

            const productImage =
              product?.images?.[0] || product?.image || "/placeholder.png";

            const isProcessing = selectedQuestionId === item._id;

            return (
              <article
                key={item._id}
                className={`group overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  item.status === "answered"
                    ? "border-emerald-200"
                    : "border-amber-200"
                }`}
              >
                {/* Status Accent */}
                <div
                  className={`h-1.5 w-full ${
                    item.status === "answered"
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                  }`}
                />

                <div className="p-4 sm:p-5 lg:p-6">
                  {/* Product Header */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:h-24 sm:w-24">
                      <img
                        src={productImage}
                        alt={product?.name || "Product"}
                        className="h-full w-full object-contain"
                        loading="lazy"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                                item.status === "answered"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-amber-200 bg-amber-50 text-amber-700"
                              }`}
                            >
                              {item.status === "answered" ? (
                                <CheckCircle2 size={13} />
                              ) : (
                                <Clock3 size={13} />
                              )}

                              {item.status === "answered"
                                ? "Answered"
                                : "Pending Reply"}
                            </span>

                            {item.isPinned && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                                <Pin size={13} className="fill-current" />
                                Pinned
                              </span>
                            )}

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                                item.isVisible
                                  ? "border-slate-200 bg-slate-50 text-slate-700"
                                  : "border-red-200 bg-red-50 text-red-700"
                              }`}
                            >
                              {item.isVisible ? (
                                <Eye size={13} />
                              ) : (
                                <EyeOff size={13} />
                              )}

                              {item.isVisible ? "Visible" : "Hidden"}
                            </span>
                          </div>

                          <h3 className="line-clamp-2 text-base font-black leading-6 text-slate-900 sm:text-lg">
                            {product?.name || "Unknown Product"}
                          </h3>

                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <Package size={13} />
                              {product?.category || "No category"}
                            </span>

                            <span className="inline-flex items-center gap-1">
                              <CalendarDays size={13} />
                              {new Date(item.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">
                      {(item.userId?.username || "C").charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Asked By
                      </p>

                      <p className="truncate text-sm font-bold text-slate-900">
                        {item.userId?.username || "Customer"}
                      </p>

                      {item.userId?.email && (
                        <p className="truncate text-xs text-slate-500">
                          {item.userId.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Question */}
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">
                        Q
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                          Customer Question
                        </p>

                        <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm font-semibold leading-6 text-slate-800 sm:text-base">
                          {item.question}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Answer */}
                  {item.status === "answered" && item.answer ? (
                    <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                          <CheckCircle2 size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                              Official TechVault Reply
                            </p>

                            {item.answeredAt && (
                              <span className="text-xs font-semibold text-emerald-700/70">
                                {new Date(item.answeredAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  },
                                )}
                              </span>
                            )}
                          </div>

                          <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-slate-700">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                          <Clock3 size={18} />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-amber-900">
                            Awaiting admin response
                          </p>

                          <p className="mt-1 text-xs leading-5 text-amber-700">
                            This customer question has not been answered yet.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Metrics */}
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl bg-emerald-50 p-3">
                      <div className="flex items-center gap-2 text-emerald-700">
                        <ThumbsUp size={15} />
                        <span className="text-xs font-bold">Likes</span>
                      </div>

                      <p className="mt-1 text-lg font-black text-emerald-800">
                        {item.likes?.length || 0}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-red-50 p-3">
                      <div className="flex items-center gap-2 text-red-700">
                        <ThumbsDown size={15} />
                        <span className="text-xs font-bold">Dislikes</span>
                      </div>

                      <p className="mt-1 text-lg font-black text-red-800">
                        {item.dislikes?.length || 0}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-blue-50 p-3">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Pin size={15} />
                        <span className="text-xs font-bold">Pinned</span>
                      </div>

                      <p className="mt-1 text-sm font-black text-blue-800">
                        {item.isPinned ? "Yes" : "No"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-100 p-3">
                      <div className="flex items-center gap-2 text-slate-700">
                        {item.isVisible ? (
                          <Eye size={15} />
                        ) : (
                          <EyeOff size={15} />
                        )}
                        <span className="text-xs font-bold">Visibility</span>
                      </div>

                      <p className="mt-1 text-sm font-black text-slate-800">
                        {item.isVisible ? "Public" : "Hidden"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-200 pt-5 sm:grid-cols-3 xl:grid-cols-5">
                    <Button
                      variant="outline"
                      onClick={() => setDetailsQuestion(item)}
                      className="h-11 rounded-xl font-bold hover:bg-slate-900 hover:text-white"
                    >
                      <Eye size={16} className="mr-2" />
                      Details
                    </Button>
                    <Button
                      onClick={() => openReplyModal(item)}
                      className="h-11 rounded-xl bg-slate-950 font-bold text-white hover:bg-slate-800"
                    >
                      {item.status === "answered" ? (
                        <Pencil size={16} className="mr-2" />
                      ) : (
                        <Reply size={16} className="mr-2" />
                      )}

                      {item.status === "answered" ? "Edit Reply" : "Reply"}
                    </Button>

                    <Button
                      variant="outline"
                      disabled={isProcessing}
                      onClick={() => handleTogglePin(item._id, item.isPinned)}
                      className={cn(
                        "h-11 rounded-xl font-bold transition-all",
                        item.isPinned
                          ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-slate-900 hover:text-white"
                          : "hover:bg-blue-600 hover:text-white",
                      )}
                    >
                      {item.isPinned ? (
                        <PinOff size={16} className="mr-2" />
                      ) : (
                        <Pin size={16} className="mr-2" />
                      )}

                      {item.isPinned ? "Unpin" : "Pin"}
                    </Button>

                    <Button
                      variant="outline"
                      disabled={isProcessing}
                      onClick={() => handleToggleVisibility(item._id)}
                      className={`h-11 rounded-xl font-bold ${
                        item.isVisible
                          ? "hover:bg-amber-600 hover:text-white"
                          : "hover:bg-emerald-600 hover:text-white"
                      }`}
                    >
                      {item.isVisible ? (
                        <EyeOff size={16} className="mr-2" />
                      ) : (
                        <Eye size={16} className="mr-2" />
                      )}

                      {item.isVisible ? "Hide" : "Show"}
                    </Button>

                    <Button
                      variant="outline"
                      disabled={isProcessing}
                      onClick={() => handleDeleteQuestion(item._id)}
                      className="h-11 rounded-xl border-red-200 font-bold text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Reply / Edit Reply Modal */}
      {replyQuestion && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 px-3 py-6 pt-20 backdrop-blur-sm sm:px-5 sm:pt-24">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="relative border-b border-slate-200 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 px-5 py-5 text-white sm:px-7 sm:py-6">
              <button
                type="button"
                onClick={() => {
                  if (savingReply) return;

                  setReplyQuestion(null);
                  setReplyText("");
                }}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Close reply modal"
              >
                <X size={18} />
              </button>

              <div className="pr-12">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                      replyQuestion.status === "answered"
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                        : "border-amber-400/30 bg-amber-400/10 text-amber-200"
                    }`}
                  >
                    {replyQuestion.status === "answered" ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <Clock3 size={13} />
                    )}

                    {replyQuestion.status === "answered"
                      ? "Editing Official Reply"
                      : "Pending Customer Question"}
                  </span>

                  {replyQuestion.isPinned && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-bold text-blue-200">
                      <Pin size={13} className="fill-current" />
                      Pinned
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-black sm:text-2xl">
                  {replyQuestion.status === "answered"
                    ? "Edit Product Answer"
                    : "Reply to Product Question"}
                </h2>

                <p className="mt-1 text-sm text-slate-300">
                  Your response will be displayed publicly as an official
                  TechVault answer.
                </p>
              </div>
            </div>

            <div className="max-h-[calc(100vh-11rem)] overflow-y-auto p-4 sm:p-6">
              {/* Product */}
              {typeof replyQuestion.productId !== "string" && (
                <div className="mb-5 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white p-2">
                    <img
                      src={
                        replyQuestion.productId.images?.[0] ||
                        replyQuestion.productId.image ||
                        "/placeholder.png"
                      }
                      alt={replyQuestion.productId.name}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Product
                    </p>

                    <p className="mt-1 line-clamp-2 text-sm font-black text-slate-900 sm:text-base">
                      {replyQuestion.productId.name}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {replyQuestion.productId.category || "No category"}
                    </p>
                  </div>
                </div>
              )}

              {/* Customer Question */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">
                    Q
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Customer Question
                    </p>

                    <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm font-semibold leading-6 text-slate-800 sm:text-base">
                      {replyQuestion.question}
                    </p>

                    <div className="mt-4 flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
                      <span>
                        Asked by{" "}
                        <strong className="text-slate-700">
                          {replyQuestion.userId?.username || "Customer"}
                        </strong>
                      </span>

                      {replyQuestion.userId?.email && (
                        <span className="truncate">
                          {replyQuestion.userId.email}
                        </span>
                      )}

                      <span>
                        {new Date(replyQuestion.createdAt).toLocaleString(
                          "en-IN",
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reply Input */}
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="product-question-reply"
                    className="text-sm font-bold text-slate-800"
                  >
                    Official TechVault Reply
                  </label>

                  <span className="text-xs font-medium text-slate-400">
                    {replyText.length}/2000
                  </span>
                </div>

                <textarea
                  id="product-question-reply"
                  value={replyText}
                  onChange={(event) => setReplyText(event.target.value)}
                  rows={8}
                  maxLength={2000}
                  autoFocus
                  placeholder="Write a clear and helpful response to the customer..."
                  className="w-full resize-none rounded-2xl border border-slate-300 bg-white p-4 text-sm leading-6 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />

                <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                  <p className="text-xs leading-5 text-blue-800">
                    Keep the response accurate and product-specific. Customers
                    will see this as a verified official answer.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="hidden text-xs font-medium text-slate-400 sm:block">
                Press Ctrl + Enter to save
              </p>

              <div className="grid grid-cols-2 gap-3 sm:flex">
                <Button
                  type="button"
                  variant="outline"
                  disabled={savingReply}
                  onClick={() => {
                    setReplyQuestion(null);
                    setReplyText("");
                  }}
                  className="h-11 rounded-xl px-5 font-bold hover:bg-slate-900 hover:text-white"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  disabled={savingReply || !replyText.trim()}
                  onClick={handleSaveReply}
                  className="h-11 rounded-xl bg-slate-950 px-5 font-bold text-white hover:bg-slate-800"
                >
                  {savingReply ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : replyQuestion.status === "answered" ? (
                    <>
                      <Pencil size={16} className="mr-2" />
                      Update Reply
                    </>
                  ) : (
                    <>
                      <Send size={16} className="mr-2" />
                      Send Reply
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Question Details Modal */}
      {detailsQuestion && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 px-3 py-6 pt-20 backdrop-blur-sm sm:px-5 sm:pt-24">
          <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl">
            {/* Header */}
            <div className="relative overflow-hidden border-b border-slate-200 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 px-5 py-5 text-white sm:px-7 sm:py-6">
              <button
                type="button"
                onClick={() => setDetailsQuestion(null)}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
                aria-label="Close details modal"
              >
                <X size={18} />
              </button>

              <div className="pr-12">
                <div className="mb-3 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                      detailsQuestion.status === "answered"
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                        : "border-amber-400/30 bg-amber-400/10 text-amber-200"
                    }`}
                  >
                    {detailsQuestion.status === "answered" ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <Clock3 size={13} />
                    )}

                    {detailsQuestion.status === "answered"
                      ? "Answered"
                      : "Pending Reply"}
                  </span>

                  {detailsQuestion.isPinned && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-bold text-blue-200">
                      <Pin size={13} className="fill-current" />
                      Pinned
                    </span>
                  )}

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                      detailsQuestion.isVisible
                        ? "border-slate-400/30 bg-white/10 text-slate-200"
                        : "border-red-400/30 bg-red-400/10 text-red-200"
                    }`}
                  >
                    {detailsQuestion.isVisible ? (
                      <Eye size={13} />
                    ) : (
                      <EyeOff size={13} />
                    )}

                    {detailsQuestion.isVisible ? "Visible" : "Hidden"}
                  </span>
                </div>

                <h2 className="text-xl font-black sm:text-2xl">
                  Product Question Details
                </h2>

                <p className="mt-1 text-sm text-slate-300">
                  Review the full customer question and official response.
                </p>
              </div>
            </div>

            <div className="max-h-[calc(100vh-11rem)] overflow-y-auto p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                {/* Left Column */}
                <div className="space-y-5 lg:col-span-2">
                  {/* Product */}
                  {typeof detailsQuestion.productId !== "string" && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white p-2">
                          <img
                            src={
                              detailsQuestion.productId.images?.[0] ||
                              detailsQuestion.productId.image ||
                              "/placeholder.png"
                            }
                            alt={detailsQuestion.productId.name}
                            className="h-full w-full object-contain"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                            Product
                          </p>

                          <h3 className="mt-1 line-clamp-2 text-base font-black text-slate-900 sm:text-lg">
                            {detailsQuestion.productId.name}
                          </h3>

                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            {detailsQuestion.productId.category ||
                              "No category"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Question */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 font-black text-white">
                        Q
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                          Customer Question
                        </p>

                        <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm font-semibold leading-7 text-slate-800 sm:text-base">
                          {detailsQuestion.question}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Answer */}
                  {detailsQuestion.status === "answered" &&
                  detailsQuestion.answer ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                          <CheckCircle2 size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700">
                            Official TechVault Reply
                          </p>

                          <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-7 text-slate-700 sm:text-base">
                            {detailsQuestion.answer}
                          </p>

                          {detailsQuestion.answeredBy && (
                            <p className="mt-4 text-xs font-semibold text-emerald-800">
                              Answered by{" "}
                              {detailsQuestion.answeredBy.username || "Admin"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-5">
                      <div className="flex items-start gap-3">
                        <Clock3
                          size={19}
                          className="mt-0.5 shrink-0 text-amber-700"
                        />

                        <div>
                          <p className="font-bold text-amber-900">
                            Awaiting admin response
                          </p>

                          <p className="mt-1 text-sm text-amber-700">
                            This question has not yet received an official
                            answer.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Sidebar */}
                <div className="space-y-4">
                  {/* Customer */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 font-black text-white">
                        {(detailsQuestion.userId?.username || "C")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                          Customer
                        </p>

                        <p className="truncate text-sm font-bold text-slate-900">
                          {detailsQuestion.userId?.username || "Customer"}
                        </p>

                        {detailsQuestion.userId?.email && (
                          <p className="truncate text-xs text-slate-500">
                            {detailsQuestion.userId.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Votes */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-emerald-50 p-4">
                      <ThumbsUp size={18} className="text-emerald-700" />

                      <p className="mt-2 text-xs font-bold text-emerald-700">
                        Likes
                      </p>

                      <p className="mt-1 text-2xl font-black text-emerald-900">
                        {detailsQuestion.likes?.length || 0}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-red-50 p-4">
                      <ThumbsDown size={18} className="text-red-700" />

                      <p className="mt-2 text-xs font-bold text-red-700">
                        Dislikes
                      </p>

                      <p className="mt-1 text-2xl font-black text-red-900">
                        {detailsQuestion.dislikes?.length || 0}
                      </p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Timeline
                    </p>

                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500">
                          Asked
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {new Date(detailsQuestion.createdAt).toLocaleString(
                            "en-IN",
                          )}
                        </p>
                      </div>

                      {detailsQuestion.answeredAt && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500">
                            Answered
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-800">
                            {new Date(
                              detailsQuestion.answeredAt,
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>
                      )}

                      {detailsQuestion.updatedAt && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500">
                            Last Updated
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-800">
                            {new Date(detailsQuestion.updatedAt).toLocaleString(
                              "en-IN",
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Question ID */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Question ID
                    </p>

                    <p className="mt-2 break-all font-mono text-xs font-semibold text-slate-600">
                      {detailsQuestion._id}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
              <Button
                variant="outline"
                onClick={() => setDetailsQuestion(null)}
                className="h-11 rounded-xl px-5 font-bold hover:bg-slate-900 hover:text-white"
              >
                Close
              </Button>

              <Button
                onClick={() => {
                  const currentQuestion = detailsQuestion;

                  setDetailsQuestion(null);
                  openReplyModal(currentQuestion);
                }}
                className="h-11 rounded-xl bg-slate-950 px-5 font-bold text-white hover:bg-slate-800"
              >
                {detailsQuestion.status === "answered" ? (
                  <>
                    <Pencil size={16} className="mr-2" />
                    Edit Reply
                  </>
                ) : (
                  <>
                    <Reply size={16} className="mr-2" />
                    Reply Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
