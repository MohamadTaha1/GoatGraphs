"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import { getFirestoreInstance } from "@/lib/firebase/firestore"

export interface Video {
  id: string
  playerName: string
  title: string
  description: string
  price: number
  duration: string
  category: string
  available: boolean
  thumbnailUrl: string
  videoUrl: string
  createdAt: any
  updatedAt: any
}

export function useVideos(options: { onlyAvailable?: boolean } = {}) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const db = getFirestoreInstance()

        if (!db) {
          throw new Error("Firestore not initialized")
        }

        const videosCollection = collection(db, "videos")
        let videosQuery = query(videosCollection, orderBy("createdAt", "desc"))

        if (options.onlyAvailable) {
          videosQuery = query(videosCollection, where("available", "==", true), orderBy("createdAt", "desc"))
        }

        const snapshot = await getDocs(videosQuery)
        const videosList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Video[]

        setVideos(videosList)
        setError(null)
      } catch (err) {
        console.error("Error fetching videos:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch videos"))
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [options.onlyAvailable])

  return { videos, loading, error }
}
