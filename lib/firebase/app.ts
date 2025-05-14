import { initializeApp, getApps, getApp } from "firebase/app"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "goatgraphs-shirts.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
let firebaseApp = null

export function getFirebaseApp() {
  if (typeof window === "undefined") {
    return null // Return null on server-side
  }

  if (firebaseApp) {
    return firebaseApp
  }

  try {
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
