"use client"

import { useState, useEffect, useCallback } from "react"
import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { useAuth } from "@/contexts/auth-context"

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

// Local storage key for cart
const CART_STORAGE_KEY = "ecommerce_cart"

export function useCart() {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Calculate cart total
  const calculateTotal = useCallback((items: CartItem[]) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [])

  // Load cart from local storage or Firestore
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true)
      try {
        if (user?.uid) {
          // Load from Firestore if user is logged in
          const cartDoc = await getDoc(doc(db, "carts", user.uid))
          if (cartDoc.exists()) {
            const cartData = cartDoc.data() as { items: CartItem[] }
            setCart({
              items: cartData.items || [],
              total: calculateTotal(cartData.items || []),
            })
          } else {
            // If no cart in Firestore, check local storage
            const localCart = localStorage.getItem(CART_STORAGE_KEY)
            if (localCart) {
              const parsedCart = JSON.parse(localCart) as Cart
              setCart(parsedCart)
              // Save local cart to Firestore
              await setDoc(doc(db, "carts", user.uid), { items: parsedCart.items })
            } else {
              setCart({ items: [], total: 0 })
            }
          }
        } else {
          // Load from local storage if user is not logged in
          const localCart = localStorage.getItem(CART_STORAGE_KEY)
          if (localCart) {
            setCart(JSON.parse(localCart))
          } else {
            setCart({ items: [], total: 0 })
          }
        }
      } catch (error) {
        console.error("Error loading cart:", error)
        // Fallback to empty cart
        setCart({ items: [], total: 0 })
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [user, calculateTotal])

  // Save cart to local storage and Firestore if user is logged in
  const saveCart = useCallback(
    async (newCart: Cart) => {
      try {
        // Always save to local storage
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart))

        // Save to Firestore if user is logged in
        if (user?.uid) {
          await updateDoc(doc(db, "carts", user.uid), {
            items: newCart.items,
          })
        }
      } catch (error) {
        console.error("Error saving cart:", error)
      }
    },
    [user],
  )

  // Add item to cart
  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">) => {
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
          newItems = [...prevCart.items, { ...item, quantity: 1 }]
        }

        const newCart = { items: newItems, total: calculateTotal(newItems) }
        saveCart(newCart)
        return newCart
      })
    },
    [calculateTotal, saveCart],
  )

  // Remove item from cart
  const removeItem = useCallback(
    (productId: string) => {
      setCart((prevCart) => {
        const newItems = prevCart.items.filter((item) => item.productId !== productId)
        const newCart = { items: newItems, total: calculateTotal(newItems) }
        saveCart(newCart)
        return newCart
      })
    },
    [calculateTotal, saveCart],
  )

  // Update item quantity
  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity < 1) return

      setCart((prevCart) => {
        const newItems = prevCart.items.map((item) => (item.productId === productId ? { ...item, quantity } : item))
        const newCart = { items: newItems, total: calculateTotal(newItems) }
        saveCart(newCart)
        return newCart
      })
    },
    [calculateTotal, saveCart],
  )

  // Clear cart
  const clearCart = useCallback(() => {
    const emptyCart = { items: [], total: 0 }
    setCart(emptyCart)
    saveCart(emptyCart)
  }, [saveCart])

  return {
    cart,
    loading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  }
}
