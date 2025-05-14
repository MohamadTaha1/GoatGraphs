"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Search, Edit, Trash2, MoreHorizontal, Loader2, ImageIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
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
import { getFirestoreInstance } from "@/lib/firebase/firestore"

interface Category {
  id: string
  name: string
  slug: string
  description: string
  imageUrl?: string
  productCount?: number
  featured: boolean
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const db = getFirestoreInstance()

      if (!db) {
        // Fallback to mock data if Firestore is not available
        setCategories(CATEGORIES_DATA)
        setLoading(false)
        return
      }

      // Dynamically import Firestore functions
      const { collection, getDocs } = await import("firebase/firestore")
      const categoriesSnapshot = await getDocs(collection(db, "categories"))

      if (categoriesSnapshot.empty) {
        // If no categories in Firestore, use mock data
        setCategories(CATEGORIES_DATA)
      } else {
        const categoriesData = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          productCount: 0, // We'll update this later if needed
        })) as Category[]

        setCategories(categoriesData)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      // Fallback to mock data on error
      setCategories(CATEGORIES_DATA)
      toast({
        title: "Error",
        description: "Failed to load categories. Using demo data instead.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteCategory = async (categoryId: string) => {
    setIsDeleting(true)

    try {
      const db = getFirestoreInstance()

      if (!db) {
        throw new Error("Firestore is not available")
      }

      // Dynamically import Firestore functions
      const { doc, deleteDoc } = await import("firebase/firestore")
      await deleteDoc(doc(db, "categories", categoryId))

      // Update local state
      setCategories(categories.filter((category) => category.id !== categoryId))

      toast({
        title: "Category deleted",
        description: "The category has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setCategoryToDelete(null)
    }
  }

  const toggleFeatured = async (categoryId: string) => {
    try {
      const categoryToUpdate = categories.find((c) => c.id === categoryId)
      if (!categoryToUpdate) return

      const db = getFirestoreInstance()

      if (!db) {
        throw new Error("Firestore is not available")
      }

      // Dynamically import Firestore functions
      const { doc, updateDoc } = await import("firebase/firestore")
      await updateDoc(doc(db, "categories", categoryId), {
        featured: !categoryToUpdate.featured,
      })

      // Update local state
      setCategories(
        categories.map((category) =>
          category.id === categoryId ? { ...category, featured: !category.featured } : category,
        ),
      )

      toast({
        title: "Status updated",
        description: "The category featured status has been updated.",
      })
    } catch (error) {
      console.error("Error updating category:", error)
      toast({
        title: "Error",
        description: "Failed to update category status. Please try again.",
        variant: "destructive",
      })
    }
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
          <Link href="/admin/categories/edit/new">
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

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gold mr-2" />
              <span>Loading categories...</span>
            </div>
          ) : (
            <div className="rounded-md border border-gold/30">
              <Table>
                <TableHeader>
                  <TableRow className="font-body border-gold/30 hover:bg-transparent">
                    <TableHead className="text-offwhite">Image</TableHead>
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
                      <TableCell>
                        {category.imageUrl ? (
                          <div className="relative h-10 w-10 rounded overflow-hidden">
                            <Image
                              src={category.imageUrl || "/placeholder.svg"}
                              alt={category.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded bg-gold/10 flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-gold/50" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-display text-offwhite font-bold">{category.name}</TableCell>
                      <TableCell className="font-body text-offwhite">{category.slug}</TableCell>
                      <TableCell className="font-body text-offwhite">
                        <p className="truncate max-w-[250px]">{category.description}</p>
                      </TableCell>
                      <TableCell className="font-body text-offwhite">{category.productCount || 0}</TableCell>
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
                      <TableCell colSpan={7} className="h-24 text-center text-offwhite">
                        No categories found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
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

// Mock data for categories (used as fallback)
const CATEGORIES_DATA: Category[] = [
  {
    id: "1",
    name: "Jerseys",
    slug: "jerseys",
    description: "Signed football jerseys from top players",
    productCount: 15,
    featured: true,
    imageUrl: "/placeholder.svg?key=yzutn",
  },
  {
    id: "2",
    name: "Footballs",
    slug: "footballs",
    description: "Authentic signed footballs",
    productCount: 8,
    featured: true,
    imageUrl: "/football-action.png",
  },
  {
    id: "3",
    name: "Photographs",
    slug: "photographs",
    description: "Signed photographs of memorable moments",
    productCount: 12,
    featured: false,
    imageUrl: "/classic-portrait.png",
  },
  {
    id: "4",
    name: "Boots",
    slug: "boots",
    description: "Signed football boots from professional players",
    productCount: 5,
    featured: false,
    imageUrl: "/various-boots.png",
  },
  {
    id: "5",
    name: "Memorabilia",
    slug: "memorabilia",
    description: "Other signed football memorabilia",
    productCount: 10,
    featured: true,
    imageUrl: "/placeholder.svg?key=u9vb1",
  },
]
