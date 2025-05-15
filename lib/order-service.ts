import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore"
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
    const db = getFirestoreInstance()
    if (!db) {
      console.error("Firestore not available")
      return "offline-order-" + uuidv4().substring(0, 8)
    }

    // Add order type and timestamps
    const orderWithMeta = {
      ...orderData,
      orderType: "product",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      history: [
        {
          status: orderData.orderStatus,
          timestamp: serverTimestamp(),
          comment: "Order created",
        },
      ],
    }

    const docRef = await addDoc(collection(db, "orders"), orderWithMeta)
    console.log("Order created with ID:", docRef.id)

    // Update the document with its ID
    await updateDoc(doc(db, "orders", docRef.id), {
      id: docRef.id,
    })

    return docRef.id
  } catch (error) {
    console.error("Error creating order:", error)
    // Return a fake ID for offline mode
    return "offline-order-" + uuidv4().substring(0, 8)
  }
}

// Create a new video request order
export async function createVideoOrder(
  orderData: Omit<VideoOrder, "id" | "createdAt" | "updatedAt" | "orderType">,
): Promise<string> {
  try {
    const db = getFirestoreInstance()
    if (!db) {
      console.error("Firestore not available")
      return "offline-video-" + uuidv4().substring(0, 8)
    }

    // Add order type and timestamps
    const orderWithMeta = {
      ...orderData,
      orderType: "video",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      history: [
        {
          status: orderData.orderStatus,
          timestamp: serverTimestamp(),
          comment: "Video request created",
        },
      ],
    }

    // Add to orders collection
    const docRef = await addDoc(collection(db, "orders"), orderWithMeta)
    console.log("Video order created with ID:", docRef.id)

    // Update the document with its ID
    await updateDoc(doc(db, "orders", docRef.id), {
      id: docRef.id,
    })

    // Also add to videoRequests collection for backward compatibility
    const videoData = {
      ...orderData.videoRequest,
      userId: orderData.userId,
      orderId: docRef.id,
      createdAt: serverTimestamp(),
      status: orderData.orderStatus,
    }

    const videoRef = await addDoc(collection(db, "videoRequests"), videoData)
    console.log("Video request created with ID:", videoRef.id)

    // Update the video request with its ID
    await updateDoc(doc(db, "videoRequests", videoRef.id), {
      id: videoRef.id,
    })

    return docRef.id
  } catch (error) {
    console.error("Error creating video order:", error)
    // Return a fake ID for offline mode
    return "offline-video-" + uuidv4().substring(0, 8)
  }
}
