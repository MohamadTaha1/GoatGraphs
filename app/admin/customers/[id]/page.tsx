"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Loader2, Mail, Phone, MapPin, Calendar, ShoppingBag, User, Check, X } from "lucide-react"
import Link from "next/link"
import { getUser } from "@/hooks/use-users"
import { formatPrice } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { getFirestoreInstance } from "@/lib/firebase/firestore"

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const [customer, setCustomer] = useState<any>(null)
  const [customerOrders, setCustomerOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadCustomerData() {
      try {
        setLoading(true)

        // Fetch customer data
        const userData = await getUser(params.id)

        if (userData) {
          setCustomer(userData)

          // Fetch customer orders
          try {
            const db = getFirestoreInstance()
            if (db) {
              console.log(`Fetching orders for customer ID: ${params.id}`)
              const ordersQuery = query(
                collection(db, "orders"),
                where("userId", "==", params.id),
                orderBy("createdAt", "desc"),
                limit(10),
              )

              const ordersSnapshot = await getDocs(ordersQuery)
              console.log(`Found ${ordersSnapshot.docs.length} orders for customer`)

              const ordersData = ordersSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))

              setCustomerOrders(ordersData)
            }
          } catch (orderError) {
            console.error("Error fetching customer orders:", orderError)
            setError(
              new Error(
                `Failed to load customer orders: ${orderError instanceof Error ? orderError.message : String(orderError)}`,
              ),
            )
            // Continue with customer data even if orders fail
          }
        } else {
          setError(new Error("Customer not found"))
        }
      } catch (err) {
        console.error("Error loading customer:", err)
        setError(err instanceof Error ? err : new Error("Failed to load customer"))
      } finally {
        setLoading(false)
      }
    }

    loadCustomerData()
  }, [params.id])

  const getInitials = (name: string) => {
    if (!name) return "UN"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const formatDate = (dateStr: any) => {
    if (!dateStr) return "N/A"

    try {
      // Handle Firestore Timestamp
      if (dateStr.toDate) {
        return dateStr.toDate().toLocaleDateString()
      }

      // Handle string date
      return new Date(dateStr).toLocaleDateString()
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  const getStatusColor = (status?: "active" | "inactive") => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-500 hover:bg-green-500/30"
      case "inactive":
        return "bg-gray-500/20 text-gray-500 hover:bg-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-500 hover:bg-gray-500/30"
    }
  }

  const getOrderStatusColor = (status: string) => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <span className="ml-2 text-offwhite">Loading customer details...</span>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="text-center py-12 bg-red-900/20 rounded-lg border border-red-900/50 p-8">
        <h3 className="text-xl font-display font-bold text-red-500 mb-2">Customer Not Found</h3>
        <p className="text-offwhite/70 font-body mb-4">
          {error?.message || "The requested customer could not be found."}
        </p>
        <Button variant="outline" className="border-gold text-gold hover:bg-gold/10" asChild>
          <Link href="/admin/customers">Back to Customers</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-gold hover:text-gold-deep hover:bg-gold/10"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 bg-gold-gradient bg-clip-text text-transparent">
            Customer Details
          </h1>
          <p className="text-offwhite/70 font-body">View and manage customer information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Profile Card */}
        <Card className="border-gold/30 bg-charcoal lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-gold font-display">Customer Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4 bg-black border-2 border-gold">
                {customer.photoURL ? (
                  <img src={customer.photoURL || "/placeholder.svg"} alt={customer.displayName} />
                ) : (
                  <AvatarFallback className="text-gold-500 font-display text-2xl">
                    {getInitials(customer.displayName)}
                  </AvatarFallback>
                )}
              </Avatar>
              <h2 className="text-xl font-display font-bold text-gold">{customer.displayName}</h2>
              <Badge className={`mt-2 font-body ${getStatusColor(customer.status)}`}>
                {customer.status ? customer.status.charAt(0).toUpperCase() + customer.status.slice(1) : "Unknown"}
              </Badge>
              <p className="text-sm text-offwhite/70 mt-2 font-body">Customer since {formatDate(customer.createdAt)}</p>
            </div>

            <Separator className="bg-gold/20" />

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gold" />
                <div>
                  <p className="text-sm text-offwhite/70 font-body">User ID</p>
                  <p className="font-body">{customer.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gold" />
                <div>
                  <p className="text-sm text-offwhite/70 font-body">Email</p>
                  <p className="font-body">{customer.email}</p>
                </div>
              </div>

              {customer.phoneNumber && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gold" />
                  <div>
                    <p className="text-sm text-offwhite/70 font-body">Phone</p>
                    <p className="font-body">{customer.phoneNumber}</p>
                  </div>
                </div>
              )}

              {customer.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gold mt-1" />
                  <div>
                    <p className="text-sm text-offwhite/70 font-body">Address</p>
                    <p className="font-body">{customer.address.line1}</p>
                    {customer.address.line2 && <p className="font-body">{customer.address.line2}</p>}
                    <p className="font-body">
                      {customer.address.city}, {customer.address.state || ""} {customer.address.postalCode}
                    </p>
                    <p className="font-body">{customer.address.country}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gold" />
                <div>
                  <p className="text-sm text-offwhite/70 font-body">Last Login</p>
                  <p className="font-body">{formatDate(customer.lastLogin)}</p>
                </div>
              </div>
            </div>

            <Separator className="bg-gold/20" />

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-offwhite/70 font-body">Total Orders</p>
                <p className="text-xl font-display font-bold text-gold">{customer.orderCount || 0}</p>
              </div>
              <div>
                <p className="text-sm text-offwhite/70 font-body">Total Spent</p>
                <p className="text-xl font-display font-bold text-gold">${formatPrice(customer.totalSpent || 0)}</p>
              </div>
            </div>

            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" className="border-gold/30 text-gold hover:bg-gold/10">
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
              {customer.phoneNumber && (
                <Button variant="outline" size="sm" className="border-gold/30 text-gold hover:bg-gold/10">
                  <Phone className="mr-2 h-4 w-4" />
                  Call
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer Orders Card */}
        <Card className="border-gold/30 bg-charcoal lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-gold font-display">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {customerOrders.length > 0 ? (
              <div className="rounded-md border border-gold/30">
                <Table>
                  <TableHeader>
                    <TableRow className="font-body border-gold/30">
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerOrders.map((order) => (
                      <TableRow key={order.id} className="border-gold/30">
                        <TableCell className="font-display">{order.id}</TableCell>
                        <TableCell className="font-body">{formatDate(order.createdAt)}</TableCell>
                        <TableCell className="font-body">{order.items?.length || 0}</TableCell>
                        <TableCell className="font-body">${formatPrice(order.total || 0)}</TableCell>
                        <TableCell>
                          <Badge className={`font-body ${getOrderStatusColor(order.orderStatus)}`}>
                            {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1) || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="border-gold/30 text-gold hover:bg-gold/10"
                          >
                            <Link href={`/admin/orders/${order.id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gold/30" />
                <h3 className="text-lg font-display font-bold mb-2">No Orders Yet</h3>
                <p className="text-offwhite/70 font-body">This customer hasn't placed any orders yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Customer Attributes Card */}
        <Card className="border-gold/30 bg-charcoal lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-gold font-display">All Customer Attributes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gold/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="font-body border-gold/30">
                    <TableHead>Attribute</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(customer).map(([key, value]) => {
                    // Skip complex objects for separate display
                    if (key === "address" || key === "wishlist" || key === "orders") {
                      return null
                    }

                    let displayValue: React.ReactNode = "N/A"

                    if (value !== null && value !== undefined) {
                      if (key === "createdAt" || key === "lastLogin") {
                        displayValue = formatDate(value)
                      } else if (key === "totalSpent") {
                        displayValue = `$${formatPrice(value as number)}`
                      } else if (typeof value === "boolean") {
                        displayValue = value ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )
                      } else if (typeof value === "object") {
                        displayValue = JSON.stringify(value)
                      } else {
                        displayValue = String(value)
                      }
                    }

                    return (
                      <TableRow key={key} className="border-gold/30">
                        <TableCell className="font-semibold">{key}</TableCell>
                        <TableCell>{displayValue}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Address Details */}
            {customer.address && (
              <div className="mt-6">
                <h3 className="text-lg font-display font-bold mb-3 text-gold">Address Details</h3>
                <div className="rounded-md border border-gold/30 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="font-body border-gold/30">
                        <TableHead>Field</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(customer.address).map(([key, value]) => (
                        <TableRow key={key} className="border-gold/30">
                          <TableCell className="font-semibold">{key}</TableCell>
                          <TableCell>{value ? String(value) : "N/A"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Wishlist Items */}
            {customer.wishlist && customer.wishlist.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-display font-bold mb-3 text-gold">Wishlist Items</h3>
                <div className="rounded-md border border-gold/30 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="font-body border-gold/30">
                        <TableHead>Product ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customer.wishlist.map((productId: string) => (
                        <TableRow key={productId} className="border-gold/30">
                          <TableCell>{productId}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
