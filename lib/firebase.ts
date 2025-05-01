"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getAuth, type Auth } from "firebase/auth"
import { getStorage, type FirebaseStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "goatgraphs-shirts.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase app
const firebaseApp =
  typeof window !== "undefined" ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()) : null

// Initialize services
export const db = typeof window !== "undefined" ? getFirestore(firebaseApp) : null
export const auth = typeof window !== "undefined" ? getAuth(firebaseApp) : null
export const storage = typeof window !== "undefined" ? getStorage(firebaseApp) : null

// Keep the existing functions for backward compatibility
let dbInstance: Firestore | undefined
let authInstance: Auth | undefined
let storageInstance: FirebaseStorage | undefined

export function getFirebaseApp() {
  if (typeof window === "undefined") {
    console.warn("Firebase app cannot be initialized on the server side")
    return null
  }

  return firebaseApp
}

// Export a function to get Firestore that ensures it's only called client-side
export function getFirestoreInstance() {
  if (typeof window === "undefined") {
    throw new Error("Firestore can only be accessed in the browser")
  }

  if (!dbInstance) {
    try {
      if (firebaseApp) {
        dbInstance = db as Firestore
        console.log("Firestore instance created successfully")
      } else {
        console.error("Firebase app is not initialized")
        return null
      }
    } catch (error) {
      console.error("Error getting Firestore instance:", error)
      throw new Error("Failed to get Firestore instance")
    }
  }

  return dbInstance
}

// Initialize and export Firebase Auth
export function getAuthInstance() {
  if (typeof window === "undefined") {
    throw new Error("Firebase Auth can only be accessed in the browser")
  }

  if (!authInstance) {
    try {
      if (firebaseApp) {
        authInstance = auth as Auth
      } else {
        console.error("Firebase app is not initialized")
        return null
      }
    } catch (error) {
      console.error("Error initializing Firebase Auth:", error)
      return undefined
    }
  }

  return authInstance
}

export function getStorageInstance() {
  if (!storageInstance) {
    try {
      if (firebaseApp) {
        storageInstance = storage as FirebaseStorage
        console.log("Firebase Storage instance created successfully")
      } else {
        console.error("Firebase app is not initialized")
        return null
      }
    } catch (error) {
      console.error("Error initializing Firebase Storage:", error)
      return null
    }
  }

  return storageInstance
}
