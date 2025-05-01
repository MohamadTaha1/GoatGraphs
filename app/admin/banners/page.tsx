"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Search, Edit, Trash2, MoreHorizontal, Loader2, Eye } from "lucide-react"
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

// Mock data for banners
const BANNERS_DATA = [
  {
    id: "1",
    title: "Summer Sale",
    description: "Get up to 50% off on all signed jerseys",
    imageUrl: "/placeholder.svg?height=200&width=600",
    position: "home_hero",
    active: true,
    startDate: "2023-06-01",
    endDate: "2023-08-31",
  },
  {
    id: "2",
    title: "New Arrivals",
    description: "Check out our latest signed memorabilia",
    imageUrl: "/placeholder.svg?height=200&width=600",
    position: "shop_top",
    active: true,
    startDate: "2023-05-15",
    endDate: "2023-12-31",
  },
  {
    id: "3",
    title: "Limited Edition",
    description: "Exclusive signed items from the World Cup",
    imageUrl: "/placeholder.svg?height=200&width=600",
    position: "home_middle",
    active: false,
    startDate: "2023-07-01",
    endDate: "2023-09-30",
  },
]

export default function BannersPage() {
  const [banners, setBanners] = useState(BANNERS_DATA)
  const [searchTerm, setSearchTerm] = useState("")
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filter banners based on search term
  const filteredBanners = banners.filter(
    (banner) =>
      banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      banner.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      banner.position.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteBanner = (bannerId: string) => {
    setIsDeleting(true)
    // Simulate API call
    setTimeout(() => {
      setBanners(banners.filter((banner) => banner.id !== bannerId))
      setIsDeleting(false)
      setBannerToDelete(null)
      toast({
        title: "Banner deleted",
        description: "The banner has been deleted successfully.",
      })
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 bg-gold-gradient bg-clip-text text-transparent">
            Banners
          </h1>
          <p className="text-offwhite/70 font-body">Manage promotional banners across your website</p>
        </div>

        <Button asChild className="bg-gold-soft hover:bg-gold-deep text-jetblack">
          <Link href="/admin/banners/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Banner
          </Link>
        </Button>
      </div>

      <Card className="border-gold/30 bg-charcoal">
        <CardHeader className="pb-3">
          <CardTitle className="text-gold font-display">Banner Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-offwhite/50" />
              <Input
                placeholder="Search banners..."
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
                  <TableHead className="text-offwhite">Image</TableHead>
                  <TableHead className="text-offwhite">Title</TableHead>
                  <TableHead className="text-offwhite">Position</TableHead>
                  <TableHead className="text-offwhite">Date Range</TableHead>
                  <TableHead className="text-offwhite">Status</TableHead>
                  <TableHead className="text-right text-offwhite">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBanners.map((banner) => (
                  <TableRow key={banner.id} className="border-gold/30 hover:bg-gold/5">
                    <TableCell className="font-body">
                      <div className="relative h-12 w-24 rounded-md overflow-hidden bg-jetblack">
                        <Image
                          src={banner.imageUrl || "/placeholder.svg"}
                          alt={banner.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-display text-offwhite">
                      <div>
                        <p className="font-bold">{banner.title}</p>
                        <p className="text-xs text-offwhite/70 truncate max-w-[200px]">{banner.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-body text-offwhite capitalize">
                      {banner.position.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell className="font-body text-offwhite">
                      <div className="text-sm">
                        <p>From: {new Date(banner.startDate).toLocaleDateString()}</p>
                        <p>To: {new Date(banner.endDate).toLocaleDateString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`font-body ${
                          banner.active
                            ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                            : "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                        }`}
                      >
                        {banner.active ? "Active" : "Inactive"}
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
                          <DropdownMenuItem asChild className="text-offwhite hover:text-gold hover:bg-gold/10">
                            <Link href={`/admin/banners/preview/${banner.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="text-offwhite hover:text-gold hover:bg-gold/10">
                            <Link href={`/admin/banners/edit/${banner.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gold/20" />
                          <DropdownMenuItem
                            className="text-red-500 focus:text-red-500 hover:bg-red-500/10"
                            onClick={() => setBannerToDelete(banner.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredBanners.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-offwhite">
                      No banners found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!bannerToDelete} onOpenChange={(open) => !open && setBannerToDelete(null)}>
        <AlertDialogContent className="bg-charcoal border-gold/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gold">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-offwhite/70">
              Are you sure you want to delete this banner? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-gold/30 text-offwhite hover:bg-gold/10 hover:text-gold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => bannerToDelete && handleDeleteBanner(bannerToDelete)}
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
