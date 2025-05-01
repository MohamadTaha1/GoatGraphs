"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function VideoOrdersLoading() {
  return (
    <div className="container mx-auto py-8">
      <Skeleton className="h-8 w-64 mb-6" />

      <div className="mb-6">
        <Skeleton className="h-10 w-96" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="bg-gray-50">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-40" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-24 mb-1" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>

                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full" />
                </div>

                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <div className="mt-4 flex gap-2">
                    <Skeleton className="h-9 w-28" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
