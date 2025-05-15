import { getFirestore } from "@/lib/firebase"
import { v4 as uuidv4 } from "uuid"

// Common interface for both order types
export interface OrderBase {
  id?: string
  userId: string
  customerInfo: {
    name: string
    email: string
    phone?: string
    address?: {
      line1?: string
      line2?: string
      city?: string
      state?: string
      postalCode?: string
      country?: string
    }
  }
  subtotal: number
  shipping: number
  tax: number
  total: number
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  createdAt?: any
  updatedAt?: any
  orderType: "product" | "video"
  history?: Array<{
    status: string
    timestamp: any
    comment?: string
  }>
}

// Product order specific fields
export interface ProductOrder extends OrderBase {
  orderType: "product"
  items: Array<{
    productId: string
    productName: string
    quantity: number
    price: number
    imageUrl?: string
  }>
  trackingNumber?: string
  shippingMethod?: string
}

// Video request specific fields
export interface VideoOrder extends OrderBase {
  orderType: "video"
  videoRequest: {
    player: string
    occasion: string
    recipientName: string
    message: string
    deliveryDate: string
    status: "pending" | "accepted" | "completed" | "rejected"
    price: number
    videoUrl?: string
    thumbnailUrl?: string
  }
}

export type Order = ProductOrder | VideoOrder

// Create a new product order
export async function createProductOrder(
  orderData: Omit<ProductOrder, "id" | "createdAt" | "updatedAt" | "orderType">,
): Promise<string> {
  try {
    // Generate a unique ID for the order
    const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`

    // Add order type and timestamps
    const orderWithMeta = {
      ...orderData,
      id: orderId,
      orderType: "product",
      createdAt: new Date(),
      updatedAt: new Date(),
      history: orderData.history || [
        {
          status: orderData.orderStatus,
          timestamp: new Date(),
          comment: "Order created",
        },
      ],
    }

    try {
      // Try to save to Firestore if available
      const db = await getFirestore()

      if (db) {
        console.log("Firestore available, saving order")
        // Dynamically import Firestore functions
        const { collection, doc, setDoc } = await import("firebase/firestore")

        // Use setDoc with the generated ID to ensure immediate availability
        await setDoc(doc(db, "orders", orderId), orderWithMeta)
        console.log("Order saved to Firestore with ID:", orderId)
      } else {
        console.log("Firestore not available, using local storage")
        // Fallback to localStorage if Firestore is not available
        const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]")
        existingOrders.push(orderWithMeta)
        localStorage.setItem("orders", JSON.stringify(existingOrders))
      }
    } catch (firestoreError) {
      console.error("Error saving to Firestore:", firestoreError)
      // Fallback to localStorage on error
      const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]")
      existingOrders.push(orderWithMeta)
      localStorage.setItem("orders", JSON.stringify(existingOrders))
    }

    return orderId
  } catch (error) {
    console.error("Error creating order:", error)
    // Return a fake ID for offline mode
    return `ORD-OFFLINE-${uuidv4().substring(0, 8)}`
  }
}

// Create a new video request order
export async function createVideoOrder(
  orderData: Omit<VideoOrder, "id" | "createdAt" | "updatedAt" | "orderType">,
): Promise<string> {
  try {
    // Generate a unique ID for the order
    const orderId = `VID-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`

    // Add order type and timestamps
    const orderWithMeta = {
      ...orderData,
      id: orderId,
      orderType: "video",
      createdAt: new Date(),
      updatedAt: new Date(),
      history: orderData.history || [
        {
          status: orderData.orderStatus,
          timestamp: new Date(),
          comment: "Video request created",
        },
      ],
    }

    try {
      // Try to save to Firestore if available
      const db = await getFirestore()

      if (db) {
        console.log("Firestore available, saving video order")
        // Dynamically import Firestore functions
        const { collection, doc, setDoc } = await import("firebase/firestore")

        // Use setDoc with the generated ID to ensure immediate availability
        await setDoc(doc(db, "orders", orderId), orderWithMeta)

        // Also add to videoRequests collection for backward compatibility
        const videoData = {
          ...orderData.videoRequest,
          id: `VIDREQ-${Date.now().toString().slice(-6)}`,
          userId: orderData.userId,
          orderId: orderId,
          createdAt: new Date(),
          status: orderData.orderStatus,
        }

        await setDoc(doc(db, "videoRequests", videoData.id), videoData)
        console.log("Video order saved to Firestore with ID:", orderId)
      } else {
        console.log("Firestore not available, using local storage")
        // Fallback to localStorage if Firestore is not available
        const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]")
        existingOrders.push(orderWithMeta)
        localStorage.setItem("orders", JSON.stringify(existingOrders))

        // Also save to videoRequests in localStorage
        const videoData = {
          ...orderData.videoRequest,
          id: `VIDREQ-${Date.now().toString().slice(-6)}`,
          userId: orderData.userId,
          orderId: orderId,
          createdAt: new Date(),
          status: orderData.orderStatus,
        }

        const existingVideoRequests = JSON.parse(localStorage.getItem("videoRequests") || "[]")
        existingVideoRequests.push(videoData)
        localStorage.setItem("videoRequests", JSON.stringify(existingVideoRequests))
      }
    } catch (firestoreError) {
      console.error("Error saving to Firestore:", firestoreError)
      // Fallback to localStorage on error
      const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]")
      existingOrders.push(orderWithMeta)
      localStorage.setItem("orders", JSON.stringify(existingOrders))

      // Also save to videoRequests in localStorage
      const videoData = {
        ...orderData.videoRequest,
        id: `VIDREQ-${Date.now().toString().slice(-6)}`,
        userId: orderData.userId,
        orderId: orderId,
        createdAt: new Date(),
        status: orderData.orderStatus,
      }

      const existingVideoRequests = JSON.parse(localStorage.getItem("videoRequests") || "[]")
      existingVideoRequests.push(videoData)
      localStorage.setItem("videoRequests", JSON.stringify(existingVideoRequests))
    }

    return orderId
  } catch (error) {
    console.error("Error creating video order:", error)
    // Return a fake ID for offline mode
    return `VID-OFFLINE-${uuidv4().substring(0, 8)}`
  }
}
