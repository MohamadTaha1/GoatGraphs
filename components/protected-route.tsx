"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "customer"
  adminOnly?: boolean
}

export default function ProtectedRoute({ children, requiredRole, adminOnly }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      // If not logged in, redirect to login
      if (!user) {
        router.push("/login")
        return
      }

      // If adminOnly is true and user is not admin, redirect
      if (adminOnly && user.role !== "admin" && user.role !== "superadmin") {
        router.push("/customer")
        return
      }

      // If role is required and user doesn't have it, redirect
      if (requiredRole && user.role !== requiredRole) {
        if (user.role === "admin" || user.role === "superadmin") {
          router.push("/admin")
        } else {
          router.push("/customer")
        }
        return
      }

      // User is authorized
      setAuthorized(true)
    }
  }, [user, isLoading, router, requiredRole, adminOnly])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-jetblack">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold mx-auto" />
          <p className="mt-2 text-offwhite">Loading...</p>
        </div>
      </div>
    )
  }

  // Only render children if authorized
  return authorized ? <>{children}</> : null
}
