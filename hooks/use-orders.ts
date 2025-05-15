"use client"

import { useState, useEffect, useCallback } from "react"
import type { Timestamp } from "firebase/firestore"
import { getFirestore } from "@/lib/firebase"

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  imageUrl?: string
}

export interface OrderHistoryEntry {
  status: string
  timestamp: Timestamp | Date
  comment?: string
}

export interface Order {
  id: string
  userId?: string
  customerInfo: {
    name: string
    email: string
    phone: string
    address: {
      line1: string
      line2?: string
      city: string
      state?: string
      postalCode: string
      country: string
    }
  }
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  trackingNumber?: string
  shippingMethod?: string
  notes?: string
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
  history: OrderHistoryEntry[]
  orderType?: "product" | "video"
  videoRequest?: {
    playerId: string
    playerName: string
    occasion: string
    recipientName: string
    message: string
    requestedDeliveryDate?: Timestamp | Date
  }
}

// Fallback orders for when Firebase is unavailable
const FALLBACK_ORDERS: Order[] = [
  {
    id: "ORD-7392",
    userId: "user123",
    customerInfo: {
      name: "Ahmed Al Mansour",
      email: "ahmed@example.com",
      phone: "+971 50 123 4567",
      address: {
        line1: "123 Sheikh Zayed Road",
        city: "Dubai",
        postalCode: "12345",
        country: "UAE",
      },
    },
    items: [
      {
        productId: "prod1",
        productName: "Lionel Messi Signed Jersey",
        quantity: 1,
        price: 1299.99,
        imageUrl: "/images/messi-signed-jersey.png",
      },
    ],
    subtotal: 1299.99,
    shipping: 0,
    tax: 0,
    total: 1299.99,
    paymentMethod: "Credit Card",
    paymentStatus: "paid",
    orderStatus: "delivered",
    shippingMethod: "Standard",
    createdAt: new Date("2023-04-18"),
    updatedAt: new Date("2023-04-20"),
    orderType: "product",
    history: [
      {
        status: "delivered",
        timestamp: new Date("2023-04-20"),
        comment: "Order delivered to customer",
      },
      {
        status: "shipped",
        timestamp: new Date("2023-04-19"),
        comment: "Order shipped via DHL Express",
      },
      {
        status: "processing",
        timestamp: new Date("2023-04-18"),
        comment: "Order verified and processed",
      },
    ],
  },
  {
    id: "ORD-7391",
    userId: "user456",
    customerInfo: {
      name: "Sara Khan",
      email: "sara@example.com",
      phone: "+971 50 987 6543",
      address: {
        line1: "456 Al Wasl Road",
        city: "Dubai",
        postalCode: "54321",
        country: "UAE",
      },
    },
    items: [
      {
        productId: "prod2",
        productName: "Cristiano Ronaldo Signed Jersey",
        quantity: 1,
        price: 899.99,
        imageUrl: "/images/ronaldo-signed-jersey.png",
      },
      {
        productId: "prod3",
        productName: "Kylian Mbappé Signed Jersey",
        quantity: 1,
        price: 999.99,
        imageUrl: "/images/mbappe-signed-jersey.png",
      },
    ],
    subtotal: 1899.98,
    shipping: 0,
    tax: 0,
    total: 1899.98,
    paymentMethod: "PayPal",
    paymentStatus: "paid",
    orderStatus: "shipped",
    trackingNumber: "DHL1234567890",
    shippingMethod: "Express",
    createdAt: new Date("2023-04-17"),
    updatedAt: new Date("2023-04-18"),
    orderType: "product",
    history: [
      {
        status: "shipped",
        timestamp: new Date("2023-04-18"),
        comment: "Order shipped via DHL Express",
      },
      {
        status: "processing",
        timestamp: new Date("2023-04-17"),
        comment: "Order verified and processed",
      },
    ],
  },
  {
    id: "VID-1001",
    userId: "user789",
    customerInfo: {
      name: "Mohammed Hassan",
      email: "mohammed@example.com",
      phone: "+971 55 111 2222",
      address: {
        line1: "789 Jumeirah Beach Road",
        city: "Dubai",
        postalCode: "67890",
        country: "UAE",
      },
    },
    items: [
      {
        productId: "video1",
        productName: "Personalized Video from Lionel Messi",
        quantity: 1,
        price: 499.99,
        imageUrl: "/images/video-thumbnails/messi-greeting.png",
      },
    ],
    subtotal: 499.99,
    shipping: 0,
    tax: 0,
    total: 499.99,
    paymentMethod: "Credit Card",
    paymentStatus: "paid",
    orderStatus: "completed",
    createdAt: new Date("2023-04-15"),
    updatedAt: new Date("2023-04-16"),
    orderType: "video",
    history: [
      {
        status: "completed",
        timestamp: new Date("2023-04-16"),
        comment: "Video delivered to customer",
      },
      {
        status: "processing",
        timestamp: new Date("2023-04-15"),
        comment: "Request sent to player",
      },
    ],
    videoRequest: {
      playerId: "player1",
      playerName: "Lionel Messi",
      occasion: "Birthday",
      recipientName: "Ali",
      message: "Happy birthday to my biggest fan!",
      requestedDeliveryDate: new Date("2023-04-20"),
    },
  },
]

