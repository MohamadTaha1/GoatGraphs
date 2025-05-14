"use client"

import Link from "next/link"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Video, Play, CheckCircle, Clock, Calendar, Loader2 } from "lucide-react"

export default function VideosPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    player: "",
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

  const featuredPlayers = [
    {
      id: 1,
      name: "Lionel Messi",
      image: "/images/video-thumbnails/messi-greeting.png",
      price: 499.99,
      available: true,
    },
    {
      id: 2,
      name: "Cristiano Ronaldo",
      image: "/images/video-thumbnails/ronaldo-birthday.png",
      price: 499.99,
      available: true,
    },
    {
      id: 3,
      name: "Kylian Mbappé",
      image: "/images/video-thumbnails/mbappe-congrats.png",
      price: 399.99,
      available: true,
    },
    {
      id: 4,
      name: "Neymar Jr.",
      image: "/images/video-thumbnails/neymar-message.png",
      price: 399.99,
      available: false,
    },
    {
      id: 5,
      name: "Kevin De Bruyne",
      image: "/images/video-thumbnails/de-bruyne-message.png",
      price: 349.99,
      available: true,
    },
    {
      id: 6,
      name: "Erling Haaland",
      image: "/images/video-thumbnails/haaland-greeting.png",
      price: 399.99,
      available: true,
    },
  ]

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
              Get a personalized video greeting from your favorite football star. Perfect for birthdays, celebrations,
              or just to surprise a fan. Our players will record a custom message just for you or your loved ones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => document.getElementById("request-form")?.scrollIntoView({ behavior: "smooth" })}
                className="bg-gold-soft hover:bg-gold-deep text-jetblack font-body"
              >
                Request a Video
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
          <div className="relative h-[300px] rounded-lg overflow-hidden">
            <Image
              src="/images/video-thumbnails/messi-greeting.png"
              alt="Video Greeting Service"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
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

      <div className="mb-16">
        <h2 className="text-2xl font-display font-bold mb-8 text-gold">Featured Players</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPlayers.map((player) => (
            <Card key={player.id} className="border-gold/30 bg-charcoal overflow-hidden">
              <div className="relative h-[200px]">
                <Image src={player.image || "/placeholder.svg"} alt={player.name} fill className="object-cover" />
                {!player.available && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <p className="text-white font-bold">Temporarily Unavailable</p>
                  </div>
                )}
              </div>
              <CardContent className="pt-4">
                <h3 className="font-display font-bold text-xl text-gold">{player.name}</h3>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-offwhite/80 font-body">${player.price.toFixed(2)}</p>
                  <p className="text-offwhite/60 text-sm font-body">{player.available ? "Available" : "Unavailable"}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => {
                    if (player.available) {
                      setFormData((prev) => ({ ...prev, player: player.name }))
                      document.getElementById("request-form")?.scrollIntoView({ behavior: "smooth" })
                    }
                  }}
                  className="w-full bg-gold-soft hover:bg-gold-deep text-jetblack font-body"
                  disabled={!player.available}
                >
                  {player.available ? "Request Video" : "Currently Unavailable"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
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
                {submitted ? (
                  <Card className="border-gold-500">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-500/20 mb-4">
                          <CheckCircle className="h-8 w-8 text-gold-500" />
                        </div>
                        <h3 className="text-xl font-display font-bold mb-2 text-gold-500">Request Submitted!</h3>
                        <p className="text-gray-300 mb-4 font-body">
                          Thank you for your video request. We'll notify you once the player has accepted your request.
                        </p>
                        <Button
                          onClick={() => setSubmitted(false)}
                          className="bg-gold-gradient hover:bg-gold-shine bg-[length:200%_auto] hover:animate-gold-shimmer text-black font-body"
                        >
                          Submit Another Request
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="player" className="block text-sm font-medium mb-1 font-body">
                        Select Player
                      </Label>
                      <Select value={formData.player} onValueChange={(value) => handleSelectChange("player", value)}>
                        <SelectTrigger className="border-gold/20">
                          <SelectValue placeholder="Choose a player" />
                        </SelectTrigger>
                        <SelectContent>
                          {featuredPlayers
                            .filter((p) => p.available)
                            .map((player) => (
                              <SelectItem key={player.id} value={player.name}>
                                {player.name} - ${player.price.toFixed(2)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="occasion" className="block text-sm font-medium mb-1 font-body">
                        Occasion
                      </Label>
                      <Select
                        value={formData.occasion}
                        onValueChange={(value) => handleSelectChange("occasion", value)}
                      >
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
                      disabled={isSubmitting}
                      className="w-full bg-gold-gradient hover:bg-gold-shine bg-[length:200%_auto] hover:animate-gold-shimmer text-black font-body"
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
                        You'll only be charged when the player accepts your request. If they're unable to fulfill it,
                        you won't be charged.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-display font-semibold text-offwhite">Ownership</h3>
                      <p className="text-offwhite/80 font-body">
                        You'll own the video for personal use, but commercial rights remain with the player and our
                        platform.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gold/20">
                      <h3 className="font-display font-semibold text-gold">Need Help?</h3>
                      <p className="text-offwhite/80 font-body mb-4">
                        If you have any questions or need assistance with your video request, our team is here to help.
                      </p>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full border-gold text-gold hover:bg-gold/10 font-body"
                      >
                        <Link href="/customer/contact">Contact Support</Link>
                      </Button>
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
