"use client"

import { useState, useEffect } from "react"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { collection, getDocs, updateDoc, doc } from "firebase/firestore"
import type { AuctionItem } from "@/components/auction-item-card"

// Fallback data for when Firebase is unavailable
const fallbackAuctions: AuctionItem[] = [
  {
    id: "1",
    playerName: "Lionel Messi",
    team: "Argentina",
    image: "/images/messi-signed-jersey.png",
    currentBid: 870,
    startingBid: 500,
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    status: "new",
  },
  {
    id: "2",
    playerName: "Cristiano Ronaldo",
    team: "Portugal",
    image: "/images/ronaldo-signed-jersey.png",
    currentBid: 950,
    startingBid: 600,
    endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
    status: "ending_soon",
  },
  {
    id: "3",
    playerName: "Kylian Mbappé",
    team: "France",
    image: "/images/mbappe-signed-jersey.png",
    currentBid: 750,
    startingBid: 400,
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
  },
  {
    id: "4",
    playerName: "Neymar Jr",
    team: "Brazil",
    image: "/images/neymar-signed-jersey.png",
    currentBid: 680,
    startingBid: 350,
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
  },
  {
    id: "5",
    playerName: "Erling Haaland",
    team: "Manchester City",
    image: "/images/haaland-signed-jersey.png",
    currentBid: 820,
    startingBid: 450,
    endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
    status: "new",
  },
  {
    id: "6",
    playerName: "Mohamed Salah",
    team: "Liverpool",
    image: "/images/salah-signed-jersey.png",
    currentBid: 710,
    startingBid: 400,
    endTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours from now
    status: "ending_soon",
  },
  {
    id: "7",
    playerName: "Robert Lewandowski",
    team: "Barcelona",
    image: "/images/lewandowski-signed-jersey.png",
    currentBid: 650,
    startingBid: 300,
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: "ended",
  },
  {
    id: "8",
    playerName: "Harry Kane",
    team: "England",
    image: "/images/kane-signed-jersey.png",
    currentBid: 590,
    startingBid: 350,
    endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: "ended",
  },
]

export function useAuctions() {
  const [auctions, setAuctions] = useState<AuctionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchAuctions() {
      try {
        // Skip if we're not in the browser
        if (typeof window === "undefined") return

        let db
        try {
          db = getFirestoreInstance()
        } catch (err) {
          console.error("Failed to get Firestore instance:", err)
          setAuctions(fallbackAuctions)
          setLoading(false)
          return
        }

        if (!db) {
          setAuctions(fallbackAuctions)
          setLoading(false)
          return
        }

        try {
          const auctionsCollection = collection(db, "auctions")
          const auctionsSnapshot = await getDocs(auctionsCollection)

          if (!auctionsSnapshot.empty) {
            const auctionsData = auctionsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as AuctionItem[]

            setAuctions(auctionsData)
          } else {
            console.log("No auctions found, using fallback data")
            setAuctions(fallbackAuctions)
          }
        } catch (queryError) {
          console.error("Error fetching auctions:", queryError)
          setAuctions(fallbackAuctions)
        }
      } catch (err) {
        console.error("Error in useAuctions:", err)
        setError(err instanceof Error ? err : new Error(String(err)))
        setAuctions(fallbackAuctions)
      } finally {
        setLoading(false)
      }
    }

    fetchAuctions()
  }, [])

  const placeBid = async (auctionId: string, bidAmount: number) => {
    try {
      const db = getFirestoreInstance()
      const auctionRef = doc(db, "auctions", auctionId)

      await updateDoc(auctionRef, {
        currentBid: bidAmount,
        bidHistory: [
          {
            userId: "current-user-id", // Replace with actual user ID
            userName: "Current User", // Replace with actual user name
            amount: bidAmount,
            timestamp: new Date(),
          },
        ],
      })

      // Update local state
      setAuctions((prevAuctions) =>
        prevAuctions.map((auction) =>
          auction.id === auctionId
            ? {
                ...auction,
                currentBid: bidAmount,
              }
            : auction,
        ),
      )

      return { success: true }
    } catch (error) {
      console.error("Error placing bid:", error)
      return { success: false, error }
    }
  }

  return {
    auctions,
    loading,
    error,
    placeBid,
  }
}
