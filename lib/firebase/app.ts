"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "goatgraphs-shirts.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

let firebaseApp = null
const dbInstance = null

export function getFirebaseApp() {
  if (firebaseApp) return firebaseApp

  if (typeof window === "undefined") {
    console.warn("Firebase app cannot be initialized on the server side")
    return null
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

// Initialize and export Firestore
export const db = typeof window !== "undefined" ? getFirestore(getFirebaseApp()) : null
