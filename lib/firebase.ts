"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"

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

// Global variables to store Firebase instances
let app: any = null
let auth: Auth | undefined = undefined
let db: Firestore | undefined = undefined
let storage: FirebaseStorage | undefined = undefined
let isInitializing = false
let initializationComplete = false

// Initialize Firebase app with better error handling
function createFirebaseApp() {
  if (isInitializing) {
    console.log("Firebase initialization already in progress")
    return null
  }

  if (typeof window === "undefined") {
    console.log("Skipping Firebase initialization on server side")
    return null
  }

  try {
    isInitializing = true

    // Check if Firebase app is already initialized
    if (getApps().length === 0) {
      console.log("Initializing new Firebase app")
      app = initializeApp(firebaseConfig)
    } else {
      console.log("Using existing Firebase app")
      app = getApp()
    }

    isInitializing = false
    initializationComplete = true
    return app
  } catch (error) {
    console.error("Error initializing Firebase app:", error)
    isInitializing = false
    return null
  }
}

// Get Firebase app instance
export function getFirebaseApp() {
  if (typeof window === "undefined") {
    return null
  }

  if (app) {
    return app
  }

  return createFirebaseApp()
}

// Get Auth instance with retry mechanism
export function getAuthInstance() {
  if (typeof window === "undefined") {
    return undefined
  }

  if (auth) {
    return auth
  }

  try {
    const firebaseApp = getFirebaseApp()
    if (!firebaseApp) {
      console.warn("Firebase app not initialized, cannot get Auth")
      return undefined
    }

    auth = getAuth(firebaseApp)
    console.log("Auth initialized successfully")
    return auth
  } catch (error) {
    console.error("Error initializing Firebase Auth:", error)
    return undefined
  }
}

// Get Firestore instance with improved error handling
export function getFirestoreInstance() {
  if (typeof window === "undefined") {
    console.log("Firestore cannot be accessed on server side")
    return undefined
  }

  if (db) {
    return db
  }

  try {
    const firebaseApp = getFirebaseApp()
    if (!firebaseApp) {
      console.warn("Firebase app not initialized, cannot get Firestore")
      return undefined
    }

    // Check if Firestore is available in the current environment
    if (typeof window.firebase === "undefined" || typeof window.firebase.firestore === "undefined") {
      console.warn("Firestore is not available in this environment")
      return undefined
    }

    db = getFirestore(firebaseApp)
    console.log("Firestore initialized successfully")
    return db
  } catch (error) {
    console.error("Error initializing Firestore:", error)
    return undefined
  }
}

// Get Storage instance with improved error handling
export function getStorageInstance() {
  if (typeof window === "undefined") {
    return undefined
  }

  if (storage) {
    return storage
  }

  try {
    const firebaseApp = getFirebaseApp()
    if (!firebaseApp) {
      console.warn("Firebase app not initialized, cannot get Storage")
      return undefined
    }

    storage = getStorage(firebaseApp)
    console.log("Storage initialized successfully")
    return storage
  } catch (error) {
    console.error("Error initializing Storage:", error)
    return undefined
  }
}

// Initialize Firebase with a more robust approach
if (typeof window !== "undefined") {
  // Initialize app first
  if (!app) {
    console.log("Starting Firebase initialization")
    app = getFirebaseApp()

    // Initialize services with delays to ensure Firebase is ready
    if (app) {
      // Initialize Auth after a short delay
      setTimeout(() => {
        try {
          if (!auth) {
            auth = getAuthInstance()
          }
        } catch (error) {
          console.warn("Auth initialization failed:", error)
        }
      }, 100)

      // Initialize Firestore with a retry mechanism
      let firestoreRetries = 0
      const initFirestore = () => {
        try {
          if (!db && firestoreRetries < 3) {
            console.log(`Attempting to initialize Firestore (attempt ${firestoreRetries + 1}/3)`)
            db = getFirestoreInstance()
            if (!db) {
              firestoreRetries++
              setTimeout(initFirestore, 500) // Retry after 500ms
            }
          }
        } catch (error) {
          console.warn(`Firestore initialization failed (attempt ${firestoreRetries + 1}/3):`, error)
          if (firestoreRetries < 3) {
            firestoreRetries++
            setTimeout(initFirestore, 500) // Retry after 500ms
          }
        }
      }

      // Start Firestore initialization with a delay
      setTimeout(initFirestore, 200)

      // Initialize Storage after Firestore
      setTimeout(() => {
        try {
          if (!storage) {
            storage = getStorageInstance()
          }
        } catch (error) {
          console.warn("Storage initialization failed:", error)
        }
      }, 300)
    }
  }
}

// Export initialized instances
export { app as firebaseApp, auth, db, storage }

// Utility functions to check service availability
export function isFirebaseAvailable() {
  return !!app
}

export function isAuthAvailable() {
  return !!auth
}

export function isFirestoreAvailable() {
  return !!db
}

export function isStorageAvailable() {
  return !!storage
}

// Fallback data provider for when Firestore is not available
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
