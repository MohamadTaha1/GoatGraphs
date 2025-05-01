"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ShoppingCart, Filter, Search, Loader2 } from "lucide-react"
import Link from "next/link"
import { useProducts } from "@/hooks/use-products"
import { useCart } from "@/components/cart-provider"
import { formatPrice } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

export default function ShopPage() {
  const router = useRouter()
  const { products, loading, error } = useProducts()
  const { addItem } = useCart()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState("all")
  const [selectedTypes, setSelectedTypes] = useState({
    shirt: false,
    ball: false,
    photo: false,
  })
  const [sortOption, setSortOption] = useState("featured")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Handle type filter changes
  const handleTypeChange = (type) => {
    setSelectedTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))
  }

  // Handle price range changes
  const handlePriceRangeChange = (value) => {
    setPriceRange(value)
  }

  // Filter products based on search, type, and price
  const filteredProducts = products.filter((product) => {
    if (!product) return false

    // Search filter
    const matchesSearch =
      (product.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.signedBy || "").toLowerCase().includes(searchTerm.toLowerCase())

    // Type filter
    const noTypeSelected = !selectedTypes.shirt && !selectedTypes.ball && !selectedTypes.photo
    const matchesType = noTypeSelected || selectedTypes[product.type || ""]

    // Price filter
    let matchesPrice = true
    const price = product.price || 0

    if (priceRange === "under100") {
      matchesPrice = price < 100
    } else if (priceRange === "100to500") {
      matchesPrice = price >= 100 && price <= 500
    } else if (priceRange === "500to1000") {
      matchesPrice = price > 500 && price <= 1000
    } else if (priceRange === "over1000") {
      matchesPrice = price > 1000
    }

    return matchesSearch && matchesType && matchesPrice
  })

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "priceLowToHigh") {
      return (a.price || 0) - (b.price || 0)
    } else if (sortOption === "priceHighToLow") {
      return (b.price || 0) - (a.price || 0)
    } else if (sortOption === "newest") {
      // Assuming createdAt is a timestamp
      const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0)
      const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0)
      return dateB - dateA
    } else {
      // Default to featured
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
    }
  })

  // Handle add to cart
  const handleAddToCart = (product) => {
    if (!product) return

    addItem({
      productId: product.id,
      name: product.title || "Untitled Product",
      price: typeof product.price === "number" ? product.price : Number(product.price || 0),
      image: product.imageUrl || "/placeholder.svg?height=100&width=100",
    })

    toast({
      title: "Added to cart",
      description: `${product.title || "Product"} has been added to your cart.`,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 bg-gold-gradient bg-clip-text text-transparent">
            Shop Authentic Signed Jerseys
          </h1>
          <p className="text-offwhite/70 font-body">
            Browse our collection of authenticated signed football jerseys from legendary players
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-offwhite/50" />
          <Input
            placeholder="Search by player or team..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 border-gold/30 bg-jetblack text-offwhite"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-gold/30 text-gold hover:bg-gold/10"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-jetblack border border-gold/30 text-offwhite rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold/50"
          >
            <option value="featured">Featured</option>
            <option value="priceLowToHigh">Price: Low to High</option>
            <option value="priceHighToLow">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="bg-charcoal border border-gold/30 rounded-lg p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Product Type Filter */}
            <div>
              <h3 className="font-display text-gold mb-3">Product Type</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Checkbox
                    id="type-shirt"
                    checked={selectedTypes.shirt}
                    onCheckedChange={() => handleTypeChange("shirt")}
                    className="border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:text-jetblack"
                  />
                  <Label htmlFor="type-shirt" className="ml-2 text-offwhite">
                    Shirts
                  </Label>
                </div>
                <div className="flex items-center">
                  <Checkbox
                    id="type-ball"
                    checked={selectedTypes.ball}
                    onCheckedChange={() => handleTypeChange("ball")}
                    className="border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:text-jetblack"
                  />
                  <Label htmlFor="type-ball" className="ml-2 text-offwhite">
                    Balls
                  </Label>
                </div>
                <div className="flex items-center">
                  <Checkbox
                    id="type-photo"
                    checked={selectedTypes.photo}
                    onCheckedChange={() => handleTypeChange("photo")}
                    className="border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:text-jetblack"
                  />
                  <Label htmlFor="type-photo" className="ml-2 text-offwhite">
                    Photos
                  </Label>
                </div>
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <h3 className="font-display text-gold mb-3">Price Range</h3>
              <RadioGroup value={priceRange} onValueChange={handlePriceRangeChange} className="space-y-2">
                <div className="flex items-center">
                  <RadioGroupItem value="all" id="price-all" className="border-gold/50 text-gold" />
                  <Label htmlFor="price-all" className="ml-2 text-offwhite">
                    All Prices
                  </Label>
                </div>
                <div className="flex items-center">
                  <RadioGroupItem value="under100" id="price-under100" className="border-gold/50 text-gold" />
                  <Label htmlFor="price-under100" className="ml-2 text-offwhite">
                    Under $100
                  </Label>
                </div>
                <div className="flex items-center">
                  <RadioGroupItem value="100to500" id="price-100to500" className="border-gold/50 text-gold" />
                  <Label htmlFor="price-100to500" className="ml-2 text-offwhite">
                    $100 - $500
                  </Label>
                </div>
                <div className="flex items-center">
                  <RadioGroupItem value="500to1000" id="price-500to1000" className="border-gold/50 text-gold" />
                  <Label htmlFor="price-500to1000" className="ml-2 text-offwhite">
                    $500 - $1000
                  </Label>
                </div>
                <div className="flex items-center">
                  <RadioGroupItem value="over1000" id="price-over1000" className="border-gold/50 text-gold" />
                  <Label htmlFor="price-over1000" className="ml-2 text-offwhite">
                    Over $1000
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Reset Filters */}
            <div className="flex items-end">
              <Button
                variant="outline"
                className="border-gold/30 text-gold hover:bg-gold/10"
                onClick={() => {
                  setSelectedTypes({ shirt: false, ball: false, photo: false })
                  setPriceRange("all")
                  setSearchTerm("")
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
          <span className="ml-2 text-offwhite">Loading products...</span>
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-red-900/20 rounded-lg border border-red-900/50 p-8">
          <h3 className="text-xl font-display font-bold text-red-500 mb-2">Error loading products</h3>
          <p className="text-offwhite/70 font-body mb-4">There was an error loading the products. Please try again.</p>
          <Button variant="outline" className="border-gold text-gold hover:bg-gold/10" onClick={() => router.refresh()}>
            Retry
          </Button>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="text-center py-20">
          <h3 className="text-xl font-display font-bold text-gold mb-2">No products found</h3>
          <p className="text-offwhite/70 font-body mb-4">
            No products match your current filters. Try adjusting your search or filters.
          </p>
          <Button
            variant="outline"
            className="border-gold text-gold hover:bg-gold/10"
            onClick={() => {
              setSelectedTypes({ shirt: false, ball: false, photo: false })
              setPriceRange("all")
              setSearchTerm("")
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden border-gold/30 bg-charcoal hover:border-gold/50 transition-all"
            >
              <div className="relative h-64 bg-jetblack">
                <Image
                  src={product.imageUrl || "/placeholder.svg?height=256&width=256"}
                  alt={product.title || "Product"}
                  fill
                  className="object-cover"
                />
                {product.featured && (
                  <div className="absolute top-2 right-2 bg-gold text-jetblack text-xs font-bold px-2 py-1 rounded">
                    Featured
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <Link href={`/customer/product/${product.id}`}>
                  <h3 className="font-display text-lg font-bold text-offwhite hover:text-gold transition-colors mb-1">
                    {product.title || "Untitled Product"}
                  </h3>
                </Link>
                <p className="text-sm text-offwhite/70 mb-2">Signed by {product.signedBy || "Unknown"}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-gold-warm font-display text-lg font-bold">
                    ${formatPrice(product.price || 0)}
                  </span>
                  <Button
                    size="sm"
                    className="bg-gold-soft hover:bg-gold-deep text-jetblack"
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.available}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    {product.available ? "Add to Cart" : "Sold Out"}
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