// Hook to fetch orders
export function useOrders(
  options: {
    statusFilter?: string
    userId?: string
    orderType?: "product" | "video" | "all"
    refreshInterval?: number
  } = {},
) {
  const { statusFilter = "all", userId, orderType = "all", refreshInterval = 30000 } = options
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [firestoreAvailable, setFirestoreAvailable] = useState<boolean | null>(null)
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now())

  // Function to fetch orders that can be called to refresh data
  const fetchOrders = useCallback(async () => {
    try {
      // Skip if we're not in the browser
      if (typeof window === "undefined") {
        setLoading(false)
        return
      }

      // Check if there are any orders in localStorage first (for offline mode or fallback)
      const localOrders = localStorage.getItem("orders")
      let localOrdersData: Order[] = []

      if (localOrders) {
        try {
          localOrdersData = JSON.parse(localOrders)
          console.log("Found local orders:", localOrdersData.length)
        } catch (e) {
          console.error("Error parsing local orders:", e)
        }
      }

      // Check if Firestore is available
      let db = null
      try {
        db = await getFirestore()
        if (db) {
          setFirestoreAvailable(true)
          console.log("Firestore available, fetching orders")
        } else {
          console.warn("Firestore instance is null, using local/fallback data")
          setFirestoreAvailable(false)

          // Use local orders if available, otherwise use fallback
          if (localOrdersData.length > 0) {
            // Filter local orders based on options
            let filteredOrders = [...localOrdersData]

            if (userId) {
              filteredOrders = filteredOrders.filter((order) => order.userId === userId)
            }

            if (orderType !== "all") {
              filteredOrders = filteredOrders.filter((order) => order.orderType === orderType)
            }

            if (statusFilter !== "all") {
              filteredOrders = filteredOrders.filter((order) => order.orderStatus === statusFilter)
            }

            // Sort by createdAt in descending order
            filteredOrders.sort((a, b) => {
              const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)
              const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)
              return dateB.getTime() - dateA.getTime()
            })

            setOrders(filteredOrders)
          } else {
            // Filter fallback orders based on options
            let filteredOrders = [...FALLBACK_ORDERS]

            if (userId) {
              filteredOrders = filteredOrders.filter((order) => order.userId === userId)
            }

            if (orderType !== "all") {
              filteredOrders = filteredOrders.filter((order) => order.orderType === orderType)
            }

            if (statusFilter !== "all") {
              filteredOrders = filteredOrders.filter((order) => order.orderStatus === statusFilter)
            }

            setOrders(filteredOrders)
          }

          setLoading(false)
          return
        }
      } catch (err) {
        console.error("Failed to get Firestore instance:", err)
        setFirestoreAvailable(false)

        // Use local orders if available, otherwise use fallback
        if (localOrdersData.length > 0) {
          // Filter local orders based on options
          let filteredOrders = [...localOrdersData]

          if (userId) {
            filteredOrders = filteredOrders.filter((order) => order.userId === userId)
          }

          if (orderType !== "all") {
            filteredOrders = filteredOrders.filter((order) => order.orderType === orderType)
          }

          if (statusFilter !== "all") {
            filteredOrders = filteredOrders.filter((order) => order.orderStatus === statusFilter)
          }

          // Sort by createdAt in descending order
          filteredOrders.sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)
            return dateB.getTime() - dateA.getTime()
          })

          setOrders(filteredOrders)
        } else {
          // Filter fallback orders based on options
          let filteredOrders = [...FALLBACK_ORDERS]

          if (userId) {
            filteredOrders = filteredOrders.filter((order) => order.userId === userId)
          }

          if (orderType !== "all") {
            filteredOrders = filteredOrders.filter((order) => order.orderType === orderType)
          }

          if (statusFilter !== "all") {
            filteredOrders = filteredOrders.filter((order) => order.orderStatus === statusFilter)
          }

          setOrders(filteredOrders)
        }

        setLoading(false)
        return
      }

      try {
        // Dynamically import Firestore functions to avoid SSR issues
        const { collection, getDocs, query, where, orderBy, limit } = await import("firebase/firestore")

        // Create query based on filters
        let ordersQuery: any

        // Start building the query conditions
        const queryConditions: any[] = [orderBy("createdAt", "desc"), limit(100)]

        // Add userId filter if provided
        if (userId) {
          queryConditions.push(where("userId", "==", userId))
        }

        // Add orderType filter if not "all"
        if (orderType !== "all") {
          queryConditions.push(where("orderType", "==", orderType))
        }

        // Add status filter if not "all"
        if (statusFilter !== "all") {
          queryConditions.push(where("orderStatus", "==", statusFilter))
        }

        // Create the final query
        ordersQuery = query(collection(db, "orders"), ...queryConditions)

        const querySnapshot = await getDocs(ordersQuery)
        const ordersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[]

        console.log(`Fetched ${ordersData.length} orders from Firestore`)

        if (ordersData.length > 0) {
          // Save to localStorage for offline access
          localStorage.setItem("orders", JSON.stringify(ordersData))

          setOrders(ordersData)
        } else {
          console.log("No orders found in Firestore, checking local storage")

          // Check if we have orders in localStorage
          if (localOrdersData.length > 0) {
            // Filter local orders based on options
            let filteredOrders = [...localOrdersData]

            if (userId) {
              filteredOrders = filteredOrders.filter((order) => order.userId === userId)
            }

            if (orderType !== "all") {
              filteredOrders = filteredOrders.filter((order) => order.orderType === orderType)
            }

            if (statusFilter !== "all") {
              filteredOrders = filteredOrders.filter((order) => order.orderStatus === statusFilter)
            }

            // Sort by createdAt in descending order
            filteredOrders.sort((a, b) => {
              const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)
              const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)
              return dateB.getTime() - dateA.getTime()
            })

            setOrders(filteredOrders)
          } else {
            // Use fallback orders
            console.log("No local orders, using fallback data")

            // Filter fallback orders based on options
            let filteredOrders = [...FALLBACK_ORDERS]

            if (userId) {
              filteredOrders = filteredOrders.filter((order) => order.userId === userId)
            }

            if (orderType !== "all") {
              filteredOrders = filteredOrders.filter((order) => order.orderType === orderType)
            }

            if (statusFilter !== "all") {
              filteredOrders = filteredOrders.filter((order) => order.orderStatus === statusFilter)
            }

            setOrders(filteredOrders)
          }
        }
      } catch (queryError) {
        console.error("Error with Firestore query:", queryError)

        // Check if we have orders in localStorage
        if (localOrdersData.length > 0) {
          // Filter local orders based on options
          let filteredOrders = [...localOrdersData]

          if (userId) {
            filteredOrders = filteredOrders.filter((order) => order.userId === userId)
          }

          if (orderType !== "all") {
            filteredOrders = filteredOrders.filter((order) => order.orderType === orderType)
          }

          if (statusFilter !== "all") {
            filteredOrders = filteredOrders.filter((order) => order.orderStatus === statusFilter)
          }

          // Sort by createdAt in descending order
          filteredOrders.sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)
            return dateB.getTime() - dateA.getTime()
          })

          setOrders(filteredOrders)
        } else {
          // Use fallback orders on query error
          let filteredOrders = [...FALLBACK_ORDERS]

          if (userId) {
            filteredOrders = filteredOrders.filter((order) => order.userId === userId)
          }

          if (orderType !== "all") {
            filteredOrders = filteredOrders.filter((order) => order.orderType === orderType)
          }

          if (statusFilter !== "all") {
            filteredOrders = filteredOrders.filter((order) => order.orderStatus === statusFilter)
          }

          setOrders(filteredOrders)
        }
      }
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError(err instanceof Error ? err : new Error("Unknown error"))

      // Try to get orders from localStorage
      try {
        const localOrders = localStorage.getItem("orders")
        if (localOrders) {
          const localOrdersData = JSON.parse(localOrders)

          // Filter local orders based on options
          let filteredOrders = [...localOrdersData]

          if (userId) {
            filteredOrders = filteredOrders.filter((order) => order.userId === userId)
          }

          if (orderType !== "all") {
            filteredOrders = filteredOrders.filter((order) => order.orderType === orderType)
          }

          if (statusFilter !== "all") {
            filteredOrders = filteredOrders.filter((order) => order.orderStatus === statusFilter)
          }

          // Sort by createdAt in descending order
          filteredOrders.sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)
            return dateB.getTime() - dateA.getTime()
          })

          setOrders(filteredOrders)
        } else {
          // Use fallback orders on any error
          let filteredOrders = [...FALLBACK_ORDERS]

          if (userId) {
            filteredOrders = filteredOrders.filter((order) => order.userId === userId)
          }

          if (orderType !== "all") {
            filteredOrders = filteredOrders.filter((order) => order.orderType === orderType)
          }

          if (statusFilter !== "all") {
            filteredOrders = filteredOrders.filter((order) => order.orderStatus === statusFilter)
          }

          setOrders(filteredOrders)
        }
      } catch (localStorageError) {
        console.error("Error reading from localStorage:", localStorageError)

        // Use fallback orders as last resort
        let filteredOrders = [...FALLBACK_ORDERS]

        if (userId) {
          filteredOrders = filteredOrders.filter((order) => order.userId === userId)
        }

        if (orderType !== "all") {
          filteredOrders = filteredOrders.filter((order) => order.orderType === orderType)
        }

        if (statusFilter !== "all") {
          filteredOrders = filteredOrders.filter((order) => order.orderStatus === statusFilter)
        }

        setOrders(filteredOrders)
      }
    } finally {
      setLoading(false)
      setLastRefresh(Date.now())
    }
  }, [statusFilter, userId, orderType])

  // Initial fetch
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Set up periodic refresh if refreshInterval is provided
  useEffect(() => {
    if (refreshInterval > 0) {
      const intervalId = setInterval(() => {
        console.log("Auto-refreshing orders data")
        fetchOrders()
      }, refreshInterval)

      return () => clearInterval(intervalId)
    }
  }, [fetchOrders, refreshInterval])

  // Function to manually refresh orders
  const refreshOrders = () => {
    setLoading(true)
    fetchOrders()
  }

  return { orders, loading, error, firestoreAvailable, setOrders, refreshOrders, lastRefresh }
}

