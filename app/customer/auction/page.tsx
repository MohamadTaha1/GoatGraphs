"use client"

import { useState } from "react"
import { useAuctions } from "@/hooks/use-auctions"
import { AuctionItemCard } from "@/components/auction-item-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LayoutGrid, List, Search, SlidersHorizontal } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { AuctionCountdown } from "@/components/auction-countdown"

export default function CustomerAuctionPage() {
  const { auctions, loading, placeBid } = useAuctions()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState("ending-soon")
  const [activeTab, setActiveTab] = useState("active")
  const { toast } = useToast()
  const [showBidModal, setShowBidModal] = useState(false)

  const handleBidPlaced = async (itemId: string, amount: number) => {
    const result = await placeBid(itemId, amount)
    if (result.success) {
      toast({
        title: "Bid Placed Successfully",
        description: `Your bid of $${amount.toFixed(2)} has been placed.`,
      })
    } else {
      toast({
        title: "Bid Failed",
        description: "There was an error placing your bid. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredAuctions = auctions
    .filter((auction) => {
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          auction.playerName.toLowerCase().includes(searchLower) || auction.team.toLowerCase().includes(searchLower)
        )
      }
      return true
    })
    .filter((auction) => {
      // Filter by tab (active or ended)
      const now = new Date()
      const endTime = new Date(auction.endTime)
      if (activeTab === "active") {
        return endTime > now
      } else {
        return endTime <= now
      }
    })
    .sort((a, b) => {
      // Sort by selected option
      switch (sortOption) {
        case "ending-soon":
          return new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
        case "price-low":
          return a.currentBid - b.currentBid
        case "price-high":
          return b.currentBid - a.currentBid
        case "player-name":
          return a.playerName.localeCompare(b.playerName)
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-gold">Football Jersey Auctions</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-charcoal/50 animate-pulse h-96 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gold">Football Jersey Auctions</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            className={viewMode === "grid" ? "bg-gold text-jetblack" : "border-gold/30 text-gold"}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-5 w-5" />
            <span className="sr-only">Grid View</span>
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            className={viewMode === "list" ? "bg-gold text-jetblack" : "border-gold/30 text-gold"}
            onClick={() => setViewMode("list")}
          >
            <List className="h-5 w-5" />
            <span className="sr-only">List View</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/70" />
          <Input
            placeholder="Search by player or team..."
            className="pl-9 bg-charcoal border-gold/30 text-offwhite focus:border-gold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gold/70" />
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[180px] bg-charcoal border-gold/30 text-offwhite">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-charcoal border-gold/30 text-offwhite">
              <SelectItem value="ending-soon">Ending Soon</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="player-name">Player Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="active" className="mb-8" onValueChange={setActiveTab}>
        <TabsList className="bg-charcoal border border-gold/30">
          <TabsTrigger value="active" className="data-[state=active]:bg-gold data-[state=active]:text-jetblack">
            Active Auctions
          </TabsTrigger>
          <TabsTrigger value="ended" className="data-[state=active]:bg-gold data-[state=active]:text-jetblack">
            Ended Auctions
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-6">
          {filteredAuctions.length === 0 ? (
            <div className="text-center py-12 bg-charcoal/30 rounded-lg border border-gold/10">
              <p className="text-lg text-gold/70">No active auctions found</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAuctions.map((auction) => (
                <AuctionItemCard key={auction.id} item={auction} onBidPlaced={handleBidPlaced} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAuctions.map((auction) => (
                <div
                  key={auction.id}
                  className="flex flex-col md:flex-row gap-4 border border-gold/20 bg-charcoal rounded-lg p-4"
                >
                  <div className="md:w-1/3 lg:w-1/4">
                    <div className="relative h-48 overflow-hidden bg-gray-100 rounded-lg">
                      <img
                        src={auction.image || "/images/messi-signed-jersey.png"}
                        alt={`${auction.playerName} ${auction.team} Jersey`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                  <div className="md:w-2/3 lg:w-3/4">
                    <h3 className="text-xl font-bold text-gold">{auction.playerName}</h3>
                    <p className="text-offwhite/70">{auction.team}</p>
                    <div className="mt-4 flex justify-between">
                      <div>
                        <p className="text-sm text-offwhite/70">Current Bid</p>
                        <p className="text-xl font-bold text-gold-warm">${auction.currentBid.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-offwhite/70">Ends In</p>
                        <AuctionCountdown endTime={auction.endTime} />
                      </div>
                    </div>
                    <Button
                      className="mt-4 w-full bg-gold hover:bg-gold-deep text-jetblack"
                      onClick={() => setShowBidModal(true)}
                    >
                      Place Your Bid
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="ended" className="mt-6">
          {filteredAuctions.length === 0 ? (
            <div className="text-center py-12 bg-charcoal/30 rounded-lg border border-gold/10">
              <p className="text-lg text-gold/70">No ended auctions found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAuctions.map((auction) => (
                <AuctionItemCard key={auction.id} item={auction} onBidPlaced={handleBidPlaced} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
