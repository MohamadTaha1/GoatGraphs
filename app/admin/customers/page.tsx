"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  Mail,
  Phone,
  MoreHorizontal,
  Loader2,
  PlusCircle,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useUsers } from "@/hooks/use-users"
import { formatPrice } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { convertTimestampToDate } from "@/lib/firebase-helpers"

export default function CustomersPage() {
  const { users, loading, error, refreshUsers } = useUsers()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")

  const customersPerPage = 7

  // Filter customers with null checks
  const filteredCustomers = users.filter((customer) => {
    // Search term filter with null checks
    const matchesSearch =
      !searchTerm ||
      (customer.displayName && customer.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.phoneNumber && customer.phoneNumber.includes(searchTerm))

    // Status filter with null check
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage)

  const getInitials = (name: string) => {
    if (!name) return "UN"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
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

  const formatDate = (dateStr: any) => {
    if (!dateStr) return "N/A"

    const date = convertTimestampToDate(dateStr)
    if (!date) return "N/A"

    return date.toLocaleDateString()
  }

  const handleRefresh = () => {
    refreshUsers()
    toast({
      title: "Refreshing customers",
      description: "The customer list is being refreshed.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 bg-gold-gradient bg-clip-text text-transparent">
            Customers
          </h1>
          <p className="text-gray-400 font-body">Manage your customer information</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button asChild className="bg-gold-soft hover:bg-gold-deep text-jetblack">
            <Link href="/admin/customers/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Customer
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 border-gold/30 bg-charcoal text-offwhite"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            className={statusFilter === "all" ? "bg-gold-gradient text-black" : "border-gold/30 text-gold"}
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "active" ? "default" : "outline"}
            className={statusFilter === "active" ? "bg-gold-gradient text-black" : "border-gold/30 text-gold"}
            onClick={() => setStatusFilter("active")}
          >
            Active
          </Button>
          <Button
            variant={statusFilter === "inactive" ? "default" : "outline"}
            className={statusFilter === "inactive" ? "bg-gold-gradient text-black" : "border-gold/30 text-gold"}
            onClick={() => setStatusFilter("inactive")}
          >
            Inactive
          </Button>
        </div>
      </div>

      <Card className="border-gold/30 bg-charcoal">
        <CardHeader className="pb-3">
          <CardTitle className="text-gold font-display">Customers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
              <span className="ml-2 text-offwhite">Loading customers...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-red-900/20 rounded-lg border border-red-900/50 p-8">
              <h3 className="text-xl font-display font-bold text-red-500 mb-2">Error loading customers</h3>
              <p className="text-offwhite/70 font-body mb-4">
                {error.message || "There was an error loading the customers. Please try again."}
              </p>
              <Button variant="outline" className="border-gold text-gold hover:bg-gold/10" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border border-gold/30">
                <Table>
                  <TableHeader>
                    <TableRow className="font-body border-gold/30">
                      <TableHead>Customer</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers
                        .slice((currentPage - 1) * customersPerPage, currentPage * customersPerPage)
                        .map((customer) => (
                          <TableRow key={customer.id} className="border-gold/30">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 bg-black border border-gold/30">
                                  {customer.photoURL ? (
                                    <img
                                      src={customer.photoURL || "/placeholder.svg"}
                                      alt={customer.displayName || "Customer"}
                                    />
                                  ) : (
                                    <AvatarFallback className="text-gold font-display">
                                      {getInitials(customer.displayName || "Unknown")}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div>
                                  <p className="font-display font-bold text-offwhite">
                                    {customer.displayName || "Unknown"}
                                  </p>
                                  <p className="text-xs text-gray-400 font-body">{customer.email || "No email"}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-body text-offwhite">
                              {customer.address?.city || "N/A"}, {customer.address?.country || "N/A"}
                            </TableCell>
                            <TableCell className="font-body text-offwhite">{customer.orderCount || 0}</TableCell>
                            <TableCell className="font-body text-offwhite">
                              ${formatPrice(customer.totalSpent || 0)}
                            </TableCell>
                            <TableCell className="font-body text-offwhite">{formatDate(customer.lastLogin)}</TableCell>
                            <TableCell>
                              <Badge className={`font-body ${getStatusColor(customer.status)}`}>
                                {customer.status
                                  ? customer.status.charAt(0).toUpperCase() + customer.status.slice(1)
                                  : "Unknown"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="hover:bg-gold/10 hover:text-gold">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-charcoal border-gold/30">
                                  <DropdownMenuLabel className="text-offwhite">Actions</DropdownMenuLabel>
                                  <DropdownMenuItem asChild className="text-offwhite hover:text-gold focus:text-gold">
                                    <Link href={`/admin/customers/${customer.id}`}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-gold/20" />
                                  <DropdownMenuItem className="text-offwhite hover:text-gold focus:text-gold">
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Email
                                  </DropdownMenuItem>
                                  {customer.phoneNumber && (
                                    <DropdownMenuItem className="text-offwhite hover:text-gold focus:text-gold">
                                      <Phone className="mr-2 h-4 w-4" />
                                      Call Customer
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-offwhite">
                          {searchTerm || statusFilter !== "all" ? (
                            <>No customers match your search criteria.</>
                          ) : (
                            <>No customers found. Add your first customer to get started.</>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-gray-400 font-body">
                    Showing {Math.min(filteredCustomers.length, (currentPage - 1) * customersPerPage + 1)}-
                    {Math.min(currentPage * customersPerPage, filteredCustomers.length)} of {filteredCustomers.length}{" "}
                    customers
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gold/30 text-gold"
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
                      className="border-gold/30 text-gold"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
