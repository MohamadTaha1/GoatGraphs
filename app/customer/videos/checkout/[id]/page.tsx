"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft, CheckCircle2, Shield, Loader2 } from "lucide-react"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore"
import { useVideoOrders } from "@/hooks/use-video-orders"

export default function VideoCheckoutPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const { createVideoOrder, updatePaymentStatus } = useVideoOrders()
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [videoRequest, setVideoRequest] = useState<any>(null)

  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  })

  useEffect(() => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to complete your order.",
      })
      router.push("/login")
      return
    }

    const fetchVideoRequest = async () => {
      try {
        setIsLoading(true)
        const requestId = params.id as string

        const db = getFirestoreInstance()
        if (!db) {
          throw new Error("Firestore instance is null")
        }

        const requestRef = doc(db, "videoRequests", requestId)
        const requestSnap = await getDoc(requestRef)

        if (!requestSnap.exists()) {
          toast({
            title: "Request not found",
            description: "The video request could not be found.",
            variant: "destructive",
          })
          router.push("/customer/videos")
          return
        }

        const requestData = requestSnap.data()

        // Check if this request belongs to the current user
        if (requestData.userId !== user.uid) {
          toast({
            title: "Unauthorized",
            description: "You don't have permission to access this request.",
            variant: "destructive",
          })
          router.push("/customer/videos")
          return
        }

        // Check if this request has already been paid for
        if (requestData.status !== "pending_payment") {
          toast({
            title: "Already processed",
            description: "This request has already been processed.",
          })
          router.push("/customer/videos/orders")
          return
        }

        setVideoRequest({ id: requestSnap.id, ...requestData })
      } catch (error) {
        console.error("Error fetching video request:", error)
        toast({
          title: "Error",
          description: "There was a problem loading your request. Please try again.",
          variant: "destructive",
        })
        router.push("/customer/videos")
      } finally {
        setIsLoading(false)
      }
    }

    fetchVideoRequest()
  }, [user, params.id, router, toast])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const db = getFirestoreInstance()
      if (!db) {
        throw new Error("Firestore instance is null")
      }

      // 1. Update the video request status
      const requestRef = doc(db, "videoRequests", videoRequest.id)
      await updateDoc(requestRef, {
        status: "paid",
        updatedAt: Timestamp.now(),
      })

      // 2. Create a new video order
      const newOrder = await createVideoOrder(
        videoRequest.playerId,
        videoRequest.playerName,
        videoRequest.playerImage,
        videoRequest.price,
        videoRequest.recipientName,
        videoRequest.occasion,
        videoRequest.message,
      )

      // 3. Update the payment status
      await updatePaymentStatus(newOrder.id, "paid")

      setOrderId(newOrder.id)
      setOrderComplete(true)
    } catch (error) {
      console.error("Error processing payment:", error)
      toast({
        title: "Payment failed",
        description: "There was a problem processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-16 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold mr-2" />
        <span>Loading your request...</span>
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="container py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6 mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-4 bg-gold-gradient bg-clip-text text-transparent">
            Video Request Confirmed!
          </h1>
          <p className="text-gray-400 mb-4 font-body">
            Thank you for your order. Your video request has been confirmed and will be delivered to you soon.
          </p>
          <p className="text-gray-400 mb-2 font-body">Order ID: {orderId}</p>
          <p className="text-gray-400 mb-8 font-body">A confirmation email has been sent to your email address.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-gold-gradient hover:bg-gold-shine bg-[length:200%_auto] hover:animate-gold-shimmer text-black font-body"
            >
              <Link href="/customer/videos/orders">View My Orders</Link>
            </Button>
            <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10 font-body">
              <Link href="/customer">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!videoRequest) {
    return null
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-display font-bold mb-8 bg-gold-gradient bg-clip-text text-transparent">
        Complete Your Video Request
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Payment Form */}
        <div className="lg:w-2/3">
          <form onSubmit={handleSubmit}>
            <Card className="border border-gold-700 mb-6">
              <CardHeader>
                <CardTitle className="font-display text-gold-500">Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber" className="font-body">
                    Card Number
                  </Label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    placeholder="1234 5678 9012 3456"
                    required
                    className="border-gold-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardName" className="font-body">
                    Name on Card
                  </Label>
                  <Input
                    id="cardName"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleChange}
                    required
                    className="border-gold-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate" className="font-body">
                      Expiry Date
                    </Label>
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      placeholder="MM/YY"
                      required
                      className="border-gold-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv" className="font-body">
                      CVV
                    </Label>
                    <Input
                      id="cvv"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      placeholder="123"
                      required
                      className="border-gold-700"
                    />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <Shield className="h-5 w-5 text-gold-500 mr-2" />
                  <p className="text-sm text-gray-500 font-body">Your payment information is secure and encrypted</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                className="border-gold-500 text-gold-500 hover:bg-gold-500/10 font-body"
                asChild
              >
                <Link href="/customer/videos">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Videos
                </Link>
              </Button>
              <Button
                type="submit"
                className="bg-gold-gradient hover:bg-gold-shine bg-[length:200%_auto] hover:animate-gold-shimmer text-black font-body"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  "Complete Payment"
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <Card className="border border-gold-700 sticky top-20">
            <CardHeader>
              <CardTitle className="font-display text-gold-500">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="relative h-16 w-16 flex-shrink-0">
                  <Image
                    src={videoRequest.playerImage || "/placeholder.svg"}
                    alt={videoRequest.playerName}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="font-display font-bold text-sm">Video from {videoRequest.playerName}</h3>
                  <p className="text-gray-500 text-xs font-body">For: {videoRequest.recipientName}</p>
                  <p className="text-gray-500 text-xs font-body">Occasion: {videoRequest.occasion}</p>
                </div>
              </div>
              <Separator className="my-2 bg-gold-700/50" />
              <div className="flex justify-between font-body">
                <span>Video Price</span>
                <span>${videoRequest.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-body">
                <span>Processing Fee</span>
                <span>$0.00</span>
              </div>
              <Separator className="my-2 bg-gold-700/50" />
              <div className="flex justify-between font-display font-bold text-lg">
                <span>Total</span>
                <span>${videoRequest.price.toFixed(2)}</span>
              </div>
              <div className="bg-gold-500/10 p-3 rounded-md mt-4">
                <p className="text-sm text-gold-500 font-body">
                  Your video will be delivered within 7-14 days after payment is confirmed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
