"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2, ArrowLeft, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import Image from "next/image"

interface VideoData {
  id: string
  title: string
  description: string
  player: string
  videoUrl: string
  thumbnailUrl: string
  featured: boolean
  createdAt?: any
}

export default function EditVideoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [formData, setFormData] = useState<VideoData>({
    id: "",
    title: "",
    description: "",
    player: "",
    videoUrl: "",
    thumbnailUrl: "",
    featured: false,
  })
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)

  // Fetch video data
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const videoDoc = await getDoc(doc(db, "videos", params.id))

        if (videoDoc.exists()) {
          const videoData = { id: videoDoc.id, ...videoDoc.data() } as VideoData
          setFormData(videoData)
          setThumbnailPreview(videoData.thumbnailUrl)
          setVideoPreview(videoData.videoUrl)
        } else {
          toast({
            title: "Video not found",
            description: "The requested video could not be found.",
            variant: "destructive",
          })
          router.push("/admin/videos")
        }
      } catch (error) {
        console.error("Error fetching video:", error)
        toast({
          title: "Error",
          description: "Failed to load video data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setFetchLoading(false)
      }
    }

    fetchVideo()
  }, [params.id, router, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, featured: checked }))
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setThumbnailFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setThumbnailPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setVideoFile(file)

      // Create preview URL
      const videoURL = URL.createObjectURL(file)
      setVideoPreview(videoURL)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updatedData = { ...formData }

      // If a new thumbnail was selected, upload it
      if (thumbnailFile) {
        const storageRef = ref(storage, `videos/thumbnails/${Date.now()}_${thumbnailFile.name}`)
        const uploadResult = await uploadBytes(storageRef, thumbnailFile)
        updatedData.thumbnailUrl = await getDownloadURL(uploadResult.ref)
      }

      // If a new video was selected, upload it
      if (videoFile) {
        const storageRef = ref(storage, `videos/content/${Date.now()}_${videoFile.name}`)
        const uploadResult = await uploadBytes(storageRef, videoFile)
        updatedData.videoUrl = await getDownloadURL(uploadResult.ref)
      }

      // Update video in Firestore
      await updateDoc(doc(db, "videos", params.id), {
        ...updatedData,
        updatedAt: new Date().toISOString(),
      })

      toast({
        title: "Video updated",
        description: "The video has been successfully updated.",
      })

      router.push("/admin/videos")
    } catch (error) {
      console.error("Error updating video:", error)
      toast({
        title: "Error",
        description: "Failed to update video. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="container py-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading video data...</span>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Videos
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Video</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="player">Player Name</Label>
                  <Input id="player" name="player" value={formData.player} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="featured" checked={formData.featured} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="featured">Featured Video</Label>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="thumbnail">Thumbnail Image (Leave empty to keep current)</Label>
                  <Input id="thumbnail" type="file" accept="image/*" onChange={handleThumbnailChange} />
                  <p className="text-sm text-gray-500 mt-1">Recommended size: 640x360px (16:9 ratio)</p>
                </div>

                {thumbnailPreview && (
                  <div className="mt-4">
                    <Label>Thumbnail Preview</Label>
                    <div className="mt-2 relative aspect-video w-full overflow-hidden rounded-md border">
                      <Image
                        src={thumbnailPreview || "/placeholder.svg"}
                        alt="Thumbnail preview"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="video">Video File (Leave empty to keep current)</Label>
                  <Input id="video" type="file" accept="video/*" onChange={handleVideoChange} />
                  <p className="text-sm text-gray-500 mt-1">Max file size: 100MB</p>
                </div>

                {videoPreview && (
                  <div className="mt-4">
                    <Label>Video Preview</Label>
                    <div className="mt-2 relative aspect-video w-full overflow-hidden rounded-md border">
                      <video
                        src={videoPreview}
                        controls
                        className="w-full h-full"
                        onError={(e) => {
                          console.error("Video preview error:", e)
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading} className="flex items-center">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Updating..." : "Update Video"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
