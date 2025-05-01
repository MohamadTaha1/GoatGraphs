"use client"

import { getFirebaseApp } from "./app"
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage"

interface DiagnosticResult {
  success: boolean
  message: string
  details?: string
}

export async function testFirebaseStorage(): Promise<DiagnosticResult> {
  try {
    console.log("Starting Firebase Storage diagnostic test...")

    // Step 1: Check if Firebase is initialized
    const app = getFirebaseApp()
    console.log("Firebase app initialized:", app.name)

    // Step 2: Check Storage initialization
    const storage = getStorage(app)
    console.log("Firebase Storage initialized")

    // Step 3: Check project ID and bucket
    const projectId = app.options.projectId
    const storageBucket = app.options.storageBucket
    console.log(`Project ID: ${projectId || "unknown"}`)
    console.log(`Storage Bucket: ${storageBucket || "default"}`)

    if (!storageBucket) {
      return {
        success: false,
        message: "Storage bucket not configured",
        details: "Your Firebase configuration is missing the storageBucket parameter. Check your Firebase config.",
      }
    }

    // Step 4: Test a minimal upload (text only to avoid CORS for binary data)
    console.log("Testing minimal upload...")
    const testRef = ref(storage, `diagnostics/test-${Date.now()}.txt`)

    try {
      const snapshot = await uploadString(testRef, "Test upload from diagnostic tool")
      console.log("Test upload successful")

      // Step 5: Test download URL generation
      const url = await getDownloadURL(testRef)
      console.log("Download URL generated successfully:", url)

      return {
        success: true,
        message: "Firebase Storage is working correctly",
        details: `Successfully uploaded test file and generated download URL: ${url}`,
      }
    } catch (uploadError) {
      console.error("Test upload failed:", uploadError)

      // Check for specific error codes
      if (uploadError.code) {
        switch (uploadError.code) {
          case "storage/unauthorized":
            return {
              success: false,
              message: "Firebase Storage Rules are blocking uploads",
              details: `Your Firebase Storage security rules are preventing uploads. Update your rules to allow writes to the 'products' path.
              
Example rules:
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /diagnostics/{fileName} {
      allow read, write: if true;
    }
  }
}`,
            }
          case "storage/quota-exceeded":
            return {
              success: false,
              message: "Storage quota exceeded",
              details:
                "Your Firebase project has exceeded its storage quota. Upgrade your plan or delete unused files.",
            }
          default:
            return {
              success: false,
              message: `Firebase Storage error: ${uploadError.code}`,
              details: uploadError.message,
            }
        }
      }

      return {
        success: false,
        message: "Firebase Storage upload failed",
        details: uploadError.message,
      }
    }
  } catch (error) {
    console.error("Firebase diagnostic test failed:", error)
    return {
      success: false,
      message: "Firebase configuration error",
      details: error.message,
    }
  }
}

export async function checkCORSConfiguration(): Promise<DiagnosticResult> {
  try {
    const response = await fetch("https://www.googleapis.com/storage/v1/b/YOUR_BUCKET_NAME/o", {
      method: "OPTIONS",
      headers: {
        Origin: window.location.origin,
        "Access-Control-Request-Method": "POST",
      },
    })

    if (response.ok || response.status === 204) {
      return {
        success: true,
        message: "CORS is properly configured",
        details: "Your Firebase Storage bucket is correctly configured for CORS from this domain.",
      }
    } else {
      return {
        success: false,
        message: "CORS is not properly configured",
        details: `Your Firebase Storage bucket is not configured to allow uploads from ${window.location.origin}. Follow the CORS configuration instructions below.`,
      }
    }
  } catch (error) {
    return {
      success: false,
      message: "Could not check CORS configuration",
      details: error.message,
    }
  }
}
