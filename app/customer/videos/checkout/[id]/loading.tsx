import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="container py-16 flex justify-center items-center">
      <Loader2 className="h-8 w-8 animate-spin text-gold mr-2" />
      <span>Loading checkout...</span>
    </div>
  )
}
