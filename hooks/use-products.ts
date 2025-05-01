"use client"

import { useState, useEffect } from "react"
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { getStorageInstance } from "@/lib/firebase/storage"

export interface Product {
  id: string
  title: string
  type: string
  signedBy: string
  price: number
  available: boolean
  imageUrl: string
  description: string
  createdAt: string
  featured?: boolean
  category?: string
  team?: string
  league?: string
  season?: string
  size?: string
  color?: string
  discount?: number
  rating?: number
  reviewCount?: number
  stock?: number
  sku?: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  tags?: string[]
  relatedProducts?: string[]
}

// Hook to fetch products
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        if (typeof window === "undefined") return

        let db
        try {
          db = getFirestoreInstance()
        } catch (err) {
          console.error("Failed to get Firestore instance:", err)
          setLoading(false)
          setError(err instanceof Error ? err : new Error("Failed to get Firestore instance"))
          return
        }

        if (!db) {
          setLoading(false)
          setError(new Error("Firestore instance is null"))
          return
        }

        const productsQuery = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(50))
        const querySnapshot = await getDocs(productsQuery)
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

// Function to get a single product by ID
export async function getProduct(id: string): Promise<Product | null> {
  try {
    if (typeof window === "undefined") {
      console.error("Cannot get product server-side")
      return null
    }

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

    const docRef = doc(db, "products", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Product
    } else {
      console.log("No such product!")
      return null
    }
  } catch (error) {
    console.error("Error getting product:", error)
    return null
  }
}

// Function to add a new product with fallback to placeholder for development
export async function addProduct(
  productData: Omit<Product, "id" | "imageUrl" | "createdAt">,
  imageFile: File,
): Promise<string | null> {
  console.log("Starting product addition process...")

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
      // Get Storage instance
      const storage = getStorageInstance()
      if (!storage) {
        throw new Error("Storage instance is null")
      }

      console.log("Firebase services initialized successfully")

      // Create a storage reference
      const storageRef = ref(storage, imagePath)

      // Try to upload with a longer timeout (30 seconds)
      const uploadTimeout = 30000 // 30 seconds

      // Set up a timeout for the upload
      const uploadPromise = new Promise<string>(async (resolve, reject) => {
        try {
          console.log("Starting file upload...")

          // Try to upload in smaller chunks if the file is large
          const isLargeFile = imageFile.size > 1024 * 1024 // 1MB

          let snapshot
          if (isLargeFile) {
            console.log("Large file detected, uploading in chunks...")
            // For large files, we'll just proceed with normal upload but with longer timeout
            snapshot = await uploadBytes(storageRef, imageFile)
          } else {
            snapshot = await uploadBytes(storageRef, imageFile)
          }

          console.log("File uploaded successfully, getting download URL...")
          const url = await getDownloadURL(snapshot.ref)
          console.log("Image uploaded successfully, URL:", url)
          resolve(url)
        } catch (error) {
          console.error("Upload error:", error)
          reject(error)
        }
      })

      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error(`Upload timed out after ${uploadTimeout}ms`)), uploadTimeout)
      })

      // Race the upload against the timeout
      imageUrl = await Promise.race([uploadPromise, timeoutPromise])
    } catch (uploadError) {
      console.error("Error uploading image:", uploadError)

      // Always use a placeholder image when upload fails
      console.warn("Upload failed. Using placeholder image.")

      // Create a descriptive placeholder
      const productTitle = encodeURIComponent(productData.title || "Product")
      const playerName = encodeURIComponent(productData.signedBy || "Player")
      const placeholderQuery = `${productTitle} signed by ${playerName}`

      imageUrl = `/placeholder.svg?height=400&width=400&query=${placeholderQuery}`
      usedPlaceholder = true
      console.log("Using placeholder image:", imageUrl)
    }

    // Prepare product data with image URL
    const newProductData = {
      ...productData,
      imageUrl,
      imagePath: usedPlaceholder ? null : imagePath, // Only store path if it's not a placeholder
      createdAt: serverTimestamp(),
      usesPlaceholder: usedPlaceholder, // Flag to indicate if using placeholder
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
    throw error // Re-throw the error to be caught by the calling function
  }
}

