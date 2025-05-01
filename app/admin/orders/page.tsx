"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Eye, Download, Search, Loader2, AlertCircle, Info } from "lucide-react"
import Link from "next/link"
import { useOrders } from "@/hooks/use-orders"
import { formatPrice } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 8
  const { toast } = useToast()

  // Fetch orders using our custom hook
  const { orders, loading, error, firestoreAvailable, setOrders } = useOrders(statusFilter)

  // Filter orders based on search term
  const filteredOrders = orders.filter((order) => {
    return (
      !searchTerm ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)

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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
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
      const { doc, updateDoc, Timestamp } = await import("firebase/firestore")
      const { getFirestoreInstance } = await import("@/lib/firebase/firestore")

      const db = getFirestoreInstance()
      if (!db) {
        throw new Error("Firestore instance is null")
      }

      // Create a new history entry
      const historyEntry = {
        status: newStatus,
        timestamp: Timestamp.now(),
        comment: `Status updated to ${newStatus} by admin`,
      }

      // Update the order in Firestore
      const orderRef = doc(db, "orders", orderId)
      await updateDoc(orderRef, {
        orderStatus: newStatus,
        updatedAt: Timestamp.now(),
        // Add the new history entry to the beginning of the history array
        history: [historyEntry],
      })

      // Update the local state
      setOrders(orders.map((order) => (order.id === orderId ? { ...order, orderStatus: newStatus } : order)))

      toast({
        title: "Status updated",
        description: `Order status changed to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Update failed",
        description: "Failed to update the order status. Please try again.",
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
        <p className="text-gray-400 font-body">Manage and track customer orders</p>
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
          <CardTitle className="text-gold-500 font-display">Orders List</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="border-gold-700 text-gold-500">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID or customer..."
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
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border border-gold-700">
            <Table>
              <TableHeader>
                <TableRow className="font-body border-gold-700/50">
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage).map((order) => (
                    <TableRow key={order.id} className="border-gold-700/50">
                      <TableCell className="font-display">{order.id}</TableCell>
                      <TableCell className="font-body">
                        <div>
                          <p>{order.customerInfo.name}</p>
                          <p className="text-xs text-gray-400">{order.customerInfo.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-body">{formatDate(order.createdAt)}</TableCell>
                      <TableCell className="font-body">
                        {order.items.length} {order.items.length === 1 ? "item" : "items"}
                      </TableCell>
                      <TableCell className="font-body">${formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <Select
                          defaultValue={order.orderStatus}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                          disabled={!firestoreAvailable}
                        >
                          <SelectTrigger className={`w-[130px] ${getStatusColor(order.orderStatus)} border-none`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          asChild
                          size="icon"
                          variant="ghost"
                          className="hover:bg-gold-500/10 hover:text-gold-500"
                        >
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
                    <TableCell colSpan={7} className="h-24 text-center">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

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
