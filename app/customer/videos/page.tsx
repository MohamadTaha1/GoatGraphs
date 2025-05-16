"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Video, MessageSquare, Plus, Clock, CheckCircle, X, Play } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useVideos, useUserVideoRequests } from "@/hooks/use-videos"
import { useAuth } from "@/hooks/use-auth"

export default function CustomerVideosPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { videos, loading: loadingVideos } = useVideos()
  const { requests, loading: loadingRequests } = useUserVideoRequests(user?.uid || null)
  const [activeTab, setActiveTab] = useState("gallery")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-500/20 text-blue-500"
      case "accepted":
        return "bg-orange-500/20 text-orange-500"
      case "completed":
        return "bg-green-500/20 text-green-500"
      case "rejected":
        return "bg-red-500/20 text-red-500"
      default:
        return "bg-gray-500/20 text-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "accepted":
        return <Play className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <X className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Your request is being reviewed"
      case "accepted":
        return "Your request is in production"
      case "completed":
        return "Your video is ready to view"
      case "rejected":
        return "Your request could not be fulfilled"
      default:
        return "Unknown status"
    }
  }

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

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Player Videos</h1>
        <Button asChild>
          <Link href="/customer/videos/request">
            <Plus className="mr-2 h-4 w-4" /> Request Personalized Video
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="gallery" className="mb-8">
        <TabsList>
          <TabsTrigger value="gallery" className="flex items-center">
            <Video className="mr-2 h-4 w-4" /> Video Gallery
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" /> My Requests
            {requests.length > 0 && (
              <Badge variant="outline" className="ml-2 bg-primary/20">
                {requests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery">
          {loadingVideos ? (
            <div className="flex justify-center items-center h-[40vh]">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading videos...</span>
            </div>
          ) : videos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Video className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Videos Available</h3>
                <p className="text-muted-foreground mb-6">There are no videos available in our gallery yet.</p>
                <Button asChild>
                  <Link href="/customer/videos/request">
                    <Plus className="mr-2 h-4 w-4" /> Request a Personalized Video
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <div
                    className="relative aspect-video cursor-pointer"
                    onClick={() => router.push(`/customer/videos/${video.id}`)}
                  >
                    <Image
                      src={video.thumbnailUrl || "/placeholder.svg?height=200&width=400&query=video+thumbnail"}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <div className="w-0 h-0 border-t-8 border-t-transparent border-l-16 border-l-white border-b-8 border-b-transparent ml-1"></div>
                      </div>
                    </div>
                    {video.featured && (
                      <Badge className="absolute top-2 right-2 bg-gold-gradient text-black">Featured</Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-1">{video.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">Player: {video.player}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          {!user ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
                <p className="text-muted-foreground mb-6">Please sign in to view your video requests.</p>
                <Button asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              </CardContent>
            </Card>
          ) : loadingRequests ? (
            <div className="flex justify-center items-center h-[40vh]">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading your requests...</span>
            </div>
          ) : requests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Video Requests</h3>
                <p className="text-muted-foreground mb-6">You haven't requested any personalized videos yet.</p>
                <Button asChild>
                  <Link href="/customer/videos/request">
                    <Plus className="mr-2 h-4 w-4" /> Request Your First Video
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">Video from {request.player}</CardTitle>
                      <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                        {getStatusIcon(request.status)}
                        <span>{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">For</p>
                        <p className="font-medium">{request.recipientName}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Occasion</p>
                        <p>{request.occasion}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Requested On</p>
                        <p>{formatDate(request.createdAt)}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p>{getStatusText(request.status)}</p>
                      </div>

                      {request.status === "completed" && request.videoUrl && (
                        <Button asChild className="w-full">
                          <Link href={`/customer/videos/view/${request.id}`}>Watch Video</Link>
                        </Button>
                      )}

                      {request.status === "pending" && (
                        <div className="text-sm text-muted-foreground italic">
                          We'll notify you when your request is accepted.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
