"use client"

import { useState, useEffect } from "react"
import {
  collection,
  getDocs,
  doc,
  query,
  where,
  limit,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { uploadFile } from "@/lib/firebase/storage"
import type { User } from "./use-users"

// Fallback admin users for when Firebase is unavailable
const FALLBACK_ADMIN_USERS: User[] = [
  {
    id: "admin1",
    email: "admin@legendary-signatures.com",
    displayName: "Main Administrator",
    phoneNumber: "+971 50 111 2222",
    role: "superadmin",
    createdAt: new Date("2022-12-01").toISOString(),
    lastLogin: new Date("2023-04-20").toISOString(),
    newsletter: false,
    status: "active",
  },
  {
    id: "admin2",
    email: "manager@legendary-signatures.com",
    displayName: "Store Manager",
    phoneNumber: "+971 50 333 4444",
    role: "admin",
    createdAt: new Date("2023-01-05").toISOString(),
    lastLogin: new Date("2023-04-19").toISOString(),
    newsletter: false,
    status: "active",
  },
  {
    id: "admin3",
    email: "content@legendary-signatures.com",
    displayName: "Content Manager",
    phoneNumber: "+971 50 555 6666",
    role: "admin",
    createdAt: new Date("2023-02-15").toISOString(),
    lastLogin: new Date("2023-04-18").toISOString(),
    newsletter: false,
    status: "active",
  },
]

// Hook to fetch admin users
export function useAdminUsers() {
  const [adminUsers, setAdminUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [needsIndex, setNeedsIndex] = useState(false)
  const [indexUrl, setIndexUrl] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAdminUsers() {
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
          // Use fallback data
          setAdminUsers(FALLBACK_ADMIN_USERS)
          return
        }

        if (!db) {
          console.error("Firestore instance is null")
          setLoading(false)
          setError(new Error("Firestore instance is null"))
          // Use fallback data
          setAdminUsers(FALLBACK_ADMIN_USERS)
          return
        }

        try {
          // First, try a simpler query without ordering to avoid index requirements
          const adminsQuery = query(collection(db, "users"), where("role", "in", ["admin", "superadmin"]), limit(20))

          const adminsSnapshot = await getDocs(adminsQuery)
          let adminsData = adminsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as User[]

          // Sort client-side by createdAt (descending)
          adminsData = adminsData.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
            return dateB - dateA
          })

          if (adminsData.length > 0) {
            setAdminUsers(adminsData)
          } else {
            console.log("No admin users found in Firestore, using fallback data")
            setAdminUsers(FALLBACK_ADMIN_USERS)
          }

          // Now try the query with ordering to see if we need to create an index
          try {
            const orderedQuery = query(
              collection(db, "users"),
              where("role", "in", ["admin", "superadmin"]),
              orderBy("createdAt", "desc"),
              limit(20),
            )

            await getDocs(orderedQuery)
            // If we get here, the index exists
            setNeedsIndex(false)
          } catch (indexError: any) {
            // Check if this is an index error
            if (indexError.message && indexError.message.includes("requires an index")) {
              setNeedsIndex(true)
              // Extract the index URL from the error message
              const urlMatch = indexError.message.match(/https:\/\/console\.firebase\.google\.com[^\s]+/)
              if (urlMatch) {
                setIndexUrl(urlMatch[0])
              }
            }
          }
        } catch (queryError: any) {
          console.error("Error with query:", queryError)

          // Check if this is an index error
          if (queryError.message && queryError.message.includes("requires an index")) {
            setNeedsIndex(true)
            // Extract the index URL from the error message
            const urlMatch = queryError.message.match(/https:\/\/console\.firebase\.google\.com[^\s]+/)
            if (urlMatch) {
              setIndexUrl(urlMatch[0])
            }

            // Try a simpler query without ordering
            try {
              const simpleQuery = query(
                collection(db, "users"),
                where("role", "in", ["admin", "superadmin"]),
                limit(20),
              )

              const simpleSnapshot = await getDocs(simpleQuery)
              let simpleData = simpleSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })) as User[]

              // Sort client-side
              simpleData = simpleData.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
                return dateB - dateA
              })

              if (simpleData.length > 0) {
                setAdminUsers(simpleData)
              } else {
                setAdminUsers(FALLBACK_ADMIN_USERS)
              }
            } catch (fallbackError) {
              console.error("Error with fallback query:", fallbackError)
              setAdminUsers(FALLBACK_ADMIN_USERS)
            }
          } else {
            setError(queryError instanceof Error ? queryError : new Error("Error with query"))
            setAdminUsers(FALLBACK_ADMIN_USERS)
          }
        }
      } catch (err) {
        console.error("Error fetching admin users:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch admin users"))
        setAdminUsers(FALLBACK_ADMIN_USERS)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminUsers()
  }, [])

  // Function to add a new admin user
  const addAdminUser = async (
    userData: Omit<User, "id" | "createdAt">,
    profileImage?: File,
  ): Promise<string | null> => {
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

      // Update the local state
      setAdminUsers((prev) => [
        {
          id: docRef.id,
          ...userData,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          photoURL,
        } as User,
        ...prev,
      ])

      return docRef.id
    } catch (error) {
      console.error("Error adding admin user:", error)
      return null
    }
  }

  // Function to update an existing admin user
  const updateAdminUser = async (id: string, userData: Partial<User>, profileImage?: File): Promise<boolean> => {
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

      // Update the local state
      setAdminUsers((prev) => prev.map((user) => (user.id === id ? { ...user, ...updateData } : user)))

      return true
    } catch (error) {
      console.error("Error updating admin user:", error)
      return false
    }
  }

  // Function to delete an admin user
  const deleteAdminUser = async (id: string): Promise<boolean> => {
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

      // Update the local state
      setAdminUsers((prev) => prev.filter((user) => user.id !== id))

      return true
    } catch (error) {
      console.error("Error deleting admin user:", error)
      return false
    }
  }

  return {
    adminUsers,
    loading,
    error,
    needsIndex,
    indexUrl,
    addAdminUser,
    updateAdminUser,
    deleteAdminUser,
  }
}
