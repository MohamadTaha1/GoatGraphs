"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// Update the import to use the correct path
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { collection, query, getDocs, limit, where, orderBy } from "firebase/firestore"
import { formatPrice } from "@/lib/utils"
import { FeaturedJerseys } from "@/components/featured-jerseys"
import { Skeleton } from "@/components/ui/skeleton"

export function DynamicFeaturedJerseys() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        // Skip if we're not in the browser
        if (typeof window === "undefined") return

        let db
        try {
          db = getFirestoreInstance()
        } catch (err) {
          console.error("Failed to get Firestore instance:", err)
          setLoading(false)
          setError(err)
          return
        }

        if (!db) {
          setLoading(false)
          setError(new Error("Firestore instance is null"))
          return
        }

        try {
          // First try with the compound query that requires an index
          const q = query(
            collection(db, "products"),
            where("featured", "==", true),
            orderBy("createdAt", "desc"),
            limit(4),
          )

          console.log("Attempting to fetch featured products with index...")
          const querySnapshot = await getDocs(q)
          const productsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))

          if (productsData && productsData.length > 0) {
            console.log("Successfully fetched featured products with index")
            setProducts(productsData)
          } else {
            // If no results, try a simpler query
            console.log("No featured products found, trying simple query...")
            const simpleQuery = query(collection(db, "products"), limit(4))
            const simpleSnapshot = await getDocs(simpleQuery)
            const simpleData = simpleSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))

            if (simpleData && simpleData.length > 0) {
              console.log("Successfully fetched products with simple query")
              setProducts(simpleData)
            } else {
              console.log("No products found at all")
              setError(new Error("No products found"))
            }
          }
        } catch (indexError) {
          console.error("Index error, falling back to simple query:", indexError)

          // If the index error occurs, try a simpler query
          try {
            const simpleQuery = query(collection(db, "products"), limit(4))
            const simpleSnapshot = await getDocs(simpleQuery)
            const simpleData = simpleSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))

            if (simpleData && simpleData.length > 0) {
              console.log("Successfully fetched products with simple query after index error")
              setProducts(simpleData)
            } else {
              console.log("No products found with simple query after index error")
              setError(new Error("No products found"))
            }
          } catch (fallbackError) {
            console.error("Error with fallback query:", fallbackError)
            setError(fallbackError)
          }
        }
      } catch (err) {
        console.error("Error fetching featured products:", err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  if (loading) {
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
  if (error || products.length === 0) {
    console.log("Falling back to FeaturedJerseys component")
    return <FeaturedJerseys />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
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
