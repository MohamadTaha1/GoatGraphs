"use client"

import { useState } from "react"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import { AuctionCountdown } from "./auction-countdown"
import { BidModal } from "./bid-modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export interface AuctionItem {
  id: string
  playerName: string
  team: string
  image: string
  currentBid: number
  startingBid: number
  endTime: Date | string
  status?: "new" | "ending_soon" | "ended"
  bidHistory?: {
    userId: string
    userName: string
    amount: number
    timestamp: Date
  }[]
}

interface AuctionItemCardProps {
  item: AuctionItem
  onBidPlaced?: (itemId: string, amount: number) => void
}

export function AuctionItemCard({ item, onBidPlaced }: AuctionItemCardProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [showBidModal, setShowBidModal] = useState(false)

  const isEnded = new Date(item.endTime) < new Date()
  const isEndingSoon = !isEnded && new Date(item.endTime).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000 // 24 hours
  const isNew = new Date().getTime() - new Date(item.endTime).getTime() < 3 * 24 * 60 * 60 * 1000 // 3 days

  const handleBidSubmit = (amount: number) => {
    if (onBidPlaced) {
      onBidPlaced(item.id, amount)
    }
    setShowBidModal(false)
  }

  return (
    <>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="relative">
          <div
            className="relative h-64 overflow-hidden bg-gray-100"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
          >
            <Image
              src={item.image || "/placeholder.svg?height=400&width=300&query=jersey"}
              alt={`${item.playerName} ${item.team} Jersey`}
              fill
              className={`object-cover transition-transform duration-300 ${isZoomed ? "scale-110" : "scale-100"}`}
            />
            <div className="absolute top-2 right-2 flex flex-col gap-2">
              {item.status === "new" && <Badge className="bg-blue-500 hover:bg-blue-600">NEW</Badge>}
              {isEndingSoon && <Badge className="bg-red-500 hover:bg-red-600">ENDING SOON</Badge>}
              {isEnded && (
                <Badge variant="outline" className="bg-gray-200 text-gray-700 hover:bg-gray-300">
                  ENDED
                </Badge>
              )}
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-bold">{item.playerName}</h3>
            <span className="text-sm text-gray-500">{item.team}</span>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current Bid</p>
              <p className="text-xl font-bold text-amber-600">${formatPrice(item.currentBid)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Ends In</p>
              <AuctionCountdown endTime={item.endTime} />
            </div>
          </div>

          <Button
            className="w-full bg-amber-600 hover:bg-amber-700"
            onClick={() => setShowBidModal(true)}
            disabled={isEnded}
          >
            {isEnded ? "Auction Ended" : "Place Your Bid"}
          </Button>
        </CardContent>
      </Card>

      {showBidModal && <BidModal item={item} onClose={() => setShowBidModal(false)} onSubmit={handleBidSubmit} />}
    </>
  )
}
