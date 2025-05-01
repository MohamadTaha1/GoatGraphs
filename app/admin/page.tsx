"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { DollarSign, Users, ShoppingBag, Package, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"

// Mock data for sales
const salesData = [
  { name: "Jan", total: 1200 },
  { name: "Feb", total: 1800 },
  { name: "Mar", total: 2200 },
  { name: "Apr", total: 2600 },
  { name: "May", total: 3200 },
  { name: "Jun", total: 3800 },
  { name: "Jul", total: 4200 },
]

// Mock data for top products
const topProductsData = [
  { name: "Messi Signed Jersey", value: 35 },
  { name: "Ronaldo Signed Ball", value: 25 },
  { name: "Salah Signed Photo", value: 20 },
  { name: "Neymar Signed Boots", value: 15 },
  { name: "Mbappé Signed Jersey", value: 5 },
]

// Mock data for order status
const orderStatusData = [
  { name: "Pending", value: 10 },
  { name: "Processing", value: 15 },
  { name: "Shipped", value: 20 },
  { name: "Delivered", value: 45 },
  { name: "Cancelled", value: 10 },
]

// Colors for pie charts
const COLORS = ["#FFD700", "#FFA500", "#9370DB", "#3CB371", "#FF6347"]

export default function AdminDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2 bg-gold-gradient bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-offwhite/70 font-body">Welcome back, {user?.email}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gold/30 bg-charcoal">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-offwhite">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold">$45,231.89</div>
            <p className="text-xs text-offwhite/70 flex items-center mt-1">
              <span className="text-green-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" /> 20.1%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-gold/30 bg-charcoal">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-offwhite">New Customers</CardTitle>
            <Users className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold">+12</div>
            <p className="text-xs text-offwhite/70 flex items-center mt-1">
              <span className="text-green-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" /> 10.5%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-gold/30 bg-charcoal">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-offwhite">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold">+28</div>
            <p className="text-xs text-offwhite/70 flex items-center mt-1">
              <span className="text-green-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" /> 15.3%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-gold/30 bg-charcoal">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-offwhite">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold">$98,532.00</div>
            <p className="text-xs text-offwhite/70 flex items-center mt-1">
              <span className="text-red-500 flex items-center mr-1">
                <ArrowDownRight className="h-3 w-3 mr-1" /> 5.2%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-charcoal border border-gold/30">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gold-soft data-[state=active]:text-jetblack">
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-gold-soft data-[state=active]:text-jetblack">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-gold-soft data-[state=active]:text-jetblack">
            Reports
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="border-gold/30 bg-charcoal col-span-4">
              <CardHeader>
                <CardTitle className="text-gold font-display">Monthly Revenue</CardTitle>
                <CardDescription className="text-offwhite/70">Sales performance over time</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }}
                      labelStyle={{ color: "#FFD700" }}
                    />
                    <Bar dataKey="total" fill="#FFD700" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="border-gold/30 bg-charcoal col-span-3">
              <CardHeader>
                <CardTitle className="text-gold font-display">Top Products</CardTitle>
                <CardDescription className="text-offwhite/70">Best selling items</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={topProductsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {topProductsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }}
                      labelStyle={{ color: "#FFD700" }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="border-gold/30 bg-charcoal col-span-3">
              <CardHeader>
                <CardTitle className="text-gold font-display">Order Status</CardTitle>
                <CardDescription className="text-offwhite/70">Current order distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }}
                      labelStyle={{ color: "#FFD700" }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="border-gold/30 bg-charcoal col-span-4">
              <CardHeader>
                <CardTitle className="text-gold font-display">Recent Activity</CardTitle>
                <CardDescription className="text-offwhite/70">Latest system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="mr-4 rounded-full bg-gold/20 p-2">
                      <ShoppingBag className="h-4 w-4 text-gold" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none text-offwhite">New order #ORD-7392</p>
                      <p className="text-xs text-offwhite/70">Ahmed Al Mansour purchased Messi Signed Jersey</p>
                    </div>
                    <div className="text-xs text-offwhite/50">2 hours ago</div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4 rounded-full bg-gold/20 p-2">
                      <Users className="h-4 w-4 text-gold" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none text-offwhite">New customer registered</p>
                      <p className="text-xs text-offwhite/70">Sara Khan created an account</p>
                    </div>
                    <div className="text-xs text-offwhite/50">5 hours ago</div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4 rounded-full bg-gold/20 p-2">
                      <Package className="h-4 w-4 text-gold" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none text-offwhite">Product updated</p>
                      <p className="text-xs text-offwhite/70">Ronaldo Signed Ball marked as out of stock</p>
                    </div>
                    <div className="text-xs text-offwhite/50">1 day ago</div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4 rounded-full bg-gold/20 p-2">
                      <TrendingUp className="h-4 w-4 text-gold" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none text-offwhite">Sales milestone reached</p>
                      <p className="text-xs text-offwhite/70">Monthly sales exceeded $40,000</p>
                    </div>
                    <div className="text-xs text-offwhite/50">2 days ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card className="border-gold/30 bg-charcoal">
            <CardHeader>
              <CardTitle className="text-gold font-display">Sales Analytics</CardTitle>
              <CardDescription className="text-offwhite/70">Detailed sales performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }}
                    labelStyle={{ color: "#FFD700" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#FFD700" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card className="border-gold/30 bg-charcoal">
            <CardHeader>
              <CardTitle className="text-gold font-display">Reports</CardTitle>
              <CardDescription className="text-offwhite/70">Download business reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gold/20 pb-4">
                  <div>
                    <h3 className="font-display text-offwhite">Monthly Sales Report</h3>
                    <p className="text-sm text-offwhite/70">Detailed breakdown of sales by product and category</p>
                  </div>
                  <button className="rounded-md bg-gold-soft px-3 py-1 text-sm font-semibold text-jetblack hover:bg-gold-deep">
                    Download
                  </button>
                </div>
                <div className="flex items-center justify-between border-b border-gold/20 pb-4">
                  <div>
                    <h3 className="font-display text-offwhite">Customer Analytics</h3>
                    <p className="text-sm text-offwhite/70">Customer demographics and purchasing patterns</p>
                  </div>
                  <button className="rounded-md bg-gold-soft px-3 py-1 text-sm font-semibold text-jetblack hover:bg-gold-deep">
                    Download
                  </button>
                </div>
                <div className="flex items-center justify-between border-b border-gold/20 pb-4">
                  <div>
                    <h3 className="font-display text-offwhite">Inventory Status</h3>
                    <p className="text-sm text-offwhite/70">Current inventory levels and restock recommendations</p>
                  </div>
                  <button className="rounded-md bg-gold-soft px-3 py-1 text-sm font-semibold text-jetblack hover:bg-gold-deep">
                    Download
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-offwhite">Financial Summary</h3>
                    <p className="text-sm text-offwhite/70">Revenue, expenses, and profit analysis</p>
                  </div>
                  <button className="rounded-md bg-gold-soft px-3 py-1 text-sm font-semibold text-jetblack hover:bg-gold-deep">
                    Download
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
