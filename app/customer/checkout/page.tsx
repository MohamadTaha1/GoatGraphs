"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/utils"
import { Loader2, CreditCard, ShoppingBag } from "lucide-react"
import Image from "next/image"
import { createProductOrder } from "@/lib/order-service"
import { useToast } from "@/components/ui/use-toast"

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { items, clearCart } = useCart()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [orderId, setOrderId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (items.length === 0) {
      router.push("/customer/shop")
      return
    }

    // Pre-fill user data if available
    setFormData((prev) => ({
      ...prev,
      name: user.displayName || "",
      email: user.email || "",
    }))
  }, [user, items, router])

  const handleChange = (e) => {
    const { name, value } = e.target

    // Handle nested address fields
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  // Calculate order totals
  const calculateOrderTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping = subtotal > 150 ? 0 : 15 // Free shipping over $150
    const tax = subtotal * 0.1 // 10% tax
    const orderTotal = subtotal + shipping + tax

    return {
      subtotal,
      shipping,
      tax,
      total: orderTotal,
    }
  }

  const { subtotal, shipping, tax } = calculateOrderTotals()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Get order totals
      const totals = calculateOrderTotals()

      // Create order data
      const orderData = {
        userId: user.uid,
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        },
        items: items.map((item) => ({
          productId: item.id || item.productId,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.image || item.imageUrl,
        })),
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        paymentMethod: paymentMethod === "credit-card" ? "Credit Card" : "PayPal",
        paymentStatus: "paid", // In a real app, this would be determined by payment processing
        orderStatus: "pending",
        shippingMethod: "Standard",
        history: [
          {
            status: "pending",
            timestamp: new Date(),
            comment: "Order placed by customer",
          },
        ],
      }

      console.log("Creating order with data:", orderData)

      // Create the order in Firestore
      const newOrderId = await createProductOrder(orderData)
      console.log("Order created with ID:", newOrderId)
      setOrderId(newOrderId)

      // Show success toast
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${newOrderId.slice(0, 8)} has been placed and is being processed.`,
        duration: 5000,
      })

      // Clear the cart
      clearCart()

      // Simulate payment processing
      setTimeout(() => {
        setIsSubmitting(false)
        router.push(`/customer/checkout/success?orderId=${newOrderId}`)
      }, 1500)
    } catch (error) {
      console.error("Error processing order:", error)
      setIsSubmitting(false)

      // Show error toast
      toast({
        title: "Order Failed",
        description: "There was a problem processing your order. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  if (!user || items.length === 0) {
    return null // Handled by redirect
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-display font-bold mb-8 bg-gold-gradient bg-clip-text text-transparent">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card className="mb-8 border-gold/30 bg-charcoal">
              <CardHeader>
                <CardTitle className="text-gold">Contact Information</CardTitle>
                <CardDescription className="text-offwhite/60">
                  Please provide your contact details for order confirmation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="border-gold/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="border-gold/20"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="border-gold/20"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8 border-gold/30 bg-charcoal">
              <CardHeader>
                <CardTitle className="text-gold">Shipping Address</CardTitle>
                <CardDescription className="text-offwhite/60">
                  Enter the address where you'd like to receive your order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address.line1">Address Line 1</Label>
                  <Input
                    id="address.line1"
                    name="address.line1"
                    value={formData.address.line1}
                    onChange={handleChange}
                    required
                    className="border-gold/20"
                  />
                </div>
                <div>
                  <Label htmlFor="address.line2">Address Line 2 (Optional)</Label>
                  <Input
                    id="address.line2"
                    name="address.line2"
                    value={formData.address.line2}
                    onChange={handleChange}
                    className="border-gold/20"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address.city">City</Label>
                    <Input
                      id="address.city"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      required
                      className="border-gold/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address.state">State/Province</Label>
                    <Input
                      id="address.state"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      required
                      className="border-gold/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address.postalCode">Postal Code</Label>
                    <Input
                      id="address.postalCode"
                      name="address.postalCode"
                      value={formData.address.postalCode}
                      onChange={handleChange}
                      required
                      className="border-gold/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address.country">Country</Label>
                    <Input
                      id="address.country"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleChange}
                      required
                      className="border-gold/20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8 border-gold/30 bg-charcoal">
              <CardHeader>
                <CardTitle className="text-gold">Payment Method</CardTitle>
                <CardDescription className="text-offwhite/60">Choose your preferred payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="credit-card" onValueChange={setPaymentMethod}>
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-charcoal border border-gold/20">
                    <TabsTrigger
                      value="credit-card"
                      className="text-gold data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
                    >
                      Credit Card
                    </TabsTrigger>
                    <TabsTrigger
                      value="paypal"
                      className="text-gold data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
                    >
                      PayPal
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="credit-card" className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        required={paymentMethod === "credit-card"}
                        className="border-gold/20"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cardExpiry">Expiry Date</Label>
                        <Input
                          id="cardExpiry"
                          name="cardExpiry"
                          value={formData.cardExpiry}
                          onChange={handleChange}
                          placeholder="MM/YY"
                          required={paymentMethod === "credit-card"}
                          className="border-gold/20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardCvc">CVC</Label>
                        <Input
                          id="cardCvc"
                          name="cardCvc"
                          value={formData.cardCvc}
                          onChange={handleChange}
                          placeholder="123"
                          required={paymentMethod === "credit-card"}
                          className="border-gold/20"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="paypal">
                    <div className="text-center py-6">
                      <Image src="/paypal-logo.png" alt="PayPal" width={120} height={60} className="mx-auto mb-4" />
                      <p className="text-offwhite/80">
                        You will be redirected to PayPal to complete your payment after reviewing your order.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/customer/cart")}
                className="border-gold text-gold hover:bg-gold/10"
              >
                Back to Cart
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-gold-gradient hover:bg-gold-shine text-black">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    Complete Order <CreditCard className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        <div>
          <Card className="border-gold/30 bg-charcoal sticky top-8">
            <CardHeader>
              <CardTitle className="text-gold">Order Summary</CardTitle>
              <CardDescription className="text-offwhite/60">
                {items.length} {items.length === 1 ? "item" : "items"} in your cart
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id || item.productId} className="flex items-start gap-3">
                    <div className="h-16 w-16 bg-black-300 rounded flex items-center justify-center overflow-hidden relative">
                      <Image
                        src={item.image || item.imageUrl || "/placeholder.svg?height=64&width=64"}
                        alt={item.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-offwhite">{item.name}</h3>
                      <p className="text-sm text-offwhite/70">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-gold">${formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}

                <Separator className="my-4 bg-gold/20" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-offwhite/70">Subtotal</span>
                    <span className="text-offwhite">${formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-offwhite/70">Shipping</span>
                    <span className="text-offwhite">${formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-offwhite/70">Tax</span>
                    <span className="text-offwhite">${formatPrice(tax)}</span>
                  </div>
                  <Separator className="my-2 bg-gold/20" />
                  <div className="flex justify-between font-bold">
                    <span className="text-offwhite">Total</span>
                    <span className="text-gold">${formatPrice(calculateOrderTotals().total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gold/5 rounded-b-lg">
              <div className="w-full text-center text-sm text-offwhite/70">
                <p className="mb-2">
                  <ShoppingBag className="inline-block mr-1 h-4 w-4 text-gold" />
                  Free shipping on orders over $150
                </p>
                <p>All orders include a certificate of authenticity</p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
