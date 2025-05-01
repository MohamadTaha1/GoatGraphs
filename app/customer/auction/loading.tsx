import { Skeleton } from "@/components/ui/skeleton"

export default function CustomerAuctionLoading() {
  return (
    <div className="container mx-auto py-8">
      <Skeleton className="h-10 w-64 mb-8 bg-charcoal/50" />

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Skeleton className="h-10 flex-grow bg-charcoal/50" />
        <Skeleton className="h-10 w-[180px] bg-charcoal/50" />
      </div>

      <Skeleton className="h-10 w-64 mb-6 bg-charcoal/50" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array(8)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-64 w-full bg-charcoal/50" />
              <Skeleton className="h-6 w-3/4 bg-charcoal/50" />
              <Skeleton className="h-4 w-1/2 bg-charcoal/50" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-20 bg-charcoal/50" />
                <Skeleton className="h-6 w-24 bg-charcoal/50" />
              </div>
              <Skeleton className="h-10 w-full bg-charcoal/50" />
            </div>
          ))}
      </div>
    </div>
  )
}
