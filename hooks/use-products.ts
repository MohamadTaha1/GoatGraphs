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
} from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { getFirebaseApp } from "@/lib/firebase"

export type Product = {
  id: string
  title: string
  type: "shirt" | "ball" | "photo"
  signedBy: string
  price: number
  available: boolean
  description: string
  imageUrl: string
  createdAt: any
  featured?: boolean
  soldCount?: number
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchProducts() {
      try {
        setLoading(true)
        const db = getFirestoreInstance()

        if (!db) {
          throw new Error("Firestore instance is null")
        }

        // Create a query to get products ordered by creation date
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"))

        const querySnapshot = await getDocs(q)
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]

        if (isMounted) {
          setProducts(productsData)
          setLoading(false)
        }
      } catch (err) {
        console.error("Error fetching products:", err)
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Failed to fetch products"))
          setLoading(false)
        }
      }
    }

    fetchProducts()

    return () => {
      isMounted = false
    }
  }, [])

  return { products, loading, error }
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const db = getFirestoreInstance()

    if (!db) {
      throw new Error("Firestore instance is null")
    }

    const docRef = doc(db, "products", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting product:", error)
    throw error
  }
}

export async function updateProduct(id: string, productData: Partial<Product>, imageFile?: File): Promise<boolean> {
  try {
    const db = getFirestoreInstance()

    if (!db) {
      throw new Error("Firestore instance is null")
    }

    const productRef = doc(db, "products", id)
    const updateData = { ...productData }

    // If there's a new image file, upload it
    if (imageFile) {
      const timestamp = Date.now()
      const safeFileName = imageFile.name.replace(/[^a-zA-Z0-9.]/g, "_")
      const filename = `${timestamp}_${safeFileName}`
      const imagePath = `products/${filename}`

      try {
        const imageUrl = await uploadFile(imageFile, imagePath)
        updateData.imageUrl = imageUrl
        updateData.imagePath = imagePath
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError)
        // Continue with update without changing the image
      }
    }

    await updateDoc(productRef, updateData)
    return true
  } catch (error) {
    console.error("Error updating product:", error)
    return false
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const db = getFirestoreInstance()

    if (!db) {
      throw new Error("Firestore instance is null")
    }

    await deleteDoc(doc(db, "products", id))
    return true
  } catch (error) {
    console.error("Error deleting product:", error)
    return false
  }
}

// Function to add a new product with fallback to placeholder for development
export async function addProduct(
  productData: Omit<Product, "id" | "createdAt" | "imageUrl" | "imagePath">,
  imageFile: File,
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

    // Upload image to Firebase Storage
    let imageUrl = null
    let imagePath = null

    if (imageFile) {
      try {
        const timestamp = Date.now()
        const filename = `${timestamp}_${imageFile.name.replace(/\s+/g, "_")}`
        imagePath = `products/${filename}`

        // Use the updated storage bucket
        const storage = getStorage(getFirebaseApp(), "gs://goatgraphs-shirts.firebasestorage.app")
        const storageRef = ref(storage, imagePath)

        // Show upload progress in console
        console.log("Starting upload to goatgraphs-shirts.firebasestorage.app...")

        const uploadTask = uploadBytes(storageRef, imageFile)
        const snapshot = await uploadTask

        console.log("Upload completed successfully")

        imageUrl = await getDownloadURL(snapshot.ref)
        console.log("Image URL:", imageUrl)
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError)
        throw new Error(`Failed to upload image: ${uploadError.message}`)
      }
    }

    // Create product document in Firestore
    const newProductData = {
      ...productData,
      imageUrl,
      imagePath,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "products"), newProductData)
    return docRef.id
  } catch (error) {
    console.error("Error adding product:", error)
    return null
  }
}
