import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function VideosLoading() {
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-10 w-48" />
        <Button disabled className="bg-gold text-black hover:bg-gold/80">
          <Plus className="mr-2 h-4 w-4" /> Add New Video
        </Button>
      </div>

      <div className="w-full max-w-md mb-8">
        <Skeleton className="h-10 w-full" />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-16 w-24 rounded" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
                <div className="ml-auto flex gap-2">
                  <Skeleton className="h-9 w-9 rounded" />
                  <Skeleton className="h-9 w-9 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
