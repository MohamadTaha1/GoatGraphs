"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useVideos } from "@/hooks/use-videos"
import { Play, Clock, Calendar, User, MessageSquare, Loader2 } from "lucide-react"

export default function VideosPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [previewVideo, setPreviewVideo] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Use the hook to fetch videos from Firestore
  const { videos, loading, error } = useVideos({ onlyAvailable: true })

  // Filter videos by category if a category is selected
  const filteredVideos =
    selectedCategory === "all" ? videos : videos.filter((video) => video.category === selectedCategory)

  // If no videos are available from Firestore, use these fallback videos
  const fallbackVideos = [
    {
      id: "1",
      playerName: "Lionel Messi",
      title: "Personal Greeting",
      description: "Get a personalized greeting from the football legend himself.",
      price: 499.99,
      duration: "30-60",
      category: "greeting",
      thumbnailUrl: "/images/video-thumbnails/messi-greeting.png",
      videoUrl: "https://example.com/videos/messi-sample.mp4",
    },
    {
      id: "2",
      playerName: "Cristiano Ronaldo",
      title: "Birthday Message",
      description: "Make someone's birthday special with a message from CR7.",
      price: 599.99,
      duration: "30-60",
      category: "birthday",
      thumbnailUrl: "/images/video-thumbnails/ronaldo-birthday.png",
      videoUrl: "https://example.com/videos/ronaldo-sample.mp4",
    },
    {
      id: "3",
      playerName: "Kylian Mbappé",
      title: "Congratulations Video",
      description: "Celebrate achievements with a special message from Mbappé.",
      price: 399.99,
      duration: "30-45",
      category: "congratulations",
      thumbnailUrl: "/images/video-thumbnails/mbappe-congrats.png",
      videoUrl: "https://example.com/videos/mbappe-sample.mp4",
    },
    {
      id: "4",
      playerName: "Erling Haaland",
      title: "Motivational Message",
      description: "Get motivated with a powerful message from the goal machine.",
      price: 349.99,
      duration: "30-45",
      category: "motivation",
      thumbnailUrl: "/images/video-thumbnails/haaland-greeting.png",
      videoUrl: "https://example.com/videos/haaland-sample.mp4",
    },
    {
      id: "5",
      playerName: "Neymar Jr",
      title: "Special Occasion",
      description: "Make any occasion special with a message from Neymar.",
      price: 449.99,
      duration: "30-60",
      category: "other",
      thumbnailUrl: "/images/video-thumbnails/neymar-message.png",
      videoUrl: "https://example.com/videos/neymar-sample.mp4",
    },
    {
      id: "6",
      playerName: "Kevin De Bruyne",
      title: "Personal Message",
      description: "Get a personalized message from the midfield maestro.",
      price: 349.99,
      duration: "30-45",
      category: "greeting",
      thumbnailUrl: "/images/video-thumbnails/de-bruyne-message.png",
      videoUrl: "https://example.com/videos/de-bruyne-sample.mp4",
    },
  ]

  // Use fallback videos if no videos are available from Firestore
  const displayVideos =
    videos.length > 0
      ? filteredVideos
      : selectedCategory === "all"
        ? fallbackVideos
        : fallbackVideos.filter((v) => v.category === selectedCategory)

  const handleRequestVideo = (video) => {
    router.push(`/customer/videos/request?player=${encodeURIComponent(video.playerName)}&id=${video.id}`)
  }

  const handlePreviewVideo = (video) => {
    setPreviewVideo(video)
    setIsPreviewOpen(true)
  }

  return (
    <div className="container py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold mb-4 bg-gold-gradient bg-clip-text text-transparent">
          Personalized Video Messages
        </h1>
        <p className="text-lg text-offwhite/80 max-w-2xl mx-auto">
          Request a personalized video message from your favorite football stars. Perfect for birthdays, special
          occasions, or just to surprise a fan.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full mb-8" onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full bg-charcoal border border-gold/20">
          <TabsTrigger
            value="all"
            className="text-gold data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="greeting"
            className="text-gold data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
          >
            Greetings
          </TabsTrigger>
          <TabsTrigger
            value="birthday"
            className="text-gold data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
          >
            Birthday
          </TabsTrigger>
          <TabsTrigger
            value="congratulations"
            className="text-gold data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
          >
            Congrats
          </TabsTrigger>
          <TabsTrigger
            value="motivation"
            className="text-gold data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
          >
            Motivation
          </TabsTrigger>
          <TabsTrigger
            value="other"
            className="text-gold data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
          >
            Other
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-gold mr-4" />
          <p className="text-offwhite text-lg">Loading videos...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">Failed to load videos. Please try again later.</p>
          <Button onClick={() => window.location.reload()} className="bg-gold text-black hover:bg-gold/80">
            Retry
          </Button>
        </div>
      ) : displayVideos.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-offwhite/80 mb-4">No videos available in this category.</p>
          <Button onClick={() => setSelectedCategory("all")} className="bg-gold text-black hover:bg-gold/80">
            View All Videos
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayVideos.map((video) => (
            <Card
              key={video.id}
              className="overflow-hidden bg-charcoal border-gold/30 hover:border-gold/60 transition-all"
            >
              <div className="relative aspect-video">
                <Image
                  src={video.thumbnailUrl || "/placeholder.svg"}
                  alt={`${video.playerName} - ${video.title}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white">{video.playerName}</h3>
                    <p className="text-gold">{video.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePreviewVideo(video)}
                  className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
                >
                  <div className="bg-gold rounded-full p-3">
                    <Play className="h-8 w-8 text-black" />
                  </div>
                </button>
              </div>
              <CardContent className="p-6">
                <p className="text-offwhite/80 mb-4">{video.description}</p>
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center text-sm text-offwhite/60">
                    <Clock className="h-4 w-4 mr-1 text-gold" />
                    <span>{video.duration} seconds</span>
                  </div>
                  <div className="flex items-center text-sm text-offwhite/60">
                    <Calendar className="h-4 w-4 mr-1 text-gold" />
                    <span>7-10 days delivery</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-display font-bold text-gold">${video.price?.toFixed(2)}</div>
                  <Button
                    onClick={() => handleRequestVideo(video)}
                    className="bg-gold-gradient hover:bg-gold-shine text-black"
                  >
                    Request Video
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-16 bg-charcoal border border-gold/30 rounded-lg p-8">
        <h2 className="text-2xl font-display font-bold mb-4 text-gold">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="bg-gold/10 rounded-full p-4 mb-4">
              <User className="h-8 w-8 text-gold" />
            </div>
            <h3 className="text-xl font-display font-bold mb-2 text-offwhite">1. Choose a Player</h3>
            <p className="text-offwhite/70">Select your favorite football star from our roster of available players.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-gold/10 rounded-full p-4 mb-4">
              <MessageSquare className="h-8 w-8 text-gold" />
            </div>
            <h3 className="text-xl font-display font-bold mb-2 text-offwhite">2. Submit Your Request</h3>
            <p className="text-offwhite/70">
              Tell us about the occasion and provide details for a personalized message.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-gold/10 rounded-full p-4 mb-4">
              <Play className="h-8 w-8 text-gold" />
            </div>
            <h3 className="text-xl font-display font-bold mb-2 text-offwhite">3. Receive Your Video</h3>
            <p className="text-offwhite/70">Get your personalized video message delivered directly to your account.</p>
          </div>
        </div>
      </div>

      {/* Video Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {previewVideo?.playerName} - {previewVideo?.title}
            </DialogTitle>
            <DialogDescription>Sample video preview</DialogDescription>
          </DialogHeader>
          <div className="aspect-video bg-black rounded-md overflow-hidden">
            {previewVideo?.videoUrl ? (
              <video src={previewVideo.videoUrl} controls className="w-full h-full" poster={previewVideo.thumbnailUrl}>
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-offwhite/70">Video preview not available</p>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="text-2xl font-display font-bold text-gold">${previewVideo?.price?.toFixed(2)}</div>
            <Button
              onClick={() => {
                setIsPreviewOpen(false)
                handleRequestVideo(previewVideo)
              }}
              className="bg-gold-gradient hover:bg-gold-shine text-black"
            >
              Request Video
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
