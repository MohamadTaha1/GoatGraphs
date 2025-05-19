"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Video, MessageSquare, Plus, Clock, CheckCircle, X, Play, Info, ArrowDown } from "lucide-react"
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

  // Refs for scrolling
  const howItWorksRef = useRef<HTMLDivElement>(null)
  const requestVideoRef = useRef<HTMLDivElement>(null)

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" })
    }
  }

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
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => scrollToSection(howItWorksRef)} className="flex items-center">
            <Info className="mr-2 h-4 w-4" /> How It Works
          </Button>
          <Button onClick={() => scrollToSection(requestVideoRef)}>
            <Plus className="mr-2 h-4 w-4" /> Request Video
          </Button>
        </div>
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
                <Button onClick={() => scrollToSection(requestVideoRef)}>
                  <Plus className="mr-2 h-4 w-4" /> Request a Personalized Video
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
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/customer/videos/${video.id}`)
                        }}
                      >
                        Watch Video
                      </Button>
                    </div>
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
                <Button onClick={() => scrollToSection(requestVideoRef)}>
                  <Plus className="mr-2 h-4 w-4" /> Request Your First Video
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

      {/* How It Works Section */}
      <div ref={howItWorksRef} className="mt-16 mb-12 scroll-mt-24">
        <h2 className="text-3xl font-bold mb-8 flex items-center">
          <Info className="mr-3 h-6 w-6" /> How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Request</h3>
              <p className="text-muted-foreground">
                Fill out our simple form with details about who the video is for, the occasion, and your personalized
                message.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Production</h3>
              <p className="text-muted-foreground">
                Our team works with the player to record your personalized video message based on your request.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Delivery</h3>
              <p className="text-muted-foreground">
                Once completed, you'll receive a notification. Your video will be available in your account to watch,
                download, and share.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center mt-8">
          <Button onClick={() => scrollToSection(requestVideoRef)} className="flex items-center">
            <ArrowDown className="mr-2 h-4 w-4" /> Request Your Video Now
          </Button>
        </div>
      </div>

      {/* Request a Video Section */}
      <div ref={requestVideoRef} className="mt-16 scroll-mt-24">
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Plus className="mr-3 h-5 w-5" /> Request a Personalized Video
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6">
              Ready to get a personalized video message from your favorite player? Click below to start your request.
            </p>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/customer/videos/request">
                <Plus className="mr-2 h-4 w-4" /> Start Your Video Request
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
