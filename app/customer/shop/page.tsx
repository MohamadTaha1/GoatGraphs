"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ShoppingCart, Filter, X, Loader2 } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { useProducts, type Product } from "@/hooks/use-products"
import { formatPrice } from "@/lib/utils"

// Add this mock data at the top of the file, after the imports:
const mockProducts = [
  {
    id: "1",
    title: "Signed Messi Shirt",
    type: "shirt",
    signedBy: "Lionel Messi",
    price: 1299.99,
    available: true,
    imageUrl: "/placeholder.svg?height=300&width=300&text=Messi+Jersey",
    description: "Authentic signed shirt from 2022 World Cup season.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Ronaldo Signed Ball",
    type: "ball",
    signedBy: "Cristiano Ronaldo",
    price: 899.99,
    available: true,
    imageUrl: "/placeholder.svg?height=300&width=300&text=Ronaldo+Ball",
    description: "Match ball signed by Cristiano Ronaldo after his record-breaking goal.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Haaland Signed Photo",
    type: "photo",
    signedBy: "Erling Haaland",
    price: 499.99,
    available: false,
    imageUrl: "/placeholder.svg?height=300&width=300&text=Haaland+Photo",
    description: "Limited edition signed photograph of Erling Haaland's debut match.",
    createdAt: new Date().toISOString(),
  },
]

