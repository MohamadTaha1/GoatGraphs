"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { FeaturedJerseys } from "@/components/featured-jerseys"
import { Skeleton } from "@/components/ui/skeleton"
import { useProducts } from "@/hooks/use-products"

export function DynamicFeaturedJerseys() {
  const { products, loading, error } = useProducts()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    if (loading) return

    if (error) {
      setLoadError(error)
      setIsLoading(false)
      return
    }

    // Filter featured products or just take the first 4
    const featured = products.filter((p) => p.featured).slice(0, 4)

    if (featured.length > 0) {
      setFeaturedProducts(featured)
    } else {
      // If no featured products, just take the first 4
      setFeaturedProducts(products.slice(0, 4))
    }

    setIsLoading(false)
  }, [products, loading, error])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden h-full border border-gold/20 bg-charcoal">
            <Skeleton className="h-[200px] w-full bg-charcoal/50" />
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2 bg-charcoal/50" />
              <Skeleton className="h-4 w-1/2 mb-4 bg-charcoal/50" />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-16 bg-charcoal/50" />
                <Skeleton className="h-5 w-20 bg-charcoal/50" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Use the existing FeaturedJerseys component as fallback
  if (loadError || featuredProducts.length === 0) {
    console.log("Falling back to FeaturedJerseys component")
    return <FeaturedJerseys />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {featuredProducts.map((product) => (
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
