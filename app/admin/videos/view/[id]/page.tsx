"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Edit, Play } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import Image from "next/image"

interface VideoData {
  id: string
  title: string
  description: string
  player: string
  playerName?: string
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

export default function ViewVideoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [video, setVideo] = useState<VideoData | null>(null)

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true)
        const videoDoc = await getDoc(doc(db, "videos", params.id))

        if (videoDoc.exists()) {
          const videoData = { id: videoDoc.id, ...videoDoc.data() } as VideoData

          // Handle backward compatibility with different field names
          if (!videoData.player && videoData.playerName) {
            videoData.player = videoData.playerName
          }

          setVideo(videoData)
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
        setLoading(false)
      }
    }

    fetchVideo()
  }, [params.id, router, toast])

  // Format date from Firestore timestamp
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"

    try {
      // Handle Firestore Timestamp
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString()
      }

      // Handle Date object or string
      return new Date(timestamp).toLocaleDateString()
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading video data...</span>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-xl font-semibold mb-2">Video Not Found</h3>
            <p className="text-muted-foreground mb-6">The requested video could not be found.</p>
            <Button asChild>
              <Link href="/admin/videos">Back to Videos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Videos
        </Button>
        <Button asChild>
          <Link href={`/admin/videos/edit/${params.id}`}>
            <Edit className="mr-2 h-4 w-4" /> Edit Video
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Video Preview</span>
                {video.featured && <Badge className="bg-gold-gradient text-black">Featured</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video w-full overflow-hidden rounded-md mb-4">
                {video.videoUrl ? (
                  <video
                    src={video.videoUrl}
                    controls
                    className="w-full h-full"
                    poster={video.thumbnailUrl}
                    onError={(e) => {
                      console.error("Video error:", e)
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-gray-900">
                    <Play className="h-16 w-16 text-gray-500 mb-2" />
                    <p className="text-gray-500">No video available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Video Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{video.title}</h3>
                <p className="text-sm text-muted-foreground">Player: {video.player}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">{video.description || "No description provided."}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Price</h4>
                  <p className="text-sm">${video.price?.toFixed(2) || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Duration</h4>
                  <p className="text-sm">{video.duration || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Category</h4>
                  <p className="text-sm capitalize">{video.category || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Position</h4>
                  <p className="text-sm">{video.position || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Team</h4>
                  <p className="text-sm">{video.team || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Availability</h4>
                  <p className="text-sm">{video.availability || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Status</h4>
                  <Badge variant={video.available ? "default" : "secondary"}>
                    {video.available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Featured</h4>
                  <Badge variant={video.featured ? "default" : "secondary"}>{video.featured ? "Yes" : "No"}</Badge>
                </div>
              </div>

              <div className="pt-2 border-t">
                <h4 className="text-sm font-medium mb-1">Thumbnail</h4>
                <div className="relative aspect-video w-full overflow-hidden rounded-md">
                  <Image
                    src={video.thumbnailUrl || "/placeholder.svg?height=200&width=400&query=video+thumbnail"}
                    alt={video.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <h4 className="text-sm font-medium mb-1">Created</h4>
                  <p className="text-sm">{formatDate(video.createdAt)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Last Updated</h4>
                  <p className="text-sm">{formatDate(video.updatedAt) || "Never"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
