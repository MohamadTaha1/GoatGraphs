"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { collection, getDocs, query, where } from "firebase/firestore"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ArrowRight, Award, CheckCircle, ShoppingBag, Star } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { CategoryShowcase } from "@/components/category-showcase"

// Types for our Firebase data
interface Banner {
  id: string
  title: string
  subtitle: string
  imageUrl: string
  buttonText: string
  buttonLink: string
  active: boolean
  createdAt?: any
}

interface Product {
  id: string
  name: string
  price: any // Changed to 'any' to handle different formats
  imageUrl: string
  category: string
  featured: boolean
  description: string
  soldCount?: number
}

interface Testimonial {
  id: string
  name: string
  avatar: string
  text: string
  rating: number
  featured: boolean
}

interface Category {
  id: string
  name: string
  imageUrl: string
  description?: string
  featured?: boolean
}

// Helper function to safely format price
function formatPrice(price: any): string {
  // Handle undefined or null
  if (price === undefined || price === null) {
    return "0.00"
  }

  // Convert to number if it's a string
  const numPrice = typeof price === "string" ? Number.parseFloat(price) : price

  // Check if it's a valid number
  if (isNaN(numPrice)) {
    return "0.00"
  }

  // Format with 2 decimal places
  return numPrice.toFixed(2)
}

