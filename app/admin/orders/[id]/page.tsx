"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  AlertCircle,
  Check,
  Printer,
  ClipboardEdit,
  Loader2,
  MapPin,
  Phone,
  Mail,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getOrder, type Order } from "@/hooks/use-orders"
import { formatPrice } from "@/lib/utils"
import { updateDoc, doc } from "firebase/firestore"
import { getFirestoreInstance } from "@/lib/firebase/firestore"

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [newStatus, setNewStatus] = useState<string>("")
  const [statusComment, setStatusComment] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true)
        const orderData = await getOrder(params.id)

        if (orderData) {
          setOrder(orderData)
          setNewStatus(orderData.orderStatus)
        } else {
          setError(new Error("Order not found"))
        }
      } catch (err) {
        console.error("Error loading order:", err)
        setError(err instanceof Error ? err : new Error("Failed to load order"))
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [params.id])

  const updateOrderStatus = async () => {
    if (!order || !statusComment) {
      toast({
        title: "Comment required",
        description: "Please add a comment for the status update.",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)

    try {
      const db = getFirestoreInstance()
      if (!db) {
        throw new Error("Firestore instance is null")
      }

      // Create new history entry
      const newHistoryEntry = {
        status: newStatus,
        timestamp: new Date(),
        comment: statusComment,
      }

      // Update the order in Firestore
      const orderRef = doc(db, "orders", params.id)

      await updateDoc(orderRef, {
        orderStatus: newStatus,
        updatedAt: new Date(),
        history: [newHistoryEntry, ...order.history],
      })

      // Update local state
      setOrder({
        ...order,
        orderStatus: newStatus,
        history: [newHistoryEntry, ...order.history],
      })

      setStatusComment("")

      toast({
        title: "Order updated",
        description: `Order status changed to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Update failed",
        description: "Failed to update the order status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500 mr-2" />
        <span>Loading order details...</span>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-8 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-red-500 mb-2">Error Loading Order</h3>
        <p className="text-gray-200 mb-4">{error?.message || "The requested order could not be found."}</p>
        <Button
          variant="outline"
          className="border-gold-500 text-gold-500 hover:bg-gold-500/10"
          onClick={() => router.push("/admin/orders")}
        >
          Back to Orders
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="outline"
            size="sm"
            className="mb-4 border-gold-700 text-gold-500"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          <h1 className="text-3xl font-display font-bold mb-2 bg-gold-gradient bg-clip-text text-transparent">
            Order {order.numericOrderId || order.id}
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-gray-400 font-body">{formatDate(order.createdAt)}</p>
            <Badge className={`font-body ${getStatusColor(order.orderStatus)}`}>
              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="border-gold-700 text-gold-500">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button className="bg-gold-gradient hover:bg-gold-shine text-black">
            <ClipboardEdit className="mr-2 h-4 w-4" />
            Edit Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-gold-700">
            <CardHeader>
              <CardTitle className="text-gold-500 font-display">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-start gap-4 border-b border-gold-700/50 pb-4">
                    <div className="h-16 w-16 bg-black-300 rounded flex items-center justify-center overflow-hidden relative">
                      <Image
                        src={item.imageUrl || "/placeholder.svg?height=64&width=64"}
                        alt={item.productName}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold">{item.productName}</h3>
                      <p className="text-sm text-gray-400 font-body">Product ID: {item.productId}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold">${formatPrice(item.price)}</p>
                      <p className="text-sm text-gray-400 font-body">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-body">Subtotal</span>
                  <span className="font-display">${formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body">Shipping</span>
                  <span className="font-display">
                    {order.shipping === 0 ? "Free" : `$${formatPrice(order.shipping)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body">Tax</span>
                  <span className="font-display">${formatPrice(order.tax)}</span>
                </div>
                <Separator className="my-2 bg-gold-700/50" />
                <div className="flex justify-between font-bold">
                  <span className="font-display">Total</span>
                  <span className="font-display">${formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gold-700">
            <CardHeader>
              <CardTitle className="text-gold-500 font-display">Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.history.map((entry, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${getStatusColor(entry.status)}`}
                      >
                        {entry.status === "delivered" && <Check className="h-4 w-4" />}
                        {entry.status === "shipped" && <Truck className="h-4 w-4" />}
                        {entry.status === "processing" && <Package className="h-4 w-4" />}
                        {entry.status === "pending" && <CreditCard className="h-4 w-4" />}
                        {entry.status === "cancelled" && <AlertCircle className="h-4 w-4" />}
                      </div>
                      {index < order.history.length - 1 && <div className="h-12 w-0.5 bg-gold-700/30 my-1" />}
                    </div>
                    <div>
                      <p className="font-display font-bold">
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </p>
                      <p className="text-sm text-gray-400 font-body">{formatDate(entry.timestamp)}</p>
                      <p className="mt-1 font-body">{entry.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-gold-700">
            <CardHeader>
              <CardTitle className="text-gold-500 font-display">Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400 font-body">Name</p>
                  <p className="font-display">{order.customerInfo.name}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-400 font-body">Email</p>
                    <p className="font-display">{order.customerInfo.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-400 font-body">Phone</p>
                    <p className="font-display">{order.customerInfo.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-400 font-body">Shipping Address</p>
                    <p className="font-display">{order.customerInfo.address.line1}</p>
                    {order.customerInfo.address.line2 && (
                      <p className="font-display">{order.customerInfo.address.line2}</p>
                    )}
                    <p className="font-display">
                      {order.customerInfo.address.city}, {order.customerInfo.address.state || ""}{" "}
                      {order.customerInfo.address.postalCode}
                    </p>
                    <p className="font-display">{order.customerInfo.address.country}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gold-700">
            <CardHeader>
              <CardTitle className="text-gold-500 font-display">Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400 font-body">Payment Method</p>
                  <p className="font-display">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-body">Payment Status</p>
                  <Badge
                    className={`bg-${order.paymentStatus === "paid" ? "green" : "orange"}-500/20 text-${order.paymentStatus === "paid" ? "green" : "orange"}-500 hover:bg-${order.paymentStatus === "paid" ? "green" : "orange"}-500/30`}
                  >
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-body">Total Amount</p>
                  <p className="font-display font-bold">${formatPrice(order.total)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gold-700">
            <CardHeader>
              <CardTitle className="text-gold-500 font-display">Shipping Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400 font-body">Shipping Method</p>
                  <p className="font-display">{order.shippingMethod || "Standard"}</p>
                </div>
                {order.trackingNumber && (
                  <div>
                    <p className="text-sm text-gray-400 font-body">Tracking Number</p>
                    <p className="font-display">{order.trackingNumber}</p>
                  </div>
                )}
                {order.notes && (
                  <div>
                    <p className="text-sm text-gray-400 font-body">Order Notes</p>
                    <p className="font-display">{order.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-gold-700">
            <CardHeader>
              <CardTitle className="text-gold-500 font-display">Update Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="font-body">
                    Status
                  </Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger id="status" className="border-gold-700">
                      <SelectValue placeholder="Select order status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment" className="font-body">
                    Comment
                  </Label>
                  <Textarea
                    id="comment"
                    placeholder="Add a comment about this status update"
                    value={statusComment}
                    onChange={(e) => setStatusComment(e.target.value)}
                    className="min-h-[100px] border-gold-700"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-gold-gradient hover:bg-gold-shine text-black"
                onClick={updateOrderStatus}
                disabled={isUpdating || newStatus === order.orderStatus || !statusComment}
              >
                {isUpdating ? "Updating..." : "Update Status"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
