"use client"

import { useState, useEffect } from "react"
import { collection, query, getDocs, where } from "firebase/firestore"
import { getFirestoreInstance } from "@/lib/firebase"

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

        // Fetch orders - no composite index needed for a simple collection query
        const ordersQuery = query(collection(db, "orders"))
        const ordersSnapshot = await getDocs(ordersQuery)

        let totalRevenue = 0
        const totalOrders = ordersSnapshot.size
        let monthlyOrders = 0
        const productSales = {}
        const monthlyRevenue = {}

        // Order status counts
        const orderStatusCounts = {
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
        }

        // Recent orders
        const recentOrdersData = []

        // Process orders
        ordersSnapshot.forEach((doc) => {
          const orderData = doc.data()

          // Add to total revenue
          const orderTotal = Number.parseFloat(orderData.total) || 0
          totalRevenue += orderTotal

          // Count monthly orders
          if (orderData.createdAt) {
            const orderDate = orderData.createdAt.toDate ? orderData.createdAt.toDate() : new Date(orderData.createdAt)

            if (orderDate > thirtyDaysAgo) {
              monthlyOrders++
            }

            // Track monthly revenue
            const monthYear = `${orderDate.getMonth() + 1}-${orderDate.getFullYear()}`
            monthlyRevenue[monthYear] = (monthlyRevenue[monthYear] || 0) + orderTotal
          }

          // Count order statuses
          const status = orderData.orderStatus || "processing"
          if (orderStatusCounts[status] !== undefined) {
            orderStatusCounts[status]++
          }

          // Track product sales
          if (orderData.items && Array.isArray(orderData.items)) {
            orderData.items.forEach((item) => {
              const category = item.category || "Uncategorized"
              productSales[category] = (productSales[category] || 0) + 1
            })
          }

          // Add to recent orders
          recentOrdersData.push({
            id: doc.id,
            customer: orderData.customerInfo?.name || "Unknown Customer",
            date: orderData.createdAt
              ? (orderData.createdAt.toDate?.() || new Date(orderData.createdAt)).toISOString().split("T")[0]
              : "Unknown Date",
            amount: orderTotal,
            status: orderData.orderStatus || "processing",
            items: (orderData.items || []).length,
          })
        })

        // Sort recent orders by date (newest first) and take only the 5 most recent
        recentOrdersData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        const recentOrders = recentOrdersData.slice(0, 5)

        // Fetch all customers - avoid composite index by querying only by role
        const customersQuery = query(collection(db, "users"), where("role", "==", "customer"))
        const customersSnapshot = await getDocs(customersQuery)

        // Filter new customers in JavaScript instead of in the query
        let newCustomersCount = 0
        customersSnapshot.forEach((doc) => {
          const userData = doc.data()
          if (userData.createdAt) {
            const createdAt = userData.createdAt.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt)
            if (createdAt > thirtyDaysAgo) {
              newCustomersCount++
            }
          }
        })

        // Fetch inventory value
        const productsQuery = query(collection(db, "products"))
        const productsSnapshot = await getDocs(productsQuery)

        let inventoryValue = 0
        const productCounts = {}

        productsSnapshot.forEach((doc) => {
          const productData = doc.data()
          const price = Number.parseFloat(productData.price) || 0
          const quantity = Number.parseInt(productData.quantity) || 0

          inventoryValue += price * quantity

          // Count product types for top products chart
          const productType = productData.category || "Other"
          productCounts[productType] = (productCounts[productType] || 0) + 1
        })

        // Create top products data
        const topProductsData = Object.entries(productSales)
          .map(([name, value]) => ({ name, value: Number(value) }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)

        // Create order status data
        const orderStatusData = Object.entries(orderStatusCounts)
          .map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value: Number(value),
          }))
          .filter((item) => item.value > 0)

        // Create monthly sales data (last 6 months)
        const salesData = []
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date()
          monthDate.setMonth(monthDate.getMonth() - i)

          const monthName = monthDate.toLocaleString("default", { month: "short" })
          const monthYear = `${monthDate.getMonth() + 1}-${monthDate.getFullYear()}`

          salesData.push({
            name: monthName,
            total: monthlyRevenue[monthYear] || 0,
          })
        }

        setStats({
          totalRevenue,
          newCustomers: newCustomersCount,
          totalOrders: monthlyOrders,
          inventoryValue,
          recentOrders,
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
