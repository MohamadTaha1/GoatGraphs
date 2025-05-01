"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { collection, getDocs, query, where, limit, orderBy } from "firebase/firestore"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { formatPrice } from "@/lib/utils"

export function FeaturedJerseys() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        setLoading(true)
        const db = getFirestoreInstance()
        const productsRef = collection(db, "products")

        // Query for featured products that are in stock
        const q = query(
          productsRef,
          where("featured", "==", true),
          where("inStock", "==", true),
          orderBy("createdAt", "desc"),
          limit(4),
        )

        const querySnapshot = await getDocs(q)

        // If we don't have enough featured products, get the most recent ones
        if (querySnapshot.docs.length < 4) {
          const backupQuery = query(productsRef, where("inStock", "==", true), orderBy("createdAt", "desc"), limit(4))
          const backupSnapshot = await getDocs(backupQuery)
          const productsData = backupSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setProducts(productsData)
        } else {
          const productsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setProducts(productsData)
        }
      } catch (err) {
        console.error("Error fetching featured products:", err)
        setError("Failed to load featured products")
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  if (loading) {
    return (
      <div className="py-16 bg-charcoal">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-offwhite mb-4">Featured Jerseys</h2>
            <p className="text-offwhite/70 max-w-2xl mx-auto">
              Discover our collection of authenticated jerseys worn by the greatest players in sports history.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-gold/30 bg-jetblack overflow-hidden">
                <div className="relative h-64 w-full">
                  <Skeleton className="h-full w-full bg-charcoal/50" />
                </div>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2 bg-charcoal/50" />
                  <Skeleton className="h-4 w-1/2 mb-4 bg-charcoal/50" />
                  <Skeleton className="h-5 w-1/3 mb-6 bg-charcoal/50" />
                  <Skeleton className="h-10 w-full bg-charcoal/50" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-16 bg-charcoal">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-offwhite mb-4">Featured Jerseys</h2>
          </div>

          <div className="flex flex-col items-center justify-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-offwhite/70 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-gold-soft hover:bg-gold-deep text-jetblack">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="py-16 bg-charcoal">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-offwhite mb-4">Featured Jerseys</h2>
            <p className="text-offwhite/70 max-w-2xl mx-auto">
              Our featured collection is coming soon. Check back later for exclusive items.
            </p>
          </div>

          <div className="flex justify-center">
            <Link href="/customer/shop">
              <Button className="bg-gold-soft hover:bg-gold-deep text-jetblack">Browse All Products</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 bg-charcoal">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-offwhite mb-4">Featured Jerseys</h2>
          <p className="text-offwhite/70 max-w-2xl mx-auto">
            Discover our collection of authenticated jerseys worn by the greatest players in sports history.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="border-gold/30 bg-jetblack overflow-hidden hover:shadow-lg hover:shadow-gold/10 transition-all"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={product.imageUrl || "/placeholder.svg?height=256&width=384&query=sports jersey"}
                  alt={product.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
                {product.featured && (
                  <div className="absolute top-2 right-2 bg-gold text-jetblack text-xs font-bold px-2 py-1 rounded">
                    Featured
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-offwhite mb-1">{product.name}</h3>
                <p className="text-offwhite/70 text-sm mb-2">{product.category}</p>
                <p className="text-gold font-bold text-xl mb-4">${formatPrice(product.price)}</p>
                <Link href={`/customer/product/${product.id}`}>
                  <Button className="w-full bg-gold-soft hover:bg-gold-deep text-jetblack">View Details</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link href="/customer/shop">
            <Button variant="outline" className="border-gold/30 text-offwhite hover:bg-gold/10 hover:text-gold">
              View All Jerseys
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
