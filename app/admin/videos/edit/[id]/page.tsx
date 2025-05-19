"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, Save, Trash2, Upload } from "lucide-react"
import Image from "next/image"

interface VideoData {
  id: string
  title: string
  description: string
  player: string
  playerName?: string // For backward compatibility
  price?: number
  duration?: string
  category?: string
  position?: string
  team?: string
  availability?: string
  available?: boolean
  featured?: boolean
  thumbnailUrl: string
  videoUrl: string
  createdAt?: any
  updatedAt?: any
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
    thumbnailUrl: "",
    videoUrl: "",
    price: 0,
    duration: "",
    category: "",
    position: "",
    team: "",
    availability: "7-14 days",
    available: true,
    featured: false,
  })
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState({ thumbnail: 0, video: 0 })

  // Fetch video data
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setFetchLoading(true)
        const videoDoc = await getDoc(doc(db, "videos", params.id))

        if (videoDoc.exists()) {
          const videoData = { id: videoDoc.id, ...videoDoc.data() } as VideoData

          // Handle backward compatibility with different field names
          if (!videoData.player && videoData.playerName) {
            videoData.player = videoData.playerName
          }

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
    const { name, value, type } = e.target

    // Handle number inputs
    if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: Number.parseFloat(value) || 0 }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
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

  const clearThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview(formData.thumbnailUrl)
  }

  const clearVideo = () => {
    setVideoFile(null)
    setVideoPreview(formData.videoUrl)

    // Release object URL to prevent memory leaks
    if (videoPreview && videoPreview !== formData.videoUrl) {
      URL.revokeObjectURL(videoPreview)
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
        updatedAt: new Date(),
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
      <div className="container py-8 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading video data...</span>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Videos
        </Button>
        <h1 className="text-2xl font-bold">Edit Video</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Video Information</CardTitle>
            <CardDescription>Update the video details and media files</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Video Title</Label>
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
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g. 30-60"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="greeting">Greeting</SelectItem>
                      <SelectItem value="birthday">Birthday</SelectItem>
                      <SelectItem value="congratulations">Congratulations</SelectItem>
                      <SelectItem value="motivation">Motivation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="position">Player Position</Label>
                  <Input
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="e.g. Forward, Midfielder"
                  />
                </div>

                <div>
                  <Label htmlFor="team">Current Team</Label>
                  <Input
                    id="team"
                    name="team"
                    value={formData.team}
                    onChange={handleInputChange}
                    placeholder="e.g. Manchester United"
                  />
                </div>

                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Select
                    value={formData.availability}
                    onValueChange={(value) => handleSelectChange("availability", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3-5 days">3-5 days</SelectItem>
                      <SelectItem value="5-7 days">5-7 days</SelectItem>
                      <SelectItem value="7-10 days">7-10 days</SelectItem>
                      <SelectItem value="7-14 days">7-14 days</SelectItem>
                      <SelectItem value="10-14 days">10-14 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="available"
                    checked={formData.available}
                    onCheckedChange={(checked) => handleSwitchChange("available", checked)}
                  />
                  <Label htmlFor="available">Available for Booking</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleSwitchChange("featured", checked)}
                  />
                  <Label htmlFor="featured">Featured Video</Label>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="block mb-2">Thumbnail Image</Label>
                  {thumbnailPreview ? (
                    <div className="space-y-4">
                      <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                        <Image
                          src={thumbnailPreview || "/placeholder.svg"}
                          alt="Thumbnail preview"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("thumbnail-upload")?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" /> Change
                        </Button>
                        {thumbnailFile && (
                          <Button type="button" variant="outline" onClick={clearThumbnail}>
                            <Trash2 className="h-4 w-4 mr-2" /> Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center border border-dashed rounded-md h-40">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("thumbnail-upload")?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" /> Upload Thumbnail
                      </Button>
                    </div>
                  )}
                  <Input
                    id="thumbnail-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground mt-2">Recommended size: 1280x720px (16:9 ratio)</p>
                </div>

                <div>
                  <Label className="block mb-2">Video File</Label>
                  {videoPreview ? (
                    <div className="space-y-4">
                      <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                        <video
                          src={videoPreview}
                          controls
                          className="w-full h-full"
                          onError={(e) => {
                            console.error("Video preview error:", e)
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("video-upload")?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" /> Change
                        </Button>
                        {videoFile && (
                          <Button type="button" variant="outline" onClick={clearVideo}>
                            <Trash2 className="h-4 w-4 mr-2" /> Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center border border-dashed rounded-md h-40">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("video-upload")?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" /> Upload Video
                      </Button>
                    </div>
                  )}
                  <Input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground mt-2">Max file size: 100MB</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/admin/videos")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex items-center">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Update Video
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
