"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Star, StarHalf, Loader2 } from "lucide-react"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { getFirestoreInstance } from "@/lib/firebase/firestore"

export function Testimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        setLoading(true)
        const db = getFirestoreInstance()

        if (!db) {
          console.error("Firestore instance is null")
          setLoading(false)
          return
        }

        // Query for approved testimonials
        const q = query(
          collection(db, "testimonials"),
          where("approved", "==", true),
          orderBy("createdAt", "desc"),
          limit(3),
        )

        const querySnapshot = await getDocs(q)
        const fetchedTestimonials = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setTestimonials(fetchedTestimonials)
      } catch (error) {
        console.error("Error fetching testimonials:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  // Fallback testimonials if none are found
  const fallbackTestimonials = [
    {
      id: "t1",
      name: "James Wilson",
      location: "Manchester, UK",
      rating: 5,
      text: "The Cristiano Ronaldo signed jersey I purchased is absolutely stunning. The authentication process was transparent, and the certificate gives me complete confidence in its authenticity.",
      avatar: "/diverse-group.png",
    },
    {
      id: "t2",
      name: "Sarah Johnson",
      location: "New York, USA",
      rating: 5,
      text: "I've been collecting for years, and Legendary Signatures provides the best authenticated memorabilia I've ever purchased. The Messi World Cup jersey is the centerpiece of my collection.",
      avatar: "/diverse-group.png",
    },
    {
      id: "t3",
      name: "Miguel Rodriguez",
      location: "Barcelona, Spain",
      rating: 4.5,
      text: "Exceptional quality and service. The authentication certificate and packaging were top-notch. Will definitely be purchasing more items in the future.",
      avatar: "/diverse-group.png",
    },
  ]

  const displayTestimonials = testimonials.length > 0 ? testimonials : fallbackTestimonials

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-gold text-gold" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-4 w-4 fill-gold text-gold" />)
    }

    return stars
  }

  return (
    <section className="py-16 bg-jetblack">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold mb-2 bg-gold-gradient bg-clip-text text-transparent">
            What Our Customers Say
          </h2>
          <p className="text-offwhite/70 max-w-2xl mx-auto">
            Hear from collectors who have added our authenticated memorabilia to their collections.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
            <span className="ml-2 text-offwhite">Loading testimonials...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className="border-gold/20 bg-charcoal">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
                      <Image
                        src={testimonial.avatar || "/placeholder.svg?height=48&width=48&query=person"}
                        alt={testimonial.name || "Customer"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-gold">{testimonial.name || "Customer"}</h3>
                      <p className="text-sm text-offwhite/70">{testimonial.location || "Verified Buyer"}</p>
                    </div>
                  </div>
                  <div className="flex mb-3">{renderStars(testimonial.rating || 5)}</div>
                  <p className="text-offwhite/80 italic">"{testimonial.text || "Great product and service!"}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