// Function to get a single order by ID
export async function getOrder(id: string): Promise<Order | null> {
  try {
    if (typeof window === "undefined") {
      console.error("Cannot get order server-side")
      return null
    }

    // First check localStorage for the order
    try {
      const localOrders = localStorage.getItem("orders")
      if (localOrders) {
        const parsedOrders = JSON.parse(localOrders)
        const localOrder = parsedOrders.find((o: Order) => o.id === id)
        if (localOrder) {
          console.log("Found order in localStorage:", id)
          return localOrder
        }
      }
    } catch (localStorageError) {
      console.error("Error reading from localStorage:", localStorageError)
    }

    // Check if the ID matches any fallback order
    const fallbackOrder = FALLBACK_ORDERS.find((o) => o.id === id)
    if (fallbackOrder) {
      return fallbackOrder
    }

    let db
    try {
      db = await getFirestore()
      if (!db) {
        console.warn("Firestore instance is null, returning fallback order if available")
        return fallbackOrder || null
      }
    } catch (err) {
      console.error("Failed to get Firestore instance:", err)
      return fallbackOrder || null
    }

    try {
      // Dynamically import Firestore functions
      const { doc, getDoc } = await import("firebase/firestore")

      const docRef = doc(db, "orders", id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const orderData = {
          id: docSnap.id,
          ...docSnap.data(),
        } as Order

        // Save to localStorage for offline access
        try {
          const localOrders = JSON.parse(localStorage.getItem("orders") || "[]")
          const existingOrderIndex = localOrders.findIndex((o: Order) => o.id === id)

          if (existingOrderIndex >= 0) {
            localOrders[existingOrderIndex] = orderData
          } else {
            localOrders.push(orderData)
          }

          localStorage.setItem("orders", JSON.stringify(localOrders))
        } catch (e) {
          console.error("Error updating localStorage:", e)
        }

        return orderData
      } else {
        console.log("No such order!")
        return fallbackOrder || null
      }
    } catch (error) {
      console.error("Error getting order from Firestore:", error)
      return fallbackOrder || null
    }
  } catch (error) {
    console.error("Error getting order:", error)
    return null
  }
}

