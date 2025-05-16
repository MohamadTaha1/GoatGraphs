"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, Loader2 } from "lucide-react"
import { collection, query, where, getDocs, orderBy, limit, or } from "firebase/firestore"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { formatPrice } from "@/lib/utils"

interface SearchResult {
  id: string
  title: string
  price: number
  imageUrl: string
  type: string
}

export function SearchBar({ onClose }: { onClose: () => void }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches")
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches))
      } catch (e) {
        console.error("Error parsing recent searches:", e)
      }
    }

    // Focus the input when the search bar opens
    if (inputRef.current) {
      inputRef.current.focus()
    }

    // Add event listener for Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [onClose])

  // Save recent searches to localStorage when they change
  useEffect(() => {
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches))
  }, [recentSearches])

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setLoading(true)
    setError(null)

    try {
      const db = getFirestoreInstance()
      if (!db) {
        throw new Error("Firestore instance is null")
      }

      // Create a query to search products by title, description, or signedBy
      const productsQuery = query(
        collection(db, "products"),
        or(
          where("title", ">=", searchTerm),
          where("title", "<=", searchTerm + "\uf8ff"),
          where("signedBy", ">=", searchTerm),
          where("signedBy", "<=", searchTerm + "\uf8ff"),
        ),
        orderBy("title"),
        limit(10),
      )

      const querySnapshot = await getDocs(productsQuery)
      const searchResults = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title || "Untitled Product",
        price: doc.data().price || 0,
        imageUrl: doc.data().imageUrl || "/placeholder.svg?height=100&width=100",
        type: doc.data().type || "unknown",
      }))

      setResults(searchResults)

      // Add to recent searches if not already there
      if (!recentSearches.includes(searchTerm)) {
        setRecentSearches((prev) => [searchTerm, ...prev.slice(0, 4)])
      }
    } catch (err) {
      console.error("Search error:", err)
      setError("An error occurred while searching. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  // Handle clicking on a search result
  const handleResultClick = (id: string) => {
    router.push(`/customer/product/${id}`)
    onClose()
  }

  // Handle clicking on a recent search
  const handleRecentSearchClick = (term: string) => {
    setSearchTerm(term)
    // Trigger search with a small delay to allow the input to update
    setTimeout(() => handleSearch(), 100)
  }

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem("recentSearches")
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-display font-bold text-gold">Search Products</h2>
        <Button variant="ghost" size="icon" className="text-gold/70 hover:text-gold hover:bg-gold/10" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search for products, players, or teams..."
            className="bg-black border-gold/30 text-gold placeholder:text-gold/50 py-6 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            type="submit"
            className="absolute right-0 top-0 h-full bg-gold hover:bg-gold/80 text-black"
            size="icon"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          </Button>
        </div>
      </form>

      {/* Recent searches */}
      {recentSearches.length > 0 && !results.length && !loading && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gold/70">Recent Searches</h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gold/50 hover:text-gold"
              onClick={clearRecentSearches}
            >
              Clear
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="border-gold/30 text-gold/70 hover:text-gold hover:bg-gold/10"
                onClick={() => handleRecentSearchClick(term)}
              >
                {term}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4 mb-6 text-red-200">{error}</div>}

      {/* Search results */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
          <span className="ml-2 text-gold/70">Searching...</span>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gold/70">Search Results ({results.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-charcoal/50 hover:bg-charcoal cursor-pointer"
                onClick={() => handleResultClick(result.id)}
              >
                <div className="relative h-16 w-16 flex-shrink-0 bg-black/50 rounded-md overflow-hidden">
                  <Image
                    src={result.imageUrl || "/placeholder.svg"}
                    alt={result.title}
                    fill
                    sizes="64px"
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-offwhite font-medium truncate">{result.title}</h4>
                  <p className="text-gold-warm text-sm">${formatPrice(result.price)}</p>
                  <p className="text-xs text-offwhite/50 capitalize">{result.type}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center pt-4">
            <Button
              variant="outline"
              className="border-gold/30 text-gold hover:bg-gold/10"
              onClick={() => router.push(`/customer/shop?search=${encodeURIComponent(searchTerm)}`)}
            >
              View All Results
            </Button>
          </div>
        </div>
      ) : (
        searchTerm &&
        !loading && (
          <div className="text-center py-10">
            <p className="text-offwhite/70 mb-4">No products found matching "{searchTerm}"</p>
            <Button
              variant="outline"
              className="border-gold/30 text-gold hover:bg-gold/10"
              onClick={() => router.push("/customer/shop")}
            >
              Browse All Products
            </Button>
          </div>
        )
      )}

      <div className="mt-4 text-sm text-gold/70">Press ESC to close or Enter to search</div>
    </div>
  )
}
