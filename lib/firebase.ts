"use client"

// Import only the core Firebase app functionality initially
import { initializeApp, getApps, getApp } from "firebase/app"

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase app only once
let firebaseApp: any = null

// Service instances
let authInstance: any = null
let firestoreInstance: any = null
let storageInstance: any = null

// Service initialization status
let authInitialized = false
let firestoreInitialized = false
let storageInitialized = false

// Validation function to check if Firebase config is valid
function isValidFirebaseConfig() {
  return !!firebaseConfig.apiKey && !!firebaseConfig.authDomain && !!firebaseConfig.projectId
}

// Log Firebase configuration for debugging (without sensitive values)
console.log("Firebase config check:", {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId,
  hasMeasurementId: !!firebaseConfig.measurementId,
})

export function getFirebaseApp() {
  if (typeof window === "undefined") {
    return null // Return null on server-side
  }

  if (firebaseApp) {
    return firebaseApp
  }

  try {
    // Validate Firebase config
    if (!isValidFirebaseConfig()) {
      console.error("Invalid Firebase configuration. Check your environment variables.")
      return null
    }

    // Check if Firebase app is already initialized
    if (getApps().length === 0) {
      console.log("Initializing Firebase app")
      firebaseApp = initializeApp(firebaseConfig)
    } else {
      console.log("Firebase app already initialized")
      firebaseApp = getApp()
    }
    return firebaseApp
  } catch (error) {
    console.error("Error initializing Firebase app:", error)
    return null
  }
}

// Initialize Firebase immediately in client-side
if (typeof window !== "undefined") {
  getFirebaseApp()
}

// Lazy initialization functions with dynamic imports
export async function getAuth() {
  if (typeof window === "undefined") return null
  if (!firebaseApp) firebaseApp = getFirebaseApp()
  if (!firebaseApp) return null

  if (authInstance && authInitialized) {
    return authInstance
  }

  try {
    const { getAuth: firebaseGetAuth } = await import("firebase/auth")
    authInstance = firebaseGetAuth(firebaseApp)
    authInitialized = true
    console.log("Auth initialized successfully")
    return authInstance
  } catch (error) {
    console.error("Error initializing Auth:", error)
    return null
  }
}

export async function getFirestore() {
  if (typeof window === "undefined") return null
  if (!firebaseApp) firebaseApp = getFirebaseApp()
  if (!firebaseApp) return null

  if (firestoreInstance && firestoreInitialized) {
    return firestoreInstance
  }

  try {
    const { getFirestore: firebaseGetFirestore } = await import("firebase/firestore")
    firestoreInstance = firebaseGetFirestore(firebaseApp)
    firestoreInitialized = true
    console.log("Firestore initialized successfully")
    return firestoreInstance
  } catch (error) {
    console.error("Error initializing Firestore:", error)
    return null
  }
}

// Improved Storage initialization with retry mechanism
export async function getStorage(retryCount = 0, maxRetries = 3) {
  if (typeof window === "undefined") return null
  if (!firebaseApp) firebaseApp = getFirebaseApp()
  if (!firebaseApp) return null

  // If storage is already initialized, return it
  if (storageInstance && storageInitialized) {
    return storageInstance
  }

  // Check if storageBucket is configured
  if (!firebaseConfig.storageBucket) {
    console.warn("Storage bucket is not configured. Storage initialization may fail.")
  }

  try {
    // Dynamic import of Firebase storage
    const { getStorage: firebaseGetStorage } = await import("firebase/storage")

    // Try to initialize storage
    storageInstance = firebaseGetStorage(firebaseApp)
    storageInitialized = true
    console.log("Storage initialized successfully")
    return storageInstance
  } catch (error) {
    console.error(`Error initializing Storage (attempt ${retryCount + 1}/${maxRetries + 1}):`, error)

    // Retry logic with exponential backoff
    if (retryCount < maxRetries) {
      const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff
      console.log(`Retrying Storage initialization in ${delay}ms...`)

      return new Promise((resolve) => {
        setTimeout(async () => {
          const result = await getStorage(retryCount + 1, maxRetries)
          resolve(result)
        }, delay)
      })
    }

    // If all retries fail, return null
    console.warn("All Storage initialization attempts failed")
    return null
  }
}

// Mock storage implementation for fallback
export const createMockStorage = () => {
  console.log("Creating mock storage implementation")
  return {
    ref: (path: string) => ({
      put: async () => {
        console.log("Mock storage: put operation on path", path)
        return {
          ref: {
            getDownloadURL: async () => `https://mock-storage-url.com/${path}`,
          },
        }
      },
      getDownloadURL: async () => `https://mock-storage-url.com/${path}`,
      delete: async () => console.log("Mock storage: delete operation on path", path),
    }),
  }
}

// Service availability check functions
export function isFirebaseAvailable() {
  return !!firebaseApp
}

export function isAuthAvailable() {
  return !!authInstance && authInitialized
}

export function isFirestoreAvailable() {
  return !!firestoreInstance && firestoreInitialized
}

export function isStorageAvailable() {
  return !!storageInstance && storageInitialized
}

// For backward compatibility
export const getAuthInstance = getAuth
export const getFirestoreInstance = getFirestore
export const getStorageInstance = getStorage

// Export instances for direct access (will be null initially)
export const auth = null
export const db = null
export const storage = null

// Initialize services in the background with progressive delays
if (typeof window !== "undefined") {
  // Initialize Auth first
  setTimeout(() => {
    getAuth().catch((err) => console.warn("Background Auth initialization failed:", err))
  }, 500)

  // Initialize Firestore after Auth
  setTimeout(() => {
    getFirestore().catch((err) => console.warn("Background Firestore initialization failed:", err))
  }, 1000)

  // Initialize Storage last with the longest delay
  setTimeout(() => {
    getStorage().catch((err) => console.warn("Background Storage initialization failed:", err))
  }, 1500)
}

// Safe storage upload function with fallback
export async function safeUploadFile(path: string, file: File) {
  try {
    const storageInstance = await getStorage()

    if (!storageInstance) {
      console.warn("Storage not available, using mock implementation")
      const mockStorage = createMockStorage()
      const mockRef = mockStorage.ref(path)
      await mockRef.put(file)
      return `https://mock-storage-url.com/${path}`
    }

    // Import Firebase storage functions dynamically
    const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage")

    // Create a reference to the file location
    const storageRef = ref(storageInstance, path)

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file)

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
  } catch (error) {
    console.error("Error uploading file:", error)
    return null
  }
}
