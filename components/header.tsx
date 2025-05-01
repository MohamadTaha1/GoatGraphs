"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Menu, X, User, LogOut, Package } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/components/cart-provider"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { items } = useCart()

  const isActive = (path: string) => {
    return pathname === path
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    closeMenu()
  }

  const isCustomerRoute = pathname.startsWith("/customer")
  const baseRoute = isCustomerRoute ? "/customer" : ""

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-jetblack shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href={isCustomerRoute ? "/customer" : "/"} className="flex items-center">
            <span className="text-2xl font-display text-gold">Legendary Signatures</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href={`${baseRoute}/`}
              className={`text-sm font-medium transition-colors ${
                isActive(baseRoute) || isActive("/") || isActive("/customer")
                  ? "text-gold"
                  : "text-offwhite hover:text-gold"
              }`}
            >
              Home
            </Link>
            <Link
              href={`${baseRoute}/shop`}
              className={`text-sm font-medium transition-colors ${
                isActive(`${baseRoute}/shop`) ? "text-gold" : "text-offwhite hover:text-gold"
              }`}
            >
              Shop
            </Link>
            {user && (
              <Link
                href={`${baseRoute}/orders`}
                className={`text-sm font-medium transition-colors ${
                  isActive(`${baseRoute}/orders`) ? "text-gold" : "text-offwhite hover:text-gold"
                }`}
              >
                Orders
              </Link>
            )}
            <Link
              href={`${baseRoute}/auction`}
              className={`text-sm font-medium transition-colors ${
                isActive(`${baseRoute}/auction`) ? "text-gold" : "text-offwhite hover:text-gold"
              }`}
            >
              Auctions
            </Link>
            <Link
              href={`${baseRoute}/authenticity`}
              className={`text-sm font-medium transition-colors ${
                isActive(`${baseRoute}/authenticity`) ? "text-gold" : "text-offwhite hover:text-gold"
              }`}
            >
              Authenticity
            </Link>
            <Link
              href={`${baseRoute}/about`}
              className={`text-sm font-medium transition-colors ${
                isActive(`${baseRoute}/about`) ? "text-gold" : "text-offwhite hover:text-gold"
              }`}
            >
              About
            </Link>
            <Link
              href={`${baseRoute}/contact`}
              className={`text-sm font-medium transition-colors ${
                isActive(`${baseRoute}/contact`) ? "text-gold" : "text-offwhite hover:text-gold"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link href={`${baseRoute}/cart`} className="relative">
                  <Button variant="ghost" size="icon" className="text-offwhite hover:text-gold">
                    <ShoppingCart className="h-5 w-5" />
                    {items && items.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gold text-jetblack text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {items.length}
                      </span>
                    )}
                  </Button>
                </Link>
                <div className="relative group">
                  <Button variant="ghost" size="icon" className="text-offwhite hover:text-gold">
                    <User className="h-5 w-5" />
                  </Button>
                  <div className="absolute right-0 mt-2 w-48 bg-charcoal border border-gold/30 rounded-md shadow-lg py-1 hidden group-hover:block">
                    <div className="px-4 py-2 border-b border-gold/20">
                      <p className="text-sm font-medium text-offwhite">{user.displayName || user.email}</p>
                      <p className="text-xs text-offwhite/70">{user.email}</p>
                    </div>
                    <Link
                      href={`${baseRoute}/profile`}
                      className="block px-4 py-2 text-sm text-offwhite hover:bg-jetblack hover:text-gold"
                    >
                      Profile
                    </Link>
                    <Link
                      href={`${baseRoute}/orders`}
                      className="block px-4 py-2 text-sm text-offwhite hover:bg-jetblack hover:text-gold"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-offwhite hover:bg-jetblack hover:text-gold"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" className="border-gold/30 text-offwhite hover:bg-gold/10 hover:text-gold">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gold-soft hover:bg-gold-deep text-jetblack">Register</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-offwhite">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-charcoal border-t border-gold/20">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href={`${baseRoute}/`}
                onClick={closeMenu}
                className={`text-sm font-medium transition-colors ${
                  isActive(baseRoute) || isActive("/") || isActive("/customer")
                    ? "text-gold"
                    : "text-offwhite hover:text-gold"
                }`}
              >
                Home
              </Link>
              <Link
                href={`${baseRoute}/shop`}
                onClick={closeMenu}
                className={`text-sm font-medium transition-colors ${
                  isActive(`${baseRoute}/shop`) ? "text-gold" : "text-offwhite hover:text-gold"
                }`}
              >
                Shop
              </Link>
              {user && (
                <Link
                  href={`${baseRoute}/orders`}
                  onClick={closeMenu}
                  className={`text-sm font-medium transition-colors ${
                    isActive(`${baseRoute}/orders`) ? "text-gold" : "text-offwhite hover:text-gold"
                  }`}
                >
                  Orders
                </Link>
              )}
              <Link
                href={`${baseRoute}/auction`}
                onClick={closeMenu}
                className={`text-sm font-medium transition-colors ${
                  isActive(`${baseRoute}/auction`) ? "text-gold" : "text-offwhite hover:text-gold"
                }`}
              >
                Auctions
              </Link>
              <Link
                href={`${baseRoute}/authenticity`}
                onClick={closeMenu}
                className={`text-sm font-medium transition-colors ${
                  isActive(`${baseRoute}/authenticity`) ? "text-gold" : "text-offwhite hover:text-gold"
                }`}
              >
                Authenticity
              </Link>
              <Link
                href={`${baseRoute}/about`}
                onClick={closeMenu}
                className={`text-sm font-medium transition-colors ${
                  isActive(`${baseRoute}/about`) ? "text-gold" : "text-offwhite hover:text-gold"
                }`}
              >
                About
              </Link>
              <Link
                href={`${baseRoute}/contact`}
                onClick={closeMenu}
                className={`text-sm font-medium transition-colors ${
                  isActive(`${baseRoute}/contact`) ? "text-gold" : "text-offwhite hover:text-gold"
                }`}
              >
                Contact
              </Link>

              {user ? (
                <>
                  <div className="border-t border-gold/20 pt-4 mt-4">
                    <div className="flex items-center mb-4">
                      <div className="bg-gold/20 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                        <User className="h-5 w-5 text-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-offwhite">{user.displayName || user.email}</p>
                        <p className="text-xs text-offwhite/70">{user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Link
                        href={`${baseRoute}/profile`}
                        onClick={closeMenu}
                        className="flex items-center text-sm text-offwhite hover:text-gold"
                      >
                        <User className="h-4 w-4 mr-2" /> Profile
                      </Link>
                      <Link
                        href={`${baseRoute}/orders`}
                        onClick={closeMenu}
                        className="flex items-center text-sm text-offwhite hover:text-gold"
                      >
                        <Package className="h-4 w-4 mr-2" /> My Orders
                      </Link>
                      <Link
                        href={`${baseRoute}/cart`}
                        onClick={closeMenu}
                        className="flex items-center text-sm text-offwhite hover:text-gold"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" /> Cart
                        {items && items.length > 0 && (
                          <span className="ml-2 bg-gold text-jetblack text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {items.length}
                          </span>
                        )}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center text-sm text-offwhite hover:text-gold"
                      >
                        <LogOut className="h-4 w-4 mr-2" /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="border-t border-gold/20 pt-4 mt-4 flex flex-col space-y-3">
                  <Link href="/login" onClick={closeMenu}>
                    <Button
                      variant="outline"
                      className="w-full border-gold/30 text-offwhite hover:bg-gold/10 hover:text-gold"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={closeMenu}>
                    <Button className="w-full bg-gold-soft hover:bg-gold-deep text-jetblack">Register</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
