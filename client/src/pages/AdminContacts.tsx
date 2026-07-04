import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import {
  Trash2,
  Search,
  Mail,
  MailOpen,
  Clock,
  User,
  X,
  Inbox,
  AlertCircle,
  CheckCheck,
} from "lucide-react";
import Swal from "sweetalert2";
import { useApp } from "@/contexts/AppContext";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  isRead?: boolean;
}

export default function AdminContacts() {
  const { allContacts, deleteContact, markContactAsRead } = useApp();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null,
  );
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

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
          (filter === "read" && msg.isRead);

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div
          onClick={() => setFilter("all")}
          className={`cursor-pointer p-6 rounded-3xl border transition-all ${filter === "all" ? "bg-white border-primary shadow-md ring-1 ring-primary" : "bg-white shadow-sm hover:border-slate-300"}`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-2xl text-slate-600">
              <Inbox size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Messages</p>
              <h3 className="text-2xl font-bold">{stats.total}</h3>
            </div>
          </div>
        </div>
        <div
          onClick={() => setFilter("unread")}
          className={`cursor-pointer p-6 rounded-3xl border transition-all ${filter === "unread" ? "bg-white border-amber-500 shadow-md ring-1 ring-amber-500" : "bg-white shadow-sm hover:border-slate-300"}`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
              <Mail size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unread</p>
              <h3 className="text-2xl font-bold">{stats.unread}</h3>
            </div>
          </div>
        </div>
        <div
          onClick={() => setFilter("read")}
          className={`cursor-pointer p-6 rounded-3xl border transition-all ${filter === "read" ? "bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500" : "bg-white shadow-sm hover:border-slate-300"}`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
              <MailOpen size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Read</p>
              <h3 className="text-2xl font-bold">{stats.read}</h3>
            </div>
          </div>
        </div>
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                setSearchTerm("");
                setFilter("all");
              }}
            >
              Reset
            </Button>
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
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm shrink-0 ${!msg.isRead ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}
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
                    <p className="text-xs text-slate-500 mb-2 truncate">
                      {msg.email}
                    </p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center text-xl font-bold">
                  {selectedMessage.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold leading-tight">
                    {selectedMessage.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedMessage.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="flex flex-wrap gap-4">
                <div className="px-4 py-2 bg-slate-100 rounded-xl flex items-center gap-2 text-xs font-medium text-slate-600">
                  <Clock size={14} /> Received:{" "}
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </div>
                {selectedMessage.isRead ? (
                  <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl flex items-center gap-2 text-xs font-medium">
                    <CheckCheck size={14} /> Message Read
                  </div>
                ) : (
                  <div className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl flex items-center gap-2 text-xs font-medium">
                    <AlertCircle size={14} /> Unread Message
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Mail size={16} /> Message Content
                </h4>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t bg-slate-50 flex gap-3">
              <Button
                variant="destructive"
                className="rounded-xl flex-1 h-11 font-bold gap-2"
                onClick={() => deleteMessage(selectedMessage._id)}
              >
                <Trash2 size={18} /> Delete Message
              </Button>
              <Button
                variant="outline"
                className="rounded-xl flex-1 h-11 font-bold border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-200"
                onClick={() => setSelectedMessage(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
