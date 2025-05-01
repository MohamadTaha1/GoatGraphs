"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, PlusCircle, Search, Edit, Trash2, MoreHorizontal, Loader2 } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { useProducts, deleteProduct } from "@/hooks/use-products"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatPrice } from "@/lib/utils"

export default function ProductsPage() {
  const { products, loading, error } = useProducts()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const productsPerPage = 8

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.signedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  const handleDeleteProduct = async (productId: string) => {
    setIsDeleting(true)
    try {
      const success = await deleteProduct(productId)
      if (success) {
        toast({
          title: "Product deleted",
          description: "The product has been deleted successfully.",
        })
        // Force refresh the page to update the product list
        router.refresh()
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
      setProductToDelete(null)
    }
  }

  const formatDate = (timestamp: any) => {
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
          <Link href="/admin/products/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Product
          </Link>
        </Button>
      </div>

      <Card className="border-gold/30 bg-charcoal">
        <CardHeader className="pb-3">
          <CardTitle className="text-gold font-display">Product Inventory</CardTitle>
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

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
              <span className="ml-2 text-offwhite">Loading products...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-red-900/20 rounded-lg border border-red-900/50 p-8">
              <h3 className="text-xl font-display font-bold text-red-500 mb-2">Error loading products</h3>
              <p className="text-offwhite/70 font-body mb-4">
                There was an error loading the products. Please try again.
              </p>
              <Button
                variant="outline"
                className="border-gold text-gold hover:bg-gold/10"
                onClick={() => router.refresh()}
              >
                Retry
              </Button>
            </div>
          ) : (
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
                              alt={product.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-display text-offwhite">{product.title}</TableCell>
                        <TableCell className="font-body text-offwhite">{product.signedBy}</TableCell>
                        <TableCell className="font-body text-offwhite capitalize">{product.type}</TableCell>
                        <TableCell className="font-body text-gold-warm">{formatPrice(product.price)}</TableCell>
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-gold/10 hover:text-gold">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-charcoal border-gold/30">
                              <DropdownMenuLabel className="text-offwhite">Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild className="text-offwhite hover:text-gold hover:bg-gold/10">
                                <Link href={`/admin/products/edit/${product.id}`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gold/20" />
                              <DropdownMenuItem
                                className="text-red-500 focus:text-red-500 hover:bg-red-500/10"
                                onClick={() => setProductToDelete(product.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}

                  {filteredProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-offwhite">
                        No products found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-offwhite/70 font-body">
                Showing {Math.min(filteredProducts.length, (currentPage - 1) * productsPerPage + 1)}-
                {Math.min(currentPage * productsPerPage, filteredProducts.length)} of {filteredProducts.length} products
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
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent className="bg-charcoal border-gold/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gold">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-offwhite/70">
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-gold/30 text-offwhite hover:bg-gold/10 hover:text-gold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => productToDelete && handleDeleteProduct(productToDelete)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
