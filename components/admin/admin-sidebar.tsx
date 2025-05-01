"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LayoutDashboard,
  LogOut,
  FileText,
  ImageIcon,
  Tag,
  MessageSquare,
  Globe,
  Menu,
  X,
  Gavel,
  Video,
  FileVideo,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Desktop sidebar
  const DesktopSidebar = () => (
    <SidebarProvider>
      <Sidebar className="border-r border-gold/30">
        <SidebarHeader className="border-b border-gold/30 bg-charcoal">
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gold text-jetblack">
              <Package className="h-4 w-4" />
            </div>
            <div className="font-display text-xl font-bold text-gold">Admin Panel</div>
            <SidebarTrigger className="ml-auto" />
          </div>
        </SidebarHeader>

        <SidebarContent className="bg-charcoal">
          <SidebarGroup>
            <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/admin"} tooltip="Overview">
                    <Link href="/admin">
                      <LayoutDashboard className="h-4 w-4 text-gold" />
                      <span>Overview</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/analytics")} tooltip="Analytics">
                    <Link href="/admin/analytics">
                      <BarChart3 className="h-4 w-4 text-gold" />
                      <span>Analytics</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>E-commerce</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/products")} tooltip="Products">
                    <Link href="/admin/products">
                      <Package className="h-4 w-4 text-gold" />
                      <span>Products</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/categories")} tooltip="Categories">
                    <Link href="/admin/categories">
                      <Tag className="h-4 w-4 text-gold" />
                      <span>Categories</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/orders")} tooltip="Orders">
                    <Link href="/admin/orders">
                      <ShoppingCart className="h-4 w-4 text-gold" />
                      <span>Orders</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/auctions")} tooltip="Auctions">
                    <Link href="/admin/auctions">
                      <Gavel className="h-4 w-4 text-gold" />
                      <span>Auctions</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Videos</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/videos")} tooltip="Video Players">
                    <Link href="/admin/videos">
                      <Video className="h-4 w-4 text-gold" />
                      <span>Video Players</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/admin/video-orders")}
                    tooltip="Video Orders"
                  >
                    <Link href="/admin/video-orders">
                      <FileVideo className="h-4 w-4 text-gold" />
                      <span>Video Orders</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Content</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/banners")} tooltip="Banners">
                    <Link href="/admin/banners">
                      <ImageIcon className="h-4 w-4 text-gold" />
                      <span>Banners</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/pages")} tooltip="Pages">
                    <Link href="/admin/pages">
                      <FileText className="h-4 w-4 text-gold" />
                      <span>Pages</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/admin/testimonials")}
                    tooltip="Testimonials"
                  >
                    <Link href="/admin/testimonials">
                      <MessageSquare className="h-4 w-4 text-gold" />
                      <span>Testimonials</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Users</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/customers")} tooltip="Customers">
                    <Link href="/admin/customers">
                      <Users className="h-4 w-4 text-gold" />
                      <span>Customers</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/admins")} tooltip="Admins">
                    <Link href="/admin/admins">
                      <Users className="h-4 w-4 text-gold" />
                      <span>Admins</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/settings")} tooltip="Settings">
                    <Link href="/admin/settings">
                      <Settings className="h-4 w-4 text-gold" />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/admin/site-settings")}
                    tooltip="Site Settings"
                  >
                    <Link href="/admin/site-settings">
                      <Globe className="h-4 w-4 text-gold" />
                      <span>Site Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-gold/30 bg-charcoal">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={logout} tooltip="Logout">
                <LogOut className="h-4 w-4 text-gold" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  )

  // Mobile sidebar using Sheet component
  const MobileSidebar = () => (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-charcoal border-b border-gold/30 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gold text-jetblack">
            <Package className="h-4 w-4" />
          </div>
          <div className="font-display text-xl font-bold text-gold">Admin Panel</div>
        </div>

        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gold">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0 bg-charcoal border-r border-gold/30">
            <div className="flex items-center justify-between p-4 border-b border-gold/30">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gold text-jetblack">
                  <Package className="h-4 w-4" />
                </div>
                <div className="font-display text-xl font-bold text-gold">Admin Panel</div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="text-gold">
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="p-4 space-y-6">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gold/70">Dashboard</h3>
                <nav className="space-y-1">
                  <Link
                    href="/admin"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                      pathname === "/admin" ? "bg-gold/10 text-gold" : "text-offwhite hover:bg-gold/10 hover:text-gold"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Overview</span>
                  </Link>
                  <Link
                    href="/admin/analytics"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                      pathname.startsWith("/admin/analytics")
                        ? "bg-gold/10 text-gold"
                        : "text-offwhite hover:bg-gold/10 hover:text-gold"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Analytics</span>
                  </Link>
                </nav>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-gold/70">E-commerce</h3>
                <nav className="space-y-1">
                  <Link
                    href="/admin/products"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                      pathname.startsWith("/admin/products")
                        ? "bg-gold/10 text-gold"
                        : "text-offwhite hover:bg-gold/10 hover:text-gold"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Package className="h-4 w-4" />
                    <span>Products</span>
                  </Link>
                  <Link
                    href="/admin/categories"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                      pathname.startsWith("/admin/categories")
                        ? "bg-gold/10 text-gold"
                        : "text-offwhite hover:bg-gold/10 hover:text-gold"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Tag className="h-4 w-4" />
                    <span>Categories</span>
                  </Link>
                  <Link
                    href="/admin/orders"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                      pathname.startsWith("/admin/orders")
                        ? "bg-gold/10 text-gold"
                        : "text-offwhite hover:bg-gold/10 hover:text-gold"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Orders</span>
                  </Link>
                  <Link
                    href="/admin/auctions"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                      pathname.startsWith("/admin/auctions")
                        ? "bg-gold/10 text-gold"
                        : "text-offwhite hover:bg-gold/10 hover:text-gold"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Gavel className="h-4 w-4" />
                    <span>Auctions</span>
                  </Link>
                </nav>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-gold/70">Videos</h3>
                <nav className="space-y-1">
                  <Link
                    href="/admin/videos"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                      pathname.startsWith("/admin/videos")
                        ? "bg-gold/10 text-gold"
                        : "text-offwhite hover:bg-gold/10 hover:text-gold"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Video className="h-4 w-4" />
                    <span>Video Players</span>
                  </Link>
                  <Link
                    href="/admin/video-orders"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                      pathname.startsWith("/admin/video-orders")
                        ? "bg-gold/10 text-gold"
                        : "text-offwhite hover:bg-gold/10 hover:text-gold"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FileVideo className="h-4 w-4" />
                    <span>Video Orders</span>
                  </Link>
                </nav>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-gold/70">Content</h3>
                <nav className="space-y-1">
                  <Link
                    href="/admin/banners"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                      pathname.startsWith("/admin/banners")
                        ? "bg-gold/10 text-gold"
                        : "text-offwhite hover:bg-gold/10 hover:text-gold"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>Banners</span>
                  </Link>
                  <Link
                    href="/admin/pages"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                      pathname.startsWith("/admin/pages")
                        ? "bg-gold/10 text-gold"
                        : "text-offwhite hover:bg-gold/10 hover:text-gold"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Pages</span>
                  </Link>
                  <Link
                    href="/admin/testimonials"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                      pathname.startsWith("/admin/testimonials")
                        ? "bg-gold/10 text-gold"
                        : "text-offwhite hover:bg-gold/10 hover:text-gold"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Testimonials</span>
                  </Link>
                </nav>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-gold/70">Users</h3>
                <nav className="space-y-1">
                  <Link
                    href="/admin/customers"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                      pathname.startsWith("/admin/customers")
                        ? "bg-gold/10 text-gold"
                        : "text-offwhite hover:bg-gold/10 hover:text-gold"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Users className="h-4 w-4" />
                    <span>Customers</span>
                  </Link>
                  <Link
                    href="/admin/admins"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                      pathname.startsWith("/admin/admins")
                        ? "bg-gold/10 text-gold"
                        : "text-offwhite hover:bg-gold/10 hover:text-gold"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Users className="h-4 w-4" />
                    <span>Admins</span>
                  </Link>
                </nav>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-gold/70">System</h3>
                <nav className="space-y-1">
                  <Link
                    href="/admin/settings"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                      pathname.startsWith("/admin/settings")
                        ? "bg-gold/10 text-gold"
                        : "text-offwhite hover:bg-gold/10 hover:text-gold"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  <Link
                    href="/admin/site-settings"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                      pathname.startsWith("/admin/site-settings")
                        ? "bg-gold/10 text-gold"
                        : "text-offwhite hover:bg-gold/10 hover:text-gold"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Globe className="h-4 w-4" />
                    <span>Site Settings</span>
                  </Link>
                </nav>
              </div>

              <div className="pt-4 border-t border-gold/30">
                <button
                  onClick={() => {
                    logout()
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )

  // Update the admin layout to use the mobile sidebar
  return <>{isMobile ? <MobileSidebar /> : <DesktopSidebar />}</>
}
