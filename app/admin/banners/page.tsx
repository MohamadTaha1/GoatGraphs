"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Loader2, Plus, Pencil, Trash2, Smartphone } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Banner {
  id: string
  title: string
  position: string
  imageUrl: string
  mobileImageUrl?: string
  active: boolean
  createdAt: string
}

export default function BannersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchBanners = async () => {
    setLoading(true)
    try {
      const bannersQuery = query(collection(db, "banners"), orderBy("createdAt", "desc"))
      const bannersSnapshot = await getDocs(bannersQuery)
      const bannersList = bannersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Banner[]

      setBanners(bannersList)
    } catch (error) {
      console.error("Error fetching banners:", error)
      toast({
        title: "Error",
        description: "Failed to load banners. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [toast])

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateDoc(doc(db, "banners", id), {
        active: !currentActive,
        updatedAt: new Date().toISOString(),
      })

      setBanners((prev) => prev.map((banner) => (banner.id === id ? { ...banner, active: !currentActive } : banner)))

      toast({
        title: `Banner ${currentActive ? "deactivated" : "activated"}`,
        description: `The banner has been ${currentActive ? "deactivated" : "activated"} successfully.`,
      })
    } catch (error) {
      console.error("Error updating banner:", error)
      toast({
        title: "Error",
        description: "Failed to update banner status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      await deleteDoc(doc(db, "banners", deleteId))

      setBanners((prev) => prev.filter((banner) => banner.id !== deleteId))

      toast({
        title: "Banner deleted",
        description: "The banner has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting banner:", error)
      toast({
        title: "Error",
        description: "Failed to delete banner. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const getPositionLabel = (position: string) => {
    switch (position) {
      case "hero":
        return "Hero"
      case "featured":
        return "Featured"
      case "promotion":
        return "Promotion"
      case "sidebar":
        return "Sidebar"
      default:
        return position
    }
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Banners</h1>
        <Button onClick={() => router.push("/admin/banners/add")}>
          <Plus className="mr-2 h-4 w-4" /> Add New Banner
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Banners</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading banners...</span>
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No banners found. Create your first banner to get started.</p>
              <Button onClick={() => router.push("/admin/banners/add")} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Add New Banner
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="relative h-16 w-28 overflow-hidden rounded-md">
                        <Image
                          src={banner.imageUrl || "/placeholder.svg?height=64&width=112&text=Banner"}
                          alt={banner.title}
                          fill
                          className="object-cover"
                          sizes="112px"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=64&width=112&text=Banner"
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {banner.title}
                      {banner.mobileImageUrl && (
                        <Badge variant="outline" className="ml-2 bg-blue-50">
                          <Smartphone className="h-3 w-3 mr-1" /> Mobile Optimized
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getPositionLabel(banner.position)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={banner.active}
                          onCheckedChange={() => handleToggleActive(banner.id, banner.active)}
                        />
                        <span>{banner.active ? "Active" : "Inactive"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => router.push(`/admin/banners/edit/${banner.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-500 border-red-200 hover:bg-red-50"
                              onClick={() => setDeleteId(banner.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the banner. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isDeleting ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
