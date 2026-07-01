import { createContext, useContext, useState, ReactNode } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

type NotificationType = "success" | "error" | "warning" | "info";

interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = (type: NotificationType, message: string) => {
    const id = Date.now();

    setNotifications((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    }, 2200);
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const styles = {
    success: {
      icon: <CheckCircle size={22} />,
      className:
        "border-green-200 bg-green-50/95 text-green-700 shadow-green-500/20",
    },
    error: {
      icon: <XCircle size={22} />,
      className: "border-red-200 bg-red-50/95 text-red-700 shadow-red-500/20",
    },
    warning: {
      icon: <AlertTriangle size={22} />,
      className:
        "border-amber-200 bg-amber-50/95 text-amber-700 shadow-amber-500/20",
    },
    info: {
      icon: <Info size={22} />,
      className:
        "border-blue-200 bg-blue-50/95 text-blue-700 shadow-blue-500/20",
    },
  };

  return (
    <NotificationContext.Provider
      value={{
        success: (message: string) => notify("success", message),
        error: (message: string) => notify("error", message),
        warning: (message: string) => notify("warning", message),
        info: (message: string) => notify("info", message),
      }}
    >
      {children}

      <style>{`
        @keyframes notificationEnter {
          0% {
            opacity: 0;
            transform: translateY(-24px) translateX(24px) scale(0.92);
          }
          60% {
            opacity: 1;
            transform: translateY(4px) translateX(0) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) translateX(0) scale(1);
          }
        }

        @keyframes iconPop {
          0% {
            opacity: 0;
            transform: scale(0.4) rotate(-12deg);
          }
          70% {
            opacity: 1;
            transform: scale(1.18) rotate(4deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes softFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        .notification-card {
          animation:
            notificationEnter 0.45s cubic-bezier(0.22, 1, 0.36, 1),
            softFloat 2.8s ease-in-out 0.5s infinite;
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .notification-card:hover {
          transform: translateY(-3px);
        }

        .notification-icon {
          animation: iconPop 0.38s ease-out;
        }
      `}</style>

      <div className="fixed top-5 right-5 z-999999 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:top-6 sm:right-6">
        {notifications.map((item) => (
          <div
            key={item.id}
            className={`
              notification-card
              relative overflow-hidden
              flex items-start gap-3 rounded-2xl border px-5 py-4
              shadow-2xl backdrop-blur-xl
              ${styles[item.type].className}
            `}
          >
            <div className="notification-icon mt-0.5 shrink-0">
              {styles[item.type].icon}
            </div>

            <div className="flex-1">
              <p className="font-bold capitalize tracking-tight">{item.type}</p>

              <p className="mt-1 text-sm font-medium leading-5 opacity-90">
                {item.message}
              </p>
            </div>

            <button
              onClick={() => removeNotification(item.id)}
              className="rounded-full p-1 opacity-60 transition-all hover:bg-black/5 hover:opacity-100 active:scale-90"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotification must be used inside NotificationProvider");
  }

  return context;
};
