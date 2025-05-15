"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ShoppingCart,
  Share2,
  BadgeIcon as Certificate,
  Shield,
  Truck,
  Check,
  Info,
  Loader2,
  ArrowLeft,
} from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/components/ui/use-toast"
import { getProduct, type Product, useProducts } from "@/hooks/use-products"
import { formatPrice } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import AuthRequiredModal from "@/components/auth-required-modal"

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const { addItem } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const { user, isGuest } = useAuth()

  // Fetch related products
  const { products: allProducts } = useProducts()

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true)
        const productData = await getProduct(params.id)

        if (productData) {
          setProduct(productData)
        } else {
          // Fallback to mock data if product not found
          const mockProduct = {
            id: params.id,
            title: "Sample Product",
            type: "shirt",
            signedBy: "Famous Player",
            price: 999.99,
            available: true,
            imageUrl: "/placeholder.svg?height=400&width=400&text=Product",
            description: "This is a sample product description for when Firebase is unavailable.",
            createdAt: new Date().toISOString(),
          }
          setProduct(mockProduct)
        }
      } catch (err) {
        console.error("Error loading product:", err)
        setError(err instanceof Error ? err : new Error("Failed to load product"))

        // Fallback to mock data on error
        const mockProduct = {
          id: params.id,
          title: "Sample Product",
          type: "shirt",
          signedBy: "Famous Player",
          price: 999.99,
          available: true,
          imageUrl: "/placeholder.svg?height=400&width=400&text=Product",
          description: "This is a sample product description for when Firebase is unavailable.",
          createdAt: new Date().toISOString(),
        }
        setProduct(mockProduct)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [params.id, router])

  const handleAddToCart = () => {
    if (!product) return

    // If user is a guest, show auth modal
    if (!user || isGuest) {
      setShowAuthModal(true)
      return
    }

    addItem({
      productId: product.id,
      name: product.title,
      price: typeof product.price === "number" ? product.price : Number.parseFloat(product.price as string) || 0,
      image: product.imageUrl || "/placeholder.svg",
    })

    toast({
      title: "Added to cart",
      description: `${product.title} has been added to your cart.`,
    })
  }

  // Get related products (same player or same type)
  const relatedProducts = allProducts
    .filter((p) => p.id !== params.id && (p.signedBy === product?.signedBy || p.type === product?.type))
    .slice(0, 4)

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <span className="ml-2 text-offwhite">Loading product...</span>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container py-8">
        <div className="text-center py-12 bg-red-900/20 rounded-lg border border-red-900/50 p-8">
          <h3 className="text-xl font-display font-bold text-red-500 mb-2">Product Not Found</h3>
          <p className="text-offwhite/70 font-body mb-4">
            {error?.message || "The requested product could not be found."}
          </p>
          <Button variant="outline" className="border-gold text-gold hover:bg-gold/10" asChild>
            <Link href="/customer/shop">Back to Shop</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Button
        variant="ghost"
        size="icon"
        className="mb-4 rounded-full text-gold hover:text-gold-deep hover:bg-gold/10"
        asChild
      >
        <Link href="/customer/shop">
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Link>
      </Button>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Product Image */}
        <div className="lg:w-1/2">
          <div className="relative h-[500px] w-full mb-4 border border-gold/20 rounded-lg overflow-hidden bg-charcoal">
            <div className="absolute inset-0 bg-gold-radial opacity-10"></div>
            <Image
              src={product.imageUrl || "/placeholder.svg"}
              alt={product.title}
              fill
              className="object-contain z-10"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="lg:w-1/2">
          <div className="mb-6">
            <h1 className="text-3xl font-display font-bold mb-2 text-gold">{product.title}</h1>
            <p className="text-offwhite/70 font-body">Signed by {product.signedBy}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-jetblack text-gold border border-gold font-body capitalize">{product.type}</Badge>
              {!product.available && (
                <Badge className="bg-red-500/20 text-red-500 border border-red-500/30 font-body">Out of Stock</Badge>
              )}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-3xl font-display font-bold text-gold-warm">${formatPrice(product.price)}</span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="w-full sm:w-1/3">
                <div className="flex items-center border border-gold/30 rounded-md overflow-hidden">
                  <Button
                    type="button"
                    variant="ghost"
                    className="px-3 py-2 text-offwhite hover:text-gold"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!product.available}
                  >
                    -
                  </Button>
                  <div className="w-12 text-center text-offwhite">{quantity}</div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="px-3 py-2 text-offwhite hover:text-gold"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!product.available}
                  >
                    +
                  </Button>
                </div>
              </div>

              <Button
                className="w-full sm:w-auto bg-gold-soft hover:bg-gold-deep text-jetblack flex-1 font-body"
                onClick={handleAddToCart}
                disabled={!product.available}
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>

              <Button variant="outline" size="icon" className="border-gold text-gold hover:bg-gold/10">
                <Share2 className="h-5 w-5" />
                <span className="sr-only">Share</span>
              </Button>
            </div>
          </div>

          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-3">
              <Certificate className="h-5 w-5 text-gold" />
              <span className="font-body text-offwhite">Certificate of Authenticity included</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gold" />
              <span className="font-body text-offwhite">100% Authenticity Guarantee</span>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-gold" />
              <span className="font-body text-offwhite">Free delivery in Dubai on orders over $100</span>
            </div>
          </div>

          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-charcoal border border-gold/20">
              <TabsTrigger
                value="description"
                className="text-gold data-[state=active]:bg-gold data-[state=active]:text-jetblack font-display"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="authentication"
                className="text-gold data-[state=active]:bg-gold data-[state=active]:text-jetblack font-display"
              >
                Authentication
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="p-4 border border-gold/20 rounded-b-lg bg-charcoal">
              <p className="font-body text-offwhite">{product.description}</p>
            </TabsContent>
            <TabsContent value="authentication" className="p-4 border border-gold/20 rounded-b-lg bg-charcoal">
              <p className="font-body text-offwhite mb-4">
                Each item comes with a Certificate of Authenticity. The signature has been verified by a team of experts
                and is guaranteed to be genuine.
              </p>

              <div className="bg-jetblack border border-gold/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-5 w-5 text-gold" />
                  <h3 className="font-display text-gold">Authentication Process</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-gold mt-1" />
                    <span className="font-body text-offwhite">
                      Expert verification by multiple authentication specialists
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-gold mt-1" />
                    <span className="font-body text-offwhite">Signature comparison with authenticated database</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-gold mt-1" />
                    <span className="font-body text-offwhite">
                      Unique hologram with serial number applied to item and certificate
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-gold mt-1" />
                    <span className="font-body text-offwhite">
                      High-resolution photography of signature for documentation
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-gold mt-1" />
                    <span className="font-body text-offwhite">
                      Secure online verification system for authenticity checks
                    </span>
                  </li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-display font-bold mb-6 text-gold">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Card
                key={relatedProduct.id}
                className="border border-gold/20 flex flex-col h-full group overflow-hidden bg-charcoal"
              >
                <div className="relative pt-4 px-4">
                  <div className="absolute inset-0 bg-gold-radial opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                  <Badge className="absolute top-6 right-6 z-10 bg-jetblack text-gold border border-gold font-body capitalize">
                    {relatedProduct.type}
                  </Badge>
                  <div className="relative h-[200px] w-full mb-4">
                    <Image
                      src={relatedProduct.imageUrl || "/placeholder.svg"}
                      alt={relatedProduct.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <CardContent className="flex-grow">
                  <h3 className="font-display font-bold text-lg text-gold">{relatedProduct.title}</h3>
                  <p className="text-offwhite/70 font-body">Signed by {relatedProduct.signedBy}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="font-display font-bold text-lg text-gold-warm">
                      ${formatPrice(relatedProduct.price)}
                    </span>
                    <Button
                      asChild
                      className="bg-charcoal text-gold hover:bg-charcoal/80 border border-gold/30 font-body"
                    >
                      <Link href={`/customer/product/${relatedProduct.id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        actionType="cart"
        returnUrl={`/customer/product/${params.id}`}
      />
    </div>
  )
}
