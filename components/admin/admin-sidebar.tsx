"use client"

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
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
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
                <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/testimonials")} tooltip="Testimonials">
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
  )
}
