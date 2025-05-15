"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Bell, Search, Menu, X, User, Settings, LogOut, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase/auth"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function AdminHeader() {
  const { user } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Order",
      message: "Order #ORD-7392 has been placed",
      time: "10 minutes ago",
      read: false,
    },
    {
      id: 2,
      title: "Low Stock Alert",
      message: "Messi Signed Jersey is running low on stock",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      title: "New Customer",
      message: "Ahmed Al Mansour has created an account",
      time: "3 hours ago",
      read: true,
    },
  ])
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const formatGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  const unreadNotifications = notifications.filter((notification) => !notification.read).length

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    )
  }

  const getInitials = (name: string) => {
    if (!name) return "A"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-gold/20 bg-charcoal/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-5 w-5 text-gold" /> : <Menu className="h-5 w-5 text-gold" />}
          </Button>
        </div>

        <div className="hidden md:flex md:items-center md:gap-4">
          <div className="text-lg font-semibold text-gold">
            {formatGreeting()}, <span className="text-offwhite">{user?.displayName || "Admin"}</span>
          </div>
        </div>

        <div className="hidden md:block md:w-1/3 lg:w-1/4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-offwhite/50" />
            <Input
              placeholder="Search..."
              className="pl-8 border-gold/30 bg-jetblack/50 text-offwhite focus:border-gold"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-gold" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-charcoal border-gold/30">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span className="text-gold">Notifications</span>
                {unreadNotifications > 0 && (
                  <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={markAllAsRead}>
                    Mark all as read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gold/20" />
              {notifications.length === 0 ? (
                <div className="py-4 text-center text-sm text-offwhite/70">No notifications</div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={cn("flex flex-col items-start p-3 cursor-pointer", !notification.read && "bg-gold/5")}
                  >
                    <div className="flex w-full justify-between">
                      <span className="font-medium text-offwhite">{notification.title}</span>
                      <span className="text-xs text-offwhite/50">{notification.time}</span>
                    </div>
                    <span className="mt-1 text-sm text-offwhite/70">{notification.message}</span>
                    {!notification.read && <Badge className="mt-2 bg-gold/20 text-gold hover:bg-gold/30">New</Badge>}
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator className="bg-gold/20" />
              <DropdownMenuItem className="justify-center text-gold hover:text-gold hover:bg-gold/10">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8 border border-gold/30">
                  <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "Admin"} />
                  <AvatarFallback className="bg-jetblack text-gold">
                    {getInitials(user?.displayName || "Admin")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-charcoal border-gold/30">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-offwhite">{user?.displayName || "Admin User"}</p>
                  <p className="text-xs leading-none text-offwhite/70">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gold/20" />
              <DropdownMenuItem className="text-offwhite hover:text-gold hover:bg-gold/10">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-offwhite hover:text-gold hover:bg-gold/10">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-offwhite hover:text-gold hover:bg-gold/10">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gold/20" />
              <DropdownMenuItem className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search */}
      <div className={`px-4 py-2 border-t border-gold/20 md:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-offwhite/50" />
          <Input
            placeholder="Search..."
            className="pl-8 border-gold/30 bg-jetblack/50 text-offwhite focus:border-gold"
          />
        </div>
      </div>
    </header>
  )
}
