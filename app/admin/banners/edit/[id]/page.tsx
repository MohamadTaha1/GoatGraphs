"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface BannerData {
  title: string
  subtitle?: string
  imageUrl: string
  linkUrl?: string
  position: string
  active: boolean
}

export default function EditBannerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [formData, setFormData] = useState<BannerData>({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "",
    position: "hero",
    active: true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Fetch banner data
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const bannerDoc = await getDoc(doc(db, "banners", params.id))

        if (bannerDoc.exists()) {
          const bannerData = bannerDoc.data() as BannerData
          setFormData(bannerData)
          setImagePreview(bannerData.imageUrl)
        } else {
          toast({
            title: "Banner not found",
            description: "The requested banner could not be found.",
            variant: "destructive",
          })
          router.push("/admin/banners")
        }
      } catch (error) {
        console.error("Error fetching banner:", error)
        toast({
          title: "Error",
          description: "Failed to load banner data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setFetchLoading(false)
      }
    }

    fetchBanner()
  }, [params.id, router, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, active: checked }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, position: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updatedData = { ...formData }

      // If a new image was selected, upload it
      if (imageFile) {
        const storageRef = ref(storage, `banners/${Date.now()}_${imageFile.name}`)
        const uploadResult = await uploadBytes(storageRef, imageFile)
        updatedData.imageUrl = await getDownloadURL(uploadResult.ref)
      }

      // Update banner in Firestore
      await updateDoc(doc(db, "banners", params.id), {
        ...updatedData,
        updatedAt: new Date().toISOString(),
      })

      toast({
        title: "Banner updated",
        description: "The banner has been successfully updated.",
      })

      router.push("/admin/banners")
    } catch (error) {
      console.error("Error updating banner:", error)
      toast({
        title: "Error",
        description: "Failed to update banner. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="container py-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading banner data...</span>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Banners
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Banner</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 bg-blue-500/10 text-blue-500 border-blue-500/20">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Responsive Image Guidelines</AlertTitle>
            <AlertDescription>
              For best results across all devices, upload banner images with a 16:9 aspect ratio (e.g., 1920x1080px).
              Make sure important text and elements are centered or positioned in the left third of the image, as mobile
              devices will crop the sides.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="subtitle">Subtitle (Optional)</Label>
                  <Textarea
                    id="subtitle"
                    name="subtitle"
                    value={formData.subtitle || ""}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="linkUrl">Link URL (Optional)</Label>
                  <Input
                    id="linkUrl"
                    name="linkUrl"
                    value={formData.linkUrl || ""}
                    onChange={handleInputChange}
                    placeholder="https://"
                  />
                </div>

                <div>
                  <Label htmlFor="position">Position</Label>
                  <Select value={formData.position} onValueChange={handleSelectChange}>
                    <SelectTrigger id="position">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hero">Hero (Main Banner)</SelectItem>
                      <SelectItem value="featured">Featured Section</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="active" checked={formData.active} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="image">Banner Image (Leave empty to keep current image)</Label>
                  <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
                  <p className="text-sm text-gray-500 mt-1">Recommended size: 1920x1080px (16:9 ratio)</p>
                </div>

                {imagePreview && (
                  <div className="mt-4">
                    <Label>Current Image</Label>
                    <div className="mt-2 relative h-40 w-full overflow-hidden rounded-md border">
                      <img
                        src={imagePreview || "/placeholder.svg?height=160&width=320&text=Preview"}
                        alt="Banner preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=160&width=320&text=Preview"
                        }}
                      />
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Desktop view:</span> Full width image will be displayed
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Mobile view:</span> Image will be cropped to fit smaller screens
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Updating..." : "Update Banner"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
