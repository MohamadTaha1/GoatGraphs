"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Video, Play, Clock, Calendar, Loader2, Search, Star, Filter } from "lucide-react"
import { useVideoPlayers, type VideoPlayer } from "@/hooks/use-video-players"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { collection, addDoc, Timestamp } from "firebase/firestore"

export default function VideosPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [sportFilter, setSportFilter] = useState("all")
  const [selectedPlayer, setSelectedPlayer] = useState<VideoPlayer | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { players, loading, error } = useVideoPlayers()

  const [formData, setFormData] = useState({
    occasion: "",
    recipientName: "",
    message: "",
    deliveryDate: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Filter players based on search term and sport filter
  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.team.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSport = sportFilter === "all" || player.sport === sportFilter

    return matchesSearch && matchesSport
  })

  const handlePlayerSelect = (player: VideoPlayer) => {
    setSelectedPlayer(player)
    // Scroll to request form
    document.getElementById("request-form")?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedPlayer) {
      toast({
        title: "No player selected",
        description: "Please select a player for your video request.",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to request a video.",
      })
      router.push("/login")
      return
    }

    setIsSubmitting(true)

    try {
      // Create a video request in Firestore
      const db = getFirestoreInstance()
      if (!db) {
        throw new Error("Firestore instance is null")
      }

      const videoRequest = {
        playerId: selectedPlayer.id,
        playerName: selectedPlayer.name,
        playerImage: selectedPlayer.imageUrl,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || "Customer",
        occasion: formData.occasion,
        recipientName: formData.recipientName,
        message: formData.message,
        requestedDeliveryDate: formData.deliveryDate,
        price: selectedPlayer.price,
        status: "pending_payment", // Initial status before payment
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      const docRef = await addDoc(collection(db, "videoRequests"), videoRequest)

      // Redirect to checkout with the video request ID
      router.push(`/customer/videos/checkout/${docRef.id}`)
    } catch (error) {
      console.error("Error creating video request:", error)
      toast({
        title: "Request failed",
        description: "There was a problem submitting your request. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const testimonials = [
    {
      id: 1,
      name: "Sarah J.",
      message:
        "I ordered a birthday message from Messi for my son and he was absolutely thrilled! The video was personal and heartfelt. Worth every penny!",
      player: "Lionel Messi",
      rating: 5,
    },
    {
      id: 2,
      name: "Michael T.",
      message:
        "Got a congratulatory message from Ronaldo for my brother's graduation. The quality was excellent and it was delivered on time. Highly recommend!",
      player: "Cristiano Ronaldo",
      rating: 5,
    },
    {
      id: 3,
      name: "Ahmed K.",
      message:
        "Mbappé's video message made my nephew's day! He was so excited to receive a personal message from his favorite player. The process was smooth and easy.",
      player: "Kylian Mbappé",
      rating: 5,
    },
  ]

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-display font-bold mb-8 bg-gold-gradient bg-clip-text text-transparent">
        Personalized Video Greetings
      </h1>

      <div className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-display font-bold mb-4 text-gold">Request a Personal Video Message</h2>
            <p className="text-offwhite/80 mb-6 font-body">
              Get a personalized video greeting from your favorite sports star. Perfect for birthdays, celebrations, or
              just to surprise a fan. Our players will record a custom message just for you or your loved ones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => document.getElementById("players-section")?.scrollIntoView({ behavior: "smooth" })}
                className="bg-gold-soft hover:bg-gold-deep text-jetblack font-body"
              >
                Browse Players
              </Button>
              <Button
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                variant="outline"
                className="border-gold text-gold hover:bg-gold/10 font-body"
              >
                How It Works
              </Button>
            </div>
          </div>
          <div className="relative h-[300px]">
            <Image
              src="/placeholder.svg?height=300&width=600&text=Video+Greeting+Service"
              alt="Video Greeting Service"
              fill
              className="object-cover rounded-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 rounded-full p-4">
                <Play className="h-12 w-12 text-gold" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="how-it-works" className="mb-16 scroll-mt-20">
        <h2 className="text-2xl font-display font-bold mb-8 text-gold text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-gold/30 bg-charcoal">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                <Video className="h-6 w-6 text-gold" />
              </div>
              <CardTitle className="text-gold">1. Request</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-offwhite/80 font-body">
                Choose your favorite player and fill out the request form with details about the occasion and the
                message you'd like them to deliver.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gold/30 bg-charcoal">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-gold" />
              </div>
              <CardTitle className="text-gold">2. Wait</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-offwhite/80 font-body">
                We'll notify the player of your request. Most videos are recorded and delivered within 7-14 days,
                depending on the player's schedule.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gold/30 bg-charcoal">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                <Play className="h-6 w-6 text-gold" />
              </div>
              <CardTitle className="text-gold">3. Enjoy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-offwhite/80 font-body">
                Receive your personalized video via email. You can download it, share it, and keep it forever as a
                special memory.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div id="players-section" className="mb-16 scroll-mt-20">
        <h2 className="text-2xl font-display font-bold mb-8 text-gold">Available Players</h2>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 border-gold/30"
            />
          </div>
          <div className="w-full md:w-[200px]">
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="border-gold/30">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                <SelectItem value="football">Football</SelectItem>
                <SelectItem value="basketball">Basketball</SelectItem>
                <SelectItem value="cricket">Cricket</SelectItem>
                <SelectItem value="tennis">Tennis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold mr-2" />
            <span>Loading players...</span>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-8 text-center">
            <p className="text-red-500">Failed to load players. Please try again later.</p>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No players found matching your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((player) => (
              <Card key={player.id} className="border-gold/30 bg-charcoal overflow-hidden">
                <div className="relative h-[200px]">
                  <Image
                    src={player.imageUrl || "/placeholder.svg?height=200&width=400&text=" + player.name}
                    alt={player.name}
                    fill
                    className="object-cover"
                  />
                  {player.featured && (
                    <div className="absolute top-2 right-2 bg-gold-500/90 text-black px-2 py-1 rounded-md text-xs font-medium flex items-center">
                      <Star className="h-3 w-3 mr-1" /> Featured
                    </div>
                  )}
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-display font-bold text-xl text-gold">{player.name}</h3>
                  <p className="text-offwhite/60 text-sm font-body capitalize">
                    {player.sport} • {player.team}
                  </p>
                  <p className="text-offwhite/80 font-body mt-2 line-clamp-2">{player.description}</p>
                  <div className="mt-3">
                    <p className="text-gold-500 font-display font-bold text-lg">${player.price.toFixed(2)}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handlePlayerSelect(player)}
                    className="w-full bg-gold-soft hover:bg-gold-deep text-jetblack font-body"
                  >
                    Request Video
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-display font-bold mb-8 text-gold text-center">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-gold/30 bg-charcoal">
              <CardHeader>
                <CardTitle className="text-gold">{testimonial.name}</CardTitle>
                <CardDescription className="text-offwhite/60">Video from {testimonial.player}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-offwhite/80 font-body italic">"{testimonial.message}"</p>
              </CardContent>
              <CardFooter>
                <div className="flex">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i} className="text-gold">
                      ★
                    </span>
                  ))}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div id="request-form" className="scroll-mt-20">
        <h2 className="text-2xl font-display font-bold mb-8 text-gold text-center">Request Your Video</h2>

        <Tabs defaultValue="request" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-black border border-gold/20 mb-8">
            <TabsTrigger
              value="request"
              className="text-gold-500 data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
            >
              Request Form
            </TabsTrigger>
            <TabsTrigger
              value="faq"
              className="text-gold-500 data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
            >
              FAQ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="request">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="selectedPlayer" className="block text-sm font-medium mb-1 font-body">
                      Selected Player
                    </Label>
                    {selectedPlayer ? (
                      <div className="flex items-center gap-3 p-3 border border-gold/30 rounded-md">
                        <div className="h-12 w-12 rounded-md overflow-hidden relative">
                          <Image
                            src={
                              selectedPlayer.imageUrl ||
                              "/placeholder.svg?height=48&width=48&text=" + selectedPlayer.name
                            }
                            alt={selectedPlayer.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-display font-bold">{selectedPlayer.name}</p>
                          <p className="text-xs text-offwhite/60">${selectedPlayer.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 border border-gold/30 rounded-md text-offwhite/60">
                        No player selected. Please choose a player from the list above.
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="occasion" className="block text-sm font-medium mb-1 font-body">
                      Occasion
                    </Label>
                    <Select value={formData.occasion} onValueChange={(value) => handleSelectChange("occasion", value)}>
                      <SelectTrigger className="border-gold/20">
                        <SelectValue placeholder="Select an occasion" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="birthday">Birthday</SelectItem>
                        <SelectItem value="anniversary">Anniversary</SelectItem>
                        <SelectItem value="graduation">Graduation</SelectItem>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="congratulations">Congratulations</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="recipientName" className="block text-sm font-medium mb-1 font-body">
                      Recipient's Name
                    </Label>
                    <Input
                      id="recipientName"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleChange}
                      required
                      className="w-full border-gold/20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="block text-sm font-medium mb-1 font-body">
                      Message Instructions
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full min-h-[150px] border-gold/20"
                      placeholder="Provide details about what you'd like the player to say in the video"
                    />
                  </div>

                  <div>
                    <Label htmlFor="deliveryDate" className="block text-sm font-medium mb-1 font-body">
                      Desired Delivery Date
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="deliveryDate"
                        name="deliveryDate"
                        type="date"
                        value={formData.deliveryDate}
                        onChange={handleChange}
                        required
                        className="w-full border-gold/20"
                        min={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                      />
                      <Calendar className="h-5 w-5 text-gold-500" />
                    </div>
                    <p className="text-xs text-offwhite/60 mt-1">Please allow at least 14 days for video delivery</p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !selectedPlayer}
                    className="w-full bg-gold-gradient hover:bg-gold-shine bg-[length:200%_auto] hover:animate-gold-shimmer text-black font-body"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                      </>
                    ) : (
                      "Continue to Payment"
                    )}
                  </Button>
                </form>
              </div>

              <div>
                <Card className="border-gold/30 bg-charcoal">
                  <CardHeader>
                    <CardTitle className="text-gold">Video Request Details</CardTitle>
                    <CardDescription className="text-offwhite/60">
                      What to expect when you request a video
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-display font-semibold text-offwhite">Video Length</h3>
                      <p className="text-offwhite/80 font-body">
                        Videos are typically 30-60 seconds long, depending on the player and the message.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-display font-semibold text-offwhite">Delivery Time</h3>
                      <p className="text-offwhite/80 font-body">
                        Most videos are delivered within 7-14 days, but this can vary based on the player's schedule and
                        availability.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-display font-semibold text-offwhite">Payment</h3>
                      <p className="text-offwhite/80 font-body">
                        Payment is required upfront. If the player is unable to fulfill your request, you'll receive a
                        full refund.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-display font-semibold text-offwhite">Ownership</h3>
                      <p className="text-offwhite/80 font-body">
                        You'll own the video for personal use, but commercial rights remain with the player and our
                        platform.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="faq">
            <Card className="border-gold/30 bg-charcoal">
              <CardHeader>
                <CardTitle className="text-gold">Frequently Asked Questions</CardTitle>
                <CardDescription className="text-offwhite/60">
                  Common questions about our video greeting service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-display font-semibold text-gold">How much does a video greeting cost?</h3>
                  <p className="text-offwhite/80 font-body">
                    Prices vary depending on the player. Most video greetings range from $299 to $999.
                  </p>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-gold">How long will my video be?</h3>
                  <p className="text-offwhite/80 font-body">
                    Most videos are between 30-60 seconds long, depending on the message requested.
                  </p>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-gold">When will I receive my video?</h3>
                  <p className="text-offwhite/80 font-body">
                    Most videos are delivered within 7-14 days after the request is accepted by the player.
                  </p>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-gold">What if I'm not happy with my video?</h3>
                  <p className="text-offwhite/80 font-body">
                    We have a satisfaction guarantee. If your video doesn't meet our quality standards, we'll work with
                    you to make it right.
                  </p>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-gold">Can I request specific content in the video?</h3>
                  <p className="text-offwhite/80 font-body">
                    Yes, you can provide specific instructions for what you'd like the player to say. However, players
                    reserve the right to decline inappropriate requests.
                  </p>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-gold">Can I share my video on social media?</h3>
                  <p className="text-offwhite/80 font-body">
                    Yes, you can share your video on personal social media accounts. However, commercial use is not
                    permitted without additional licensing.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
