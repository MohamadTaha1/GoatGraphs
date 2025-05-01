"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Loader2 } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/components/ui/use-toast"
import { collection, query, where, getDocs, limit } from "firebase/firestore"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { formatPrice } from "@/lib/utils"

export function DynamicFeaturedJerseys() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        setLoading(true)
        const db = getFirestoreInstance()

        if (!db) {
          console.error("Firestore instance is null")
          setLoading(false)
          return
        }

        // Query for featured products
        const q = query(collection(db, "products"), where("featured", "==", true), limit(4))

        const querySnapshot = await getDocs(q)
        const products = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setFeaturedProducts(products)
      } catch (error) {
        console.error("Error fetching featured products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  const handleAddToCart = (product) => {
    if (!product) return

    // Ensure we have a valid product with required fields
    addItem({
      productId: product.id,
      name: product.title || "Untitled Product",
      price: typeof product.price === "string" ? Number.parseFloat(product.price) : Number(product.price || 0),
      image: product.imageUrl || "/placeholder.svg?height=100&width=100",
    })

    toast({
      title: "Added to cart",
      description: `${product.title || "Product"} has been added to your cart.`,
    })
  }

  // Fallback products if no featured products are found
  const fallbackProducts = [
    {
      id: "fallback1",
      title: "Lionel Messi Signed Argentina Jersey",
      signedBy: "Lionel Messi",
      price: 1299.99,
      imageUrl: "/images/messi-signed-jersey.png",
      available: true,
    },
    {
      id: "fallback2",
      title: "Cristiano Ronaldo Signed Portugal Jersey",
      signedBy: "Cristiano Ronaldo",
      price: 1199.99,
      imageUrl: "/images/ronaldo-signed-jersey.png",
      available: true,
    },
    {
      id: "fallback3",
      title: "Kylian Mbappé Signed France Jersey",
      signedBy: "Kylian Mbappé",
      price: 999.99,
      imageUrl: "/images/mbappe-signed-jersey.png",
      available: true,
    },
    {
      id: "fallback4",
      title: "Neymar Jr. Signed Brazil Jersey",
      signedBy: "Neymar Jr.",
      price: 899.99,
      imageUrl: "/images/neymar-signed-jersey.png",
      available: true,
    },
  ]

  const displayProducts = featuredProducts.length > 0 ? featuredProducts : fallbackProducts

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
          <span className="ml-2 text-offwhite">Loading featured jerseys...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product) => (
            <Card key={product.id} className="border border-gold/20 bg-jetblack overflow-hidden group">
              <div className="relative pt-4 px-4">
                <div className="absolute inset-0 bg-gold-radial opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                <Badge className="absolute top-6 right-6 z-10 bg-gold text-jetblack border-none font-body">
                  Featured
                </Badge>
                <div className="relative h-[200px] w-full mb-4">
                  <Image
                    src={product.imageUrl || "/placeholder.svg?height=200&width=200"}
                    alt={product.title || "Featured Jersey"}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <CardContent className="p-4">
                <Link href={`/customer/product/${product.id}`}>
                  <h3 className="font-display text-lg font-bold text-gold mb-1 hover:underline">
                    {product.title || "Featured Jersey"}
                  </h3>
                </Link>
                <p className="text-sm text-offwhite/70 mb-2">Signed by {product.signedBy || "Football Legend"}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-gold-warm font-display text-lg font-bold">
                    ${formatPrice(product.price || 0)}
                  </span>
                  <Button
                    size="sm"
                    className="bg-gold-soft hover:bg-gold-deep text-jetblack"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.available === false}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
