/**
 * Safely converts a Firebase timestamp to a JavaScript Date
 * @param timestamp Firebase timestamp or date string or number
 * @returns JavaScript Date object or null if invalid
 */
export function convertTimestampToDate(timestamp: any): Date | null {
  if (!timestamp) return null

  try {
    // If it's a Firebase Timestamp
    if (timestamp && typeof timestamp.toDate === "function") {
      return timestamp.toDate()
    }

    // If it's a Date object already
    if (timestamp instanceof Date) {
      return timestamp
    }

    // If it's a number (milliseconds since epoch)
    if (typeof timestamp === "number") {
      return new Date(timestamp)
    }

    // If it's a string (ISO date string)
    if (typeof timestamp === "string") {
      return new Date(timestamp)
    }

    return null
  } catch (error) {
    console.error("Error converting timestamp:", error)
    return null
  }
}

/**
 * Safely parses a number from various input types
 * @param value Value to parse as number
 * @param defaultValue Default value if parsing fails
 * @returns Parsed number or default value
 */
export function parseNumber(value: any, defaultValue = 0): number {
  if (value === undefined || value === null) return defaultValue

  const parsed = Number(value)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Safely extracts data from a Firebase document
 * @param doc Firebase document
 * @returns Document data with ID
 */
export function extractDocData(doc: any): any {
  if (!doc) return null

  try {
    const data = doc.data ? doc.data() : doc
    return {
      id: doc.id || data.id || null,
      ...data,
    }
  } catch (error) {
    console.error("Error extracting document data:", error)
    return { id: doc.id || null }
  }
}

/**
 * Format price with proper decimal places
 * @param price Price to format
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
