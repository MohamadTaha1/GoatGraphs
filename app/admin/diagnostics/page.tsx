"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { getStorageInstance } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"

export default function DiagnosticsPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [summary, setSummary] = useState("")

  const addResult = (test: string, status: "success" | "error" | "warning", message: string) => {
    setResults((prev) => [...prev, { test, status, message, timestamp: new Date().toISOString() }])
  }

  const runDiagnostics = async () => {
    setIsRunning(true)
    setResults([])
    setSummary("")

    try {
      // Test 1: Check if Firebase is initialized
      try {
        const storage = getStorageInstance()
        addResult(
          "Firebase Storage Initialization",
          "success",
          `Firebase Storage initialized successfully. Bucket: ${storage.app.options.storageBucket}`,
        )
      } catch (error) {
        addResult("Firebase Storage Initialization", "error", `Failed to initialize Firebase Storage: ${error.message}`)
        setSummary("Firebase Storage initialization failed. Please check your configuration.")
        setIsRunning(false)
        return
      }

      // Test 2: Check network connectivity
      try {
        const start = Date.now()
        await fetch("https://www.google.com/favicon.ico", { method: "HEAD", mode: "no-cors" })
        const latency = Date.now() - start
        addResult(
          "Network Connectivity",
          latency > 500 ? "warning" : "success",
          `Network is online. Latency: ${latency}ms ${latency > 500 ? "(High latency may cause timeouts)" : ""}`,
        )
      } catch (error) {
        addResult("Network Connectivity", "error", `Network appears to be offline: ${error.message}`)
      }

      // Test 3: Test small file upload
      try {
        const storage = getStorageInstance()
        const testBlob = new Blob(["test"], { type: "text/plain" })
        const testFile = new File([testBlob], "test.txt", { type: "text/plain" })

        addResult("Test Upload", "warning", "Attempting to upload a small test file...")

        const testRef = ref(storage, "diagnostics/test.txt")
        const uploadStartTime = Date.now()
        const snapshot = await uploadBytes(testRef, testFile)
        const uploadDuration = Date.now() - uploadStartTime

        addResult("Test Upload", "success", `Test file uploaded successfully in ${uploadDuration}ms`)

        // Get download URL
        const downloadStartTime = Date.now()
        const url = await getDownloadURL(snapshot.ref)
        const downloadUrlDuration = Date.now() - downloadStartTime

        addResult(
          "Get Download URL",
          "success",
          `Download URL retrieved successfully in ${downloadUrlDuration}ms: ${url.substring(0, 50)}...`,
        )

        // Clean up
        await deleteObject(testRef)
        addResult("Test Cleanup", "success", "Test file deleted successfully")
      } catch (error) {
        addResult("Test Upload", "error", `Failed to upload test file: ${error.message}`)

        // Analyze error
        if (error.code) {
          switch (error.code) {
            case "storage/unauthorized":
              addResult(
                "Error Analysis",
                "error",
                "Firebase Storage Rules are blocking uploads. Update your rules to allow uploads.",
              )
              break
            case "storage/canceled":
              addResult("Error Analysis", "error", "Upload was canceled")
              break
            case "storage/unknown":
              addResult("Error Analysis", "error", "Unknown Firebase Storage error")
              break
            default:
              addResult("Error Analysis", "error", `Firebase Storage error code: ${error.code}`)
          }
        } else if (error.message?.includes("timeout") || error.message?.includes("timed out")) {
          addResult("Error Analysis", "error", "Upload timed out. This could be due to CORS configuration issues.")
        }
      }

      // Test 4: Check CORS configuration
      addResult(
        "CORS Configuration",
        "warning",
        "CORS configuration cannot be automatically tested. If uploads are failing, you may need to configure CORS.",
      )

      // Generate summary
      const errorCount = results.filter((r) => r.status === "error").length
      const warningCount = results.filter((r) => r.status === "warning").length

      if (errorCount > 0) {
        setSummary(`Diagnostics completed with ${errorCount} errors and ${warningCount} warnings. See details below.`)
      } else if (warningCount > 0) {
        setSummary(`Diagnostics completed with ${warningCount} warnings. Your setup may need some adjustments.`)
      } else {
        setSummary("All diagnostics passed successfully! Your Firebase Storage configuration appears to be working.")
      }
    } catch (error) {
      addResult("Diagnostics", "error", `Unexpected error during diagnostics: ${error.message}`)
      setSummary("Diagnostics failed with an unexpected error. See details below.")
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Firebase Storage Diagnostics</CardTitle>
          <CardDescription>Run diagnostics to troubleshoot Firebase Storage upload issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={runDiagnostics} disabled={isRunning} className="w-full">
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running Diagnostics...
                </>
              ) : (
                "Run Diagnostics"
              )}
            </Button>

            {summary && (
              <Alert className="mt-4">
                <AlertDescription>{summary}</AlertDescription>
              </Alert>
            )}

            {results.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">Diagnostic Results</h3>
                {results.map((result, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex items-start">
                      {result.status === "success" && <CheckCircle className="h-5 w-5 text-green-500 mr-2" />}
                      {result.status === "error" && <XCircle className="h-5 w-5 text-red-500 mr-2" />}
                      {result.status === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />}
                      <div>
                        <h4 className="font-medium">{result.test}</h4>
                        <p className="text-sm text-gray-500">{result.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{result.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {results.some((r) => r.status === "error") && (
              <div className="mt-6 p-4 border rounded-md bg-red-50">
                <h3 className="text-lg font-medium text-red-800">Troubleshooting Steps</h3>
                <ul className="list-disc pl-5 mt-2 space-y-2 text-red-700">
                  <li>
                    <strong>Update Firebase Storage Rules:</strong> Go to Firebase Console → Storage → Rules and update
                    to:
                    <pre className="mt-1 bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                      {`service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read;
      allow write: if request.auth != null;
    }
  }
}`}
                    </pre>
                  </li>
                  <li>
                    <strong>Configure CORS:</strong> Run these commands in your terminal:
                    <pre className="mt-1 bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                      {`# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Create cors.json file
echo '[{"origin": ["*"], "method": ["GET", "PUT", "POST", "DELETE"], "maxAgeSeconds": 3600}]' > cors.json

# Set CORS configuration
firebase storage:cors set cors.json`}
                    </pre>
                  </li>
                  <li>
                    <strong>Check Network:</strong> Ensure you have a stable internet connection.
                  </li>
                  <li>
                    <strong>Check Firebase Project:</strong> Verify that your Firebase project is active and not in a
                    suspended state.
                  </li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
