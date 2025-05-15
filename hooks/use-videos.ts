"use client"

import { useState, useEffect } from "react"
import { getFirestoreInstance } from "@/lib/firebase/firestore"

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

// Fallback videos for when Firebase is unavailable
const FALLBACK_VIDEOS: Video[] = [
  {
    id: "1",
    playerName: "Lionel Messi",
    title: "Birthday Greeting",
    description: "Get a personalized greeting from the football legend himself.",
    price: 499.99,
    duration: "30-60",
    category: "birthday",
    available: true,
    thumbnailUrl: "/images/video-thumbnails/messi-greeting.png",
    position: "Forward",
    team: "Inter Miami CF",
    availability: "7-10 days",
  },
  {
    id: "2",
    playerName: "Cristiano Ronaldo",
    title: "Special Occasion",
    description: "Make someone's birthday special with a message from CR7.",
    price: 599.99,
    duration: "30-60",
    category: "birthday",
    available: true,
    thumbnailUrl: "/images/video-thumbnails/ronaldo-birthday.png",
    position: "Forward",
    team: "Al Nassr FC",
    availability: "10-14 days",
  },
  {
    id: "3",
    playerName: "Kylian Mbappé",
    title: "Congratulations Message",
    description: "Celebrate achievements with a special message from Mbappé.",
    price: 399.99,
    duration: "30-45",
    category: "congratulations",
    available: true,
    thumbnailUrl: "/images/video-thumbnails/mbappe-congrats.png",
    position: "Forward",
    team: "Real Madrid",
    availability: "5-7 days",
  },
  {
    id: "4",
    playerName: "Erling Haaland",
    title: "Motivational Message",
    description: "Get motivated with a powerful message from the goal machine.",
    price: 349.99,
    duration: "30-45",
    category: "motivation",
    available: true,
    thumbnailUrl: "/images/video-thumbnails/haaland-greeting.png",
    position: "Forward",
    team: "Manchester City",
    availability: "7-10 days",
  },
  {
    id: "5",
    playerName: "Neymar Jr",
    title: "Special Greeting",
    description: "Make any occasion special with a message from Neymar.",
    price: 449.99,
    duration: "30-60",
    category: "greeting",
    available: true,
    thumbnailUrl: "/images/video-thumbnails/neymar-message.png",
    position: "Forward",
    team: "Al Hilal SFC",
    availability: "10-14 days",
  },
  {
    id: "6",
    playerName: "Kevin De Bruyne",
    title: "Personal Message",
    description: "Get a personalized message from the midfield maestro.",
    price: 349.99,
    duration: "30-45",
    category: "greeting",
    available: true,
    thumbnailUrl: "/images/video-thumbnails/de-bruyne-message.png",
    position: "Midfielder",
    team: "Manchester City",
    availability: "5-7 days",
  },
]

interface UseVideosOptions {
  onlyAvailable?: boolean
  limitCount?: number
  category?: string
}

export function useVideos(options: UseVideosOptions = {}) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [firestoreAvailable, setFirestoreAvailable] = useState<boolean | null>(null)

  const { onlyAvailable = false, limitCount = 100, category } = options

  useEffect(() => {
    async function fetchVideos() {
      try {
        setLoading(true)
        console.log("Fetching videos with options:", options)

        // Skip if we're not in the browser
        if (typeof window === "undefined") {
          setLoading(false)
          return
        }

        // Check if Firestore is available
        let db = null
        try {
          db = getFirestoreInstance()
          if (db) {
            setFirestoreAvailable(true)
          } else {
            console.warn("Firestore instance is null, using fallback data")
            setFirestoreAvailable(false)

            // Filter fallback videos based on options
            let filteredVideos = [...FALLBACK_VIDEOS]

            if (onlyAvailable) {
              filteredVideos = filteredVideos.filter((video) => video.available)
            }

            if (category) {
              filteredVideos = filteredVideos.filter((video) => video.category === category)
            }

            setVideos(filteredVideos.slice(0, limitCount))
            setLoading(false)
            return
          }
        } catch (err) {
          console.error("Failed to get Firestore instance:", err)
          setFirestoreAvailable(false)

          // Filter fallback videos based on options
          let filteredVideos = [...FALLBACK_VIDEOS]

          if (onlyAvailable) {
            filteredVideos = filteredVideos.filter((video) => video.available)
          }

          if (category) {
            filteredVideos = filteredVideos.filter((video) => video.category === category)
          }

          setVideos(filteredVideos.slice(0, limitCount))
          setLoading(false)
          return
        }

        try {
          // Dynamically import Firestore functions to avoid SSR issues
          const {
            collection,
            getDocs,
            query,
            where,
            orderBy,
            limit: firestoreLimit,
          } = await import("firebase/firestore")

          // Create query based on filters
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
            constraints.push(firestoreLimit(limitCount))
          }

          const q = query(videosQuery, ...constraints)
          const querySnapshot = await getDocs(q)

          const videosData = querySnapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
            }
          }) as Video[]

          console.log("Fetched videos:", videosData)

          if (videosData.length > 0) {
            setVideos(videosData)
          } else {
            console.log("No videos found in Firestore, using fallback data")

            // Filter fallback videos based on options
            let filteredVideos = [...FALLBACK_VIDEOS]

            if (onlyAvailable) {
              filteredVideos = filteredVideos.filter((video) => video.available)
            }

            if (category) {
              filteredVideos = filteredVideos.filter((video) => video.category === category)
            }

            setVideos(filteredVideos.slice(0, limitCount))
          }

          setError(null)
        } catch (queryError) {
          console.error("Error with Firestore query:", queryError)
          // Use fallback videos on query error
          let filteredVideos = [...FALLBACK_VIDEOS]

          if (onlyAvailable) {
            filteredVideos = filteredVideos.filter((video) => video.available)
          }

          if (category) {
            filteredVideos = filteredVideos.filter((video) => video.category === category)
          }

          setVideos(filteredVideos.slice(0, limitCount))
        }
      } catch (err) {
        console.error("Error fetching videos:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch videos"))

        // Use fallback videos on any error
        let filteredVideos = [...FALLBACK_VIDEOS]

        if (onlyAvailable) {
          filteredVideos = filteredVideos.filter((video) => video.available)
        }

        if (category) {
          filteredVideos = filteredVideos.filter((video) => video.category === category)
        }

        setVideos(filteredVideos.slice(0, limitCount))
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [onlyAvailable, limitCount, category])

  return { videos, loading, error, firestoreAvailable }
}

// Function to get a single video by ID
export async function getVideo(id: string): Promise<Video | null> {
  try {
    if (typeof window === "undefined") {
      console.error("Cannot get video server-side")
      return null
    }

    // Check if the ID matches any fallback video
    const fallbackVideo = FALLBACK_VIDEOS.find((v) => v.id === id)
    if (fallbackVideo) {
      return fallbackVideo
    }

    let db
    try {
      db = getFirestoreInstance()
      if (!db) {
        console.warn("Firestore instance is null, returning fallback video if available")
        return fallbackVideo || null
      }
    } catch (err) {
      console.error("Failed to get Firestore instance:", err)
      return fallbackVideo || null
    }

    try {
      // Dynamically import Firestore functions
      const { doc, getDoc } = await import("firebase/firestore")

      const docRef = doc(db, "videos", id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Video
      } else {
        console.log("No such video!")
        return fallbackVideo || null
      }
    } catch (error) {
      console.error("Error getting video from Firestore:", error)
      return fallbackVideo || null
    }
  } catch (error) {
    console.error("Error getting video:", error)
    return null
  }
}
