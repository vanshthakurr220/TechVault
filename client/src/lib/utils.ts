import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRatingColorClass(rating: number) {
  const roundedRating = Math.round(rating);

  if (roundedRating <= 1) return "fill-red-500 text-red-500";
  if (roundedRating === 2) return "fill-orange-500 text-orange-500";
  if (roundedRating === 3) return "fill-yellow-400 text-yellow-400";
  if (roundedRating === 4) return "fill-lime-500 text-lime-500";
  return "fill-green-500 text-green-500";
}

export function getRatingColorHex(rating: number) {
  const roundedRating = Math.round(rating);

  if (roundedRating <= 1) return "#ef4444";
  if (roundedRating === 2) return "#f97316";
  if (roundedRating === 3) return "#facc15";
  if (roundedRating === 4) return "#84cc16";
  return "#22c55e";
}
