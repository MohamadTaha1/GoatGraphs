"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus, Pencil, Trash2, AlertCircle } from "lucide-react"
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
import { useToast } from "@/components/ui/use-toast"
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Banner {
  id: string
  title: string
  subtitle?: string
  imageUrl: string
  linkUrl?: string
  position: string
  active: boolean
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  // Fetch banners from Firestore
  const fetchBanners = async () => {
    setLoading(true)
    setError(null)
    try {
      const bannersCollection = collection(db, "banners")
      const bannersSnapshot = await getDocs(bannersCollection)
      const bannersList = bannersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Banner[]

      setBanners(bannersList)
    } catch (err) {
      console.error("Error fetching banners:", err)
      setError("Failed to load banners. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  // Delete banner
  const handleDeleteBanner = async (id: string) => {
    try {
      await deleteDoc(doc(db, "banners", id))
      toast({
        title: "Banner deleted",
        description: "The banner has been successfully deleted.",
      })
      fetchBanners() // Refresh the list
    } catch (err) {
      console.error("Error deleting banner:", err)
      toast({
        title: "Error",
        description: "Failed to delete banner. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Filter banners based on active tab
  const filteredBanners = banners.filter((banner) => {
    if (activeTab === "all") return true
    if (activeTab === "active") return banner.active
    if (activeTab === "inactive") return !banner.active
    return true
  })

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Banners</h1>
        <Button asChild>
          <Link href="/admin/banners/add">
            <Plus className="mr-2 h-4 w-4" /> Add New Banner
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="all">All Banners</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading banners...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">{error}</p>
                <p className="text-sm">Please try refreshing the page.</p>
              </div>
            </div>
          ) : filteredBanners.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-xl font-bold mb-2">No banners found</h3>
              <p className="text-gray-500 mb-4">
                {activeTab === "all"
                  ? "You haven't created any banners yet."
                  : activeTab === "active"
                    ? "You don't have any active banners."
                    : "You don't have any inactive banners."}
              </p>
              <Button asChild>
                <Link href="/admin/banners/add">
                  <Plus className="mr-2 h-4 w-4" /> Create your first banner
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBanners.map((banner) => (
                <Card key={banner.id} className="overflow-hidden">
                  <div className="relative h-48 w-full">
                    <Image
                      src={banner.imageUrl || "/placeholder.svg?height=200&width=400&text=Banner+Image"}
                      alt={banner.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=200&width=400&text=Banner+Image"
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium">
                      {banner.position}
                    </div>
                    {!banner.active && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs font-medium">
                        Inactive
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1">{banner.title}</h3>
                    {banner.subtitle && <p className="text-gray-500 text-sm mb-4">{banner.subtitle}</p>}
                    <div className="flex justify-between items-center mt-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/banners/edit/${banner.id}`}>
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the banner.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteBanner(banner.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
