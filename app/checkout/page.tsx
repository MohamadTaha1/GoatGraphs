"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/components/ui/use-toast"
import { CreditCard, ArrowLeft, CheckCircle2, Truck, Shield } from "lucide-react"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const { toast } = useToast()
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)

  const deliveryFee = subtotal >= 1000 ? 0 : 50
  const total = subtotal + deliveryFee

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "Dubai",
    zipCode: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    notes: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setOrderComplete(true)
      clearCart()
    }, 2000)
  }

  if (orderComplete) {
    return (
      <div className="container py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6 mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-4 bg-gold-gradient bg-clip-text text-transparent">
            Order Confirmed!
          </h1>
          <p className="text-gray-400 mb-4 font-body">
            Thank you for your purchase. Your order has been confirmed and will be shipped shortly.
          </p>
          <p className="text-gray-400 mb-8 font-body">A confirmation email has been sent to your email address.</p>
          <Button
            asChild
            className="bg-gold-gradient hover:bg-gold-shine bg-[length:200%_auto] hover:animate-gold-shimmer text-black font-body"
          >
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    router.push("/cart")
    return null
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-display font-bold mb-8 bg-gold-gradient bg-clip-text text-transparent">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Checkout Form */}
        <div className="lg:w-2/3">
          <form onSubmit={handleSubmit}>
            <Card className="border border-gold-700 mb-6">
              <CardHeader>
                <CardTitle className="font-display text-gold-500">Shipping Information</CardTitle>
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
                      value={formData.firstName}
                      onChange={handleChange}
                      required
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
                      value={formData.lastName}
                      onChange={handleChange}
                      required
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
                      value={formData.email}
                      onChange={handleChange}
                      required
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
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="border-gold-700"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="font-body">
                    Address
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="border-gold-700"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="font-body">
                      City
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      disabled
                      className="border-gold-700"
                    />
                    <p className="text-xs text-gray-500 font-body">We currently only deliver in Dubai</p>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="zipCode" className="font-body">
                      ZIP / Postal Code
                    </Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      required
                      className="border-gold-700"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="font-body">
                    Order Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="border-gold-700"
                    placeholder="Special instructions for delivery"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gold-700 mb-6">
              <CardHeader>
                <CardTitle className="font-display text-gold-500">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                  <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 bg-black border border-gold-700">
                    <TabsTrigger
                      value="credit-card"
                      className="text-gold-500 data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
                    >
                      <CreditCard className="mr-2 h-4 w-4" /> Credit Card
                    </TabsTrigger>
                    <TabsTrigger
                      value="cash-on-delivery"
                      className="text-gold-500 data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
                    >
                      <Truck className="mr-2 h-4 w-4" /> Cash on Delivery
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="credit-card" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber" className="font-body">
                        Card Number
                      </Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        required={paymentMethod === "credit-card"}
                        className="border-gold-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardName" className="font-body">
                        Name on Card
                      </Label>
                      <Input
                        id="cardName"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleChange}
                        required={paymentMethod === "credit-card"}
                        className="border-gold-700"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate" className="font-body">
                          Expiry Date
                        </Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleChange}
                          placeholder="MM/YY"
                          required={paymentMethod === "credit-card"}
                          className="border-gold-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv" className="font-body">
                          CVV
                        </Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleChange}
                          placeholder="123"
                          required={paymentMethod === "credit-card"}
                          className="border-gold-700"
                        />
                      </div>
                    </div>
                    <div className="flex items-center mt-4">
                      <Shield className="h-5 w-5 text-gold-500 mr-2" />
                      <p className="text-sm text-gray-500 font-body">
                        Your payment information is secure and encrypted
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="cash-on-delivery" className="mt-4">
                    <div className="p-4 bg-black-300 rounded-md border border-gold-700">
                      <p className="font-body text-gray-300">
                        Pay with cash upon delivery. Please ensure you have the exact amount ready. Our delivery
                        personnel will provide a receipt upon payment.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                className="border-gold-500 text-gold-500 hover:bg-gold-500/10 font-body"
                asChild
              >
                <Link href="/cart">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart
                </Link>
              </Button>
              <Button
                type="submit"
                className="bg-gold-gradient hover:bg-gold-shine bg-[length:200%_auto] hover:animate-gold-shimmer text-black font-body"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Complete Order"}
              </Button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <Card className="border border-gold-700 sticky top-20">
            <CardHeader>
              <CardTitle className="font-display text-gold-500">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-contain" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-display font-bold text-sm">{item.name}</h3>
                    <p className="text-gray-500 text-xs font-body">
                      {item.team} {item.size && `• Size ${item.size}`}
                    </p>
                    <div className="flex justify-between mt-1">
                      <p className="text-xs font-body">Qty: {item.quantity}</p>
                      <p className="font-display font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
              <Separator className="my-2 bg-gold-700/50" />
              <div className="flex justify-between font-body">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-body">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</span>
              </div>
              <Separator className="my-2 bg-gold-700/50" />
              <div className="flex justify-between font-display font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex items-center mt-4">
                <Truck className="h-5 w-5 text-gold-500 mr-2" />
                <p className="text-sm text-gray-500 font-body">
                  Delivery available only in Dubai. Free delivery on orders over AED 1,000.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
