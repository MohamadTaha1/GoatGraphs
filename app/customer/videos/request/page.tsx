"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { AuthRequiredModal } from "@/components/auth-required-modal"
import { createOrder } from "@/lib/order-service"

// Define the form schema
const formSchema = z.object({
  player: z.string().min(1, { message: "Please select a player" }),
  occasion: z.string().min(1, { message: "Please select an occasion" }),
  recipientName: z.string().min(1, { message: "Recipient name is required" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }).max(500, {
    message: "Message must not exceed 500 characters",
  }),
  deliveryDate: z.date({
    required_error: "Please select a delivery date",
  }),
})

// Define the players and occasions
const players = [
  { id: "messi", name: "Lionel Messi", price: 499.99 },
  { id: "ronaldo", name: "Cristiano Ronaldo", price: 499.99 },
  { id: "mbappe", name: "Kylian Mbappé", price: 399.99 },
  { id: "neymar", name: "Neymar Jr.", price: 399.99 },
  { id: "haaland", name: "Erling Haaland", price: 349.99 },
  { id: "salah", name: "Mohamed Salah", price: 349.99 },
  { id: "lewandowski", name: "Robert Lewandowski", price: 299.99 },
  { id: "de-bruyne", name: "Kevin De Bruyne", price: 299.99 },
  { id: "kane", name: "Harry Kane", price: 299.99 },
  { id: "benzema", name: "Karim Benzema", price: 299.99 },
]

const occasions = [
  "Birthday",
  "Anniversary",
  "Graduation",
  "Wedding",
  "New Baby",
  "Congratulations",
  "Thank You",
  "Get Well Soon",
  "Holiday Greeting",
  "Other",
]

export default function VideoRequestPage() {
  const { user, isGuest } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Check if user is guest and show auth modal
  useEffect(() => {
    if (!user || isGuest) {
      setIsAuthModalOpen(true)
    }
  }, [user, isGuest])

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      player: "",
      occasion: "",
      recipientName: "",
      message: "",
    },
  })

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Check if user is logged in
    if (!user || isGuest) {
      setIsAuthModalOpen(true)
      return
    }

    try {
      setIsSubmitting(true)

      // Get the selected player's price
      const selectedPlayer = players.find((p) => p.id === values.player)
      const price = selectedPlayer ? selectedPlayer.price : 399.99
      const playerName = selectedPlayer ? selectedPlayer.name : values.player

      // Create the order with video request
      const orderResult = await createOrder({
        userId: user.uid,
        items: [
          {
            id: `video-${Date.now()}`,
            name: `Personalized Video from ${playerName}`,
            price: price,
            quantity: 1,
            type: "video_request",
          },
        ],
        status: "pending",
        paymentStatus: "paid",
        shippingAddress: {
          name: user.displayName || "Customer",
          email: user.email || "",
        },
        total: price,
        videoRequest: {
          player: playerName,
          occasion: values.occasion,
          recipientName: values.recipientName,
          message: values.message,
          deliveryDate: format(values.deliveryDate, "PPP"),
        },
      })

      if (orderResult.success) {
        toast({
          title: "Video Request Submitted",
          description: "Your video request has been submitted successfully!",
        })
        router.push(`/customer/checkout/success?orderId=${orderResult.orderId}&type=video`)
      } else {
        throw new Error("Failed to create order")
      }
    } catch (error) {
      console.error("Error submitting video request:", error)
      toast({
        title: "Error",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get the selected player's price
  const selectedPlayerId = form.watch("player")
  const selectedPlayer = players.find((p) => p.id === selectedPlayerId)
  const price = selectedPlayer ? selectedPlayer.price : 399.99

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-display font-bold mb-2 bg-gold-gradient bg-clip-text text-transparent">
        Request a Personalized Video
      </h1>
      <p className="text-offwhite/70 mb-8">
        Get a personalized video message from your favorite football star for yourself or as a gift.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="border-gold/30 bg-charcoal">
            <CardHeader>
              <CardTitle className="text-gold font-display">Video Request Form</CardTitle>
              <CardDescription>Fill out the form below to request your personalized video.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="player"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-offwhite">Select Player</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-gold/30 bg-charcoal/50">
                              <SelectValue placeholder="Select a player" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-charcoal border-gold/30">
                            {players.map((player) => (
                              <SelectItem key={player.id} value={player.id}>
                                {player.name} - ${player.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="occasion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-offwhite">Occasion</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-gold/30 bg-charcoal/50">
                              <SelectValue placeholder="Select an occasion" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-charcoal border-gold/30">
                            {occasions.map((occasion) => (
                              <SelectItem key={occasion} value={occasion}>
                                {occasion}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recipientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-offwhite">Recipient Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter the name of the person receiving the video"
                            className="border-gold/30 bg-charcoal/50"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This is the name of the person who will receive the video message.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-offwhite">Message Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter detailed instructions for the video message"
                            className="min-h-32 border-gold/30 bg-charcoal/50"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide specific details about what you want the player to say in the video.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-offwhite">Requested Delivery Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal border-gold/30 bg-charcoal/50",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-charcoal border-gold/30" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date() || date > new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Select a date when you would like to receive the video. Please allow at least 7-14 days for
                          processing.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gold-gradient hover:bg-gold-shine text-black"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Submit Request"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-gold/30 bg-charcoal sticky top-8">
            <CardHeader>
              <CardTitle className="text-gold font-display">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-offwhite">Personalized Video</span>
                  <span className="font-bold text-gold">${price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-offwhite">Processing Fee</span>
                  <span className="font-bold text-offwhite">$0.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-offwhite">Tax</span>
                  <span className="font-bold text-offwhite">$0.00</span>
                </div>
                <div className="border-t border-gold/20 pt-4 flex justify-between items-center">
                  <span className="text-offwhite font-bold">Total</span>
                  <span className="font-bold text-xl text-gold">${price.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 bg-gold/10 p-4 rounded-md">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-gold mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-gold">Important Information</h4>
                    <ul className="text-sm text-offwhite/70 mt-2 space-y-2">
                      <li>• Videos are typically delivered within 7-14 days.</li>
                      <li>• All video requests are subject to player availability.</li>
                      <li>• You will receive an email notification when your video is ready.</li>
                      <li>• Videos are non-refundable once the request has been accepted by the player.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gold-gradient hover:bg-gold-shine text-black"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Submit Request"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        actionType="video"
        returnUrl="/customer/videos/request"
      />
    </div>
  )
}
