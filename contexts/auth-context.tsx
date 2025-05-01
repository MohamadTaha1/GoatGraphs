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
import { getAuthInstance } from "@/lib/firebase/auth"
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore"
import { getFirestoreInstance } from "@/lib/firebase/firestore"

type UserRole = "admin" | "customer" | "superadmin"

interface User {
  uid: string
  email: string | null
  role: UserRole
  displayName: string
  photoURL?: string | null
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, displayName: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Function to get user role from Firestore
  const getUserRole = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const db = getFirestoreInstance()
      const usersRef = collection(db, "users")
      const q = query(usersRef, where("uid", "==", firebaseUser.uid))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        console.log("No user document found for this auth user")

        // Create a default user document if none exists
        const defaultUserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || "User",
          role: "customer", // Default role
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          newsletter: false,
          wishlist: [],
          orders: [],
        }

        await setDoc(doc(db, "users", firebaseUser.uid), defaultUserData)
        console.log("Created default user document")

        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: "customer",
          displayName: firebaseUser.displayName || "User",
          photoURL: firebaseUser.photoURL,
        }
      }

      const userData = querySnapshot.docs[0].data()

      // Update last login
      await setDoc(
        doc(db, "users", firebaseUser.uid),
        {
          lastLogin: serverTimestamp(),
        },
        { merge: true },
      )

      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: userData.role || "customer",
        displayName: userData.displayName || firebaseUser.displayName || "User",
        photoURL: userData.photoURL || firebaseUser.photoURL,
      }
    } catch (error) {
      console.error("Error getting user role:", error)
      return null
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    const auth = getAuthInstance()
    if (!auth) {
      console.error("Auth instance is null")
      setIsLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        try {
          const userWithRole = await getUserRole(firebaseUser)
          setUser(userWithRole)
        } catch (error) {
          console.error("Error getting user role:", error)
          setUser(null)
        }
      } else {
        // User is signed out
        setUser(null)
      }
      setIsLoading(false)
    })

    // Cleanup subscription
    return () => unsubscribe()
  }, [])

  // Redirect based on auth state and current path
  useEffect(() => {
    if (!isLoading) {
      // Skip redirects for public pages
      if (
        pathname === "/" ||
        pathname === "/shop" ||
        pathname === "/authenticity" ||
        pathname === "/about" ||
        pathname === "/faq" ||
        pathname === "/contact" ||
        pathname === "/register" ||
        pathname.startsWith("/product/")
      ) {
        return
      }

      // If not logged in and not on login page, redirect to login
      if (!user && pathname !== "/login" && pathname !== "/register") {
        router.push("/login")
      }

      // If logged in and on login page, redirect to appropriate section
      if (user && (pathname === "/login" || pathname === "/register")) {
        if (user.role === "admin" || user.role === "superadmin") {
          router.push("/admin")
        } else {
          router.push("/customer")
        }
      }

      // If admin user tries to access customer pages
      if (
        (user?.role === "admin" || user?.role === "superadmin") &&
        pathname.startsWith("/customer") &&
        pathname !== "/login" &&
        pathname !== "/register"
      ) {
        router.push("/admin")
      }

      // If customer user tries to access admin pages
      if (user?.role === "customer" && pathname.startsWith("/admin")) {
        router.push("/customer")
      }
    }
  }, [user, isLoading, pathname, router])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    console.log("Login attempt with:", email)

    try {
      const auth = getAuthInstance()
      if (!auth) {
        console.error("Auth instance is null")
        setIsLoading(false)
        return false
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Get user role from Firestore
      const userWithRole = await getUserRole(firebaseUser)

      if (!userWithRole) {
        console.error("User authenticated but no Firestore document found")
        await signOut(auth)
        setIsLoading(false)
        return false
      }

      setUser(userWithRole)

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
      setIsLoading(false)
      return false
    }
  }

  const register = async (email: string, password: string, displayName: string): Promise<boolean> => {
    setIsLoading(true)
    console.log("Registration attempt with:", email)

    try {
      const auth = getAuthInstance()
      if (!auth) {
        console.error("Auth instance is null")
        setIsLoading(false)
        return false
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Create user document in Firestore
      const db = getFirestoreInstance()
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: displayName,
        role: "customer", // Default role for new registrations
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        newsletter: false,
        wishlist: [],
        orders: [],
      }

      await setDoc(doc(db, "users", firebaseUser.uid), userData)

      // Set user state
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: "customer",
        displayName: displayName,
        photoURL: firebaseUser.photoURL,
      })

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
      const auth = getAuthInstance()
      if (auth) {
        await signOut(auth)
      }
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
