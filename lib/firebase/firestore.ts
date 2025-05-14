import { getFirestore, type Firestore } from "firebase/firestore"
import { getFirebaseApp } from "./app"

let db: Firestore | undefined

// Export a function to get Firestore that ensures it's only called client-side
export function getFirestoreInstance() {
  if (typeof window === "undefined") {
    throw new Error("Firestore can only be accessed in the browser")
  }

  if (!db) {
    try {
      const app = getFirebaseApp()
      db = getFirestore(app)
      console.log("Firestore instance created successfully")
    } catch (error) {
      console.error("Error getting Firestore instance:", error)
      throw new Error("Failed to get Firestore instance")
    }
  }

  return db
}

// Export db directly for compatibility with existing code
export { db }
