import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: any): string {
  // Handle undefined or null
  if (price === undefined || price === null) {
    return "0.00"
  }

  // Convert to number if it's a string
  const numPrice = typeof price === "string" ? Number.parseFloat(price) : price

  // Check if it's a valid number
  if (isNaN(numPrice)) {
    return "0.00"
  }

  // Format with 2 decimal places
  return numPrice.toFixed(2)
}
