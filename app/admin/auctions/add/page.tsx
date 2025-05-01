"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { uploadFile } from "@/lib/firebase/storage"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, ArrowLeft, Calendar } from "lucide-react"
import Image from "next/image"

export default function AddAuctionPage() {
  const [formData, setFormData] = useState({
    playerName: "",
    team: "",
    description: "",
    startingBid: 0,
    endTime: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "startingBid" ? Number.parseFloat(value) || 0 : value,
    }))
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
      // Validate form
      if (!formData.playerName || !formData.team || !formData.endTime || formData.startingBid <= 0) {
        throw new Error("Please fill in all required fields")
      }

      if (!imageFile) {
        throw new Error("Please upload an image")
      }

      // Upload image
      const imagePath = `auctions/${Date.now()}-${imageFile.name}`
      const imageUrl = await uploadFile(imageFile, imagePath)

      // Create auction document
      const db = getFirestoreInstance()
      const auctionData = {
        ...formData,
        image: imageUrl,
        currentBid: formData.startingBid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        bidHistory: [],
      }

      const docRef = await addDoc(collection(db, "auctions"), auctionData)

      toast({
        title: "Success",
        description: "Auction created successfully",
      })

      router.push("/admin/auctions")
    } catch (error) {
      console.error("Error creating auction:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create auction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/auctions")}
          className="text-offwhite hover:text-gold mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold text-offwhite">Add New Auction</h1>
      </div>

      <Card className="border-gold/30 bg-charcoal max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-offwhite">Auction Details</CardTitle>
          <CardDescription className="text-offwhite/70">
            Create a new auction for a signed jersey or memorabilia
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image" className="text-offwhite">
                Item Image <span className="text-red-500">*</span>
              </Label>
              <div
                className="border-2 border-dashed border-gold/30 rounded-lg p-4 text-center cursor-pointer hover:bg-jetblack/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="relative h-64 w-full">
                    <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-contain" />
                  </div>
                ) : (
                  <div className="py-12">
                    <Upload className="h-12 w-12 mx-auto text-offwhite/50 mb-2" />
                    <p className="text-offwhite">Click to upload image</p>
                    <p className="text-offwhite/50 text-sm mt-1">PNG, JPG or WEBP (max 5MB)</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  id="image"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            {/* Player Name */}
            <div className="space-y-2">
              <Label htmlFor="playerName" className="text-offwhite">
                Player Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="playerName"
                name="playerName"
                value={formData.playerName}
                onChange={handleChange}
                className="border-gold/30 bg-jetblack text-offwhite"
                placeholder="e.g. Lionel Messi"
                required
              />
            </div>

            {/* Team */}
            <div className="space-y-2">
              <Label htmlFor="team" className="text-offwhite">
                Team <span className="text-red-500">*</span>
              </Label>
              <Input
                id="team"
                name="team"
                value={formData.team}
                onChange={handleChange}
                className="border-gold/30 bg-jetblack text-offwhite"
                placeholder="e.g. Argentina"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-offwhite">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="border-gold/30 bg-jetblack text-offwhite min-h-[100px]"
                placeholder="Describe the auction item..."
              />
            </div>

            {/* Starting Bid */}
            <div className="space-y-2">
              <Label htmlFor="startingBid" className="text-offwhite">
                Starting Bid ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startingBid"
                name="startingBid"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.startingBid || ""}
                onChange={handleChange}
                className="border-gold/30 bg-jetblack text-offwhite"
                placeholder="0.00"
                required
              />
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-offwhite flex items-center">
                End Time <span className="text-red-500">*</span>
                <Calendar className="ml-2 h-4 w-4 text-offwhite/50" />
              </Label>
              <Input
                id="endTime"
                name="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={handleChange}
                className="border-gold/30 bg-jetblack text-offwhite"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/auctions")}
              className="border-gold/30 text-offwhite hover:bg-jetblack"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gold-soft hover:bg-gold-deep text-jetblack">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                "Create Auction"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
