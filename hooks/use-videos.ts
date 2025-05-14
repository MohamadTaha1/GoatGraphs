"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase/firestore"

export interface Video {
  id: string
  playerName: string
  title: string
  description?: string
  price: number
  duration?: string
  category?: string
  available?: boolean
  thumbnailUrl?: string
  videoUrl?: string
  position?: string
  team?: string
  availability?: string
}

interface UseVideosOptions {
  onlyAvailable?: boolean
  limitCount?: number
  category?: string
}

export function useVideos(options: UseVideosOptions = {}) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const { onlyAvailable = false, limitCount = 100, category } = options

  useEffect(() => {
    async function fetchVideos() {
      try {
        setLoading(true)
        console.log("Fetching videos with options:", options)

        const videosQuery = collection(db, "videos")
        const constraints = []

        if (onlyAvailable) {
          constraints.push(where("available", "==", true))
        }

        if (category) {
          constraints.push(where("category", "==", category))
        }

        constraints.push(orderBy("playerName", "asc"))

        if (limitCount) {
          constraints.push(limit(limitCount))
        }

        const q = query(videosQuery, ...constraints)
        const querySnapshot = await getDocs(q)

        const videosData = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          console.log("Video data:", data)
          return {
            id: doc.id,
            ...data,
          }
        }) as Video[]

        console.log("Fetched videos:", videosData)
        setVideos(videosData)
        setError(null)
      } catch (err) {
        console.error("Error fetching videos:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch videos"))
        setVideos([])
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [onlyAvailable, limitCount, category])

  return { videos, loading, error }
}
