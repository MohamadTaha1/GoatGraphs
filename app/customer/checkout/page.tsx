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
import { Loader2, CreditCard, ShoppingBag, AlertCircle } from "lucide-react"
import Image from "next/image"
import { createProductOrder } from "@/lib/order-service"
import { useToast } from "@/components/ui/use-toast"

// Validation types
type ValidationErrors = {
  name?: string
  email?: string
  phone?: string
  address?: {
    line1?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  cardNumber?: string
  cardExpiry?: string
  cardCvc?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { items, clearCart } = useCart()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [orderId, setOrderId] = useState<string | null>(null)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

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

    // Mark field as touched
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))

    // Validate the field
    validateField(name, value)
  }

  const handleBlur = (e) => {
    const { name, value } = e.target

    // Mark field as touched
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))

    // Validate the field
    validateField(name, value)
  }

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors }

    // Clear previous error for this field
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1]
      if (newErrors.address) {
        delete newErrors.address[addressField]
      }
    } else {
      delete newErrors[name]
    }

    // Validate based on field name
    switch (name) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "Name is required"
        } else if (value.trim().length < 3) {
          newErrors.name = "Name must be at least 3 characters"
        }
        break

      case "email":
        if (!value.trim()) {
          newErrors.email = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Please enter a valid email address"
        }
        break

      case "phone":
        if (!value.trim()) {
          newErrors.phone = "Phone number is required"
        } else if (!/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(value.replace(/\s/g, ""))) {
          newErrors.phone = "Please enter a valid phone number"
        }
        break

      case "address.line1":
        if (!value.trim()) {
          if (!newErrors.address) newErrors.address = {}
          newErrors.address.line1 = "Address is required"
        }
        break

      case "address.city":
        if (!value.trim()) {
          if (!newErrors.address) newErrors.address = {}
          newErrors.address.city = "City is required"
        }
        break

      case "address.state":
        if (!value.trim()) {
          if (!newErrors.address) newErrors.address = {}
          newErrors.address.state = "State/Province is required"
        }
        break

      case "address.postalCode":
        if (!value.trim()) {
          if (!newErrors.address) newErrors.address = {}
          newErrors.address.postalCode = "Postal code is required"
        } else if (!/^[0-9a-zA-Z\s-]{3,10}$/.test(value)) {
          if (!newErrors.address) newErrors.address = {}
          newErrors.address.postalCode = "Please enter a valid postal code"
        }
        break

      case "address.country":
        if (!value.trim()) {
          if (!newErrors.address) newErrors.address = {}
          newErrors.address.country = "Country is required"
        }
        break

      case "cardNumber":
        if (paymentMethod === "credit-card") {
          if (!value.trim()) {
            newErrors.cardNumber = "Card number is required"
          } else if (!/^[0-9]{13,19}$/.test(value.replace(/\s/g, ""))) {
            newErrors.cardNumber = "Please enter a valid card number"
          }
        }
        break

      case "cardExpiry":
        if (paymentMethod === "credit-card") {
          if (!value.trim()) {
            newErrors.cardExpiry = "Expiry date is required"
          } else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(value)) {
            newErrors.cardExpiry = "Please use MM/YY format"
          } else {
            // Check if card is expired
            const [month, year] = value.split("/")
            const expiryDate = new Date(2000 + Number.parseInt(year), Number.parseInt(month) - 1)
            const today = new Date()
            if (expiryDate < today) {
              newErrors.cardExpiry = "Card has expired"
            }
          }
        }
        break

      case "cardCvc":
        if (paymentMethod === "credit-card") {
          if (!value.trim()) {
            newErrors.cardCvc = "CVC is required"
          } else if (!/^[0-9]{3,4}$/.test(value)) {
            newErrors.cardCvc = "CVC must be 3 or 4 digits"
          }
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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

  const validateForm = () => {
    // Mark all fields as touched
    const allFields = [
      "name",
      "email",
      "phone",
      "address.line1",
      "address.city",
      "address.state",
      "address.postalCode",
      "address.country",
    ]

    if (paymentMethod === "credit-card") {
      allFields.push("cardNumber", "cardExpiry", "cardCvc")
    }

    const newTouched = allFields.reduce((acc, field) => {
      acc[field] = true
      return acc
    }, {})

    setTouched(newTouched)

    // Validate all fields
    let isValid = true
    const newErrors: ValidationErrors = {}

    // Basic fields
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
      isValid = false
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
      isValid = false
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
      isValid = false
    } else if (!/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number"
      isValid = false
    }

    // Address fields
    newErrors.address = {}

    if (!formData.address.line1.trim()) {
      newErrors.address.line1 = "Address is required"
      isValid = false
    }

    if (!formData.address.city.trim()) {
      newErrors.address.city = "City is required"
      isValid = false
    }

    if (!formData.address.state.trim()) {
      newErrors.address.state = "State/Province is required"
      isValid = false
    }

    if (!formData.address.postalCode.trim()) {
      newErrors.address.postalCode = "Postal code is required"
      isValid = false
    } else if (!/^[0-9a-zA-Z\s-]{3,10}$/.test(formData.address.postalCode)) {
      newErrors.address.postalCode = "Please enter a valid postal code"
      isValid = false
    }

    if (!formData.address.country.trim()) {
      newErrors.address.country = "Country is required"
      isValid = false
    }

    // Payment fields for credit card
    if (paymentMethod === "credit-card") {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = "Card number is required"
        isValid = false
      } else if (!/^[0-9]{13,19}$/.test(formData.cardNumber.replace(/\s/g, ""))) {
        newErrors.cardNumber = "Please enter a valid card number"
        isValid = false
      }

      if (!formData.cardExpiry.trim()) {
        newErrors.cardExpiry = "Expiry date is required"
        isValid = false
      } else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(formData.cardExpiry)) {
        newErrors.cardExpiry = "Please use MM/YY format"
        isValid = false
      } else {
        // Check if card is expired
        const [month, year] = formData.cardExpiry.split("/")
        const expiryDate = new Date(2000 + Number.parseInt(year), Number.parseInt(month) - 1)
        const today = new Date()
        if (expiryDate < today) {
          newErrors.cardExpiry = "Card has expired"
          isValid = false
        }
      }

      if (!formData.cardCvc.trim()) {
        newErrors.cardCvc = "CVC is required"
        isValid = false
      } else if (!/^[0-9]{3,4}$/.test(formData.cardCvc)) {
        newErrors.cardCvc = "CVC must be 3 or 4 digits"
        isValid = false
      }
    }

    // If address has no errors, remove it
    if (Object.keys(newErrors.address).length === 0) {
      delete newErrors.address
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate all fields
    if (!validateForm()) {
      toast({
        title: "Form Validation Error",
        description: "Please check the form for errors and try again.",
        variant: "destructive",
        duration: 5000,
      })
      return
    }

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
                    <Label htmlFor="name" className="flex items-center justify-between">
                      Full Name
                      {touched.name && errors.name && (
                        <span className="text-xs text-red-500 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" /> {errors.name}
                        </span>
                      )}
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={`border-gold/20 ${touched.name && errors.name ? "border-red-500 focus:ring-red-500" : ""}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="flex items-center justify-between">
                      Email
                      {touched.email && errors.email && (
                        <span className="text-xs text-red-500 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" /> {errors.email}
                        </span>
                      )}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={`border-gold/20 ${touched.email && errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone" className="flex items-center justify-between">
                    Phone Number
                    {touched.phone && errors.phone && (
                      <span className="text-xs text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" /> {errors.phone}
                      </span>
                    )}
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`border-gold/20 ${touched.phone && errors.phone ? "border-red-500 focus:ring-red-500" : ""}`}
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
                  <Label htmlFor="address.line1" className="flex items-center justify-between">
                    Address Line 1
                    {touched["address.line1"] && errors.address?.line1 && (
                      <span className="text-xs text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" /> {errors.address.line1}
                      </span>
                    )}
                  </Label>
                  <Input
                    id="address.line1"
                    name="address.line1"
                    value={formData.address.line1}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`border-gold/20 ${touched["address.line1"] && errors.address?.line1 ? "border-red-500 focus:ring-red-500" : ""}`}
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
                    <Label htmlFor="address.city" className="flex items-center justify-between">
                      City
                      {touched["address.city"] && errors.address?.city && (
                        <span className="text-xs text-red-500 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" /> {errors.address.city}
                        </span>
                      )}
                    </Label>
                    <Input
                      id="address.city"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={`border-gold/20 ${touched["address.city"] && errors.address?.city ? "border-red-500 focus:ring-red-500" : ""}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address.state" className="flex items-center justify-between">
                      State/Province
                      {touched["address.state"] && errors.address?.state && (
                        <span className="text-xs text-red-500 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" /> {errors.address.state}
                        </span>
                      )}
                    </Label>
                    <Input
                      id="address.state"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={`border-gold/20 ${touched["address.state"] && errors.address?.state ? "border-red-500 focus:ring-red-500" : ""}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address.postalCode" className="flex items-center justify-between">
                      Postal Code
                      {touched["address.postalCode"] && errors.address?.postalCode && (
                        <span className="text-xs text-red-500 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" /> {errors.address.postalCode}
                        </span>
                      )}
                    </Label>
                    <Input
                      id="address.postalCode"
                      name="address.postalCode"
                      value={formData.address.postalCode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={`border-gold/20 ${touched["address.postalCode"] && errors.address?.postalCode ? "border-red-500 focus:ring-red-500" : ""}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address.country" className="flex items-center justify-between">
                      Country
                      {touched["address.country"] && errors.address?.country && (
                        <span className="text-xs text-red-500 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" /> {errors.address.country}
                        </span>
                      )}
                    </Label>
                    <Input
                      id="address.country"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={`border-gold/20 ${touched["address.country"] && errors.address?.country ? "border-red-500 focus:ring-red-500" : ""}`}
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
                      <Label htmlFor="cardNumber" className="flex items-center justify-between">
                        Card Number
                        {touched.cardNumber && errors.cardNumber && (
                          <span className="text-xs text-red-500 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" /> {errors.cardNumber}
                          </span>
                        )}
                      </Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="1234 5678 9012 3456"
                        required={paymentMethod === "credit-card"}
                        className={`border-gold/20 ${touched.cardNumber && errors.cardNumber ? "border-red-500 focus:ring-red-500" : ""}`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cardExpiry" className="flex items-center justify-between">
                          Expiry Date
                          {touched.cardExpiry && errors.cardExpiry && (
                            <span className="text-xs text-red-500 flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" /> {errors.cardExpiry}
                            </span>
                          )}
                        </Label>
                        <Input
                          id="cardExpiry"
                          name="cardExpiry"
                          value={formData.cardExpiry}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="MM/YY"
                          required={paymentMethod === "credit-card"}
                          className={`border-gold/20 ${touched.cardExpiry && errors.cardExpiry ? "border-red-500 focus:ring-red-500" : ""}`}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardCvc" className="flex items-center justify-between">
                          CVC
                          {touched.cardCvc && errors.cardCvc && (
                            <span className="text-xs text-red-500 flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" /> {errors.cardCvc}
                            </span>
                          )}
                        </Label>
                        <Input
                          id="cardCvc"
                          name="cardCvc"
                          value={formData.cardCvc}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="123"
                          required={paymentMethod === "credit-card"}
                          className={`border-gold/20 ${touched.cardCvc && errors.cardCvc ? "border-red-500 focus:ring-red-500" : ""}`}
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
