"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Shield,
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAdminUsers } from "@/hooks/use-admin-users"
import type { User } from "@/hooks/use-users"

export default function AdminsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { adminUsers, loading, error, needsIndex, indexUrl, updateAdminUser, deleteAdminUser } = useAdminUsers()
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [adminToDelete, setAdminToDelete] = useState<User | null>(null)

  // Filter admins based on search query
  const filteredAdmins = adminUsers.filter(
    (admin) =>
      admin.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDeleteClick = (admin: User) => {
    setAdminToDelete(admin)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!adminToDelete) return

    const success = await deleteAdminUser(adminToDelete.id)

    if (success) {
      toast({
        title: "Admin deleted",
        description: `${adminToDelete.displayName || adminToDelete.email} has been removed.`,
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete admin. Please try again.",
        variant: "destructive",
      })
    }

    setDeleteDialogOpen(false)
    setAdminToDelete(null)
  }

  const toggleStatus = async (admin: User) => {
    const newStatus = admin.status === "active" ? "inactive" : "active"
    const success = await updateAdminUser(admin.id, { status: newStatus })

    if (success) {
      toast({
        title: "Status updated",
        description: `Admin status changed to ${newStatus}.`,
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gold">Admin Users</h1>
        <Button asChild>
          <Link href="/admin/admins/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Admin
          </Link>
        </Button>
      </div>

      {needsIndex && indexUrl && (
        <Alert variant="warning" className="bg-amber-900/20 border-amber-500 text-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-500">Index Required</AlertTitle>
          <AlertDescription className="text-amber-200">
            For optimal performance, this query requires a Firestore index.{" "}
            <a
              href={indexUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-amber-400 hover:text-amber-300"
            >
              Click here to create the index
            </a>
            . Currently using client-side sorting as a fallback.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-500 text-red-200">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-red-500">Error</AlertTitle>
          <AlertDescription className="text-red-200">
            {error.message || "An error occurred while loading admin users."}
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border border-gold/30 bg-charcoal">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gold/50" />
            <Input
              type="search"
              placeholder="Search admins..."
              className="pl-8 bg-jetblack border-gold/30 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="border-t border-gold/30">
          <div className="grid grid-cols-12 gap-2 p-4 font-medium text-gold">
            <div className="col-span-1">ID</div>
            <div className="col-span-2">Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Last Login</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gold/70">Loading admins...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">Error loading admins. Please try again.</div>
          ) : filteredAdmins.length === 0 ? (
            <div className="p-8 text-center text-gold/70">
              {searchQuery ? "No admins match your search." : "No admins found."}
            </div>
          ) : (
            filteredAdmins.map((admin) => (
              <div key={admin.id} className="grid grid-cols-12 gap-2 border-t border-gold/30 p-4 hover:bg-jetblack/50">
                <div className="col-span-1 truncate font-mono text-sm text-gold/70">{admin.id.substring(0, 8)}</div>
                <div className="col-span-2 font-medium">{admin.displayName || "N/A"}</div>
                <div className="col-span-3 text-gold/90">{admin.email}</div>
                <div className="col-span-2">
                  {admin.role === "superadmin" ? (
                    <Badge variant="outline" className="flex w-fit items-center gap-1 border-red-500/50 text-red-500">
                      <ShieldAlert className="h-3 w-3" />
                      Super Admin
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex w-fit items-center gap-1 border-gold/50 text-gold">
                      <Shield className="h-3 w-3" />
                      Admin
                    </Badge>
                  )}
                </div>
                <div className="col-span-2 text-gold/70">
                  {admin.lastLogin
                    ? format(
                        new Date(typeof admin.lastLogin === "string" ? admin.lastLogin : admin.lastLogin.toDate()),
                        "MMM d, yyyy",
                      )
                    : "Never"}
                </div>
                <div className="col-span-1">
                  {admin.status === "active" ? (
                    <Badge
                      variant="outline"
                      className="flex w-fit items-center gap-1 border-green-500/50 text-green-500"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex w-fit items-center gap-1 border-red-500/50 text-red-500">
                      <XCircle className="h-3 w-3" />
                      Inactive
                    </Badge>
                  )}
                </div>
                <div className="col-span-1 flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-charcoal border-gold/30 text-white">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gold/30" />
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => router.push(`/admin/admins/${admin.id}`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => toggleStatus(admin)}>
                        {admin.status === "active" ? (
                          <>
                            <XCircle className="mr-2 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gold/30" />
                      <DropdownMenuItem
                        className="cursor-pointer text-red-500 focus:text-red-500"
                        onClick={() => handleDeleteClick(admin)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-charcoal border-gold/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-gold">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {adminToDelete?.displayName || adminToDelete?.email}? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
