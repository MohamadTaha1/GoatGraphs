import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface InventoryItem {
  name: string
  team: string
  stock: number
  total: number
  status: "in-stock" | "low-stock" | "out-of-stock"
}

const INVENTORY_DATA: InventoryItem[] = [
  {
    name: "Cristiano Ronaldo Signed Jersey",
    team: "Manchester United",
    stock: 12,
    total: 15,
    status: "in-stock",
  },
  {
    name: "Lionel Messi Signed Jersey",
    team: "Inter Miami CF",
    stock: 3,
    total: 15,
    status: "low-stock",
  },
  {
    name: "Erling Haaland Signed Jersey",
    team: "Manchester City",
    stock: 8,
    total: 15,
    status: "in-stock",
  },
  {
    name: "Kylian Mbappé Signed Jersey",
    team: "Paris Saint-Germain",
    stock: 0,
    total: 10,
    status: "out-of-stock",
  },
  {
    name: "Mohamed Salah Signed Jersey",
    team: "Liverpool",
    stock: 2,
    total: 10,
    status: "low-stock",
  },
]

export function InventoryStatus() {
  const getStatusColor = (status: InventoryItem["status"]) => {
    switch (status) {
      case "in-stock":
        return "text-green-500"
      case "low-stock":
        return "text-orange-500"
      case "out-of-stock":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getProgressColor = (status: InventoryItem["status"]) => {
    switch (status) {
      case "in-stock":
        return "bg-green-500"
      case "low-stock":
        return "bg-orange-500"
      case "out-of-stock":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="border-gold-700">
      <CardHeader>
        <CardTitle className="text-gold-500 font-display">Inventory Status</CardTitle>
        <CardDescription className="font-body">Current stock levels of top items</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {INVENTORY_DATA.map((item) => (
            <div key={`${item.name}-${item.team}`} className="space-y-1">
              <div className="flex justify-between">
                <p className="text-sm font-medium font-body">{item.name}</p>
                <p className={`text-sm font-medium font-body ${getStatusColor(item.status)}`}>
                  {item.stock}/{item.total}
                </p>
              </div>
              <div className="flex items-center">
                <Progress
                  value={(item.stock / item.total) * 100}
                  className="h-2"
                  indicatorClassName={getProgressColor(item.status)}
                />
              </div>
              <p className="text-xs text-gray-400 font-body">{item.team}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
