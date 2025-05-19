"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, ArrowLeft, Download, Share2, ThumbsUp } from "lucide-react"
import { getVideo } from "@/hooks/use-videos"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

export default function ViewVideoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [video, setVideo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchVideo() {
      try {
        setLoading(true)
        const data = await getVideo(params.id)

        if (!data) {
          throw new Error("Video not found")
        }

        setVideo(data)
      } catch (err) {
        console.error("Error fetching video:", err)
        setError(err instanceof Error ? err : new Error("Failed to load video"))
      } finally {
        setLoading(false)
      }
    }

    fetchVideo()
  }, [params.id])

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: video?.title || "Personalized video",
          text: `Check out this video featuring ${video?.player || "a football star"}!`,
          url: window.location.href,
        })
        .catch((error) => {
          console.error("Error sharing:", error)
          toast({
            title: "Sharing failed",
            description: "Could not share this video. Try copying the link manually.",
            variant: "destructive",
          })
        })
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Video link copied to clipboard. You can now share it manually.",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading video...</span>
      </div>
    )
  }

  if (error || !video) {
    return (
      <div className="container py-8">
        <Button variant="outline" onClick={() => router.push("/customer/videos")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Videos
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error?.message || "Failed to load the video. Please try again."}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Button variant="outline" onClick={() => router.push("/customer/videos")} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Videos
      </Button>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              {video.featured && <Badge className="bg-gold-gradient text-black">Featured</Badge>}
              <span className="text-sm text-muted-foreground">Player: {video.player}</span>
              {video.duration && <span className="text-sm text-muted-foreground">Duration: {video.duration}</span>}
            </div>
          </div>

          <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-6">
            <video controls className="w-full h-full" poster={video.thumbnailUrl || "/video-loading-screen.png"}>
              <source src={video.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{video.description}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            {video.videoUrl && (
              <Button variant="outline" asChild>
                <a href={video.videoUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" /> Download
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                toast({
                  title: "Thanks for your feedback!",
                  description: "We appreciate you letting us know you enjoyed this video.",
                })
              }}
            >
              <ThumbsUp className="mr-2 h-4 w-4" /> Like
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
