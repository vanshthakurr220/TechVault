import { ReactNode } from "react";
import { useApp } from "@/contexts/AppContext";
import NotFound from "@/pages/NotFound";
import Unauthorized from "@/pages/Unauthorized";
import AccessDenied from "@/pages/AccessDenied";

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({
  children,
  adminOnly = false,
}: ProtectedRouteProps) {
  const { userLoggedIn, user, authLoading } = useApp();

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  // Not logged in
  if (!userLoggedIn) {
    return <Unauthorized />;
  }

  // Admin route but user isn't admin
  if (adminOnly && user?.role !== "admin") {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
