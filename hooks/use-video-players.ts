"use client"

import { useState, useEffect } from "react"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { collection, getDocs, query, where } from "firebase/firestore"

export interface VideoPlayer {
  id: string
  name: string
  sport: string
  team: string
  price: number
  imageUrl: string
  description: string
  available: boolean
  featured: boolean
  createdAt: any
  updatedAt: any
}

export function useVideoPlayers(featuredOnly = false) {
  const [players, setPlayers] = useState<VideoPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchPlayers() {
      try {
        setLoading(true)
        const db = getFirestoreInstance()
        if (!db) {
          throw new Error("Firestore instance is null")
        }

        let playersQuery = query(collection(db, "videoPlayers"), where("available", "==", true))

        if (featuredOnly) {
          playersQuery = query(
            collection(db, "videoPlayers"),
            where("available", "==", true),
            where("featured", "==", true),
          )
        }

        const snapshot = await getDocs(playersQuery)

        const playersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as VideoPlayer[]

        // Sort by featured first, then by name
        playersData.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return a.name.localeCompare(b.name)
        })

        setPlayers(playersData)
      } catch (err) {
        console.error("Error fetching video players:", err)
        setError(err instanceof Error ? err : new Error("Failed to load video players"))
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [featuredOnly])

  return { players, loading, error }
}
