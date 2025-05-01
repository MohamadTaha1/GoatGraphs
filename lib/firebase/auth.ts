import { getAuth, type Auth } from "firebase/auth"
import { getFirebaseApp } from "./app"

let authInstance: Auth | undefined

// Initialize and export Firebase Auth
export function getAuthInstance() {
  if (typeof window === "undefined") {
    throw new Error("Firebase Auth can only be accessed in the browser")
  }

  if (!authInstance) {
    try {
      const app = getFirebaseApp()
      authInstance = getAuth(app)
    } catch (error) {
      console.error("Error initializing Firebase Auth:", error)
      return undefined
    }
  }

  return authInstance
}

// Export auth as a named export for compatibility
export const auth = typeof window !== "undefined" ? getAuthInstance() : undefined
