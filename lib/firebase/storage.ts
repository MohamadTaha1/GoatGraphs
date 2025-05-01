import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { getFirebaseApp } from "./app"

let storageInstance = null

export function getStorageInstance() {
  if (storageInstance) return storageInstance

  try {
    const app = getFirebaseApp()
    if (!app) {
      console.error("Firebase app not initialized")
      return null
    }

    storageInstance = getStorage(app, "gs://goatgraphs-shirts.firebasestorage.app")
    console.log("Using storage bucket:", storageInstance.bucket || "goatgraphs-shirts.firebasestorage.app")
    return storageInstance
  } catch (error) {
    console.error("Error initializing Firebase Storage:", error)
    return null
  }
}

export async function uploadFile(file: File, path: string, timeout = 30000): Promise<string> {
  try {
    const storage = getStorageInstance()
    if (!storage) {
      throw new Error("Storage not initialized")
    }

    // Create a promise that rejects after the timeout
    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error(`Upload timed out after ${timeout}ms`)), timeout)
    })

    // Create the upload promise
    const uploadPromise = (async () => {
      const storageRef = ref(storage, path)
      const snapshot = await uploadBytes(storageRef, file)
      return await getDownloadURL(snapshot.ref)
    })()

    // Race the promises
    return await Promise.race([uploadPromise, timeoutPromise])
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

export async function uploadBase64Image(base64String: string, path: string): Promise<string> {
  try {
    // Convert base64 to blob
    const response = await fetch(base64String)
    const blob = await response.blob()

    const storage = getStorageInstance()
    if (!storage) {
      throw new Error("Storage not initialized")
    }

    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, blob)
    const downloadURL = await getDownloadURL(snapshot.ref)

    return downloadURL
  } catch (error) {
    console.error("Error uploading base64 image:", error)
    throw error
  }
}

export async function getFileURL(path: string): Promise<string> {
  try {
    const storage = getStorageInstance()
    if (!storage) {
      throw new Error("Storage not initialized")
    }

    const storageRef = ref(storage, path)
    return await getDownloadURL(storageRef)
  } catch (error) {
    console.error("Error getting file URL:", error)
    throw error
  }
}
