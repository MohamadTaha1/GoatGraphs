"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isFirebaseAvailable } from "@/lib/firebase"

export default function RootPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if Firebase is available
    const checkFirebase = async () => {
      try {
        // Wait a bit to allow Firebase to initialize
        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (!isFirebaseAvailable()) {
          console.warn("Firebase is not available, but continuing anyway")
          // Continue despite Firebase not being available
        }

        // Redirect to login page
        router.push("/login")
      } catch (err) {
        console.error("Error during initialization:", err)
        setError("Failed to initialize the application. Please refresh the page.")
      } finally {
        setIsLoading(false)
      }
    }

    checkFirebase()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Loading application...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-md bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Initialization Error</h1>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  // This should not be visible as we redirect in the useEffect
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p>Redirecting...</p>
      </div>
    </div>
  )
}
