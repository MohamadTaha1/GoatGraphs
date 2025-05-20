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
import { Loader2, ArrowLeft, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { addProduct } from "@/hooks/use-products"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { collection, addDoc } from "firebase/firestore"
import { getFirestoreInstance } from "@/lib/firebase/firestore"

export default function AddProductPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [corsWarning, setCorsWarning] = useState<boolean>(false)
  const [usedPlaceholder, setUsedPlaceholder] = useState<boolean>(false)
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
  const [uploadProgress, setUploadProgress] = useState<number>(0)

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

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        })
        return
      }

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
    setError(null)
    setCorsWarning(false)
    setUsedPlaceholder(false)
    setUploadProgress(0)

    if (!imageFile) {
      toast({
        title: "Image Required",
        description: "Please select an image for the product.",
        variant: "destructive",
      })
      return
    }

    // Validate price
    if (isNaN(Number.parseFloat(formData.price)) || Number.parseFloat(formData.price) <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price greater than zero.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Start a fake progress indicator
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 5
      })
    }, 500)

    try {
      console.log("Form submitted with data:", formData)

      const productData = {
        title: formData.title.trim(),
        type: formData.type as "shirt" | "ball" | "photo",
        signedBy: formData.signedBy.trim(),
        price: Number.parseFloat(formData.price),
        available: formData.available,
        description: formData.description.trim(),
        isPreOrder: formData.isPreOrder, // Include isPreOrder field
        // Add these fields to ensure compatibility with queries
        featured: !formData.isPreOrder, // Only in-stock products can be featured
        topSelling: false,
        soldCount: 0,
      }

      console.log("Calling addProduct with:", productData)

      const productId = await addProduct(productData, imageFile)

      // Complete the progress bar
      clearInterval(progressInterval)
      setUploadProgress(100)

      if (productId) {
        console.log("Product added successfully with ID:", productId)

        // Check if the product was added with a placeholder image
        if (productId && typeof window !== "undefined") {
          // We'll check this in the next step after redirecting
          toast({
            title: "Product Added Successfully",
            description: `The ${formData.isPreOrder ? "pre-order" : "in-stock"} product has been added to your inventory.`,
          })

          // Short delay before redirecting to ensure toast is seen
          setTimeout(() => {
            router.push("/admin/products")
          }, 1500)
        }
      } else {
        throw new Error("Failed to add product - no product ID returned")
      }
    } catch (error) {
      console.error("Error adding product:", error)
      clearInterval(progressInterval)

      // Check if it's a timeout or CORS error
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (errorMessage.toLowerCase().includes("timed out")) {
        setError("Upload timed out. Your image may be too large or there might be network connectivity issues.")

        // Offer to continue with a placeholder
        setUsedPlaceholder(true)

        toast({
          title: "Upload Timed Out",
          description: "Would you like to continue with a placeholder image instead?",
          variant: "destructive",
        })
      } else if (errorMessage.toLowerCase().includes("cors")) {
        setError(
          "CORS Error: Firebase Storage is not configured to allow uploads from this domain. Please configure CORS settings in Firebase.",
        )
        setCorsWarning(true)

        toast({
          title: "CORS Error",
          description: "Firebase Storage is not configured correctly. See instructions below.",
          variant: "destructive",
        })
      } else {
        setError(errorMessage)

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to continue with a placeholder image
  const continueWithPlaceholder = async () => {
    if (!imageFile) return

    setIsSubmitting(true)
    setError(null)

    try {
      const productData = {
        title: formData.title.trim(),
        type: formData.type as "shirt" | "ball" | "photo",
        signedBy: formData.signedBy.trim(),
        price: Number.parseFloat(formData.price),
        available: formData.available,
        description: formData.description.trim(),
        isPreOrder: formData.isPreOrder, // Include isPreOrder field
        featured: !formData.isPreOrder, // Only in-stock products can be featured
        topSelling: false,
        soldCount: 0,
      }

      // Create a descriptive placeholder
      const productTitle = encodeURIComponent(productData.title)
      const playerName = encodeURIComponent(productData.signedBy)
      const placeholderQuery = `${productTitle} signed by ${playerName}`

      // Create a product with a placeholder image
      const newProductData = {
        ...productData,
        imageUrl: `/placeholder.svg?height=400&width=400&query=${placeholderQuery}`,
        imagePath: null,
        createdAt: new Date().toISOString(),
        usesPlaceholder: true,
      }

      // Add to Firestore directly
      const db = getFirestoreInstance()
      const docRef = await addDoc(collection(db, "products"), newProductData)

      toast({
        title: "Product Added with Placeholder",
        description: `The ${formData.isPreOrder ? "pre-order" : "in-stock"} product has been added with a placeholder image.`,
      })

      // Short delay before redirecting
      setTimeout(() => {
        router.push("/admin/products")
      }, 1500)
    } catch (error) {
      console.error("Error adding product with placeholder:", error)
      setError(`Failed to add product: ${error instanceof Error ? error.message : String(error)}`)

      toast({
        title: "Error",
        description: "Failed to add product with placeholder image.",
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
          <p className="text-offwhite/70 font-body">Create a new product in your inventory</p>
        </div>
      </div>

      {corsWarning && (
        <Alert variant="warning" className="bg-amber-900/20 border-amber-500 text-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-200">Firebase Storage CORS Issue</AlertTitle>
          <AlertDescription className="text-amber-100/80">
            <p>Your Firebase Storage is not configured to allow uploads from this domain.</p>
            <p className="mt-2">To fix this, run the following commands:</p>
            <pre className="mt-2 p-2 bg-black/30 rounded text-xs overflow-x-auto">
              {`# Create a cors.json file with:
[
  {
    "origin": ["${typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}", "http://localhost:3000"],
    "method": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "x-goog-*"]
  }
]

# Then run:
firebase storage:cors set cors.json --project goatgraphs-shirts`}
            </pre>
            <div className="mt-4">
              <Button
                onClick={continueWithPlaceholder}
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Continue with Placeholder Image
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {usedPlaceholder && !corsWarning && (
        <Alert variant="warning" className="bg-amber-900/20 border-amber-500 text-amber-200">
          <Info className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-200">Upload Timed Out</AlertTitle>
          <AlertDescription className="text-amber-100/80">
            <p>The image upload timed out. This could be due to:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Large image file size</li>
              <li>Slow network connection</li>
              <li>Firebase Storage configuration issues</li>
            </ul>
            <div className="mt-4">
              <Button
                onClick={continueWithPlaceholder}
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Continue with Placeholder Image
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {error && !corsWarning && !usedPlaceholder && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border-gold/30 bg-charcoal">
        <CardHeader className="pb-3">
          <CardTitle className="text-gold font-display">Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Type Selection (In-Stock or Pre-Order) */}
            <div className="space-y-2">
              <Label className="text-offwhite">Product Category</Label>
              <RadioGroup
                value={formData.isPreOrder ? "true" : "false"}
                onValueChange={(value) => handleRadioChange("isPreOrder", value)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="in-stock" />
                  <Label htmlFor="in-stock" className="text-offwhite">
                    In-Stock Product (appears in "In-Stock Products" tab)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="pre-order" />
                  <Label htmlFor="pre-order" className="text-offwhite">
                    Custom Pre-Order (appears in "Custom Pre-Orders" tab)
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
                    min="0.01"
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

            {isSubmitting && (
              <div className="w-full bg-jetblack rounded-full h-2.5 mb-4">
                <div
                  className="bg-gold h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
                <p className="text-xs text-offwhite/70 mt-1 text-center">
                  {uploadProgress < 100 ? "Uploading..." : "Upload complete!"}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                className="border-gold/30 text-gold hover:bg-gold/10"
                onClick={() => router.push("/admin/products")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-gold-soft hover:bg-gold-deep text-jetblack" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Product"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
