import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  description?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
}

export function StatsCard({ title, value, icon, description, trend, trendValue }: StatsCardProps) {
  return (
    <Card className="border-gold-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-400 font-body">{title}</CardTitle>
        <div className="text-gold-500">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-display">{value}</div>
      </CardContent>
      {(description || trendValue) && (
        <CardFooter className="pt-0">
          <p className="text-xs text-gray-400 font-body">
            {trendValue && (
              <span
                className={
                  trend === "up" ? "text-green-500 mr-1" : trend === "down" ? "text-red-500 mr-1" : "text-gray-500 mr-1"
                }
              >
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
              </span>
            )}
            {description}
          </p>
        </CardFooter>
      )}
    </Card>
  )
}
