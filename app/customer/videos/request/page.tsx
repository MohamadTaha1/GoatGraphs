"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useVideos } from "@/hooks/use-videos"
import { Calendar, Loader2 } from "lucide-react"

export default function VideoRequestPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const { videos } = useVideos({ onlyAvailable: true })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  const playerId = searchParams.get("id")
  const playerName = searchParams.get("player")

  const [formData, setFormData] = useState({
    player: playerName || "",
    occasion: "",
    recipientName: "",
    message: "",
    deliveryDate: "",
  })

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      const returnUrl = encodeURIComponent(`/customer/videos/request?player=${playerName}&id=${playerId}`)
      router.push(`/login?returnUrl=${returnUrl}&action=requestVideo`)
      return
    }

    // Find the selected player from videos
    if (videos.length > 0 && playerId) {
      const player = videos.find((v) => v.id === playerId)
      if (player) {
        setSelectedPlayer(player)
      }
    }
  }, [user, videos, playerId, playerName, router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      toast({
        title: "Request submitted",
        description: "Your video request has been submitted successfully.",
      })
    }, 1500)
  }

  // Fallback player data if not found in videos
  const fallbackPlayer = {
    id: playerId || "unknown",
    playerName: playerName || "Selected Player",
    price: 399.99,
    thumbnailUrl: "/images/video-thumbnails/messi-greeting.png",
    availability: "7-14 days",
  }

  const displayPlayer = selectedPlayer || fallbackPlayer

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-display font-bold mb-8 bg-gold-gradient bg-clip-text text-transparent">
        Request a Video from {displayPlayer.playerName}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          {submitted ? (
            <Card className="border-gold">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/20 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-gold"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-display font-bold mb-2 text-gold">Request Submitted!</h3>
                  <p className="text-offwhite/80 mb-4">
                    Thank you for your video request. We'll notify you once {displayPlayer.playerName} has accepted your
                    request.
                  </p>
                  <Button
                    onClick={() => router.push("/customer/videos")}
                    className="bg-gold-gradient hover:bg-gold-shine text-black"
                  >
                    Back to Videos
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="player" className="block text-sm font-medium mb-1">
                  Selected Player
                </Label>
                <Input
                  id="player"
                  name="player"
                  value={formData.player}
                  disabled
                  className="w-full border-gold/20 bg-charcoal/50"
                />
              </div>

              <div>
                <Label htmlFor="occasion" className="block text-sm font-medium mb-1">
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
                <Label htmlFor="recipientName" className="block text-sm font-medium mb-1">
                  Recipient's Name
                </Label>
                <Input
                  id="recipientName"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  required
                  className="w-full border-gold/20"
                  placeholder="Who is this video for?"
                />
              </div>

              <div>
                <Label htmlFor="message" className="block text-sm font-medium mb-1">
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
                <Label htmlFor="deliveryDate" className="block text-sm font-medium mb-1">
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
                  <Calendar className="h-5 w-5 text-gold" />
                </div>
                <p className="text-xs text-offwhite/60 mt-1">Please allow at least 14 days for video delivery</p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gold-gradient hover:bg-gold-shine text-black"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </form>
          )}
        </div>

        <div>
          <Card className="border-gold/30 bg-charcoal">
            <CardHeader>
              <div className="flex items-center">
                <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
                  <Image
                    src={displayPlayer.thumbnailUrl || "/placeholder.svg"}
                    alt={displayPlayer.playerName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <CardTitle className="text-gold">{displayPlayer.playerName}</CardTitle>
                  <CardDescription className="text-offwhite/60">Video Request Details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gold/10 rounded-lg">
                <span className="text-offwhite">Price</span>
                <span className="text-2xl font-display font-bold text-gold">${displayPlayer.price?.toFixed(2)}</span>
              </div>

              <div>
                <h3 className="font-display font-semibold text-offwhite">Video Length</h3>
                <p className="text-offwhite/80">
                  Videos are typically 30-60 seconds long, depending on the player and the message.
                </p>
              </div>

              <div>
                <h3 className="font-display font-semibold text-offwhite">Delivery Time</h3>
                <p className="text-offwhite/80">
                  Most videos are delivered within {displayPlayer.availability}, but this can vary based on the player's
                  schedule and availability.
                </p>
              </div>

              <div>
                <h3 className="font-display font-semibold text-offwhite">Payment</h3>
                <p className="text-offwhite/80">
                  You'll only be charged when the player accepts your request. If they're unable to fulfill it, you
                  won't be charged.
                </p>
              </div>

              <div>
                <h3 className="font-display font-semibold text-offwhite">Ownership</h3>
                <p className="text-offwhite/80">
                  You'll own the video for personal use, but commercial rights remain with the player and our platform.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={() => router.push("/customer/videos")}
                className="w-full border-gold text-gold hover:bg-gold/10"
              >
                Back to Available Players
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
