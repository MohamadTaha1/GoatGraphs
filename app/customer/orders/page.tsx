"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Package, Truck, CheckCircle2, AlertCircle, Loader2, ShoppingBag } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { formatPrice } from "@/lib/utils"

// Define the Order type
interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  imageUrl: string
}

interface Order {
  id: string
  numericOrderId?: number
  userId: string
  customerInfo: {
    name: string
    email: string
    phone: string
    address: {
      line1: string
      city: string
      postalCode: string
      country: string
    }
  }
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  createdAt: any
  updatedAt: any
}

export default function CustomerOrdersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    async function fetchOrders() {
      if (authLoading) return

      if (!user) {
        console.log("No user logged in, redirecting to login")
        router.push("/login")
        return
      }

      try {
        console.log("Fetching orders for user:", user.uid)
        setLoading(true)
        setError(null)

        const db = getFirestoreInstance()
        if (!db) {
          console.error("Firestore instance is null")
          setError("Database connection error")
          setLoading(false)
          return
        }

        // Query orders directly by userId
        const ordersQuery = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
        )

        console.log("Executing Firestore query for user:", user.uid)
        const querySnapshot = await getDocs(ordersQuery)

        if (querySnapshot.empty) {
          console.log("No orders found for user:", user.uid)
        } else {
          console.log(`Found ${querySnapshot.size} orders for user:`, user.uid)
        }

        const ordersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[]

        console.log("Orders data:", ordersData)
        setOrders(ordersData)
      } catch (err) {
        console.error("Error fetching orders:", err)
        setError("Failed to load your orders. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, authLoading, router])

  // Filter orders based on active tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true
    return order.orderStatus === activeTab
  })

  // Format date from Firestore timestamp
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

  // Get status color for badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
      case "processing":
        return "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30"
      case "shipped":
        return "bg-violet-500/20 text-violet-500 hover:bg-violet-500/30"
      case "delivered":
        return "bg-green-500/20 text-green-500 hover:bg-green-500/30"
      case "cancelled":
        return "bg-red-500/20 text-red-500 hover:bg-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-500 hover:bg-gray-500/30"
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Package className="h-5 w-5" />
      case "processing":
        return <Package className="h-5 w-5" />
      case "shipped":
        return <Truck className="h-5 w-5" />
      case "delivered":
        return <CheckCircle2 className="h-5 w-5" />
      case "cancelled":
        return <AlertCircle className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500 mr-2" />
        <span>Checking authentication...</span>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500 mr-2" />
        <span>Loading your orders...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-display font-bold mb-8 bg-gold-gradient bg-clip-text text-transparent">
          My Orders
        </h1>
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-8 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-500 mb-2">Error Loading Orders</h3>
          <p className="text-gray-200 mb-4">{error}</p>
          <Button
            variant="outline"
            className="border-gold-500 text-gold-500 hover:bg-gold-500/10"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-display font-bold mb-8 bg-gold-gradient bg-clip-text text-transparent">My Orders</h1>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="bg-black border border-gold-700">
          <TabsTrigger
            value="all"
            className="text-gold-500 data-[state=active]:bg-gold-gradient data-[state=active]:text-black"
          >
            All Orders
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="text-gold-500 data-[state=active]:bg-gold-gradient data-[state=active]:text-black"
          >
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="processing"
            className="text-gold-500 data-[state=active]:bg-gold-gradient data-[state=active]:text-black"
          >
            Processing
          </TabsTrigger>
          <TabsTrigger
            value="shipped"
            className="text-gold-500 data-[state=active]:bg-gold-gradient data-[state=active]:text-black"
          >
            Shipped
          </TabsTrigger>
          <TabsTrigger
            value="delivered"
            className="text-gold-500 data-[state=active]:bg-gold-gradient data-[state=active]:text-black"
          >
            Delivered
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 rounded-full bg-gold-500/20 flex items-center justify-center mb-4">
            <ShoppingBag className="h-8 w-8 text-gold-500" />
          </div>
          <h2 className="text-xl font-display font-bold mb-2">No Orders Found</h2>
          <p className="text-gray-400 mb-6 font-body">
            {activeTab === "all" ? "You haven't placed any orders yet." : `You don't have any ${activeTab} orders.`}
          </p>
          <Button asChild className="bg-gold-gradient hover:bg-gold-shine text-black font-body">
            <Link href="/customer/shop">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="border-gold-700">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="font-display text-gold-500">
                      Order #{order.numericOrderId || order.id.substring(0, 8)}
                    </CardTitle>
                    <p className="text-gray-400 text-sm font-body">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                  <Badge className={`font-body ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <h3 className="font-display font-bold mb-2">Items</h3>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-black-300 rounded flex items-center justify-center overflow-hidden relative">
                              <Image
                                src={item.imageUrl || "/placeholder.svg?height=48&width=48"}
                                alt={item.productName}
                                fill
                                className="object-contain"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-display font-bold text-sm">{item.productName}</p>
                              <p className="text-xs text-gray-400 font-body">
                                Qty: {item.quantity} × ${formatPrice(item.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="sm:w-1/3">
                      <h3 className="font-display font-bold mb-2">Order Summary</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400 font-body">Subtotal</span>
                          <span className="font-display">${formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400 font-body">Shipping</span>
                          <span className="font-display">
                            {order.shipping === 0 ? "Free" : `$${formatPrice(order.shipping)}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400 font-body">Tax</span>
                          <span className="font-display">${formatPrice(order.tax)}</span>
                        </div>
                        <Separator className="my-2 bg-gold-700/50" />
                        <div className="flex justify-between font-bold">
                          <span className="font-display">Total</span>
                          <span className="font-display">${formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${getStatusColor(order.orderStatus)}`}
                      >
                        {getStatusIcon(order.orderStatus)}
                      </div>
                      <div>
                        <p className="font-display font-bold text-sm">
                          {order.orderStatus === "pending" && "Order Received"}
                          {order.orderStatus === "processing" && "Processing Order"}
                          {order.orderStatus === "shipped" && "Order Shipped"}
                          {order.orderStatus === "delivered" && "Order Delivered"}
                          {order.orderStatus === "cancelled" && "Order Cancelled"}
                        </p>
                        <p className="text-xs text-gray-400 font-body">
                          {order.orderStatus === "pending" && "We've received your order and are processing it."}
                          {order.orderStatus === "processing" && "Your order is being prepared for shipping."}
                          {order.orderStatus === "shipped" && "Your order is on its way to you."}
                          {order.orderStatus === "delivered" && "Your order has been delivered."}
                          {order.orderStatus === "cancelled" && "This order has been cancelled."}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gold-700 text-gold-500"
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
      )}
    </div>
  )
}
