/**
 * Firebase Collections Schema
 *
 * This file defines the structure of the Firebase collections and documents
 * needed for the Legendary Signatures website.
 */

// Products Collection
interface Product {
  id: string
  title: string
  type: "shirt" | "ball" | "photo" | "boot" | "other"
  signedBy: string
  price: number
  available: boolean
  featured: boolean
  imageUrl: string
  galleryImages?: string[]
  description: string
  shortDescription?: string
  categoryId: string
  tags?: string[]
  certificateNumber?: string
  certificateImageUrl?: string
  authenticity: {
    verified: boolean
    method: string
    date: string
  }
  dimensions?: {
    width: number
    height: number
    unit: string
  }
  team?: string
  league?: string
  season?: string
  createdAt: Date
  updatedAt: Date
  viewCount: number
  soldCount: number
}

// Categories Collection
interface Category {
  id: string
  name: string
  slug: string
  description: string
  imageUrl?: string
  featured: boolean
  order: number
  parentId?: string
  createdAt: Date
  updatedAt: Date
}

// Orders Collection
interface Order {
  id: string
  userId?: string
  customerInfo: {
    name: string
    email: string
    phone: string
    address: {
      line1: string
      line2?: string
      city: string
      state?: string
      postalCode: string
      country: string
    }
  }
  items: Array<{
    productId: string
    productName: string
    quantity: number
    price: number
    imageUrl: string
  }>
  subtotal: number
  shipping: number
  tax: number
  total: number
  promoCodeId?: string
  promoCodeDiscount?: number
  paymentMethod: string
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  trackingNumber?: string
  shippingMethod?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
  history: Array<{
    status: string
    timestamp: Date
    comment?: string
  }>
}

// Users Collection
interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  phoneNumber?: string
  role: "customer" | "admin" | "superadmin"
  address?: {
    line1: string
    line2?: string
    city: string
    state?: string
    postalCode: string
    country: string
  }
  wishlist?: string[] // Array of product IDs
  createdAt: Date
  lastLogin: Date
  orders?: string[] // Array of order IDs
  newsletter: boolean
}

// Banners Collection
interface Banner {
  id: string
  title: string
  description?: string
  imageUrl: string
  mobileImageUrl?: string
  position: "home_hero" | "home_middle" | "shop_top" | "product_page" | "custom"
  link?: string
  active: boolean
  startDate: Date
  endDate: Date
  createdAt: Date
  updatedAt: Date
}

// Testimonials Collection
interface Testimonial {
  id: string
  name: string
  role?: string
  content: string
  rating: number
  imageUrl?: string
  featured: boolean
  approved: boolean
  date: Date
  productId?: string
}

// Pages Collection (for CMS)
interface Page {
  id: string
  title: string
  slug: string
  content: string
  metaTitle?: string
  metaDescription?: string
  published: boolean
  createdAt: Date
  updatedAt: Date
}

// Settings Collection
interface Settings {
  id: string // e.g., "general", "social", "seo"
  data: Record<string, any> // Flexible structure for different setting types
  updatedAt: Date
}

// Analytics Collection
interface Analytics {
  id: string
  date: Date
  pageViews: number
  uniqueVisitors: number
  topProducts: Array<{
    productId: string
    views: number
  }>
  sales: {
    total: number
    count: number
  }
  conversionRate: number
}

// Coupons Collection
interface Coupon {
  id: string
  code: string
  type: "percentage" | "fixed"
  value: number
  minPurchase?: number
  maxUses?: number
  usedCount: number
  startDate: Date
  endDate: Date
  active: boolean
  createdAt: Date
}

// PromoCode Collection
interface PromoCode {
  id: string
  code: string // 6-digit code
  description: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minOrderValue?: number
  maxDiscount?: number
  usageLimit?: number
  usageCount: number
  startDate: Date
  endDate: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

// Reviews Collection
interface Review {
  id: string
  productId: string
  userId?: string
  name: string
  email: string
  rating: number
  title?: string
  content: string
  approved: boolean
  createdAt: Date
}

// Inventory Collection
interface Inventory {
  id: string
  productId: string
  quantity: number
  sku?: string
  location?: string
  updatedAt: Date
}

// This is just a type definition file, not actual code to be executed
export type {
  Product,
  Category,
  Order,
  User,
  Banner,
  Testimonial,
  Page,
  Settings,
  Analytics,
  Coupon,
  Review,
  Inventory,
  PromoCode,
}
