"use client"

import { useState, useEffect } from "react"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { uploadFile } from "@/lib/firebase/storage"
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { getFirebaseApp } from "@/lib/firebase"

export type Category = {
  id: string
  name: string
  slug: string
  description: string
  imageUrl?: string
  featured: boolean
  order?: number
  createdAt?: any
  updatedAt?: any
}

export function useCategories(featuredOnly = false) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchCategories() {
      try {
        setLoading(true)
        const db = getFirestoreInstance()

        if (!db) {
          throw new Error("Firestore instance is null")
        }

        // Create a query to get categories
        let q
        if (featuredOnly) {
          q = query(collection(db, "categories"), where("featured", "==", true), orderBy("order", "asc"))
        } else {
          q = query(collection(db, "categories"), orderBy("order", "asc"))
        }

        const querySnapshot = await getDocs(q)
        const categoriesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[]

        if (isMounted) {
          setCategories(categoriesData)
          setLoading(false)
        }
      } catch (err) {
        console.error("Error fetching categories:", err)
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Failed to fetch categories"))
          setLoading(false)
        }
      }
    }

    fetchCategories()

    return () => {
      isMounted = false
    }
  }, [featuredOnly])

  return { categories, loading, error }
}

export async function getCategory(id: string): Promise<Category | null> {
  try {
    const db = getFirestoreInstance()

    if (!db) {
      throw new Error("Firestore instance is null")
    }

    const docRef = doc(db, "categories", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Category
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting category:", error)
    throw error
  }
}

export async function updateCategory(id: string, categoryData: Partial<Category>, imageFile?: File): Promise<boolean> {
  try {
    const db = getFirestoreInstance()

    if (!db) {
      throw new Error("Firestore instance is null")
    }

    const categoryRef = doc(db, "categories", id)
    const updateData = {
      ...categoryData,
      updatedAt: serverTimestamp(),
    }

    // If there's a new image file, upload it
    if (imageFile) {
      const timestamp = Date.now()
      const safeFileName = imageFile.name.replace(/[^a-zA-Z0-9.]/g, "_")
      const filename = `${timestamp}_${safeFileName}`
      const imagePath = `categories/${filename}`

      try {
        const imageUrl = await uploadFile(imageFile, imagePath)
        updateData.imageUrl = imageUrl
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError)
        // Continue with update without changing the image
      }
    }

    await updateDoc(categoryRef, updateData)
    return true
  } catch (error) {
    console.error("Error updating category:", error)
    return false
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const db = getFirestoreInstance()

    if (!db) {
      throw new Error("Firestore instance is null")
    }

    await deleteDoc(doc(db, "categories", id))
    return true
  } catch (error) {
    console.error("Error deleting category:", error)
    return false
  }
}

export async function addCategory(
  categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">,
  imageFile?: File,
): Promise<string | null> {
  try {
    if (typeof window === "undefined") return null

    let db
    try {
      db = getFirestoreInstance()
    } catch (err) {
      console.error("Failed to get Firestore instance:", err)
      return null
    }

    if (!db) {
      console.error("Firestore instance is null")
      return null
    }

    // Upload image to Firebase Storage if provided
    let imageUrl = null

    if (imageFile) {
      try {
        const timestamp = Date.now()
        const safeFileName = imageFile.name ? imageFile.name.replace(/\s+/g, "_") : "image.jpg"
        const filename = `${timestamp}_${safeFileName}`
        const imagePath = `categories/${filename}`

        // Use the updated storage bucket with proper error handling
        const app = getFirebaseApp()
        if (!app) {
          throw new Error("Firebase app not initialized")
        }

        const storage = getStorage(app)
        const storageRef = ref(storage, imagePath)

        console.log("Starting upload...")

        const uploadTask = uploadBytes(storageRef, imageFile)
        const snapshot = await uploadTask

        console.log("Upload completed successfully")

        imageUrl = await getDownloadURL(snapshot.ref)
        console.log("Image URL:", imageUrl)
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError)
        throw new Error(
          `Failed to upload image: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`,
        )
      }
    }

    // Create category document in Firestore
    const newCategoryData = {
      ...categoryData,
      imageUrl: imageUrl || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "categories"), newCategoryData)
    return docRef.id
  } catch (error) {
    console.error("Error adding category:", error)
    return null
  }
}
