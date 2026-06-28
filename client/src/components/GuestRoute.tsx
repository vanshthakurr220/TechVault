import { ReactNode } from "react";
import { useApp } from "@/contexts/AppContext";
import NotFound from "@/pages/NotFound";

interface GuestRouteProps {
  children: ReactNode;
}

export default function GuestRoute({ children }: GuestRouteProps) {
  const { userLoggedIn, authLoading } = useApp();

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  if (userLoggedIn) {
    return <NotFound />;
  }

  return <>{children}</>;
}
