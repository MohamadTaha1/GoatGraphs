"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

// Mock users for development/fallback
const MOCK_USERS = [
  {
    uid: "admin-uid",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
    name: "Admin User",
  },
  {
    uid: "customer-uid",
    email: "customer@example.com",
    password: "123",
    role: "customer",
    name: "Customer User",
  },
]

type UserRole = "admin" | "customer" | "superadmin"

interface User {
  uid: string
  email: string | null
  role: UserRole
  name: string
  photoURL?: string | null
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Load user from localStorage on initial render
  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        console.error("Failed to parse user from localStorage", e)
      }
    }
    setIsLoading(false)
  }, [])

  // Redirect based on auth state and current path
  useEffect(() => {
    if (!isLoading) {
      // If not logged in and not on login page, redirect to login
      if (!user && pathname !== "/login") {
        router.push("/login")
      }

      // If logged in and on login page, redirect to appropriate section
      if (user && pathname === "/login") {
        if (user.role === "admin" || user.role === "superadmin") {
          router.push("/admin")
        } else {
          router.push("/customer")
        }
      }

      // If admin user tries to access customer pages
      if (
        (user?.role === "admin" || user?.role === "superadmin") &&
        !pathname.startsWith("/admin") &&
        pathname !== "/login"
      ) {
        router.push("/admin")
      }

      // If customer user tries to access admin pages
      if (user?.role === "customer" && pathname.startsWith("/admin")) {
        router.push("/customer")
      }
    }
  }, [user, isLoading, pathname, router])

  // Mock login function for development/fallback
  const mockLogin = (email: string, password: string): boolean => {
    const mockUser = MOCK_USERS.find((u) => u.email === email && u.password === password)

    if (mockUser) {
      const { password: _, ...userWithoutPassword } = mockUser
      setUser(userWithoutPassword as User)
      localStorage.setItem("user", JSON.stringify(userWithoutPassword))

      if (mockUser.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/customer")
      }

      return true
    }

    return false
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    console.log("Login attempt with:", email)

    try {
      // Always use mock login for now to avoid Firebase Auth issues
      const success = mockLogin(email, password)
      setIsLoading(false)
      return success
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      // Just clear local state for now
      setUser(null)
      localStorage.removeItem("user")
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
