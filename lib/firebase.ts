"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore as firebaseGetFirestore, type Firestore } from "firebase/firestore"
import { getAuth as firebaseGetAuth, type Auth } from "firebase/auth"
import { getStorage as firebaseGetStorage, type FirebaseStorage } from "firebase/storage"

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

// Initialize Firebase App
let firebaseApp: any = null
let firestoreInstance: Firestore | null = null
let authInstance: Auth | null = null
let storageInstance: FirebaseStorage | null = null

// Get Firebase App instance
export function getFirebaseApp() {
  if (typeof window === "undefined") {
    return null
  }

  if (firebaseApp) {
    return firebaseApp
  }

  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(firebaseConfig)
    } else {
      firebaseApp = getApp()
    }
    return firebaseApp
  } catch (error) {
    console.error("Error initializing Firebase app:", error)
    return null
  }
}

// Initialize and get Firestore instance
export function getFirestoreInstance() {
  if (typeof window === "undefined") {
    return null
  }

  if (firestoreInstance) {
    return firestoreInstance
  }

  try {
    const app = getFirebaseApp()
    if (!app) {
      console.error("Firebase app is not initialized")
      return null
    }
    firestoreInstance = firebaseGetFirestore(app)
    return firestoreInstance
  } catch (error) {
    console.error("Error initializing Firestore:", error)
    return null
  }
}

// Initialize and get Firebase Auth instance
export function getAuthInstance() {
  if (typeof window === "undefined") {
    return null
  }

  if (authInstance) {
    return authInstance
  }

  try {
    const app = getFirebaseApp()
    if (!app) {
      console.error("Firebase app is not initialized")
      return null
    }
    authInstance = firebaseGetAuth(app)
    return authInstance
  } catch (error) {
    console.error("Error initializing Firebase Auth:", error)
    return null
  }
}

// Initialize and get Firebase Storage instance
export function getStorageInstance() {
  if (typeof window === "undefined") {
    return null
  }

  if (storageInstance) {
    return storageInstance
  }

  try {
    const app = getFirebaseApp()
    if (!app) {
      console.error("Firebase app not initialized")
      return null
    }

    storageInstance = firebaseGetStorage(app)
    return storageInstance
  } catch (error) {
    console.error("Error initializing Firebase Storage:", error)
    return null
  }
}

// Check if Firebase services are available
export function isFirebaseAvailable(): boolean {
  return typeof window !== "undefined" && !!getFirebaseApp()
}

export function isFirestoreAvailable(): boolean {
  return typeof window !== "undefined" && !!getFirestoreInstance()
}

export function isAuthAvailable(): boolean {
  return typeof window !== "undefined" && !!getAuthInstance()
}

export function isStorageAvailable(): boolean {
  return typeof window !== "undefined" && !!getStorageInstance()
}

// Upload file to Firebase Storage
export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: number) => void,
): Promise<string | null> {
  try {
    const storage = getStorageInstance()
    if (!storage) {
      throw new Error("Storage not initialized")
    }

    // Import Firebase storage functions dynamically
    const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage")

    const storageRef = ref(storage, path)

    // Create upload task with progress monitoring
    const uploadTask = uploadBytesResumable(storageRef, file)

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          if (onProgress) {
            onProgress(progress)
          }
        },
        (error) => {
          console.error("Upload error:", error)
          reject(error)
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            resolve(downloadURL)
          } catch (error) {
            console.error("Error getting download URL:", error)
            reject(error)
          }
        },
      )
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return null
  }
}

// Export Firebase service functions for direct imports
export const getFirestore = getFirestoreInstance
export const getAuth = getAuthInstance
export const getStorage = getStorageInstance

// For backward compatibility - these are now functions, not instances
export { getFirestoreInstance as db }
export { getAuthInstance as auth }
export { getStorageInstance as storage }