// Function to update an order
export async function updateOrder(orderId: string, updates: Partial<Order>): Promise<boolean> {
  try {
    if (typeof window === "undefined") {
      console.error("Cannot update order server-side")
      return false
    }

    // Update in localStorage first for immediate feedback
    try {
      const localOrders = localStorage.getItem("orders")
      if (localOrders) {
        const parsedOrders = JSON.parse(localOrders)
        const orderIndex = parsedOrders.findIndex((o: Order) => o.id === orderId)

        if (orderIndex >= 0) {
          // Handle history updates specially
          if (updates.history) {
            // If the update includes new history entries, prepend them to the existing history
            const existingHistory = parsedOrders[orderIndex].history || []
            parsedOrders[orderIndex] = {
              ...parsedOrders[orderIndex],
              ...updates,
              updatedAt: new Date(),
              history: [...updates.history, ...existingHistory],
            }
          } else {
            // Regular update without history changes
            parsedOrders[orderIndex] = {
              ...parsedOrders[orderIndex],
              ...updates,
              updatedAt: new Date(),
            }
          }

          localStorage.setItem("orders", JSON.stringify(parsedOrders))
          console.log("Updated order in localStorage:", orderId)
        }
      }
    } catch (localStorageError) {
      console.error("Error updating localStorage:", localStorageError)
    }

    let db
    try {
      db = await getFirestore()
      if (!db) {
        console.warn("Firestore instance is null, order only updated in localStorage")
        return true // Return true since we updated localStorage
      }
    } catch (err) {
      console.error("Failed to get Firestore instance:", err)
      return true // Return true since we updated localStorage
    }

    // Dynamically import Firestore functions
    const { doc, updateDoc, arrayUnion, serverTimestamp } = await import("firebase/firestore")

    const orderRef = doc(db, "orders", orderId)

    // Handle history updates specially
    if (updates.history) {
      // For each history entry, use arrayUnion to add it to the history array
      for (const entry of updates.history) {
        await updateDoc(orderRef, {
          history: arrayUnion(entry),
          updatedAt: serverTimestamp(),
          ...(updates.orderStatus ? { orderStatus: updates.orderStatus } : {}),
          // Add other fields from updates except history
          ...Object.entries(updates)
            .filter(([key]) => key !== "history")
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}),
        })
      }
    } else {
      // Regular update without history changes
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(orderRef, updatesWithTimestamp)
    }

    // If this is a video order, also update the videoRequests collection
    if (updates.orderStatus) {
      try {
        const { collection, query, where, getDocs, updateDoc } = await import("firebase/firestore")

        // Find the corresponding video request
        const videoRequestsQuery = query(collection(db, "videoRequests"), where("orderId", "==", orderId))

        const querySnapshot = await getDocs(videoRequestsQuery)

        if (!querySnapshot.empty) {
          const videoRequestDoc = querySnapshot.docs[0]
          await updateDoc(doc(db, "videoRequests", videoRequestDoc.id), {
            status: updates.orderStatus,
            updatedAt: serverTimestamp(),
          })
          console.log("Updated corresponding video request:", videoRequestDoc.id)
        }
      } catch (videoUpdateError) {
        console.error("Error updating video request:", videoUpdateError)
        // Continue since the main order was updated
      }
    }

    return true
  } catch (error) {
    console.error("Error updating order:", error)
    return false
  }
}

