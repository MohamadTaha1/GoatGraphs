"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db, isFirestoreAvailable } from "@/lib/firebase"

// Types
export type CartItem = {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

export type Cart = {
  items: CartItem[]
  total: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity" | "id">) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isLoading: boolean
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Local storage key
const CART_STORAGE_KEY = "legendary_signatures_cart"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [itemCount, setItemCount] = useState(0)
  const { user } = useAuth()

  // Calculate total
  const calculateTotal = (items: CartItem[]): number => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  // Calculate item count
  const calculateItemCount = (items: CartItem[]): number => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }

  // Load cart from local storage or Firestore
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true)
      try {
        // First check local storage in all cases
        const localCart = localStorage.getItem(CART_STORAGE_KEY)
        let cartData: Cart = { items: [], total: 0 }

        if (localCart) {
          cartData = JSON.parse(localCart) as Cart
        }

        // If user is logged in and Firestore is available, try to get cart from Firestore
        if (user?.uid && isFirestoreAvailable()) {
          try {
            const cartDoc = await getDoc(doc(db, "carts", user.uid))
            if (cartDoc.exists()) {
              const firestoreCartData = cartDoc.data() as { items: CartItem[] }
              const items = firestoreCartData.items || []
              cartData = {
                items,
                total: calculateTotal(items),
              }

              // Update local storage with Firestore data
              localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData))
            } else if (localCart) {
              // If no cart in Firestore but we have local cart, save it to Firestore
              await setDoc(doc(db, "carts", user.uid), { items: cartData.items })
            }
          } catch (error) {
            console.error("Error loading cart from Firestore:", error)
            // Continue with local cart data
          }
        }

        setCart(cartData)
        setItemCount(calculateItemCount(cartData.items))
      } catch (error) {
        console.error("Error loading cart:", error)
        // Fallback to empty cart
        setCart({ items: [], total: 0 })
        setItemCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    loadCart()
  }, [user])

  // Save cart to local storage and Firestore if user is logged in
  const saveCart = async (newCart: Cart) => {
    try {
      // Always save to local storage
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart))

      // Save to Firestore if user is logged in and Firestore is available
      if (user?.uid && isFirestoreAvailable()) {
        try {
          // Check if document exists first
          const cartDoc = await getDoc(doc(db, "carts", user.uid))

          if (cartDoc.exists()) {
            await updateDoc(doc(db, "carts", user.uid), {
              items: newCart.items,
            })
          } else {
            await setDoc(doc(db, "carts", user.uid), {
              items: newCart.items,
            })
          }
        } catch (error) {
          console.error("Error saving cart to Firestore:", error)
          // Continue with local storage only
        }
      }
    } catch (error) {
      console.error("Error saving cart:", error)
    }
  }

  // Add item to cart
  const addItem = (item: Omit<CartItem, "quantity" | "id">) => {
    // Check if user is logged in
    if (!user) {
      // Redirect to login page with return URL
      const returnUrl = encodeURIComponent(window.location.pathname)
      window.location.href = `/login?returnUrl=${returnUrl}&action=addToCart`
      return
    }

    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex((i) => i.productId === item.productId)
      let newItems: CartItem[]

      if (existingItemIndex >= 0) {
        // Increase quantity if item already exists
        newItems = [...prevCart.items]
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + 1,
        }
      } else {
        // Add new item with quantity 1
        // Ensure price is a number
        const price = typeof item.price === "string" ? Number.parseFloat(item.price) : Number(item.price || 0)

        const newItem: CartItem = {
          ...item,
          price, // Use the converted price
          id: `${item.productId}_${Date.now()}`,
          quantity: 1,
        }
        newItems = [...prevCart.items, newItem]
      }

      const newCart = { items: newItems, total: calculateTotal(newItems) }
      saveCart(newCart)

      // Update item count immediately
      setItemCount(calculateItemCount(newItems))

      return newCart
    })
  }

  // Remove item from cart
  const removeItem = (productId: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter((item) => item.productId !== productId)
      const newCart = { items: newItems, total: calculateTotal(newItems) }
      saveCart(newCart)

      // Update item count immediately
      setItemCount(calculateItemCount(newItems))

      return newCart
    })
  }

  // Update item quantity
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return

    setCart((prevCart) => {
      const newItems = prevCart.items.map((item) => (item.productId === productId ? { ...item, quantity } : item))
      const newCart = { items: newItems, total: calculateTotal(newItems) }
      saveCart(newCart)

      // Update item count immediately
      setItemCount(calculateItemCount(newItems))

      return newCart
    })
  }

  // Clear cart
  const clearCart = () => {
    const emptyCart = { items: [], total: 0 }
    setCart(emptyCart)
    setItemCount(0)
    saveCart(emptyCart)
  }

  return (
    <CartContext.Provider
      value={{
        items: cart.items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isLoading,
        total: cart.total,
        itemCount,
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
