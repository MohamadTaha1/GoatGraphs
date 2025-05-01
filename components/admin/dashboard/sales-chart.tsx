"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useRef } from "react"

export function SalesChart() {
  const chartRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const mockCanvas = () => {
      const canvas = chartRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Set styles
      ctx.lineWidth = 2
      ctx.strokeStyle = "#D4AF37"
      ctx.fillStyle = "rgba(212, 175, 55, 0.1)"

      // Define data points (mock data for a chart)
      const data = [12, 19, 8, 15, 22, 14, 20, 12, 18, 24, 16, 19]
      const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

      // Calculate dimensions
      const padding = 40
      const width = canvas.width - padding * 2
      const height = canvas.height - padding * 2
      const max = Math.max(...data) * 1.2

      // Draw axes
      ctx.beginPath()
      ctx.moveTo(padding, padding)
      ctx.lineTo(padding, height + padding)
      ctx.lineTo(width + padding, height + padding)
      ctx.strokeStyle = "#333"
      ctx.stroke()

      // Draw chart
      ctx.beginPath()

      data.forEach((value, index) => {
        const x = padding + (width / (data.length - 1)) * index
        const y = padding + height - (value / max) * height

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()

      // Fill area under the line
      ctx.lineTo(padding + width, padding + height)
      ctx.lineTo(padding, padding + height)
      ctx.closePath()
      ctx.fillStyle = "rgba(212, 175, 55, 0.1)"
      ctx.fill()

      // Draw data points
      data.forEach((value, index) => {
        const x = padding + (width / (data.length - 1)) * index
        const y = padding + height - (value / max) * height

        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = "#D4AF37"
        ctx.fill()
      })

      // Draw labels
      ctx.fillStyle = "#999"
      ctx.font = "10px Arial"
      ctx.textAlign = "center"

      labels.forEach((label, index) => {
        const x = padding + (width / (labels.length - 1)) * index
        ctx.fillText(label, x, height + padding + 15)
      })

      // Draw Y-axis labels
      ctx.textAlign = "right"
      for (let i = 0; i <= 5; i++) {
        const value = Math.round((max / 5) * i)
        const y = padding + height - (value / max) * height
        ctx.fillText(`$${value}k`, padding - 5, y + 3)
      }
    }

    mockCanvas()

    // Redraw on resize
    const handleResize = () => mockCanvas()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <Card className="border-gold-700">
      <CardHeader>
        <CardTitle className="text-gold-500 font-display">Sales Overview</CardTitle>
        <CardDescription className="font-body">Monthly sales performance</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="revenue">
          <TabsList className="grid w-full grid-cols-3 bg-black border border-gold-700 mb-4">
            <TabsTrigger
              value="revenue"
              className="text-gold-500 data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
            >
              Revenue
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="text-gold-500 data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="customers"
              className="text-gold-500 data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
            >
              Customers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="h-[300px] relative">
            <canvas ref={chartRef} className="w-full h-full"></canvas>
          </TabsContent>

          <TabsContent value="orders" className="h-[300px] relative">
            <canvas ref={chartRef} className="w-full h-full"></canvas>
          </TabsContent>

          <TabsContent value="customers" className="h-[300px] relative">
            <canvas ref={chartRef} className="w-full h-full"></canvas>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-4">
          <div className="text-center">
            <p className="text-sm text-gray-400 font-body">Total Revenue</p>
            <p className="text-xl font-bold font-display">$187,429.25</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400 font-body">Orders</p>
            <p className="text-xl font-bold font-display">842</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400 font-body">Avg. Order Value</p>
            <p className="text-xl font-bold font-display">$222.60</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
