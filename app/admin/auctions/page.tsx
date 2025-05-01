"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Search, Trash2, Edit, Eye } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface AuctionItem {
  id: string
  playerName: string
  team: string
  image: string
  currentBid: number
  startingBid: number
  endTime: string | any
  status?: string
  bidHistory?: Array<{
    userId: string
    userName: string
    amount: number
    timestamp: any
  }>
}

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<AuctionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchAuctions()
  }, [])

  const fetchAuctions = async () => {
    setLoading(true)
    try {
      const db = getFirestoreInstance()
      const auctionsRef = collection(db, "auctions")
      const q = query(auctionsRef, orderBy("endTime", "desc"))
      const querySnapshot = await getDocs(q)

      const auctionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AuctionItem[]

      setAuctions(auctionsData)
    } catch (error) {
      console.error("Error fetching auctions:", error)
      toast({
        title: "Error",
        description: "Failed to load auctions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this auction?")) return

    try {
      const db = getFirestoreInstance()
      await deleteDoc(doc(db, "auctions", id))

      setAuctions((prev) => prev.filter((auction) => auction.id !== id))

      toast({
        title: "Success",
        description: "Auction deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting auction:", error)
      toast({
        title: "Error",
        description: "Failed to delete auction. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredAuctions = auctions.filter(
    (auction) =>
      auction.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auction.team.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Function to format date
  const formatDate = (dateString: string | any) => {
    if (!dateString) return "N/A"

    // Handle Firestore timestamp
    if (dateString.toDate) {
      return new Date(dateString.toDate()).toLocaleString()
    }

    // Handle ISO string
    return new Date(dateString).toLocaleString()
  }

  // Function to check if auction is active
  const isAuctionActive = (endTime: string | any) => {
    if (!endTime) return false

    let endDate
    if (endTime.toDate) {
      endDate = endTime.toDate()
    } else {
      endDate = new Date(endTime)
    }

    return endDate > new Date()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-offwhite">Auctions</h1>
        <Button
          onClick={() => router.push("/admin/auctions/add")}
          className="bg-gold-soft hover:bg-gold-deep text-jetblack"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Auction
        </Button>
      </div>

      <div className="flex items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-offwhite/50" />
          <Input
            placeholder="Search auctions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gold/30 bg-jetblack text-offwhite"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : filteredAuctions.length === 0 ? (
        <Card className="border-gold/30 bg-charcoal">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-offwhite/70 mb-4">No auctions found</p>
            <Button
              onClick={() => router.push("/admin/auctions/add")}
              className="bg-gold-soft hover:bg-gold-deep text-jetblack"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Your First Auction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auction) => (
            <Card key={auction.id} className="border-gold/30 bg-charcoal overflow-hidden">
              <div className="relative h-48 w-full">
                <Image
                  src={auction.image || "/placeholder.svg?height=192&width=384&query=jersey"}
                  alt={auction.playerName}
                  fill
                  className="object-cover"
                />
                <Badge
                  className={`absolute top-2 right-2 ${
                    isAuctionActive(auction.endTime)
                      ? "bg-green-500/20 text-green-500 border-green-500/20"
                      : "bg-red-500/20 text-red-500 border-red-500/20"
                  }`}
                >
                  {isAuctionActive(auction.endTime) ? "Active" : "Ended"}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-offwhite">{auction.playerName}</CardTitle>
                <p className="text-offwhite/70">{auction.team}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-offwhite/70">Current Bid:</span>
                    <span className="text-gold font-semibold">${auction.currentBid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-offwhite/70">Starting Bid:</span>
                    <span className="text-offwhite">${auction.startingBid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-offwhite/70">End Time:</span>
                    <span className="text-offwhite">{formatDate(auction.endTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-offwhite/70">Bids:</span>
                    <span className="text-offwhite">{auction.bidHistory?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                  onClick={() => handleDelete(auction.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" className="border-gold/30 text-gold hover:bg-gold/10" asChild>
                    <Link href={`/admin/auctions/${auction.id}`}>
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="border-gold/30 text-gold hover:bg-gold/10" asChild>
                    <Link href={`/admin/auctions/edit/${auction.id}`}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
