"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

type AdminUser = {
  id: string
  name: string
  email: string
  role: "admin" | "manager"
  avatar?: string
}

type AdminAuthContextType = {
  user: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

// Mock admin user
const MOCK_ADMIN: AdminUser = {
  id: "admin-1",
  name: "Admin User",
  email: "admin@legendarysignatures.com",
  role: "admin",
  avatar: "/placeholder.svg?height=40&width=40",
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Load user from localStorage on initial render
  useEffect(() => {
    const savedUser = localStorage.getItem("adminUser")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        console.error("Failed to parse admin user from localStorage", e)
      }
    }
    setIsLoading(false)
  }, [])

  // Redirect user based on authentication status
  useEffect(() => {
    if (!isLoading) {
      // If not logged in and not on login page, redirect to login
      if (!user && pathname !== "/admin/login") {
        router.push("/admin/login")
      }

      // If logged in and on login page, redirect to admin dashboard
      if (user && pathname === "/admin/login") {
        router.push("/admin")
      }
    }
  }, [user, isLoading, pathname, router])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simple mock auth - in a real app, this would validate against a backend
    if (email === "admin@legendarysignatures.com" && password === "admin123") {
      setUser(MOCK_ADMIN)
      localStorage.setItem("adminUser", JSON.stringify(MOCK_ADMIN))
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("adminUser")
    router.push("/admin/login")
  }

  return (
    <AdminAuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
