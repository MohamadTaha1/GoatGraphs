import { Loader2 } from "lucide-react"

export default function CheckoutSuccessLoading() {
  return (
    <div className="container py-16 text-center">
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-gold mb-4" />
        <h2 className="text-2xl font-display font-bold text-gold mb-2">Processing Your Order</h2>
        <p className="text-offwhite/80 max-w-md mx-auto">
          Please wait while we confirm your order details. This will only take a moment.
        </p>
      </div>
    </div>
  )
}
