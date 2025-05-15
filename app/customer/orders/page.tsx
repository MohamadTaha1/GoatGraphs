"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, Package, Truck, CheckCircle, AlertCircle, Video, Calendar, Clock, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import { useOrders } from "@/hooks/use-orders"
import { getFirestoreInstance } from "@/lib/firebase/firestore"

interface VideoRequest {
  id: string
  player: string
  occasion: string
  recipientName: string
  message: string
  deliveryDate: string
  status: "pending" | "accepted" | "completed" | "rejected"
  createdAt: any
  price: number
  videoUrl?: string
}

export default function OrdersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [videoRequests, setVideoRequests] = useState([])
  const [loadingVideos, setLoadingVideos] = useState(true)

  // Use the enhanced hook to fetch orders for the current user
  const {
    orders,
    loading: loadingOrders,
    error,
  } = useOrders({
    userId: user?.uid,
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchVideoRequests = async () => {
      try {
        setLoadingVideos(true)
        const db = getFirestoreInstance()

        if (!db) {
          // Fallback to mock data if Firestore is not available
          setVideoRequests(generateMockVideoRequests())
          setLoadingVideos(false)
          return
        }

        // Dynamically import Firestore functions
        const { collection, query, where, getDocs, orderBy } = await import("firebase/firestore")

        // Fetch video requests
        const videoRequestsQuery = query(
          collection(db, "videoRequests"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
        )

        const videoRequestsSnapshot = await getDocs(videoRequestsQuery)
        const videoRequestsData = videoRequestsSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            items: [
              {
                productId: doc.id,
                productName: `Video Message from ${data.player}`,
                quantity: 1,
                price: data.price || 399.99,
                imageUrl:
                  data.thumbnailUrl || `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(data.player)}`,
              },
            ],
            subtotal: data.price || 399.99,
            shipping: 0,
            tax: 0,
            total: data.price || 399.99,
            orderStatus: data.status || "pending",
            paymentStatus: "paid",
            createdAt: data.createdAt,
            type: "video",
            videoRequest: data,
          }
        })

        if (videoRequestsData.length === 0) {
          // If no video requests in Firestore, use mock data
          setVideoRequests(generateMockVideoRequests())
        } else {
          setVideoRequests(videoRequestsData)
        }
      } catch (error) {
        console.error("Error fetching video requests:", error)
        // Fallback to mock data on error
        setVideoRequests(generateMockVideoRequests())
      } finally {
        setLoadingVideos(false)
      }
    }

    fetchVideoRequests()
  }, [user, router])

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

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-500/20 text-gray-500"

    switch (status) {
      case "pending":
        return "bg-blue-500/20 text-blue-500"
      case "processing":
      case "accepted":
        return "bg-orange-500/20 text-orange-500"
      case "shipped":
        return "bg-violet-500/20 text-violet-500"
      case "delivered":
      case "completed":
        return "bg-green-500/20 text-green-500"
      case "cancelled":
      case "rejected":
        return "bg-red-500/20 text-red-500"
      default:
        return "bg-gray-500/20 text-gray-500"
    }
  }

  const getStatusIcon = (status: string | undefined, type: "product" | "video" = "product") => {
    if (!status) return <AlertCircle className="h-5 w-5" />

    if (type === "video") {
      switch (status) {
        case "pending":
          return <Clock className="h-5 w-5" />
        case "accepted":
          return <Video className="h-5 w-5" />
        case "completed":
          return <CheckCircle className="h-5 w-5" />
        case "rejected":
          return <AlertCircle className="h-5 w-5" />
        default:
          return <Clock className="h-5 w-5" />
      }
    } else {
      switch (status) {
        case "pending":
          return <ShoppingBag className="h-5 w-5" />
        case "processing":
          return <Package className="h-5 w-5" />
        case "shipped":
          return <Truck className="h-5 w-5" />
        case "delivered":
          return <CheckCircle className="h-5 w-5" />
        case "cancelled":
          return <AlertCircle className="h-5 w-5" />
        default:
          return <ShoppingBag className="h-5 w-5" />
      }
    }
  }

  if (!user) {
    return null // Handled by redirect
  }

  const loading = loadingOrders || loadingVideos

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-display font-bold mb-8 bg-gold-gradient bg-clip-text text-transparent">My Orders</h1>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8 bg-charcoal border border-gold/20">
          <TabsTrigger
            value="products"
            className="text-gold data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
          >
            Product Orders
          </TabsTrigger>
          <TabsTrigger
            value="videos"
            className="text-gold data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
          >
            Video Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          {loadingOrders ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-offwhite">Loading your orders...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="border-gold/30 bg-charcoal overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div>
                        <CardTitle className="text-gold font-display">Order #{order.id.slice(0, 8)}</CardTitle>
                        <p className="text-sm text-offwhite/70">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center mt-2 md:mt-0">
                        <Badge className={`font-body ${getStatusColor(order.orderStatus)}`}>
                          <span className="flex items-center">
                            {getStatusIcon(order.orderStatus)}
                            <span className="ml-1">
                              {order.orderStatus
                                ? order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)
                                : "Unknown"}
                            </span>
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className="h-16 w-16 bg-black-300 rounded flex items-center justify-center overflow-hidden relative">
                            <Image
                              src={item.imageUrl || "/placeholder.svg?height=64&width=64"}
                              alt={item.productName}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-display font-bold text-offwhite">{item.productName}</h3>
                            <p className="text-sm text-offwhite/70">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-display font-bold text-gold">${formatPrice(item.price)}</p>
                          </div>
                        </div>
                      ))}

                      <Separator className="my-4 bg-gold/20" />

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-offwhite/70">
                            {order.items.reduce((total, item) => total + item.quantity, 0)} items
                          </p>
                          <p className="font-display font-bold text-offwhite">Total: ${formatPrice(order.total)}</p>
                        </div>
                        <Button
                          variant="outline"
                          className="border-gold text-gold hover:bg-gold/10"
                          onClick={() => router.push(`/customer/orders/${order.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-gold/30 bg-charcoal">
              <CardContent className="pt-6 text-center">
                <ShoppingBag className="h-12 w-12 text-gold/50 mx-auto mb-4" />
                <h3 className="text-xl font-display font-bold text-offwhite mb-2">No Orders Yet</h3>
                <p className="text-offwhite/70 mb-4">You haven't placed any orders yet.</p>
                <Button asChild className="bg-gold-gradient hover:bg-gold-shine text-black">
                  <a href="/customer/shop">Browse Products</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="videos">
          {loadingVideos ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-offwhite">Loading your video requests...</p>
            </div>
          ) : videoRequests.length > 0 ? (
            <div className="space-y-6">
              {videoRequests.map((order) => (
                <Card key={order.id} className="border-gold/30 bg-charcoal overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div>
                        <CardTitle className="text-gold font-display">Video Request #{order.id.slice(0, 8)}</CardTitle>
                        <p className="text-sm text-offwhite/70">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center mt-2 md:mt-0">
                        <Badge className={`font-body ${getStatusColor(order.orderStatus)}`}>
                          <span className="flex items-center">
                            {getStatusIcon(order.orderStatus, "video")}
                            <span className="ml-1">
                              {order.orderStatus
                                ? order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)
                                : "Unknown"}
                            </span>
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gold mr-2" />
                            <p className="text-sm text-offwhite/70">
                              Player: <span className="text-offwhite">{order.videoRequest?.player}</span>
                            </p>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gold mr-2" />
                            <p className="text-sm text-offwhite/70">
                              Occasion: <span className="text-offwhite">{order.videoRequest?.occasion}</span>
                            </p>
                          </div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gold mr-2" />
                            <p className="text-sm text-offwhite/70">
                              Recipient: <span className="text-offwhite">{order.videoRequest?.recipientName}</span>
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-offwhite/70 mb-1">Message Instructions:</p>
                          <p className="text-offwhite bg-black/20 p-2 rounded text-sm">
                            {order.videoRequest?.message || "No message instructions provided."}
                          </p>
                        </div>
                      </div>

                      {order.videoRequest?.videoUrl && (
                        <div className="mt-4">
                          <p className="text-sm text-offwhite/70 mb-2">Your Video:</p>
                          <div className="relative aspect-video bg-black rounded overflow-hidden">
                            <video controls className="w-full h-full" poster="/video-thumbnail.png">
                              <source src={order.videoRequest.videoUrl} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        </div>
                      )}

                      <Separator className="my-4 bg-gold/20" />

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-offwhite/70">
                            Requested Delivery: {order.videoRequest?.deliveryDate}
                          </p>
                          <p className="font-display font-bold text-offwhite">Total: ${formatPrice(order.total)}</p>
                        </div>
                        <Button
                          variant="outline"
                          className="border-gold text-gold hover:bg-gold/10"
                          onClick={() => router.push(`/customer/videos/${order.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-gold/30 bg-charcoal">
              <CardContent className="pt-6 text-center">
                <Video className="h-12 w-12 text-gold/50 mx-auto mb-4" />
                <h3 className="text-xl font-display font-bold text-offwhite mb-2">No Video Requests Yet</h3>
                <p className="text-offwhite/70 mb-4">You haven't requested any personalized videos yet.</p>
                <Button asChild className="bg-gold-gradient hover:bg-gold-shine text-black">
                  <a href="/customer/videos">Request a Video</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Generate mock video requests for testing
function generateMockVideoRequests() {
  return [
    {
      id: "video123456",
      items: [
        {
          productId: "vid1",
          productName: "Video Message from Cristiano Ronaldo",
          quantity: 1,
          price: 499.99,
          imageUrl: "/images/video-thumbnails/ronaldo-birthday.png",
        },
      ],
      subtotal: 499.99,
      shipping: 0,
      tax: 0,
      total: 499.99,
      orderStatus: "completed",
      paymentStatus: "paid",
      createdAt: new Date("2023-05-10"),
      type: "video",
      videoRequest: {
        id: "vid1",
        player: "Cristiano Ronaldo",
        occasion: "Birthday",
        recipientName: "Alex",
        message: "Please wish Alex a happy 30th birthday and mention his love for Manchester United!",
        deliveryDate: "2023-05-20",
        status: "completed",
        createdAt: new Date("2023-05-10"),
        price: 499.99,
        videoUrl: "https://example.com/videos/sample.mp4",
      },
    },
    {
      id: "video789012",
      items: [
        {
          productId: "vid2",
          productName: "Video Message from Kylian Mbappé",
          quantity: 1,
          price: 399.99,
          imageUrl: "/images/video-thumbnails/mbappe-congrats.png",
        },
      ],
      subtotal: 399.99,
      shipping: 0,
      tax: 0,
      total: 399.99,
      orderStatus: "pending",
      paymentStatus: "paid",
      createdAt: new Date("2023-06-05"),
      type: "video",
      videoRequest: {
        id: "vid2",
        player: "Kylian Mbappé",
        occasion: "Graduation",
        recipientName: "Sarah",
        message: "Congratulate Sarah on her graduation from university with a sports management degree!",
        deliveryDate: "2023-06-25",
        status: "pending",
        createdAt: new Date("2023-06-05"),
        price: 399.99,
      },
    },
  ]
}
