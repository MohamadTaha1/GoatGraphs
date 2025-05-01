"use client"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProducts } from "@/hooks/use-products"
import { formatPrice } from "@/lib/utils"

export function FeaturedJerseys() {
  const { products, loading, error } = useProducts()

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border border-gold/20 bg-charcoal">
            <div className="pt-4 px-4">
              <Skeleton className="h-[200px] w-full mb-4 bg-charcoal/50" />
            </div>
            <CardContent className="flex-grow">
              <Skeleton className="h-6 w-3/4 mb-2 bg-charcoal/50" />
              <Skeleton className="h-4 w-1/2 mb-2 bg-charcoal/50" />
              <Skeleton className="h-4 w-1/4 mb-4 bg-charcoal/50" />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-20 bg-charcoal/50" />
                <Skeleton className="h-5 w-16 bg-charcoal/50" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <h3 className="text-lg font-bold text-red-500 mb-1">Error Loading Products</h3>
        <p className="text-sm text-gray-300 mb-4">There was a problem loading the featured products.</p>
        <Button
          variant="outline"
          className="border-gold text-gold hover:bg-gold/10"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products &&
        products.slice(0, 4).map((product) => (
          <Link key={product.id} href={`/product/${product.id}`}>
            <Card className="overflow-hidden h-full border border-gold/20 bg-charcoal hover:border-gold/40 transition-all group">
              <div className="relative h-[200px] w-full">
                <div className="absolute inset-0 bg-gold-radial opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <Image
                  src={product.imageUrl || "/placeholder.svg?height=200&width=200"}
                  alt={product.title}
                  fill
                  className="object-contain p-4"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-display font-bold text-gold">{product.title}</h3>
                <p className="text-offwhite/70 text-sm font-body">Signed by {product.signedBy}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-display font-bold text-gold-warm">${formatPrice(product.price)}</span>
                  {!product.available && (
                    <Badge variant="outline" className="border-red-500 text-red-500">
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
    </div>
  )
}
