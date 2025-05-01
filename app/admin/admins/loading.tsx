import { Skeleton } from "@/components/ui/skeleton"

export default function AdminsLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="rounded-lg border border-gold/30 bg-charcoal">
        <div className="p-4">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="border-t border-gold/30">
          <div className="grid grid-cols-12 gap-2 p-4">
            <Skeleton className="col-span-1 h-10" />
            <Skeleton className="col-span-2 h-10" />
            <Skeleton className="col-span-3 h-10" />
            <Skeleton className="col-span-2 h-10" />
            <Skeleton className="col-span-2 h-10" />
            <Skeleton className="col-span-2 h-10" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 border-t border-gold/30 p-4">
              <Skeleton className="col-span-1 h-10" />
              <Skeleton className="col-span-2 h-10" />
              <Skeleton className="col-span-3 h-10" />
              <Skeleton className="col-span-2 h-10" />
              <Skeleton className="col-span-2 h-10" />
              <Skeleton className="col-span-2 h-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
