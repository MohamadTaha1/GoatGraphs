"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Video, MessageSquare, CheckCircle, Clock, X, Play, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore"
import type { Video as VideoType, VideoRequest } from "@/hooks/use-videos"

export default function AdminVideosPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [videos, setVideos] = useState<VideoType[]>([])
  const [requests, setRequests] = useState<VideoRequest[]>([])
  const [loadingVideos, setLoadingVideos] = useState(true)
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [activeTab, setActiveTab] = useState("videos")
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch videos
  const fetchVideos = async () => {
    try {
      setLoadingVideos(true)
      const videosQuery = query(collection(db, "videos"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(videosQuery)

      const videosData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as VideoType[]

      setVideos(videosData)
    } catch (error) {
      console.error("Error fetching videos:", error)
      toast({
        title: "Error",
        description: "Failed to load videos. Please try again.",
        variant: "destructive",
      })
      // Use fallback data
      setVideos([])
    } finally {
      setLoadingVideos(false)
    }
  }

  // Fetch video requests
  const fetchRequests = async () => {
    try {
      setLoadingRequests(true)
      const requestsQuery = query(collection(db, "videoRequests"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(requestsQuery)

      const requestsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as VideoRequest[]

      setRequests(requestsData)
    } catch (error) {
      console.error("Error fetching video requests:", error)
      toast({
        title: "Error",
        description: "Failed to load video requests. Please try again.",
        variant: "destructive",
      })
      // Use fallback data
      setRequests([])
    } finally {
      setLoadingRequests(false)
    }
  }

  useEffect(() => {
    fetchVideos()
    fetchRequests()
  }, [])

  useEffect(() => {
    // Set active tab based on URL parameter
    const tab = searchParams.get("tab")
    if (tab === "requests") {
      setActiveTab("requests")
    } else {
      setActiveTab("videos")
    }
  }, [searchParams])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/admin/videos?tab=${value}`)
  }

  const handleDeleteVideo = async (id: string) => {
    if (confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "videos", id))

        toast({
          title: "Video deleted",
          description: "The video has been successfully deleted.",
        })

        // Refresh the videos list
        fetchVideos()
      } catch (error) {
        console.error("Error deleting video:", error)
        toast({
          title: "Error",
          description: "Failed to delete the video. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleUpdateRequestStatus = async (id: string, status: "accepted" | "rejected") => {
    try {
      await updateDoc(doc(db, "videoRequests", id), {
        status,
        updatedAt: new Date(),
      })

      toast({
        title: status === "accepted" ? "Request accepted" : "Request rejected",
        description:
          status === "accepted"
            ? "The video request has been accepted and is now in progress."
            : "The video request has been rejected.",
      })

      // Refresh the requests list
      fetchRequests()
    } catch (error) {
      console.error("Error updating request status:", error)
      toast({
        title: "Error",
        description: "Failed to update the request status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredVideos = videos.filter(
    (video) =>
      video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.player?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredRequests = requests.filter(
    (request) =>
      request.player?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.occasion?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-500/20 text-blue-500"
      case "accepted":
        return "bg-orange-500/20 text-orange-500"
      case "completed":
        return "bg-green-500/20 text-green-500"
      case "rejected":
        return "bg-red-500/20 text-red-500"
      default:
        return "bg-gray-500/20 text-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "accepted":
        return <Play className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <X className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Format date from Firestore timestamp
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"

    try {
      // Handle Firestore Timestamp
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString()
      }

      // Handle Date object or string
      return new Date(timestamp).toLocaleDateString()
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Videos Management</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild>
            <Link href="/admin/videos/add">
              <Plus className="mr-2 h-4 w-4" /> Add New Video
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search videos or requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="videos" className="flex items-center">
            <Video className="mr-2 h-4 w-4" /> Videos
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" /> Customer Requests
            {requests.length > 0 && (
              <Badge variant="outline" className="ml-2 bg-primary/20">
                {requests.filter((r) => r.status === "pending").length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos">
          {loadingVideos ? (
            <div className="flex justify-center items-center h-[40vh]">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading videos...</span>
            </div>
          ) : filteredVideos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Video className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Videos Found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm ? "No videos match your search criteria." : "You haven't added any videos yet."}
                </p>
                <Button asChild>
                  <Link href="/admin/videos/add">
                    <Plus className="mr-2 h-4 w-4" /> Add Your First Video
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <div className="relative aspect-video">
                    <Image
                      src={video.thumbnailUrl || "/placeholder.svg?height=200&width=400&query=video+thumbnail"}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                    {video.featured && (
                      <Badge className="absolute top-2 right-2 bg-amber-500 text-black">Featured</Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-1">{video.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">Player: {video.player}</p>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{video.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Added: {formatDate(video.createdAt)}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild title="View Video">
                          <Link href={`/admin/videos/view/${video.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild title="Edit Video">
                          <Link href={`/admin/videos/edit/${video.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteVideo(video.id)}
                          title="Delete Video"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          {loadingRequests ? (
            <div className="flex justify-center items-center h-[40vh]">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading video requests...</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Video Requests</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "No requests match your search criteria." : "There are no customer video requests yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4">Player</th>
                    <th className="text-left py-3 px-4">Recipient</th>
                    <th className="text-left py-3 px-4">Occasion</th>
                    <th className="text-left py-3 px-4">Requested On</th>
                    <th className="text-left py-3 px-4">Delivery Date</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900/50"
                    >
                      <td className="py-3 px-4 font-medium">{request.player}</td>
                      <td className="py-3 px-4">{request.recipientName}</td>
                      <td className="py-3 px-4">{request.occasion}</td>
                      <td className="py-3 px-4">{formatDate(request.createdAt)}</td>
                      <td className="py-3 px-4">{request.deliveryDate}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                          {getStatusIcon(request.status)}
                          <span>{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          {request.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-500 hover:text-green-600"
                                onClick={() => handleUpdateRequestStatus(request.id, "accepted")}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => handleUpdateRequestStatus(request.id, "rejected")}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {request.status === "accepted" && (
                            <Button size="sm" asChild>
                              <Link href={`/admin/videos/fulfill/${request.id}`}>Fulfill</Link>
                            </Button>
                          )}
                          {request.status === "completed" && (
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/videos/fulfill/${request.id}`}>View</Link>
                            </Button>
                          )}
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/videos/request/${request.id}`}>Details</Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
