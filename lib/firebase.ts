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

let app: any
let auth: Auth | undefined
let db: Firestore | undefined
let storage: FirebaseStorage | undefined

function createFirebaseApp() {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
      console.log("Firebase app initialized successfully")
    } else {
      app = getApp()
      console.log("Firebase app already initialized")
    }
    return app
  } catch (error) {
    console.error("Error initializing Firebase app:", error)
    return null
  }
}

export function getFirebaseApp() {
  if (typeof window === "undefined") {
    return null
  }

  if (app) {
    return app
  }

  return createFirebaseApp()
}

// Modify the getAuthInstance function to handle the "Component auth has not been registered yet" error
export function getAuthInstance() {
  if (typeof window === "undefined") {
    return undefined
  }

  if (auth) {
    return auth
  }

  try {
    const app = getFirebaseApp()
    if (!app) {
      console.error("Firebase app is not initialized")
      return undefined
    }

    // Add a try-catch block specifically for Auth initialization
    try {
      auth = getAuth(app)
      console.log("Auth initialized successfully")
      return auth
    } catch (error) {
      console.error("Error initializing Firebase Auth:", error)
      console.warn("Auth component not registered yet, will retry later")
      return undefined
    }
  } catch (error) {
    console.error("Error initializing Firebase Auth:", error)
    return undefined
  }
}

export function getFirestoreInstance() {
  if (typeof window === "undefined") {
    return undefined
  }

  if (db) {
    return db
  }

  try {
    const app = getFirebaseApp()
    if (!app) {
      console.error("Firebase app is not initialized")
      return undefined
    }

    db = getFirestore(app)
    console.log("Firestore initialized successfully")
    return db
  } catch (error) {
    console.error("Error initializing Firestore:", error)
    return undefined
  }
}

export function getStorageInstance() {
  if (typeof window === "undefined") {
    return undefined
  }

  if (storage) {
    return storage
  }

  try {
    const app = getFirebaseApp()
    if (!app) {
      console.error("Firebase app is not initialized")
      return undefined
    }

    storage = getStorage(app)
    console.log("Storage initialized successfully")
    return storage
  } catch (error) {
    console.error("Error initializing Storage:", error)
    return undefined
  }
}

// Update the client-side initialization section to handle potential errors
// Replace the existing client-side initialization with this:
if (typeof window !== "undefined") {
  // Initialize app first
  app = getFirebaseApp()

  // Initialize auth with a delay to ensure Firebase is ready
  setTimeout(() => {
    try {
      auth = getAuthInstance()
    } catch (error) {
      console.warn("Auth initialization delayed:", error)
    }
  }, 100)

  // Try to initialize Firestore but don't throw if it fails
  try {
    db = getFirestoreInstance()
  } catch (error) {
    console.warn("Firestore initialization skipped:", error)
  }

  // Try to initialize Storage but don't throw if it fails
  try {
    storage = getStorageInstance()
  } catch (error) {
    console.warn("Storage initialization skipped:", error)
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
