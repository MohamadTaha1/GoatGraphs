"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "customer"
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      // If not logged in, redirect to login
      if (!user) {
        router.push("/login")
        return
      }

      // If role is required and user doesn't have it, redirect
      if (requiredRole && user.role !== requiredRole) {
        if (user.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/")
        }
      }
    }
  }, [user, isLoading, router, requiredRole])

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

  // If no role is required or user has the required role, render children
  if (!requiredRole || (user && user.role === requiredRole)) {
    return <>{children}</>
  }

  // Otherwise, render nothing (will be redirected)
  return null
}
