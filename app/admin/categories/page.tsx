"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Search, Edit, Trash2, MoreHorizontal, Loader2 } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
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
import { toast } from "@/components/ui/use-toast"

// Mock data for categories
const CATEGORIES_DATA = [
  {
    id: "1",
    name: "Jerseys",
    slug: "jerseys",
    description: "Signed football jerseys from top players",
    productCount: 15,
    featured: true,
  },
  {
    id: "2",
    name: "Footballs",
    slug: "footballs",
    description: "Authentic signed footballs",
    productCount: 8,
    featured: true,
  },
  {
    id: "3",
    name: "Photographs",
    slug: "photographs",
    description: "Signed photographs of memorable moments",
    productCount: 12,
    featured: false,
  },
  {
    id: "4",
    name: "Boots",
    slug: "boots",
    description: "Signed football boots from professional players",
    productCount: 5,
    featured: false,
  },
  {
    id: "5",
    name: "Memorabilia",
    slug: "memorabilia",
    description: "Other signed football memorabilia",
    productCount: 10,
    featured: true,
  },
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState(CATEGORIES_DATA)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteCategory = (categoryId: string) => {
    setIsDeleting(true)
    // Simulate API call
    setTimeout(() => {
      setCategories(categories.filter((category) => category.id !== categoryId))
      setIsDeleting(false)
      setCategoryToDelete(null)
      toast({
        title: "Category deleted",
        description: "The category has been deleted successfully.",
      })
    }, 1000)
  }

  const toggleFeatured = (categoryId: string) => {
    setCategories(
      categories.map((category) =>
        category.id === categoryId ? { ...category, featured: !category.featured } : category,
      ),
    )
    toast({
      title: "Status updated",
      description: "The category featured status has been updated.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 bg-gold-gradient bg-clip-text text-transparent">
            Categories
          </h1>
          <p className="text-offwhite/70 font-body">Manage product categories</p>
        </div>

        <Button asChild className="bg-gold-soft hover:bg-gold-deep text-jetblack">
          <Link href="/admin/categories/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Category
          </Link>
        </Button>
      </div>

      <Card className="border-gold/30 bg-charcoal">
        <CardHeader className="pb-3">
          <CardTitle className="text-gold font-display">Category Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-offwhite/50" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 border-gold/30 bg-jetblack text-offwhite"
              />
            </div>
          </div>

          <div className="rounded-md border border-gold/30">
            <Table>
              <TableHeader>
                <TableRow className="font-body border-gold/30 hover:bg-transparent">
                  <TableHead className="text-offwhite">Name</TableHead>
                  <TableHead className="text-offwhite">Slug</TableHead>
                  <TableHead className="text-offwhite">Description</TableHead>
                  <TableHead className="text-offwhite">Products</TableHead>
                  <TableHead className="text-offwhite">Status</TableHead>
                  <TableHead className="text-right text-offwhite">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id} className="border-gold/30 hover:bg-gold/5">
                    <TableCell className="font-display text-offwhite font-bold">{category.name}</TableCell>
                    <TableCell className="font-body text-offwhite">{category.slug}</TableCell>
                    <TableCell className="font-body text-offwhite">
                      <p className="truncate max-w-[250px]">{category.description}</p>
                    </TableCell>
                    <TableCell className="font-body text-offwhite">{category.productCount}</TableCell>
                    <TableCell>
                      {category.featured && (
                        <Badge className="font-body bg-gold/20 text-gold hover:bg-gold/30">Featured</Badge>
                      )}
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
                          <DropdownMenuItem asChild className="text-offwhite hover:text-gold hover:bg-gold/10">
                            <Link href={`/admin/categories/edit/${category.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gold/20" />
                          <DropdownMenuItem
                            className="text-offwhite hover:text-gold hover:bg-gold/10"
                            onClick={() => toggleFeatured(category.id)}
                          >
                            <span className="mr-2">🌟</span>
                            {category.featured ? "Remove from Featured" : "Mark as Featured"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gold/20" />
                          <DropdownMenuItem
                            className="text-red-500 focus:text-red-500 hover:bg-red-500/10"
                            onClick={() => setCategoryToDelete(category.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredCategories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-offwhite">
                      No categories found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent className="bg-charcoal border-gold/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gold">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-offwhite/70">
              Are you sure you want to delete this category? This will also affect products in this category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-gold/30 text-offwhite hover:bg-gold/10 hover:text-gold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => categoryToDelete && handleDeleteCategory(categoryToDelete)}
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
