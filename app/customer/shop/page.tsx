"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Filter, Search, Loader2, ShoppingBag, Pencil, Video, Award } from "lucide-react"
import Link from "next/link"
import { useProducts } from "@/hooks/use-products"
import { useCart } from "@/components/cart-provider"
import { formatPrice } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { OptimizedImage } from "@/components/optimized-image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"

// Form schema for pre-order
const preOrderSchema = z.object({
  personalization: z
    .string()
    .min(1, "Personalization message is required")
    .max(50, "Personalization must be less than 50 characters"),
  vipFrame: z.boolean().default(false),
  specialInstructions: z.string().max(200, "Special instructions must be less than 200 characters").optional(),
})

type PreOrderFormValues = z.infer<typeof preOrderSchema>

export default function ShopPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { products, loading, error } = useProducts()
  const { addItem } = useCart()
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState("all")
  const [selectedTypes, setSelectedTypes] = useState({
    shirt: false,
    ball: false,
    photo: false,
  })
  const [sortOption, setSortOption] = useState("featured")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("in-stock")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedJersey, setSelectedJersey] = useState(null)

  // Pre-defined jersey options for pre-order
  const jerseyOptions = [
    {
      id: "jersey-1",
      title: "Manchester United Home Kit 2023/24",
      player: "Marcus Rashford",
      image: "/placeholder-rli5n.png",
      price: 299.99,
      description: "Official Manchester United home jersey signed by Marcus Rashford.",
    },
    {
      id: "jersey-2",
      title: "Real Madrid Home Kit 2023/24",
      player: "Jude Bellingham",
      image: "/placeholder-nbo7j.png",
      price: 349.99,
      description: "Official Real Madrid home jersey signed by Jude Bellingham.",
    },
    {
      id: "jersey-3",
      title: "Barcelona Home Kit 2023/24",
      player: "Robert Lewandowski",
      image: "/placeholder-bz0yz.png",
      price: 329.99,
      description: "Official Barcelona home jersey signed by Robert Lewandowski.",
    },
  ]

  // Initialize form for pre-order
  const form = useForm<PreOrderFormValues>({
    resolver: zodResolver(preOrderSchema),
    defaultValues: {
      personalization: "",
      vipFrame: false,
      specialInstructions: "",
    },
  })

  // Set initial jersey selection
  useEffect(() => {
    if (jerseyOptions.length > 0 && !selectedJersey) {
      setSelectedJersey(jerseyOptions[0])
    }
  }, [selectedJersey])

  // Calculate price based on options
  const calculatePrice = () => {
    if (!selectedJersey) return 0
    let price = selectedJersey.price
    if (form.watch("vipFrame")) price += 150.0
    return price
  }

  // Handle pre-order form submission
  const onSubmitPreOrder = async (data: PreOrderFormValues) => {
    if (!user) {
      // Redirect to login page with return URL
      const returnUrl = encodeURIComponent(window.location.pathname)
      router.push(`/login?returnUrl=${returnUrl}&action=preOrder`)
      return
    }

    if (!selectedJersey) {
      toast({
        title: "Please select a jersey",
        description: "You must select a jersey to continue with your pre-order.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Calculate final price
      const finalPrice = calculatePrice()

      // Create a product-like object for the cart
      const preOrderItem = {
        productId: `preorder-${selectedJersey.id}-${Date.now()}`,
        name: `${selectedJersey.title} - Personalized`,
        price: finalPrice,
        image: selectedJersey.image,
        type: "preorder",
        details: {
          jersey: selectedJersey.title,
          player: selectedJersey.player,
          personalization: data.personalization,
          vipFrame: data.vipFrame,
          specialInstructions: data.specialInstructions,
          price: finalPrice,
        },
      }

      // Add to cart
      addItem(preOrderItem)

      // Show success message
      toast({
        title: "Pre-order added to cart",
        description: "Your personalized jersey has been added to your cart.",
      })

      // Reset form
      form.reset()
    } catch (error) {
      console.error("Error adding pre-order to cart:", error)
      toast({
        title: "Error",
        description: "There was an error adding your pre-order to the cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Set initial tab based on URL parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (tabParam === "pre-order") {
      setActiveTab("pre-order")
    }

    // Set initial search term from URL if present
    const searchParam = searchParams.get("search")
    if (searchParam) {
      setSearchTerm(searchParam)
    }
  }, [searchParams])

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

  // Separate products into in-stock and pre-order
  const inStockProducts = products.filter((product) => !product.isPreOrder)
  const preOrderProducts = products.filter((product) => product.isPreOrder)

  // Filter products based on search, type, and price
  const filterProducts = (productList) => {
    return productList.filter((product) => {
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
  }

  // Filter and sort products
  const filteredInStockProducts = filterProducts(inStockProducts)
  const filteredPreOrderProducts = filterProducts(preOrderProducts)

  // Sort products
  const sortProducts = (productList) => {
    return [...productList].sort((a, b) => {
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
  }

  const sortedInStockProducts = sortProducts(filteredInStockProducts)
  const sortedPreOrderProducts = sortProducts(filteredPreOrderProducts)

  // Handle add to cart
  const handleAddToCart = (product) => {
    if (!product) return

    if (!user) {
      // Redirect to login page with return URL
      const returnUrl = encodeURIComponent(window.location.pathname)
      router.push(`/login?returnUrl=${returnUrl}&action=addToCart`)
      return
    }

    // Ensure we have a valid product with required fields
    addItem({
      productId: product.id,
      name: product.title || "Untitled Product",
      price: typeof product.price === "string" ? Number.parseFloat(product.price) : Number(product.price || 0),
      image: product.imageUrl || "/placeholder.svg?height=100&width=100",
      type: product.isPreOrder ? "pre-order" : "product", // Distinguish between regular products and pre-orders
    })

    toast({
      title: "Added to cart",
      description: `${product.title || "Product"} has been added to your cart.`,
    })
  }

  // Render product grid
  const renderProductGrid = (products) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
          <span className="ml-2 text-offwhite">Loading products...</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-20 bg-red-900/20 rounded-lg border border-red-900/50 p-8">
          <h3 className="text-xl font-display font-bold text-red-500 mb-2">Error loading products</h3>
          <p className="text-offwhite/70 font-body mb-4">There was an error loading the products. Please try again.</p>
          <Button variant="outline" className="border-gold text-gold hover:bg-gold/10" onClick={() => router.refresh()}>
            Retry
          </Button>
        </div>
      )
    }

    if (products.length === 0) {
      return (
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
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card
            key={product.id}
            className="overflow-hidden border-gold/30 bg-charcoal hover:border-gold/50 transition-all"
          >
            <div className="relative h-64 bg-jetblack">
              <OptimizedImage
                src={product.imageUrl || "/placeholder.svg?height=256&width=256"}
                alt={product.title || "Product"}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="w-full h-full"
                objectFit="contain"
                priority={product.featured}
                quality={85}
              />
              {product.featured && (
                <div className="absolute top-2 right-2 bg-gold text-jetblack text-xs font-bold px-2 py-1 rounded">
                  Featured
                </div>
              )}
              {product.isPreOrder && (
                <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                  Pre-Order
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
    )
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

      <Tabs defaultValue={activeTab} value={activeTab} className="w-full mb-8" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="in-stock" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            In-Stock Products
          </TabsTrigger>
          <TabsTrigger value="pre-order" className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Custom Pre-Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-stock">
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

          {/* In-Stock Products Grid */}
          {renderProductGrid(sortedInStockProducts)}
        </TabsContent>

        <TabsContent value="pre-order">
          <div className="bg-charcoal border border-gold/30 rounded-lg p-6">
            <h2 className="text-2xl font-display font-bold mb-4 text-gold">Custom Pre-Order</h2>
            <p className="text-offwhite/80 mb-6">
              Create your own custom signed jersey by selecting the jersey and personalization options below. Pre-orders
              typically take 3-4 weeks for delivery as we arrange for the requested signatures.
            </p>

            <div className="space-y-8">
              {/* Pre-order Benefits Banner */}
              <div className="bg-gold/10 border border-gold/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Video className="h-5 w-5 text-gold" />
                  <h3 className="text-lg font-display font-bold text-gold">Exclusive Video Documentation</h3>
                </div>
                <p className="text-offwhite/80 ml-8">
                  All pre-orders include a personalized video of the player signing your item, providing undeniable
                  proof of authenticity and a unique keepsake.
                </p>
              </div>

              {/* Jersey Selection */}
              <div>
                <h3 className="text-xl font-display font-bold text-gold mb-4">Select a Jersey</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {jerseyOptions.map((jersey) => (
                    <Card
                      key={jersey.id}
                      className={`cursor-pointer transition-all overflow-hidden ${
                        selectedJersey && selectedJersey.id === jersey.id
                          ? "border-gold bg-gold/10"
                          : "border-gold/30 bg-charcoal hover:border-gold/50"
                      }`}
                      onClick={() => setSelectedJersey(jersey)}
                    >
                      <div className="relative h-48">
                        <Image
                          src={jersey.image || "/placeholder.svg"}
                          alt={jersey.title}
                          fill
                          className="object-contain"
                        />
                        {selectedJersey && selectedJersey.id === jersey.id && (
                          <div className="absolute top-2 right-2 bg-gold rounded-full p-1">
                            <Checkbox checked={true} className="h-4 w-4 text-black" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-display font-bold text-offwhite">{jersey.title}</h4>
                        <p className="text-sm text-offwhite/70">Signed by {jersey.player}</p>
                        <p className="text-gold-warm font-display font-bold mt-2">${jersey.price.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Personalization Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitPreOrder)} className="space-y-6">
                  <div className="bg-charcoal/50 border border-gold/30 rounded-lg p-6">
                    <h3 className="text-xl font-display font-bold text-gold mb-4">Personalization Details</h3>
                    <p className="text-offwhite/70 mb-6">
                      Add your personal message to be included with the signature on your selected jersey.
                    </p>

                    {/* Personalization Message */}
                    <FormField
                      control={form.control}
                      name="personalization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gold">Personalization Message*</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g. To John, Best Wishes"
                              className="border-gold/30 bg-jetblack text-offwhite min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-offwhite/50">
                            This message will be written alongside the player's signature (50 characters max)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* VIP Frame Option */}
                    <div className="mt-6">
                      <FormField
                        control={form.control}
                        name="vipFrame"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gold/30 p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:text-jetblack"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <div className="flex items-center gap-2">
                                <FormLabel className="text-offwhite">VIP Frame (+$150.00)</FormLabel>
                                <Award className="h-4 w-4 text-gold" />
                              </div>
                              <FormDescription className="text-offwhite/50">
                                Premium museum-quality frame with UV protection and certificate display
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Special Instructions */}
                    <div className="mt-6">
                      <FormField
                        control={form.control}
                        name="specialInstructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gold">Special Instructions (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any special requests or instructions for your order"
                                className="border-gold/30 bg-jetblack text-offwhite min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-charcoal/50 border border-gold/30 rounded-lg p-6">
                    <h3 className="text-xl font-display font-bold text-gold mb-4">Order Summary</h3>
                    {selectedJersey && (
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between">
                          <span className="text-offwhite/70">Jersey:</span>
                          <span className="text-offwhite">{selectedJersey.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-offwhite/70">Player Signature:</span>
                          <span className="text-offwhite">{selectedJersey.player}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-offwhite/70">Base Price:</span>
                          <span className="text-offwhite">${selectedJersey.price.toFixed(2)}</span>
                        </div>
                        {form.watch("vipFrame") && (
                          <div className="flex justify-between">
                            <span className="text-offwhite/70">VIP Frame:</span>
                            <span className="text-offwhite">$150.00</span>
                          </div>
                        )}
                        <div className="border-t border-gold/20 pt-2 mt-2 flex justify-between font-bold">
                          <span className="text-gold">Total:</span>
                          <span className="text-gold">${calculatePrice().toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    <div className="text-sm text-offwhite/50 mb-6">
                      <p>• Pre-orders typically take 3-4 weeks for delivery</p>
                      <p>• Each jersey comes with a certificate of authenticity</p>
                      <p>• Includes video of the player signing your item</p>
                      <p>• Free shipping on all pre-orders</p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gold-soft hover:bg-gold-deep text-jetblack"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Add Pre-Order to Cart"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>

          {/* Pre-Order Products Grid */}
          {sortedPreOrderProducts.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-display font-bold mb-6 text-gold">Featured Pre-Order Products</h3>
              {renderProductGrid(sortedPreOrderProducts)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
