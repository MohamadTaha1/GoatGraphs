"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, Upload, CheckCircle, XCircle } from "lucide-react"
import { getVideoRequest, updateVideoRequestStatus } from "@/hooks/use-videos"
import { uploadFile } from "@/lib/firebase/storage"

export default function FulfillVideoRequestPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoRequest, setVideoRequest] = useState<any>(null)
  const [videoUrl, setVideoUrl] = useState("")
  const [notes, setNotes] = useState("")

  const requestId = params.id as string

  useEffect(() => {
    async function fetchVideoRequest() {
      try {
        setLoading(true)
        const request = await getVideoRequest(requestId)

        if (request) {
          setVideoRequest(request)
          setVideoUrl(request.videoUrl || "")
        } else {
          toast({
            title: "Request not found",
            description: "The video request could not be found.",
            variant: "destructive",
          })
          router.push("/admin/videos")
        }
      } catch (error) {
        console.error("Error fetching video request:", error)
        toast({
          title: "Error",
          description: "Failed to load video request details.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchVideoRequest()
  }, [requestId, router, toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!videoFile) {
      toast({
        title: "No file selected",
        description: "Please select a video file to upload.",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)

      // Upload the video file to Firebase Storage
      const path = `videos/${requestId}/${videoFile.name}`
      const result = await uploadFile(videoFile, path)

      if (result.success && result.url) {
        setVideoUrl(result.url)
        toast({
          title: "Upload successful",
          description: "Video has been uploaded successfully.",
        })
      } else {
        throw new Error("Failed to upload video")
      }
    } catch (error) {
      console.error("Error uploading video:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading the video. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateStatus = async (status: "accepted" | "completed" | "rejected") => {
    try {
      setLoading(true)

      if (status === "completed" && !videoUrl) {
        toast({
          title: "Video required",
          description: "Please upload a video before marking as completed.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const success = await updateVideoRequestStatus(requestId, status, videoUrl)

      if (success) {
        toast({
          title: "Status updated",
          description: `Video request has been marked as ${status}.`,
        })
        router.push("/admin/videos")
      } else {
        throw new Error("Failed to update status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Update failed",
        description: "There was an error updating the request status.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Button variant="outline" onClick={() => router.push("/admin/videos")} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Videos
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Fulfill Video Request</CardTitle>
              <CardDescription>Upload and manage the requested personalized video</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium">Player</Label>
                  <p className="mt-1 text-lg font-semibold">{videoRequest?.player}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Occasion</Label>
                  <p className="mt-1">{videoRequest?.occasion}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Recipient</Label>
                <p className="mt-1">{videoRequest?.recipientName}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Message Instructions</Label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <p className="whitespace-pre-wrap">{videoRequest?.message}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Requested Delivery Date</Label>
                <p className="mt-1">{videoRequest?.deliveryDate}</p>
              </div>

              <div className="border-t pt-6">
                <Label htmlFor="video" className="text-sm font-medium">
                  Upload Video
                </Label>
                <div className="mt-2 flex items-center gap-4">
                  <Input id="video" type="file" accept="video/*" onChange={handleFileChange} disabled={uploading} />
                  <Button onClick={handleUpload} disabled={!videoFile || uploading}>
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>

                {videoUrl && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Video Preview</Label>
                    <div className="mt-2 aspect-video bg-black rounded-md overflow-hidden">
                      <video src={videoUrl} controls className="w-full h-full" />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm font-medium">
                  Admin Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this video request..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => handleUpdateStatus("rejected")}
                disabled={loading}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject Request
              </Button>

              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => handleUpdateStatus("accepted")}
                disabled={loading}
              >
                Accept Request
              </Button>

              <Button
                className="w-full sm:w-auto"
                onClick={() => handleUpdateStatus("completed")}
                disabled={loading || !videoUrl}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Completed
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="mt-1">{videoRequest?.customerName || "Not provided"}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="mt-1">{videoRequest?.customerEmail || "Not provided"}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Order ID</Label>
                <p className="mt-1">{videoRequest?.orderId || "Not linked to order"}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      videoRequest?.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : videoRequest?.status === "accepted"
                          ? "bg-blue-100 text-blue-800"
                          : videoRequest?.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {videoRequest?.status || "pending"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
