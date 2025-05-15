"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { uploadFile, isStorageAvailable } from "@/lib/firebase"
import { CheckCircle, XCircle, AlertTriangle, Upload, FileText, ImageIcon, RefreshCw, Info } from "lucide-react"

export default function StorageDiagnosticsPage() {
  const [storageStatus, setStorageStatus] = useState<"checking" | "available" | "unavailable">("checking")
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "downloading" | "success" | "error">("idle")
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "deleting" | "success" | "error">("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string; timestamp: Date }>>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check Firebase Storage availability on component mount
  useEffect(() => {
    async function checkStorage() {
      try {
        const available = await isStorageAvailable()
        setStorageStatus(available ? "available" : "unavailable")
      } catch (error) {
        console.error("Error checking storage availability:", error)
        setStorageStatus("unavailable")
      }
    }

    checkStorage()

    // Load previously uploaded files from localStorage
    const savedFiles = localStorage.getItem("uploadedFiles")
    if (savedFiles) {
      try {
        setUploadedFiles(JSON.parse(savedFiles))
      } catch (e) {
        console.error("Error parsing saved files:", e)
      }
    }
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadStatus("uploading")
    setUploadProgress(0)
    setErrorMessage(null)

    try {
      // Upload the file with progress tracking
      const onProgress = (progress: number) => {
        setUploadProgress(progress)
      }

      const fileUrl = await uploadFile(file, `diagnostics/${Date.now()}_${file.name}`, onProgress)

      if (fileUrl) {
        setUploadedFileUrl(fileUrl)
        setUploadStatus("success")

        // Save to uploaded files list
        const newFile = {
          name: file.name,
          url: fileUrl,
          timestamp: new Date(),
        }

        const updatedFiles = [newFile, ...uploadedFiles].slice(0, 10) // Keep only the 10 most recent
        setUploadedFiles(updatedFiles)

        // Save to localStorage
        localStorage.setItem("uploadedFiles", JSON.stringify(updatedFiles))
      } else {
        setUploadStatus("error")
        setErrorMessage("Upload failed: No URL returned")
      }
    } catch (error) {
      console.error("Upload error:", error)
      setUploadStatus("error")
      setErrorMessage(`Upload failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleDownloadFile = async (url: string) => {
    if (!url) return

    setDownloadStatus("downloading")

    try {
      // Open the URL in a new tab
      window.open(url, "_blank")
      setDownloadStatus("success")

      // Reset status after a delay
      setTimeout(() => {
        setDownloadStatus("idle")
      }, 3000)
    } catch (error) {
      console.error("Download error:", error)
      setDownloadStatus("error")
      setErrorMessage(`Download failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleDeleteFile = async (url: string) => {
    setDeleteStatus("deleting")

    try {
      // In a real implementation, we would delete the file from Firebase Storage
      // For this diagnostic page, we'll just remove it from our local list
      const updatedFiles = uploadedFiles.filter((file) => file.url !== url)
      setUploadedFiles(updatedFiles)
      localStorage.setItem("uploadedFiles", JSON.stringify(updatedFiles))

      setDeleteStatus("success")

      // Reset status after a delay
      setTimeout(() => {
        setDeleteStatus("idle")
      }, 3000)
    } catch (error) {
      console.error("Delete error:", error)
      setDeleteStatus("error")
      setErrorMessage(`Delete failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const refreshStorageStatus = async () => {
    setStorageStatus("checking")

    try {
      const available = await isStorageAvailable()
      setStorageStatus(available ? "available" : "unavailable")
    } catch (error) {
      console.error("Error checking storage availability:", error)
      setStorageStatus("unavailable")
    }
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-display font-bold bg-gold-gradient bg-clip-text text-transparent">
          Firebase Storage Diagnostics
        </h1>
        <Button variant="outline" className="border-gold text-gold hover:bg-gold/10" onClick={refreshStorageStatus}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Status
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border-gold/30 bg-charcoal">
          <CardHeader>
            <CardTitle className="text-gold">Storage Status</CardTitle>
            <CardDescription className="text-offwhite/60">Firebase Storage connection status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-4">
              {storageStatus === "checking" ? (
                <Badge className="bg-blue-500/20 text-blue-500">
                  <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                  Checking...
                </Badge>
              ) : storageStatus === "available" ? (
                <Badge className="bg-green-500/20 text-green-500">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Available
                </Badge>
              ) : (
                <Badge className="bg-red-500/20 text-red-500">
                  <XCircle className="h-4 w-4 mr-1" />
                  Unavailable
                </Badge>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-gold/5 rounded-b-lg">
            <div className="w-full text-center text-sm text-offwhite/70">
              {storageStatus === "available" ? (
                <p>Firebase Storage is properly configured and ready to use</p>
              ) : storageStatus === "checking" ? (
                <p>Checking Firebase Storage configuration...</p>
              ) : (
                <p>Firebase Storage is not available. Check your configuration.</p>
              )}
            </div>
          </CardFooter>
        </Card>

        <Card className="border-gold/30 bg-charcoal">
          <CardHeader>
            <CardTitle className="text-gold">Upload Test</CardTitle>
            <CardDescription className="text-offwhite/60">Test file uploads to Firebase Storage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Select a file to upload</Label>
                <Input
                  id="file-upload"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  disabled={uploadStatus === "uploading" || storageStatus !== "available"}
                  className="border-gold/20"
                />
              </div>

              {uploadStatus === "uploading" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-offwhite/70">Upload progress</span>
                    <span className="text-offwhite">{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {uploadStatus === "success" && (
                <Alert className="bg-green-500/10 border-green-500/30">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-500">Upload Successful</AlertTitle>
                  <AlertDescription className="text-offwhite/70">File has been uploaded successfully.</AlertDescription>
                </Alert>
              )}

              {uploadStatus === "error" && (
                <Alert className="bg-red-500/10 border-red-500/30">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <AlertTitle className="text-red-500">Upload Failed</AlertTitle>
                  <AlertDescription className="text-offwhite/70">
                    {errorMessage || "An error occurred during upload."}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-gold/5 rounded-b-lg">
            <div className="w-full text-center text-sm text-offwhite/70">
              <p>Supported file types: images, PDFs, and documents</p>
            </div>
          </CardFooter>
        </Card>

        <Card className="border-gold/30 bg-charcoal">
          <CardHeader>
            <CardTitle className="text-gold">Storage Information</CardTitle>
            <CardDescription className="text-offwhite/60">Firebase Storage configuration details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-offwhite/70">Storage Bucket</Label>
                <div className="bg-black/20 p-2 rounded text-sm text-offwhite mt-1 font-mono">
                  {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "Not configured"}
                </div>
              </div>

              <div>
                <Label className="text-offwhite/70">Project ID</Label>
                <div className="bg-black/20 p-2 rounded text-sm text-offwhite mt-1 font-mono">
                  {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "Not configured"}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gold/5 rounded-b-lg">
            <div className="w-full text-center text-sm text-offwhite/70">
              <p>
                <Info className="inline-block mr-1 h-4 w-4 text-gold" />
                Storage rules determine who can upload and download files
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-6 bg-charcoal border border-gold/20">
          <TabsTrigger
            value="recent"
            className="text-gold data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
          >
            Recent Uploads
          </TabsTrigger>
          <TabsTrigger
            value="test"
            className="text-gold data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
          >
            Test Operations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <Card className="border-gold/30 bg-charcoal">
            <CardHeader>
              <CardTitle className="text-gold">Recently Uploaded Files</CardTitle>
              <CardDescription className="text-offwhite/60">Files uploaded during diagnostic testing</CardDescription>
            </CardHeader>
            <CardContent>
              {uploadedFiles.length > 0 ? (
                <div className="space-y-4">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded">
                      <div className="flex items-center">
                        {file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <ImageIcon className="h-5 w-5 text-gold mr-2" />
                        ) : file.name.match(/\.(pdf|doc|docx|txt)$/i) ? (
                          <FileText className="h-5 w-5 text-gold mr-2" />
                        ) : (
                          <FileText className="h-5 w-5 text-gold mr-2" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-offwhite">{file.name}</p>
                          <p className="text-xs text-offwhite/60">{new Date(file.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gold/30 text-gold hover:bg-gold/10"
                          onClick={() => handleDownloadFile(file.url)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                          onClick={() => handleDeleteFile(file.url)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Upload className="h-12 w-12 text-gold/30 mx-auto mb-4" />
                  <h3 className="text-lg font-display font-bold text-offwhite mb-2">No Files Uploaded</h3>
                  <p className="text-offwhite/60">Upload a file using the test panel to see it here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test">
          <Card className="border-gold/30 bg-charcoal">
            <CardHeader>
              <CardTitle className="text-gold">Storage Operations Test</CardTitle>
              <CardDescription className="text-offwhite/60">Test various Firebase Storage operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert className="bg-amber-500/10 border-amber-500/30">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertTitle className="text-amber-500">Testing Environment</AlertTitle>
                  <AlertDescription className="text-offwhite/70">
                    These operations are for diagnostic purposes only. Files uploaded here are not secured and may be
                    automatically deleted.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-upload">Upload Test File</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="test-upload"
                        type="file"
                        disabled={storageStatus !== "available"}
                        className="border-gold/20"
                      />
                      <Button
                        variant="outline"
                        className="border-gold text-gold hover:bg-gold/10"
                        disabled={storageStatus !== "available"}
                      >
                        Upload
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Download Test</Label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="File path or URL"
                        disabled={storageStatus !== "available"}
                        className="border-gold/20"
                      />
                      <Button
                        variant="outline"
                        className="border-gold text-gold hover:bg-gold/10"
                        disabled={storageStatus !== "available"}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gold/20" />

                <div className="space-y-2">
                  <Label>Storage Permissions Test</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="border-gold text-gold hover:bg-gold/10"
                      disabled={storageStatus !== "available"}
                    >
                      Test Read Access
                    </Button>
                    <Button
                      variant="outline"
                      className="border-gold text-gold hover:bg-gold/10"
                      disabled={storageStatus !== "available"}
                    >
                      Test Write Access
                    </Button>
                    <Button
                      variant="outline"
                      className="border-gold text-gold hover:bg-gold/10"
                      disabled={storageStatus !== "available"}
                    >
                      Test Delete Access
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
