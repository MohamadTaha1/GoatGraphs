"use client"

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, type FirebaseStorage } from "firebase/storage"
import { getFirebaseApp } from "./app"

let storageInstance: FirebaseStorage | null = null

// Initialize and export Firebase Storage
export function getStorageInstance(): FirebaseStorage {
  if (typeof window === "undefined") {
    throw new Error("Firebase Storage can only be accessed in the browser")
  }

  if (storageInstance) {
    return storageInstance
  }

  try {
    const app = getFirebaseApp()
    storageInstance = getStorage(app)
    console.log("Firebase Storage initialized successfully")
    return storageInstance
  } catch (error) {
    console.error("Error initializing Firebase Storage:", error)
    throw new Error(`Failed to initialize Firebase Storage: ${error.message}`)
  }
}

// Upload file to Firebase Storage with timeout and retry
export async function uploadFile(file: File, path: string, timeoutMs = 30000): Promise<string> {
  console.log(`Starting upload of file ${file.name} to path ${path}`)

  try {
    const storage = getStorageInstance()
    const storageRef = ref(storage, path)

    // Set up a timeout for the upload with retry
    const uploadWithRetry = async (retries = 2): Promise<string> => {
      try {
        console.log(`Attempting upload (retries left: ${retries})...`)
        const snapshot = await uploadBytes(storageRef, file)
        console.log("File uploaded successfully, getting download URL...")
        return await getDownloadURL(snapshot.ref)
      } catch (error) {
        if (retries > 0) {
          console.log(`Retrying upload... (${retries} retries left)`)
          return uploadWithRetry(retries - 1)
        }
        throw error
      }
    }

    const uploadPromise = uploadWithRetry()

    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error(`Upload timed out after ${timeoutMs}ms`)), timeoutMs)
    })

    // Race the upload against the timeout
    return await Promise.race([uploadPromise, timeoutPromise])
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

// Delete a file from Firebase Storage
export async function deleteFile(path: string): Promise<boolean> {
  try {
    const storage = getStorageInstance()
    const fileRef = ref(storage, path)
    await deleteObject(fileRef)
    console.log(`File at path ${path} deleted successfully`)
    return true
  } catch (error) {
    console.error(`Error deleting file at path ${path}:`, error)
    return false
  }
}
