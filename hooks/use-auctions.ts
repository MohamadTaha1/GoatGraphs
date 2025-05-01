"use client"

import { useState, useEffect } from "react"
import { collection, query, getDocs, doc, getDoc, orderBy, updateDoc, serverTimestamp } from "firebase/firestore"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { useAuth } from "@/contexts/auth-context"

export interface Auction {
  id: string
  playerName: string
  team: string
  description?: string
  image: string
  currentBid: number
  startingBid: number
  endTime: any
  status?: string
  createdAt?: any
  updatedAt?: any
  bidHistory?: Array<{
    userId: string
    userName: string
    amount: number
    timestamp: any
  }>
}

export function useAuctions() {
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchAuctions = async () => {
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
        const auctionsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Auction[]

        setAuctions(auctionsData)
      }
    } catch (err) {
      console.error("Error fetching auctions:", err)
      setError("Failed to load auctions. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchActiveAuctions = async () => {
    setLoading(true)
    setError(null)
    try {
      const db = getFirestoreInstance()
      if (!db) {
        throw new Error("Firestore instance is null")
      }

      const auctionsRef = collection(db, "auctions")
      const now = new Date()

      // We can't directly query on endTime > now with Firestore
      // So we'll fetch all and filter client-side
      const q = query(auctionsRef, orderBy("endTime", "asc"))
      const querySnapshot = await getDocs(q)

      const auctionsData = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((auction) => {
          // Filter for auctions that haven't ended yet
          try {
            const endTime = auction.endTime?.toDate ? auction.endTime.toDate() : new Date(auction.endTime)
            return endTime > now
          } catch (err) {
            console.error("Error parsing auction end time:", err)
            return false
          }
        }) as Auction[]

      setAuctions(auctionsData)
    } catch (err) {
      console.error("Error fetching active auctions:", err)
      setError("Failed to load active auctions. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchAuction = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const db = getFirestoreInstance()
      if (!db) {
        throw new Error("Firestore instance is null")
      }

      const docRef = doc(db, "auctions", id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Auction
      } else {
        throw new Error("Auction not found")
      }
    } catch (err) {
      console.error("Error fetching auction:", err)
      setError("Failed to load auction details. Please try again.")
      return null
    } finally {
      setLoading(false)
    }
  }

  const placeBid = async (auctionId: string, bidAmount: number) => {
    if (!user) {
      throw new Error("You must be logged in to place a bid")
    }

    try {
      const db = getFirestoreInstance()
      if (!db) {
        throw new Error("Firestore instance is null")
      }

      const auctionRef = doc(db, "auctions", auctionId)
      const auctionSnap = await getDoc(auctionRef)

      if (!auctionSnap.exists()) {
        throw new Error("Auction not found")
      }

      const auctionData = auctionSnap.data() as Auction

      // Check if auction has ended
      let endTime
      try {
        endTime = auctionData.endTime?.toDate ? auctionData.endTime.toDate() : new Date(auctionData.endTime)
      } catch (err) {
        console.error("Error parsing auction end time:", err)
        throw new Error("Invalid auction end time")
      }

      if (endTime < new Date()) {
        throw new Error("This auction has ended")
      }

      // Check if bid is higher than current bid
      if (bidAmount <= auctionData.currentBid) {
        throw new Error(`Your bid must be higher than the current bid of $${auctionData.currentBid.toFixed(2)}`)
      }

      // Add bid to history and update current bid
      const bidHistory = auctionData.bidHistory || []
      const newBid = {
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        amount: bidAmount,
        timestamp: serverTimestamp(),
      }

      await updateDoc(auctionRef, {
        currentBid: bidAmount,
        bidHistory: [...bidHistory, newBid],
        updatedAt: serverTimestamp(),
      })

      return true
    } catch (err) {
      console.error("Error placing bid:", err)
      throw err
    }
  }

  useEffect(() => {
    fetchAuctions()
  }, [])

  return {
    auctions,
    loading,
    error,
    fetchAuctions,
    fetchActiveAuctions,
    fetchAuction,
    placeBid,
  }
}
