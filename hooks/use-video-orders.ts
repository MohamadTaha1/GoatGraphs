"use client"

import { useState, useEffect } from "react"
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  orderBy,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase/app"
import { useAuth } from "@/contexts/auth-context"

export type VideoPlayer = {
  id: string
  name: string
  position: string
  team: string
  price: number
  imageUrl: string
  available: boolean
  description: string
}

export type VideoOrder = {
  id: string
  userId: string
  playerName: string
  playerImage: string
  recipientName: string
  occasion: string
  message: string
  price: number
  status: "pending" | "completed" | "rejected"
  paymentStatus: "pending" | "paid" | "failed"
  paymentMethod: "card"
  createdAt: Timestamp
  completedAt?: Timestamp
  videoUrl?: string
  playerId: string
}

export function useVideoOrders() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<VideoOrder[]>([])
  const { user } = useAuth()

  const createVideoOrder = async (
    playerId: string,
    playerName: string,
    playerImage: string,
    price: number,
    recipientName: string,
    occasion: string,
    message: string,
  ) => {
    if (!user) throw new Error("User must be logged in to create an order")

    try {
      const orderData = {
        userId: user.uid,
        playerId,
        playerName,
        playerImage,
        recipientName,
        occasion,
        message,
        price,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: "card",
        createdAt: Timestamp.now(),
      }

      const docRef = await addDoc(collection(db, "videoOrders"), orderData)
      return { id: docRef.id, ...orderData }
    } catch (error) {
      console.error("Error creating video order:", error)
      throw error
    }
  }

  const updatePaymentStatus = async (orderId: string, status: "paid" | "failed") => {
    try {
      const orderRef = doc(db, "videoOrders", orderId)
      await updateDoc(orderRef, {
        paymentStatus: status,
        ...(status === "paid" ? { paymentMethod: "card" } : {}),
      })
      return true
    } catch (error) {
      console.error("Error updating payment status:", error)
      throw error
    }
  }

  const getVideoOrder = async (orderId: string) => {
    try {
      const orderRef = doc(db, "videoOrders", orderId)
      const orderSnap = await getDoc(orderRef)

      if (orderSnap.exists()) {
        return { id: orderSnap.id, ...orderSnap.data() } as VideoOrder
      }
      return null
    } catch (error) {
      console.error("Error getting video order:", error)
      throw error
    }
  }

  const fetchUserVideoOrders = async () => {
    if (!user) return

    setLoading(true)
    try {
      const q = query(collection(db, "videoOrders"), where("userId", "==", user.uid), orderBy("createdAt", "desc"))

      const querySnapshot = await getDocs(q)
      const fetchedOrders = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as VideoOrder[]

      setOrders(fetchedOrders)
    } catch (error) {
      console.error("Error fetching video orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllVideoOrders = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, "videoOrders"), orderBy("createdAt", "desc"))

      const querySnapshot = await getDocs(q)
      const fetchedOrders = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as VideoOrder[]

      setOrders(fetchedOrders)
    } catch (error) {
      console.error("Error fetching all video orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateVideoOrderStatus = async (
    orderId: string,
    status: "pending" | "completed" | "rejected",
    videoUrl?: string,
  ) => {
    try {
      const orderRef = doc(db, "videoOrders", orderId)
      const updateData: any = {
        status,
        ...(status === "completed" ? { completedAt: Timestamp.now() } : {}),
      }

      if (videoUrl && status === "completed") {
        updateData.videoUrl = videoUrl
      }

      await updateDoc(orderRef, updateData)
      return true
    } catch (error) {
      console.error("Error updating video order status:", error)
      throw error
    }
  }

  useEffect(() => {
    if (user) {
      fetchUserVideoOrders()
    }
  }, [user])

  return {
    orders,
    loading,
    createVideoOrder,
    updatePaymentStatus,
    getVideoOrder,
    fetchUserVideoOrders,
    fetchAllVideoOrders,
    updateVideoOrderStatus,
  }
}
