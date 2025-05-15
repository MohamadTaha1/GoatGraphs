import { getFirestore, type Firestore } from "firebase/firestore"
import { getFirebaseApp } from "./app"

let db: Firestore | undefined
let initializationAttempted = false

// Export a function to get Firestore that ensures it's only called client-side
export function getFirestoreInstance() {
  if (typeof window === "undefined") {
    console.log("Firestore can only be accessed in the browser")
    return undefined
  }

  if (db) {
    return db
  }

  if (initializationAttempted) {
    console.log("Firestore initialization already attempted")
    return undefined
  }

  try {
    initializationAttempted = true
    const app = getFirebaseApp()

    if (!app) {
      console.error("Firebase app is not initialized, cannot get Firestore")
      return undefined
    }

    db = getFirestore(app)
    console.log("Firestore instance created successfully")
    return db
  } catch (error) {
    console.error("Error getting Firestore instance:", error)
    return undefined
  }
}

// Provide a fallback mechanism for when Firestore is unavailable
export function getFirestoreFallbackData(collection: string) {
  console.log(`Using fallback data for collection: ${collection}`)

  // Return appropriate fallback data based on collection name
  switch (collection) {
    case "products":
      return [
        { id: "fallback1", name: "Fallback Product 1", price: 99.99, stock: 10 },
        { id: "fallback2", name: "Fallback Product 2", price: 149.99, stock: 5 },
      ]
    case "orders":
      return [{ id: "order1", status: "completed", total: 249.98, date: new Date().toISOString() }]
    default:
      return []
  }
}

// Export db directly for compatibility with existing code
export { db }
