"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuctions, type Auction } from "@/hooks/use-auctions"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

interface BidModalProps {
  auction: Auction
  isOpen: boolean
  onClose: () => void
  onBidSuccess: () => void
}

export function BidModal({ auction, isOpen, onClose, onBidSuccess }: BidModalProps) {
  const [bidAmount, setBidAmount] = useState<number>(auction.currentBid + 10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { placeBid } = useAuctions()
  const { user } = useAuth()
  const router = useRouter()

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    setBidAmount(isNaN(value) ? 0 : value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Check if user is logged in
    if (!user) {
      router.push("/login")
      return
    }

    // Validate bid amount
    if (bidAmount <= auction.currentBid) {
      setError(`Your bid must be higher than the current bid of $${auction.currentBid.toFixed(2)}`)
      return
    }

    setLoading(true)
    try {
      await placeBid(auction.id, bidAmount)
      onBidSuccess()
    } catch (err: any) {
      setError(err.message || "Failed to place bid. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-charcoal border-gold/30 text-offwhite sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-offwhite">Place a Bid</DialogTitle>
          <DialogDescription className="text-offwhite/70">
            You are bidding on {auction.playerName} ({auction.team}) jersey
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-900/50">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-500">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="flex justify-between text-sm">
              <span className="text-offwhite/70">Current Bid:</span>
              <span className="text-gold font-semibold">${auction.currentBid.toFixed(2)}</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bidAmount" className="text-offwhite">
                Your Bid Amount ($)
              </Label>
              <Input
                id="bidAmount"
                type="number"
                min={auction.currentBid + 0.01}
                step="0.01"
                value={bidAmount}
                onChange={handleBidChange}
                className="border-gold/30 bg-jetblack text-offwhite"
                required
              />
              <p className="text-xs text-offwhite/70">Minimum bid: ${(auction.currentBid + 0.01).toFixed(2)}</p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gold/30 text-offwhite hover:bg-jetblack"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || bidAmount <= auction.currentBid}
              className="bg-gold-soft hover:bg-gold-deep text-jetblack"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                `Place Bid: $${bidAmount.toFixed(2)}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
