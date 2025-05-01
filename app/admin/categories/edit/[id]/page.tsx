"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Upload } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { getCategory, updateCategory } from "@/hooks/use-categories"

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [featured, setFeatured] = useState(false)
  const [order, setOrder] = useState(0)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch category data
  useEffect(() => {
    async function fetchCategory() {
      try {
        setIsLoading(true)
        const category = await getCategory(id)

        if (category) {
          setName(category.name)
          setSlug(category.slug)
          setDescription(category.description)
          setFeatured(category.featured)
          setOrder(category.order || 0)
          setCurrentImageUrl(category.imageUrl || null)
          setImagePreview(category.imageUrl || null)
        } else {
          toast({
            title: "Category not found",
            description: "The requested category could not be found.",
            variant: "destructive",
          })
          router.push("/admin/categories")
        }
      } catch (error) {
        console.error("Error fetching category:", error)
        toast({
          title: "Error",
          description: "Failed to load category. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategory()
  }, [id, router])

  // Generate slug from name
  const handleNameChange = (value: string) => {
    setName(value)
    // Only auto-update slug if it hasn't been manually edited
    if (
      slug ===
      name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
    ) {
      setSlug(
        value
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      )
    }
  }

  // Handle image upload
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !slug || !description) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const categoryData = {
        name,
        slug,
        description,
        featured,
        order,
      }

      const success = await updateCategory(id, categoryData, imageFile || undefined)

      if (success) {
        toast({
          title: "Category updated",
          description: "The category has been updated successfully.",
        })
        router.push("/admin/categories")
      } else {
        throw new Error("Failed to update category")
      }
    } catch (error) {
      console.error("Error updating category:", error)
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <span className="ml-2 text-offwhite">Loading category...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 bg-gold-gradient bg-clip-text text-transparent">
            Edit Category
          </h1>
          <p className="text-offwhite/70 font-body">Update category information</p>
        </div>

        <Button asChild variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
          <Link href="/admin/categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Link>
        </Button>
      </div>

      <Card className="border-gold/30 bg-charcoal">
        <CardHeader className="pb-3">
          <CardTitle className="text-gold font-display">Category Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-offwhite">
                  Category Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="border-gold/30 bg-jetblack text-offwhite"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-offwhite">
                  Slug <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="border-gold/30 bg-jetblack text-offwhite"
                  required
                />
                <p className="text-xs text-offwhite/50">
                  URL-friendly version of the name. Auto-generated but can be edited.
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="text-offwhite">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border-gold/30 bg-jetblack text-offwhite min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order" className="text-offwhite">
                  Display Order
                </Label>
                <Input
                  id="order"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number.parseInt(e.target.value) || 0)}
                  className="border-gold/30 bg-jetblack text-offwhite"
                />
                <p className="text-xs text-offwhite/50">Categories with lower numbers appear first.</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured" className="text-offwhite">
                    Featured Category
                  </Label>
                  <Switch
                    id="featured"
                    checked={featured}
                    onCheckedChange={setFeatured}
                    className="data-[state=checked]:bg-gold"
                  />
                </div>
                <p className="text-xs text-offwhite/50">
                  Featured categories are displayed prominently on the homepage.
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="image" className="text-offwhite">
                  Category Image
                </Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gold/30 text-gold hover:bg-gold/10"
                    onClick={() => document.getElementById("image")?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {currentImageUrl ? "Change Image" : "Select Image"}
                  </Button>
                  <Input id="image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  <span className="text-sm text-offwhite/70">
                    {imageFile ? imageFile.name : currentImageUrl ? "Current image will be used" : "No image selected"}
                  </span>
                </div>
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm text-offwhite mb-2">Preview:</p>
                    <div className="relative h-40 w-40 border border-gold/30 rounded-md overflow-hidden">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Category preview"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                className="border-gold/30 text-offwhite hover:bg-gold/10"
                onClick={() => router.push("/admin/categories")}
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
                  "Update Category"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
