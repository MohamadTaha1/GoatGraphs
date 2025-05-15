"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts"
import { Users, Clock, MousePointer, Smartphone, Laptop, TrendingUp, Map, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// Mock data for visitor analytics
const visitorData = [
  { name: "Jan", visitors: 4000, pageViews: 2400 },
  { name: "Feb", visitors: 3000, pageViews: 1398 },
  { name: "Mar", visitors: 2000, pageViews: 9800 },
  { name: "Apr", visitors: 2780, pageViews: 3908 },
  { name: "May", visitors: 1890, pageViews: 4800 },
  { name: "Jun", visitors: 2390, pageViews: 3800 },
  { name: "Jul", visitors: 3490, pageViews: 4300 },
]

// Mock data for device distribution
const deviceData = [
  { name: "Desktop", value: 45 },
  { name: "Mobile", value: 40 },
  { name: "Tablet", value: 15 },
]

// Mock data for traffic sources
const trafficSourceData = [
  { name: "Direct", value: 30 },
  { name: "Organic Search", value: 40 },
  { name: "Social Media", value: 15 },
  { name: "Referral", value: 10 },
  { name: "Email", value: 5 },
]

// Mock data for geographic distribution
const geoData = [
  { name: "United States", value: 35 },
  { name: "United Kingdom", value: 20 },
  { name: "Germany", value: 15 },
  { name: "France", value: 10 },
  { name: "Canada", value: 8 },
  { name: "Other", value: 12 },
]

// Colors for pie charts
const COLORS = ["#FFD700", "#FFA500", "#9370DB", "#3CB371", "#FF6347", "#4682B4"]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 bg-gold-gradient bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="text-offwhite/70 font-body">Detailed insights into your website performance</p>
        </div>
        <div className="flex gap-4">
          <Select defaultValue="30days">
            <SelectTrigger className="w-[180px] border-gold/30 bg-charcoal">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent className="bg-charcoal border-gold/30">
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-gold-soft hover:bg-gold-deep text-jetblack">
            <Calendar className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gold/30 bg-charcoal shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-offwhite">Total Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-8 w-8 text-gold mr-4" />
              <div>
                <div className="text-2xl font-bold text-gold">24,532</div>
                <p className="text-xs text-green-500">+12.5% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gold/30 bg-charcoal shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-offwhite">Avg. Session Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-gold mr-4" />
              <div>
                <div className="text-2xl font-bold text-gold">3m 42s</div>
                <p className="text-xs text-green-500">+8.3% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gold/30 bg-charcoal shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-offwhite">Bounce Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MousePointer className="h-8 w-8 text-gold mr-4" />
              <div>
                <div className="text-2xl font-bold text-gold">32.4%</div>
                <p className="text-xs text-red-500">+2.1% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gold/30 bg-charcoal shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-offwhite">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-gold mr-4" />
              <div>
                <div className="text-2xl font-bold text-gold">3.6%</div>
                <p className="text-xs text-green-500">+0.8% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="visitors" className="space-y-6">
        <TabsList className="bg-charcoal border border-gold/30 p-1">
          <TabsTrigger
            value="visitors"
            className="data-[state=active]:bg-gold-soft data-[state=active]:text-jetblack rounded-md px-4 py-2"
          >
            Visitors
          </TabsTrigger>
          <TabsTrigger
            value="behavior"
            className="data-[state=active]:bg-gold-soft data-[state=active]:text-jetblack rounded-md px-4 py-2"
          >
            Behavior
          </TabsTrigger>
          <TabsTrigger
            value="acquisition"
            className="data-[state=active]:bg-gold-soft data-[state=active]:text-jetblack rounded-md px-4 py-2"
          >
            Acquisition
          </TabsTrigger>
          <TabsTrigger
            value="geography"
            className="data-[state=active]:bg-gold-soft data-[state=active]:text-jetblack rounded-md px-4 py-2"
          >
            Geography
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visitors" className="space-y-6">
          <Card className="border-gold/30 bg-charcoal shadow-lg">
            <CardHeader>
              <CardTitle className="text-gold font-display text-lg">Visitor Trends</CardTitle>
              <CardDescription className="text-offwhite/70">Visitors and page views over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={visitorData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                    dataKey="visitors"
                    stroke="#D4AF37"
                    fillOpacity={1}
                    fill="url(#colorVisitors)"
                    name="Visitors"
                  />
                  <Area
                    type="monotone"
                    dataKey="pageViews"
                    stroke="#82ca9d"
                    fillOpacity={1}
                    fill="url(#colorPageViews)"
                    name="Page Views"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-gold/30 bg-charcoal shadow-lg">
              <CardHeader>
                <CardTitle className="text-gold font-display text-lg">Device Distribution</CardTitle>
                <CardDescription className="text-offwhite/70">Visitors by device type</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row items-center justify-between">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }}
                      labelStyle={{ color: "#FFD700" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  {deviceData.map((entry, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <div className="flex items-center">
                        {entry.name === "Desktop" ? (
                          <Laptop className="h-4 w-4 mr-2 text-offwhite/70" />
                        ) : entry.name === "Mobile" ? (
                          <Smartphone className="h-4 w-4 mr-2 text-offwhite/70" />
                        ) : (
                          <Laptop className="h-4 w-4 mr-2 text-offwhite/70" />
                        )}
                        <span className="text-offwhite">{entry.name}</span>
                      </div>
                      <span className="ml-2 text-gold font-medium">{entry.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-gold/30 bg-charcoal shadow-lg">
              <CardHeader>
                <CardTitle className="text-gold font-display text-lg">User Engagement</CardTitle>
                <CardDescription className="text-offwhite/70">Key engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <Badge className="bg-gold/20 text-gold mr-2">New</Badge>
                        <span className="text-offwhite">New Visitors</span>
                      </div>
                      <span className="text-gold font-medium">68.5%</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <Badge className="bg-blue-500/20 text-blue-500 mr-2">Return</Badge>
                        <span className="text-offwhite">Returning Visitors</span>
                      </div>
                      <span className="text-gold font-medium">31.5%</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <Badge className="bg-green-500/20 text-green-500 mr-2">Active</Badge>
                        <span className="text-offwhite">Active Users</span>
                      </div>
                      <span className="text-gold font-medium">12,345</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gold/20">
                    <h4 className="text-sm font-medium text-offwhite mb-4">Top Pages</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-offwhite/70">/shop</span>
                        <span className="text-gold font-medium">32.4%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-offwhite/70">/product/messi-jersey</span>
                        <span className="text-gold font-medium">18.7%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-offwhite/70">/videos</span>
                        <span className="text-gold font-medium">12.3%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-offwhite/70">/authenticity</span>
                        <span className="text-gold font-medium">8.5%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          {/* Behavior tab content */}
          <Card className="border-gold/30 bg-charcoal shadow-lg">
            <CardHeader>
              <CardTitle className="text-gold font-display text-lg">User Behavior</CardTitle>
              <CardDescription className="text-offwhite/70">How users interact with your site</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Behavior content here */}
              <div className="text-center py-12 text-offwhite/70">
                Behavior analytics content will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="acquisition" className="space-y-6">
          <Card className="border-gold/30 bg-charcoal shadow-lg">
            <CardHeader>
              <CardTitle className="text-gold font-display text-lg">Traffic Sources</CardTitle>
              <CardDescription className="text-offwhite/70">Where your visitors come from</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center justify-between">
              <ResponsiveContainer width={300} height={300}>
                <PieChart>
                  <Pie
                    data={trafficSourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {trafficSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }}
                    labelStyle={{ color: "#FFD700" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-4 flex-1">
                {trafficSourceData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="text-offwhite">{entry.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gold font-medium">{entry.value}%</span>
                      <Badge
                        className={`ml-2 ${
                          index % 2 === 0 ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                        }`}
                      >
                        {index % 2 === 0 ? "↑" : "↓"} {Math.floor(Math.random() * 10) + 1}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-6">
          <Card className="border-gold/30 bg-charcoal shadow-lg">
            <CardHeader>
              <CardTitle className="text-gold font-display text-lg">Geographic Distribution</CardTitle>
              <CardDescription className="text-offwhite/70">Where your visitors are located</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="relative w-full md:w-1/2 h-[300px] flex items-center justify-center">
                  <Map className="h-48 w-48 text-gold/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Badge className="bg-gold text-jetblack">World Map Visualization</Badge>
                  </div>
                </div>
                <div className="w-full md:w-1/2 space-y-4">
                  {geoData.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-offwhite">{entry.name}</span>
                      </div>
                      <span className="text-gold font-medium">{entry.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
