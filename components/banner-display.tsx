"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"

interface Banner {
  id: string
  title: string
  subtitle?: string
  imageUrl: string
  mobileImageUrl?: string
  linkUrl?: string
  position: string
  active: boolean
}

interface BannerDisplayProps {
  position: string
  className?: string
}

export default function BannerDisplay({ position, className = "" }: BannerDisplayProps) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const bannersQuery = query(
          collection(db, "banners"),
          where("position", "==", position),
          where("active", "==", true),
          orderBy("createdAt", "desc"),
        )

        const bannersSnapshot = await getDocs(bannersQuery)
        const bannersList = bannersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Banner[]

        setBanners(bannersList)
      } catch (err) {
        console.error(`Error fetching ${position} banners:`, err)
        setError(`Failed to load banners. Please refresh the page.`)
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [position])

  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        <Skeleton className="w-full h-[300px] md:h-[400px] rounded-lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`w-full ${className} bg-red-50 border border-red-200 p-4 rounded-lg text-center`}>
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  if (banners.length === 0) {
    return null // Don't render anything if no banners found
  }

  // Display the first active banner for this position
  const banner = banners[0]

  // Choose the appropriate image URL based on device
  const imageUrl = isMobile && banner.mobileImageUrl ? banner.mobileImageUrl : banner.imageUrl

  return (
    <div className={`relative w-full overflow-hidden rounded-lg ${className}`}>
      <div className="relative w-full h-[300px] md:h-[400px]">
        <Image
          src={imageUrl || "/placeholder.svg?height=400&width=1200&text=Banner"}
          alt={banner.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1200px"
          priority
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg?height=400&width=1200&text=Banner"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center p-4 md:p-8">
          <h2 className="text-2xl md:text-4xl font-display font-bold text-gold mb-2">{banner.title}</h2>
          {banner.subtitle && (
            <p className="text-lg md:text-xl text-offwhite max-w-md mb-4 md:mb-6">{banner.subtitle}</p>
          )}
          {banner.linkUrl && (
            <Button asChild className="w-fit bg-gold-soft hover:bg-gold-deep text-jetblack">
              <Link href={banner.linkUrl}>Learn More</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
