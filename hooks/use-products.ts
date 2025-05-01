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

        setProducts(productsData)
      } catch (err) {
        console.error("Error fetching products:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch products"))
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
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
  productData: Omit<Product, "id" | "imageUrl" | "createdAt">,
  imageFile: File,
): Promise<string | null> {
  console.log("Starting product addition process...")
  console.log(`Product data:`, productData)
  console.log(`Image file: ${imageFile.name}, size: ${(imageFile.size / 1024).toFixed(2)}KB, type: ${imageFile.type}`)

  try {
    if (typeof window === "undefined") {
      throw new Error("Cannot add product server-side")
    }

    // Get Firestore instance
    const db = getFirestoreInstance()
    if (!db) {
      throw new Error("Firestore instance is null")
    }

    // Generate a unique filename with timestamp
    const timestamp = Date.now()
    const safeFileName = imageFile.name.replace(/[^a-zA-Z0-9.]/g, "_")
    const filename = `${timestamp}_${safeFileName}`
    const imagePath = `products/${filename}`

    console.log("Uploading image to path:", imagePath)

    // Try to upload the image, but use a placeholder if it fails
    let imageUrl: string
    let usedPlaceholder = false

    try {
      // First, try to create a data URL from the image file as a fallback
      const dataUrlPromise = new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(imageFile)
      })

      // Race the upload against the data URL creation
      const uploadPromise = uploadFile(imageFile, imagePath, 60000)

      // Try the Firebase upload first, fall back to data URL if it fails
      imageUrl = await uploadPromise
      console.log("Image uploaded successfully to Firebase Storage")
    } catch (uploadError) {
      console.error("Error uploading image to Firebase Storage:", uploadError)

      // Create a descriptive placeholder
      const productTitle = encodeURIComponent(productData.title || "Product")
      const playerName = encodeURIComponent(productData.signedBy || "Player")
      const placeholderQuery = `${productTitle} signed by ${playerName}`

      imageUrl = `/placeholder.svg?height=400&width=400&query=${placeholderQuery}`
      usedPlaceholder = true
      console.log("Using placeholder image:", imageUrl)

      // Log detailed error information for troubleshooting
      console.error("IMPORTANT: To fix this issue, visit /admin/diagnostics to run the Firebase Storage troubleshooter")
    }

    // Prepare product data with image URL
    const newProductData = {
      ...productData,
      imageUrl,
      imagePath: usedPlaceholder ? null : imagePath,
      createdAt: serverTimestamp(),
      usesPlaceholder: usedPlaceholder,
    }

    console.log("Adding product to Firestore:", newProductData)

    // Add product to Firestore
    try {
      const docRef = await addDoc(collection(db, "products"), newProductData)
      console.log("Product added successfully with ID:", docRef.id)
      return docRef.id
    } catch (firestoreError) {
      console.error("Error adding product to Firestore:", firestoreError)
      throw new Error(`Failed to add product to database: ${firestoreError.message}`)
    }
  } catch (error) {
    console.error("Error in addProduct:", error)
    throw error
  }
}
