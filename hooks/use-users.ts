"use client"

import { useState, useEffect } from "react"
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  limit,
  type Timestamp,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { uploadFile } from "@/lib/firebase/storage"

export interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  phoneNumber?: string
  role: "customer" | "admin" | "superadmin"
  address?: {
    line1: string
    line2?: string
    city: string
    state?: string
    postalCode: string
    country: string
  }
  wishlist?: string[] // Array of product IDs
  createdAt: Timestamp | string | Date
  lastLogin: Timestamp | string | Date
  orders?: string[] // Array of order IDs
  newsletter: boolean
  status?: "active" | "inactive"
  totalSpent?: number
  orderCount?: number
}

// Helper function to convert Firebase timestamp to Date
export function convertTimestampToDate(timestamp: any): Date | null {
  if (!timestamp) return null

  // Handle Firestore Timestamp
  if (timestamp && typeof timestamp === "object" && timestamp.toDate) {
    return timestamp.toDate()
  }

  // Handle string date
  if (timestamp && (typeof timestamp === "string" || timestamp instanceof Date)) {
    try {
      return new Date(timestamp)
    } catch (e) {
      console.error("Error converting timestamp to date:", e)
      return null
    }
  }

  return null
}

// Helper function to compare dates for sorting
function compareDates(a: any, b: any, isDescending = true): number {
  const dateA = convertTimestampToDate(a)
  const dateB = convertTimestampToDate(b)

  // Handle null dates
  if (!dateA && !dateB) return 0
  if (!dateA) return isDescending ? 1 : -1
  if (!dateB) return isDescending ? -1 : 1

  // Compare dates
  return isDescending ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime()
}

