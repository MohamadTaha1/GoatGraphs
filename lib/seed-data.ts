"use client"

import { collection, getDocs, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore"
import { getFirestoreInstance } from "./firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { getAuthInstance } from "./firebase/auth"

// Sample user data
const sampleUsers = [
  {
    email: "admin@legendary-signatures.com",
    password: "admin123",
    displayName: "Admin User",
    role: "admin",
    phoneNumber: "+1234567890",
    newsletter: true,
  },
  {
    email: "john.doe@example.com",
    password: "password123",
    displayName: "John Doe",
    role: "customer",
    phoneNumber: "+1987654321",
    address: {
      line1: "123 Main St",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA",
    },
    newsletter: true,
  },
  {
    email: "jane.smith@example.com",
    password: "password123",
    displayName: "Jane Smith",
    role: "customer",
    phoneNumber: "+1122334455",
    address: {
      line1: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      postalCode: "90001",
      country: "USA",
    },
    newsletter: true,
  },
  {
    email: "david.wilson@example.com",
    password: "password123",
    displayName: "David Wilson",
    role: "customer",
    phoneNumber: "+1555666777",
    address: {
      line1: "789 Pine St",
      city: "Chicago",
      state: "IL",
      postalCode: "60007",
      country: "USA",
    },
    newsletter: false,
  },
  {
    email: "sarah.johnson@example.com",
    password: "password123",
    displayName: "Sarah Johnson",
    role: "customer",
    phoneNumber: "+1888999000",
    address: {
      line1: "321 Elm St",
      city: "Miami",
      state: "FL",
      postalCode: "33101",
      country: "USA",
    },
    newsletter: true,
  },
]

// Sample products data
const sampleProducts = [
  {
    title: "Lionel Messi Signed Argentina Jersey",
    type: "shirt",
    signedBy: "Lionel Messi",
    price: 1299.99,
    available: true,
    featured: true,
    imageUrl: "/images/messi-signed-jersey.png",
    galleryImages: ["/images/messi-signed-jersey.png", "/images/messi-world-cup-jersey.png"],
    description:
      "Authentic Argentina jersey signed by the legendary Lionel Messi. This jersey commemorates Argentina's 2022 World Cup victory.",
    shortDescription: "Authentic signed Messi Argentina jersey",
    categoryId: "football-jerseys",
    tags: ["messi", "argentina", "world cup", "football"],
    certificateNumber: "LS-MESSI-2022-001",
    certificateImageUrl: "/images/certificate-of-authenticity.png",
    authenticity: {
      verified: true,
      method: "In-person signing",
      date: "2022-12-20",
    },
    team: "Argentina",
    league: "International",
    season: "2022",
    viewCount: 1245,
    soldCount: 0,
  },
  {
    title: "Cristiano Ronaldo Signed Portugal Jersey",
    type: "shirt",
    signedBy: "Cristiano Ronaldo",
    price: 1199.99,
    available: true,
    featured: true,
    imageUrl: "/images/ronaldo-signed-jersey.png",
    description:
      "Authentic Portugal jersey signed by football superstar Cristiano Ronaldo. This jersey features Ronaldo's iconic number 7.",
    shortDescription: "Authentic signed Ronaldo Portugal jersey",
    categoryId: "football-jerseys",
    tags: ["ronaldo", "portugal", "football"],
    certificateNumber: "LS-RONALDO-2022-001",
    certificateImageUrl: "/images/certificate-of-authenticity.png",
    authenticity: {
      verified: true,
      method: "In-person signing",
      date: "2022-06-15",
    },
    team: "Portugal",
    league: "International",
    season: "2022",
    viewCount: 987,
    soldCount: 0,
  },
  {
    title: "Kylian Mbappé Signed France Jersey",
    type: "shirt",
    signedBy: "Kylian Mbappé",
    price: 999.99,
    available: true,
    featured: true,
    imageUrl: "/images/mbappe-signed-jersey.png",
    description:
      "Authentic France jersey signed by rising star Kylian Mbappé. This jersey commemorates France's recent international success.",
    shortDescription: "Authentic signed Mbappé France jersey",
    categoryId: "football-jerseys",
    tags: ["mbappe", "france", "football"],
    certificateNumber: "LS-MBAPPE-2022-001",
    certificateImageUrl: "/images/certificate-of-authenticity.png",
    authenticity: {
      verified: true,
      method: "In-person signing",
      date: "2022-07-10",
    },
    team: "France",
    league: "International",
    season: "2022",
    viewCount: 856,
    soldCount: 0,
  },
  {
    title: "Neymar Jr Signed Brazil Jersey",
    type: "shirt",
    signedBy: "Neymar Jr",
    price: 899.99,
    available: true,
    featured: false,
    imageUrl: "/images/neymar-signed-jersey.png",
    description:
      "Authentic Brazil jersey signed by football superstar Neymar Jr. This vibrant yellow jersey features Neymar's signature number 10.",
    shortDescription: "Authentic signed Neymar Brazil jersey",
    categoryId: "football-jerseys",
    tags: ["neymar", "brazil", "football"],
    certificateNumber: "LS-NEYMAR-2022-001",
    certificateImageUrl: "/images/certificate-of-authenticity.png",
    authenticity: {
      verified: true,
      method: "In-person signing",
      date: "2022-05-20",
    },
    team: "Brazil",
    league: "International",
    season: "2022",
    viewCount: 723,
    soldCount: 0,
  },
]

// Sample categories data
const sampleCategories = [
  {
    name: "Football Jerseys",
    slug: "football-jerseys",
    description: "Authentic signed football jerseys from the world's greatest players",
    imageUrl: "/images/football-collection-display.png",
    featured: true,
    order: 1,
  },
  {
    name: "Football Boots",
    slug: "football-boots",
    description: "Signed football boots worn by legendary players",
    imageUrl: "/images/football-boots-display.png",
    featured: false,
    order: 2,
  },
  {
    name: "Photographs",
    slug: "photographs",
    description: "Signed photographs capturing iconic football moments",
    imageUrl: "/images/football-photos-display.png",
    featured: false,
    order: 3,
  },
  {
    name: "Memorabilia",
    slug: "memorabilia",
    description: "Unique football memorabilia and collectibles",
    imageUrl: "/images/football-memorabilia-display.png",
    featured: true,
    order: 4,
  },
]

// Sample auctions data
const sampleAuctions = [
  {
    playerName: "Lionel Messi",
    team: "Argentina",
    image: "/images/messi-signed-jersey.png",
    currentBid: 870,
    startingBid: 500,
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    status: "new",
    bidHistory: [
      {
        userId: "user1",
        userName: "Football Fan",
        amount: 870,
        timestamp: new Date(),
      },
      {
        userId: "user2",
        userName: "Messi Collector",
        amount: 750,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ],
  },
  {
    playerName: "Cristiano Ronaldo",
    team: "Portugal",
    image: "/images/ronaldo-signed-jersey.png",
    currentBid: 950,
    startingBid: 600,
    endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
    status: "ending_soon",
    bidHistory: [
      {
        userId: "user3",
        userName: "CR7 Fan",
        amount: 950,
        timestamp: new Date(),
      },
      {
        userId: "user4",
        userName: "Jersey Collector",
        amount: 800,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ],
  },
  {
    playerName: "Kylian Mbappé",
    team: "France",
    image: "/images/mbappe-signed-jersey.png",
    currentBid: 750,
    startingBid: 400,
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    bidHistory: [
      {
        userId: "user5",
        userName: "French Supporter",
        amount: 750,
        timestamp: new Date(),
      },
      {
        userId: "user6",
        userName: "PSG Fan",
        amount: 600,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
    ],
  },
]

// Sample banners data
const sampleBanners = [
  {
    title: "Limited Edition Messi Jersey",
    description: "Exclusive signed jersey from Argentina's World Cup victory",
    imageUrl: "/images/limited-edition-messi-jersey.png",
    mobileImageUrl: "/images/limited-edition-messi-jersey-mobile.png",
    position: "home_hero",
    link: "/product/messi-world-cup-jersey",
    active: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  },
  {
    title: "Football Legends Collection",
    description: "Authentic memorabilia from the greatest players",
    imageUrl: "/images/football-hero-banner.png",
    position: "home_middle",
    link: "/shop",
    active: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
  },
]

// Sample testimonials data
const sampleTestimonials = [
  {
    name: "Ahmed Al-Farsi",
    role: "Collector",
    content:
      "The authentication process was thorough and the certificate provided gives me complete confidence in my purchase. The Messi jersey is now the centerpiece of my collection!",
    rating: 5,
    featured: true,
    approved: true,
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
  },
  {
    name: "Sarah Thompson",
    role: "Football Fan",
    content:
      "Exceptional quality and service. The signed Ronaldo jersey arrived in perfect condition and looks even better in person than in the photos.",
    rating: 5,
    featured: true,
    approved: true,
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  },
  {
    name: "Michael Chen",
    role: "Sports Memorabilia Investor",
    content:
      "I've purchased from many memorabilia sites, but Legendary Signatures offers the best authentication and quality. My recent purchase was delivered promptly and securely packaged.",
    rating: 4,
    featured: false,
    approved: true,
    date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
  },
]

// Sample orders data
const sampleOrders = [
  {
    userId: "user1",
    customerInfo: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1987654321",
      address: {
        line1: "123 Main St",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "USA",
      },
    },
    items: [
      {
        productId: "product1",
        productName: "Lionel Messi Signed Argentina Jersey",
        quantity: 1,
        price: 1299.99,
        imageUrl: "/images/messi-signed-jersey.png",
      },
    ],
    subtotal: 1299.99,
    shipping: 0,
    tax: 0,
    total: 1299.99,
    paymentMethod: "Credit Card",
    paymentStatus: "paid",
    orderStatus: "delivered",
    trackingNumber: "LS12345678",
    shippingMethod: "Express",
    notes: "Handle with care",
    history: [
      {
        status: "delivered",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        comment: "Package delivered",
      },
      {
        status: "shipped",
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        comment: "Package shipped via DHL Express",
      },
      {
        status: "processing",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        comment: "Order confirmed and processing",
      },
    ],
  },
  {
    userId: "user2",
    customerInfo: {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+1122334455",
      address: {
        line1: "456 Oak Ave",
        city: "Los Angeles",
        state: "CA",
        postalCode: "90001",
        country: "USA",
      },
    },
    items: [
      {
        productId: "product2",
        productName: "Cristiano Ronaldo Signed Portugal Jersey",
        quantity: 1,
        price: 1199.99,
        imageUrl: "/images/ronaldo-signed-jersey.png",
      },
    ],
    subtotal: 1199.99,
    shipping: 15.99,
    tax: 96.0,
    total: 1311.98,
    paymentMethod: "PayPal",
    paymentStatus: "paid",
    orderStatus: "shipped",
    trackingNumber: "LS87654321",
    shippingMethod: "Standard",
    history: [
      {
        status: "shipped",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        comment: "Package shipped via FedEx",
      },
      {
        status: "processing",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        comment: "Order confirmed and processing",
      },
    ],
  },
]

// Function to seed users
export async function seedUsers() {
  try {
    const db = getFirestoreInstance()
    const auth = getAuthInstance()

    console.log("Starting user seeding process...")

    // Check if users already exist
    const usersCollection = collection(db, "users")
    const existingUsersSnapshot = await getDocs(usersCollection)

    if (existingUsersSnapshot.size > 0) {
      console.log(`Found ${existingUsersSnapshot.size} existing users. Clearing collection before reseeding.`)

      // Delete existing users if needed
      // This is commented out for safety - uncomment if you want to clear users before reseeding
      /*
      for (const doc of existingUsersSnapshot.docs) {
        await deleteDoc(doc.ref);
      }
      */
    }

    // Seed users
    const results = []

    for (const userData of sampleUsers) {
      try {
        // Check if user already exists in Auth
        let authUser = null
        try {
          // Try to create the user in Firebase Auth
          const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password)
          authUser = userCredential.user
          console.log(`Created auth user for ${userData.email} with UID: ${authUser.uid}`)
        } catch (authError) {
          // If user already exists, we'll get an error
          console.log(`User ${userData.email} may already exist in Auth. Continuing with Firestore document.`)

          // For demo purposes, we'll just use a generated UID
          // In production, you'd want to handle this differently
          authUser = { uid: `demo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` }
        }

        // Create or update Firestore user document
        const { password, ...userDataWithoutPassword } = userData
        const userDoc = {
          ...userDataWithoutPassword,
          uid: authUser.uid,
          id: authUser.uid, // Adding id field for consistency
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          wishlist: [],
          orders: [],
        }

        // Use set with merge to update if exists or create if doesn't
        await setDoc(doc(db, "users", authUser.uid), userDoc, { merge: true })
        console.log(`Added/updated user document for ${userData.email} with ID: ${authUser.uid}`)

        results.push({
          email: userData.email,
          status: "success",
          id: authUser.uid,
          uid: authUser.uid,
        })
      } catch (error) {
        console.error(`Error seeding user ${userData.email}:`, error)
        results.push({
          email: userData.email,
          status: "error",
          message: error.message,
        })
      }
    }

    return {
      success: true,
      message: `Processed ${results.length} users with ${results.filter((r) => r.status === "success").length} successes`,
      results,
    }
  } catch (error) {
    console.error("Error seeding users:", error)
    return {
      success: false,
      message: `Error seeding users: ${error.message}`,
      error,
    }
  }
}

// Function to seed products
export async function seedProducts() {
  try {
    const db = getFirestoreInstance()
    console.log("Starting product seeding process...")

    // Check if products already exist
    const productsCollection = collection(db, "products")
    const existingProductsSnapshot = await getDocs(productsCollection)

    if (existingProductsSnapshot.size > 0) {
      console.log(`Found ${existingProductsSnapshot.size} existing products. Skipping seeding.`)
      return {
        success: true,
        message: `Found ${existingProductsSnapshot.size} existing products. Skipping seeding.`,
        existingCount: existingProductsSnapshot.size,
      }
    }

    // Seed products
    const results = []

    for (const productData of sampleProducts) {
      try {
        const productDoc = {
          ...productData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }

        const docRef = await addDoc(productsCollection, productDoc)
        console.log(`Added product document with ID: ${docRef.id}`)

        // Update the document with its ID
        await setDoc(doc(db, "products", docRef.id), { id: docRef.id }, { merge: true })

        results.push({
          title: productData.title,
          status: "success",
          id: docRef.id,
        })
      } catch (error) {
        console.error(`Error seeding product ${productData.title}:`, error)
        results.push({
          title: productData.title,
          status: "error",
          message: error.message,
        })
      }
    }

    return {
      success: true,
      message: `Seeded ${results.filter((r) => r.status === "success").length} products`,
      results,
    }
  } catch (error) {
    console.error("Error seeding products:", error)
    return {
      success: false,
      message: `Error seeding products: ${error.message}`,
      error,
    }
  }
}

// Function to seed categories
export async function seedCategories() {
  try {
    const db = getFirestoreInstance()
    console.log("Starting category seeding process...")

    // Check if categories already exist
    const categoriesCollection = collection(db, "categories")
    const existingCategoriesSnapshot = await getDocs(categoriesCollection)

    if (existingCategoriesSnapshot.size > 0) {
      console.log(`Found ${existingCategoriesSnapshot.size} existing categories. Skipping seeding.`)
      return {
        success: true,
        message: `Found ${existingCategoriesSnapshot.size} existing categories. Skipping seeding.`,
        existingCount: existingCategoriesSnapshot.size,
      }
    }

    // Seed categories
    const results = []

    for (const categoryData of sampleCategories) {
      try {
        const categoryDoc = {
          ...categoryData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }

        const docRef = await addDoc(categoriesCollection, categoryDoc)
        console.log(`Added category document with ID: ${docRef.id}`)

        // Update the document with its ID
        await setDoc(doc(db, "categories", docRef.id), { id: docRef.id }, { merge: true })

        results.push({
          name: categoryData.name,
          status: "success",
          id: docRef.id,
        })
      } catch (error) {
        console.error(`Error seeding category ${categoryData.name}:`, error)
        results.push({
          name: categoryData.name,
          status: "error",
          message: error.message,
        })
      }
    }

    return {
      success: true,
      message: `Seeded ${results.filter((r) => r.status === "success").length} categories`,
      results,
    }
  } catch (error) {
    console.error("Error seeding categories:", error)
    return {
      success: false,
      message: `Error seeding categories: ${error.message}`,
      error,
    }
  }
}

// Function to seed auctions
export async function seedAuctions() {
  try {
    const db = getFirestoreInstance()
    console.log("Starting auction seeding process...")

    // Check if auctions already exist
    const auctionsCollection = collection(db, "auctions")
    const existingAuctionsSnapshot = await getDocs(auctionsCollection)

    if (existingAuctionsSnapshot.size > 0) {
      console.log(`Found ${existingAuctionsSnapshot.size} existing auctions. Skipping seeding.`)
      return {
        success: true,
        message: `Found ${existingAuctionsSnapshot.size} existing auctions. Skipping seeding.`,
        existingCount: existingAuctionsSnapshot.size,
      }
    }

    // Seed auctions
    const results = []

    for (const auctionData of sampleAuctions) {
      try {
        const auctionDoc = {
          ...auctionData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }

        const docRef = await addDoc(auctionsCollection, auctionDoc)
        console.log(`Added auction document with ID: ${docRef.id}`)

        // Update the document with its ID
        await setDoc(doc(db, "auctions", docRef.id), { id: docRef.id }, { merge: true })

        results.push({
          playerName: auctionData.playerName,
          status: "success",
          id: docRef.id,
        })
      } catch (error) {
        console.error(`Error seeding auction ${auctionData.playerName}:`, error)
        results.push({
          playerName: auctionData.playerName,
          status: "error",
          message: error.message,
        })
      }
    }

    return {
      success: true,
      message: `Seeded ${results.filter((r) => r.status === "success").length} auctions`,
      results,
    }
  } catch (error) {
    console.error("Error seeding auctions:", error)
    return {
      success: false,
      message: `Error seeding auctions: ${error.message}`,
      error,
    }
  }
}

// Function to seed banners
export async function seedBanners() {
  try {
    const db = getFirestoreInstance()
    console.log("Starting banner seeding process...")

    // Check if banners already exist
    const bannersCollection = collection(db, "banners")
    const existingBannersSnapshot = await getDocs(bannersCollection)

    if (existingBannersSnapshot.size > 0) {
      console.log(`Found ${existingBannersSnapshot.size} existing banners. Skipping seeding.`)
      return {
        success: true,
        message: `Found ${existingBannersSnapshot.size} existing banners. Skipping seeding.`,
        existingCount: existingBannersSnapshot.size,
      }
    }

    // Seed banners
    const results = []

    for (const bannerData of sampleBanners) {
      try {
        const bannerDoc = {
          ...bannerData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }

        const docRef = await addDoc(bannersCollection, bannerDoc)
        console.log(`Added banner document with ID: ${docRef.id}`)

        // Update the document with its ID
        await setDoc(doc(db, "banners", docRef.id), { id: docRef.id }, { merge: true })

        results.push({
          title: bannerData.title,
          status: "success",
          id: docRef.id,
        })
      } catch (error) {
        console.error(`Error seeding banner ${bannerData.title}:`, error)
        results.push({
          title: bannerData.title,
          status: "error",
          message: error.message,
        })
      }
    }

    return {
      success: true,
      message: `Seeded ${results.filter((r) => r.status === "success").length} banners`,
      results,
    }
  } catch (error) {
    console.error("Error seeding banners:", error)
    return {
      success: false,
      message: `Error seeding banners: ${error.message}`,
      error,
    }
  }
}

// Function to seed testimonials
export async function seedTestimonials() {
  try {
    const db = getFirestoreInstance()
    console.log("Starting testimonial seeding process...")

    // Check if testimonials already exist
    const testimonialsCollection = collection(db, "testimonials")
    const existingTestimonialsSnapshot = await getDocs(testimonialsCollection)

    if (existingTestimonialsSnapshot.size > 0) {
      console.log(`Found ${existingTestimonialsSnapshot.size} existing testimonials. Skipping seeding.`)
      return {
        success: true,
        message: `Found ${existingTestimonialsSnapshot.size} existing testimonials. Skipping seeding.`,
        existingCount: existingTestimonialsSnapshot.size,
      }
    }

    // Seed testimonials
    const results = []

    for (const testimonialData of sampleTestimonials) {
      try {
        const testimonialDoc = {
          ...testimonialData,
        }

        const docRef = await addDoc(testimonialsCollection, testimonialDoc)
        console.log(`Added testimonial document with ID: ${docRef.id}`)

        // Update the document with its ID
        await setDoc(doc(db, "testimonials", docRef.id), { id: docRef.id }, { merge: true })

        results.push({
          name: testimonialData.name,
          status: "success",
          id: docRef.id,
        })
      } catch (error) {
        console.error(`Error seeding testimonial ${testimonialData.name}:`, error)
        results.push({
          name: testimonialData.name,
          status: "error",
          message: error.message,
        })
      }
    }

    return {
      success: true,
      message: `Seeded ${results.filter((r) => r.status === "success").length} testimonials`,
      results,
    }
  } catch (error) {
    console.error("Error seeding testimonials:", error)
    return {
      success: false,
      message: `Error seeding testimonials: ${error.message}`,
      error,
    }
  }
}

// Function to seed orders
export async function seedOrders() {
  try {
    const db = getFirestoreInstance()
    console.log("Starting order seeding process...")

    // Get user IDs to link orders to real users
    const usersCollection = collection(db, "users")
    const usersSnapshot = await getDocs(usersCollection)
    const userIds = usersSnapshot.docs.map((doc) => doc.id)

    if (userIds.length === 0) {
      console.log("No users found. Using demo user IDs.")
      // Use demo user IDs if no real users exist
      userIds.push("demo-user-1", "demo-user-2")
    }

    // Check if orders already exist
    const ordersCollection = collection(db, "orders")
    const existingOrdersSnapshot = await getDocs(ordersCollection)

    if (existingOrdersSnapshot.size > 0) {
      console.log(`Found ${existingOrdersSnapshot.size} existing orders. Skipping seeding.`)
      return {
        success: true,
        message: `Found ${existingOrdersSnapshot.size} existing orders. Skipping seeding.`,
        existingCount: existingOrdersSnapshot.size,
      }
    }

    // Seed orders
    const results = []

    for (let i = 0; i < sampleOrders.length; i++) {
      try {
        // Assign a real user ID to the order
        const userId = userIds[i % userIds.length]
        const orderData = {
          ...sampleOrders[i],
          userId: userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }

        const docRef = await addDoc(ordersCollection, orderData)
        console.log(`Added order document with ID: ${docRef.id}`)

        // Update the document with its ID
        await setDoc(doc(db, "orders", docRef.id), { id: docRef.id }, { merge: true })

        // Update the user's orders array
        const userRef = doc(db, "users", userId)
        await setDoc(
          userRef,
          {
            orders: [...(sampleOrders[i].orders || []), docRef.id],
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        )

        results.push({
          orderId: docRef.id,
          userId: userId,
          status: "success",
        })
      } catch (error) {
        console.error(`Error seeding order:`, error)
        results.push({
          status: "error",
          message: error.message,
        })
      }
    }

    return {
      success: true,
      message: `Seeded ${results.filter((r) => r.status === "success").length} orders`,
      results,
    }
  } catch (error) {
    console.error("Error seeding orders:", error)
    return {
      success: false,
      message: `Error seeding orders: ${error.message}`,
      error,
    }
  }
}

// Function to seed all data
export async function seedAllData() {
  const results = {
    users: await seedUsers(),
    categories: await seedCategories(),
    products: await seedProducts(),
    auctions: await seedAuctions(),
    banners: await seedBanners(),
    testimonials: await seedTestimonials(),
    orders: await seedOrders(),
  }

  return {
    success: true,
    message: "Completed seeding all data",
    results,
  }
}
