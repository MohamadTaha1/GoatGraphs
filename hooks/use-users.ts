"use client"

import { useState, useEffect } from "react"
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  limit,
  Timestamp,
  orderBy,
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
  createdAt: Timestamp | string
  lastLogin: Timestamp | string
  orders?: string[] // Array of order IDs
  newsletter: boolean
  status?: "active" | "inactive"
  totalSpent?: number
  orderCount?: number
}

// Hook to fetch users
export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchUsers() {
      try {
        // Skip if we're not in the browser
        if (typeof window === "undefined") return

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
          // Try to fetch users with role=customer
          console.log("Fetching users with role=customer...")
          let usersQuery = query(
            collection(db, "users"),
            where("role", "==", "customer"),
            orderBy("createdAt", "desc"),
            limit(20),
          )

          let usersSnapshot = await getDocs(usersQuery)
          let usersData = usersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as User[]

          // If no users with role=customer, try fetching all users
          if (usersData.length === 0) {
            console.log("No users with role=customer found, fetching all users...")
            usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(20))
            usersSnapshot = await getDocs(usersQuery)
            usersData = usersSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as User[]
          }

          if (usersData.length > 0) {
            // Fetch additional data like order count and total spent
            const enhancedUsers = await Promise.all(
              usersData.map(async (user) => {
                // Get order count and total spent
                try {
                  const ordersQuery = query(collection(db, "orders"), where("userId", "==", user.id))
                  const ordersSnapshot = await getDocs(ordersQuery)

                  const orderCount = ordersSnapshot.size
                  const totalSpent = ordersSnapshot.docs.reduce(
                    (sum, orderDoc) => sum + (orderDoc.data().total || 0),
                    0,
                  )

                  return {
                    ...user,
                    orderCount,
                    totalSpent,
                    // Determine status based on last login
                    status: user.lastLogin
                      ? new Date(user.lastLogin instanceof Timestamp ? user.lastLogin.toDate() : user.lastLogin) >
                        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                        ? "active"
                        : "inactive"
                      : "inactive",
                  }
                } catch (error) {
                  console.error("Error fetching user orders:", error)
                  return user
                }
              }),
            )

            setUsers(enhancedUsers)
          } else {
            console.log("No users found in Firestore")
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
  }, [])

  return { users, loading, error, setUsers }
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
        const ordersQuery = query(collection(db, "orders"), where("userId", "==", userData.id))
        const ordersSnapshot = await getDocs(ordersQuery)

        const orderCount = ordersSnapshot.size
        const totalSpent = ordersSnapshot.docs.reduce((sum, orderDoc) => sum + (orderDoc.data().total || 0), 0)

        return {
          ...userData,
          orderCount,
          totalSpent,
          status: userData.lastLogin
            ? new Date(userData.lastLogin instanceof Timestamp ? userData.lastLogin.toDate() : userData.lastLogin) >
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              ? "active"
              : "inactive"
            : "inactive",
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
      const timestamp = Date.now()
      const filename = `${timestamp}_${profileImage.name.replace(/\s+/g, "_")}`
      const imagePath = `users/${filename}`

      photoURL = await uploadFile(profileImage, imagePath)
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
      const timestamp = Date.now()
      const filename = `${timestamp}_${profileImage.name.replace(/\s+/g, "_")}`
      const imagePath = `users/${filename}`

      const photoURL = await uploadFile(profileImage, imagePath)
      updateData.photoURL = photoURL
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
