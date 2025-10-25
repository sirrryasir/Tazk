import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS class names safely
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
