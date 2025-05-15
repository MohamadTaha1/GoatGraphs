"use client"

import { useState, useEffect } from "react"
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase/firestore"
import { generateRandomCode } from "@/lib/utils"

export interface PromoCode {
  id: string
  code: string
  description: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minOrderValue?: number
  maxDiscount?: number
  usageLimit?: number
  usageCount: number
  startDate: Date
  endDate: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export function usePromoCodes() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPromoCodes = async () => {
    setLoading(true)
    setError(null)
    try {
      const promoCodesRef = collection(db, "promoCodes")
      const q = query(promoCodesRef, orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      const promoCodesData: PromoCode[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        promoCodesData.push({
          id: doc.id,
          code: data.code,
          description: data.description,
          discountType: data.discountType,
          discountValue: data.discountValue,
          minOrderValue: data.minOrderValue,
          maxDiscount: data.maxDiscount,
          usageLimit: data.usageLimit,
          usageCount: data.usageCount,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          isActive: data.isActive,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          createdBy: data.createdBy,
        })
      })

      setPromoCodes(promoCodesData)
    } catch (err) {
      console.error("Error fetching promo codes:", err)
      setError("Failed to fetch promo codes. Please try again later.")
      // Provide fallback data for development
      setPromoCodes([
        {
          id: "promo1",
          code: "123456",
          description: "Summer Sale 20% Off",
          discountType: "percentage",
          discountValue: 20,
          minOrderValue: 50,
          usageLimit: 100,
          usageCount: 45,
          startDate: new Date("2023-06-01"),
          endDate: new Date("2023-08-31"),
          isActive: true,
          createdAt: new Date("2023-05-15"),
          updatedAt: new Date("2023-05-15"),
          createdBy: "admin",
        },
        {
          id: "promo2",
          code: "654321",
          description: "$10 Off Your First Order",
          discountType: "fixed",
          discountValue: 10,
          usageLimit: 200,
          usageCount: 78,
          startDate: new Date("2023-01-01"),
          endDate: new Date("2023-12-31"),
          isActive: true,
          createdAt: new Date("2023-01-01"),
          updatedAt: new Date("2023-01-01"),
          createdBy: "admin",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const getPromoCode = async (id: string) => {
    try {
      const promoCodeRef = doc(db, "promoCodes", id)
      const promoCodeSnap = await getDoc(promoCodeRef)

      if (promoCodeSnap.exists()) {
        const data = promoCodeSnap.data()
        return {
          id: promoCodeSnap.id,
          code: data.code,
          description: data.description,
          discountType: data.discountType,
          discountValue: data.discountValue,
          minOrderValue: data.minOrderValue,
          maxDiscount: data.maxDiscount,
          usageLimit: data.usageLimit,
          usageCount: data.usageCount,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          isActive: data.isActive,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          createdBy: data.createdBy,
        }
      }
      return null
    } catch (err) {
      console.error("Error fetching promo code:", err)
      throw new Error("Failed to fetch promo code")
    }
  }

  const createPromoCode = async (promoCodeData: Omit<PromoCode, "id" | "createdAt" | "updatedAt" | "usageCount">) => {
    try {
      // Check if code already exists
      const codeQuery = query(collection(db, "promoCodes"), where("code", "==", promoCodeData.code))
      const codeQuerySnapshot = await getDocs(codeQuery)

      if (!codeQuerySnapshot.empty) {
        throw new Error("Promo code already exists")
      }

      const now = Timestamp.now()
      const newPromoCode = {
        ...promoCodeData,
        usageCount: 0,
        createdAt: now,
        updatedAt: now,
        startDate: Timestamp.fromDate(promoCodeData.startDate),
        endDate: Timestamp.fromDate(promoCodeData.endDate),
      }

      const docRef = await addDoc(collection(db, "promoCodes"), newPromoCode)

      // Refresh the list
      fetchPromoCodes()

      return docRef.id
    } catch (err) {
      console.error("Error creating promo code:", err)
      throw err
    }
  }

  const updatePromoCode = async (
    id: string,
    promoCodeData: Partial<Omit<PromoCode, "id" | "createdAt" | "updatedAt">>,
  ) => {
    try {
      const promoCodeRef = doc(db, "promoCodes", id)

      // If code is being updated, check if it already exists
      if (promoCodeData.code) {
        const codeQuery = query(collection(db, "promoCodes"), where("code", "==", promoCodeData.code))
        const codeQuerySnapshot = await getDocs(codeQuery)

        if (!codeQuerySnapshot.empty && codeQuerySnapshot.docs[0].id !== id) {
          throw new Error("Promo code already exists")
        }
      }

      const updateData = {
        ...promoCodeData,
        updatedAt: Timestamp.now(),
      }

      // Convert dates to Firestore timestamps
      if (promoCodeData.startDate) {
        updateData.startDate = Timestamp.fromDate(promoCodeData.startDate)
      }

      if (promoCodeData.endDate) {
        updateData.endDate = Timestamp.fromDate(promoCodeData.endDate)
      }

      await updateDoc(promoCodeRef, updateData)

      // Refresh the list
      fetchPromoCodes()
    } catch (err) {
      console.error("Error updating promo code:", err)
      throw err
    }
  }

  const deletePromoCode = async (id: string) => {
    try {
      await deleteDoc(doc(db, "promoCodes", id))

      // Refresh the list
      fetchPromoCodes()
    } catch (err) {
      console.error("Error deleting promo code:", err)
      throw err
    }
  }

  const generateCode = () => {
    return generateRandomCode(6, true) // 6-digit numeric code
  }

  const validatePromoCode = async (code: string, orderTotal: number) => {
    try {
      const codeQuery = query(collection(db, "promoCodes"), where("code", "==", code), where("isActive", "==", true))
      const codeQuerySnapshot = await getDocs(codeQuery)

      if (codeQuerySnapshot.empty) {
        return { valid: false, message: "Invalid promo code" }
      }

      const promoCodeDoc = codeQuerySnapshot.docs[0]
      const promoCode = promoCodeDoc.data()

      const now = new Date()
      const startDate = promoCode.startDate.toDate()
      const endDate = promoCode.endDate.toDate()

      // Check if promo code is expired
      if (now < startDate || now > endDate) {
        return { valid: false, message: "Promo code has expired" }
      }

      // Check usage limit
      if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
        return { valid: false, message: "Promo code has reached its usage limit" }
      }

      // Check minimum order value
      if (promoCode.minOrderValue && orderTotal < promoCode.minOrderValue) {
        return {
          valid: false,
          message: `Order total must be at least $${promoCode.minOrderValue} to use this code`,
        }
      }

      // Calculate discount
      let discount = 0
      if (promoCode.discountType === "percentage") {
        discount = (orderTotal * promoCode.discountValue) / 100

        // Apply max discount if specified
        if (promoCode.maxDiscount && discount > promoCode.maxDiscount) {
          discount = promoCode.maxDiscount
        }
      } else {
        discount = promoCode.discountValue

        // Ensure discount doesn't exceed order total
        if (discount > orderTotal) {
          discount = orderTotal
        }
      }

      return {
        valid: true,
        discount,
        promoCodeId: promoCodeDoc.id,
        message: "Promo code applied successfully",
      }
    } catch (err) {
      console.error("Error validating promo code:", err)
      return { valid: false, message: "Error validating promo code" }
    }
  }

  useEffect(() => {
    fetchPromoCodes()
  }, [])

  return {
    promoCodes,
    loading,
    error,
    fetchPromoCodes,
    getPromoCode,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
    generateCode,
    validatePromoCode,
  }
}
