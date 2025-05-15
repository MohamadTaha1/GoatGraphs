"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  Search,
  Loader2,
  AlertCircle,
  Info,
  ShoppingBag,
  Video,
} from "lucide-react"
import Link from "next/link"
import { useOrders, updateOrder } from "@/hooks/use-orders"
import { formatPrice } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [orderTypeTab, setOrderTypeTab] = useState<"all" | "product" | "video">("all")
  const ordersPerPage = 8
  const { toast } = useToast()

  // Fetch orders using our custom hook
  const { orders, loading, error, firestoreAvailable, setOrders } = useOrders({
    statusFilter,
    orderType: orderTypeTab,
  })

  // Filter orders based on search term
  const filteredOrders = orders.filter((order) => {
    return (
      !searchTerm ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.orderType === "video" &&
        "videoRequest" in order &&
        order.videoRequest.player.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
      case "processing":
      case "accepted":
        return "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30"
      case "shipped":
        return "bg-violet-500/20 text-violet-500 hover:bg-violet-500/30"
      case "delivered":
      case "completed":
        return "bg-green-500/20 text-green-500 hover:bg-green-500/30"
      case "cancelled":
      case "rejected":
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

  const handleStatusChange = async (orderId: string, newStatus: string, orderType: "product" | "video") => {
    try {
      // Check if Firestore is available
      if (!firestoreAvailable) {
        toast({
          title: "Offline Mode",
          description: "Status updates are not available in offline mode.",
          variant: "destructive",
        })
        return
      }

      // Dynamically import Firestore functions
      const { Timestamp } = await import("firebase/firestore")

      // Create a new history entry
      const historyEntry = {
        status: newStatus,
        timestamp: Timestamp.now(),
        comment: `Status updated to ${newStatus} by admin`,
      }

      // Update the order using our updateOrder function
      const success = await updateOrder(orderId, {
        orderStatus: newStatus,
        // Add the new history entry to the beginning of the history array
        history: [historyEntry],
      })

      if (success) {
        // Update the local state
        setOrders(
          orders.map((order) => {
            if (order.id === orderId) {
              // For video orders, also update the videoRequest status
              if (order.orderType === "video" && "videoRequest" in order) {
                return {
                  ...order,
                  orderStatus: newStatus,
                  videoRequest: {
                    ...order.videoRequest,
                    status: newStatus,
                  },
                }
              }
              return { ...order, orderStatus: newStatus }
            }
            return order
          }),
        )

        toast({
          title: "Status updated",
          description: `${orderType === "video" ? "Video request" : "Order"} status changed to ${newStatus}`,
        })
      } else {
        throw new Error("Failed to update order")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Update failed",
        description: "Failed to update the status. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500 mr-2" />
        <span>Loading orders...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-8 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-red-500 mb-2">Error Loading Orders</h3>
        <p className="text-gray-200 mb-4">{error.message || "There was a problem loading the orders."}</p>
        <Button
          variant="outline"
          className="border-gold-500 text-gold-500 hover:bg-gold-500/10"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2 bg-gold-gradient bg-clip-text text-transparent">Orders</h1>
        <p className="text-gray-400 font-body">Manage and track customer orders and video requests</p>
      </div>

      {firestoreAvailable === false && (
        <Alert variant="warning" className="bg-amber-500/10 border-amber-500/50 mb-4">
          <Info className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-500">Offline Mode</AlertTitle>
          <AlertDescription>
            You are viewing demo data in offline mode. Firestore is not available. Changes will not be saved.
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-gold-700">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-5">
          <CardTitle className="text-gold-500 font-display">Orders & Requests</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="border-gold-700 text-gold-500">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="all"
            className="mb-6"
            onValueChange={(value) => setOrderTypeTab(value as "all" | "product" | "video")}
          >
            <TabsList className="grid w-full grid-cols-3 max-w-md mb-4 bg-charcoal border border-gold/20">
              <TabsTrigger
                value="all"
                className="text-gold data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
              >
                All Orders
              </TabsTrigger>
              <TabsTrigger
                value="product"
                className="text-gold data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
              >
                Products
              </TabsTrigger>
              <TabsTrigger
                value="video"
                className="text-gold data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
              >
                Videos
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order ID, customer, or player..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 border-gold-700"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] border-gold-700">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="all" className="mt-0">
              <OrdersTable
                orders={filteredOrders}
                currentPage={currentPage}
                ordersPerPage={ordersPerPage}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
                handleStatusChange={handleStatusChange}
                firestoreAvailable={firestoreAvailable}
              />
            </TabsContent>

            <TabsContent value="product" className="mt-0">
              <OrdersTable
                orders={filteredOrders.filter((order) => order.orderType === "product")}
                currentPage={currentPage}
                ordersPerPage={ordersPerPage}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
                handleStatusChange={handleStatusChange}
                firestoreAvailable={firestoreAvailable}
              />
            </TabsContent>

            <TabsContent value="video" className="mt-0">
              <OrdersTable
                orders={filteredOrders.filter((order) => order.orderType === "video")}
                currentPage={currentPage}
                ordersPerPage={ordersPerPage}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
                handleStatusChange={handleStatusChange}
                firestoreAvailable={firestoreAvailable}
              />
            </TabsContent>
          </Tabs>

          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-gray-400 font-body">
                Showing {Math.min(filteredOrders.length, (currentPage - 1) * ordersPerPage + 1)}-
                {Math.min(currentPage * ordersPerPage, filteredOrders.length)} of {filteredOrders.length} orders
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gold-700 text-gold-500"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-400 font-body">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gold-700 text-gold-500"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function OrdersTable({
  orders,
  currentPage,
  ordersPerPage,
  getStatusColor,
  formatDate,
  handleStatusChange,
  firestoreAvailable,
}) {
  return (
    <div className="rounded-md border border-gold-700">
      <Table>
        <TableHeader>
          <TableRow className="font-body border-gold-700/50">
            <TableHead>Order ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length > 0 ? (
            orders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage).map((order) => (
              <TableRow key={order.id} className="border-gold-700/50">
                <TableCell className="font-display">{order.id.slice(0, 10)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-gold/30">
                    {order.orderType === "product" ? (
                      <ShoppingBag className="h-3 w-3 mr-1" />
                    ) : (
                      <Video className="h-3 w-3 mr-1" />
                    )}
                    {order.orderType === "product" ? "Product" : "Video"}
                  </Badge>
                </TableCell>
                <TableCell className="font-body">
                  <div>
                    <p>{order.customerInfo.name}</p>
                    <p className="text-xs text-gray-400">{order.customerInfo.email}</p>
                  </div>
                </TableCell>
                <TableCell className="font-body">{formatDate(order.createdAt)}</TableCell>
                <TableCell className="font-body">
                  {order.orderType === "product" ? (
                    <span>
                      {order.items?.length || 0} {order.items?.length === 1 ? "item" : "items"}
                    </span>
                  ) : (
                    <span>{order.videoRequest?.player || "Unknown player"}</span>
                  )}
                </TableCell>
                <TableCell className="font-body">${formatPrice(order.total)}</TableCell>
                <TableCell>
                  <Select
                    defaultValue={order.orderStatus}
                    onValueChange={(value) => handleStatusChange(order.id, value, order.orderType)}
                    disabled={!firestoreAvailable}
                  >
                    <SelectTrigger className={`w-[130px] ${getStatusColor(order.orderStatus)} border-none`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {order.orderType === "product" ? (
                        <>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild size="icon" variant="ghost" className="hover:bg-gold-500/10 hover:text-gold-500">
                    <Link href={`/admin/orders/${order.id}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
