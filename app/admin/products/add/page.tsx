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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, ArrowLeft, Info } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { addProduct } from "@/hooks/use-products"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function AddProductPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    type: "shirt",
    signedBy: "",
    price: "",
    available: true,
    description: "",
    isPreOrder: false, // Added isPreOrder field with default false
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

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value === "true" }))
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
    setIsSubmitting(true)

    if (!imageFile) {
      toast({
        title: "Image Required",
        description: "Please upload a product image.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const productData = {
        title: formData.title,
        type: formData.type as "shirt" | "ball" | "photo",
        signedBy: formData.signedBy,
        price: Number.parseFloat(formData.price),
        available: formData.available,
        description: formData.description,
        isPreOrder: formData.isPreOrder, // Include isPreOrder field
      }

      const productId = await addProduct(productData, imageFile)

      if (productId) {
        toast({
          title: "Product Added",
          description: "The product has been added successfully.",
        })
        router.push("/admin/products")
      } else {
        throw new Error("Failed to add product")
      }
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: "Failed to add the product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
          <Link href="/admin/products">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 bg-gold-gradient bg-clip-text text-transparent">
            Add New Product
          </h1>
          <p className="text-offwhite/70 font-body">Create a new product listing</p>
        </div>
      </div>

      <Card className="border-gold/30 bg-charcoal">
        <CardHeader className="pb-3">
          <CardTitle className="text-gold font-display">Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Category Selection (In-Stock or Pre-Order) */}
            <div className="p-4 border border-gold/30 rounded-lg bg-jetblack/50">
              <div className="flex items-center mb-2">
                <h3 className="text-lg font-display text-gold">Product Category</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-2 text-gold/70 hover:text-gold">
                        <Info className="h-4 w-4" />
                        <span className="sr-only">Product category information</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>
                        Choose where this product should appear in the shop:
                        <br />
                        <strong>In-Stock Products:</strong> Regular products available for immediate purchase.
                        <br />
                        <strong>Custom Pre-Orders:</strong> Products that appear in the pre-order section.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <RadioGroup
                value={formData.isPreOrder ? "true" : "false"}
                onValueChange={(value) => handleRadioChange("isPreOrder", value)}
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-2 p-3 rounded-md border border-gold/20 bg-charcoal/50 hover:bg-charcoal/80 transition-colors">
                  <RadioGroupItem value="false" id="in-stock" className="text-gold" />
                  <Label htmlFor="in-stock" className="text-offwhite font-medium cursor-pointer flex-1">
                    In-Stock Product
                    <span className="block text-sm text-offwhite/70 font-normal mt-1">
                      Appears in the "In-Stock Products" tab in the shop
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-md border border-gold/20 bg-charcoal/50 hover:bg-charcoal/80 transition-colors">
                  <RadioGroupItem value="true" id="pre-order" className="text-gold" />
                  <Label htmlFor="pre-order" className="text-offwhite font-medium cursor-pointer flex-1">
                    Custom Pre-Order
                    <span className="block text-sm text-offwhite/70 font-normal mt-1">
                      Appears in the "Custom Pre-Orders" tab in the shop
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-offwhite">
                    Product Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Signed Messi Shirt"
                    required
                    className="border-gold/30 bg-jetblack text-offwhite"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-offwhite">
                    Product Type
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                    <SelectTrigger className="border-gold/30 bg-jetblack text-offwhite">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-charcoal border-gold/30">
                      <SelectItem value="shirt" className="text-offwhite hover:text-gold">
                        Shirt
                      </SelectItem>
                      <SelectItem value="ball" className="text-offwhite hover:text-gold">
                        Ball
                      </SelectItem>
                      <SelectItem value="photo" className="text-offwhite hover:text-gold">
                        Photo
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signedBy" className="text-offwhite">
                    Signed By
                  </Label>
                  <Input
                    id="signedBy"
                    name="signedBy"
                    value={formData.signedBy}
                    onChange={handleInputChange}
                    placeholder="Lionel Messi"
                    required
                    className="border-gold/30 bg-jetblack text-offwhite"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-offwhite">
                    Price (USD)
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="120.00"
                    required
                    className="border-gold/30 bg-jetblack text-offwhite"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="available"
                    checked={formData.available}
                    onCheckedChange={(checked) => handleSwitchChange("available", checked)}
                  />
                  <Label htmlFor="available" className="text-offwhite">
                    {formData.isPreOrder ? "Available for pre-order" : "Available in stock"}
                  </Label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-offwhite">
                    Product Image
                  </Label>
                  <div className="border-2 border-dashed border-gold/30 rounded-lg p-4 text-center">
                    {imagePreview ? (
                      <div className="relative aspect-square w-full max-w-[300px] mx-auto overflow-hidden rounded-md">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="object-cover w-full h-full"
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
                      </>
                    )}
                  </div>
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
                    placeholder={
                      formData.isPreOrder
                        ? "Custom pre-order jersey with authentic signature. Delivery in 3-4 weeks."
                        : "Authentic signed shirt from 2022 World Cup season."
                    }
                    rows={5}
                    className="border-gold/30 bg-jetblack text-offwhite resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                className="border-gold/30 text-gold hover:bg-gold/10"
                onClick={() => router.push("/admin/products")}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-gold-soft hover:bg-gold-deep text-jetblack" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                  </>
                ) : (
                  "Create Product"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
