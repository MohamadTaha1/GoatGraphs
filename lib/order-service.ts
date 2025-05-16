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

// Generic order interface for the createOrder function
export interface OrderInput {
  userId: string
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    type?: "product" | "video_request"
    imageUrl?: string
  }>
  status: string
  paymentStatus: string
  shippingAddress: {
    name: string
    email: string
    phone?: string
    line1?: string
    line2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  total: number
  shipping?: number
  tax?: number
  videoRequest?: {
    player: string
    occasion: string
    recipientName: string
    message: string
    deliveryDate: string
  }
}

// Generic createOrder function that handles both product and video orders
export async function createOrder(orderInput: OrderInput): Promise<{ success: boolean; orderId: string; error?: any }> {
  try {
    // Determine if this is a product or video order
    const isVideoOrder = orderInput.items.some((item) => item.type === "video_request") || !!orderInput.videoRequest

    if (isVideoOrder) {
      // Handle as video order
      const videoOrderData: Omit<VideoOrder, "id" | "createdAt" | "updatedAt" | "orderType"> = {
        userId: orderInput.userId,
        customerInfo: {
          name: orderInput.shippingAddress.name,
          email: orderInput.shippingAddress.email,
          phone: orderInput.shippingAddress.phone,
          address: {
            line1: orderInput.shippingAddress.line1,
            line2: orderInput.shippingAddress.line2,
            city: orderInput.shippingAddress.city,
            state: orderInput.shippingAddress.state,
            postalCode: orderInput.shippingAddress.postalCode,
            country: orderInput.shippingAddress.country,
          },
        },
        subtotal: orderInput.total - (orderInput.shipping || 0) - (orderInput.tax || 0),
        shipping: orderInput.shipping || 0,
        tax: orderInput.tax || 0,
        total: orderInput.total,
        paymentMethod: "Credit Card", // Default
        paymentStatus: orderInput.paymentStatus,
        orderStatus: orderInput.status,
        videoRequest: orderInput.videoRequest || {
          player: "Unknown Player",
          occasion: "Not specified",
          recipientName: "Not specified",
          message: "No message provided",
          deliveryDate: new Date().toISOString().split("T")[0],
          status: "pending",
          price: orderInput.total,
        },
      }

      const orderId = await createVideoOrder(videoOrderData)
      return { success: true, orderId }
    } else {
      // Handle as product order
      const productOrderData: Omit<ProductOrder, "id" | "createdAt" | "updatedAt" | "orderType"> = {
        userId: orderInput.userId,
        customerInfo: {
          name: orderInput.shippingAddress.name,
          email: orderInput.shippingAddress.email,
          phone: orderInput.shippingAddress.phone,
          address: {
            line1: orderInput.shippingAddress.line1,
            line2: orderInput.shippingAddress.line2,
            city: orderInput.shippingAddress.city,
            state: orderInput.shippingAddress.state,
            postalCode: orderInput.shippingAddress.postalCode,
            country: orderInput.shippingAddress.country,
          },
        },
        subtotal: orderInput.total - (orderInput.shipping || 0) - (orderInput.tax || 0),
        shipping: orderInput.shipping || 0,
        tax: orderInput.tax || 0,
        total: orderInput.total,
        paymentMethod: "Credit Card", // Default
        paymentStatus: orderInput.paymentStatus,
        orderStatus: orderInput.status,
        items: orderInput.items.map((item) => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.imageUrl,
        })),
      }

      const orderId = await createProductOrder(productOrderData)
      return { success: true, orderId }
    }
  } catch (error) {
    console.error("Error creating order:", error)
    return { success: false, orderId: "", error }
  }
}

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
