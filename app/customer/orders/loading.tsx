import { Skeleton } from "@/components/ui/skeleton"

export default function OrdersLoading() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Skeleton className="h-10 w-48 mb-8 bg-charcoal/50" />

      <div className="flex gap-2 mb-8">
        <Skeleton className="h-10 w-24 bg-charcoal/50" />
        <Skeleton className="h-10 w-24 bg-charcoal/50" />
        <Skeleton className="h-10 w-24 bg-charcoal/50" />
        <Skeleton className="h-10 w-24 bg-charcoal/50" />
      </div>

      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-gold/30 rounded-lg overflow-hidden bg-charcoal">
            <div className="p-6 bg-jetblack/50">
              <div className="flex justify-between">
                <div>
                  <Skeleton className="h-6 w-32 mb-2 bg-charcoal/50" />
                  <Skeleton className="h-4 w-48 bg-charcoal/50" />
                </div>
                <Skeleton className="h-6 w-24 bg-charcoal/50" />
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4 mb-6">
                {[1, 2].map((j) => (
                  <div key={j} className="flex items-center space-x-4">
                    <Skeleton className="h-20 w-20 rounded-md bg-charcoal/50" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-40 mb-2 bg-charcoal/50" />
                      <Skeleton className="h-4 w-24 bg-charcoal/50" />
                    </div>
                    <Skeleton className="h-5 w-16 bg-charcoal/50" />
                  </div>
                ))}
              </div>

              <div className="border-t border-gold/20 pt-4 mb-6">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16 bg-charcoal/50" />
                    <Skeleton className="h-4 w-16 bg-charcoal/50" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16 bg-charcoal/50" />
                    <Skeleton className="h-4 w-16 bg-charcoal/50" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16 bg-charcoal/50" />
                    <Skeleton className="h-4 w-16 bg-charcoal/50" />
                  </div>
                </div>
                <div className="flex justify-between pt-4 border-t border-gold/20">
                  <Skeleton className="h-5 w-16 bg-charcoal/50" />
                  <Skeleton className="h-5 w-20 bg-charcoal/50" />
                </div>
              </div>

              <div className="border-t border-gold/20 pt-4">
                <Skeleton className="h-5 w-40 mb-2 bg-charcoal/50" />
                <Skeleton className="h-4 w-full mb-1 bg-charcoal/50" />
                <Skeleton className="h-4 w-3/4 mb-1 bg-charcoal/50" />
                <Skeleton className="h-4 w-1/2 bg-charcoal/50" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