// Function to create a new order
export async function createOrder(orderData: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<string | null> {
  let orderId: string | null = null
  try {
    if (typeof window === "undefined") {
      console.error("Cannot create order server-side")
      return null
    }

    // Generate a unique ID for the order
    orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`

    // Add timestamps
    const orderWithTimestamps = {
      ...orderData,
      id: orderId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Save to localStorage first for immediate access
    try {
      const localOrders = JSON.parse(localStorage.getItem("orders") || "[]")
      localOrders.push(orderWithTimestamps)
      localStorage.setItem("orders", JSON.stringify(localOrders))
      console.log("Saved order to localStorage:", orderId)
    } catch (localStorageError) {
      console.error("Error saving to localStorage:", localStorageError)
    }

    let db
    try {
      db = await getFirestore()
      if (!db) {
        console.warn("Firestore instance is null, order only saved to localStorage")
        return orderId // Return the ID since we saved to localStorage
      }
    } catch (err) {
      console.error("Failed to get Firestore instance:", err)
      return orderId // Return the ID since we saved to localStorage
    }

    // Dynamically import Firestore functions
    const { doc, setDoc, serverTimestamp } = await import("firebase/firestore")

    // Convert JS Date to Firestore Timestamp
    const orderWithFirestoreTimestamps = {
      ...orderData,
      id: orderId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    // Use setDoc with the generated ID to ensure immediate availability
    await setDoc(doc(db, "orders", orderId), orderWithFirestoreTimestamps)
    console.log("Order saved to Firestore with ID:", orderId)

    return orderId
  } catch (error) {
    console.error("Error creating order:", error)
    // Return the ID if we saved to localStorage earlier
    return orderId || null
  }
}
