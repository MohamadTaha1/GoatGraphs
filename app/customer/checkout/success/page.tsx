"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, ShoppingBag } from "lucide-react"
import { getOrder } from "@/hooks/use-orders"
import { formatPrice } from "@/lib/utils"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const orderId = searchParams.get("orderId")

  useEffect(() => {
    if (!orderId) {
      router.push("/customer/shop")
      return
    }

    async function fetchOrder() {
      try {
        const orderData = await getOrder(orderId)
        if (orderData) {
          setOrder(orderData)
        } else {
          // If order not found, redirect to shop
          router.push("/customer/shop")
        }
      } catch (error) {
        console.error("Error fetching order:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, router])

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-offwhite">Loading your order details...</p>
      </div>
    )
  }

  if (!order) {
    return null // Handled by redirect
  }

  // Format date from Firestore timestamp
  const formatDate = (timestamp) => {
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

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/20 mb-4">
            <CheckCircle className="h-8 w-8 text-gold" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2 bg-gold-gradient bg-clip-text text-transparent">
            Order Confirmed!
          </h1>
          <p className="text-offwhite/80">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
        </div>

        <Card className="border-gold/30 bg-charcoal mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h2 className="text-xl font-display font-bold text-gold">Order #{order.id.slice(0, 8)}</h2>
                  <p className="text-sm text-offwhite/70">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <div className="mt-2 md:mt-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-500">
                    {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                  </span>
                </div>
              </div>

              <Separator className="bg-gold/20" />

              <div>
                <h3 className="font-display font-bold text-offwhite mb-2">Order Details</h3>
                <div className="space-y-3">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-offwhite">
                          {item.quantity} x {item.productName}
                        </p>
                      </div>
                      <p className="text-gold font-display font-bold">${formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-gold/20" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-display font-bold text-offwhite mb-2">Shipping Address</h3>
                  <p className="text-offwhite/80">{order.customerInfo.name}</p>
                  <p className="text-offwhite/80">{order.customerInfo.address?.line1}</p>
                  {order.customerInfo.address?.line2 && (
                    <p className="text-offwhite/80">{order.customerInfo.address.line2}</p>
                  )}
                  <p className="text-offwhite/80">
                    {order.customerInfo.address?.city}, {order.customerInfo.address?.state}{" "}
                    {order.customerInfo.address?.postalCode}
                  </p>
                  <p className="text-offwhite/80">{order.customerInfo.address?.country}</p>
                </div>
                <div>
                  <h3 className="font-display font-bold text-offwhite mb-2">Payment Information</h3>
                  <p className="text-offwhite/80">
                    <span className="text-offwhite/60">Method:</span> {order.paymentMethod}
                  </p>
                  <p className="text-offwhite/80">
                    <span className="text-offwhite/60">Status:</span>{" "}
                    <span className="text-green-500">
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </p>
                </div>
              </div>

              <Separator className="bg-gold/20" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-offwhite/70">Subtotal</span>
                  <span className="text-offwhite">${formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-offwhite/70">Shipping</span>
                  <span className="text-offwhite">${formatPrice(order.shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-offwhite/70">Tax</span>
                  <span className="text-offwhite">${formatPrice(order.tax)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-offwhite">Total</span>
                  <span className="text-gold">${formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push("/customer/orders")}
            className="bg-gold-gradient hover:bg-gold-shine text-black"
          >
            View My Orders
          </Button>
          <Button
            onClick={() => router.push("/customer/shop")}
            variant="outline"
            className="border-gold text-gold hover:bg-gold/10"
          >
            Continue Shopping <ShoppingBag className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
