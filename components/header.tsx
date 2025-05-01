"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Menu, Search, ShoppingCart, User, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "./cart-provider"
import { useAuth } from "@/contexts/auth-context"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const pathname = usePathname()
  const { items } = useCart()
  const { user, logout } = useAuth()
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search logic
    setIsSearchOpen(false)
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-black border-b border-gold/30 py-2" : "bg-black py-4",
      )}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link href="/customer" className="flex items-center">
          <span className="text-2xl font-display font-bold bg-gold-gradient bg-clip-text text-transparent">
            Legendary Signatures
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          <nav className="flex items-center space-x-1">
            <Link
              href="/customer"
              className={cn(
                "px-4 py-2 font-display font-medium transition-colors",
                pathname === "/customer" ? "text-gold border-b-2 border-gold" : "text-offwhite hover:text-gold",
              )}
            >
              Home
            </Link>
            <Link
              href="/customer/shop"
              className={cn(
                "px-4 py-2 font-display font-medium transition-colors",
                pathname === "/customer/shop" ? "text-gold border-b-2 border-gold" : "text-offwhite hover:text-gold",
              )}
            >
              Shop
            </Link>
            <Link
              href="/customer/orders"
              className={cn(
                "px-4 py-2 font-display font-medium transition-colors",
                pathname === "/customer/orders" ? "text-gold border-b-2 border-gold" : "text-offwhite hover:text-gold",
              )}
            >
              Orders
            </Link>
            <Link
              href="/customer/videos"
              className={cn(
                "px-4 py-2 font-display font-medium transition-colors",
                pathname === "/customer/videos" ? "text-gold border-b-2 border-gold" : "text-offwhite hover:text-gold",
              )}
            >
              Videos
            </Link>
            <Link
              href="/customer/auction"
              className={cn(
                "px-4 py-2 font-display font-medium transition-colors",
                pathname === "/customer/auction" ? "text-gold border-b-2 border-gold" : "text-offwhite hover:text-gold",
              )}
            >
              Auctions
            </Link>
            <Link
              href="/customer/about"
              className={cn(
                "px-4 py-2 font-display font-medium transition-colors",
                pathname === "/customer/about" ? "text-gold border-b-2 border-gold" : "text-offwhite hover:text-gold",
              )}
            >
              About
            </Link>
            <Link
              href="/customer/authenticity"
              className={cn(
                "px-4 py-2 font-display font-medium transition-colors",
                pathname === "/customer/authenticity"
                  ? "text-gold border-b-2 border-gold"
                  : "text-offwhite hover:text-gold",
              )}
            >
              Authenticity
            </Link>
            <Link
              href="/customer/contact"
              className={cn(
                "px-4 py-2 font-display font-medium transition-colors",
                pathname === "/customer/contact" ? "text-gold border-b-2 border-gold" : "text-offwhite hover:text-gold",
              )}
            >
              Contact
            </Link>
          </nav>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-gold hover:bg-gold/10 bg-transparent rounded-full"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-gold hover:bg-gold/10 bg-transparent rounded-full relative"
            asChild
          >
            <Link href="/customer/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gold text-black text-xs rounded-full">
                  {cartItemCount}
                </Badge>
              )}
              <span className="sr-only">Cart</span>
            </Link>
          </Button>

          {user ? (
            <div className="relative group">
              <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-black">
                <User className="h-4 w-4 mr-2" />
                Account
              </Button>
              <div className="absolute right-0 mt-2 w-48 bg-black border border-gold/30 rounded-md shadow-lg overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="py-1">
                  <Link
                    href="/customer/profile"
                    className="block px-4 py-2 text-sm text-offwhite hover:bg-gold/10 hover:text-gold"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/customer/orders"
                    className="block px-4 py-2 text-sm text-offwhite hover:bg-gold/10 hover:text-gold"
                  >
                    Orders
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold hover:text-black">
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="text-gold hover:bg-gold/10 bg-transparent rounded-full relative"
            asChild
          >
            <Link href="/customer/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gold text-black text-xs rounded-full">
                  {cartItemCount}
                </Badge>
              )}
              <span className="sr-only">Cart</span>
            </Link>
          </Button>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gold hover:bg-gold/10 bg-transparent rounded-full">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-black border-l border-gold/30 p-0">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-4 border-b border-gold/30">
                  <span className="text-xl font-display font-bold bg-gold-gradient bg-clip-text text-transparent">
                    Legendary Signatures
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gold hover:bg-gold/10 bg-transparent rounded-full"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>

                <div className="p-4 space-y-4 flex-1">
                  <form onSubmit={handleSearch} className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-offwhite/50" />
                    <Input placeholder="Search..." className="pl-10 bg-transparent border-gold/30 focus:border-gold" />
                  </form>

                  <div className="space-y-1">
                    <Link
                      href="/customer"
                      className={cn(
                        "block py-2 px-3 rounded-md font-display font-medium",
                        pathname === "/customer"
                          ? "bg-gold text-black"
                          : "text-offwhite hover:bg-gold/10 hover:text-gold",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <Link
                      href="/customer/shop"
                      className={cn(
                        "block py-2 px-3 rounded-md font-display font-medium",
                        pathname === "/customer/shop"
                          ? "bg-gold text-black"
                          : "text-offwhite hover:bg-gold/10 hover:text-gold",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Shop
                    </Link>
                    <Link
                      href="/customer/orders"
                      className={cn(
                        "block py-2 px-3 rounded-md font-display font-medium",
                        pathname === "/customer/orders"
                          ? "bg-gold text-black"
                          : "text-offwhite hover:bg-gold/10 hover:text-gold",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Orders
                    </Link>
                    <Link
                      href="/customer/videos"
                      className={cn(
                        "block py-2 px-3 rounded-md font-display font-medium",
                        pathname === "/customer/videos"
                          ? "bg-gold text-black"
                          : "text-offwhite hover:bg-gold/10 hover:text-gold",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Videos
                    </Link>
                    <Link
                      href="/customer/auction"
                      className={cn(
                        "block py-2 px-3 rounded-md font-display font-medium",
                        pathname === "/customer/auction"
                          ? "bg-gold text-black"
                          : "text-offwhite hover:bg-gold/10 hover:text-gold",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Auctions
                    </Link>
                    <Link
                      href="/customer/about"
                      className={cn(
                        "block py-2 px-3 rounded-md font-display font-medium",
                        pathname === "/customer/about"
                          ? "bg-gold text-black"
                          : "text-offwhite hover:bg-gold/10 hover:text-gold",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      About Us
                    </Link>
                    <Link
                      href="/customer/authenticity"
                      className={cn(
                        "block py-2 px-3 rounded-md font-display font-medium",
                        pathname === "/customer/authenticity"
                          ? "bg-gold text-black"
                          : "text-offwhite hover:bg-gold/10 hover:text-gold",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Authenticity
                    </Link>
                    <Link
                      href="/customer/contact"
                      className={cn(
                        "block py-2 px-3 rounded-md font-display font-medium",
                        pathname === "/customer/contact"
                          ? "bg-gold text-black"
                          : "text-offwhite hover:bg-gold/10 hover:text-gold",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Contact
                    </Link>
                  </div>
                </div>

                <div className="p-4 border-t border-gold/30">
                  {user ? (
                    <div className="space-y-1">
                      <Link
                        href="/customer/profile"
                        className="block py-2 px-3 rounded-md font-display font-medium text-offwhite hover:bg-gold/10 hover:text-gold"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout()
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full text-left block py-2 px-3 rounded-md font-display font-medium text-red-500 hover:bg-red-500/10"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <Button
                      asChild
                      className="w-full bg-gold text-black hover:bg-gold-deep"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link href="/login">Sign In</Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Search Overlay */}
        {isSearchOpen && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-start justify-center pt-20">
            <div className="w-full max-w-2xl px-4">
              <div className="relative">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-offwhite/50" />
                  <Input
                    placeholder="Search for products..."
                    className="pl-12 pr-12 py-6 text-lg bg-transparent border-gold/30 focus:border-gold"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gold hover:bg-gold/10 bg-transparent rounded-full"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
