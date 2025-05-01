"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, Package, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { AuctionCountdown } from "@/components/auction-countdown"
import { BidModal } from "@/components/bid-modal"
import { formatPrice } from "@/lib/utils"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { getFirestoreInstance } from "@/lib/firebase/firestore"

export default function AuctionPage() {
  const [auctions, setAuctions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAuction, setSelectedAuction] = useState<any>(null)
  const [showBidModal, setShowBidModal] = useState(false)

  const now = new Date()

  // Helper function to safely convert to Date
  const getEndDate = (auction: any) => {
    if (!auction || !auction.endTime) return null

    try {
      // Handle Firestore timestamp
      if (auction.endTime.toDate && typeof auction.endTime.toDate === "function") {
        return auction.endTime.toDate()
      }
      // Handle string date
      else if (typeof auction.endTime === "string") {
        return new Date(auction.endTime)
      }
      // Handle if it's already a Date object
      else if (auction.endTime instanceof Date) {
        return auction.endTime
      }
      return null
    } catch (e) {
      console.error("Error converting date:", e)
      return null
    }
  }

  // Fetch auctions directly instead of using the hook
  useEffect(() => {
    async function fetchAuctions() {
      setLoading(true)
      setError(null)

      try {
        const db = getFirestoreInstance()
        if (!db) {
          throw new Error("Firestore instance is null")
        }

        console.log("Fetching auctions from Firestore")

        const auctionsRef = collection(db, "auctions")
        const q = query(auctionsRef, orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(q)

        console.log(`Found ${querySnapshot.docs.length} auctions`)

        if (querySnapshot.empty) {
          console.log("No auctions found in Firestore")
          setAuctions([])
        } else {
          const auctionsData = querySnapshot.docs.map((doc) => {
            const data = doc.data()
            console.log(`Auction ${doc.id}:`, data)
            return {
              id: doc.id,
              ...data,
            }
          })

          setAuctions(auctionsData)
        }
      } catch (err) {
        console.error("Error fetching auctions:", err)
        setError("Failed to load auctions. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchAuctions()
  }, [])

  const activeAuctions = auctions.filter((auction) => {
    const endDate = getEndDate(auction)
    return endDate && endDate > now
  })

  const endedAuctions = auctions.filter((auction) => {
    const endDate = getEndDate(auction)
    return endDate && endDate <= now
  })

  const handleBidClick = (auction: any) => {
    setSelectedAuction(auction)
    setShowBidModal(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
          <p className="mt-4 text-offwhite/70">Loading auctions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="mt-4 text-red-500">Failed to load auctions. Please try again later.</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-gold-soft hover:bg-gold-deep text-jetblack"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-offwhite">Auctions</h1>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="active">Active Auctions</TabsTrigger>
          <TabsTrigger value="ended">Ended Auctions</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeAuctions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeAuctions.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  onBidClick={handleBidClick}
                  isActive={true}
                  getEndDate={getEndDate}
                />
              ))}
            </div>
          ) : (
            <Card className="border-gold/30 bg-charcoal">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 text-offwhite/30 mb-4" />
                <h2 className="text-xl font-semibold text-offwhite mb-2">No Active Auctions</h2>
                <p className="text-offwhite/70 mb-6 text-center max-w-md">
                  There are no active auctions at the moment. Please check back later or browse our shop for available
                  items.
                </p>
                <Link
                  href="/customer/shop"
                  className="bg-gold-soft hover:bg-gold-deep text-jetblack px-6 py-2 rounded-md font-semibold transition-colors"
                >
                  Shop Now
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ended">
          {endedAuctions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {endedAuctions.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  onBidClick={() => {}}
                  isActive={false}
                  getEndDate={getEndDate}
                />
              ))}
            </div>
          ) : (
            <Card className="border-gold/30 bg-charcoal">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 text-offwhite/30 mb-4" />
                <h2 className="text-xl font-semibold text-offwhite mb-2">No Ended Auctions</h2>
                <p className="text-offwhite/70 mb-6 text-center max-w-md">
                  There are no ended auctions to display. Check the active auctions tab to see current opportunities.
                </p>
                <Button
                  onClick={() => document.querySelector('[data-value="active"]')?.click()}
                  className="bg-gold-soft hover:bg-gold-deep text-jetblack"
                >
                  View Active Auctions
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {showBidModal && selectedAuction && <BidModal auction={selectedAuction} onClose={() => setShowBidModal(false)} />}
    </div>
  )
}

function AuctionCard({
  auction,
  onBidClick,
  isActive,
  getEndDate,
}: {
  auction: any
  onBidClick: (auction: any) => void
  isActive: boolean
  getEndDate: (auction: any) => Date | null
}) {
  const endDate = getEndDate(auction)

  return (
    <Card className="border-gold/30 bg-charcoal overflow-hidden hover:shadow-lg hover:shadow-gold/10 transition-all">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={auction.imageUrl || "/placeholder.svg?height=192&width=384&query=sports memorabilia"}
          alt={auction.title || "Auction item"}
          fill
          className="object-cover"
        />
        {isActive && endDate && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-jetblack to-transparent p-4">
            <AuctionCountdown endTime={endDate} />
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-offwhite mb-2">
          {auction.title || auction.playerName || "Untitled Auction"}
        </h3>
        <p className="text-offwhite/70 mb-4 line-clamp-2">{auction.description || "No description available"}</p>

        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-offwhite/70">Current Bid</p>
            <p className="text-xl font-semibold text-gold">${formatPrice(auction.currentBid || 0)}</p>
          </div>
          <div>
            <p className="text-sm text-offwhite/70">Bids</p>
            <p className="text-xl font-semibold text-offwhite text-right">
              {auction.bidHistory?.length || auction.bids?.length || 0}
            </p>
          </div>
        </div>

        {isActive ? (
          <Button onClick={() => onBidClick(auction)} className="w-full bg-gold-soft hover:bg-gold-deep text-jetblack">
            Place Bid
          </Button>
        ) : (
          <div className="bg-charcoal border border-gold/30 rounded-md p-3 text-center">
            <p className="text-sm text-offwhite/70">Auction Ended</p>
            <p className="text-offwhite font-medium">
              {auction.bidHistory?.length > 0 || auction.bids?.length > 0
                ? "Sold for $" + formatPrice(auction.currentBid || 0)
                : "No bids received"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
