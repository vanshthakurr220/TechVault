import { Loader2, PackageSearch } from "lucide-react";

interface LoaderProps {
  text?: string;
  variant?: "page" | "section" | "button";
}

export default function Loader({
  text = "Loading...",
  variant = "section",
}: LoaderProps) {
  if (variant === "button") {
    return (
      <span className="inline-flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{text}</span>
      </span>
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${
        variant === "page" ? "min-h-screen" : "min-h-75"
      }`}
    >
      <div className="flex flex-col items-center gap-5 rounded-2xl border bg-white/80 px-10 py-8 shadow-lg backdrop-blur-sm">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-gray-200 border-t-black animate-spin" />

          <div className="absolute inset-0 flex items-center justify-center">
            <PackageSearch className="h-7 w-7 text-gray-800" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-base font-semibold text-gray-900">{text}</p>
          <p className="mt-1 text-sm text-gray-500">
            Please wait while we fetch the latest data
          </p>
        </div>
      </div>
    </div>
  );
}
