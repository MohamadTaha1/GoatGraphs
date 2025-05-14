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
import { ArrowLeft, Loader2, Upload, X, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { getStorageInstance } from "@/lib/firebase/storage"

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [category, setCategory] = useState({
    id: "",
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    featured: false,
  })

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true)
        const db = getFirestoreInstance()
        if (!db) {
          throw new Error("Firestore is not available")
        }

        // Dynamically import Firestore functions
        const { doc, getDoc } = await import("firebase/firestore")
        const categoryRef = doc(db, "categories", params.id)
        const categorySnap = await getDoc(categoryRef)

        if (categorySnap.exists()) {
          const categoryData = categorySnap.data()
          setCategory({
            id: categorySnap.id,
            name: categoryData.name || "",
            slug: categoryData.slug || "",
            description: categoryData.description || "",
            imageUrl: categoryData.imageUrl || "",
            featured: categoryData.featured || false,
          })
          setImagePreview(categoryData.imageUrl || null)
        } else {
          setError("Category not found")
        }
      } catch (err) {
        console.error("Error fetching category:", err)
        setError("Failed to load category. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (params.id !== "new") {
      fetchCategory()
    } else {
      // New category
      setCategory({
        id: "new",
        name: "",
        slug: "",
        description: "",
        imageUrl: "",
        featured: false,
      })
      setLoading(false)
    }
  }, [params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCategory((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setCategory((prev) => ({ ...prev, featured: checked }))
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

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setCategory((prev) => ({ ...prev, imageUrl: "" }))
  }

  const generateSlug = () => {
    const slug = category.name
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")
    setCategory((prev) => ({ ...prev, slug }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const db = getFirestoreInstance()
      if (!db) {
        throw new Error("Firestore is not available")
      }

      // Validate form
      if (!category.name || !category.slug) {
        toast({
          title: "Validation Error",
          description: "Name and slug are required fields.",
          variant: "destructive",
        })
        setSaving(false)
        return
      }

      // Upload image if selected
      let imageUrl = category.imageUrl
      if (imageFile) {
        const storage = getStorageInstance()
        if (!storage) {
          throw new Error("Storage is not available")
        }

        // Dynamically import Storage functions
        const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage")
        const storageRef = ref(storage, `categories/${Date.now()}_${imageFile.name}`)
        const snapshot = await uploadBytes(storageRef, imageFile)
        imageUrl = await getDownloadURL(snapshot.ref)
      }

      // Prepare category data
      const categoryData = {
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl,
        featured: category.featured,
        updatedAt: new Date(),
      }

      // Add createdAt for new categories
      if (params.id === "new") {
        categoryData.createdAt = new Date()
      }

      // Save to Firestore
      const { doc, setDoc, collection, addDoc } = await import("firebase/firestore")

      if (params.id === "new") {
        // Create new category
        await addDoc(collection(db, "categories"), categoryData)
        toast({
          title: "Success",
          description: "Category created successfully!",
        })
      } else {
        // Update existing category
        const categoryRef = doc(db, "categories", params.id)
        await setDoc(categoryRef, categoryData, { merge: true })
        toast({
          title: "Success",
          description: "Category updated successfully!",
        })
      }

      // Navigate back to categories list
      router.push("/admin/categories")
    } catch (err) {
      console.error("Error saving category:", err)
      toast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gold mr-2" />
        <span>Loading category...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-8 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-red-500 mb-2">Error</h3>
        <p className="text-gray-200 mb-4">{error}</p>
        <Button
          variant="outline"
          className="border-gold text-gold hover:bg-gold/10"
          onClick={() => router.push("/admin/categories")}
        >
          Back to Categories
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="outline"
            size="sm"
            className="mb-4 border-gold text-gold"
            onClick={() => router.push("/admin/categories")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Button>
          <h1 className="text-3xl font-display font-bold mb-2 bg-gold-gradient bg-clip-text text-transparent">
            {params.id === "new" ? "Add New Category" : "Edit Category"}
          </h1>
        </div>
      </div>

      <Card className="border-gold/30 bg-charcoal">
        <CardHeader>
          <CardTitle className="text-gold font-display">Category Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-offwhite">
                    Category Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={category.name}
                    onChange={handleInputChange}
                    className="border-gold/30 bg-jetblack text-offwhite"
                    placeholder="Enter category name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug" className="text-offwhite">
                    Slug
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="slug"
                      name="slug"
                      value={category.slug}
                      onChange={handleInputChange}
                      className="border-gold/30 bg-jetblack text-offwhite"
                      placeholder="category-slug"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gold/30 text-gold hover:bg-gold/10"
                      onClick={generateSlug}
                    >
                      Generate
                    </Button>
                  </div>
                  <p className="text-xs text-offwhite/60 mt-1">Used in URLs, auto-generated from name</p>
                </div>

                <div>
                  <Label htmlFor="description" className="text-offwhite">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={category.description}
                    onChange={handleInputChange}
                    className="border-gold/30 bg-jetblack text-offwhite min-h-[120px]"
                    placeholder="Enter category description"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="featured" checked={category.featured} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="featured" className="text-offwhite">
                    Featured Category
                  </Label>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-offwhite">Category Image</Label>
                <div className="border-2 border-dashed border-gold/30 rounded-lg p-4 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <div className="relative h-[200px] w-full mb-2">
                        <Image
                          src={imagePreview || "/placeholder.svg"}
                          alt={category.name}
                          fill
                          className="object-contain rounded-md"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <p className="text-sm text-offwhite/70 mt-2">{imageFile ? imageFile.name : "Current image"}</p>
                    </div>
                  ) : (
                    <div className="py-8">
                      <Upload className="h-10 w-10 text-gold/50 mx-auto mb-2" />
                      <p className="text-offwhite/70 mb-2">Drag and drop an image or click to browse</p>
                      <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      <Button
                        type="button"
                        variant="outline"
                        className="border-gold/30 text-gold hover:bg-gold/10"
                        onClick={() => document.getElementById("image")?.click()}
                      >
                        Select Image
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-offwhite/60">
                  Recommended size: 800x600px. Max file size: 2MB. Formats: JPG, PNG, WebP
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                className="border-gold/30 text-gold hover:bg-gold/10"
                onClick={() => router.push("/admin/categories")}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-gold-gradient hover:bg-gold-shine text-black" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Category"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
