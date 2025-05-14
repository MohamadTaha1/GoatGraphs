"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "customer" | undefined
  allowGuest?: boolean
}

export default function ProtectedRoute({ children, requiredRole, allowGuest = true }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname() || "" // Provide default empty string if pathname is undefined

  useEffect(() => {
    if (!isLoading) {
      // If guest browsing is allowed, don't redirect
      if (allowGuest && !user) {
        return
      }

      // If not logged in and guest browsing is not allowed, redirect to login
      if (!user && !allowGuest) {
        router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`)
        return
      }

      // If role is required and user doesn't have it, redirect
      if (user && requiredRole && user.role !== requiredRole) {
        if (user.role === "admin" || user.role === "superadmin") {
          router.push("/admin")
        } else {
          router.push("/customer")
        }
        return
      }

      // Special case for root path
      if (pathname === "/" && user) {
        if (user.role === "admin" || user.role === "superadmin") {
          router.push("/admin")
        } else {
          router.push("/customer")
        }
      }
    }
  }, [user, isLoading, router, requiredRole, pathname, allowGuest])

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

  // Allow access for guests if allowGuest is true
  if (!user && allowGuest) {
    return <>{children}</>
  }

  // Otherwise, follow the original logic
  if (!user) {
    return null // Will be redirected
  }

  if (requiredRole && user.role !== requiredRole) {
    return null // Will be redirected
  }

  return <>{children}</>
}
