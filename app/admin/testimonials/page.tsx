"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Search, Edit, Trash2, MoreHorizontal, Loader2 } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Mock data for testimonials
const TESTIMONIALS_DATA = [
  {
    id: "1",
    name: "Ahmed Al Mansour",
    role: "Football Fan",
    content:
      "The signed Messi jersey I purchased is absolutely authentic. The certificate and packaging were top-notch!",
    rating: 5,
    featured: true,
    approved: true,
    date: "2023-05-15",
  },
  {
    id: "2",
    name: "Sara Khan",
    role: "Collector",
    content: "I've been collecting signed memorabilia for years, and this is one of the best online stores I've used.",
    rating: 5,
    featured: true,
    approved: true,
    date: "2023-06-02",
  },
  {
    id: "3",
    name: "Mohammed Hassan",
    role: "Sports Enthusiast",
    content:
      "Fast shipping and excellent customer service. The authenticity verification process gives me peace of mind.",
    rating: 4,
    featured: false,
    approved: true,
    date: "2023-06-10",
  },
  {
    id: "4",
    name: "Layla Mohammed",
    role: "Gift Buyer",
    content: "Bought a signed jersey as a gift for my husband. He was thrilled with the quality and authenticity.",
    rating: 5,
    featured: false,
    approved: true,
    date: "2023-06-15",
  },
  {
    id: "5",
    name: "Yousef Khalid",
    role: "New Customer",
    content: "The product was good but shipping took longer than expected.",
    rating: 3,
    featured: false,
    approved: false,
    date: "2023-06-20",
  },
]

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState(TESTIMONIALS_DATA)
  const [searchTerm, setSearchTerm] = useState("")
  const [testimonialToDelete, setTestimonialToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filter testimonials based on search term
  const filteredTestimonials = testimonials.filter(
    (testimonial) =>
      testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteTestimonial = (testimonialId: string) => {
    setIsDeleting(true)
    // Simulate API call
    setTimeout(() => {
      setTestimonials(testimonials.filter((testimonial) => testimonial.id !== testimonialId))
      setIsDeleting(false)
      setTestimonialToDelete(null)
      toast({
        title: "Testimonial deleted",
        description: "The testimonial has been deleted successfully.",
      })
    }, 1000)
  }

  const toggleFeatured = (testimonialId: string) => {
    setTestimonials(
      testimonials.map((testimonial) =>
        testimonial.id === testimonialId ? { ...testimonial, featured: !testimonial.featured } : testimonial,
      ),
    )
    toast({
      title: "Status updated",
      description: "The testimonial featured status has been updated.",
    })
  }

  const toggleApproved = (testimonialId: string) => {
    setTestimonials(
      testimonials.map((testimonial) =>
        testimonial.id === testimonialId ? { ...testimonial, approved: !testimonial.approved } : testimonial,
      ),
    )
    toast({
      title: "Status updated",
      description: "The testimonial approval status has been updated.",
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 bg-gold-gradient bg-clip-text text-transparent">
            Testimonials
          </h1>
          <p className="text-offwhite/70 font-body">Manage customer testimonials and reviews</p>
        </div>

        <Button asChild className="bg-gold-soft hover:bg-gold-deep text-jetblack">
          <Link href="/admin/testimonials/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Testimonial
          </Link>
        </Button>
      </div>

      <Card className="border-gold/30 bg-charcoal">
        <CardHeader className="pb-3">
          <CardTitle className="text-gold font-display">Testimonial Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-offwhite/50" />
              <Input
                placeholder="Search testimonials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 border-gold/30 bg-jetblack text-offwhite"
              />
            </div>
          </div>

          <div className="rounded-md border border-gold/30">
            <Table>
              <TableHeader>
                <TableRow className="font-body border-gold/30 hover:bg-transparent">
                  <TableHead className="text-offwhite">Customer</TableHead>
                  <TableHead className="text-offwhite">Testimonial</TableHead>
                  <TableHead className="text-offwhite">Rating</TableHead>
                  <TableHead className="text-offwhite">Date</TableHead>
                  <TableHead className="text-offwhite">Status</TableHead>
                  <TableHead className="text-right text-offwhite">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTestimonials.map((testimonial) => (
                  <TableRow key={testimonial.id} className="border-gold/30 hover:bg-gold/5">
                    <TableCell className="font-body">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 bg-black border border-gold-700">
                          <AvatarFallback className="text-gold-500 font-display">
                            {getInitials(testimonial.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-display font-bold">{testimonial.name}</p>
                          <p className="text-xs text-gray-400 font-body">{testimonial.role}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-body text-offwhite">
                      <p className="truncate max-w-[250px]">{testimonial.content}</p>
                    </TableCell>
                    <TableCell className="font-body text-gold-warm">
                      {"★".repeat(testimonial.rating)}
                      {"☆".repeat(5 - testimonial.rating)}
                    </TableCell>
                    <TableCell className="font-body text-offwhite">
                      {new Date(testimonial.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Badge
                          className={`font-body ${
                            testimonial.approved
                              ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                              : "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                          }`}
                        >
                          {testimonial.approved ? "Approved" : "Pending"}
                        </Badge>
                        {testimonial.featured && (
                          <Badge className="font-body bg-gold/20 text-gold hover:bg-gold/30">Featured</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:bg-gold/10 hover:text-gold">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-charcoal border-gold/30">
                          <DropdownMenuLabel className="text-offwhite">Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild className="text-offwhite hover:text-gold hover:bg-gold/10">
                            <Link href={`/admin/testimonials/edit/${testimonial.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gold/20" />
                          <DropdownMenuItem
                            className="text-offwhite hover:text-gold hover:bg-gold/10"
                            onClick={() => toggleFeatured(testimonial.id)}
                          >
                            <span className="mr-2">🌟</span>
                            {testimonial.featured ? "Remove from Featured" : "Mark as Featured"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-offwhite hover:text-gold hover:bg-gold/10"
                            onClick={() => toggleApproved(testimonial.id)}
                          >
                            <span className="mr-2">✓</span>
                            {testimonial.approved ? "Unapprove" : "Approve"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gold/20" />
                          <DropdownMenuItem
                            className="text-red-500 focus:text-red-500 hover:bg-red-500/10"
                            onClick={() => setTestimonialToDelete(testimonial.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredTestimonials.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-offwhite">
                      No testimonials found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!testimonialToDelete} onOpenChange={(open) => !open && setTestimonialToDelete(null)}>
        <AlertDialogContent className="bg-charcoal border-gold/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gold">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-offwhite/70">
              Are you sure you want to delete this testimonial? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-gold/30 text-offwhite hover:bg-gold/10 hover:text-gold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => testimonialToDelete && handleDeleteTestimonial(testimonialToDelete)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
