"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Eye } from "lucide-react"
import Link from "next/link"

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled"

interface Order {
  id: string
  customer: string
  date: string
  amount: number
  status: OrderStatus
  items: number
}

const RECENT_ORDERS: Order[] = [
  {
    id: "ORD-7392",
    customer: "Ahmed Al Mansour",
    date: "2023-04-18",
    amount: 1299.99,
    status: "delivered",
    items: 1,
  },
  {
    id: "ORD-7391",
    customer: "Sara Khan",
    date: "2023-04-17",
    amount: 2499.98,
    status: "shipped",
    items: 2,
  },
  {
    id: "ORD-7390",
    customer: "Mohammed Hassan",
    date: "2023-04-17",
    amount: 999.99,
    status: "processing",
    items: 1,
  },
  {
    id: "ORD-7389",
    customer: "Fatima Al Zahra",
    date: "2023-04-16",
    amount: 1199.99,
    status: "pending",
    items: 1,
  },
  {
    id: "ORD-7388",
    customer: "Ali Abdullah",
    date: "2023-04-15",
    amount: 849.99,
    status: "cancelled",
    items: 1,
  },
]

export function RecentOrders() {
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 5
  const totalPages = Math.ceil(RECENT_ORDERS.length / ordersPerPage)

  const getStatusColor = (status: OrderStatus) => {
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

  return (
    <Card className="border-gold-700">
      <CardHeader>
        <CardTitle className="text-gold-500 font-display">Recent Orders</CardTitle>
        <CardDescription className="font-body">Overview of latest orders</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="font-body border-gold-700/50">
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {RECENT_ORDERS.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage).map((order) => (
              <TableRow key={order.id} className="border-gold-700/50">
                <TableCell className="font-display">{order.id}</TableCell>
                <TableCell className="font-body">{order.customer}</TableCell>
                <TableCell className="font-body">{new Date(order.date).toLocaleDateString()}</TableCell>
                <TableCell className="font-body">${order.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={`font-body ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
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
            ))}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 mt-4">
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
        )}
      </CardContent>
    </Card>
  )
}
