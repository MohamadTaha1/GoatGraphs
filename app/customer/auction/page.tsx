"use client"

import { useState } from "react"
import { useAuctions, type Auction } from "@/hooks/use-auctions"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, Package, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { AuctionCountdown } from "@/components/auction-countdown"
import { BidModal } from "@/components/bid-modal"
import { formatPrice } from "@/lib/utils"

export default function AuctionPage() {
  const { auctions, loading, error } = useAuctions()
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null)
  const [showBidModal, setShowBidModal] = useState(false)

  const now = new Date()

  // Filter auctions based on end time
  const activeAuctions = auctions.filter((auction) => {
    const endTime = auction.endTime?.toDate ? auction.endTime.toDate() : new Date(auction.endTime)
    return endTime > now
  })

  const endedAuctions = auctions.filter((auction) => {
    const endTime = auction.endTime?.toDate ? auction.endTime.toDate() : new Date(auction.endTime)
    return endTime <= now
  })

  const handleBidClick = (auction: Auction) => {
    setSelectedAuction(auction)
    setShowBidModal(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
          <p className="mt-4 text-gold/70">Loading auctions...</p>
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
          <Button onClick={() => window.location.reload()} className="mt-4 bg-gold hover:bg-gold/80 text-black">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gold">Auctions</h1>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-8 bg-black border border-gold/30">
          <TabsTrigger value="active" className="data-[state=active]:bg-gold data-[state=active]:text-black">
            Active Auctions
          </TabsTrigger>
          <TabsTrigger value="ended" className="data-[state=active]:bg-gold data-[state=active]:text-black">
            Ended Auctions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeAuctions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeAuctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} onBidClick={handleBidClick} isActive={true} />
              ))}
            </div>
          ) : (
            <Card className="border-gold/30 bg-black">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 text-gold/30 mb-4" />
                <h2 className="text-xl font-semibold text-gold mb-2">No Active Auctions</h2>
                <p className="text-gold/70 mb-6 text-center max-w-md">
                  There are no active auctions at the moment. Please check back later or browse our shop for available
                  items.
                </p>
                <Link
                  href="/customer/shop"
                  className="bg-gold hover:bg-gold/80 text-black px-6 py-2 rounded-md font-semibold transition-colors"
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
                <AuctionCard key={auction.id} auction={auction} onBidClick={() => {}} isActive={false} />
              ))}
            </div>
          ) : (
            <Card className="border-gold/30 bg-black">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 text-gold/30 mb-4" />
                <h2 className="text-xl font-semibold text-gold mb-2">No Ended Auctions</h2>
                <p className="text-gold/70 mb-6 text-center max-w-md">
                  There are no ended auctions to display. Check the active auctions tab to see current opportunities.
                </p>
                <Button
                  onClick={() => document.querySelector('[data-value="active"]')?.click()}
                  className="bg-gold hover:bg-gold/80 text-black"
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
}: {
  auction: Auction
  onBidClick: (auction: Auction) => void
  isActive: boolean
}) {
  return (
    <Card className="border-gold/30 bg-black overflow-hidden hover:shadow-lg hover:shadow-gold/10 transition-all">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={auction.image || "/placeholder.svg?height=192&width=384&query=sports memorabilia"}
          alt={auction.playerName}
          fill
          className="object-cover"
        />
        {isActive && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <AuctionCountdown
              endDate={auction.endTime?.toDate ? auction.endTime.toDate() : new Date(auction.endTime)}
            />
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-gold mb-2">{auction.playerName}</h3>
        <p className="text-gold/70 mb-1">{auction.team}</p>
        <p className="text-gold/70 mb-4 line-clamp-2">{auction.description}</p>

        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gold/70">Current Bid</p>
            <p className="text-xl font-semibold text-gold">${formatPrice(auction.currentBid)}</p>
          </div>
          <div>
            <p className="text-sm text-gold/70">Bids</p>
            <p className="text-xl font-semibold text-gold text-right">{auction.bidHistory?.length || 0}</p>
          </div>
        </div>

        {isActive ? (
          <Button onClick={() => onBidClick(auction)} className="w-full bg-gold hover:bg-gold/80 text-black">
            Place Bid
          </Button>
        ) : (
          <div className="bg-black border border-gold/30 rounded-md p-3 text-center">
            <p className="text-sm text-gold/70">Auction Ended</p>
            <p className="text-gold font-medium">
              {auction.bidHistory && auction.bidHistory.length > 0
                ? "Sold for $" + formatPrice(auction.currentBid)
                : "No bids received"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
