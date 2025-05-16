"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
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
  AreaChart,
  Area,
} from "recharts"
import {
  DollarSign,
  Users,
  ShoppingBag,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  Activity,
  Eye,
  ShoppingCart,
  CreditCard,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { formatPrice } from "@/lib/utils"
import { useState } from "react"

// Colors for pie charts
const COLORS = ["#FFD700", "#FFA500", "#9370DB", "#3CB371", "#FF6347"]

export default function AdminDashboard() {
  const { user } = useAuth()
  const stats = useDashboardStats()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    // Simulate refresh by reloading the page after a short delay
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-500/20 text-blue-500"
      case "processing":
        return "bg-orange-500/20 text-orange-500"
      case "shipped":
        return "bg-violet-500/20 text-violet-500"
      case "delivered":
        return "bg-green-500/20 text-green-500"
      case "cancelled":
        return "bg-red-500/20 text-red-500"
      default:
        return "bg-gray-500/20 text-gray-500"
    }
  }

  if (stats.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-gold mb-4" />
        <h2 className="text-xl font-display font-bold text-gold">Loading Dashboard Data...</h2>
        <p className="text-offwhite/70 mt-2">Fetching the latest statistics from the database</p>
      </div>
    )
  }

  if (stats.error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] bg-red-900/10 rounded-lg border border-red-900/30 p-8">
        <div className="text-red-500 mb-4 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-xl font-display font-bold">Error Loading Dashboard</h2>
        </div>
        <p className="text-offwhite/70 mb-6 text-center">{stats.error}</p>
        <Button className="bg-gold-soft hover:bg-gold-deep text-jetblack" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 bg-gold-gradient bg-clip-text text-transparent">
            Dashboard
          </h1>
          <div className="flex items-center text-offwhite/70 font-body">
            <Calendar className="mr-2 h-4 w-4 text-gold-500" />
            <span className="mr-4">{new Date().toLocaleDateString("en-US", { dateStyle: "full" })}</span>
            <Clock className="mr-2 h-4 w-4 text-gold-500" />
            <span>{new Date().toLocaleTimeString("en-US", { timeStyle: "short" })}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10" asChild>
            <a href="/customer" target="_blank" rel="noopener noreferrer">
              <Eye className="mr-2 h-4 w-4" />
              View Store
            </a>
          </Button>
          <Button
            className="bg-gold-soft hover:bg-gold-deep text-jetblack"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <Activity className="mr-2 h-4 w-4" />
                Refresh Data
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gold/30 bg-charcoal shadow-lg overflow-hidden">
          <CardHeader className="pb-2 relative">
            <div className="absolute top-0 right-0 p-4">
              <DollarSign className="h-8 w-8 text-gold/20" />
            </div>
            <CardTitle className="text-sm font-medium text-offwhite">Total Revenue</CardTitle>
            <CardDescription className="text-offwhite/50">All time sales revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gold">${formatPrice(stats.totalRevenue)}</div>
            <div className="mt-4 flex items-center text-xs text-offwhite/70">
              <span className="flex items-center text-green-500 mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" /> 20.1%
              </span>
              from last month
            </div>
          </CardContent>
          <div className="h-2 bg-gradient-to-r from-gold-deep via-gold to-gold-soft"></div>
        </Card>
        <Card className="border-gold/30 bg-charcoal shadow-lg overflow-hidden">
          <CardHeader className="pb-2 relative">
            <div className="absolute top-0 right-0 p-4">
              <Users className="h-8 w-8 text-gold/20" />
            </div>
            <CardTitle className="text-sm font-medium text-offwhite">New Customers</CardTitle>
            <CardDescription className="text-offwhite/50">Customers this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gold">+{stats.newCustomers}</div>
            <div className="mt-4 flex items-center text-xs text-offwhite/70">
              <span className="flex items-center text-green-500 mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" /> 10.5%
              </span>
              from last month
            </div>
          </CardContent>
          <div className="h-2 bg-gradient-to-r from-gold-deep via-gold to-gold-soft"></div>
        </Card>
        <Card className="border-gold/30 bg-charcoal shadow-lg overflow-hidden">
          <CardHeader className="pb-2 relative">
            <div className="absolute top-0 right-0 p-4">
              <ShoppingBag className="h-8 w-8 text-gold/20" />
            </div>
            <CardTitle className="text-sm font-medium text-offwhite">Total Orders</CardTitle>
            <CardDescription className="text-offwhite/50">Orders this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gold">+{stats.totalOrders}</div>
            <div className="mt-4 flex items-center text-xs text-offwhite/70">
              <span className="flex items-center text-green-500 mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" /> 15.3%
              </span>
              from last month
            </div>
          </CardContent>
          <div className="h-2 bg-gradient-to-r from-gold-deep via-gold to-gold-soft"></div>
        </Card>
        <Card className="border-gold/30 bg-charcoal shadow-lg overflow-hidden">
          <CardHeader className="pb-2 relative">
            <div className="absolute top-0 right-0 p-4">
              <Package className="h-8 w-8 text-gold/20" />
            </div>
            <CardTitle className="text-sm font-medium text-offwhite">Inventory Value</CardTitle>
            <CardDescription className="text-offwhite/50">Total product value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gold">${formatPrice(stats.inventoryValue)}</div>
            <div className="mt-4 flex items-center text-xs text-offwhite/70">
              <span className="flex items-center text-red-500 mr-1">
                <ArrowDownRight className="h-3 w-3 mr-1" /> 5.2%
              </span>
              from last month
            </div>
          </CardContent>
          <div className="h-2 bg-gradient-to-r from-gold-deep via-gold to-gold-soft"></div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-charcoal border border-gold/30 p-1">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-gold-soft data-[state=active]:text-jetblack rounded-md px-4 py-2"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="sales"
            className="data-[state=active]:bg-gold-soft data-[state=active]:text-jetblack rounded-md px-4 py-2"
          >
            Sales
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-gold-soft data-[state=active]:text-jetblack rounded-md px-4 py-2"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-gold/30 bg-charcoal shadow-lg lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-gold font-display text-lg">Monthly Revenue</CardTitle>
                <CardDescription className="text-offwhite/70">Sales performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats.salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }}
                      labelStyle={{ color: "#FFD700" }}
                      formatter={(value) => [`$${formatPrice(value)}`, "Revenue"]}
                    />
                    <Area type="monotone" dataKey="total" stroke="#D4AF37" fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-gold/30 bg-charcoal shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-gold font-display text-lg">Top Products</CardTitle>
                <CardDescription className="text-offwhite/70">Best selling items</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.topProducts}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {stats.topProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }}
                      labelStyle={{ color: "#FFD700" }}
                    />
                    <Legend layout="vertical" verticalAlign="middle" align="right" />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-gold/30 bg-charcoal shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-gold font-display text-lg">Order Status</CardTitle>
                <CardDescription className="text-offwhite/70">Current order distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={stats.orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {stats.orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }}
                      labelStyle={{ color: "#FFD700" }}
                    />
                    <Legend layout="vertical" verticalAlign="middle" align="right" />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-gold/30 bg-charcoal shadow-lg lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-gold font-display text-lg">Recent Orders</CardTitle>
                <CardDescription className="text-offwhite/70">Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-charcoal/50">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3 border border-gold/30">
                          <AvatarImage src={order.avatar || "/placeholder.svg"} alt={order.customer} />
                          <AvatarFallback className="bg-gold/10 text-gold">
                            {order.customer
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center">
                            <p className="font-medium text-offwhite">{order.customer}</p>
                            <Badge className={`ml-2 ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex items-center text-xs text-offwhite/50">
                            <span className="mr-2">{order.id}</span>
                            <span>•</span>
                            <span className="mx-2">{new Date(order.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="ml-2">
                              {order.items} {order.items === 1 ? "item" : "items"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gold">${formatPrice(order.amount)}</p>
                        <Button variant="ghost" size="sm" className="text-xs text-offwhite/70 hover:text-gold" asChild>
                          <a href={`/admin/orders/${order.id}`}>View</a>
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full border-gold/30 text-gold hover:bg-gold/10" asChild>
                    <a href="/admin/orders">View All Orders</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-gold/30 bg-charcoal shadow-lg lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-gold font-display text-lg">Sales Trends</CardTitle>
                <CardDescription className="text-offwhite/70">Monthly sales performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }}
                      labelStyle={{ color: "#FFD700" }}
                      formatter={(value) => [`$${formatPrice(value)}`, "Revenue"]}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#FFD700" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-gold/30 bg-charcoal shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-gold font-display text-lg">Sales by Category</CardTitle>
                <CardDescription className="text-offwhite/70">Product category distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.topProducts}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {stats.topProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }}
                      labelStyle={{ color: "#FFD700" }}
                    />
                    <Legend layout="vertical" verticalAlign="middle" align="right" />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-gold/30 bg-charcoal shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-gold font-display text-lg">Sales Metrics</CardTitle>
                <CardDescription className="text-offwhite/70">Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-offwhite/70">Conversion Rate</span>
                    <span className="text-sm font-medium text-offwhite">3.6%</span>
                  </div>
                  <Progress value={36} className="h-2" indicatorClassName="bg-gold" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-offwhite/70">Avg. Order Value</span>
                    <span className="text-sm font-medium text-offwhite">
                      ${formatPrice(stats.totalRevenue / Math.max(stats.totalOrders, 1))}
                    </span>
                  </div>
                  <Progress value={68} className="h-2" indicatorClassName="bg-gold" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-offwhite/70">Return Rate</span>
                    <span className="text-sm font-medium text-offwhite">2.1%</span>
                  </div>
                  <Progress value={21} className="h-2" indicatorClassName="bg-gold" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-offwhite/70">Cart Abandonment</span>
                    <span className="text-sm font-medium text-offwhite">24.3%</span>
                  </div>
                  <Progress value={24} className="h-2" indicatorClassName="bg-gold" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gold/30 bg-charcoal shadow-lg lg:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-gold font-display text-lg">Sales Funnel</CardTitle>
                <CardDescription className="text-offwhite/70">Customer journey conversion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-gold/20 p-3">
                      <Eye className="h-6 w-6 text-gold" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-offwhite">Page Views</span>
                        <span className="text-sm font-medium text-offwhite">12,543</span>
                      </div>
                      <Progress value={100} className="h-2" indicatorClassName="bg-gold" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-gold/20 p-3">
                      <ShoppingCart className="h-6 w-6 text-gold" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-offwhite">Added to Cart</span>
                        <span className="text-sm font-medium text-offwhite">3,842</span>
                      </div>
                      <Progress value={30.6} className="h-2" indicatorClassName="bg-gold" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-gold/20 p-3">
                      <CreditCard className="h-6 w-6 text-gold" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-offwhite">Checkout Started</span>
                        <span className="text-sm font-medium text-offwhite">1,463</span>
                      </div>
                      <Progress value={11.7} className="h-2" indicatorClassName="bg-gold" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-gold/20 p-3">
                      <ShoppingBag className="h-6 w-6 text-gold" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-offwhite">Purchases Completed</span>
                        <span className="text-sm font-medium text-offwhite">{stats.totalOrders}</span>
                      </div>
                      <Progress value={3.6} className="h-2" indicatorClassName="bg-gold" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-gold/30 bg-charcoal shadow-lg lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-gold font-display text-lg">Visitor Statistics</CardTitle>
                <CardDescription className="text-offwhite/70">Website traffic overview</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats.salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }}
                      labelStyle={{ color: "#FFD700" }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="total"
                      name="Revenue"
                      stroke="#D4AF37"
                      fillOpacity={1}
                      fill="url(#colorVisitors)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-gold/30 bg-charcoal shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-gold font-display text-lg">Traffic Sources</CardTitle>
                <CardDescription className="text-offwhite/70">Where visitors come from</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.topProducts}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {stats.topProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }}
                      labelStyle={{ color: "#FFD700" }}
                    />
                    <Legend layout="vertical" verticalAlign="middle" align="right" />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="border-gold/30 bg-charcoal shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-gold font-display text-lg">Performance Metrics</CardTitle>
              <CardDescription className="text-offwhite/70">Key website analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-offwhite/70">Bounce Rate</h3>
                  <div className="text-2xl font-bold text-gold">32.4%</div>
                  <p className="text-xs text-offwhite/50 flex items-center">
                    <span className="text-green-500 flex items-center mr-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" /> 2.1%
                    </span>
                    vs last month
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-offwhite/70">Avg. Session Duration</h3>
                  <div className="text-2xl font-bold text-gold">3m 42s</div>
                  <p className="text-xs text-offwhite/50 flex items-center">
                    <span className="text-green-500 flex items-center mr-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" /> 12.3%
                    </span>
                    vs last month
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-offwhite/70">Pages Per Session</h3>
                  <div className="text-2xl font-bold text-gold">4.2</div>
                  <p className="text-xs text-offwhite/50 flex items-center">
                    <span className="text-green-500 flex items-center mr-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" /> 8.7%
                    </span>
                    vs last month
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-offwhite/70">New Visitors</h3>
                  <div className="text-2xl font-bold text-gold">68.5%</div>
                  <p className="text-xs text-offwhite/50 flex items-center">
                    <span className="text-red-500 flex items-center mr-1">
                      <ArrowDownRight className="h-3 w-3 mr-1" /> 3.2%
                    </span>
                    vs last month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
