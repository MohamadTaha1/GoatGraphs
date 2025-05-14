"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { items = [], removeItem, updateQuantity, clearCart, total = 0 } = useCart()
  const { toast } = useToast()
  const [promoCode, setPromoCode] = useState("")
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  // Redirect to login if user tries to checkout
  const handleCheckout = () => {
    if (!user) {
      const returnUrl = encodeURIComponent("/customer/checkout")
      router.push(`/login?returnUrl=${returnUrl}&action=checkout`)
      return
    }

    router.push("/customer/checkout")
  }

  // Calculate subtotal safely
  const subtotal = items.reduce((sum, item) => {
    const itemPrice = item.price || 0
    const itemQuantity = item.quantity || 0
    return sum + itemPrice * itemQuantity
  }, 0)

  const deliveryFee = subtotal >= 1000 ? 0 : 50
  const totalWithDelivery = subtotal + deliveryFee

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity)
    }
  }

  const handleRemoveItem = (id: string) => {
    removeItem(id)
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart.",
    })
  }

  const handleApplyPromoCode = () => {
    setIsApplyingPromo(true)
    setTimeout(() => {
      setIsApplyingPromo(false)
      toast({
        title: "Invalid promo code",
        description: "The promo code you entered is invalid or has expired.",
      })
    }, 1000)
  }

  if (!items || items.length === 0) {
    return (
      <div className="container py-16">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="h-16 w-16 mx-auto mb-6 text-gold-500" />
          <h1 className="text-3xl font-display font-bold mb-4 bg-gold-gradient bg-clip-text text-transparent">
            Your Cart is Empty
          </h1>
          <p className="text-gray-400 mb-8 font-body">Looks like you haven't added any jerseys to your cart yet.</p>
          <Button
            asChild
            className="bg-gold-gradient hover:bg-gold-shine bg-[length:200%_auto] hover:animate-gold-shimmer text-black font-body"
          >
            <Link href="/customer/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-display font-bold mb-8 bg-gold-gradient bg-clip-text text-transparent">
        Your Shopping Cart
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="border border-gold-700">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative h-32 w-32 flex-shrink-0">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-contain" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <div>
                        <h3 className="font-display font-bold text-lg">{item.name}</h3>
                        <p className="text-gray-500 font-body">{item.team}</p>
                        {item.size && <p className="text-gray-500 font-body">Size: {item.size}</p>}
                      </div>
                      <div className="text-right mt-2 sm:mt-0">
                        <p className="font-display font-bold">${(item.price || 0).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-r-none border-gold-700"
                          onClick={() => handleQuantityChange(item.productId, (item.quantity || 1) - 1)}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity || 1}
                          onChange={(e) => handleQuantityChange(item.productId, Number.parseInt(e.target.value) || 1)}
                          className="h-8 w-12 rounded-none text-center border-x-0 border-gold-700"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-l-none border-gold-700"
                          onClick={() => handleQuantityChange(item.productId, (item.quantity || 1) + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-transparent"
                        onClick={() => handleRemoveItem(item.productId)}
                      >
                        <Trash2 className="h-5 w-5" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" className="border-gold-500 text-gold-500 hover:bg-gold-500/10 font-body" asChild>
              <Link href="/customer/shop">Continue Shopping</Link>
            </Button>
            <Button
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500/10 font-body"
              onClick={() => {
                clearCart()
                toast({
                  title: "Cart cleared",
                  description: "All items have been removed from your cart.",
                })
              }}
            >
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <Card className="border border-gold-700 sticky top-20">
            <CardHeader>
              <CardTitle className="font-display text-gold-500">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between font-body">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-body">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</span>
              </div>
              <div className="flex items-center">
                <Input
                  placeholder="Promo Code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-grow mr-2 border-gold-700"
                />
                <Button
                  variant="outline"
                  className="border-gold-500 text-gold-500 hover:bg-gold-500/10 font-body"
                  onClick={handleApplyPromoCode}
                  disabled={isApplyingPromo || !promoCode}
                >
                  Apply
                </Button>
              </div>
              <Separator className="my-2 bg-gold-700/50" />
              <div className="flex justify-between font-display font-bold text-lg">
                <span>Total</span>
                <span>${totalWithDelivery.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-500 font-body">
                Delivery available only in Dubai. Free delivery on orders over AED 1,000.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-gold-gradient hover:bg-gold-shine bg-[length:200%_auto] hover:animate-gold-shimmer text-black font-body"
                onClick={handleCheckout}
              >
                Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
