"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatPrice } from "@/lib/utils"
import type { AuctionItem } from "./auction-item-card"
import { useToast } from "@/components/ui/use-toast"

interface BidModalProps {
  item: AuctionItem
  onClose: () => void
  onSubmit: (amount: number) => void
}

export function BidModal({ item, onClose, onSubmit }: BidModalProps) {
  const minBid = Math.ceil(item.currentBid * 1.05) // Minimum bid is 5% higher than current bid
  const [bidAmount, setBidAmount] = useState(minBid)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    setBidAmount(value)

    if (value < minBid) {
      setError(`Bid must be at least $${formatPrice(minBid)}`)
    } else {
      setError("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (bidAmount < minBid) {
      setError(`Bid must be at least $${formatPrice(minBid)}`)
      return
    }

    onSubmit(bidAmount)
    toast({
      title: "Bid Placed!",
      description: `Your bid of $${formatPrice(bidAmount)} for ${item.playerName}'s jersey has been placed.`,
    })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Place a Bid</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item" className="text-right">
                Item
              </Label>
              <div className="col-span-3">
                <p className="font-medium">{item.playerName} Jersey</p>
                <p className="text-sm text-gray-500">{item.team}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="current-bid" className="text-right">
                Current Bid
              </Label>
              <div className="col-span-3">
                <p className="font-medium">${formatPrice(item.currentBid)}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="min-bid" className="text-right">
                Minimum Bid
              </Label>
              <div className="col-span-3">
                <p className="font-medium">${formatPrice(minBid)}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bid" className="text-right">
                Your Bid
              </Label>
              <div className="col-span-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                  <Input
                    id="bid"
                    type="number"
                    value={bidAmount}
                    onChange={handleBidChange}
                    className="pl-7"
                    step="0.01"
                    min={minBid}
                  />
                </div>
                {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={bidAmount < minBid}>
              Place Bid
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
