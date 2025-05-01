"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function AddBannerPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    position: "home_hero",
    active: true,
    startDate: "",
    endDate: "",
    link: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
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
        title: "Image Required",
        description: "Please select an image for the banner.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Banner Added",
        description: "The banner has been added successfully.",
      })
      router.push("/admin/banners")
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-gold hover:text-gold-deep hover:bg-gold/10"
          asChild
        >
          <Link href="/admin/banners">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 bg-gold-gradient bg-clip-text text-transparent">
            Add New Banner
          </h1>
          <p className="text-offwhite/70 font-body">Create a new promotional banner</p>
        </div>
      </div>

      <Card className="border-gold/30 bg-charcoal">
        <CardHeader className="pb-3">
          <CardTitle className="text-gold font-display">Banner Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-offwhite">
                    Banner Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Summer Sale"
                    required
                    className="border-gold/30 bg-jetblack text-offwhite"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-offwhite">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Get up to 50% off on all signed jerseys"
                    className="border-gold/30 bg-jetblack text-offwhite resize-none"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position" className="text-offwhite">
                    Banner Position
                  </Label>
                  <Select value={formData.position} onValueChange={(value) => handleSelectChange("position", value)}>
                    <SelectTrigger className="border-gold/30 bg-jetblack text-offwhite">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent className="bg-charcoal border-gold/30">
                      <SelectItem value="home_hero" className="text-offwhite hover:text-gold">
                        Home Page Hero
                      </SelectItem>
                      <SelectItem value="home_middle" className="text-offwhite hover:text-gold">
                        Home Page Middle
                      </SelectItem>
                      <SelectItem value="shop_top" className="text-offwhite hover:text-gold">
                        Shop Page Top
                      </SelectItem>
                      <SelectItem value="product_page" className="text-offwhite hover:text-gold">
                        Product Page
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link" className="text-offwhite">
                    Banner Link (Optional)
                  </Label>
                  <Input
                    id="link"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    placeholder="/shop?sale=true"
                    className="border-gold/30 bg-jetblack text-offwhite"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-offwhite">
                      Start Date
                    </Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="border-gold/30 bg-jetblack text-offwhite"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-offwhite">
                      End Date
                    </Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      className="border-gold/30 bg-jetblack text-offwhite"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => handleSwitchChange("active", checked)}
                  />
                  <Label htmlFor="active" className="text-offwhite">
                    Active
                  </Label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-offwhite">
                    Banner Image
                  </Label>
                  <div className="border-2 border-dashed border-gold/30 rounded-lg p-4 text-center">
                    {imagePreview ? (
                      <div className="relative w-full max-w-full mx-auto overflow-hidden rounded-md">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="object-cover w-full h-auto"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImageFile(null)
                            setImagePreview(null)
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="mt-2 flex justify-center">
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer rounded-md bg-gold-soft px-3 py-2 text-sm font-semibold text-jetblack hover:bg-gold-deep"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleImageChange}
                              required
                            />
                          </label>
                        </div>
                        <p className="mt-2 text-sm text-offwhite/70">PNG, JPG, GIF up to 5MB</p>
                        <p className="mt-1 text-xs text-offwhite/50">Recommended size: 1200 x 400 pixels</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                className="border-gold/30 text-gold hover:bg-gold/10"
                onClick={() => router.push("/admin/banners")}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-gold-soft hover:bg-gold-deep text-jetblack" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Banner"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
