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

export default function OrdersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")

  // Use the enhanced hook to fetch all orders for the current user
  const { orders, loading, error, refreshOrders } = useOrders({
    userId: user?.uid,
    refreshInterval: 30000, // Refresh every 30 seconds
  })

  // Filter orders based on the active tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true
    if (activeTab === "products") return order.orderType === "product"
    if (activeTab === "videos") return order.orderType === "video"
    return true
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
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

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-display font-bold mb-8 bg-gold-gradient bg-clip-text text-transparent">My Orders</h1>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-8 bg-charcoal border border-gold/20">
          <TabsTrigger
            value="all"
            className="text-gold data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
          >
            All Orders
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="text-gold data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
          >
            Products
          </TabsTrigger>
          <TabsTrigger
            value="videos"
            className="text-gold data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
          >
            Videos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {renderOrdersList(
            filteredOrders,
            loading,
            error,
            formatDate,
            getStatusColor,
            getStatusIcon,
            router,
            refreshOrders,
          )}
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          {renderOrdersList(
            filteredOrders,
            loading,
            error,
            formatDate,
            getStatusColor,
            getStatusIcon,
            router,
            refreshOrders,
          )}
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          {renderOrdersList(
            filteredOrders,
            loading,
            error,
            formatDate,
            getStatusColor,
            getStatusIcon,
            router,
            refreshOrders,
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function renderOrdersList(orders, loading, error, formatDate, getStatusColor, getStatusIcon, router, refreshOrders) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-offwhite">Loading your orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-gold/30 bg-charcoal">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-display font-bold text-offwhite mb-2">Error Loading Orders</h3>
          <p className="text-offwhite/70 mb-4">{error.message || "There was a problem loading your orders."}</p>
          <Button className="bg-gold-gradient hover:bg-gold-shine text-black" onClick={refreshOrders}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (orders.length === 0) {
    return (
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
    )
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Card key={order.id} className="border-gold/30 bg-charcoal overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <CardTitle className="text-gold font-display">
                  {order.orderType === "video" ? "Video Request" : "Order"} #{order.id.slice(0, 8)}
                </CardTitle>
                <p className="text-sm text-offwhite/70">{formatDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center mt-2 md:mt-0">
                <Badge className={`font-body ${getStatusColor(order.orderStatus)}`}>
                  <span className="flex items-center">
                    {getStatusIcon(order.orderStatus, order.orderType)}
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
            {order.orderType === "video" ? (
              <VideoOrderContent order={order} formatDate={formatDate} formatPrice={formatPrice} />
            ) : (
              <ProductOrderContent order={order} formatPrice={formatPrice} />
            )}

            <Separator className="my-4 bg-gold/20" />

            <div className="flex justify-between items-center">
              <div>
                {order.orderType === "product" ? (
                  <p className="text-sm text-offwhite/70">
                    {order.items?.reduce((total, item) => total + item.quantity, 0) || 0} items
                  </p>
                ) : (
                  <p className="text-sm text-offwhite/70">
                    Requested: {formatDate(order.videoRequest?.deliveryDate || order.createdAt)}
                  </p>
                )}
                <p className="font-display font-bold text-offwhite">Total: ${formatPrice(order.total)}</p>
              </div>
              <Button
                variant="outline"
                className="border-gold text-gold hover:bg-gold/10"
                onClick={() =>
                  router.push(
                    order.orderType === "video" ? `/customer/videos/${order.id}` : `/customer/orders/${order.id}`,
                  )
                }
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ProductOrderContent({ order, formatPrice }) {
  return (
    <div className="space-y-4">
      {order.items?.map((item, index) => (
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
    </div>
  )
}

function VideoOrderContent({ order, formatDate, formatPrice }) {
  const videoRequest = order.videoRequest || {}

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <User className="h-4 w-4 text-gold mr-2" />
            <p className="text-sm text-offwhite/70">
              Player: <span className="text-offwhite">{videoRequest.player || videoRequest.playerName}</span>
            </p>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gold mr-2" />
            <p className="text-sm text-offwhite/70">
              Occasion: <span className="text-offwhite">{videoRequest.occasion}</span>
            </p>
          </div>
          <div className="flex items-center">
            <User className="h-4 w-4 text-gold mr-2" />
            <p className="text-sm text-offwhite/70">
              Recipient: <span className="text-offwhite">{videoRequest.recipientName}</span>
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm text-offwhite/70 mb-1">Message Instructions:</p>
          <p className="text-offwhite bg-black/20 p-2 rounded text-sm">
            {videoRequest.message || "No message instructions provided."}
          </p>
        </div>
      </div>

      {videoRequest.videoUrl && (
        <div className="mt-4">
          <p className="text-sm text-offwhite/70 mb-2">Your Video:</p>
          <div className="relative aspect-video bg-black rounded overflow-hidden">
            <video controls className="w-full h-full" poster="/video-thumbnail.png">
              <source src={videoRequest.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </div>
  )
}
