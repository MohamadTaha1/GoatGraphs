"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useVideoOrders, type VideoOrder } from "@/hooks/use-video-orders"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { uploadFile } from "@/lib/firebase/storage"
import { format } from "date-fns"

export default function VideoOrdersPage() {
  const { orders, loading, fetchAllVideoOrders, updateVideoOrderStatus } = useVideoOrders()
  const [selectedOrder, setSelectedOrder] = useState<VideoOrder | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("pending")
  const { toast } = useToast()

  useEffect(() => {
    fetchAllVideoOrders()
  }, [])

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true
    return order.status === activeTab
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0])
    }
  }

  const handleUploadAndComplete = async () => {
    if (!selectedOrder || !videoFile) return

    setUploadLoading(true)
    try {
      // Upload video to Firebase Storage
      const videoUrl = await uploadFile(videoFile, `videos/${selectedOrder.id}/${videoFile.name}`)

      // Update order status with video URL
      await updateVideoOrderStatus(selectedOrder.id, "completed", videoUrl)

      toast({
        title: "Success",
        description: "Video uploaded and order marked as completed",
      })

      // Refresh orders
      fetchAllVideoOrders()
      setSelectedOrder(null)
      setVideoFile(null)
    } catch (error) {
      console.error("Error uploading video:", error)
      toast({
        title: "Error",
        description: "Failed to upload video",
        variant: "destructive",
      })
    } finally {
      setUploadLoading(false)
    }
  }

  const handleRejectOrder = async (orderId: string) => {
    try {
      await updateVideoOrderStatus(orderId, "rejected")
      toast({
        title: "Order Rejected",
        description: "The video order has been rejected",
      })
      fetchAllVideoOrders()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject order",
        variant: "destructive",
      })
    }
  }

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

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        )
      case "paid":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Paid
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Failed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Video Orders</h1>
        <p>Loading orders...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Video Orders</h1>

      <Tabs defaultValue="pending" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All Orders</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredOrders.length === 0 ? (
            <p>No {activeTab} orders found.</p>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                    <div className="flex gap-2">
                      {getStatusBadge(order.status)}
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Player Details</h3>
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
                          <p className="text-sm text-gray-500">Price: ${order.price}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Request Details</h3>
                      <p>
                        <span className="font-medium">Recipient:</span> {order.recipientName}
                      </p>
                      <p>
                        <span className="font-medium">Occasion:</span> {order.occasion}
                      </p>
                      <p>
                        <span className="font-medium">Message:</span> {order.message}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Order Info</h3>
                      <p>
                        <span className="font-medium">Date:</span> {format(order.createdAt.toDate(), "PPP")}
                      </p>
                      <p>
                        <span className="font-medium">Payment:</span> {order.paymentMethod}
                      </p>

                      {order.status === "pending" && order.paymentStatus === "paid" && (
                        <div className="mt-4 flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" onClick={() => setSelectedOrder(order)}>
                                Upload Video
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Upload Completed Video</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="video">Video File</Label>
                                  <Input id="video" type="file" accept="video/*" onChange={handleFileChange} />
                                </div>

                                <div className="pt-2">
                                  <Button
                                    onClick={handleUploadAndComplete}
                                    disabled={!videoFile || uploadLoading}
                                    className="w-full"
                                  >
                                    {uploadLoading ? "Uploading..." : "Upload and Complete Order"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button size="sm" variant="outline" onClick={() => handleRejectOrder(order.id)}>
                            Reject
                          </Button>
                        </div>
                      )}

                      {order.status === "completed" && order.videoUrl && (
                        <div className="mt-4">
                          <a
                            href={order.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Completed Video
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
