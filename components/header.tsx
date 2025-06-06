"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  ShoppingBag,
  Settings,
  Users,
  Package,
  LayoutDashboard,
  Film,
  Shield,
  Home,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "./cart-provider"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout, isGuest } = useAuth()
  const { itemCount = 0 } = useCart()

  // Handle scroll event to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Add this new useEffect after the existing useEffect hooks
  useEffect(() => {
    if (isMobileMenuOpen) {
      // Disable scrolling on body when menu is open
      document.body.style.overflow = "hidden"
    } else {
      // Re-enable scrolling when menu is closed
      document.body.style.overflow = ""
    }

    // Cleanup function to ensure scrolling is re-enabled when component unmounts
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileMenuOpen])

  // Determine if the current path is active
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/"
    }
    return pathname?.startsWith(path)
  }

  // Determine if we're on an admin page
  const isAdminPage = pathname?.startsWith("/admin")

  // Determine if we're on a customer page
  const isCustomerPage = pathname?.startsWith("/customer")

  // Determine the base path for navigation
  const basePath = isAdminPage ? "/admin" : isCustomerPage ? "/customer" : ""

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-black shadow-lg" : "bg-black bg-opacity-80"
        }`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href={user ? (user.role === "admin" ? "/admin" : "/customer") : "/"} className="flex items-center">
              <span className="text-2xl font-display font-bold bg-gold-gradient bg-clip-text text-transparent">
                Goat Graphs
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {isAdminPage ? (
                // Admin Navigation
                <>
                  <Link
                    href="/admin"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === "/admin" ? "bg-gold/10 text-gold" : "text-gold/70 hover:text-gold hover:bg-gold/10"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/products"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/admin/products")
                        ? "bg-gold/10 text-gold"
                        : "text-gold/70 hover:text-gold hover:bg-gold/10"
                    }`}
                  >
                    Products
                  </Link>
                  <Link
                    href="/admin/orders"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/admin/orders")
                        ? "bg-gold/10 text-gold"
                        : "text-gold/70 hover:text-gold hover:bg-gold/10"
                    }`}
                  >
                    Orders
                  </Link>
                  <Link
                    href="/admin/customers"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/admin/customers")
                        ? "bg-gold/10 text-gold"
                        : "text-gold/70 hover:text-gold hover:bg-gold/10"
                    }`}
                  >
                    Customers
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="px-3 py-2 rounded-md text-sm font-medium text-gold/70 hover:text-gold hover:bg-gold/10"
                      >
                        More <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-black border-gold/30">
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin/banners"
                          className="flex items-center cursor-pointer text-gold/70 hover:text-gold hover:bg-gold/10"
                        >
                          Banners
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin/testimonials"
                          className="flex items-center cursor-pointer text-gold/70 hover:text-gold hover:bg-gold/10"
                        >
                          Testimonials
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin/categories"
                          className="flex items-center cursor-pointer text-gold/70 hover:text-gold hover:bg-gold/10"
                        >
                          Categories
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin/admins"
                          className="flex items-center cursor-pointer text-gold/70 hover:text-gold hover:bg-gold/10"
                        >
                          Admins
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin/site-settings"
                          className="flex items-center cursor-pointer text-gold/70 hover:text-gold hover:bg-gold/10"
                        >
                          Site Settings
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                // Customer Navigation
                <>
                  <Link
                    href={`${basePath}/`}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === "/" || pathname === "/customer"
                        ? "bg-gold/10 text-gold"
                        : "text-gold/70 hover:text-gold hover:bg-gold/10"
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    href={`${basePath}/shop`}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(`${basePath}/shop`)
                        ? "bg-gold/10 text-gold"
                        : "text-gold/70 hover:text-gold hover:bg-gold/10"
                    }`}
                  >
                    Shop
                  </Link>
                  <Link
                    href={`${basePath}/videos`}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(`${basePath}/videos`)
                        ? "bg-gold/10 text-gold"
                        : "text-gold/70 hover:text-gold hover:bg-gold/10"
                    }`}
                  >
                    Videos
                  </Link>
                  <Link
                    href={`${basePath}/orders`}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(`${basePath}/orders`)
                        ? "bg-gold/10 text-gold"
                        : "text-gold/70 hover:text-gold hover:bg-gold/10"
                    }`}
                  >
                    Orders
                  </Link>
                  <Link
                    href={`${basePath}/about`}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(`${basePath}/about`)
                        ? "bg-gold/10 text-gold"
                        : "text-gold/70 hover:text-gold hover:bg-gold/10"
                    }`}
                  >
                    About
                  </Link>
                </>
              )}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-2">
              {/* Cart button - show for everyone */}
              <Link href={`${basePath}/cart`}>
                <Button variant="ghost" size="icon" className="text-gold/70 hover:text-gold hover:bg-gold/10 relative">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gold text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* User dropdown or login/register buttons */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gold/70 hover:text-gold hover:bg-gold/10">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-black border-gold/30">
                    <div className="px-2 py-1.5 text-sm font-medium text-gold">
                      {isGuest ? "Guest User" : user.displayName || user.email}
                    </div>
                    <DropdownMenuSeparator className="bg-gold/20" />
                    {user.role === "admin" || user.role === "superadmin" ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/admin"
                            className="flex items-center cursor-pointer text-gold/70 hover:text-gold hover:bg-gold/10"
                          >
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/admin/products"
                            className="flex items-center cursor-pointer text-gold/70 hover:text-gold hover:bg-gold/10"
                          >
                            <Package className="mr-2 h-4 w-4" />
                            Products
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/admin/orders"
                            className="flex items-center cursor-pointer text-gold/70 hover:text-gold hover:bg-gold/10"
                          >
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            Orders
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/admin/customers"
                            className="flex items-center cursor-pointer text-gold/70 hover:text-gold hover:bg-gold/10"
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Customers
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/admin/site-settings"
                            className="flex items-center cursor-pointer text-gold/70 hover:text-gold hover:bg-gold/10"
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/customer"
                            className="flex items-center cursor-pointer text-gold/70 hover:text-gold hover:bg-gold/10"
                          >
                            <Home className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/customer/orders"
                            className="flex items-center cursor-pointer text-gold/70 hover:text-gold hover:bg-gold/10"
                          >
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            Orders
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-gold/20" />
                    {/* Only show logout for non-guest users */}
                    {!isGuest && (
                      <DropdownMenuItem
                        onClick={() => logout()}
                        className="flex items-center cursor-pointer text-gold/70 hover:text-gold hover:bg-gold/10"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    )}
                    {/* Show sign in option for guest users */}
                    {isGuest && (
                      <DropdownMenuItem
                        asChild
                        className="flex items-center cursor-pointer text-gold/70 hover:text-gold hover:bg-gold/10"
                      >
                        <Link href="/login">
                          <User className="mr-2 h-4 w-4" />
                          Sign In
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" className="text-gold/70 hover:text-gold hover:bg-gold/10" asChild>
                    <Link href="/login">
                      <User className="mr-2 h-4 w-4" />
                      Login
                    </Link>
                  </Button>
                  <Button className="bg-gold text-black hover:bg-gold/80" asChild>
                    <Link href="/register">Register</Link>
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gold/70 hover:text-gold hover:bg-gold/10"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-display font-bold bg-gold-gradient bg-clip-text text-transparent">
                Goat Graphs
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-gold/70 hover:text-gold hover:bg-gold/10"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="container mx-auto px-4 py-6 space-y-4">
              {isAdminPage ? (
                // Admin Mobile Navigation
                <>
                  <Link
                    href="/admin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gold/70 hover:text-gold hover:bg-gold/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <LayoutDashboard className="mr-2 h-5 w-5" />
                      Dashboard
                    </div>
                  </Link>
                  <Link
                    href="/admin/products"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gold/70 hover:text-gold hover:bg-gold/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Package className="mr-2 h-5 w-5" />
                      Products
                    </div>
                  </Link>
                  <Link
                    href="/admin/orders"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gold/70 hover:text-gold hover:bg-gold/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Orders
                    </div>
                  </Link>
                  <Link
                    href="/admin/customers"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gold/70 hover:text-gold hover:bg-gold/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Customers
                    </div>
                  </Link>
                  <Link
                    href="/admin/banners"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gold/70 hover:text-gold hover:bg-gold/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Film className="mr-2 h-5 w-5" />
                      Banners
                    </div>
                  </Link>
                  <Link
                    href="/admin/testimonials"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gold/70 hover:text-gold hover:bg-gold/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Testimonials
                    </div>
                  </Link>
                  <Link
                    href="/admin/categories"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gold/70 hover:text-gold hover:bg-gold/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Package className="mr-2 h-5 w-5" />
                      Categories
                    </div>
                  </Link>
                  <Link
                    href="/admin/admins"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gold/70 hover:text-gold hover:bg-gold/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Shield className="mr-2 h-5 w-5" />
                      Admins
                    </div>
                  </Link>
                  <Link
                    href="/admin/site-settings"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gold/70 hover:text-gold hover:bg-gold/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Settings className="mr-2 h-5 w-5" />
                      Site Settings
                    </div>
                  </Link>
                </>
              ) : (
                // Customer Mobile Navigation
                <>
                  <Link
                    href={`${basePath}/`}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gold/70 hover:text-gold hover:bg-gold/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Home className="mr-2 h-5 w-5" />
                      Home
                    </div>
                  </Link>
                  <Link
                    href={`${basePath}/shop`}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gold/70 hover:text-gold hover:bg-gold/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Shop
                    </div>
                  </Link>
                  <Link
                    href={`${basePath}/videos`}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gold/70 hover:text-gold hover:bg-gold/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Film className="mr-2 h-5 w-5" />
                      Videos
                    </div>
                  </Link>
                  <Link
                    href={`${basePath}/orders`}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gold/70 hover:text-gold hover:bg-gold/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Package className="mr-2 h-5 w-5" />
                      Orders
                    </div>
                  </Link>
                  <Link
                    href={`${basePath}/about`}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gold/70 hover:text-gold hover:bg-gold/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      About
                    </div>
                  </Link>
                  <Link
                    href={`${basePath}/authenticity`}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gold/70 hover:text-gold hover:bg-gold/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Shield className="mr-2 h-5 w-5" />
                      Authenticity
                    </div>
                  </Link>
                  <Link
                    href={`${basePath}/cart`}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gold/70 hover:text-gold hover:bg-gold/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Cart
                      {itemCount > 0 && (
                        <span className="ml-2 bg-gold text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {itemCount}
                        </span>
                      )}
                    </div>
                  </Link>
                </>
              )}

              {/* User section in mobile menu */}
              {user ? (
                <>
                  <div className="border-t border-gold/20 pt-4 mt-4">
                    <div className="px-3 py-2 text-sm font-medium text-gold">
                      {isGuest ? "Guest User" : user.displayName || user.email}
                    </div>
                    {/* Only show logout for non-guest users */}
                    {!isGuest && (
                      <button
                        onClick={() => {
                          logout()
                          setIsMobileMenuOpen(false)
                        }}
                        className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gold/70 hover:text-gold hover:bg-gold/10"
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        Logout
                      </button>
                    )}
                    {/* Show sign in option for guest users */}
                    {isGuest && (
                      <Link
                        href="/login"
                        className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gold/70 hover:text-gold hover:bg-gold/10"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="mr-2 h-5 w-5" />
                        Sign In
                      </Link>
                    )}
                  </div>
                </>
              ) : (
                <div className="border-t border-gold/20 pt-4 mt-4">
                  <Link
                    href="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gold/70 hover:text-gold hover:bg-gold/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Login
                    </div>
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gold/70 hover:text-gold hover:bg-gold/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Register
                    </div>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="h-16"></div>
    </>
  )
}
