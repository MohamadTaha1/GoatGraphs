"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { collection, getDocs } from "firebase/firestore"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Package, Truck, CheckCircle, AlertCircle, Clock, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import type { Order } from "@/lib/firebase-schema"
import { Button } from "@/components/ui/button"

export default function CustomerOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [indexError, setIndexError] = useState(false)
  const [indexUrl, setIndexUrl] = useState("")

  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const db = getFirestoreInstance()
        if (!db) {
          console.error("Firestore instance is null")
          setError("Database connection failed. Please try again later.")
          setLoading(false)
          return
        }

        // Log for debugging
        console.log("Fetching orders for user:", user.uid)

        try {
          // Get all orders first (without filtering by userId)
          const ordersRef = collection(db, "orders")
          const querySnapshot = await getDocs(ordersRef)

          console.log(`Found ${querySnapshot.docs.length} total orders`)

          // Filter orders client-side to match the current user
          const ordersData = querySnapshot.docs
            .map((doc) => {
              const data = doc.data()
              return {
                id: doc.id,
                ...data,
                // Ensure createdAt is properly handled
                createdAt: data.createdAt ? data.createdAt : new Date(),
              }
            })
            .filter((order) => {
              // Check if the order belongs to the current user
              // Also log each order's userId for debugging
              console.log(`Order ${order.id} userId: ${order.userId}, current user: ${user.uid}`)
              return order.userId === user.uid
            }) as Order[]

          console.log(`After filtering, found ${ordersData.length} orders for user ${user.uid}`)

          // Sort by createdAt in descending order (newest first)
          ordersData.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() ? a.createdAt.toDate() : new Date(a.createdAt || 0)
            const dateB = b.createdAt?.toDate?.() ? b.createdAt.toDate() : new Date(b.createdAt || 0)
            return dateB.getTime() - dateA.getTime()
          })

          setOrders(ordersData)
        } catch (queryError) {
          console.error("Error with Firestore query:", queryError)

          // Check if it's an index error
          if (queryError instanceof Error && queryError.message.includes("index")) {
            setIndexError(true)
            // Extract the URL from the error message
            const urlMatch = queryError.message.match(/https:\/\/console\.firebase\.google\.com[^\s]+/)
            if (urlMatch) {
              setIndexUrl(urlMatch[0])
            }
          } else {
            setError("Failed to load orders. Please try again later.")
          }
        }
      } catch (err) {
        console.error("Error fetching orders:", err)
        setError("An unexpected error occurred. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
          <p className="mt-4 text-offwhite/70">Loading your orders...</p>
        </div>
      </div>
    )
  }

  if (indexError) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="h-8 w-8 text-amber-500 mb-4" />
          <h2 className="text-xl font-semibold text-offwhite mb-2">Database Setup Required</h2>
          <p className="text-offwhite/70 mb-6 text-center max-w-md">
            The orders database needs a one-time setup. Please contact the administrator to create the required index.
          </p>
          {indexUrl && (
            <a
              href={indexUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-gold-soft hover:bg-gold-deep text-jetblack px-6 py-2 rounded-md font-semibold transition-colors"
            >
              Create Index <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="mt-4 text-red-500">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-gold-soft hover:bg-gold-deep text-jetblack"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-xl font-semibold text-offwhite mb-2">Please Sign In</h2>
          <p className="text-offwhite/70 mb-6 text-center max-w-md">You need to be signed in to view your orders.</p>
          <Link href="/login">
            <Button className="bg-gold-soft hover:bg-gold-deep text-jetblack">Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-offwhite">My Orders</h1>
        <Card className="border-gold/30 bg-charcoal">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-offwhite/30 mb-4" />
            <h2 className="text-xl font-semibold text-offwhite mb-2">No Orders Yet</h2>
            <p className="text-offwhite/70 mb-6 text-center max-w-md">
              You haven't placed any orders yet. Browse our collection and find your perfect memorabilia.
            </p>
            <Link
              href="/customer/shop"
              className="bg-gold-soft hover:bg-gold-deep text-jetblack px-6 py-2 rounded-md font-semibold transition-colors"
            >
              Shop Now
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-offwhite">My Orders</h1>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="processing">
          <div className="space-y-6">
            {orders
              .filter((order) => order.orderStatus === "processing" || order.orderStatus === "pending")
              .map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="shipped">
          <div className="space-y-6">
            {orders
              .filter((order) => order.orderStatus === "shipped")
              .map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="delivered">
          <div className="space-y-6">
            {orders
              .filter((order) => order.orderStatus === "delivered")
              .map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "processing":
        return <Package className="h-5 w-5 text-blue-500" />
      case "shipped":
        return <Truck className="h-5 w-5 text-purple-500" />
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "cancelled":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      case "processing":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "shipped":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case "delivered":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  // Format date from Firestore timestamp
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"

    try {
      // Handle Firestore timestamp
      if (timestamp && typeof timestamp.toDate === "function") {
        return new Date(timestamp.toDate()).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }

      // Handle Date objects
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }

      // Handle ISO strings or timestamps
      return new Date(timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error, timestamp)
      return "Invalid Date"
    }
  }

  return (
    <Card className="border-gold/30 bg-charcoal overflow-hidden">
      <CardHeader className="bg-jetblack/50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-offwhite">Order #{order.id?.substring(0, 8)}</CardTitle>
          <CardDescription className="text-offwhite/70">Placed on {formatDate(order.createdAt)}</CardDescription>
        </div>
        <Badge className={`${getStatusColor(order.orderStatus)} ml-auto`}>
          <span className="flex items-center">
            {getStatusIcon(order.orderStatus)}
            <span className="ml-1 capitalize">{order.orderStatus}</span>
          </span>
        </Badge>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Order Items */}
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-md bg-gray-800">
                  <Image
                    src={item.imageUrl || "/placeholder.svg?height=80&width=80&query=product"}
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-offwhite">{item.productName}</h4>
                  <p className="text-sm text-offwhite/70">
                    Qty: {item.quantity} × ${formatPrice(item.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-offwhite">${formatPrice(item.quantity * item.price)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="border-t border-gold/20 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-offwhite/70">Subtotal</span>
              <span className="text-offwhite">${formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-offwhite/70">Shipping</span>
              <span className="text-offwhite">${formatPrice(order.shipping)}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-offwhite/70">Tax</span>
              <span className="text-offwhite">${formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between font-medium mt-4 pt-4 border-t border-gold/20">
              <span className="text-offwhite">Total</span>
              <span className="text-gold">${formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="border-t border-gold/20 pt-4">
            <h4 className="font-medium text-offwhite mb-2">Shipping Information</h4>
            <p className="text-sm text-offwhite/70">
              {order.customerInfo?.name || "N/A"}
              <br />
              {order.customerInfo?.address?.line1 || "N/A"}
              <br />
              {order.customerInfo?.address?.line2 && (
                <>
                  {order.customerInfo.address.line2}
                  <br />
                </>
              )}
              {order.customerInfo?.address?.city || "N/A"}, {order.customerInfo?.address?.state || "N/A"}{" "}
              {order.customerInfo?.address?.postalCode || "N/A"}
              <br />
              {order.customerInfo?.address?.country || "N/A"}
            </p>
          </div>

          {/* Tracking Information */}
          {order.trackingNumber && (
            <div className="border-t border-gold/20 pt-4">
              <h4 className="font-medium text-offwhite mb-2">Tracking Information</h4>
              <p className="text-sm text-offwhite/70">
                Tracking Number: {order.trackingNumber}
                <br />
                Shipping Method: {order.shippingMethod || "Standard Shipping"}
              </p>
            </div>
          )}

          {/* Order Timeline */}
          {order.history && order.history.length > 0 && (
            <div className="border-t border-gold/20 pt-4">
              <h4 className="font-medium text-offwhite mb-2">Order Timeline</h4>
              <div className="space-y-3">
                {order.history.map((event, index) => (
                  <div key={index} className="flex items-start">
                    <div className="mr-3 mt-1">{getStatusIcon(event.status)}</div>
                    <div>
                      <p className="text-sm font-medium text-offwhite capitalize">{event.status}</p>
                      <p className="text-xs text-offwhite/70">{formatDate(event.timestamp)}</p>
                      {event.comment && <p className="text-xs text-offwhite/70 mt-1">{event.comment}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
