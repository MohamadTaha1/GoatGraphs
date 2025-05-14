"use client"

import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { getFirestoreInstance } from "@/lib/firebase/firestore"

export interface Category {
  id: string
  name: string
  imageUrl: string
  description?: string
  featured?: boolean
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const db = getFirestoreInstance()

        if (!db) {
          throw new Error("Firestore instance is null")
        }

        const categoriesCollection = collection(db, "categories")
        const categoriesSnapshot = await getDocs(categoriesCollection)

        const categoriesData = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[]

        setCategories(categoriesData)
        setError(null)
      } catch (err) {
        console.error("Error fetching categories:", err)
        setError("Failed to load categories")
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}
