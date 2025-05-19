"use client"

import { db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  deleteDoc,
} from "firebase/firestore"
import { useState, useEffect } from "react"

export interface Video {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  videoUrl: string
  player: string
  playerName?: string // For backward compatibility
  price?: number
  duration?: string
  category?: string
  position?: string
  team?: string
  availability?: string
  available?: boolean
  featured?: boolean
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface VideoRequest {
  id: string
  player: string
  occasion: string
  recipientName: string
  message: string
  deliveryDate: string
  status: "pending" | "accepted" | "completed" | "rejected"
  createdAt: Timestamp
  customerName?: string
  customerEmail?: string
  userId?: string
  orderId?: string
  videoUrl?: string
}

// Fallback videos for when Firebase is unavailable
const FALLBACK_VIDEOS: Video[] = [
  {
    id: "1",
    title: "Birthday Greeting",
    description: "Get a personalized greeting from the football legend himself.",
    thumbnailUrl: "/images/video-thumbnails/messi-greeting.png",
    videoUrl: "https://example.com/videos/messi-greeting.mp4",
    player: "Lionel Messi",
    featured: true,
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
  },
  {
    id: "2",
    title: "Special Occasion",
    description: "Make someone's birthday special with a message from CR7.",
    thumbnailUrl: "/images/video-thumbnails/ronaldo-birthday.png",
    videoUrl: "https://example.com/videos/ronaldo-birthday.mp4",
    player: "Cristiano Ronaldo",
    featured: true,
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
  },
  {
    id: "3",
    title: "Congratulations Message",
    description: "Celebrate achievements with a special message from Mbappé.",
    thumbnailUrl: "/images/video-thumbnails/mbappe-congrats.png",
    videoUrl: "https://example.com/videos/mbappe-congrats.mp4",
    player: "Kylian Mbappé",
    featured: false,
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
  },
  {
    id: "4",
    title: "Motivational Message",
    description: "Get motivated with a powerful message from the goal machine.",
    thumbnailUrl: "/images/video-thumbnails/haaland-greeting.png",
    videoUrl: "https://example.com/videos/haaland-greeting.mp4",
    player: "Erling Haaland",
    featured: false,
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
  },
  {
    id: "5",
    title: "Special Greeting",
    description: "Make any occasion special with a message from Neymar.",
    thumbnailUrl: "/images/video-thumbnails/neymar-message.png",
    videoUrl: "https://example.com/videos/neymar-message.mp4",
    player: "Neymar Jr",
    featured: false,
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
  },
  {
    id: "6",
    title: "Personal Message",
    description: "Get a personalized message from the midfield maestro.",
    thumbnailUrl: "/images/video-thumbnails/de-bruyne-message.png",
    videoUrl: "https://example.com/videos/de-bruyne-message.mp4",
    player: "Kevin De Bruyne",
    featured: false,
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
  },
]

// Fallback video requests for when Firebase is unavailable
const FALLBACK_VIDEO_REQUESTS: VideoRequest[] = [
  {
    id: "request1",
    player: "Lionel Messi",
    occasion: "Birthday",
    recipientName: "Alex",
    message: "Please wish Alex a happy 30th birthday and mention his love for Barcelona!",
    deliveryDate: "2023-12-25",
    status: "pending",
    createdAt: Timestamp.fromDate(new Date("2023-12-01")),
    customerName: "John Smith",
    customerEmail: "john@example.com",
    userId: "user1",
    orderId: "order123",
  },
  {
    id: "request2",
    player: "Cristiano Ronaldo",
    occasion: "Graduation",
    recipientName: "Emma",
    message: "Congratulate Emma on graduating from university with honors in sports science!",
    deliveryDate: "2023-12-20",
    status: "accepted",
    createdAt: Timestamp.fromDate(new Date("2023-11-25")),
    customerName: "Sarah Johnson",
    customerEmail: "sarah@example.com",
    userId: "user2",
    orderId: "order456",
  },
  {
    id: "request3",
    player: "Kylian Mbappé",
    occasion: "Motivation",
    recipientName: "Michael",
    message: "Please motivate Michael for his upcoming football tournament. He's a big fan!",
    deliveryDate: "2023-12-15",
    status: "completed",
    createdAt: Timestamp.fromDate(new Date("2023-11-20")),
    customerName: "David Wilson",
    customerEmail: "david@example.com",
    userId: "user3",
    orderId: "order789",
    videoUrl: "https://example.com/videos/mbappe-michael.mp4",
  },
]

interface UseVideosOptions {
  onlyAvailable?: boolean
  limitCount?: number
  category?: string
  includeRequests?: boolean
  userId?: string
  refreshInterval?: number
}

// Create a new video request
export async function createVideoRequest(requestData: Omit<VideoRequest, "id" | "createdAt" | "status">) {
  try {
    const docRef = await addDoc(collection(db, "videoRequests"), {
      ...requestData,
      status: "pending",
      createdAt: Timestamp.now(),
    })

    return { id: docRef.id, success: true }
  } catch (error) {
    console.error("Error creating video request:", error)
    return { success: false, error }
  }
}

// Get a specific video request by ID
export async function getVideoRequest(id: string): Promise<VideoRequest | null> {
  try {
    const docRef = doc(db, "videoRequests", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as VideoRequest
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting video request:", error)
    return null
  }
}

// Update video request status
export async function updateVideoRequestStatus(
  id: string,
  status: "pending" | "accepted" | "completed" | "rejected",
  videoUrl?: string,
) {
  try {
    const docRef = doc(db, "videoRequests", id)
    const updateData: any = { status }

    if (videoUrl) {
      updateData.videoUrl = videoUrl
    }

    await updateDoc(docRef, updateData)
    return true
  } catch (error) {
    console.error("Error updating video request status:", error)
    return false
  }
}

// Get all video requests (for admin)
export async function getAllVideoRequests(): Promise<VideoRequest[]> {
  try {
    const q = query(collection(db, "videoRequests"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as VideoRequest[]
  } catch (error) {
    console.error("Error getting all video requests:", error)
    return []
  }
}

// Get video requests for a specific user
export async function getUserVideoRequests(userId: string): Promise<VideoRequest[]> {
  try {
    const q = query(collection(db, "videoRequests"), where("userId", "==", userId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as VideoRequest[]
  } catch (error) {
    console.error("Error getting user video requests:", error)
    return []
  }
}

// Add a new video (for admin)
export async function addVideo(videoData: Omit<Video, "id" | "createdAt" | "updatedAt">) {
  try {
    const docRef = await addDoc(collection(db, "videos"), {
      ...videoData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    return { id: docRef.id, success: true }
  } catch (error) {
    console.error("Error adding video:", error)
    return { success: false, error }
  }
}

// Update an existing video
export async function updateVideo(id: string, videoData: Partial<Video>) {
  try {
    const videoRef = doc(db, "videos", id)

    // Add updatedAt timestamp
    const updateData = {
      ...videoData,
      updatedAt: Timestamp.now(),
    }

    await updateDoc(videoRef, updateData)
    return { success: true }
  } catch (error) {
    console.error("Error updating video:", error)
    return { success: false, error }
  }
}

// Get all videos
export async function getAllVideos(): Promise<Video[]> {
  try {
    const q = query(collection(db, "videos"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Video[]
  } catch (error) {
    console.error("Error getting all videos:", error)
    return []
  }
}

// Get featured videos
export async function getFeaturedVideos(): Promise<Video[]> {
  try {
    const q = query(collection(db, "videos"), where("featured", "==", true), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Video[]
  } catch (error) {
    console.error("Error getting featured videos:", error)
    return []
  }
}

// Delete a video
export async function deleteVideo(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, "videos", id))
    return true
  } catch (error) {
    console.error("Error deleting video:", error)
    return false
  }
}

export function useVideos(options: UseVideosOptions = {}) {
  const [videos, setVideos] = useState<Video[]>([])
  const [videoRequests, setVideoRequests] = useState<VideoRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [firestoreAvailable, setFirestoreAvailable] = useState<boolean | null>(null)

  const {
    onlyAvailable = false,
    limitCount = 100,
    category,
    includeRequests = false,
    userId,
    refreshInterval = 0,
  } = options

  const fetchData = async () => {
    try {
      setLoading(true)
      console.log("Fetching videos with options:", options)

      // Skip if we're not in the browser
      if (typeof window === "undefined") {
        setLoading(false)
        return
      }

      // Check if Firestore is available
      try {
        if (db) {
          setFirestoreAvailable(true)
        } else {
          console.warn("Firestore instance is null, using fallback data")
          setFirestoreAvailable(false)

          // Filter fallback videos based on options
          let filteredVideos = [...FALLBACK_VIDEOS]

          if (category) {
            filteredVideos = filteredVideos.filter((video) => video.category === category)
          }

          setVideos(filteredVideos.slice(0, limitCount))

          // Handle video requests if needed
          if (includeRequests) {
            let filteredRequests = [...FALLBACK_VIDEO_REQUESTS]

            if (userId) {
              filteredRequests = filteredRequests.filter((request) => request.userId === userId)
            }

            setVideoRequests(filteredRequests)
          }

          setLoading(false)
          return
        }
      } catch (err) {
        console.error("Failed to get Firestore instance:", err)
        setFirestoreAvailable(false)

        // Filter fallback videos based on options
        let filteredVideos = [...FALLBACK_VIDEOS]

        if (category) {
          filteredVideos = filteredVideos.filter((video) => video.category === category)
        }

        setVideos(filteredVideos.slice(0, limitCount))

        // Handle video requests if needed
        if (includeRequests) {
          let filteredRequests = [...FALLBACK_VIDEO_REQUESTS]

          if (userId) {
            filteredRequests = filteredRequests.filter((request) => request.userId === userId)
          }

          setVideoRequests(filteredRequests)
        }

        setLoading(false)
        return
      }

      try {
        // Create query based on filters for videos
        const videosQuery = collection(db, "videos")
        const videoConstraints = []

        if (onlyAvailable) {
          videoConstraints.push(where("available", "==", true))
        }

        if (category) {
          videoConstraints.push(where("category", "==", category))
        }

        videoConstraints.push(orderBy("createdAt", "desc"))

        const q = query(videosQuery, ...videoConstraints)
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

          if (category) {
            filteredVideos = filteredVideos.filter((video) => video.category === category)
          }

          setVideos(filteredVideos.slice(0, limitCount))
        }

        // Fetch video requests if needed
        if (includeRequests) {
          // First try to get from orders collection (new approach)
          const ordersQuery = collection(db, "orders")
          const orderConstraints = [where("orderType", "==", "video")]

          if (userId) {
            orderConstraints.push(where("userId", "==", userId))
          }

          orderConstraints.push(orderBy("createdAt", "desc"))

          const ordersQ = query(ordersQuery, ...orderConstraints)
          const ordersSnapshot = await getDocs(ordersQ)

          if (!ordersSnapshot.empty) {
            const requestsFromOrders = ordersSnapshot.docs.map((doc) => {
              const data = doc.data()
              return {
                id: doc.id,
                player: data.videoRequest?.player || "Unknown Player",
                occasion: data.videoRequest?.occasion || "Not specified",
                recipientName: data.videoRequest?.recipientName || "Not specified",
                message: data.videoRequest?.message || "",
                deliveryDate: data.videoRequest?.deliveryDate || new Date().toISOString().split("T")[0],
                status: data.orderStatus || "pending",
                createdAt: data.createdAt,
                customerName: data.customerInfo?.name,
                customerEmail: data.customerInfo?.email,
                userId: data.userId,
                orderId: doc.id,
                videoUrl: data.videoRequest?.videoUrl,
              } as VideoRequest
            })

            setVideoRequests(requestsFromOrders)
          } else {
            // Fallback to videoRequests collection (old approach)
            const requestsQuery = collection(db, "videoRequests")
            const requestConstraints = []

            if (userId) {
              requestConstraints.push(where("userId", "==", userId))
            }

            requestConstraints.push(orderBy("createdAt", "desc"))

            const requestsQ = query(requestsQuery, ...requestConstraints)
            const requestsSnapshot = await getDocs(requestsQ)

            if (!requestsSnapshot.empty) {
              const requestsData = requestsSnapshot.docs.map((doc) => {
                const data = doc.data()
                return {
                  id: doc.id,
                  ...data,
                } as VideoRequest
              })

              setVideoRequests(requestsData)
            } else {
              // Use fallback data if no requests found
              let filteredRequests = [...FALLBACK_VIDEO_REQUESTS]

              if (userId) {
                filteredRequests = filteredRequests.filter((request) => request.userId === userId)
              }

              setVideoRequests(filteredRequests)
            }
          }
        }

        setError(null)
      } catch (queryError) {
        console.error("Error with Firestore query:", queryError)
        // Use fallback videos on query error
        let filteredVideos = [...FALLBACK_VIDEOS]

        if (category) {
          filteredVideos = filteredVideos.filter((video) => video.category === category)
        }

        setVideos(filteredVideos.slice(0, limitCount))

        // Handle video requests if needed
        if (includeRequests) {
          let filteredRequests = [...FALLBACK_VIDEO_REQUESTS]

          if (userId) {
            filteredRequests = filteredRequests.filter((request) => request.userId === userId)
          }

          setVideoRequests(filteredRequests)
        }
      }
    } catch (err) {
      console.error("Error fetching videos:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch videos"))

      // Use fallback videos on any error
      let filteredVideos = [...FALLBACK_VIDEOS]

      if (category) {
        filteredVideos = filteredVideos.filter((video) => video.category === category)
      }

      setVideos(filteredVideos.slice(0, limitCount))

      // Handle video requests if needed
      if (includeRequests) {
        let filteredRequests = [...FALLBACK_VIDEO_REQUESTS]

        if (userId) {
          filteredRequests = filteredRequests.filter((request) => request.userId === userId)
        }

        setVideoRequests(filteredRequests)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Set up refresh interval if specified
    let intervalId: NodeJS.Timeout | null = null
    if (refreshInterval > 0) {
      intervalId = setInterval(fetchData, refreshInterval)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [onlyAvailable, limitCount, category, includeRequests, userId, refreshInterval])

  return {
    videos,
    videoRequests,
    loading,
    error,
    firestoreAvailable,
    refreshData: fetchData,
  }
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

    try {
      if (!db) {
        console.warn("Firestore instance is null, returning fallback video if available")
        return fallbackVideo || null
      }
    } catch (err) {
      console.error("Failed to get Firestore instance:", err)
      return fallbackVideo || null
    }

    try {
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

// React hook for videos
export function useVideos2() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchVideos() {
      try {
        setLoading(true)
        const data = await getAllVideos()
        setVideos(data)
      } catch (err) {
        console.error("Error in useVideos:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch videos"))
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  return { videos, loading, error }
}

// React hook for featured videos
export function useFeaturedVideos() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchFeaturedVideos() {
      try {
        setLoading(true)
        const data = await getFeaturedVideos()
        setVideos(data)
      } catch (err) {
        console.error("Error in useFeaturedVideos:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch featured videos"))
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedVideos()
  }, [])

  return { videos, loading, error }
}

// React hook for video requests (admin)
export function useVideoRequests() {
  const [requests, setRequests] = useState<VideoRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const data = await getAllVideoRequests()
      setRequests(data)
    } catch (err) {
      console.error("Error in useVideoRequests:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch video requests"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  return { requests, loading, error, refreshData: fetchRequests }
}

// React hook for user video requests
export function useUserVideoRequests(userId: string | null) {
  const [requests, setRequests] = useState<VideoRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchUserRequests() {
      if (!userId) {
        setRequests([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await getUserVideoRequests(userId)
        setRequests(data)
      } catch (err) {
        console.error("Error in useUserVideoRequests:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch user video requests"))
      } finally {
        setLoading(false)
      }
    }

    fetchUserRequests()
  }, [userId])

  return { requests, loading, error }
}
