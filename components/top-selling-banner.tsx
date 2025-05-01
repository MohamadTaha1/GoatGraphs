"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { formatPrice } from "@/lib/utils"

export function TopSellingBanner() {
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTopProducts() {
      try {
        setLoading(true)
        const db = getFirestoreInstance()

        if (!db) {
          console.error("Firestore instance is null")
          setLoading(false)
          return
        }

        // Query for top selling products
        const q = query(collection(db, "products"), orderBy("soldCount", "desc"), limit(3))

        const querySnapshot = await getDocs(q)
        const products = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setTopProducts(products)
      } catch (error) {
        console.error("Error fetching top products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopProducts()
  }, [])

  // Fallback products if no top products are found
  const fallbackProducts = [
    {
      id: "top1",
      title: "Lionel Messi World Cup Jersey",
      signedBy: "Lionel Messi",
      price: 1499.99,
      imageUrl: "/images/top-selling-jersey-1.png",
      soldCount: 42,
    },
    {
      id: "top2",
      title: "Cristiano Ronaldo Manchester United Jersey",
      signedBy: "Cristiano Ronaldo",
      price: 1299.99,
      imageUrl: "/images/top-selling-jersey-2.png",
      soldCount: 38,
    },
    {
      id: "top3",
      title: "Erling Haaland Manchester City Jersey",
      signedBy: "Erling Haaland",
      price: 1099.99,
      imageUrl: "/images/top-selling-jersey-3.png",
      soldCount: 35,
    },
  ]

  const displayProducts = topProducts.length > 0 ? topProducts : fallbackProducts

  return (
    <section className="py-16 bg-jetblack relative">
      <div className="absolute inset-0 bg-[url('/images/football-authenticity-banner.png')] bg-cover bg-center opacity-10"></div>
      <div className="container relative z-10 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold mb-2 bg-gold-gradient bg-clip-text text-transparent">
            Top Selling Jerseys
          </h2>
          <p className="text-offwhite/70 max-w-2xl mx-auto">
            Our most popular authenticated signed jerseys that collectors can't get enough of.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
            <span className="ml-2 text-offwhite">Loading top selling jerseys...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayProducts.map((product, index) => (
              <div key={product.id} className="relative group">
                <div className="absolute -inset-1 bg-gold-radial opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-lg blur-sm"></div>
                <div className="relative bg-charcoal border border-gold/20 rounded-lg overflow-hidden">
                  <div className="absolute top-4 left-4 z-10 bg-gold text-jetblack text-xs font-bold px-2 py-1 rounded-full">
                    #{index + 1} Top Seller
                  </div>
                  <div className="relative h-[300px]">
                    <Image
                      src={product.imageUrl || "/placeholder.svg?height=300&width=300"}
                      alt={product.title || "Top Selling Jersey"}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-gold mb-2">
                      {product.title || "Top Selling Jersey"}
                    </h3>
                    <p className="text-offwhite/70 mb-2">Signed by {product.signedBy || "Football Legend"}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-gold-warm font-display text-xl font-bold">
                        ${formatPrice(product.price || 0)}
                      </span>
                      <Button asChild className="bg-gold-soft hover:bg-gold-deep text-jetblack">
                        <Link href={`/customer/product/${product.id}`}>View Details</Link>
                      </Button>
                    </div>
                    {product.soldCount && (
                      <p className="text-sm text-offwhite/50 mt-4">{product.soldCount} sold this month</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
