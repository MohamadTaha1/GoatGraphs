"use client"

import { useState, useEffect } from "react"
import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { collection, query, getDocs, where, Timestamp } from "firebase/firestore"

export interface DashboardStats {
  totalRevenue: number
  newCustomers: number
  totalOrders: number
  inventoryValue: number
  recentOrders: any[]
  salesData: { name: string; total: number }[]
  topProducts: { name: string; value: number }[]
  orderStatusData: { name: string; value: number }[]
  loading: boolean
  error: string | null
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    newCustomers: 0,
    totalOrders: 0,
    inventoryValue: 0,
    recentOrders: [],
    salesData: [],
    topProducts: [],
    orderStatusData: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const db = getFirestoreInstance()
        if (!db) {
          throw new Error("Firestore instance is null")
        }

        // Get current date and 30 days ago for monthly calculations
        const now = new Date()
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(now.getDate() - 30)

        const thirtyDaysAgoTimestamp = Timestamp.fromDate(thirtyDaysAgo)

        // Fetch total revenue from all orders
        const ordersQuery = query(collection(db, "orders"))
        const ordersSnapshot = await getDocs(ordersQuery)

        let totalRevenue = 0
        const totalOrders = ordersSnapshot.size
        let monthlyOrders = 0

        // Order status counts
        const orderStatusCounts = {
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
        }

        // Recent orders
        const recentOrdersData: any[] = []

        // Process orders
        ordersSnapshot.forEach((doc) => {
          const orderData = doc.data()

          // Add to total revenue
          totalRevenue += orderData.total || 0

          // Count monthly orders
          if (
            orderData.createdAt &&
            (orderData.createdAt.toDate?.() > thirtyDaysAgo || new Date(orderData.createdAt) > thirtyDaysAgo)
          ) {
            monthlyOrders++
          }

          // Count order statuses
          const status = orderData.orderStatus || "processing"
          if (orderStatusCounts[status] !== undefined) {
            orderStatusCounts[status]++
          }

          // Add to recent orders if it's one of the 5 most recent
          if (recentOrdersData.length < 5) {
            recentOrdersData.push({
              id: doc.id,
              customer: orderData.customerInfo?.name || "Unknown Customer",
              date: orderData.createdAt
                ? (orderData.createdAt.toDate?.() || new Date(orderData.createdAt)).toISOString().split("T")[0]
                : "Unknown Date",
              amount: orderData.total || 0,
              status: orderData.orderStatus || "processing",
              items: (orderData.items || []).length,
            })
          }
        })

        // Sort recent orders by date (newest first)
        recentOrdersData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        // Fetch new customers in the last 30 days
        const newCustomersQuery = query(
          collection(db, "users"),
          where("createdAt", ">=", thirtyDaysAgoTimestamp),
          where("role", "==", "customer"),
        )
        const newCustomersSnapshot = await getDocs(newCustomersQuery)
        const newCustomersCount = newCustomersSnapshot.size

        // Fetch inventory value
        const productsQuery = query(collection(db, "products"))
        const productsSnapshot = await getDocs(productsQuery)

        let inventoryValue = 0
        const productCounts = {}

        productsSnapshot.forEach((doc) => {
          const productData = doc.data()
          inventoryValue += (productData.price || 0) * (productData.quantity || 1)

          // Count product types for top products chart
          const productType = productData.type || "other"
          productCounts[productType] = (productCounts[productType] || 0) + 1
        })

        // Create top products data
        const topProductsData = Object.entries(productCounts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)

        // Create order status data
        const orderStatusData = Object.entries(orderStatusCounts)
          .map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
          }))
          .filter((item) => item.value > 0)

        // Create monthly sales data (last 6 months)
        const salesData = []
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date()
          monthDate.setMonth(monthDate.getMonth() - i)

          const monthName = monthDate.toLocaleString("default", { month: "short" })
          const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
          const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

          // Count orders in this month
          let monthTotal = 0
          ordersSnapshot.forEach((doc) => {
            const orderData = doc.data()
            const orderDate = orderData.createdAt
              ? orderData.createdAt.toDate?.() || new Date(orderData.createdAt)
              : null

            if (orderDate && orderDate >= monthStart && orderDate <= monthEnd) {
              monthTotal += orderData.total || 0
            }
          })

          salesData.push({
            name: monthName,
            total: monthTotal,
          })
        }

        setStats({
          totalRevenue,
          newCustomers: newCustomersCount,
          totalOrders: monthlyOrders,
          inventoryValue,
          recentOrders: recentOrdersData,
          salesData,
          topProducts: topProductsData,
          orderStatusData,
          loading: false,
          error: null,
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Failed to fetch dashboard statistics",
        }))
      }
    }

    fetchDashboardStats()
  }, [])

  return stats
}
