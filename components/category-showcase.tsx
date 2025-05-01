"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"

interface Category {
  id: string
  name: string
  slug: string
  description: string
  imageUrl?: string
  featured: boolean
}

export function CategoryShowcase() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)
        const db = getFirestoreInstance()

        if (!db) {
          throw new Error("Firestore instance is null")
        }

        // Get featured categories
        const q = query(collection(db, "categories"), where("featured", "==", true), orderBy("order", "asc"))

        const querySnapshot = await getDocs(q)
        const categoriesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[]

        setCategories(categoriesData)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching categories:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch categories"))
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <span className="ml-2 text-offwhite">Loading categories...</span>
      </div>
    )
  }

  if (error || categories.length === 0) {
    return null // Don't show anything if there's an error or no categories
  }

  return (
    <section className="py-12 bg-charcoal">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-display font-bold mb-8 text-center bg-gold-gradient bg-clip-text text-transparent">
          Browse By Category
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/customer/shop?category=${category.id}`}
              className="block transform transition-transform hover:scale-105"
            >
              <Card className="overflow-hidden border-gold/30 bg-jetblack hover:border-gold/50 transition-all h-full">
                <div className="relative h-48 bg-charcoal">
                  <Image
                    src={category.imageUrl || "/placeholder.svg?height=192&width=384&query=football+memorabilia"}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4 text-center">
                  <h3 className="font-display text-xl font-bold text-gold mb-1">{category.name}</h3>
                  <p className="text-sm text-offwhite/70 line-clamp-2">{category.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
