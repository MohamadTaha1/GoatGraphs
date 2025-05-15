"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Tag } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/hooks/use-auth"
import { formatPrice } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { AuthRequiredModal } from "@/components/auth-required-modal"

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Calculate shipping (free over $100)
  const shipping = subtotal > 100 ? 0 : 9.99

  // Calculate tax (8%)
  const tax = (subtotal - discount) * 0.08

  // Calculate total
  const total = subtotal - discount + shipping + tax

  // Handle quantity change
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantity(productId, newQuantity)
  }

  // Handle promo code application
  const applyPromoCode = () => {
    if (!promoCode.trim()) return

    // Example promo codes
    if (promoCode.toUpperCase() === "WELCOME10") {
      const discountAmount = subtotal * 0.1 // 10% discount
      setDiscount(discountAmount)
      toast({
        title: "Promo code applied",
        description: "10% discount has been applied to your order.",
      })
    } else if (promoCode.toUpperCase() === "FREESHIP") {
      setDiscount(shipping)
      toast({
        title: "Promo code applied",
        description: "Free shipping has been applied to your order.",
      })
    } else {
      toast({
        title: "Invalid promo code",
        description: "The promo code you entered is invalid or expired.",
        variant: "destructive",
      })
    }
  }

  // Handle checkout
  const handleCheckout = () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    // Proceed to checkout
    router.push("/customer/checkout")
  }

  // If cart is empty
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-16">
          <ShoppingCart className="h-16 w-16 mx-auto text-gold/50 mb-4" />
          <h1 className="text-3xl font-display font-bold mb-4 text-gold">Your Cart is Empty</h1>
          <p className="text-offwhite/70 mb-8 max-w-md mx-auto">
            Looks like you haven't added any items to your cart yet. Browse our collection to find authentic signed
            memorabilia.
          </p>
          <Button
            onClick={() => router.push("/customer/shop")}
            className="bg-gold-soft hover:bg-gold-deep text-jetblack"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold mb-8 bg-gold-gradient bg-clip-text text-transparent">
        Your Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.productId} className="border-gold/30 bg-charcoal overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-32 h-32 bg-jetblack">
                    <Image
                      src={item.image || "/placeholder.svg?height=128&width=128"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex flex-col sm:flex-row justify-between">
                      <div>
                        <h3 className="font-display text-lg font-bold text-offwhite mb-1">{item.name}</h3>
                        {item.type === "preorder" && (
                          <span className="inline-block bg-gold/20 text-gold text-xs px-2 py-1 rounded mb-2">
                            Pre-Order
                          </span>
                        )}
                        {item.type === "preorder" && item.details && (
                          <div className="text-sm text-offwhite/70 space-y-1 mt-2">
                            <p>Size: {item.details.size}</p>
                            <p>Team: {item.details.team}</p>
                            <p>Player: {item.details.player}</p>
                            {item.details.personalization && <p>Personalization: {item.details.personalization}</p>}
                          </div>
                        )}
                      </div>
                      <div className="text-right mt-2 sm:mt-0">
                        <span className="text-gold-warm font-display text-lg font-bold">
                          ${formatPrice(item.price)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      {item.type !== "preorder" ? (
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-gold/30 text-gold"
                            onClick={() => handleQuantityChange(item.productId, (item.quantity || 1) - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-offwhite">{item.quantity || 1}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-gold/30 text-gold"
                            onClick={() => handleQuantityChange(item.productId, (item.quantity || 1) + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-sm text-offwhite/70">Custom pre-order • 4-6 weeks delivery</div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              className="border-gold/30 text-gold hover:bg-gold/10"
              onClick={() => router.push("/customer/shop")}
            >
              Continue Shopping
            </Button>
            <Button
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-950/20"
              onClick={() => {
                if (confirm("Are you sure you want to clear your cart?")) {
                  clearCart()
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="border-gold/30 bg-charcoal sticky top-4">
            <CardContent className="p-6">
              <h2 className="text-xl font-display font-bold text-gold mb-4">Order Summary</h2>

              <div className="space-y-3 text-offwhite">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-${formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${formatPrice(shipping)}`}</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span>${formatPrice(tax)}</span>
                </div>

                <Separator className="my-4 bg-gold/20" />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-gold-warm">${formatPrice(total)}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mt-6">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="border-gold/30 bg-jetblack text-offwhite"
                  />
                  <Button
                    variant="outline"
                    className="border-gold/30 text-gold hover:bg-gold/10"
                    onClick={applyPromoCode}
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    Apply
                  </Button>
                </div>
                <p className="text-xs text-offwhite/50 mt-2">
                  Try codes: WELCOME10 for 10% off, FREESHIP for free shipping
                </p>
              </div>

              <Button className="w-full mt-6 bg-gold-soft hover:bg-gold-deep text-jetblack" onClick={handleCheckout}>
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <p className="text-xs text-center text-offwhite/50 mt-4">
                Secure checkout powered by Stripe. Your payment information is encrypted.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign in to continue"
        description="Please sign in or create an account to proceed with checkout."
        returnUrl="/customer/cart"
      />
    </div>
  )
}
