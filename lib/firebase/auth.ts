import { getAuth, type Auth } from "firebase/auth"
import { getFirebaseApp } from "./app"

let authInstance: Auth | undefined

// Initialize and export Firebase Auth
export function getAuthInstance() {
  if (typeof window === "undefined") {
    return undefined // Return undefined on server-side
  }

  if (authInstance) {
    return authInstance
  }

  try {
    const app = getFirebaseApp()
    if (!app) {
      console.error("Firebase app is not initialized")
      return undefined
    }

    console.log("Initializing Firebase Auth")
    authInstance = getAuth(app)
    return authInstance
  } catch (error) {
    console.error("Error initializing Firebase Auth:", error)
    return undefined
  }
}

// Initialize Auth immediately in client-side
if (typeof window !== "undefined") {
  getAuthInstance()
}

// Export auth as a named export for compatibility
export const auth = typeof window !== "undefined" ? getAuthInstance() : undefined
