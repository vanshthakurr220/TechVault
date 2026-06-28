import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, Home } from "lucide-react";
import { Link } from "wouter";

export default function AccessDenied() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
      <Card className="w-full max-w-lg mx-4 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardContent className="pt-10 pb-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse" />
              <ShieldAlert className="relative h-16 w-16 text-red-500" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-slate-900 mb-2">403</h1>

          <h2 className="text-2xl font-semibold text-slate-800 mb-4">
            Access Denied
          </h2>

          <p className="text-slate-600 leading-relaxed mb-8">
            You don't have permission to access this page.
            <br />
            This area is restricted to administrators only.
          </p>

          <div className="flex justify-center">
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90 text-white px-6">
                <Home className="w-4 h-4 mr-2" />
                Return to Home
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            If you believe this is an error, please contact an administrator.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
