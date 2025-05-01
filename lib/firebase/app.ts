import { initializeApp, getApps, getApp } from "firebase/app"

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
let firebaseApp = null

export function getFirebaseApp() {
  if (typeof window === "undefined") {
    throw new Error("Firebase app can only be initialized in the browser")
  }

  if (firebaseApp) {
    return firebaseApp
  }

  try {
    if (getApps().length > 0) {
      firebaseApp = getApp()
      console.log("Retrieved existing Firebase app")
    } else {
      firebaseApp = initializeApp(firebaseConfig)
      console.log("Firebase app initialized successfully")
    }

    return firebaseApp
  } catch (error) {
    console.error("Error initializing Firebase app:", error)
    throw error
  }
}
