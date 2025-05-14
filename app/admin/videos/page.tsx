"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useVideos } from "@/hooks/use-videos"
import { Loader2, Plus, Search, Edit, Trash2, Play, Eye } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase/firestore"
import { useToast } from "@/components/ui/use-toast"

export default function VideosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [videoToDelete, setVideoToDelete] = useState(null)

  const { videos, loading, error } = useVideos()

  // Filter videos based on search term and category
  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.playerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || video.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleDeleteClick = (video) => {
    setVideoToDelete(video)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!videoToDelete) return

    try {
      await deleteDoc(doc(db, "videos", videoToDelete.id))
      toast({
        title: "Video deleted",
        description: `${videoToDelete.playerName}'s video has been removed.`,
      })
      // Force refresh the page to update the list
      router.refresh()
    } catch (error) {
      console.error("Error deleting video:", error)
      toast({
        title: "Error deleting video",
        description: "There was a problem deleting the video. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setVideoToDelete(null)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Personalized Videos</h1>
        <Button onClick={() => router.push("/admin/videos/add")}>
          <Plus className="mr-2 h-4 w-4" /> Add New Video
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by player or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="greeting">Greeting</SelectItem>
                <SelectItem value="birthday">Birthday</SelectItem>
                <SelectItem value="congratulations">Congratulations</SelectItem>
                <SelectItem value="motivation">Motivation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-right text-sm text-muted-foreground">
              {filteredVideos.length} video{filteredVideos.length !== 1 ? "s" : ""} found
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin mr-4" />
          <p className="text-lg">Loading videos...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">Failed to load videos. Please try again later.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-20">
          <p className="mb-4">
            No videos found. {searchTerm || categoryFilter !== "all" ? "Try adjusting your filters." : ""}
          </p>
          <Button onClick={() => router.push("/admin/videos/add")}>
            <Plus className="mr-2 h-4 w-4" /> Add Your First Video
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="relative w-full md:w-48 h-48">
                  <Image
                    src={video.thumbnailUrl || "/placeholder.svg"}
                    alt={video.title || video.playerName}
                    fill
                    className="object-cover"
                  />
                  {video.videoUrl && (
                    <Link
                      href={video.videoUrl}
                      target="_blank"
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <Play className="h-12 w-12 text-white" />
                    </Link>
                  )}
                </div>
                <CardContent className="flex-1 p-6">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{video.playerName}</h2>
                      <p className="text-muted-foreground">{video.title || "Personalized Video Message"}</p>

                      <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4">
                        <div>
                          <span className="text-sm text-muted-foreground">Price:</span>
                          <p className="font-semibold">${video.price?.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Category:</span>
                          <p className="capitalize">{video.category || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Duration:</span>
                          <p>{video.duration || "30-60"} seconds</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Status:</span>
                          <p className={video.available ? "text-green-500" : "text-red-500"}>
                            {video.available ? "Available" : "Unavailable"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col gap-2 mt-4 md:mt-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push(`/admin/videos/edit/${video.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push(`/admin/videos/view/${video.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDeleteClick(video)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {videoToDelete?.playerName}'s video from the system. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
