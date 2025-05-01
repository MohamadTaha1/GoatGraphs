"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Search, Loader2, AlertCircle } from "lucide-react"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import Image from "next/image"

// Define the VideoPlayer type
interface VideoPlayer {
  id: string
  name: string
  sport: string
  team: string
  price: number
  imageUrl: string
  description: string
  available: boolean
  featured: boolean
  createdAt: any
  updatedAt: any
}

export default function AdminVideosPage() {
  const [players, setPlayers] = useState<VideoPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<VideoPlayer | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const { toast } = useToast()

  const playersPerPage = 10

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    sport: "football",
    team: "",
    price: 0,
    description: "",
    available: true,
    featured: false,
    imageUrl: "",
  })

  useEffect(() => {
    fetchPlayers()
  }, [])

  async function fetchPlayers() {
    try {
      setLoading(true)
      const db = getFirestoreInstance()
      if (!db) {
        throw new Error("Firestore instance is null")
      }

      const playersCollection = collection(db, "videoPlayers")
      const snapshot = await getDocs(playersCollection)

      const playersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as VideoPlayer[]

      // Sort by featured first, then by name
      playersData.sort((a, b) => {
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return a.name.localeCompare(b.name)
      })

      setPlayers(playersData)
    } catch (err) {
      console.error("Error fetching players:", err)
      setError(err instanceof Error ? err : new Error("Failed to load players"))
    } finally {
      setLoading(false)
    }
  }

  const filteredPlayers = players.filter(
    (player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.sport.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredPlayers.length / playersPerPage)
  const currentPlayers = filteredPlayers.slice((currentPage - 1) * playersPerPage, currentPage * playersPerPage)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number.parseFloat(value) : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const openAddDialog = () => {
    setSelectedPlayer(null)
    setFormData({
      name: "",
      sport: "football",
      team: "",
      price: 299.99,
      description: "",
      available: true,
      featured: false,
      imageUrl: "",
    })
    setImageFile(null)
    setImagePreview(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (player: VideoPlayer) => {
    setSelectedPlayer(player)
    setFormData({
      name: player.name,
      sport: player.sport,
      team: player.team,
      price: player.price,
      description: player.description,
      available: player.available,
      featured: player.featured,
      imageUrl: player.imageUrl,
    })
    setImagePreview(player.imageUrl)
    setIsDialogOpen(true)
  }

  const openDeleteDialog = (player: VideoPlayer) => {
    setSelectedPlayer(player)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const db = getFirestoreInstance()
      if (!db) {
        throw new Error("Firestore instance is null")
      }

      let imageUrl = formData.imageUrl

      // Upload image if a new one is selected
      if (imageFile) {
        const storage = getStorage()
        const timestamp = Date.now()
        const storageRef = ref(storage, `videoPlayers/${timestamp}_${imageFile.name}`)

        await uploadBytes(storageRef, imageFile)
        imageUrl = await getDownloadURL(storageRef)
      }

      const playerData = {
        ...formData,
        imageUrl,
        updatedAt: Timestamp.now(),
      }

      if (selectedPlayer) {
        // Update existing player
        const playerRef = doc(db, "videoPlayers", selectedPlayer.id)
        await updateDoc(playerRef, playerData)
        toast({
          title: "Player updated",
          description: `${formData.name} has been updated successfully.`,
        })
      } else {
        // Add new player
        playerData.createdAt = Timestamp.now()
        await addDoc(collection(db, "videoPlayers"), playerData)
        toast({
          title: "Player added",
          description: `${formData.name} has been added successfully.`,
        })
      }

      // Refresh the player list
      fetchPlayers()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving player:", error)
      toast({
        title: "Error",
        description: "There was a problem saving the player. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedPlayer) return

    setIsSubmitting(true)
    try {
      const db = getFirestoreInstance()
      if (!db) {
        throw new Error("Firestore instance is null")
      }

      await deleteDoc(doc(db, "videoPlayers", selectedPlayer.id))

      toast({
        title: "Player deleted",
        description: `${selectedPlayer.name} has been deleted successfully.`,
      })

      // Refresh the player list
      fetchPlayers()
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting player:", error)
      toast({
        title: "Error",
        description: "There was a problem deleting the player. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500 mr-2" />
        <span>Loading video players...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-8 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-red-500 mb-2">Error Loading Players</h3>
        <p className="text-gray-200 mb-4">{error.message}</p>
        <Button
          variant="outline"
          className="border-gold-500 text-gold-500 hover:bg-gold-500/10"
          onClick={() => fetchPlayers()}
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2 bg-gold-gradient bg-clip-text text-transparent">
          Video Players
        </h1>
        <p className="text-gray-400 font-body">Manage players available for personalized video messages</p>
      </div>

      <Card className="border-gold-700">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-5">
          <CardTitle className="text-gold-500 font-display">Players List</CardTitle>
          <Button onClick={openAddDialog} className="bg-gold-gradient hover:bg-gold-shine text-black">
            <Plus className="mr-2 h-4 w-4" />
            Add Player
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 border-gold-700"
              />
            </div>
          </div>

          <div className="rounded-md border border-gold-700">
            <Table>
              <TableHeader>
                <TableRow className="font-body border-gold-700/50">
                  <TableHead>Player</TableHead>
                  <TableHead>Sport/Team</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPlayers.length > 0 ? (
                  currentPlayers.map((player) => (
                    <TableRow key={player.id} className="border-gold-700/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md overflow-hidden relative">
                            <Image
                              src={player.imageUrl || "/placeholder.svg?height=40&width=40&text=Player"}
                              alt={player.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="font-display font-medium">{player.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-body">
                        <div>
                          <p className="capitalize">{player.sport}</p>
                          <p className="text-xs text-gray-400">{player.team}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-display font-medium">${player.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            player.available ? "bg-green-500/20 text-green-500" : "bg-gray-500/20 text-gray-500"
                          }`}
                        >
                          {player.available ? "Available" : "Unavailable"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            player.featured ? "bg-gold-500/20 text-gold-500" : "bg-gray-500/20 text-gray-500"
                          }`}
                        >
                          {player.featured ? "Featured" : "Standard"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEditDialog(player)}
                            className="hover:bg-gold-500/10 hover:text-gold-500"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openDeleteDialog(player)}
                            className="hover:bg-red-500/10 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No players found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-gray-400 font-body">
                Showing {Math.min(filteredPlayers.length, (currentPage - 1) * playersPerPage + 1)}-
                {Math.min(currentPage * playersPerPage, filteredPlayers.length)} of {filteredPlayers.length} players
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gold-700 text-gold-500"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-400 font-body">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gold-700 text-gold-500"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Player Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-gold-500 font-display">
              {selectedPlayer ? "Edit Player" : "Add New Player"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Player Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="border-gold-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sport">Sport</Label>
                <Select value={formData.sport} onValueChange={(value) => handleSelectChange("sport", value)}>
                  <SelectTrigger className="border-gold-700">
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="football">Football</SelectItem>
                    <SelectItem value="basketball">Basketball</SelectItem>
                    <SelectItem value="cricket">Cricket</SelectItem>
                    <SelectItem value="tennis">Tennis</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="team">Team</Label>
                <Input
                  id="team"
                  name="team"
                  value={formData.team}
                  onChange={handleInputChange}
                  className="border-gold-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  className="border-gold-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="min-h-[100px] border-gold-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Player Image</Label>
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <div className="h-20 w-20 rounded-md overflow-hidden relative">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Player preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="border-gold-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) => handleSwitchChange("available", checked)}
                />
                <Label htmlFor="available">Available for booking</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleSwitchChange("featured", checked)}
                />
                <Label htmlFor="featured">Featured player</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-gold-700 text-gold-500"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-gold-gradient hover:bg-gold-shine text-black">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Player"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-500 font-display">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-gray-300">
            Are you sure you want to delete <span className="font-bold">{selectedPlayer?.name}</span>? This action
            cannot be undone.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gold-700 text-gold-500"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Player"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
