"use client"

import { useState, useEffect } from "react"
import type { Timestamp } from "firebase/firestore"
import { getFirestoreInstance } from "@/lib/firebase/firestore"

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
  options: { statusFilter?: string; userId?: string; orderType?: "product" | "video" | "all" } = {},
) {
  const { statusFilter = "all", userId, orderType = "all" } = options
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [firestoreAvailable, setFirestoreAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      try {
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
            setLoading(false)
            return
          }
        } catch (err) {
          console.error("Failed to get Firestore instance:", err)
          setFirestoreAvailable(false)

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
          setLoading(false)
          return
        }

        try {
          // Dynamically import Firestore functions to avoid SSR issues
          const { collection, getDocs, query, where, orderBy, limit } = await import("firebase/firestore")

          // Create query based on filters
          let ordersQuery: any

          // Start building the query conditions
          const queryConditions: any[] = [orderBy("createdAt", "desc"), limit(50)]

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

          if (ordersData.length > 0) {
            setOrders(ordersData)
          } else {
            console.log("No orders found in Firestore, using fallback data")

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
        } catch (queryError) {
          console.error("Error with Firestore query:", queryError)
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
      } catch (err) {
        console.error("Error fetching orders:", err)
        setError(err instanceof Error ? err : new Error("Unknown error"))
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
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [statusFilter, userId, orderType])

  return { orders, loading, error, firestoreAvailable, setOrders }
}

// Function to get a single order by ID
export async function getOrder(id: string): Promise<Order | null> {
  try {
    if (typeof window === "undefined") {
      console.error("Cannot get order server-side")
      return null
    }

    // Check if the ID matches any fallback order
    const fallbackOrder = FALLBACK_ORDERS.find((o) => o.id === id)
    if (fallbackOrder) {
      return fallbackOrder
    }

    let db
    try {
      db = getFirestoreInstance()
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
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Order
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

    let db
    try {
      db = getFirestoreInstance()
      if (!db) {
        console.warn("Firestore instance is null, cannot update order")
        return false
      }
    } catch (err) {
      console.error("Failed to get Firestore instance:", err)
      return false
    }

    // Dynamically import Firestore functions
    const { doc, updateDoc, serverTimestamp } = await import("firebase/firestore")

    const orderRef = doc(db, "orders", orderId)

    // Add updatedAt timestamp to updates
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: serverTimestamp(),
    }

    await updateDoc(orderRef, updatesWithTimestamp)
    return true
  } catch (error) {
    console.error("Error updating order:", error)
    return false
  }
}

// Function to create a new order
export async function createOrder(orderData: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<string | null> {
  try {
    if (typeof window === "undefined") {
      console.error("Cannot create order server-side")
      return null
    }

    let db
    try {
      db = getFirestoreInstance()
      if (!db) {
        console.warn("Firestore instance is null, cannot create order")
        return null
      }
    } catch (err) {
      console.error("Failed to get Firestore instance:", err)
      return null
    }

    // Dynamically import Firestore functions
    const { collection, addDoc, serverTimestamp } = await import("firebase/firestore")

    // Add timestamps
    const orderWithTimestamps = {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "orders"), orderWithTimestamps)
    return docRef.id
  } catch (error) {
    console.error("Error creating order:", error)
    return null
  }
}
