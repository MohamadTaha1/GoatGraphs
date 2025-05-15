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

/**
 * Generates a random code of specified length
 * @param length Length of the code
 * @param numbersOnly Whether to use only numbers (default: false)
 * @returns Random code
 */
export function generateRandomCode(length: number, numbersOnly = false): string {
  const characters = numbersOnly ? "0123456789" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  const charactersLength = characters.length

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  return result
}