export default function ShopPage() {
  const searchParams = useSearchParams()
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [sortBy, setSortBy] = useState("featured")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([])
  const [flippedCards, setFlippedCards] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const { addItem } = useCart()
  const { toast } = useToast()

  // Fetch products from Firebase
  const { products: firebaseProducts, loading, error } = useProducts()
  const [products, setProducts] = useState<Product[]>([])

  // Initialize filters from URL params
  useEffect(() => {
    const type = searchParams.get("type")
    if (type) {
      setSelectedTypes([type])
    }

    const player = searchParams.get("player")
    if (player) {
      setSelectedPlayers([player])
    }

    const search = searchParams.get("search")
    if (search) {
      setSearchQuery(search)
    }
  }, [searchParams])

  useEffect(() => {
    // If Firebase fails, use mock data
    if (error) {
      console.warn("Using mock data due to Firebase error:", error)
      setProducts(mockProducts)
    } else if (firebaseProducts.length > 0) {
      // Ensure all products have numeric prices
      const normalizedProducts = firebaseProducts.map((product) => ({
        ...product,
        price: typeof product.price === "string" ? Number.parseFloat(product.price) : Number(product.price),
      }))
      setProducts(normalizedProducts)
    } else if (!loading && firebaseProducts.length === 0) {
      // If no products are returned and not loading, use mock data
      setProducts(mockProducts)
    }
  }, [firebaseProducts, loading, error])

  // Filter products based on selected filters
  const filteredProducts = products.filter((product) => {
    // Ensure price is a number for comparison
    const productPrice = typeof product.price === "string" ? Number.parseFloat(product.price) : Number(product.price)

    // Search query filter
    if (
      searchQuery &&
      !product.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !product.signedBy.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Filter by type
    if (selectedTypes.length > 0 && !selectedTypes.includes(product.type)) {
      return false
    }

    // Filter by player (signedBy)
    if (
      selectedPlayers.length > 0 &&
      !selectedPlayers.some((player) => product.signedBy.toLowerCase().includes(player.toLowerCase()))
    ) {
      return false
    }

    // Filter by availability
    if (selectedAvailability.length > 0) {
      if (selectedAvailability.includes("in-stock") && !product.available) {
        return false
      }
      if (selectedAvailability.includes("out-of-stock") && product.available) {
        return false
      }
    }

    // Filter by price range
    if (isNaN(productPrice) || productPrice < priceRange[0] || productPrice > priceRange[1]) {
      return false
    }

    return true
  })

  // Sort filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = typeof a.price === "string" ? Number.parseFloat(a.price) : Number(a.price)
    const priceB = typeof b.price === "string" ? Number.parseFloat(b.price) : Number(b.price)

    if (sortBy === "price-low-high") return priceA - priceB
    if (sortBy === "price-high-low") return priceB - priceA
    if (sortBy === "newest") {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return dateB - dateA
    }
    return 0 // Default or "featured" sorting
  })

  const handleTypeChange = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const handlePlayerChange = (player: string) => {
    setSelectedPlayers((prev) => (prev.includes(player) ? prev.filter((p) => p !== player) : [...prev, player]))
  }

  const handleAvailabilityChange = (availability: string) => {
    setSelectedAvailability((prev) =>
      prev.includes(availability) ? prev.filter((a) => a !== availability) : [...prev, availability],
    )
  }

  const handleAddToCart = (product: Product) => {
    const productPrice = typeof product.price === "string" ? Number.parseFloat(product.price) : Number(product.price)

    addItem({
      id: product.id,
      name: product.title,
      team: product.signedBy,
      image: product.imageUrl,
      price: productPrice,
      quantity: 1,
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

  // Get unique types and players for filters
  const types = Array.from(new Set(products.map((product) => product.type)))
  const players = Array.from(new Set(products.map((product) => product.signedBy)))

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-display font-bold mb-8 text-gold">Shop Signed Memorabilia</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters - Desktop */}
        <div className="hidden lg:block w-64 space-y-6">
          <div>
            <h3 className="font-display font-semibold mb-3 text-gold">Filter By</h3>
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="player" className="border-gold/20">
                <AccordionTrigger className="font-display text-offwhite hover:text-gold">Players</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {players.map((player) => (
                      <div key={player} className="flex items-center space-x-2">
                        <Checkbox
                          id={`player-${player.toLowerCase().replace(/\s+/g, "-")}`}
                          checked={selectedPlayers.includes(player)}
                          onCheckedChange={() => handlePlayerChange(player)}
                          className="border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:text-jetblack"
                        />
                        <Label
                          htmlFor={`player-${player.toLowerCase().replace(/\s+/g, "-")}`}
                          className="font-body text-offwhite"
                        >
                          {player}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="type" className="border-gold/20">
                <AccordionTrigger className="font-display text-offwhite hover:text-gold">Type</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {types.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type.toLowerCase().replace(/\s+/g, "-")}`}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={() => handleTypeChange(type)}
                          className="border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:text-jetblack"
                        />
                        <Label
                          htmlFor={`type-${type.toLowerCase().replace(/\s+/g, "-")}`}
                          className="font-body text-offwhite capitalize"
                        >
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="availability" className="border-gold/20">
                <AccordionTrigger className="font-display text-offwhite hover:text-gold">Availability</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="availability-in-stock"
                        checked={selectedAvailability.includes("in-stock")}
                        onCheckedChange={() => handleAvailabilityChange("in-stock")}
                        className="border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:text-jetblack"
                      />
                      <Label htmlFor="availability-in-stock" className="font-body text-offwhite">
                        In Stock
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="availability-out-of-stock"
                        checked={selectedAvailability.includes("out-of-stock")}
                        onCheckedChange={() => handleAvailabilityChange("out-of-stock")}
                        className="border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:text-jetblack"
                      />
                      <Label htmlFor="availability-out-of-stock" className="font-body text-offwhite">
                        Out of Stock
                      </Label>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div>
            <h3 className="font-display font-semibold mb-3 text-gold">Price Range</h3>
            <div className="px-2">
              <Slider
                defaultValue={[0, 2000]}
                min={0}
                max={2000}
                step={50}
                value={priceRange}
                onValueChange={setPriceRange}
                className="mb-6"
              />
              <div className="flex items-center justify-between font-body text-offwhite">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Clear filters button */}
          <Button
            variant="outline"
            className="w-full border-gold text-gold hover:bg-gold/10"
            onClick={() => {
              setSelectedTypes([])
              setSelectedPlayers([])
              setSelectedAvailability([])
              setPriceRange([0, 2000])
              setSearchQuery("")
            }}
          >
            <X className="mr-2 h-4 w-4" />
            Clear All Filters
          </Button>
        </div>

        {/* Mobile Filter Button */}
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden mb-4 flex items-center gap-1 border-gold text-gold px-2 py-1 h-7 text-xs"
            >
              <Filter className="h-3 w-3" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-jetblack border-r border-gold/20">
            <SheetHeader>
              <SheetTitle className="text-gold font-display">Filters</SheetTitle>
              <SheetDescription className="font-body text-offwhite/70">
                Filter products by player, type, and price.
              </SheetDescription>
            </SheetHeader>
            <div className="py-4 space-y-6">
              <div>
                <h3 className="font-display font-semibold mb-3 text-gold">Filter By</h3>
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="player" className="border-gold/20">
                    <AccordionTrigger className="font-display text-offwhite hover:text-gold">Players</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {players.map((player) => (
                          <div key={player} className="flex items-center space-x-2">
                            <Checkbox
                              id={`mobile-player-${player.toLowerCase().replace(/\s+/g, "-")}`}
                              checked={selectedPlayers.includes(player)}
                              onCheckedChange={() => handlePlayerChange(player)}
                              className="border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:text-jetblack"
                            />
                            <Label
                              htmlFor={`mobile-player-${player.toLowerCase().replace(/\s+/g, "-")}`}
                              className="font-body text-offwhite"
                            >
                              {player}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="type" className="border-gold/20">
                    <AccordionTrigger className="font-display text-offwhite hover:text-gold">Type</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {types.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`mobile-type-${type.toLowerCase().replace(/\s+/g, "-")}`}
                              checked={selectedTypes.includes(type)}
                              onCheckedChange={() => handleTypeChange(type)}
                              className="border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:text-jetblack"
                            />
                            <Label
                              htmlFor={`mobile-type-${type.toLowerCase().replace(/\s+/g, "-")}`}
                              className="font-body text-offwhite capitalize"
                            >
                              {type}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="availability" className="border-gold/20">
                    <AccordionTrigger className="font-display text-offwhite hover:text-gold">
                      Availability
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="mobile-availability-in-stock"
                            checked={selectedAvailability.includes("in-stock")}
                            onCheckedChange={() => handleAvailabilityChange("in-stock")}
                            className="border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:text-jetblack"
                          />
                          <Label htmlFor="mobile-availability-in-stock" className="font-body text-offwhite">
                            In Stock
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="mobile-availability-out-of-stock"
                            checked={selectedAvailability.includes("out-of-stock")}
                            onCheckedChange={() => handleAvailabilityChange("out-of-stock")}
                            className="border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:text-jetblack"
                          />
                          <Label htmlFor="mobile-availability-out-of-stock" className="font-body text-offwhite">
                            Out of Stock
                          </Label>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <div>
                <h3 className="font-display font-semibold mb-3 text-gold">Price Range</h3>
                <div className="px-2">
                  <Slider
                    defaultValue={[0, 2000]}
                    min={0}
                    max={2000}
                    step={50}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-6"
                  />
                  <div className="flex items-center justify-between font-body text-offwhite">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-gold-soft hover:bg-gold-deep text-jetblack font-body"
                  onClick={() => setFiltersOpen(false)}
                >
                  Apply Filters
                </Button>

                <Button
                  variant="outline"
                  className="border-gold text-gold hover:bg-gold/10"
                  onClick={() => {
                    setSelectedTypes([])
                    setSelectedPlayers([])
                    setSelectedAvailability([])
                    setPriceRange([0, 2000])
                    setSearchQuery("")
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <p className="text-offwhite/70 mb-4 sm:mb-0 font-body">
              {loading ? "Loading products..." : `Showing ${sortedProducts.length} results`}
            </p>
            <div className="w-full sm:w-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px] font-body border-gold/50 bg-charcoal text-offwhite">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="bg-charcoal border-gold/50">
                  <SelectItem value="featured" className="text-offwhite">
                    Sort
                  </SelectItem>
                  <SelectItem value="price-low-high" className="text-offwhite">
                    Price: Low to High
                  </SelectItem>
                  <SelectItem value="price-high-low" className="text-offwhite">
                    Price: High to Low
                  </SelectItem>
                  <SelectItem value="newest" className="text-offwhite">
                    Newest
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
              <span className="ml-2 text-offwhite">Loading products...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-red-900/20 rounded-lg border border-red-900/50 p-8">
              <h3 className="text-xl font-display font-bold text-red-500 mb-2">Error loading products</h3>
              <p className="text-offwhite/70 font-body mb-4">
                There was an error loading the products. Please try again.
              </p>
              <Button
                variant="outline"
                className="border-gold text-gold hover:bg-gold/10"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <Card
                  key={product.id}
                  className="border border-gold/20 flex flex-col h-full group overflow-hidden bg-charcoal"
                >
                  <div className="relative pt-4 px-4">
                    <div className="absolute inset-0 bg-gold-radial opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>

                    <Badge className="absolute top-6 right-6 z-10 bg-jetblack text-gold border border-gold font-body capitalize">
                      {product.type}
                    </Badge>

                    <div
                      className="relative h-[200px] w-full mb-4 cursor-pointer"
                      onClick={() => toggleFlip(product.id)}
                    >
                      <Image
                        src={product.imageUrl || "/placeholder.svg?height=200&width=200"}
                        alt={product.title}
                        fill
                        className="object-contain"
                      />
                    </div>

                    {/* Availability indicator */}
                    {!product.available && (
                      <div className="absolute bottom-4 left-4 bg-red-500/80 text-white text-xs px-2 py-1 rounded-full">
                        Out of stock
                      </div>
                    )}
                  </div>

                  <CardContent className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-display font-bold text-lg text-gold">{product.title}</h3>
                        <p className="text-offwhite/70 font-body text-sm">Signed by {product.signedBy}</p>
                      </div>
                      <span className="font-display font-bold text-lg text-gold-warm">
                        ${formatPrice(product.price)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm line-clamp-2 font-body text-offwhite/80">{product.description}</p>
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
                      disabled={!product.available}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span className="sr-only">Add to Cart</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {!loading && sortedProducts.length === 0 && (
            <div className="text-center py-12 bg-charcoal rounded-lg border border-gold/20 p-8">
              <h3 className="text-xl font-display font-bold text-gold mb-2">No products found</h3>
              <p className="text-offwhite/70 font-body mb-4">
                Try adjusting your filters to find what you're looking for.
              </p>
              <Button
                variant="outline"
                className="border-gold text-gold hover:bg-gold/10"
                onClick={() => {
                  setSelectedTypes([])
                  setSelectedPlayers([])
                  setSelectedAvailability([])
                  setPriceRange([0, 2000])
                  setSearchQuery("")
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
