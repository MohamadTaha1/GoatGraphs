"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore"

// Fallback testimonials in case Firebase fails
const fallbackTestimonials = [
  {
    id: "1",
    name: "John Smith",
    role: "Collector",
    content:
      "The authentication process is top-notch. I've purchased multiple jerseys and each one came with detailed documentation.",
    rating: 5,
    avatar: "/placeholder.svg?height=100&width=100&text=JS",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    role: "Football Fan",
    content:
      "I bought a signed Messi jersey as a gift for my husband. The quality and presentation exceeded my expectations.",
    rating: 5,
    avatar: "/placeholder.svg?height=100&width=100&text=SJ",
  },
  {
    id: "3",
    name: "Michael Brown",
    role: "Sports Memorabilia Enthusiast",
    content:
      "The customer service is excellent. They helped me track down a rare signed jersey that I'd been looking for years.",
    rating: 5,
    avatar: "/placeholder.svg?height=100&width=100&text=MB",
  },
]

export function Testimonials() {
  const [testimonials, setTestimonials] = useState(fallbackTestimonials)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        // Skip if we're not in the browser
        if (typeof window === "undefined") return

        let db
        try {
          db = getFirestoreInstance()
        } catch (err) {
          console.error("Failed to get Firestore instance:", err)
          setLoading(false)
          return
        }

        if (!db) {
          setLoading(false)
          return
        }

        try {
          const q = query(collection(db, "testimonials"), orderBy("createdAt", "desc"), limit(3))

          const querySnapshot = await getDocs(q)
          const testimonialsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))

          if (testimonialsData && testimonialsData.length > 0) {
            setTestimonials(testimonialsData)
          }
        } catch (error) {
          console.error("Error fetching testimonials:", error)
          // Keep using fallback testimonials
        }
      } catch (err) {
        console.error("Error in testimonials component:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  // Generate stars based on rating
  const renderStars = (rating) => {
    const stars = []
    const ratingValue = rating || 5 // Default to 5 if rating is undefined

    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < ratingValue ? "text-gold" : "text-gray-400"}>
          ★
        </span>,
      )
    }
    return stars
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border border-gold/20 bg-charcoal">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Skeleton className="h-12 w-12 rounded-full bg-charcoal/50" />
                <div className="ml-4">
                  <Skeleton className="h-4 w-24 mb-2 bg-charcoal/50" />
                  <Skeleton className="h-3 w-16 bg-charcoal/50" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2 bg-charcoal/50" />
              <Skeleton className="h-4 w-full mb-2 bg-charcoal/50" />
              <Skeleton className="h-4 w-3/4 mb-4 bg-charcoal/50" />
              <Skeleton className="h-4 w-20 bg-charcoal/50" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {testimonials &&
        testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="border border-gold/20 bg-charcoal">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="relative h-12 w-12 rounded-full overflow-hidden">
                  <Image
                    src={
                      testimonial.avatar ||
                      `/placeholder.svg?height=100&width=100&text=${testimonial.name ? testimonial.name.charAt(0) : "U"}`
                    }
                    alt={testimonial.name || "Customer"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="ml-4">
                  <h4 className="font-display font-bold text-gold">{testimonial.name || "Happy Customer"}</h4>
                  <p className="text-sm text-offwhite/70 font-body">{testimonial.role || "Customer"}</p>
                </div>
              </div>
              <p className="text-offwhite/80 mb-4 font-body">
                {testimonial.content || "Great products and excellent service!"}
              </p>
              <div className="flex text-lg">{renderStars(testimonial.rating)}</div>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
