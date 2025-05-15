"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export default function RootPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
      } else if (user.role === "admin" || user.role === "superadmin") {
        router.push("/admin")
      } else {
        router.push("/customer")
      }
    }
  }, [user, isLoading, router])

  // Show loading state while determining where to redirect
  return (
    <div className="flex items-center justify-center min-h-screen bg-jetblack">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold mx-auto" />
        <p className="mt-2 text-offwhite">Redirecting...</p>
      </div>
    </div>
  )
}
