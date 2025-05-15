"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
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
  Tag,
  ChevronDown,
  ChevronRight,
  BarChart4,
  CreditCard,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean
  onClose?: () => void
}

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  href: string
  isActive: boolean
  isCollapsed: boolean
}

interface SidebarGroupProps {
  icon: React.ReactNode
  label: string
  isCollapsed: boolean
  defaultOpen?: boolean
  children: React.ReactNode
}

function SidebarItem({ icon, label, href, isActive, isCollapsed }: SidebarItemProps) {
  return (
    <Link href={href} passHref>
      <Button
        variant="ghost"
        size={isCollapsed ? "icon" : "default"}
        className={cn(
          "w-full justify-start",
          isActive && "bg-gold/10 text-gold hover:bg-gold/20 hover:text-gold",
          !isActive && "text-offwhite/70 hover:text-offwhite hover:bg-charcoal/50",
        )}
      >
        {icon}
        {!isCollapsed && <span>{label}</span>}
      </Button>
    </Link>
  )
}

function SidebarGroup({ icon, label, isCollapsed, defaultOpen = false, children }: SidebarGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // If sidebar is collapsed, always close the group
  useEffect(() => {
    if (isCollapsed) {
      setIsOpen(false)
    }
  }, [isCollapsed])

  if (isCollapsed) {
    return (
      <div className="px-2 py-1">
        <Button variant="ghost" size="icon" className="w-full justify-center text-offwhite/70 hover:text-offwhite">
          {icon}
        </Button>
        <div className="mt-1 space-y-1">{children}</div>
      </div>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="px-2 py-1">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="default"
          className="w-full justify-between text-offwhite/70 hover:text-offwhite hover:bg-charcoal/50"
        >
          <div className="flex items-center">
            {icon}
            <span>{label}</span>
          </div>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1 space-y-1 pl-6">{children}</CollapsibleContent>
    </Collapsible>
  )
}

export function AdminSidebar({ className, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  // Responsive handling
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768
  const sidebarWidth = isCollapsed ? "w-16" : "w-64"

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && <div className="fixed inset-0 z-40 bg-black/80 md:hidden" onClick={onClose}></div>}

      <aside
        className={cn(
          "fixed top-0 bottom-0 z-50 flex flex-col border-r border-gold/20 bg-charcoal transition-all duration-300 md:relative md:z-0",
          sidebarWidth,
          isMobile ? (isOpen ? "left-0" : "-left-full") : "left-0",
          className,
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-gold/20 px-4">
          <div className="flex items-center">
            <div className="mr-2 rounded-md bg-gold p-1">
              <ShoppingBag className="h-6 w-6 text-jetblack" />
            </div>
            {!isCollapsed && (
              <h2 className="text-xl font-semibold tracking-tight bg-gold-gradient bg-clip-text text-transparent">
                Authentic Admin
              </h2>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 text-gold"
          >
            {isCollapsed ? "→" : "←"}
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-2 py-4">
            <div className="px-3 py-1">
              <h3 className={cn("mb-1 text-xs font-semibold text-offwhite/50", isCollapsed && "text-center")}>
                {isCollapsed ? "MAIN" : "MAIN NAVIGATION"}
              </h3>
              <div className="space-y-1">
                <SidebarItem
                  icon={<LayoutDashboard className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />}
                  label="Dashboard"
                  href="/admin"
                  isActive={isActive("/admin") && !isActive("/admin/")}
                  isCollapsed={isCollapsed}
                />
                <SidebarItem
                  icon={<BarChart4 className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />}
                  label="Analytics"
                  href="/admin/analytics"
                  isActive={isActive("/admin/analytics")}
                  isCollapsed={isCollapsed}
                />
              </div>
            </div>

            <div className="px-3 py-1">
              <h3 className={cn("mb-1 text-xs font-semibold text-offwhite/50", isCollapsed && "text-center")}>
                {isCollapsed ? "SHOP" : "SHOP MANAGEMENT"}
              </h3>
              <div className="space-y-1">
                <SidebarItem
                  icon={<ShoppingBag className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />}
                  label="Products"
                  href="/admin/products"
                  isActive={isActive("/admin/products")}
                  isCollapsed={isCollapsed}
                />
                <SidebarItem
                  icon={<Layers className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />}
                  label="Categories"
                  href="/admin/categories"
                  isActive={isActive("/admin/categories")}
                  isCollapsed={isCollapsed}
                />
                <SidebarItem
                  icon={<Tag className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />}
                  label="Promo Codes"
                  href="/admin/promo-codes"
                  isActive={isActive("/admin/promo-codes")}
                  isCollapsed={isCollapsed}
                />
                <SidebarItem
                  icon={<Gavel className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />}
                  label="Auctions"
                  href="/admin/auctions"
                  isActive={isActive("/admin/auctions")}
                  isCollapsed={isCollapsed}
                />
              </div>
            </div>

            <div className="px-3 py-1">
              <h3 className={cn("mb-1 text-xs font-semibold text-offwhite/50", isCollapsed && "text-center")}>
                {isCollapsed ? "SALES" : "SALES & CUSTOMERS"}
              </h3>
              <div className="space-y-1">
                <SidebarItem
                  icon={<Package className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />}
                  label="Orders"
                  href="/admin/orders"
                  isActive={isActive("/admin/orders")}
                  isCollapsed={isCollapsed}
                />
                <SidebarItem
                  icon={<Users className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />}
                  label="Customers"
                  href="/admin/customers"
                  isActive={isActive("/admin/customers")}
                  isCollapsed={isCollapsed}
                />
                <SidebarItem
                  icon={<CreditCard className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />}
                  label="Transactions"
                  href="/admin/transactions"
                  isActive={isActive("/admin/transactions")}
                  isCollapsed={isCollapsed}
                />
              </div>
            </div>

            <div className="px-3 py-1">
              <h3 className={cn("mb-1 text-xs font-semibold text-offwhite/50", isCollapsed && "text-center")}>
                {isCollapsed ? "CONT" : "CONTENT"}
              </h3>
              <div className="space-y-1">
                <SidebarItem
                  icon={<Video className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />}
                  label="Videos"
                  href="/admin/videos"
                  isActive={isActive("/admin/videos")}
                  isCollapsed={isCollapsed}
                />
                <SidebarItem
                  icon={<ImageIcon className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />}
                  label="Banners"
                  href="/admin/banners"
                  isActive={isActive("/admin/banners")}
                  isCollapsed={isCollapsed}
                />
                <SidebarItem
                  icon={<MessageSquare className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />}
                  label="Testimonials"
                  href="/admin/testimonials"
                  isActive={isActive("/admin/testimonials")}
                  isCollapsed={isCollapsed}
                />
              </div>
            </div>

            <div className="px-3 py-1">
              <h3 className={cn("mb-1 text-xs font-semibold text-offwhite/50", isCollapsed && "text-center")}>
                {isCollapsed ? "SYS" : "SYSTEM"}
              </h3>
              <div className="space-y-1">
                <SidebarItem
                  icon={<UserCog className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />}
                  label="Admin Users"
                  href="/admin/admins"
                  isActive={isActive("/admin/admins")}
                  isCollapsed={isCollapsed}
                />
                <SidebarItem
                  icon={<Settings className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />}
                  label="Site Settings"
                  href="/admin/site-settings"
                  isActive={isActive("/admin/site-settings")}
                  isCollapsed={isCollapsed}
                />
                <SidebarItem
                  icon={<Database className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />}
                  label="Diagnostics"
                  href="/admin/diagnostics"
                  isActive={isActive("/admin/diagnostics")}
                  isCollapsed={isCollapsed}
                />
                <SidebarItem
                  icon={<FileText className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />}
                  label="Seed Data"
                  href="/admin/seed-data"
                  isActive={isActive("/admin/seed-data")}
                  isCollapsed={isCollapsed}
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="border-t border-gold/20 p-4">
          <div className={cn("flex items-center", isCollapsed && "justify-center")}>
            <div className="relative h-8 w-8 rounded-full bg-gold/20">
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gold">
                {new Date().getFullYear()}
              </span>
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <p className="text-xs text-offwhite/70">Authentic Memorabilia</p>
                <p className="text-xs font-medium text-gold">Admin v1.0</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
