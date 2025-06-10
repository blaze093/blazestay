import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

interface AdminMetricCardProps {
  title: string
  value: number | string
  description: string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
  trendValue?: string
}

export default function AdminMetricCard({
  title,
  value,
  description,
  icon,
  trend = "neutral",
  trendValue,
}: AdminMetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="bg-green-100 p-2 rounded-lg">
            <div className="text-dark-olive">{icon}</div>
          </div>
          {trend && trendValue && (
            <div
              className={`flex items-center text-sm ${
                trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-500"
              }`}
            >
              {trend === "up" && <ArrowUpRight className="h-4 w-4 mr-1" />}
              {trend === "down" && <ArrowDownRight className="h-4 w-4 mr-1" />}
              {trend === "neutral" && <Minus className="h-4 w-4 mr-1" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
