"use client"

import { useEffect } from "react"
import { useVideoOrders } from "@/hooks/use-video-orders"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export default function MyVideoOrdersPage() {
  const { orders, loading, fetchUserVideoOrders } = useVideoOrders()

  useEffect(() => {
    fetchUserVideoOrders()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">My Video Orders</h1>
        <p>Loading your orders...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">My Video Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No Video Orders Yet</h2>
          <p className="text-gray-600 mb-6">You haven't ordered any personalized videos yet.</p>
          <a
            href="/customer/videos"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Available Videos
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Video from {order.playerName}</CardTitle>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {order.playerImage && (
                        <img
                          src={order.playerImage || "/placeholder.svg"}
                          alt={order.playerName}
                          className="w-16 h-16 object-cover rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium">{order.playerName}</p>
                        <p className="text-sm text-gray-500">Ordered on {format(order.createdAt.toDate(), "PPP")}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold">Your Request</h3>
                      <p>
                        <span className="font-medium">For:</span> {order.recipientName}
                      </p>
                      <p>
                        <span className="font-medium">Occasion:</span> {order.occasion}
                      </p>
                      <p>
                        <span className="font-medium">Message:</span> {order.message}
                      </p>
                    </div>
                  </div>

                  <div>
                    {order.status === "completed" && order.videoUrl ? (
                      <div>
                        <h3 className="font-semibold mb-3">Your Video</h3>
                        <video controls className="w-full rounded-lg" poster={order.playerImage}>
                          <source src={order.videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ) : order.status === "pending" ? (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Order in Progress</h3>
                        <p>Your video is being created. This usually takes 3-5 business days.</p>
                      </div>
                    ) : order.status === "rejected" ? (
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Order Rejected</h3>
                        <p>
                          Unfortunately, we couldn't complete your video request. Please contact customer support for
                          more information.
                        </p>
                      </div>
                    ) : null}

                    <div className="mt-4">
                      <p className="font-medium">Order Details</p>
                      <p>Order ID: #{order.id.slice(0, 8)}</p>
                      <p>Price: ${order.price}</p>
                      <p>Payment: {order.paymentMethod}</p>
                    </div>
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
