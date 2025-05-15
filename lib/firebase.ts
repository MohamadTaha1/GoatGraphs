"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth as firebaseGetAuth, type Auth } from "firebase/auth"
import { getFirestore as firebaseGetFirestore, type Firestore } from "firebase/firestore"
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

let firebaseApp: any = null
let firestoreInstance: Firestore | null = null
let authInstance: Auth | null = null
let storageInstance: FirebaseStorage | null = null

// Initialize Firebase App
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
      console.log("Firebase app initialized successfully")
    } else {
      firebaseApp = getApp()
    }
    return firebaseApp
  } catch (error) {
    console.error("Error initializing Firebase app:", error)
    return null
  }
}

// Check if Firebase is available
export function isFirebaseAvailable(): boolean {
  return typeof window !== "undefined" && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== undefined
}

// Initialize and export Firebase Auth
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

// Initialize and export Firestore
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

// Initialize and export Firebase Storage
export function getStorageInstance() {
  if (typeof window === "undefined") {
    return null
  }

  if (storageInstance) return storageInstance

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

// Check if Firebase Storage is available
export async function isStorageAvailable(): Promise<boolean> {
  try {
    if (typeof window === "undefined") {
      return false
    }

    const storage = getStorageInstance()
    if (!storage) {
      return false
    }

    return true
  } catch (error) {
    console.error("Error checking storage availability:", error)
    return false
  }
}

// Initialize Firebase immediately in client-side
if (typeof window !== "undefined") {
  getFirebaseApp()
}

// Export aliases for compatibility with existing code
export const getAuth = getAuthInstance
export const getFirestore = getFirestoreInstance
export const getStorage = getStorageInstance

// Export instances for direct access
export const auth = typeof window !== "undefined" ? getAuthInstance() : null
export const db = typeof window !== "undefined" ? getFirestoreInstance() : null
export const storage = typeof window !== "undefined" ? getStorageInstance() : null
