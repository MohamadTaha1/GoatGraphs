"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "@/contexts/auth-context"

// Types
export type CartItemType = {
  productId: string
  name: string
  price: number
  quantity?: number
  image?: string
  type?: "product" | "preorder" // Add type to distinguish between products and pre-orders
  details?: any // For pre-order details
}

type CartContextType = {
  items: CartItemType[]
  addItem: (item: CartItemType) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemType[]>([])
  const [loaded, setLoaded] = useState(false)
  const { user } = useAuth()

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (e) {
        console.error("Failed to parse cart from localStorage:", e)
      }
    }
    setLoaded(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (loaded) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, loaded])

  // Add item to cart
  const addItem = (item: CartItemType) => {
    setItems((prevItems) => {
      // For pre-orders, always add as new item
      if (item.type === "preorder") {
        return [...prevItems, { ...item, quantity: 1 }]
      }

      // For regular products, check if already in cart
      const existingItemIndex = prevItems.findIndex((i) => i.productId === item.productId && i.type !== "preorder")

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity = (updatedItems[existingItemIndex].quantity || 1) + 1
        return updatedItems
      } else {
        // Item doesn't exist, add new
        return [...prevItems, { ...item, quantity: 1 }]
      }
    })
  }

  // Remove item from cart
  const removeItem = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.productId !== productId))
  }

  // Update item quantity
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return

    setItems((prevItems) => prevItems.map((item) => (item.productId === productId ? { ...item, quantity } : item)))
  }

  // Clear cart
  const clearCart = () => {
    setItems([])
  }

  // Calculate total items in cart
  const itemCount = items.reduce((total, item) => total + (item.quantity || 1), 0)

  // Calculate subtotal
  const subtotal = items.reduce((total, item) => total + item.price * (item.quantity || 1), 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
