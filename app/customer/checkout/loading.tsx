import { Loader2, ShoppingBag } from "lucide-react"

export default function CheckoutLoading() {
  return (
    <div className="container py-16 text-center">
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative">
          <ShoppingBag className="h-16 w-16 text-gold/20" />
          <Loader2 className="h-8 w-8 animate-spin text-gold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h2 className="text-2xl font-display font-bold text-gold mt-4 mb-2">Preparing Checkout</h2>
        <p className="text-offwhite/80 max-w-md mx-auto">
          Loading your cart items and preparing your checkout experience...
        </p>
      </div>
    </div>
  )
}