// Hook to fetch users
export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Function to refresh the users data
  const refreshUsers = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  useEffect(() => {
    async function fetchUsers() {
      try {
        // Skip if we're not in the browser
        if (typeof window === "undefined") return

        setLoading(true)
        setError(null)

        let db
        try {
          db = getFirestoreInstance()
        } catch (err) {
          console.error("Failed to get Firestore instance:", err)
          setLoading(false)
          setError(err instanceof Error ? err : new Error("Failed to get Firestore instance"))
          return
        }

        if (!db) {
          console.error("Firestore instance is null")
          setLoading(false)
          setError(new Error("Firestore instance is null"))
          return
        }

        try {
          // Fetch all users without filtering or ordering (to avoid index requirements)
          console.log("Fetching all users...")
          const usersQuery = query(
            collection(db, "users"),
            limit(100), // Increased limit to ensure we get enough customers
          )

          const usersSnapshot = await getDocs(usersQuery)
          const usersData = usersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as User[]

          // Filter customers in JavaScript
          const customerUsers = usersData.filter((user) => user.role === "customer")

          // Sort by createdAt in descending order in JavaScript
          customerUsers.sort((a, b) => compareDates(a.createdAt, b.createdAt, true))

          if (customerUsers.length > 0) {
            // Fetch additional data like order count and total spent
            const enhancedUsers = await Promise.all(
              customerUsers.map(async (user) => {
                // Get order count and total spent
                try {
                  const ordersQuery = query(collection(db, "orders"))
                  const ordersSnapshot = await getDocs(ordersQuery)

                  // Filter orders for this user
                  const userOrders = ordersSnapshot.docs.filter((doc) => {
                    const orderData = doc.data()
                    return orderData.userId === user.id
                  })

                  const orderCount = userOrders.length
                  const totalSpent = userOrders.reduce((sum, orderDoc) => {
                    const orderData = orderDoc.data()
                    return sum + (orderData.total || 0)
                  }, 0)

                  // Convert timestamps to dates for comparison
                  const lastLogin = convertTimestampToDate(user.lastLogin)
                  const thirtyDaysAgo = new Date()
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

                  return {
                    ...user,
                    orderCount,
                    totalSpent,
                    // Determine status based on last login
                    status: lastLogin && lastLogin > thirtyDaysAgo ? "active" : "inactive",
                  }
                } catch (error) {
                  console.error("Error fetching user orders:", error)
                  return user
                }
              }),
            )

            setUsers(enhancedUsers)
          } else {
            console.log("No customer users found in Firestore")
            setUsers([])
          }
        } catch (queryError) {
          console.error("Error with query:", queryError)
          setError(queryError instanceof Error ? queryError : new Error("Error with query"))
          setUsers([])
        }
      } catch (err) {
        console.error("Error fetching users:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch users"))
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [refreshTrigger])

  return { users, loading, error, setUsers, refreshUsers }
}

// Function to get a single user by ID
export async function getUser(id: string): Promise<User | null> {
  try {
    if (typeof window === "undefined") {
      console.error("Cannot get user server-side")
      return null
    }

    let db
    try {
      db = getFirestoreInstance()
    } catch (err) {
      console.error("Failed to get Firestore instance:", err)
      return null
    }

    if (!db) {
      console.error("Firestore instance is null")
      return null
    }

    const docRef = doc(db, "users", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const userData = {
        id: docSnap.id,
        ...docSnap.data(),
      } as User

      // Get order count and total spent
      try {
        const ordersQuery = query(collection(db, "orders"))
        const ordersSnapshot = await getDocs(ordersQuery)

        // Filter orders for this user
        const userOrders = ordersSnapshot.docs.filter((doc) => {
          const orderData = doc.data()
          return orderData.userId === userData.id
        })

        const orderCount = userOrders.length
        const totalSpent = userOrders.reduce((sum, orderDoc) => {
          const orderData = orderDoc.data()
          return sum + (orderData.total || 0)
        }, 0)

        // Convert timestamps to dates for comparison
        const lastLogin = convertTimestampToDate(userData.lastLogin)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        return {
          ...userData,
          orderCount,
          totalSpent,
          status: lastLogin && lastLogin > thirtyDaysAgo ? "active" : "inactive",
        }
      } catch (error) {
        console.error("Error fetching user orders:", error)
        return userData
      }
    } else {
      console.log("No such user!")
      return null
    }
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

// Function to add a new user
export async function addUser(userData: Omit<User, "id" | "createdAt">, profileImage?: File): Promise<string | null> {
  try {
    if (typeof window === "undefined") return null

    let db
    try {
      db = getFirestoreInstance()
    } catch (err) {
      console.error("Failed to get Firestore instance:", err)
      return null
    }

    if (!db) {
      console.error("Firestore instance is null")
      return null
    }

    let photoURL = userData.photoURL

    // If profile image is provided, upload it to Firebase Storage
    if (profileImage) {
      try {
        const timestamp = Date.now()
        const filename = `${timestamp}_${profileImage.name.replace(/\s+/g, "_")}`
        const imagePath = `users/${filename}`

        photoURL = await uploadFile(profileImage, imagePath)
      } catch (uploadError) {
        console.error("Error uploading profile image:", uploadError)
        // Continue with user creation even if image upload fails
      }
    }

    const newUserData = {
      ...userData,
      photoURL,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "users"), newUserData)
    return docRef.id
  } catch (error) {
    console.error("Error adding user:", error)
    return null
  }
}

// Function to update an existing user
export async function updateUser(id: string, userData: Partial<User>, profileImage?: File): Promise<boolean> {
  try {
    if (typeof window === "undefined") return false

    let db
    try {
      db = getFirestoreInstance()
    } catch (err) {
      console.error("Failed to get Firestore instance:", err)
      return false
    }

    if (!db) {
      console.error("Firestore instance is null")
      return false
    }

    const updateData: any = { ...userData }

    // If profile image is provided, upload it to Firebase Storage
    if (profileImage) {
      try {
        const timestamp = Date.now()
        const filename = `${timestamp}_${profileImage.name.replace(/\s+/g, "_")}`
        const imagePath = `users/${filename}`

        const photoURL = await uploadFile(profileImage, imagePath)
        updateData.photoURL = photoURL
      } catch (uploadError) {
        console.error("Error uploading profile image:", uploadError)
        // Continue with user update even if image upload fails
      }
    }

    updateData.updatedAt = serverTimestamp()

    const userRef = doc(db, "users", id)
    await updateDoc(userRef, updateData)
    return true
  } catch (error) {
    console.error("Error updating user:", error)
    return false
  }
}

// Function to delete a user
export async function deleteUser(id: string): Promise<boolean> {
  try {
    if (typeof window === "undefined") return false

    let db
    try {
      db = getFirestoreInstance()
    } catch (err) {
      console.error("Failed to get Firestore instance:", err)
      return false
    }

    if (!db) {
      console.error("Firestore instance is null")
      return false
    }

    const userRef = doc(db, "users", id)
    await deleteDoc(userRef)
    return true
  } catch (error) {
    console.error("Error deleting user:", error)
    return false
  }
}
