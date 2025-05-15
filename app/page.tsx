"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function RootPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    // For authenticated users, redirect to their appropriate dashboard
    if (!isLoading && user) {
      if (user.role === "admin" || user.role === "superadmin") {
        router.push("/admin")
      } else {
        router.push("/customer")
      }
      return
    }

    // For all other users (guests), redirect directly to customer home page
    router.push("/customer")
  }, [router, user, isLoading])

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-jetblack">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold mx-auto" />
        <p className="mt-2 text-offwhite">Loading the store...</p>
      </div>
    </div>
  )
}
