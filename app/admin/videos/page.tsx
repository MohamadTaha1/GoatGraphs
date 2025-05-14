"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { getStorageInstance } from "@/lib/firebase/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Trash2, Edit, Play, Video, Upload, X } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export default function VideosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState("")
  const [videoPreview, setVideoPreview] = useState("")
  const [currentVideo, setCurrentVideo] = useState(null)
  const [formData, setFormData] = useState({
    playerName: "",
    title: "",
    description: "",
    price: "",
    duration: "",
    category: "greeting",
    available: true,
  })

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const db = getFirestoreInstance()
      const videosCollection = collection(db, "videos")
      const videosSnapshot = await getDocs(videosCollection)
      const videosList = videosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setVideos(videosList)
    } catch (error) {
      console.error("Error fetching videos:", error)
      toast({
        title: "Error",
        description: "Failed to load videos. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number.parseFloat(value) || "" : value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSwitchChange = (name, checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setVideoFile(file)

      // Create a preview URL for video
      const videoUrl = URL.createObjectURL(file)
      setVideoPreview(videoUrl)
    }
  }

  const handleThumbnailFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setThumbnailFile(file)

      // Create a preview URL for thumbnail
      const imageUrl = URL.createObjectURL(file)
      setThumbnailPreview(imageUrl)
    }
  }

  const resetForm = () => {
    setFormData({
      playerName: "",
      title: "",
      description: "",
      price: "",
      duration: "",
      category: "greeting",
      available: true,
    })
    setVideoFile(null)
    setThumbnailFile(null)
    setThumbnailPreview("")
    setVideoPreview("")
    setCurrentVideo(null)
  }

  const handleAddVideo = async (e) => {
    e.preventDefault()

    if (!videoFile || !thumbnailFile) {
      toast({
        title: "Missing files",
        description: "Please upload both a video file and a thumbnail image.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)

      // Upload thumbnail to Firebase Storage
      const storage = getStorageInstance()
      const thumbnailRef = ref(storage, `video-thumbnails/${Date.now()}-${thumbnailFile.name}`)
      const thumbnailSnapshot = await uploadBytes(thumbnailRef, thumbnailFile)
      const thumbnailUrl = await getDownloadURL(thumbnailSnapshot.ref)

      // Upload video to Firebase Storage
      const videoRef = ref(storage, `videos/${Date.now()}-${videoFile.name}`)
      const videoSnapshot = await uploadBytes(videoRef, videoFile)
      const videoUrl = await getDownloadURL(videoSnapshot.ref)

      // Add document to Firestore
      const db = getFirestoreInstance()
      const videosCollection = collection(db, "videos")
      await addDoc(videosCollection, {
        playerName: formData.playerName,
        title: formData.title,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        duration: formData.duration,
        category: formData.category,
        available: formData.available,
        thumbnailUrl,
        videoUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      toast({
        title: "Success",
        description: "Video added successfully!",
      })

      resetForm()
      setIsAddDialogOpen(false)
      fetchVideos()
    } catch (error) {
      console.error("Error adding video:", error)
      toast({
        title: "Error",
        description: "Failed to add video. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleEditVideo = async (e) => {
    e.preventDefault()

    if (!currentVideo) return

    try {
      setIsUploading(true)

      let thumbnailUrl = currentVideo.thumbnailUrl
      let videoUrl = currentVideo.videoUrl

      // Upload new thumbnail if provided
      if (thumbnailFile) {
        const storage = getStorageInstance()
        const thumbnailRef = ref(storage, `video-thumbnails/${Date.now()}-${thumbnailFile.name}`)
        const thumbnailSnapshot = await uploadBytes(thumbnailRef, thumbnailFile)
        thumbnailUrl = await getDownloadURL(thumbnailSnapshot.ref)
      }

      // Upload new video if provided
      if (videoFile) {
        const storage = getStorageInstance()
        const videoRef = ref(storage, `videos/${Date.now()}-${videoFile.name}`)
        const videoSnapshot = await uploadBytes(videoRef, videoFile)
        videoUrl = await getDownloadURL(videoSnapshot.ref)
      }

      // Update document in Firestore
      const db = getFirestoreInstance()
      const videoRef = doc(db, "videos", currentVideo.id)
      await updateDoc(videoRef, {
        playerName: formData.playerName,
        title: formData.title,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        duration: formData.duration,
        category: formData.category,
        available: formData.available,
        thumbnailUrl,
        videoUrl,
        updatedAt: serverTimestamp(),
      })

      toast({
        title: "Success",
        description: "Video updated successfully!",
      })

      resetForm()
      setIsEditDialogOpen(false)
      fetchVideos()
    } catch (error) {
      console.error("Error updating video:", error)
      toast({
        title: "Error",
        description: "Failed to update video. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteVideo = async (id) => {
    if (!confirm("Are you sure you want to delete this video?")) return

    try {
      const db = getFirestoreInstance()
      await deleteDoc(doc(db, "videos", id))

      toast({
        title: "Success",
        description: "Video deleted successfully!",
      })

      fetchVideos()
    } catch (error) {
      console.error("Error deleting video:", error)
      toast({
        title: "Error",
        description: "Failed to delete video. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (video) => {
    setCurrentVideo(video)
    setFormData({
      playerName: video.playerName,
      title: video.title,
      description: video.description,
      price: video.price,
      duration: video.duration,
      category: video.category || "greeting",
      available: video.available,
    })
    setThumbnailPreview(video.thumbnailUrl)
    setVideoPreview(video.videoUrl)
    setIsEditDialogOpen(true)
  }

  const videoCategories = [
    { value: "greeting", label: "Greeting" },
    { value: "birthday", label: "Birthday" },
    { value: "congratulations", label: "Congratulations" },
    { value: "motivation", label: "Motivation" },
    { value: "other", label: "Other" },
  ]

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gold">Manage Videos</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold text-black hover:bg-gold/80">
              <Plus className="mr-2 h-4 w-4" /> Add New Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Video</DialogTitle>
              <DialogDescription>Upload a new video and fill in the details below.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddVideo} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="playerName">Player Name</Label>
                    <Input
                      id="playerName"
                      name="playerName"
                      value={formData.playerName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="title">Video Title</Label>
                    <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="duration">Duration (seconds)</Label>
                      <Input
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {videoCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="available"
                      checked={formData.available}
                      onCheckedChange={(checked) => handleSwitchChange("available", checked)}
                    />
                    <Label htmlFor="available">Available for purchase</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="thumbnail">Thumbnail Image</Label>
                    <div className="mt-1 flex items-center">
                      <label className="block w-full">
                        <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          {thumbnailPreview ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={thumbnailPreview || "/placeholder.svg"}
                                alt="Thumbnail preview"
                                fill
                                className="object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setThumbnailFile(null)
                                  setThumbnailPreview("")
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-2 text-gray-500" />
                              <p className="text-sm text-gray-500">Click to upload thumbnail</p>
                            </div>
                          )}
                          <input
                            id="thumbnail"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleThumbnailFileChange}
                          />
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="video">Video File</Label>
                    <div className="mt-1 flex items-center">
                      <label className="block w-full">
                        <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          {videoPreview ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                              <video src={videoPreview} className="max-h-full max-w-full rounded-lg" controls />
                              <button
                                type="button"
                                onClick={() => {
                                  setVideoFile(null)
                                  setVideoPreview("")
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Video className="w-8 h-8 mb-2 text-gray-500" />
                              <p className="text-sm text-gray-500">Click to upload video</p>
                            </div>
                          )}
                          <input
                            id="video"
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={handleVideoFileChange}
                          />
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm()
                    setIsAddDialogOpen(false)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                    </>
                  ) : (
                    "Add Video"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Video</DialogTitle>
              <DialogDescription>Update the video details below.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditVideo} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-playerName">Player Name</Label>
                    <Input
                      id="edit-playerName"
                      name="playerName"
                      value={formData.playerName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-title">Video Title</Label>
                    <Input id="edit-title" name="title" value={formData.title} onChange={handleInputChange} required />
                  </div>

                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-price">Price ($)</Label>
                      <Input
                        id="edit-price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-duration">Duration (seconds)</Label>
                      <Input
                        id="edit-duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {videoCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-available"
                      checked={formData.available}
                      onCheckedChange={(checked) => handleSwitchChange("available", checked)}
                    />
                    <Label htmlFor="edit-available">Available for purchase</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-thumbnail">Thumbnail Image (Optional)</Label>
                    <div className="mt-1 flex items-center">
                      <label className="block w-full">
                        <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          {thumbnailPreview ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={thumbnailPreview || "/placeholder.svg"}
                                alt="Thumbnail preview"
                                fill
                                className="object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setThumbnailFile(null)
                                  setThumbnailPreview(currentVideo?.thumbnailUrl || "")
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-2 text-gray-500" />
                              <p className="text-sm text-gray-500">Click to upload new thumbnail</p>
                            </div>
                          )}
                          <input
                            id="edit-thumbnail"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleThumbnailFileChange}
                          />
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-video">Video File (Optional)</Label>
                    <div className="mt-1 flex items-center">
                      <label className="block w-full">
                        <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          {videoPreview ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                              <video src={videoPreview} className="max-h-full max-w-full rounded-lg" controls />
                              <button
                                type="button"
                                onClick={() => {
                                  setVideoFile(null)
                                  setVideoPreview(currentVideo?.videoUrl || "")
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Video className="w-8 h-8 mb-2 text-gray-500" />
                              <p className="text-sm text-gray-500">Click to upload new video</p>
                            </div>
                          )}
                          <input
                            id="edit-video"
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={handleVideoFileChange}
                          />
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm()
                    setIsEditDialogOpen(false)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                    </>
                  ) : (
                    "Update Video"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
          <TabsTrigger value="all">All Videos</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="unavailable">Unavailable</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : videos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Video className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Videos Found</h3>
                <p className="text-gray-500 mb-4 text-center max-w-md">
                  You haven't added any videos yet. Click the "Add New Video" button to get started.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)} className="bg-gold text-black hover:bg-gold/80">
                  <Plus className="mr-2 h-4 w-4" /> Add New Video
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thumbnail</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videos.map((video) => (
                    <TableRow key={video.id}>
                      <TableCell>
                        <div className="relative h-16 w-24 rounded overflow-hidden">
                          <Image
                            src={video.thumbnailUrl || "/placeholder.svg"}
                            alt={video.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                            <Play className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{video.playerName}</TableCell>
                      <TableCell>{video.title}</TableCell>
                      <TableCell>${video.price?.toFixed(2)}</TableCell>
                      <TableCell>{video.duration}s</TableCell>
                      <TableCell>
                        {videoCategories.find((c) => c.value === video.category)?.label || video.category}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${video.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {video.available ? "Available" : "Unavailable"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => openEditDialog(video)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => handleDeleteVideo(video.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="available">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : videos.filter((v) => v.available).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Video className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Available Videos</h3>
                <p className="text-gray-500 mb-4 text-center max-w-md">
                  You don't have any available videos. Add a new video or make existing videos available.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)} className="bg-gold text-black hover:bg-gold/80">
                  <Plus className="mr-2 h-4 w-4" /> Add New Video
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thumbnail</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videos
                    .filter((v) => v.available)
                    .map((video) => (
                      <TableRow key={video.id}>
                        <TableCell>
                          <div className="relative h-16 w-24 rounded overflow-hidden">
                            <Image
                              src={video.thumbnailUrl || "/placeholder.svg"}
                              alt={video.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                              <Play className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{video.playerName}</TableCell>
                        <TableCell>{video.title}</TableCell>
                        <TableCell>${video.price?.toFixed(2)}</TableCell>
                        <TableCell>{video.duration}s</TableCell>
                        <TableCell>
                          {videoCategories.find((c) => c.value === video.category)?.label || video.category}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" onClick={() => openEditDialog(video)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => handleDeleteVideo(video.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="unavailable">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : videos.filter((v) => !v.available).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Video className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Unavailable Videos</h3>
                <p className="text-gray-500 mb-4 text-center max-w-md">You don't have any unavailable videos.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thumbnail</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videos
                    .filter((v) => !v.available)
                    .map((video) => (
                      <TableRow key={video.id}>
                        <TableCell>
                          <div className="relative h-16 w-24 rounded overflow-hidden">
                            <Image
                              src={video.thumbnailUrl || "/placeholder.svg"}
                              alt={video.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                              <Play className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{video.playerName}</TableCell>
                        <TableCell>{video.title}</TableCell>
                        <TableCell>${video.price?.toFixed(2)}</TableCell>
                        <TableCell>{video.duration}s</TableCell>
                        <TableCell>
                          {videoCategories.find((c) => c.value === video.category)?.label || video.category}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" onClick={() => openEditDialog(video)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => handleDeleteVideo(video.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
