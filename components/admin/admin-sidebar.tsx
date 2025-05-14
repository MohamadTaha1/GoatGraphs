"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Settings,
  Package,
  Layers,
  ImageIcon,
  MessageSquare,
  Gavel,
  FileText,
  Database,
  UserCog,
  Video,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase/auth"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AdminSidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <div className={cn("pb-12 border-r border-gold/20 flex flex-col h-screen", className)}>
      <div className="space-y-4 py-4 flex-1 flex flex-col min-h-0">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h2 className="text-xl font-semibold tracking-tight bg-gold-gradient bg-clip-text text-transparent">
                Admin Panel
              </h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 text-gold"
            >
              {isCollapsed ? "→" : "←"}
            </Button>
          </div>
        </div>
        <ScrollArea className="px-1 flex-1">
          <div className="space-y-1 p-2">
            <Link href="/admin" passHref>
              <Button
                variant={isActive("/admin") && !isActive("/admin/") ? "secondary" : "ghost"}
                size={isCollapsed ? "icon" : "default"}
                className={cn(
                  "w-full justify-start",
                  isActive("/admin") && !isActive("/admin/") && "bg-gold/10 text-gold hover:bg-gold/20 hover:text-gold",
                )}
              >
                <LayoutDashboard className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />
                {!isCollapsed && <span>Dashboard</span>}
              </Button>
            </Link>
            <Link href="/admin/products" passHref>
              <Button
                variant={isActive("/admin/products") ? "secondary" : "ghost"}
                size={isCollapsed ? "icon" : "default"}
                className={cn(
                  "w-full justify-start",
                  isActive("/admin/products") && "bg-gold/10 text-gold hover:bg-gold/20 hover:text-gold",
                )}
              >
                <ShoppingBag className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />
                {!isCollapsed && <span>Products</span>}
              </Button>
            </Link>
            <Link href="/admin/orders" passHref>
              <Button
                variant={isActive("/admin/orders") ? "secondary" : "ghost"}
                size={isCollapsed ? "icon" : "default"}
                className={cn(
                  "w-full justify-start",
                  isActive("/admin/orders") && "bg-gold/10 text-gold hover:bg-gold/20 hover:text-gold",
                )}
              >
                <Package className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />
                {!isCollapsed && <span>Orders</span>}
              </Button>
            </Link>
            <Link href="/admin/customers" passHref>
              <Button
                variant={isActive("/admin/customers") ? "secondary" : "ghost"}
                size={isCollapsed ? "icon" : "default"}
                className={cn(
                  "w-full justify-start",
                  isActive("/admin/customers") && "bg-gold/10 text-gold hover:bg-gold/20 hover:text-gold",
                )}
              >
                <Users className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />
                {!isCollapsed && <span>Customers</span>}
              </Button>
            </Link>
            <Link href="/admin/videos" passHref>
              <Button
                variant={isActive("/admin/videos") ? "secondary" : "ghost"}
                size={isCollapsed ? "icon" : "default"}
                className={cn(
                  "w-full justify-start",
                  isActive("/admin/videos") && "bg-gold/10 text-gold hover:bg-gold/20 hover:text-gold",
                )}
              >
                <Video className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />
                {!isCollapsed && <span>Videos</span>}
              </Button>
            </Link>
            <Link href="/admin/auctions" passHref>
              <Button
                variant={isActive("/admin/auctions") ? "secondary" : "ghost"}
                size={isCollapsed ? "icon" : "default"}
                className={cn(
                  "w-full justify-start",
                  isActive("/admin/auctions") && "bg-gold/10 text-gold hover:bg-gold/20 hover:text-gold",
                )}
              >
                <Gavel className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />
                {!isCollapsed && <span>Auctions</span>}
              </Button>
            </Link>
            <Link href="/admin/categories" passHref>
              <Button
                variant={isActive("/admin/categories") ? "secondary" : "ghost"}
                size={isCollapsed ? "icon" : "default"}
                className={cn(
                  "w-full justify-start",
                  isActive("/admin/categories") && "bg-gold/10 text-gold hover:bg-gold/20 hover:text-gold",
                )}
              >
                <Layers className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />
                {!isCollapsed && <span>Categories</span>}
              </Button>
            </Link>
            <Link href="/admin/banners" passHref>
              <Button
                variant={isActive("/admin/banners") ? "secondary" : "ghost"}
                size={isCollapsed ? "icon" : "default"}
                className={cn(
                  "w-full justify-start",
                  isActive("/admin/banners") && "bg-gold/10 text-gold hover:bg-gold/20 hover:text-gold",
                )}
              >
                <ImageIcon className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />
                {!isCollapsed && <span>Banners</span>}
              </Button>
            </Link>
            <Link href="/admin/testimonials" passHref>
              <Button
                variant={isActive("/admin/testimonials") ? "secondary" : "ghost"}
                size={isCollapsed ? "icon" : "default"}
                className={cn(
                  "w-full justify-start",
                  isActive("/admin/testimonials") && "bg-gold/10 text-gold hover:bg-gold/20 hover:text-gold",
                )}
              >
                <MessageSquare className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />
                {!isCollapsed && <span>Testimonials</span>}
              </Button>
            </Link>
            <Link href="/admin/admins" passHref>
              <Button
                variant={isActive("/admin/admins") ? "secondary" : "ghost"}
                size={isCollapsed ? "icon" : "default"}
                className={cn(
                  "w-full justify-start",
                  isActive("/admin/admins") && "bg-gold/10 text-gold hover:bg-gold/20 hover:text-gold",
                )}
              >
                <UserCog className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />
                {!isCollapsed && <span>Admin Users</span>}
              </Button>
            </Link>
            <Link href="/admin/site-settings" passHref>
              <Button
                variant={isActive("/admin/site-settings") ? "secondary" : "ghost"}
                size={isCollapsed ? "icon" : "default"}
                className={cn(
                  "w-full justify-start",
                  isActive("/admin/site-settings") && "bg-gold/10 text-gold hover:bg-gold/20 hover:text-gold",
                )}
              >
                <Settings className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />
                {!isCollapsed && <span>Site Settings</span>}
              </Button>
            </Link>
            <Link href="/admin/diagnostics" passHref>
              <Button
                variant={isActive("/admin/diagnostics") ? "secondary" : "ghost"}
                size={isCollapsed ? "icon" : "default"}
                className={cn(
                  "w-full justify-start",
                  isActive("/admin/diagnostics") && "bg-gold/10 text-gold hover:bg-gold/20 hover:text-gold",
                )}
              >
                <Database className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />
                {!isCollapsed && <span>Diagnostics</span>}
              </Button>
            </Link>
            <Link href="/admin/seed-data" passHref>
              <Button
                variant={isActive("/admin/seed-data") ? "secondary" : "ghost"}
                size={isCollapsed ? "icon" : "default"}
                className={cn(
                  "w-full justify-start",
                  isActive("/admin/seed-data") && "bg-gold/10 text-gold hover:bg-gold/20 hover:text-gold",
                )}
              >
                <FileText className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />
                {!isCollapsed && <span>Seed Data</span>}
              </Button>
            </Link>
          </div>
        </ScrollArea>
        <div className="mt-auto p-2">
          <Button
            onClick={handleLogout}
            variant="ghost"
            size={isCollapsed ? "icon" : "default"}
            className={cn("w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100/10")}
          >
            <LogOut className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  )
}
