import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useState, useEffect, useMemo } from "react";
import {
  Trash2,
  Search,
  Mail,
  MailOpen,
  Clock,
  X,
  Inbox,
  AlertCircle,
  CheckCheck,
  Send,
  Loader2,
  Reply,
} from "lucide-react";
import Swal from "sweetalert2";
import { useApp } from "@/contexts/AppContext";
import { useNotification } from "@/components/Notification";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";

interface ContactReply {
  _id?: string;
  message: string;
  repliedAt: string;
}

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  isRead?: boolean;
  replies?: ContactReply[];
}

export default function AdminContacts() {
  const [singleDownloadOpen, setSingleDownloadOpen] = useState(false);
  const { allContacts, deleteContact, markContactAsRead, accessToken } =
    useApp();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null,
  );
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "unread" | "read" | "replied" | "pendingReply"
  >("all");

  useEffect(() => {
    setMessages(Array.isArray(allContacts) ? allContacts : []);
  }, [allContacts]);

  const deleteMessage = async (_id: string) => {
    const result = await Swal.fire({
      title: "Delete Message?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteContact(_id);

      if (selectedMessage?._id === _id) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const markAsRead = async (_id: string) => {
    try {
      await markContactAsRead(_id);
      if (selectedMessage?._id === _id) {
        setSelectedMessage((prev) => (prev ? { ...prev, isRead: true } : null));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredMessages = useMemo(() => {
    return messages
      .filter((msg) => {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          msg.name.toLowerCase().includes(search) ||
          msg.email.toLowerCase().includes(search) ||
          msg.message.toLowerCase().includes(search);

        const matchesFilter =
          filter === "all" ||
          (filter === "unread" && !msg.isRead) ||
          (filter === "read" && msg.isRead) ||
          (filter === "replied" && (msg.replies?.length ?? 0) > 0) ||
          (filter === "pendingReply" && (msg.replies?.length ?? 0) === 0);

        return matchesSearch && matchesFilter;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [messages, searchTerm, filter]);

  const stats = useMemo(
    () => ({
      total: messages.length,
      unread: messages.filter((m) => !m.isRead).length,
      read: messages.filter((m) => m.isRead).length,
      replied: messages.filter((m) => (m.replies?.length ?? 0) > 0).length,
      pendingReply: messages.filter((m) => (m.replies?.length ?? 0) === 0)
        .length,
    }),
    [messages],
  );

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now.getTime() - past.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return past.toLocaleDateString();
  };

  const notify = useNotification();

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) {
      notify.warning("Reply required, Please write a reply message.");
      return;
    }

    try {
      setSendingReply(true);

      const response = await api("/api/admin/replyContact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          contactId: selectedMessage._id,
          replyMessage: replyText.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reply");
      }

      setSelectedMessage(data.contact);

      setMessages((prev) =>
        prev.map((msg) => (msg._id === data.contact._id ? data.contact : msg)),
      );

      setReplyText("");
      setReplyOpen(false);

      notify.success("Your reply has been sent.");
    } catch (error: any) {
      console.error(error);
      notify.error("Failed to send reply.");
    } finally {
      setSendingReply(false);
    }
  };

  const sortedReplies = [...(selectedMessage?.replies ?? [])].sort(
    (a, b) => new Date(b.repliedAt).getTime() - new Date(a.repliedAt).getTime(),
  );

  const hasReply = (message: ContactMessage) =>
    (message.replies?.length ?? 0) > 0;

  const replyTemplates = [
    "Thank you for contacting us. We have received your message and will assist you shortly.",
    "Your issue has been resolved. Please let us know if you need any further help.",
    "We are looking into your issue and will get back to you as soon as possible.",
    "Please provide more information so we can better understand and resolve your issue.",
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC closes the message modal
      if (e.key === "Escape" && selectedMessage) {
        setSelectedMessage(null);
        setReplyOpen(false);
        setReplyText("");
        return;
      }

      // Ctrl + Enter sends reply
      if (
        e.ctrlKey &&
        e.key === "Enter" &&
        replyOpen &&
        selectedMessage &&
        replyText.trim() &&
        !sendingReply
      ) {
        e.preventDefault();
        handleSendReply();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMessage, replyOpen, replyText, sendingReply, handleSendReply]);

  const exportData = filteredMessages.map((msg) => ({
    Name: msg.name,
    Email: msg.email,
    Message: msg.message,
    Received: new Date(msg.createdAt).toLocaleString("en-IN"),
    ReadStatus: msg.isRead ? "Read" : "Unread",
    ReplyStatus: (msg.replies?.length ?? 0) > 0 ? "Replied" : "Pending Reply",
    Replies: msg.replies?.length ?? 0,
  }));

  const exportCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "contact-messages.csv";
    link.click();
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Messages");
    XLSX.writeFile(workbook, "contact-messages.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Contact Messages", 14, 18);

    autoTable(doc, {
      startY: 28,
      head: [["Name", "Email", "Received", "Read", "Reply"]],
      body: filteredMessages.map((msg) => [
        msg.name,
        msg.email,
        new Date(msg.createdAt).toLocaleString("en-IN"),
        msg.isRead ? "Read" : "Unread",
        (msg.replies?.length ?? 0) > 0 ? "Replied" : "Pending Reply",
      ]),
    });

    doc.save("contact-messages.pdf");
  };

  const getSingleMessageExportData = (message: ContactMessage) => ({
    Name: message.name,
    Email: message.email,
    Received: new Date(message.createdAt).toLocaleString("en-IN"),
    ReadStatus: message.isRead ? "Read" : "Unread",
    ReplyStatus:
      (message.replies?.length ?? 0) > 0 ? "Replied" : "Pending Reply",
    Message: message.message,
    Replies:
      message.replies
        ?.map(
          (reply, index) =>
            `Reply #${index + 1} - ${new Date(reply.repliedAt).toLocaleString("en-IN")}\n${reply.message}`,
        )
        .join("\n\n") || "No replies",
  });

  const exportSingleMessageCSV = (message: ContactMessage) => {
    const worksheet = XLSX.utils.json_to_sheet([
      getSingleMessageExportData(message),
    ]);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${message.name.replace(/\s+/g, "_")}_message.csv`;
    link.click();
  };

  const exportSingleMessageExcel = (message: ContactMessage) => {
    const worksheet = XLSX.utils.json_to_sheet([
      getSingleMessageExportData(message),
    ]);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Message");
    XLSX.writeFile(
      workbook,
      `${message.name.replace(/\s+/g, "_")}_message.xlsx`,
    );
  };

  const exportSingleMessagePDF = (message: ContactMessage) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Customer Message", 14, 18);

    autoTable(doc, {
      startY: 28,
      theme: "grid",
      body: [
        ["Name", message.name],
        ["Email", message.email],
        ["Received", new Date(message.createdAt).toLocaleString("en-IN")],
        ["Read Status", message.isRead ? "Read" : "Unread"],
        [
          "Reply Status",
          (message.replies?.length ?? 0) > 0 ? "Replied" : "Pending Reply",
        ],
      ],
    });

    let y = (doc as any).lastAutoTable.finalY + 12;

    doc.setFontSize(14);
    doc.text("Customer Message", 14, y);
    y += 8;

    doc.setFontSize(11);
    const messageLines = doc.splitTextToSize(message.message, 180);
    doc.text(messageLines, 14, y);
    y += messageLines.length * 6 + 14;

    if (message.replies?.length) {
      doc.setFontSize(14);
      doc.text("Replies", 14, y);
      y += 8;

      message.replies.forEach((reply, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(11);
        doc.text(
          `Reply #${index + 1} - ${new Date(reply.repliedAt).toLocaleString("en-IN")}`,
          14,
          y,
        );

        y += 6;

        const replyLines = doc.splitTextToSize(reply.message, 180);
        doc.text(replyLines, 18, y);

        y += replyLines.length * 6 + 10;
      });
    }

    doc.save(`${message.name.replace(/\s+/g, "_")}_message.pdf`);
  };

  const avatarColors = [
    "bg-blue-600 text-white",
    "bg-emerald-600 text-white",
    "bg-violet-600 text-white",
    "bg-amber-500 text-white",
    "bg-rose-600 text-white",
    "bg-cyan-600 text-white",
    "bg-fuchsia-600 text-white",
    "bg-slate-700 text-white",
  ];

  const getAvatarColor = (email: string) => {
    let hash = 0;

    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }

    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  return (
    <div className="animate-fade-in mt-8 px-4 md:px-6 pb-20">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold">Message Inbox</h2>
        <p className="text-muted-foreground mt-1">
          Manage customer inquiries and support requests.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        {[
          {
            key: "all",
            label: "Total Messages",
            value: stats.total,
            icon: Inbox,
            color: "slate",
          },
          {
            key: "unread",
            label: "Unread",
            value: stats.unread,
            icon: Mail,
            color: "amber",
          },
          {
            key: "read",
            label: "Read",
            value: stats.read,
            icon: MailOpen,
            color: "emerald",
          },
          {
            key: "replied",
            label: "Replied",
            value: stats.replied,
            icon: CheckCheck,
            color: "emerald",
          },
          {
            key: "pendingReply",
            label: "Pending Reply",
            value: stats.pendingReply,
            icon: Reply,
            color: "amber",
          },
        ].map((card) => {
          const Icon = card.icon;
          const isActive = filter === card.key;

          return (
            <div
              key={card.key}
              onClick={() => setFilter(card.key as any)}
              className={`cursor-pointer p-6 rounded-3xl border transition-all bg-white shadow-sm hover:border-slate-300 ${
                isActive
                  ? card.color === "amber"
                    ? "border-amber-500 ring-1 ring-amber-500 shadow-md"
                    : card.color === "emerald"
                      ? "border-emerald-500 ring-1 ring-emerald-500 shadow-md"
                      : "border-primary ring-1 ring-primary shadow-md"
                  : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-2xl ${
                    card.color === "amber"
                      ? "bg-amber-100 text-amber-600"
                      : card.color === "emerald"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Icon size={24} />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <h3 className="text-2xl font-bold">{card.value}</h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inbox Container */}
      <div className="bg-white rounded-4x1 border shadow-sm overflow-hidden flex flex-col min-h-150">
        {/* Search & Filter Bar */}
        <div className="p-6 border-b bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search by name, email, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-10 pr-4 border rounded-xl bg-white w-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-xl hover:bg-slate-900 hover:text-white"
              onClick={exportCSV}
            >
              <Download size={16} className="mr-2" />
              CSV
            </Button>

            <Button
              variant="outline"
              className="rounded-xl hover:bg-slate-900 hover:text-white"
              onClick={exportExcel}
            >
              <Download size={16} className="mr-2" />
              Excel
            </Button>

            <Button
              variant="outline"
              className="rounded-xl hover:bg-slate-900 hover:text-white"
              onClick={exportPDF}
            >
              <Download size={16} className="mr-2" />
              PDF
            </Button>

            <Button
              variant="outline"
              className="rounded-xl hover:bg-slate-900 hover:text-white"
              onClick={() => {
                setSearchTerm("");
                setFilter("all");
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Note */}
        <div className="mx-4 sm:mx-6 mt-4 mb-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-start gap-2">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Note:</span> Unread messages are
              automatically marked as{" "}
              <span className="font-semibold">Read</span> when opened.
            </p>
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-20 text-center text-muted-foreground">
              Loading messages...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Mail size={32} />
              </div>
              <div>
                <h4 className="font-bold text-lg">No messages found</h4>
                <p className="text-muted-foreground">
                  Your inbox is currently empty for this filter.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {filteredMessages.map((msg) => (
                <div
                  key={msg._id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (!msg.isRead) markAsRead(msg._id);
                  }}
                  className={`p-6 flex items-start gap-4 cursor-pointer transition-colors hover:bg-slate-50 relative ${!msg.isRead ? "bg-blue-50/30" : ""}`}
                >
                  {!msg.isRead && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  )}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm shrink-0 ${getAvatarColor(msg.email)}`}
                  >
                    {msg.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4
                        className={`text-sm truncate pr-4 ${!msg.isRead ? "font-bold text-slate-900" : "font-medium text-slate-600"}`}
                      >
                        {msg.name}
                      </h4>
                      <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap flex items-center gap-1">
                        <Clock size={10} /> {getTimeAgo(msg.createdAt)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <p className="text-xs text-slate-500 truncate">
                        {msg.email}
                      </p>

                      {hasReply(msg) ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                          Replied
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                          <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                          Pending Reply
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs line-clamp-1 ${!msg.isRead ? "text-slate-800 font-medium" : "text-slate-500"}`}
                    >
                      {msg.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Details Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 backdrop-blur-md p-3 sm:p-5 pt-20 sm:pt-24 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl overflow-hidden rounded-[1.75rem] sm:rounded-[2rem] bg-white shadow-[0_25px_80px_rgba(15,23,42,0.35)] ring-1 ring-white/20 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-5 py-5 sm:px-7 sm:py-6">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-blue-500/20 blur-3xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-black shadow-lg sm:h-14 sm:w-14 sm:text-xl ${getAvatarColor(selectedMessage.email)}`}>
                    {selectedMessage.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-black text-white sm:text-xl">
                      {selectedMessage.name}
                    </h3>
                    <p className="mt-1 break-all text-xs font-medium text-slate-300 sm:text-sm">
                      {selectedMessage.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedMessage(null);
                    setSingleDownloadOpen(false);
                  }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white hover:text-slate-950"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="max-h-[70vh] overflow-y-auto bg-slate-50/80 px-4 py-5 sm:px-7 sm:py-7">
              <div className="space-y-6">
                {/* Status Row */}
                {/* Message Details Card */}
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                  <h4 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    <Inbox size={16} />
                    Message Details
                  </h4>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                        From
                      </p>
                      <p className="mt-1 break-words text-sm font-bold text-slate-800">
                        {selectedMessage.name}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Email
                      </p>
                      <p className="mt-1 break-all text-sm font-bold text-slate-800">
                        {selectedMessage.email}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Received
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {new Date(selectedMessage.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}{" "}
                        •{" "}
                        {new Date(selectedMessage.createdAt).toLocaleTimeString(
                          "en-IN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          },
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Status
                      </p>

                      {selectedMessage.isRead ? (
                        <span className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
                          <CheckCheck size={14} />
                          Read
                        </span>
                      ) : (
                        <span className="mt-2 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700">
                          <AlertCircle size={14} />
                          Unread
                        </span>
                      )}

                      {selectedMessage.replies?.length ? (
                        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 mx-2">
                          <CheckCheck size={14} />
                          Replied
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-700 shadow-sm">
                          <Reply size={14} />
                          Pending Reply
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                  <h4 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    <Mail size={16} />
                    Message Content
                  </h4>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-7 text-slate-700 sm:p-5 sm:text-[15px]">
                    <p className="whitespace-pre-wrap break-words">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                {/* Previous Replies */}
                {selectedMessage.replies &&
                  selectedMessage.replies.length > 0 && (
                    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                          <Reply size={16} />
                          Previous Replies
                        </h4>

                        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500">
                          {selectedMessage.replies.length} sent
                        </span>
                      </div>

                      <div className="space-y-4">
                        {selectedMessage.replies
                          .slice()
                          .sort(
                            (a, b) =>
                              new Date(b.repliedAt).getTime() -
                              new Date(a.repliedAt).getTime(),
                          )
                          .map((reply, index) => (
                            <div
                              key={reply._id || index}
                              className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm"
                            >
                              <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white shadow-sm">
                                    TV
                                  </div>

                                  <div>
                                    <p className="text-sm font-black text-slate-800">
                                      TechVault Support
                                    </p>
                                    {sortedReplies.map((reply, index) => (
                                      <p className="text-xs font-semibold text-slate-400">
                                        Reply #{sortedReplies.length - index}
                                      </p>
                                    ))}
                                  </div>
                                </div>

                                <span className="text-xs font-semibold text-slate-400">
                                  {new Date(reply.repliedAt).toLocaleString()}
                                </span>
                              </div>

                              <div className="px-4 py-4 sm:px-5 sm:py-5">
                                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                                  {reply.message}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Reply Box */}
                {replyOpen && (
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <h4 className="flex min-w-0 items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                        <Reply size={16} className="shrink-0" />
                        <span className="truncate normal-case tracking-normal">
                          Reply to {selectedMessage.email}
                        </span>
                      </h4>

                      <button
                        type="button"
                        onClick={() => {
                          setReplyOpen(false);
                          setReplyText("");
                        }}
                        className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 transition-all hover:bg-slate-900 hover:text-white"
                      >
                        <X size={15} />
                        Close
                      </button>
                    </div>

                    <div className="mb-4">
                      <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                        Quick Reply Template
                      </label>

                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            setReplyText(e.target.value);
                          }
                        }}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/10"
                      >
                        <option value="">Choose Template</option>

                        {replyTemplates.map((template, index) => (
                          <option key={index} value={template}>
                            {template}
                          </option>
                        ))}
                      </select>
                    </div>

                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a clear and helpful reply..."
                      rows={6}
                      className="min-h-[150px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/10 sm:min-h-[180px]"
                    />

                    <div className="mt-4 flex justify-end">
                      <Button
                        onClick={handleSendReply}
                        disabled={sendingReply}
                        className="h-11 w-full rounded-xl bg-slate-950 px-6 font-black text-white shadow-lg shadow-slate-950/20 transition-all hover:bg-slate-800 sm:w-auto"
                      >
                        {sendingReply ? (
                          <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
                            Sending...
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
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-7 sm:py-5">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  className="h-11 flex-1 rounded-xl border-slate-300 font-black text-slate-700 transition-all hover:border-slate-950 hover:bg-slate-950 hover:text-white"
                  onClick={() => setReplyOpen((prev) => !prev)}
                >
                  <Reply size={18} className="mr-2" />
                  {replyOpen ? "Hide Reply Box" : "Reply"}
                </Button>
                <div className="relative flex-1">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setSingleDownloadOpen((prev) => !prev)}
                    className="h-11 w-full rounded-xl border-slate-300 font-black text-slate-700 transition-all hover:border-slate-950 hover:bg-slate-950 hover:text-white"
                  >
                    <Download size={18} className="mr-2" />
                    Download
                  </Button>

                  {singleDownloadOpen && (
                    <div className="absolute bottom-full left-0 z-[70] mb-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                      <button
                        type="button"
                        onClick={() => {
                          exportSingleMessageCSV(selectedMessage);
                          setSingleDownloadOpen(false);
                        }}
                        className="block w-full px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-950 hover:text-white"
                      >
                        Download CSV
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          exportSingleMessageExcel(selectedMessage);
                          setSingleDownloadOpen(false);
                        }}
                        className="block w-full px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-950 hover:text-white"
                      >
                        Download Excel
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          exportSingleMessagePDF(selectedMessage);
                          setSingleDownloadOpen(false);
                        }}
                        className="block w-full px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-950 hover:text-white"
                      >
                        Download PDF
                      </button>
                    </div>
                  )}
                </div>

                <Button
                  variant="destructive"
                  className="h-11 flex-1 rounded-xl font-black shadow-lg shadow-red-500/20"
                  onClick={() => deleteMessage(selectedMessage._id)}
                >
                  <Trash2 size={18} className="mr-2" />
                  Delete Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
