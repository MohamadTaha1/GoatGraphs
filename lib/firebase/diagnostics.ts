// Update the diagnostics to check for the correct storage bucket

import { getApp } from "firebase/app"
import { getStorage, ref, getMetadata } from "firebase/storage"

function getFirebaseApp() {
  try {
    return getApp()
  } catch (e: any) {
    return null
  }
}

export async function checkFirebaseStorage(): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  try {
    if (typeof window === "undefined") {
      return {
        success: false,
        message: "Firebase Storage check can only run in browser environment",
      }
    }

    const app = getFirebaseApp()
    if (!app) {
      return {
        success: false,
        message: "Firebase app not initialized",
      }
    }

    // Initialize Storage with the correct bucket
    const storage = getStorage(app, "gs://goatgraphs-shirts.firebasestorage.app")

    // Check if we can access the bucket
    const testRef = ref(storage, "test.txt")

    // Try to get metadata (this will fail if permissions are wrong, but that's okay for testing connection)
    try {
      await getMetadata(testRef)
    } catch (error) {
      // We expect this to fail with "object not found" which means connection works
      if (error.code === "storage/object-not-found") {
        return {
          success: true,
          message: "Firebase Storage connection successful",
          details: {
            bucket: "goatgraphs-shirts.firebasestorage.app",
            testPath: "test.txt",
          },
        }
      }

      // If it's a different error, we should report it
      return {
        success: false,
        message: `Firebase Storage error: ${error.message}`,
        details: {
          code: error.code,
          bucket: "goatgraphs-shirts.firebasestorage.app",
        },
      }
    }

    return {
      success: true,
      message: "Firebase Storage connection successful",
      details: {
        bucket: "goatgraphs-shirts.firebasestorage.app",
      },
    }
  } catch (error) {
    return {
      success: false,
      message: `Firebase Storage check failed: ${error.message}`,
      details: error,
    }
  }
}
