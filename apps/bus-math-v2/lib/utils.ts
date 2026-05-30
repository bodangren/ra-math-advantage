import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges clsx class values with tailwind-merge for deduplication.
 * @param inputs - Class values to merge
 * @returns Merged class string with tailwind-merge deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
