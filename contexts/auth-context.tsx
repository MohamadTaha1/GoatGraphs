"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  type User as FirebaseUser,
} from "firebase/auth"
import { auth, isAuthAvailable } from "@/lib/firebase"

type UserRole = "admin" | "customer" | "superadmin"

interface User {
  uid: string
  email: string | null
  role: UserRole
  displayName: string
  photoURL?: string | null
  isGuest?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isGuest: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, displayName: string) => Promise<boolean>
  logout: () => Promise<void>
  continueAsGuest: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Admin emails for testing
const ADMIN_EMAILS = ["admin@legendarysignatures.com", "admin@example.com"]

// Test users for demo purposes
const TEST_USERS = {
  "admin@legendarysignatures.com": {
    password: "admin123",
    role: "admin",
    displayName: "Admin User",
  },
  "customer@example.com": {
    password: "password123",
    role: "customer",
    displayName: "Test Customer",
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname() || ""

  // Function to get user role
  const getUserRole = async (firebaseUser: FirebaseUser): Promise<User> => {
    // Check if user is in admin list for quick admin access
    if (ADMIN_EMAILS.includes(firebaseUser.email || "")) {
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: "admin",
        displayName: firebaseUser.displayName || "Admin User",
        photoURL: firebaseUser.photoURL,
      }
    }

    // Default to customer role
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      role: "customer",
      displayName: firebaseUser.displayName || "Customer",
      photoURL: firebaseUser.photoURL,
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false)
      return () => {}
    }

    // Check if we have a stored user in localStorage
    const storedUser = localStorage.getItem("auth_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing stored user:", error)
      }
    }

    // Add a retry mechanism for auth initialization
    let retryCount = 0
    const maxRetries = 3

    const setupAuthListener = () => {
      if (!isAuthAvailable()) {
        if (retryCount < maxRetries) {
          console.warn(`Auth is not available yet, retrying (${retryCount + 1}/${maxRetries})...`)
          retryCount++
          setTimeout(setupAuthListener, 500) // Retry after 500ms
          return
        } else {
          console.warn("Auth is not available after retries, using local authentication only")
          setIsLoading(false)
          return () => {}
        }
      }

      console.log("Setting up auth state listener")

      const unsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          console.log("Auth state changed:", firebaseUser ? "User logged in" : "No user")

          if (firebaseUser) {
            // User is signed in
            try {
              const userWithRole = await getUserRole(firebaseUser)
              setUser(userWithRole)
              // Store user in localStorage for persistence
              localStorage.setItem("auth_user", JSON.stringify(userWithRole))
            } catch (error) {
              console.error("Error getting user role:", error)
              setUser(null)
              localStorage.removeItem("auth_user")
            }
          } else {
            // User is signed out
            setUser(null)
            localStorage.removeItem("auth_user")
          }
          setIsLoading(false)
        },
        (error) => {
          console.error("Auth state change error:", error)
          setIsLoading(false)
        },
      )

      // Cleanup subscription
      return unsubscribe
    }

    // Start the auth listener setup process
    const cleanup = setupAuthListener()
    return () => {
      if (typeof cleanup === "function") {
        cleanup()
      }
    }
  }, [])

  // Redirect based on auth state and current path
  useEffect(() => {
    if (!isLoading) {
      // Public pages that don't require redirection
      const publicPages = ["/login", "/register", "/shop", "/authenticity", "/about", "/faq", "/contact"]

      // Check if current path is a product detail page
      const isProductDetailPage = pathname && pathname.startsWith("/product/")

      // If on root path ("/"), redirect based on auth status
      if (pathname === "/") {
        if (!user) {
          router.push("/login")
        } else if (user.role === "admin" || user.role === "superadmin") {
          router.push("/admin")
        } else {
          router.push("/customer")
        }
        return
      }

      // Skip redirects for public pages and product detail pages
      if (publicPages.includes(pathname) || isProductDetailPage) {
        return
      }

      // If not logged in and not on a public page, redirect to login
      if (!user && !publicPages.includes(pathname)) {
        router.push("/login")
        return
      }

      // If logged in and on login/register page, redirect to appropriate section
      if (user && (pathname === "/login" || pathname === "/register")) {
        if (user.role === "admin" || user.role === "superadmin") {
          router.push("/admin")
        } else {
          router.push("/customer")
        }
        return
      }

      // If admin user tries to access customer pages
      if ((user?.role === "admin" || user?.role === "superadmin") && pathname && pathname.startsWith("/customer")) {
        router.push("/admin")
        return
      }

      // If customer user tries to access admin pages
      if (user?.role === "customer" && pathname && pathname.startsWith("/admin")) {
        router.push("/customer")
        return
      }
    }
  }, [user, isLoading, pathname, router])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    console.log("Login attempt with:", email)

    try {
      // If Firebase Auth is not available, use local authentication
      if (!isAuthAvailable()) {
        console.log("Using local authentication")

        // Check if this is a test user
        const testUser = TEST_USERS[email]
        if (testUser && testUser.password === password) {
          const mockUser = {
            uid: `local_${Date.now()}`,
            email: email,
            role: testUser.role as UserRole,
            displayName: testUser.displayName,
            photoURL: null,
          }

          setUser(mockUser)
          localStorage.setItem("auth_user", JSON.stringify(mockUser))

          // Redirect based on role
          if (mockUser.role === "admin" || mockUser.role === "superadmin") {
            router.push("/admin")
          } else {
            router.push("/customer")
          }

          setIsLoading(false)
          return true
        }

        setIsLoading(false)
        return false
      }

      // Use Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Get user role
      const userWithRole = await getUserRole(firebaseUser)

      setUser(userWithRole)
      localStorage.setItem("auth_user", JSON.stringify(userWithRole))

      // Redirect based on role
      if (userWithRole.role === "admin" || userWithRole.role === "superadmin") {
        router.push("/admin")
      } else {
        router.push("/customer")
      }

      setIsLoading(false)
      return true
    } catch (error) {
      console.error("Login error:", error)

      // Try local authentication as fallback
      const testUser = TEST_USERS[email]
      if (testUser && testUser.password === password) {
        const mockUser = {
          uid: `local_${Date.now()}`,
          email: email,
          role: testUser.role as UserRole,
          displayName: testUser.displayName,
          photoURL: null,
        }

        setUser(mockUser)
        localStorage.setItem("auth_user", JSON.stringify(mockUser))

        // Redirect based on role
        if (mockUser.role === "admin" || mockUser.role === "superadmin") {
          router.push("/admin")
        } else {
          router.push("/customer")
        }

        setIsLoading(false)
        return true
      }

      setIsLoading(false)
      return false
    }
  }

  const register = async (email: string, password: string, displayName: string): Promise<boolean> => {
    setIsLoading(true)
    console.log("Registration attempt with:", email)

    try {
      // If Firebase Auth is not available, use local registration
      if (!isAuthAvailable()) {
        console.log("Using local registration")

        // Create a mock user
        const mockUser = {
          uid: `local_${Date.now()}`,
          email: email,
          role: "customer" as UserRole,
          displayName: displayName,
          photoURL: null,
        }

        // Store in localStorage
        localStorage.setItem(
          `user_${email}`,
          JSON.stringify({
            ...mockUser,
            password: password, // Note: In a real app, never store passwords in plain text
          }),
        )

        setUser(mockUser)
        localStorage.setItem("auth_user", JSON.stringify(mockUser))

        // Redirect to customer page
        router.push("/customer")

        setIsLoading(false)
        return true
      }

      // Use Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Set user state
      const newUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: "customer",
        displayName: displayName,
        photoURL: firebaseUser.photoURL,
      }

      setUser(newUser)
      localStorage.setItem("auth_user", JSON.stringify(newUser))

      // Redirect to customer page after registration
      router.push("/customer")

      setIsLoading(false)
      return true
    } catch (error) {
      console.error("Registration error:", error)
      setIsLoading(false)
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      if (isAuthAvailable()) {
        await signOut(auth)
      }

      setUser(null)
      localStorage.removeItem("auth_user")
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)

      // Force logout even if Firebase fails
      setUser(null)
      localStorage.removeItem("auth_user")
      router.push("/login")
    }
  }

  const continueAsGuest = () => {
    const guestUser = {
      uid: `guest_${Date.now()}`,
      email: null,
      role: "customer" as UserRole,
      displayName: "Guest",
      photoURL: null,
      isGuest: true,
    }

    setUser(guestUser)
    localStorage.setItem("auth_user", JSON.stringify(guestUser))
    router.push("/customer")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isGuest: user?.isGuest || false,
        login,
        register,
        logout,
        continueAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export { AuthContext }
