"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Loader2,
  ShoppingBag,
  ClipboardList,
} from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { useProducts, deleteProduct } from "@/hooks/use-products"
import { formatPrice } from "@/lib/utils"

export default function ProductsPage() {
  const router = useRouter()
  const { products: initialProducts, loading, error } = useProducts()
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingProductId, setDeletingProductId] = useState(null)
  const [activeTab, setActiveTab] = useState("in-stock")

  // Update local products state when initialProducts changes
  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts)
    }
  }, [initialProducts])

  const productsPerPage = 8

  // Filter products based on search term and type
  const filteredProducts = products.filter((product) => {
    if (!product) return false

    const title = product.title || ""
    const signedBy = product.signedBy || ""
    const type = product.type || ""
    const isPreOrder = product.isPreOrder || false

    // Filter by search term
    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.toLowerCase().includes(searchTerm.toLowerCase())

    // Filter by product type (pre-order or in-stock)
    const matchesType = activeTab === "pre-order" ? isPreOrder : !isPreOrder

    return matchesSearch && matchesType
  })

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  const handleDeleteProduct = async (productId) => {
    if (isDeleting) return // Prevent multiple clicks

    try {
      setDeletingProductId(productId)
      setIsDeleting(true)

      const success = await deleteProduct(productId)

      if (success) {
        // Update local state immediately
        setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId))

        toast({
          title: "Product deleted",
          description: "The product has been deleted successfully.",
        })

        // Reset page if needed
        const newFilteredProducts = products.filter((p) => p.id !== productId)
        const newTotalPages = Math.ceil(newFilteredProducts.length / productsPerPage)
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete the product. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeletingProductId(null)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A"

    try {
      // Handle Firestore Timestamp
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString()
      }

      // Handle string date
      return new Date(timestamp).toLocaleDateString()
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  // Count products by type
  const inStockCount = products.filter((p) => !p.isPreOrder).length
  const preOrderCount = products.filter((p) => p.isPreOrder).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 bg-gold-gradient bg-clip-text text-transparent">
            Products
          </h1>
          <p className="text-offwhite/70 font-body">Manage your product inventory</p>
        </div>

        <Button asChild className="bg-gold-soft hover:bg-gold-deep text-jetblack">
          <Link href={`/admin/products/add?type=${activeTab === "pre-order" ? "pre-order" : "in-stock"}`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New {activeTab === "pre-order" ? "Pre-Order" : "Product"}
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="in-stock" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-charcoal border border-gold/30">
          <TabsTrigger value="in-stock" className="data-[state=active]:bg-gold data-[state=active]:text-jetblack">
            <ShoppingBag className="h-4 w-4 mr-2" />
            In-Stock Products ({inStockCount})
          </TabsTrigger>
          <TabsTrigger value="pre-order" className="data-[state=active]:bg-gold data-[state=active]:text-jetblack">
            <ClipboardList className="h-4 w-4 mr-2" />
            Pre-Order Templates ({preOrderCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-stock" className="mt-4">
          <Card className="border-gold/30 bg-charcoal">
            <CardHeader className="pb-3">
              <CardTitle className="text-gold font-display">In-Stock Product Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-offwhite/50" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 border-gold/30 bg-jetblack text-offwhite"
                  />
                </div>
              </div>

              {renderProductTable()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pre-order" className="mt-4">
          <Card className="border-gold/30 bg-charcoal">
            <CardHeader className="pb-3">
              <CardTitle className="text-gold font-display">Pre-Order Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-offwhite/50" />
                  <Input
                    placeholder="Search pre-order templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 border-gold/30 bg-jetblack text-offwhite"
                  />
                </div>
              </div>

              {renderProductTable()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )

  function renderProductTable() {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
          <span className="ml-2 text-offwhite">Loading products...</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-12 bg-red-900/20 rounded-lg border border-red-900/50 p-8">
          <h3 className="text-xl font-display font-bold text-red-500 mb-2">Error loading products</h3>
          <p className="text-offwhite/70 font-body mb-4">There was an error loading the products. Please try again.</p>
          <Button variant="outline" className="border-gold text-gold hover:bg-gold/10" onClick={() => router.refresh()}>
            Retry
          </Button>
        </div>
      )
    }

    return (
      <>
        <div className="rounded-md border border-gold/30">
          <Table>
            <TableHeader>
              <TableRow className="font-body border-gold/30 hover:bg-transparent">
                <TableHead className="text-offwhite">Image</TableHead>
                <TableHead className="text-offwhite">Product</TableHead>
                <TableHead className="text-offwhite">Signed By</TableHead>
                <TableHead className="text-offwhite">Type</TableHead>
                <TableHead className="text-offwhite">Price</TableHead>
                <TableHead className="text-offwhite">Status</TableHead>
                <TableHead className="text-offwhite">Date Added</TableHead>
                <TableHead className="text-right text-offwhite">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts
                .slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)
                .map((product) => (
                  <TableRow key={product.id} className="border-gold/30 hover:bg-gold/5">
                    <TableCell className="font-body">
                      <div className="relative h-12 w-12 rounded-md overflow-hidden bg-jetblack">
                        <Image
                          src={product.imageUrl || "/placeholder.svg?height=48&width=48"}
                          alt={product.title || "Product"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-display text-offwhite">
                      {product.title || "Untitled"}
                      {product.isPreOrder && (
                        <Badge className="ml-2 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30">
                          Pre-Order
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-body text-offwhite">{product.signedBy || "Unknown"}</TableCell>
                    <TableCell className="font-body text-offwhite capitalize">{product.type || "N/A"}</TableCell>
                    <TableCell className="font-body text-gold-warm">{formatPrice(product.price || 0)}</TableCell>
                    <TableCell>
                      <Badge
                        className={`font-body ${
                          product.available
                            ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                            : "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                        }`}
                      >
                        {product.available ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-body text-offwhite/70">{formatDate(product.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="icon" className="hover:bg-gold/10 hover:text-gold" asChild>
                          <Link href={`/admin/products/edit/${product.id}`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-red-500/10 hover:text-red-500"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this product? This action cannot be undone.",
                              )
                            ) {
                              handleDeleteProduct(product.id)
                            }
                          }}
                          disabled={isDeleting && deletingProductId === product.id}
                        >
                          {isDeleting && deletingProductId === product.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-offwhite">
                    No {activeTab === "pre-order" ? "pre-order templates" : "products"} found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-offwhite/70 font-body">
              Showing {Math.min(filteredProducts.length, (currentPage - 1) * productsPerPage + 1)}-
              {Math.min(currentPage * productsPerPage, filteredProducts.length)} of {filteredProducts.length}{" "}
              {activeTab === "pre-order" ? "templates" : "products"}
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
              <span className="text-sm text-offwhite/70 font-body">
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
    )
  }
}
