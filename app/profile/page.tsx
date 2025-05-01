"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { User, Package, CreditCard, LogOut, Save } from "lucide-react"

export default function ProfilePage() {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)

  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+971 50 123 4567",
    address: "123 Sheikh Zayed Road",
    city: "Dubai",
    zipCode: "12345",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    setIsEditing(false)
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    })
  }

  // Mock order history
  const orders = [
    {
      id: "ORD-1234",
      date: "2023-12-15",
      status: "Delivered",
      total: 1299.99,
      items: [{ name: "Cristiano Ronaldo Signed Jersey", quantity: 1 }],
    },
    {
      id: "ORD-1235",
      date: "2023-11-28",
      status: "Delivered",
      total: 2499.98,
      items: [
        { name: "Lionel Messi Signed Jersey", quantity: 1 },
        { name: "Kylian Mbappé Signed Jersey", quantity: 1 },
      ],
    },
  ]

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-display font-bold mb-8 bg-gold-gradient bg-clip-text text-transparent">
        My Profile
      </h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 lg:w-[400px] bg-black border border-gold-700 mb-8">
          <TabsTrigger
            value="profile"
            className="text-gold-500 data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
          >
            <User className="mr-2 h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="text-gold-500 data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
          >
            <Package className="mr-2 h-4 w-4" /> Orders
          </TabsTrigger>
          <TabsTrigger
            value="payment"
            className="text-gold-500 data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
          >
            <CreditCard className="mr-2 h-4 w-4" /> Payment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border border-gold-700">
            <CardHeader>
              <CardTitle className="font-display text-gold-500">Personal Information</CardTitle>
              <CardDescription className="font-body">
                Manage your personal information and delivery address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="font-body">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border-gold-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="font-body">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border-gold-700"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-body">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border-gold-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-body">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border-gold-700"
                  />
                </div>
              </div>
              <Separator className="my-4 bg-gold-700/50" />
              <h3 className="font-display font-semibold text-gold-500">Delivery Address</h3>
              <div className="space-y-2">
                <Label htmlFor="address" className="font-body">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={profileData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="border-gold-700"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="font-body">
                    City
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={profileData.city}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border-gold-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="font-body">
                    ZIP / Postal Code
                  </Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={profileData.zipCode}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border-gold-700"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    className="border-gold-500 text-gold-500 hover:bg-gold-500/10 font-body"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-gold-gradient hover:bg-gold-shine bg-[length:200%_auto] hover:animate-gold-shimmer text-black font-body"
                    onClick={handleSave}
                  >
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  className="bg-gold-gradient hover:bg-gold-shine bg-[length:200%_auto] hover:animate-gold-shimmer text-black font-body"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="border border-gold-700">
            <CardHeader>
              <CardTitle className="font-display text-gold-500">Order History</CardTitle>
              <CardDescription className="font-body">View your past orders and their status.</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="border border-gold-700">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                          <div>
                            <h3 className="font-display font-bold">{order.id}</h3>
                            <p className="text-sm text-gray-500 font-body">
                              {new Date(order.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <div className="mt-2 sm:mt-0">
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-body ${
                                order.status === "Delivered"
                                  ? "bg-green-500/20 text-green-500"
                                  : order.status === "Processing"
                                    ? "bg-blue-500/20 text-blue-500"
                                    : "bg-yellow-500/20 text-yellow-500"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <Separator className="my-2 bg-gold-700/50" />
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <p className="font-body">
                                {item.name} <span className="text-gray-500">x{item.quantity}</span>
                              </p>
                            </div>
                          ))}
                        </div>
                        <Separator className="my-2 bg-gold-700/50" />
                        <div className="flex justify-between">
                          <p className="font-display font-bold">Total</p>
                          <p className="font-display font-bold">${order.total.toFixed(2)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                  <h3 className="font-display font-bold text-lg mb-2">No Orders Yet</h3>
                  <p className="text-gray-500 font-body mb-4">You haven't placed any orders yet.</p>
                  <Button
                    asChild
                    className="bg-gold-gradient hover:bg-gold-shine bg-[length:200%_auto] hover:animate-gold-shimmer text-black font-body"
                  >
                    <Link href="/shop">Start Shopping</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card className="border border-gold-700">
            <CardHeader>
              <CardTitle className="font-display text-gold-500">Payment Methods</CardTitle>
              <CardDescription className="font-body">Manage your saved payment methods.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                <h3 className="font-display font-bold text-lg mb-2">No Saved Payment Methods</h3>
                <p className="text-gray-500 font-body mb-4">You don't have any saved payment methods yet.</p>
                <p className="text-gray-500 font-body mb-4">
                  Payment methods will be saved when you complete a purchase.
                </p>
                <Button
                  asChild
                  className="bg-gold-gradient hover:bg-gold-shine bg-[length:200%_auto] hover:animate-gold-shimmer text-black font-body"
                >
                  <Link href="/shop">Start Shopping</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center">
        <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10 font-body">
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </div>
    </div>
  )
}
