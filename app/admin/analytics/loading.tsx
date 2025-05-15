import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-48 bg-gold/10" />
          <Skeleton className="h-4 w-64 mt-2 bg-gold/10" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-[180px] bg-gold/10" />
          <Skeleton className="h-10 w-32 bg-gold/10" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(null)
          .map((_, i) => (
            <Card key={i} className="border-gold/30 bg-charcoal shadow-lg">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32 bg-gold/10" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Skeleton className="h-8 w-8 rounded-full mr-4 bg-gold/10" />
                  <div>
                    <Skeleton className="h-6 w-24 bg-gold/10" />
                    <Skeleton className="h-3 w-20 mt-1 bg-gold/10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      <Skeleton className="h-10 w-full bg-gold/10" />

      <Card className="border-gold/30 bg-charcoal shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-gold/10" />
          <Skeleton className="h-4 w-64 mt-1 bg-gold/10" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full bg-gold/10" />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {Array(2)
          .fill(null)
          .map((_, i) => (
            <Card key={i} className="border-gold/30 bg-charcoal shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-gold/10" />
                <Skeleton className="h-4 w-64 mt-1 bg-gold/10" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full bg-gold/10" />
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}
