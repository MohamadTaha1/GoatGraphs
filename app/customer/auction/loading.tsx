import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function AuctionLoading() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <Skeleton className="h-10 w-64 bg-charcoal mx-auto mb-4" />
        <Skeleton className="h-4 w-full max-w-2xl bg-charcoal mx-auto" />
        <Skeleton className="h-4 w-full max-w-md bg-charcoal mx-auto mt-2" />
      </div>

      <div className="flex items-center justify-center mb-8">
        <Skeleton className="h-10 w-full max-w-md bg-charcoal" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-gold/30 bg-charcoal overflow-hidden">
            <Skeleton className="h-64 w-full bg-jetblack" />
            <CardHeader>
              <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-32 bg-jetblack" />
                <Skeleton className="h-5 w-16 bg-jetblack" />
              </div>
              <Skeleton className="h-4 w-24 bg-jetblack mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24 bg-jetblack" />
                <Skeleton className="h-6 w-20 bg-jetblack" />
              </div>

              <Skeleton className="h-20 w-full bg-jetblack" />

              <Skeleton className="h-4 w-full bg-jetblack" />
              <Skeleton className="h-4 w-3/4 bg-jetblack" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full bg-jetblack" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
