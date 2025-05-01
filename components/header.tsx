"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingCart, User, Search, Menu, X, LogOut, Mail, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/components/cart-provider"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { items, itemCount } = useCart()
  const { user, logout } = useAuth()
  const router = useRouter()

  // Update the navigation links to point to the customer routes
  const navLinks = [
    { name: "Home", href: "/customer" },
    { name: "Shop", href: "/customer/shop" },
    { name: "Auctions", href: "/customer/auction" },
    { name: "Authenticity", href: "/customer/authenticity" },
    { name: "About Us", href: "/customer/about" },
    { name: "FAQ & Contact", href: "/customer/contact" },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/customer/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
    }
  }

  // Close search on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false)
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  const getInitials = (name: string) => {
    if (!name) return "UN"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gold/30 bg-jetblack backdrop-blur supports-[backdrop-filter]:bg-jetblack/90">
      <div className="container flex h-16 items-center">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-offwhite hover:text-gold">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-jetblack text-offwhite border-r border-gold/30">
            <nav className="flex flex-col gap-4 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-lg font-display font-semibold hover:text-gold transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="text-xl font-display font-bold text-gold">LEGENDARY SIGNATURES</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 mx-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium font-body transition-colors text-offwhite hover:text-gold"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center ml-auto space-x-4">
          {isSearchOpen ? (
            <form onSubmit={handleSearch} className="relative flex items-center">
              <Input
                type="search"
                placeholder="Search jerseys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px] lg:w-[300px] border-gold/50 bg-charcoal text-offwhite focus:border-gold"
                autoFocus
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute right-0 text-offwhite hover:text-gold"
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </form>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="text-offwhite hover:text-gold"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          {/* Update the cart link */}
          <Link href="/customer/cart">
            <Button variant="ghost" size="icon" className="relative text-offwhite hover:text-gold">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-gold-soft text-jetblack text-xs h-5 w-5 flex items-center justify-center rounded-full">
                  {itemCount}
                </Badge>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-offwhite hover:text-gold">
                {user?.photoURL ? (
                  <Avatar className="h-8 w-8">
                    <img src={user.photoURL || "/placeholder.svg"} alt={user.displayName || "User"} />
                  </Avatar>
                ) : (
                  <Avatar className="h-8 w-8 bg-gold/20 border border-gold/30">
                    <AvatarFallback className="text-gold">
                      {user?.displayName ? getInitials(user.displayName) : <User className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                )}
                <span className="sr-only">Profile</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-charcoal border-gold/30 w-64">
              <DropdownMenuLabel className="text-offwhite">
                {user ? `Hello, ${user.displayName || "User"}` : "Account"}
              </DropdownMenuLabel>

              {user && (
                <>
                  <DropdownMenuSeparator className="bg-gold/20" />
                  <div className="px-2 py-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-offwhite/80">
                      <Mail className="h-4 w-4 text-gold/70" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm text-offwhite/80">
                        <Phone className="h-4 w-4 text-gold/70" />
                        <span>{user.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              <DropdownMenuSeparator className="bg-gold/20" />

              {/* Update the profile link */}
              <DropdownMenuItem asChild className="text-offwhite hover:text-gold hover:bg-gold/10">
                <Link href="/customer/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gold/20" />
              <DropdownMenuItem className="text-red-500 focus:text-red-500 hover:bg-red-500/10" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