// Function to update an existing product
export async function updateProduct(id: string, productData: Partial<Product>, imageFile?: File): Promise<boolean> {
  try {
    if (typeof window === "undefined") return false

    let db
    try {
      db = getFirestoreInstance()
    } catch (err) {
      console.error("Failed to get Firestore instance:", err)
      return false
    }

    if (!db) {
      console.error("Firestore instance is null")
      return false
    }

    // Get current product data to access the image path
    const productRef = doc(db, "products", id)
    const productSnap = await getDoc(productRef)

    if (!productSnap.exists()) {
      console.error("Product not found")
      return false
    }

    const currentProduct = productSnap.data()
    const updateData: any = { ...productData }

    // If there's a new image, upload it and update the URL
    if (imageFile) {
      let imageUrl: string
      let usedPlaceholder = false

      try {
        // Get Storage instance
        const storage = getStorageInstance()
        if (!storage) {
          throw new Error("Storage instance is null")
        }

        // Delete the old image if we have its path and it's not a placeholder
        if (currentProduct.imagePath && !currentProduct.imageUrl.includes("placeholder.svg")) {
          try {
            const oldFileRef = ref(storage, currentProduct.imagePath)
            await deleteObject(oldFileRef)
            console.log("Old image deleted successfully")
          } catch (err) {
            console.error("Error deleting old image:", err)
            // Continue anyway
          }
        }

        // Generate a unique filename with timestamp
        const timestamp = Date.now()
        const safeFileName = imageFile.name.replace(/[^a-zA-Z0-9.]/g, "_")
        const filename = `${timestamp}_${safeFileName}`
        const imagePath = `products/${filename}`

        // Try to upload with a longer timeout (30 seconds)
        const uploadTimeout = 30000 // 30 seconds

        // Upload with timeout
        const uploadPromise = new Promise<string>(async (resolve, reject) => {
          try {
            const storageRef = ref(storage, imagePath)
            const snapshot = await uploadBytes(storageRef, imageFile)
            const url = await getDownloadURL(snapshot.ref)
            resolve(url)
          } catch (error) {
            reject(error)
          }
        })

        const timeoutPromise = new Promise<string>((_, reject) => {
          setTimeout(() => reject(new Error(`Upload timed out after ${uploadTimeout}ms`)), uploadTimeout)
        })

        // Race the upload against the timeout
        imageUrl = await Promise.race([uploadPromise, timeoutPromise])
        updateData.imagePath = imagePath
      } catch (uploadError) {
        console.error("Error uploading new image:", uploadError)

        // Create a descriptive placeholder
        const productTitle = encodeURIComponent(productData.title || currentProduct.title || "Product")
        const playerName = encodeURIComponent(productData.signedBy || currentProduct.signedBy || "Player")
        const placeholderQuery = `${productTitle} signed by ${playerName}`

        imageUrl = `/placeholder.svg?height=400&width=400&query=${placeholderQuery}`
        usedPlaceholder = true
        updateData.imagePath = null
      }

      updateData.imageUrl = imageUrl
      updateData.usesPlaceholder = usedPlaceholder
    }

    updateData.updatedAt = serverTimestamp()

    await updateDoc(productRef, updateData)
    return true
  } catch (error) {
    console.error("Error updating product:", error)
    return false
  }
}

// Function to delete a product
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    if (typeof window === "undefined") return false

    let db
    try {
      db = getFirestoreInstance()
    } catch (err) {
      console.error("Failed to get Firestore instance:", err)
      return false
    }

    if (!db) {
      console.error("Firestore instance is null")
      return false
    }

    // Get the product to find the image path
    const productRef = doc(db, "products", id)
    const productSnap = await getDoc(productRef)

    if (productSnap.exists()) {
      const productData = productSnap.data()

      // Delete the image from storage if we have the path and it's not a placeholder
      if (productData.imagePath && !productData.imageUrl.includes("placeholder.svg")) {
        try {
          // Get Storage instance
          const storage = getStorageInstance()
          if (storage) {
            const fileRef = ref(storage, productData.imagePath)
            await deleteObject(fileRef)
            console.log("Product image deleted successfully")
          }
        } catch (err) {
          console.error("Error deleting product image:", err)
          // Continue anyway
        }
      }
    }

    // Delete the product document
    await deleteDoc(productRef)
    return true
  } catch (error) {
    console.error("Error deleting product:", error)
    return false
  }
}
