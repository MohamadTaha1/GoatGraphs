"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { collection, addDoc, Timestamp } from "firebase/firestore"

export default function AddCustomerPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    phoneNumber: "",
    role: "customer",
    newsletter: false,
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const db = getFirestoreInstance()
      if (!db) {
        throw new Error("Firestore instance is null")
      }

      // Create user document
      const userData = {
        ...formData,
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now(),
        status: "active",
        wishlist: [],
        orderCount: 0,
        totalSpent: 0,
      }

      const docRef = await addDoc(collection(db, "users"), userData)

      toast({
        title: "Customer Added",
        description: "The customer has been added successfully.",
      })

      router.push(`/admin/customers/${docRef.id}`)
    } catch (error) {
      console.error("Error adding customer:", error)
      toast({
        title: "Error",
        description: "Failed to add the customer. Please try again.",
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
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 bg-gold-gradient bg-clip-text text-transparent">
            Add New Customer
          </h1>
          <p className="text-offwhite/70 font-body">Create a new customer account</p>
        </div>
      </div>

      <Card className="border-gold/30 bg-charcoal">
        <CardHeader className="pb-3">
          <CardTitle className="text-gold font-display">Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-offwhite">
                    Full Name
                  </Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    required
                    className="border-gold/30 bg-jetblack text-offwhite"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-offwhite">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="border-gold/30 bg-jetblack text-offwhite"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-offwhite">
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="border-gold/30 bg-jetblack text-offwhite"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-offwhite">
                    Role
                  </Label>
                  <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                    <SelectTrigger id="role" className="border-gold/30 bg-jetblack text-offwhite">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-charcoal border-gold/30">
                      <SelectItem value="customer" className="text-offwhite hover:text-gold">
                        Customer
                      </SelectItem>
                      <SelectItem value="admin" className="text-offwhite hover:text-gold">
                        Admin
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="newsletter"
                    checked={formData.newsletter}
                    onCheckedChange={(checked) => handleSwitchChange("newsletter", checked)}
                  />
                  <Label htmlFor="newsletter" className="text-offwhite">
                    Subscribe to newsletter
                  </Label>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-display font-semibold text-gold">Address Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="line1" className="text-offwhite">
                    Address Line 1
                  </Label>
                  <Input
                    id="line1"
                    name="line1"
                    value={formData.address.line1}
                    onChange={handleAddressChange}
                    className="border-gold/30 bg-jetblack text-offwhite"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="line2" className="text-offwhite">
                    Address Line 2 (Optional)
                  </Label>
                  <Input
                    id="line2"
                    name="line2"
                    value={formData.address.line2}
                    onChange={handleAddressChange}
                    className="border-gold/30 bg-jetblack text-offwhite"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-offwhite">
                      City
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.address.city}
                      onChange={handleAddressChange}
                      className="border-gold/30 bg-jetblack text-offwhite"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-offwhite">
                      State/Province
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.address.state}
                      onChange={handleAddressChange}
                      className="border-gold/30 bg-jetblack text-offwhite"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-offwhite">
                      Postal Code
                    </Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.address.postalCode}
                      onChange={handleAddressChange}
                      className="border-gold/30 bg-jetblack text-offwhite"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-offwhite">
                      Country
                    </Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.address.country}
                      onChange={handleAddressChange}
                      className="border-gold/30 bg-jetblack text-offwhite"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                className="border-gold/30 text-gold hover:bg-gold/10"
                onClick={() => router.push("/admin/customers")}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-gold-soft hover:bg-gold-deep text-jetblack" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                  </>
                ) : (
                  "Add Customer"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
