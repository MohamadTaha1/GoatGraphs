"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"
import { getAuth, type Auth } from "firebase/auth"
import { getAnalytics, isSupported } from "firebase/analytics"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1WQJcLKk6lVlaw4uAGgMqyTqT0NnGR6w",
  authDomain: "goatgraphs-shirts.firebaseapp.com",
  projectId: "goatgraphs-shirts",
  storageBucket: "goatgraphs-shirts.appspot.com",
  messagingSenderId: "609496295054",
  appId: "1:609496295054:web:e5ba4913ded837a5f1cbdf",
  measurementId: "G-VKW6K9WWL8",
}

// Initialize Firebase
let app: any = null
let db: Firestore | undefined = undefined
let auth: Auth | undefined = undefined
let storage: FirebaseStorage | undefined = undefined
let analytics: any = null

// Only initialize Firebase if we're in the browser
if (typeof window !== "undefined") {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApp()
    }

    // Initialize Firestore
    db = getFirestore(app)

    // Initialize Auth
    auth = getAuth(app)

    // Initialize Storage
    storage = getStorage(app)

    // Initialize Analytics conditionally
    isSupported().then((yes) => yes && (analytics = getAnalytics(app)))
  } catch (error) {
    console.error("Error initializing Firebase:", error)
  }
}

// Export a function to get Firestore that ensures it's only called client-side
export function getFirestoreInstance(): Firestore {
  if (typeof window === "undefined") {
    throw new Error("Firestore can only be accessed in the browser")
  }

  if (!db) {
    try {
      if (!app) {
        throw new Error("Firebase app is not initialized")
      }
      db = getFirestore(app)
      console.log("Firestore instance created successfully")
    } catch (error) {
      console.error("Error getting Firestore instance:", error)
      throw new Error("Failed to get Firestore instance")
    }
  }

  return db
}

// Export a function to get Storage that ensures it's only called client-side
export function getStorageInstance(): FirebaseStorage {
  if (typeof window === "undefined") {
    throw new Error("Firebase Storage can only be accessed in the browser")
  }

  if (!storage) {
    try {
      if (!app) {
        throw new Error("Firebase app is not initialized")
      }
      storage = getStorage(app)
      console.log("Storage instance created successfully")
    } catch (error) {
      console.error("Error getting Storage instance:", error)
      throw new Error("Failed to get Storage instance")
    }
  }

  return storage
}

// Export a function to get Auth that ensures it's only called client-side
export function getAuthInstance(): Auth {
  if (typeof window === "undefined") {
    throw new Error("Firebase Auth can only be accessed in the browser")
  }

  if (!auth) {
    try {
      if (!app) {
        throw new Error("Firebase app is not initialized")
      }
      auth = getAuth(app)
      console.log("Auth instance created successfully")
    } catch (error) {
      console.error("Error getting Auth instance:", error)
      throw new Error("Failed to get Auth instance")
    }
  }

  return auth
}

export { app, db, auth, storage, analytics }
