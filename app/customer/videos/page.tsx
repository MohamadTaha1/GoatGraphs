"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useVideos } from "@/hooks/use-videos"
import { Play, Clock, Calendar, User, MessageSquare, Loader2, Info, Send, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function VideosPage() {
  const router = useRouter()
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false)
  const [isExamplePlaying, setIsExamplePlaying] = useState(false)
  const [occasionType, setOccasionType] = useState("birthday")
  const { user } = useAuth()

  // Use the hook to fetch videos from Firestore
  const { videos, loading, error, firestoreAvailable } = useVideos({ onlyAvailable: true })

  // Example video data
  const exampleVideo = {
    id: "example-1",
    playerName: "Lionel Messi",
    title: "Birthday Greeting for Alex",
    description: "A personalized birthday message from Lionel Messi to a fan named Alex.",
    thumbnailUrl: "/images/video-thumbnails/messi-greeting.png",
    duration: "45",
    price: 499.99,
  }

  // Transform videos data to player format
  const availablePlayers = videos.map((video) => ({
    id: video.id,
    playerName: video.playerName || "Football Star",
    position: video.position || "Player",
    team: video.team || "Professional Team",
    price: video.price || 399.99,
    thumbnailUrl:
      video.thumbnailUrl ||
      `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(video.playerName || "Football Player")}`,
    availability: video.availability || "7-14 days",
    description:
      video.description || `Request a personalized video message from ${video.playerName || "this football star"}.`,
    category: video.category || "greeting",
  }))

  const handleRequestVideo = (player) => {
    if (!user) {
      // Redirect to login page with return URL
      const returnUrl = encodeURIComponent(
        `/customer/videos/request?player=${encodeURIComponent(player.playerName)}&id=${player.id}`,
      )
      router.push(`/login?returnUrl=${returnUrl}&action=requestVideo`)
      return
    }

    router.push(`/customer/videos/request?player=${encodeURIComponent(player.playerName)}&id=${player.id}`)
  }

  const handleOpenPlayerDetails = (player) => {
    setSelectedPlayer(player)
    setIsPlayerDialogOpen(true)
  }

  const handleRequestSubmit = (e) => {
    e.preventDefault()

    if (!user) {
      // Redirect to login page with return URL
      const returnUrl = encodeURIComponent(`/customer/videos/request`)
      router.push(`/login?returnUrl=${returnUrl}&action=requestVideo`)
      return
    }

    router.push(`/customer/videos/request`)
  }

  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-display font-bold mb-4 bg-gold-gradient bg-clip-text text-transparent">
          Personalized Video Messages
        </h1>
        <p className="text-lg text-offwhite/80 max-w-2xl mx-auto">
          Request a personalized video message from your favorite football stars. Perfect for birthdays, special
          occasions, or just to surprise a fan.
        </p>
      </div>

      {firestoreAvailable === false && (
        <Alert variant="warning" className="bg-amber-500/10 border-amber-500/50 mb-8">
          <Info className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-500">Offline Mode</AlertTitle>
          <AlertDescription>You are viewing demo data in offline mode. Firestore is not available.</AlertDescription>
        </Alert>
      )}

      {/* Example Video Section */}
      <div className="mb-16 bg-charcoal border border-gold/30 rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="relative aspect-video lg:aspect-auto">
            {isExamplePlaying ? (
              <div className="absolute inset-0 bg-black flex items-center justify-center">
                <video
                  autoPlay
                  controls
                  className="w-full h-full"
                  poster={exampleVideo.thumbnailUrl}
                  onEnded={() => setIsExamplePlaying(false)}
                >
                  <source src="/videos/example-greeting.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <>
                <Image
                  src={exampleVideo.thumbnailUrl || "/placeholder.svg"}
                  alt="Example Video"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button
                    onClick={() => setIsExamplePlaying(true)}
                    className="bg-gold rounded-full p-5 hover:bg-gold-deep transition-colors"
                  >
                    <Play className="h-10 w-10 text-black" />
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="p-8 flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-gold mb-2">See What You Can Get</h2>
              <p className="text-offwhite/80 mb-4">
                Watch this example of a personalized video message from {exampleVideo.playerName}. Our football stars
                create authentic, personalized videos just for you or your loved ones.
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-sm text-offwhite/60">
                  <Clock className="h-4 w-4 mr-1 text-gold" />
                  <span>{exampleVideo.duration} seconds</span>
                </div>
                <div className="flex items-center text-sm text-offwhite/60">
                  <User className="h-4 w-4 mr-1 text-gold" />
                  <span>Personalized content</span>
                </div>
                <div className="flex items-center text-sm text-offwhite/60">
                  <Calendar className="h-4 w-4 mr-1 text-gold" />
                  <span>Delivered within days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-display font-bold text-gold mb-8 text-center">How It Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-charcoal/50 p-6 rounded-lg border border-gold/20 relative">
            <div className="absolute -top-4 -left-4 bg-gold rounded-full w-8 h-8 flex items-center justify-center text-black font-bold">
              1
            </div>
            <div className="flex items-center mb-4">
              <div className="bg-gold/10 rounded-full p-3">
                <User className="h-6 w-6 text-gold" />
              </div>
            </div>
            <h3 className="text-xl font-display font-bold text-gold mb-2">Choose a Player</h3>
            <p className="text-offwhite/80">
              Browse our roster of available football stars and select your favorite player. Each player has their own
              pricing and availability window.
            </p>
          </div>

          <div className="bg-charcoal/50 p-6 rounded-lg border border-gold/20 relative">
            <div className="absolute -top-4 -left-4 bg-gold rounded-full w-8 h-8 flex items-center justify-center text-black font-bold">
              2
            </div>
            <div className="flex items-center mb-4">
              <div className="bg-gold/10 rounded-full p-3">
                <MessageSquare className="h-6 w-6 text-gold" />
              </div>
            </div>
            <h3 className="text-xl font-display font-bold text-gold mb-2">Submit Your Request</h3>
            <p className="text-offwhite/80">
              Fill out our request form with details about the recipient and the occasion. Be specific about what you'd
              like the player to say in the video.
            </p>
          </div>

          <div className="bg-charcoal/50 p-6 rounded-lg border border-gold/20 relative">
            <div className="absolute -top-4 -left-4 bg-gold rounded-full w-8 h-8 flex items-center justify-center text-black font-bold">
              3
            </div>
            <div className="flex items-center mb-4">
              <div className="bg-gold/10 rounded-full p-3">
                <Clock className="h-6 w-6 text-gold" />
              </div>
            </div>
            <h3 className="text-xl font-display font-bold text-gold mb-2">Processing Time</h3>
            <p className="text-offwhite/80">
              Once your request is approved, the player will record your video message. This typically takes 5-14 days
              depending on the player's schedule.
            </p>
          </div>

          <div className="bg-charcoal/50 p-6 rounded-lg border border-gold/20 relative">
            <div className="absolute -top-4 -left-4 bg-gold rounded-full w-8 h-8 flex items-center justify-center text-black font-bold">
              4
            </div>
            <div className="flex items-center mb-4">
              <div className="bg-gold/10 rounded-full p-3">
                <Play className="h-6 w-6 text-gold" />
              </div>
            </div>
            <h3 className="text-xl font-display font-bold text-gold mb-2">Receive Your Video</h3>
            <p className="text-offwhite/80">
              Your personalized video will be delivered to your account. You can download it, share it, and keep it
              forever as a special memory.
            </p>
          </div>
        </div>

        <div className="bg-gold/10 p-6 rounded-lg mt-8">
          <div className="flex items-start">
            <div className="bg-gold/20 rounded-full p-2 mr-4 mt-1">
              <Info className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-gold mb-2">Satisfaction Guarantee</h3>
              <p className="text-offwhite/80">
                If you're not completely satisfied with your video, we'll work with you to make it right. Our goal is to
                create a memorable experience that exceeds your expectations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Request Video Form Section */}
      <div className="mb-16" id="request-form">
        <h2 className="text-3xl font-display font-bold text-gold mb-8 text-center">Request a Video</h2>

        <div className="bg-charcoal border border-gold/30 rounded-lg p-8">
          <form onSubmit={handleRequestSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="recipient-name" className="text-gold">
                    Recipient's Name
                  </Label>
                  <Input
                    id="recipient-name"
                    placeholder="Who is this video for?"
                    className="bg-charcoal/50 border-gold/30 focus:border-gold"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="occasion" className="text-gold">
                    Occasion
                  </Label>
                  <RadioGroup
                    defaultValue="birthday"
                    className="grid grid-cols-2 gap-4 mt-2"
                    onValueChange={setOccasionType}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="birthday" id="birthday" className="text-gold" />
                      <Label htmlFor="birthday">Birthday</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="congratulations" id="congratulations" className="text-gold" />
                      <Label htmlFor="congratulations">Congratulations</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="motivation" id="motivation" className="text-gold" />
                      <Label htmlFor="motivation">Motivation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" className="text-gold" />
                      <Label htmlFor="other">Other</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="delivery-date" className="text-gold">
                    Desired Delivery Date
                  </Label>
                  <Input
                    id="delivery-date"
                    type="date"
                    className="bg-charcoal/50 border-gold/30 focus:border-gold"
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                  <p className="text-xs text-offwhite/60 mt-1">Please allow 7-14 days for delivery</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="message-details" className="text-gold">
                    Message Details
                  </Label>
                  <Textarea
                    id="message-details"
                    placeholder="What would you like the player to say? Include any specific details you want mentioned."
                    className="bg-charcoal/50 border-gold/30 focus:border-gold h-32"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="preferred-player" className="text-gold">
                    Preferred Player (Optional)
                  </Label>
                  <Input
                    id="preferred-player"
                    placeholder="Do you have a specific player in mind?"
                    className="bg-charcoal/50 border-gold/30 focus:border-gold"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button type="submit" className="bg-gold-gradient hover:bg-gold-shine text-black px-8 py-6 text-lg">
                <Send className="mr-2 h-5 w-5" />
                Submit Video Request
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Available Players Section */}
      <div id="available-players" className="scroll-mt-8">
        <h2 className="text-3xl font-display font-bold text-gold mb-8 text-center">Available Players</h2>

        {availablePlayers.length > 0 && (
          <div className="flex justify-end mb-4">
            <p className="text-offwhite/60">
              Starting from ${Math.min(...availablePlayers.map((p) => p.price))?.toFixed(2)}
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-gold mr-4" />
            <p className="text-offwhite text-lg">Loading players...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <Alert variant="destructive" className="max-w-md mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Failed to load players. Please try again later.</AlertDescription>
            </Alert>
            <Button onClick={() => window.location.reload()} className="bg-gold text-black hover:bg-gold/80 mt-4">
              Retry
            </Button>
          </div>
        ) : availablePlayers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-offwhite/80 mb-4">No players are currently available for video requests.</p>
            <Button
              onClick={() => document.getElementById("request-form")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-gold-gradient hover:bg-gold-shine text-black"
            >
              Submit a Custom Request
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availablePlayers.map((player) => (
              <Card key={player.id} className="bg-charcoal border-gold/30 hover:border-gold/60 transition-all">
                <div className="flex p-4 items-center">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
                    <Image
                      src={player.thumbnailUrl || "/placeholder.svg"}
                      alt={player.playerName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-gold">{player.playerName}</h3>
                    <p className="text-offwhite/60 text-sm">
                      {player.position} • {player.team}
                    </p>
                  </div>
                </div>
                <CardContent className="pt-0 pb-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-2xl font-display font-bold text-gold">${player.price?.toFixed(2)}</div>
                    <div className="text-sm text-offwhite/60">Delivery: {player.availability}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleOpenPlayerDetails(player)}
                      variant="outline"
                      className="flex-1 border-gold/50 text-gold hover:bg-gold/10"
                    >
                      Details
                    </Button>
                    <Button
                      onClick={() => handleRequestVideo(player)}
                      className="flex-1 bg-gold-gradient hover:bg-gold-shine text-black"
                    >
                      Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Player Details Dialog */}
      <Dialog open={isPlayerDialogOpen} onOpenChange={setIsPlayerDialogOpen}>
        <DialogContent className="max-w-3xl">
          {selectedPlayer && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-gold">{selectedPlayer.playerName}</DialogTitle>
                <DialogDescription>
                  {selectedPlayer.position} • {selectedPlayer.team}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={selectedPlayer.thumbnailUrl || "/placeholder.svg"}
                    alt={selectedPlayer.playerName}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-display font-bold text-gold mb-2">About {selectedPlayer.playerName}</h3>
                    <p className="text-offwhite/80">
                      {selectedPlayer.description ||
                        `Request a personalized video message from ${selectedPlayer.playerName}, one of the world's top football players.`}
                    </p>
                  </div>

                  <div className="bg-charcoal/50 p-4 rounded-lg border border-gold/20">
                    <h3 className="text-lg font-display font-bold text-gold mb-2">Video Details</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span className="text-offwhite/60">Price:</span>
                        <span className="text-gold font-bold">${selectedPlayer.price?.toFixed(2)}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-offwhite/60">Delivery Time:</span>
                        <span className="text-offwhite">{selectedPlayer.availability}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-offwhite/60">Video Length:</span>
                        <span className="text-offwhite">30-60 seconds</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-offwhite/60">Language:</span>
                        <span className="text-offwhite">English</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={() => {
                        setIsPlayerDialogOpen(false)
                        handleRequestVideo(selectedPlayer)
                      }}
                      className="w-full bg-gold-gradient hover:bg-gold-shine text-black"
                    >
                      Request a Video from {selectedPlayer.playerName}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
