"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db } from "@/lib/firebase/firestore"
import { storage } from "@/lib/firebase/storage"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function AddVideoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    playerName: "",
    title: "",
    description: "",
    price: "",
    duration: "",
    category: "",
    position: "",
    team: "",
    availability: "7-14 days",
    available: true,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      if (type === "thumbnail") {
        setThumbnailFile(e.target.files[0])
      } else if (type === "video") {
        setVideoFile(e.target.files[0])
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Upload thumbnail if provided
      let thumbnailUrl = ""
      if (thumbnailFile) {
        const thumbnailRef = ref(storage, `videos/thumbnails/${Date.now()}-${thumbnailFile.name}`)
        await uploadBytes(thumbnailRef, thumbnailFile)
        thumbnailUrl = await getDownloadURL(thumbnailRef)
      }

      // Upload video if provided
      let videoUrl = ""
      if (videoFile) {
        const videoRef = ref(storage, `videos/content/${Date.now()}-${videoFile.name}`)
        await uploadBytes(videoRef, videoFile)
        videoUrl = await getDownloadURL(videoRef)
      }

      // Add to Firestore
      const videoData = {
        ...formData,
        price: Number.parseFloat(formData.price),
        thumbnailUrl,
        videoUrl,
        createdAt: new Date(),
      }

      await addDoc(collection(db, "videos"), videoData)

      toast({
        title: "Video added successfully",
        description: `${formData.playerName}'s video has been added to the system.`,
      })

      router.push("/admin/videos")
    } catch (error) {
      console.error("Error adding video:", error)
      toast({
        title: "Error adding video",
        description: "There was a problem adding the video. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Add New Video</h1>
        <Button variant="outline" onClick={() => router.push("/admin/videos")}>
          Cancel
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Video Information</CardTitle>
            <CardDescription>Add a new personalized video offering to the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="playerName">Player Name</Label>
                  <Input
                    id="playerName"
                    name="playerName"
                    value={formData.playerName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="title">Video Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Birthday Greeting, Congratulations Message"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
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
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g. 30-60"
                  />
                </div>
              </div>

              <div className="space-y-4">
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
                    onChange={handleChange}
                    placeholder="e.g. Forward, Midfielder"
                  />
                </div>

                <div>
                  <Label htmlFor="team">Current Team</Label>
                  <Input
                    id="team"
                    name="team"
                    value={formData.team}
                    onChange={handleChange}
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
                    name="available"
                    checked={formData.available}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, available: checked }))}
                  />
                  <Label htmlFor="available">Available for Booking</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div>
                <Label htmlFor="thumbnail">Thumbnail Image</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "thumbnail")}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">Recommended size: 1280x720px (16:9 ratio)</p>
              </div>

              <div>
                <Label htmlFor="video">Sample Video (Optional)</Label>
                <Input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, "video")}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">Upload a sample video for preview (max 50MB)</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/admin/videos")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Add Video"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
