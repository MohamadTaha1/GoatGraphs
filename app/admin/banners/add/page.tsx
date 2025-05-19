"use client"

import type React from "react"

import { useState } from "react"
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
import { collection, addDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AddBannerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    linkUrl: "",
    position: "hero",
    active: true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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

    if (!imageFile) {
      toast({
        title: "Image required",
        description: "Please select an image for the banner.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // 1. Upload image to Firebase Storage
      const storageRef = ref(storage, `banners/${Date.now()}_${imageFile.name}`)
      const uploadResult = await uploadBytes(storageRef, imageFile)
      const imageUrl = await getDownloadURL(uploadResult.ref)

      // 2. Save banner data to Firestore
      const bannerData = {
        ...formData,
        imageUrl,
        createdAt: new Date().toISOString(),
      }

      await addDoc(collection(db, "banners"), bannerData)

      toast({
        title: "Banner created",
        description: "The banner has been successfully created.",
      })

      router.push("/admin/banners")
    } catch (error) {
      console.error("Error creating banner:", error)
      toast({
        title: "Error",
        description: "Failed to create banner. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Banners
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add New Banner</CardTitle>
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
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="linkUrl">Link URL (Optional)</Label>
                  <Input
                    id="linkUrl"
                    name="linkUrl"
                    value={formData.linkUrl}
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
                  <Label htmlFor="image">Banner Image</Label>
                  <Input id="image" type="file" accept="image/*" onChange={handleImageChange} required />
                  <p className="text-sm text-gray-500 mt-1">Recommended size: 1920x1080px (16:9 ratio)</p>
                </div>

                {imagePreview && (
                  <div className="mt-4">
                    <Label>Preview</Label>
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
                {loading ? "Creating..." : "Create Banner"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