export default function CustomerHome() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [topSelling, setTopSelling] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestoreInstance()
        if (!db) {
          console.error("Firestore instance is null")
          setLoading(false)
          return
        }

        // Fetch active banners - modified to avoid composite index requirement
        try {
          const bannersQuery = query(collection(db, "banners"), where("active", "==", true))
          const bannersSnapshot = await getDocs(bannersQuery)
          const bannersData = bannersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Banner[]
          // Sort in memory instead of using orderBy to avoid composite index requirement
          bannersData.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(0)
            const dateB = b.createdAt?.toDate?.() || new Date(0)
            return dateB.getTime() - dateA.getTime()
          })
          setBanners(bannersData)
        } catch (error) {
          console.error("Error fetching banners:", error)
          // Set empty array as fallback
          setBanners([])
        }

        // Fetch featured products - simplified query
        try {
          const featuredProductsQuery = query(collection(db, "products"), where("featured", "==", true))
          const featuredProductsSnapshot = await getDocs(featuredProductsQuery)
          const featuredProductsData = featuredProductsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Product[]
          setFeaturedProducts(featuredProductsData)
        } catch (error) {
          console.error("Error fetching featured products:", error)
          setFeaturedProducts([])
        }

        // Fetch featured testimonials - simplified query
        try {
          const testimonialsQuery = query(collection(db, "testimonials"), where("featured", "==", true))
          const testimonialsSnapshot = await getDocs(testimonialsQuery)
          const testimonialsData = testimonialsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Testimonial[]
          setTestimonials(testimonialsData)
        } catch (error) {
          console.error("Error fetching testimonials:", error)
          setTestimonials([])
        }

        // Fetch ALL categories instead of just featured ones
        try {
          const categoriesQuery = query(collection(db, "categories"))
          const categoriesSnapshot = await getDocs(categoriesQuery)
          const categoriesData = categoriesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Category[]
          setCategories(categoriesData)
        } catch (error) {
          console.error("Error fetching categories:", error)
          setCategories([])
        }

        // Fetch top selling products - simplified query
        // Instead of ordering by soldCount in Firestore, we'll fetch all products and sort in memory
        try {
          const productsQuery = query(collection(db, "products"))
          const productsSnapshot = await getDocs(productsQuery)
          const productsData = productsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Product[]
          // Sort by soldCount in memory
          const sortedProducts = [...productsData].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
          // Take only the top 3
          setTopSelling(sortedProducts.slice(0, 3))
        } catch (error) {
          console.error("Error fetching top selling products:", error)
          setTopSelling([])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Helper function to render stars based on rating
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => <Star key={i} className={`h-4 w-4 ${i < rating ? "text-gold fill-gold" : "text-gray-300"}`} />)
  }

  // Loading states
  if (loading) {
    return (
      <div className="pt-24 pb-16">
        {/* Hero skeleton */}
        <div className="relative h-[500px] w-full bg-gray-800 rounded-lg overflow-hidden mb-16">
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16">
            <Skeleton className="h-12 w-2/3 mb-4 bg-gray-700" />
            <Skeleton className="h-6 w-1/2 mb-8 bg-gray-700" />
            <Skeleton className="h-10 w-40 bg-gray-700" />
          </div>
        </div>

        {/* Featured products skeleton */}
        <div className="container mb-16">
          <Skeleton className="h-8 w-64 mb-8 bg-gray-700" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg overflow-hidden">
                <Skeleton className="h-64 w-full bg-gray-700" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2 bg-gray-700" />
                  <Skeleton className="h-5 w-1/3 bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories skeleton */}
        <div className="container mb-16">
          <Skeleton className="h-8 w-64 mb-8 bg-gray-700" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40 rounded-lg bg-gray-700" />
            ))}
          </div>
        </div>

        {/* Testimonials skeleton */}
        <div className="container">
          <Skeleton className="h-8 w-64 mb-8 bg-gray-700" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-lg bg-gray-800">
                <div className="flex items-center mb-4">
                  <Skeleton className="h-12 w-12 rounded-full mr-4 bg-gray-700" />
                  <Skeleton className="h-6 w-32 bg-gray-700" />
                </div>
                <Skeleton className="h-4 w-full mb-2 bg-gray-700" />
                <Skeleton className="h-4 w-full mb-2 bg-gray-700" />
                <Skeleton className="h-4 w-2/3 mb-4 bg-gray-700" />
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-4 w-4 mr-1 bg-gray-700" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-16">
      {/* Hero Banner Carousel */}
      {banners.length > 0 ? (
        <Carousel className="mb-16">
          <CarouselContent>
            {banners.map((banner) => (
              <CarouselItem key={banner.id}>
                <div className="relative h-[500px] w-full rounded-lg overflow-hidden">
                  <Image
                    src={banner.imageUrl || "/placeholder.svg"}
                    alt={banner.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center px-8 md:px-16">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 max-w-2xl">
                      {banner.title}
                    </h1>
                    <p className="text-xl text-white/80 mb-8 max-w-xl">{banner.subtitle}</p>
                    <Button asChild className="w-fit bg-gold hover:bg-gold-deep text-black">
                      <Link href={banner.buttonLink || "#"}>
                        {banner.buttonText} <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      ) : (
        <div className="container mb-16">
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-white">No active banners found</p>
          </div>
        </div>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <div className="container mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-display font-bold text-white">Featured Products</h2>
            <Button asChild variant="link" className="text-gold hover:text-gold-deep">
              <Link href="/customer/shop">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/customer/product/${product.id}`}>
                <Card className="overflow-hidden bg-charcoal border-gold/10 hover:border-gold/30 transition-all">
                  <div className="relative h-64 w-full">
                    <Image
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-display font-medium text-white mb-2">{product.name}</h3>
                    <p className="text-gold font-medium">${formatPrice(product.price)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Categories Showcase */}
      <CategoryShowcase />

      {/* Top Selling Products */}
      {topSelling.length > 0 && (
        <div className="container mb-16 bg-gradient-to-r from-gold/10 to-transparent p-8 rounded-lg">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-display font-bold text-white">Top Selling Items</h2>
              <p className="text-white/70">Our most popular authenticated memorabilia</p>
            </div>
            <Button asChild variant="link" className="text-gold hover:text-gold-deep">
              <Link href="/customer/shop">
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topSelling.map((product) => (
              <Link key={product.id} href={`/customer/product/${product.id}`}>
                <Card className="overflow-hidden bg-charcoal border-gold/10 hover:border-gold/30 transition-all">
                  <div className="relative h-64 w-full">
                    <Image
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-gold text-black text-xs font-bold px-2 py-1 rounded">
                      Best Seller
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-display font-medium text-white mb-2">{product.name}</h3>
                    <p className="text-gold font-medium">${formatPrice(product.price)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Why Choose Us */}
      <div className="container mb-16">
        <h2 className="text-3xl font-display font-bold text-white text-center mb-12">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-gold/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-gold" />
            </div>
            <h3 className="text-xl font-display font-medium text-white mb-2">100% Authentic</h3>
            <p className="text-white/70">Every item comes with a certificate of authenticity</p>
          </div>
          <div className="text-center">
            <div className="bg-gold/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-gold" />
            </div>
            <h3 className="text-xl font-display font-medium text-white mb-2">Expert Verification</h3>
            <p className="text-white/70">Our team of experts verifies each item's authenticity</p>
          </div>
          <div className="text-center">
            <div className="bg-gold/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-8 w-8 text-gold" />
            </div>
            <h3 className="text-xl font-display font-medium text-white mb-2">Secure Shopping</h3>
            <p className="text-white/70">Encrypted transactions and secure packaging</p>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div className="container">
          <h2 className="text-3xl font-display font-bold text-white text-center mb-12">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-charcoal border-gold/10">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
                      <Image
                        src={testimonial.avatar || "/placeholder.svg?height=48&width=48&query=person"}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-display font-medium text-white">{testimonial.name}</h3>
                  </div>
                  <p className="text-white/80 mb-4">{testimonial.text}</p>
                  <div className="flex">{renderStars(testimonial.rating)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
