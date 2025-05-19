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
import { Loader2, ArrowLeft, AlertCircle, Smartphone, Monitor, CropIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import ImageCropper from "@/components/image-cropper"

interface BannerData {
  title: string
  subtitle?: string
  imageUrl: string
  mobileImageUrl?: string
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
    mobileImageUrl: "",
    linkUrl: "",
    position: "hero",
    active: true,
  })

  // Image state
  const [desktopImageFile, setDesktopImageFile] = useState<File | null>(null)
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null)
  const [desktopImagePreview, setDesktopImagePreview] = useState<string | null>(null)
  const [mobileImagePreview, setMobileImagePreview] = useState<string | null>(null)

  // Cropper state
  const [cropperOpen, setCropperOpen] = useState(false)
  const [cropperImage, setCropperImage] = useState<string | null>(null)
  const [cropperAspectRatio, setCropperAspectRatio] = useState(16 / 9)
  const [cropperTarget, setCropperTarget] = useState<"desktop" | "mobile">("desktop")

  // Fetch banner data
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const bannerDoc = await getDoc(doc(db, "banners", params.id))

        if (bannerDoc.exists()) {
          const bannerData = bannerDoc.data() as BannerData
          setFormData(bannerData)
          setDesktopImagePreview(bannerData.imageUrl)
          if (bannerData.mobileImageUrl) {
            setMobileImagePreview(bannerData.mobileImageUrl)
          }
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

  const handleDesktopImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setDesktopImageFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setDesktopImagePreview(imageUrl)

        // Open cropper with desktop aspect ratio
        setCropperImage(imageUrl)
        setCropperAspectRatio(16 / 9)
        setCropperTarget("desktop")
        setCropperOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMobileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setMobileImageFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setMobileImagePreview(imageUrl)

        // Open cropper with mobile aspect ratio
        setCropperImage(imageUrl)
        setCropperAspectRatio(9 / 16)
        setCropperTarget("mobile")
        setCropperOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = (croppedImageBlob: Blob) => {
    // Convert blob to File
    const croppedFile = new File(
      [croppedImageBlob],
      cropperTarget === "desktop"
        ? desktopImageFile?.name || "desktop-banner.jpg"
        : mobileImageFile?.name || "mobile-banner.jpg",
      { type: "image/jpeg" },
    )

    // Create a preview URL
    const imageUrl = URL.createObjectURL(croppedImageBlob)

    // Update the appropriate state based on target
    if (cropperTarget === "desktop") {
      setDesktopImageFile(croppedFile)
      setDesktopImagePreview(imageUrl)
    } else {
      setMobileImageFile(croppedFile)
      setMobileImagePreview(imageUrl)
    }

    // Close the cropper
    setCropperOpen(false)
  }

  const handleOpenCropper = (target: "desktop" | "mobile") => {
    const imagePreview = target === "desktop" ? desktopImagePreview : mobileImagePreview
    if (!imagePreview) return

    setCropperImage(imagePreview)
    setCropperAspectRatio(target === "desktop" ? 16 / 9 : 9 / 16)
    setCropperTarget(target)
    setCropperOpen(true)
  }

  const handleRemoveMobileImage = () => {
    setMobileImageFile(null)
    setMobileImagePreview(null)
    setFormData((prev) => ({ ...prev, mobileImageUrl: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updatedData = { ...formData }

      // If a new desktop image was selected, upload it
      if (desktopImageFile) {
        const desktopStorageRef = ref(storage, `banners/${Date.now()}_desktop_${desktopImageFile.name}`)
        const desktopUploadResult = await uploadBytes(desktopStorageRef, desktopImageFile)
        updatedData.imageUrl = await getDownloadURL(desktopUploadResult.ref)
      }

      // If a new mobile image was selected, upload it
      if (mobileImageFile) {
        const mobileStorageRef = ref(storage, `banners/${Date.now()}_mobile_${mobileImageFile.name}`)
        const mobileUploadResult = await uploadBytes(mobileStorageRef, mobileImageFile)
        updatedData.mobileImageUrl = await getDownloadURL(mobileUploadResult.ref)
      } else if (mobileImagePreview === null) {
        // If mobile image was removed
        updatedData.mobileImageUrl = ""
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
                <Tabs defaultValue="desktop" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="desktop" className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Desktop Image
                    </TabsTrigger>
                    <TabsTrigger value="mobile" className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Mobile Image
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="desktop" className="space-y-4 pt-4">
                    <Alert className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Desktop Image Guidelines</AlertTitle>
                      <AlertDescription>
                        Upload a landscape image with a 16:9 aspect ratio (e.g., 1920x1080px). This image will be shown
                        on tablets and desktop devices.
                      </AlertDescription>
                    </Alert>

                    <div>
                      <Label htmlFor="desktopImage">Desktop Banner Image (Leave empty to keep current)</Label>
                      <Input id="desktopImage" type="file" accept="image/*" onChange={handleDesktopImageChange} />
                      <p className="text-sm text-gray-500 mt-1">Recommended size: 1920x1080px (16:9 ratio)</p>
                    </div>

                    {desktopImagePreview && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <Label>Desktop Preview</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenCropper("desktop")}
                            className="flex items-center gap-1"
                          >
                            <CropIcon className="h-3 w-3" />
                            Edit Crop
                          </Button>
                        </div>
                        <div className="mt-2 relative h-40 w-full overflow-hidden rounded-md border">
                          <img
                            src={desktopImagePreview || "/placeholder.svg"}
                            alt="Desktop banner preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="mobile" className="space-y-4 pt-4">
                    <Alert className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Mobile Image Guidelines</AlertTitle>
                      <AlertDescription>
                        Upload a portrait or square image optimized for mobile devices (e.g., 750x1334px). This is
                        optional - if not provided, the desktop image will be used on mobile devices.
                      </AlertDescription>
                    </Alert>

                    <div>
                      <Label htmlFor="mobileImage">Mobile Banner Image (Optional)</Label>
                      <Input id="mobileImage" type="file" accept="image/*" onChange={handleMobileImageChange} />
                      <p className="text-sm text-gray-500 mt-1">
                        Recommended size: 750x1334px (portrait) or 1:1 (square)
                      </p>
                    </div>

                    {mobileImagePreview ? (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <Label>Mobile Preview</Label>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenCropper("mobile")}
                              className="flex items-center gap-1"
                            >
                              <CropIcon className="h-3 w-3" />
                              Edit Crop
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleRemoveMobileImage}
                              className="text-red-500 border-red-200 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 relative h-60 w-40 mx-auto overflow-hidden rounded-md border">
                          <img
                            src={mobileImagePreview || "/placeholder.svg"}
                            alt="Mobile banner preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 p-4 border border-dashed rounded-md text-center text-gray-500">
                        <Smartphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No mobile-specific image set.</p>
                        <p className="text-sm">The desktop image will be used on mobile devices.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
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

      {/* Image Cropper Dialog */}
      <Dialog open={cropperOpen} onOpenChange={setCropperOpen}>
        <DialogContent className="max-w-4xl w-[90vw]">
          <DialogTitle>Crop {cropperTarget === "desktop" ? "Desktop" : "Mobile"} Banner Image</DialogTitle>
          {cropperImage && (
            <ImageCropper
              imageUrl={cropperImage}
              aspectRatio={cropperAspectRatio}
              onCropComplete={handleCropComplete}
              onCancel={() => setCropperOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
