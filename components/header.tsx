"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
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
  const pathname = usePathname() || "" // Provide default empty string if pathname is undefined
  const { cart } = useCart()
  const { user, logout } = useAuth()
  const cartItemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0

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
        isScrolled ? "bg-black border-b border-gold/20 py-2" : "bg-black py-4",
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
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/customer" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "font-display",
                      pathname === "/customer" && "text-gold",
                    )}
                  >
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/customer/shop" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "font-display",
                      pathname === "/customer/shop" && "text-gold",
                    )}
                  >
                    Shop
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/customer/orders" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "font-display",
                      pathname === "/customer/orders" && "text-gold",
                    )}
                  >
                    Orders
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/customer/videos" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "font-display",
                      pathname === "/customer/videos" && "text-gold",
                    )}
                  >
                    Videos
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="font-display">About</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 w-[400px] grid-cols-2">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/customer/about"
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gold/10",
                            pathname === "/customer/about" ? "bg-gold/10 text-gold" : "text-offwhite/70",
                          )}
                        >
                          <div className="text-sm font-display font-medium">About Us</div>
                          <p className="line-clamp-2 text-sm leading-snug text-offwhite/70">
                            Learn about our story and mission
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/customer/authenticity"
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gold/10",
                            pathname === "/customer/authenticity" ? "bg-gold/10 text-gold" : "text-offwhite/70",
                          )}
                        >
                          <div className="text-sm font-display font-medium">Authenticity</div>
                          <p className="line-clamp-2 text-sm leading-snug text-offwhite/70">
                            Our authentication process
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/customer/faq"
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gold/10",
                            pathname === "/customer/faq" ? "bg-gold/10 text-gold" : "text-offwhite/70",
                          )}
                        >
                          <div className="text-sm font-display font-medium">FAQ</div>
                          <p className="line-clamp-2 text-sm leading-snug text-offwhite/70">
                            Frequently asked questions
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/customer/contact"
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gold/10",
                            pathname === "/customer/contact" ? "bg-gold/10 text-gold" : "text-offwhite/70",
                          )}
                        >
                          <div className="text-sm font-display font-medium">Contact</div>
                          <p className="line-clamp-2 text-sm leading-snug text-offwhite/70">Get in touch with us</p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/customer/auction" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "font-display",
                      pathname === "/customer/auction" && "text-gold",
                    )}
                  >
                    Auctions
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gold hover:text-gold-deep bg-transparent"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          <Button variant="ghost" size="icon" className="text-gold hover:text-gold-deep bg-transparent" asChild>
            <Link href="/customer/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gold text-jetblack text-xs">
                  {cartItemCount}
                </Badge>
              )}
              <span className="sr-only">Cart</span>
            </Link>
          </Button>

          {user ? (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="font-display">
                    <User className="h-5 w-5 mr-1" />
                    Account
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-3 p-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/customer/profile"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gold/10"
                          >
                            <div className="text-sm font-display font-medium">Profile</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <button
                          onClick={() => logout()}
                          className="w-full text-left block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-red-500/10 text-red-500"
                        >
                          <div className="text-sm font-display font-medium">Sign Out</div>
                        </button>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          ) : (
            <Button asChild variant="link" className="text-gold hover:text-gold-deep bg-transparent p-0 font-body">
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-2 md:hidden">
          <Button variant="ghost" size="icon" className="text-gold hover:text-gold-deep bg-transparent" asChild>
            <Link href="/customer/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gold text-jetblack text-xs">
                  {cartItemCount}
                </Badge>
              )}
              <span className="sr-only">Cart</span>
            </Link>
          </Button>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gold hover:text-gold-deep bg-transparent">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-jetblack border-l border-gold/20">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-display font-bold bg-gold-gradient bg-clip-text text-transparent">
                    Menu
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gold hover:text-gold-deep bg-transparent"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>

                <div className="space-y-4 flex-1">
                  <form onSubmit={handleSearch} className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-offwhite/50" />
                    <Input placeholder="Search..." className="pl-10 bg-charcoal border-gold/20 focus:border-gold" />
                  </form>

                  <div className="space-y-2">
                    <Link
                      href="/customer"
                      className={cn(
                        "block py-2 px-3 rounded-md font-display font-medium hover:bg-gold/10",
                        pathname === "/customer" ? "text-gold bg-gold/10" : "text-offwhite",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <Link
                      href="/customer/shop"
                      className={cn(
                        "block py-2 px-3 rounded-md font-display font-medium hover:bg-gold/10",
                        pathname === "/customer/shop" ? "text-gold bg-gold/10" : "text-offwhite",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Shop
                    </Link>
                    <Link
                      href="/customer/orders"
                      className={cn(
                        "block py-2 px-3 rounded-md font-display font-medium hover:bg-gold/10",
                        pathname === "/customer/orders" ? "text-gold bg-gold/10" : "text-offwhite",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Orders
                    </Link>
                    <Link
                      href="/customer/videos"
                      className={cn(
                        "block py-2 px-3 rounded-md font-display font-medium hover:bg-gold/10",
                        pathname === "/customer/videos" ? "text-gold bg-gold/10" : "text-offwhite",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Videos
                    </Link>
                    <Link
                      href="/customer/auction"
                      className={cn(
                        "block py-2 px-3 rounded-md font-display font-medium hover:bg-gold/10",
                        pathname === "/customer/auction" ? "text-gold bg-gold/10" : "text-offwhite",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Auctions
                    </Link>
                    <Link
                      href="/customer/about"
                      className={cn(
                        "block py-2 px-3 rounded-md font-display font-medium hover:bg-gold/10",
                        pathname === "/customer/about" ? "text-gold bg-gold/10" : "text-offwhite",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      About Us
                    </Link>
                    <Link
                      href="/customer/authenticity"
                      className={cn(
                        "block py-2 px-3 rounded-md font-display font-medium hover:bg-gold/10",
                        pathname === "/customer/authenticity" ? "text-gold bg-gold/10" : "text-offwhite",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Authenticity
                    </Link>
                    <Link
                      href="/customer/faq"
                      className={cn(
                        "block py-2 px-3 rounded-md font-display font-medium hover:bg-gold/10",
                        pathname === "/customer/faq" ? "text-gold bg-gold/10" : "text-offwhite",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      FAQ
                    </Link>
                    <Link
                      href="/customer/contact"
                      className={cn(
                        "block py-2 px-3 rounded-md font-display font-medium hover:bg-gold/10",
                        pathname === "/customer/contact" ? "text-gold bg-gold/10" : "text-offwhite",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Contact
                    </Link>
                  </div>
                </div>

                <div className="pt-4 border-t border-gold/20">
                  {user ? (
                    <div className="space-y-2">
                      <Link
                        href="/customer/profile"
                        className="block py-2 px-3 rounded-md font-display font-medium hover:bg-gold/10 text-offwhite"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout()
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full text-left block py-2 px-3 rounded-md font-display font-medium hover:bg-red-500/10 text-red-500"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <Button
                      asChild
                      className="w-full bg-transparent text-gold hover:text-gold-deep font-body"
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
          <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-20">
            <div className="w-full max-w-2xl px-4">
              <div className="relative">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-offwhite/50" />
                  <Input
                    placeholder="Search for products..."
                    className="pl-12 pr-12 py-6 text-lg bg-charcoal border-gold/20 focus:border-gold"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-gold hover:text-gold-deep bg-transparent"
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
