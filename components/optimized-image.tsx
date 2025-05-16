"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  sizes?: string
  className?: string
  priority?: boolean
  quality?: number
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down"
  onLoad?: () => void
  fallbackSrc?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  className = "",
  priority = false,
  quality = 80,
  objectFit = "cover",
  onLoad,
  fallbackSrc = "/placeholder.svg?height=300&width=300",
}: OptimizedImageProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)

  // Reset loading and error states when src changes
  useEffect(() => {
    setLoading(true)
    setError(false)
    setImageSrc(src)
  }, [src])

  // Handle image load
  const handleLoad = () => {
    setLoading(false)
    if (onLoad) onLoad()
  }

  // Handle image error
  const handleError = () => {
    setError(true)
    setLoading(false)
    setImageSrc(fallbackSrc)
  }

  // Determine object-fit style
  const objectFitClass =
    objectFit === "contain"
      ? "object-contain"
      : objectFit === "cover"
        ? "object-cover"
        : objectFit === "fill"
          ? "object-fill"
          : objectFit === "none"
            ? "object-none"
            : objectFit === "scale-down"
              ? "object-scale-down"
              : "object-cover"

  return (
    <div className={`relative ${className}`} style={fill ? { width: "100%", height: "100%" } : {}}>
      {loading && (
        <Skeleton
          className={`absolute inset-0 z-10 ${objectFitClass} bg-gray-800/50`}
          style={!fill && width && height ? { width, height } : {}}
        />
      )}
      <Image
        src={imageSrc || "/placeholder.svg"}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        sizes={sizes || (fill ? "100vw" : undefined)}
        className={`${objectFitClass} ${loading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        priority={priority}
        quality={quality}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
      />
    </div>
  )
}
