import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function AuctionsLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-10 w-32 bg-charcoal" />
        <Skeleton className="h-10 w-36 bg-charcoal" />
      </div>

      <div className="flex items-center mb-6">
        <Skeleton className="h-10 w-full max-w-md bg-charcoal" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-gold/30 bg-charcoal overflow-hidden">
            <Skeleton className="h-48 w-full bg-jetblack" />
            <CardHeader>
              <Skeleton className="h-6 w-3/4 bg-jetblack mb-2" />
              <Skeleton className="h-4 w-1/2 bg-jetblack" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24 bg-jetblack" />
                  <Skeleton className="h-4 w-16 bg-jetblack" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24 bg-jetblack" />
                  <Skeleton className="h-4 w-16 bg-jetblack" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24 bg-jetblack" />
                  <Skeleton className="h-4 w-32 bg-jetblack" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24 bg-jetblack" />
                  <Skeleton className="h-4 w-8 bg-jetblack" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-9 w-24 bg-jetblack" />
              <div className="space-x-2">
                <Skeleton className="h-9 w-20 bg-jetblack inline-block" />
                <Skeleton className="h-9 w-20 bg-jetblack inline-block" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
