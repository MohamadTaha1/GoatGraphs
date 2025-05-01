"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ShoppingCart, AlertCircle } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { collection, query, limit, getDocs } from "firebase/firestore"
import { formatPrice } from "@/lib/utils"

// Fallback data in case Firebase fails
const fallbackProducts = [
  {
    id: "1",
    title: "Lionel Messi Signed Argentina Jersey",
    signedBy: "Lionel Messi",
    price: 1299.99,
    imageUrl: "/images/messi-signed-jersey.png",
    available: true,
  },
  {
    id: "2",
    title: "Cristiano Ronaldo Signed Portugal Jersey",
    signedBy: "Cristiano Ronaldo",
    price: 1199.99,
    imageUrl: "/images/ronaldo-signed-jersey.png",
    available: true,
  },
  {
    id: "3",
    title: "Kylian Mbappé Signed France Jersey",
    signedBy: "Kylian Mbappé",
    price: 999.99,
    imageUrl: "/images/mbappe-signed-jersey.png",
    available: false,
  },
]

export function TopSellingBanner() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flippedCards, setFlippedCards] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const { addItem } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchTopSellingProducts() {
      try {
        // Skip if we're not in the browser
        if (typeof window === "undefined") return

        let db
        try {
          db = getFirestoreInstance()
        } catch (err) {
          console.error("Failed to get Firestore instance:", err)
          setProducts(fallbackProducts)
          setLoading(false)
          return
        }

        if (!db) {
          setProducts(fallbackProducts)
          setLoading(false)
          return
        }

        // Use a simple query to avoid index requirements
        try {
          console.log("Fetching products with simple query...")
          const simpleQuery = query(collection(db, "products"), limit(3))
          const simpleSnapshot = await getDocs(simpleQuery)
          const simpleData = simpleSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))

          if (simpleData && simpleData.length > 0) {
            console.log("Successfully fetched products")
            setProducts(simpleData)
          } else {
            console.log("No products found, using fallback data")
            setProducts(fallbackProducts)
          }
        } catch (queryError) {
          console.error("Error with query:", queryError)
          setProducts(fallbackProducts)
        }
      } catch (err) {
        console.error("Error fetching products:", err)
        setError(err)
        setProducts(fallbackProducts)
      } finally {
        setLoading(false)
      }
    }

    fetchTopSellingProducts()
  }, [])

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" })
      if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
    }
  }

  const scrollRight = () => {
    if (scrollRef.current && currentIndex < products.length - 1) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" })
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleAddToCart = (product) => {
    addItem({
      id: product.id,
      name: product.title,
      team: product.signedBy,
      image: product.imageUrl,
      price: product.price,
      quantity: 1,
      size: "L", // Assuming size is always L for simplicity
    })

    toast({
      title: "Added to cart",
      description: `${product.title} has been added to your cart.`,
    })
  }

  const toggleFlip = (id: string) => {
    if (flippedCards.includes(id)) {
      setFlippedCards(flippedCards.filter((cardId) => cardId !== id))
    } else {
      setFlippedCards([...flippedCards, id])
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border border-gold/20 bg-charcoal">
            <CardContent className="p-0">
              <Skeleton className="h-[300px] w-full bg-charcoal/50" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2 bg-charcoal/50" />
                <Skeleton className="h-4 w-1/2 bg-charcoal/50" />
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
        <p className="text-sm text-gray-300 mb-4">There was a problem loading the products.</p>
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
    <div className="relative">
      <div
        className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 snap-x snap-mandatory"
        ref={scrollRef}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <Card
            key={product.id}
            className="min-w-[280px] max-w-[280px] border border-gold/20 snap-start flex flex-col group overflow-hidden bg-charcoal"
          >
            <div className="relative pt-4 px-4 h-[280px]">
              <div className="absolute inset-0 bg-gold-radial opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              {!product.available && (
                <Badge className="absolute top-4 right-4 bg-red-500/80 text-white">Out of Stock</Badge>
              )}
              <Badge className="absolute bottom-4 left-4 bg-gold text-jetblack">Top Seller</Badge>

              <div
                className="relative h-[200px] w-full mb-4 cursor-pointer perspective-1000"
                onClick={() => toggleFlip(product.id)}
              >
                <div
                  className={`relative w-full h-full transition-all duration-500 transform-style-3d ${flippedCards.includes(product.id) ? "rotate-y-180" : ""}`}
                >
                  {/* Front of card (jersey front) */}
                  <div className="absolute w-full h-full backface-hidden">
                    <Image
                      src={product.imageUrl || "/images/messi-signed-jersey.png"}
                      alt={`${product.title} Signed Jersey`}
                      fill
                      className="object-contain"
                    />
                  </div>

                  {/* Back of card (jersey back) */}
                  <div className="absolute w-full h-full backface-hidden rotate-y-180">
                    <Image
                      src={product.imageUrl || "/images/messi-signed-jersey.png"}
                      alt={`${product.title} Signed Jersey Back`}
                      fill
                      className="object-contain"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                      <p className="text-xs text-center text-offwhite">Click to see front</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-display font-bold text-lg text-gold">{product.title}</h3>
                  <p className="text-offwhite/70 font-body text-sm">Signed by {product.signedBy}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center">
                <span className="font-display font-bold text-lg text-gold-warm">${formatPrice(product.price)}</span>
              </div>
            </CardContent>

            <CardFooter className="flex gap-2 pt-0">
              <Button
                asChild
                className="flex-1 bg-charcoal text-gold hover:bg-charcoal/80 border border-gold/30 font-body"
              >
                <Link href={`/product/${product.id}`}>View</Link>
              </Button>
              <Button
                size="icon"
                className="bg-gold-soft hover:bg-gold-deep text-jetblack"
                onClick={() => handleAddToCart(product)}
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Add to Cart</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-jetblack border border-gold shadow-md z-10 text-gold"
        onClick={scrollLeft}
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="sr-only">Scroll Left</span>
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full bg-jetblack border border-gold shadow-md z-10 text-gold"
        onClick={scrollRight}
        disabled={currentIndex >= products.length - 1}
      >
        <ChevronRight className="h-5 w-5" />
        <span className="sr-only">Scroll Right</span>
      </Button>
    </div>
  )
}
