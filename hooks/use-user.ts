"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./use-auth"
import { doc, getDoc } from "firebase/firestore"
import { getFirestoreInstance } from "@/lib/firebase/firestore"

export interface UserProfile {
  id: string
  email: string
  displayName?: string
  role: "admin" | "customer"
  createdAt: string
  lastLogin?: string
  phoneNumber?: string
  address?: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
}

export function useUser() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchUserProfile() {
      if (authLoading) return

      if (!user) {
        setProfile(null)
        setLoading(false)
        return
      }

      try {
        const db = getFirestoreInstance()
        const userDoc = await getDoc(doc(db, "users", user.uid))

        if (userDoc.exists()) {
          setProfile({
            id: userDoc.id,
            ...(userDoc.data() as Omit<UserProfile, "id">),
          })
        } else {
          console.warn("User document does not exist for authenticated user")
          setProfile(null)
        }
      } catch (err) {
        console.error("Error fetching user profile:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch user profile"))
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [user, authLoading])

  return { user: profile, loading: authLoading || loading, error }
}

// Named export for compatibility
