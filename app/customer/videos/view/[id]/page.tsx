"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, ArrowLeft, Download, Share2 } from "lucide-react"
import { getVideoRequest } from "@/hooks/use-videos"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

export default function ViewVideoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [request, setRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchRequest() {
      try {
        setLoading(true)
        const data = await getVideoRequest(params.id)

        if (!data) {
          throw new Error("Video not found")
        }

        // Check if the video belongs to the current user
        if (data.userId !== user?.uid) {
          throw new Error("You don't have permission to view this video")
        }

        // Check if the video is completed
        if (data.status !== "completed" || !data.videoUrl) {
          throw new Error("This video is not available for viewing yet")
        }

        setRequest(data)
      } catch (err) {
        console.error("Error fetching video:", err)
        setError(err instanceof Error ? err : new Error("Failed to load video"))
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchRequest()
    }
  }, [params.id, user])

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Personalized video from ${request.player}`,
          text: `Check out my personalized video from ${request.player}!`,
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

  if (!user) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>Please sign in to view this video.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/login")}>Sign In</Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading video...</span>
      </div>
    )
  }

  if (error || !request) {
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
            <h1 className="text-2xl font-bold mb-2">Your Personalized Video from {request.player}</h1>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/20 text-green-500">Completed</Badge>
              <span className="text-sm text-muted-foreground">For: {request.recipientName}</span>
              <span className="text-sm text-muted-foreground">Occasion: {request.occasion}</span>
            </div>
          </div>

          <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-6">
            <video controls className="w-full h-full" poster="/video-loading-screen.png">
              <source src={request.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            <Button variant="outline" asChild>
              <a href={request.videoUrl} download target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" /> Download
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
