import { Loader2 } from "lucide-react"

export default function ViewVideoLoading() {
  return (
    <div className="container py-8">
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading video...</span>
      </div>
    </div>
  )
}
