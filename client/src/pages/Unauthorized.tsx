import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, LogIn, UserPlus } from "lucide-react";
import { Link } from "wouter";

export default function Unauthorized() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
      <Card className="w-full max-w-lg mx-4 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardContent className="pt-10 pb-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-100 rounded-full animate-pulse" />
              <Lock className="relative h-16 w-16 text-amber-500" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-slate-900 mb-2">401</h1>

          <h2 className="text-2xl font-semibold text-slate-800 mb-4">
            Authentication Required
          </h2>

          <p className="text-slate-600 leading-relaxed mb-8">
            Please sign in or create an account to access this page and
            continue.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login">
              <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-6">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>

            <Link href="/signup">
              <Button variant="outline" className="w-full sm:w-auto px-6 hover:bg-gray-100">
                <UserPlus className="w-4 h-4 mr-2" />
                Create Account
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Already have an account? Sign in to continue. New here? Create an
            account in just a few steps.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
