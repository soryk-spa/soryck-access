import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModernStatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description: string
  trend?: string
  trendDirection?: "up" | "down" | "neutral"
  className?: string
  accentColor?: "blue" | "green" | "purple" | "orange" | "red" | "indigo"
  highlight?: boolean
}

export function ModernStatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendDirection = "up",
  className = "",
  accentColor = "blue",
  highlight = false,
}: ModernStatCardProps) {
  const colorVariants = {
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50",
      icon: "bg-blue-500 text-white shadow-blue-500/25",
      accent: "text-blue-600 dark:text-blue-400",
      trend: "text-blue-500",
      ring: "ring-blue-500/20 border-blue-200 dark:border-blue-800",
    },
    green: {
      bg: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50",
      icon: "bg-green-500 text-white shadow-green-500/25",
      accent: "text-green-600 dark:text-green-400",
      trend: "text-green-500",
      ring: "ring-green-500/20 border-green-200 dark:border-green-800",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50",
      icon: "bg-purple-500 text-white shadow-purple-500/25",
      accent: "text-purple-600 dark:text-purple-400",
      trend: "text-purple-500",
      ring: "ring-purple-500/20 border-purple-200 dark:border-purple-800",
    },
    orange: {
      bg: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50",
      icon: "bg-orange-500 text-white shadow-orange-500/25",
      accent: "text-orange-600 dark:text-orange-400",
      trend: "text-orange-500",
      ring: "ring-orange-500/20 border-orange-200 dark:border-orange-800",
    },
    red: {
      bg: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50",
      icon: "bg-red-500 text-white shadow-red-500/25",
      accent: "text-red-600 dark:text-red-400",
      trend: "text-red-500",
      ring: "ring-red-500/20 border-red-200 dark:border-red-800",
    },
    indigo: {
      bg: "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50",
      icon: "bg-indigo-500 text-white shadow-indigo-500/25",
      accent: "text-indigo-600 dark:text-indigo-400",
      trend: "text-indigo-500",
      ring: "ring-indigo-500/20 border-indigo-200 dark:border-indigo-800",
    },
  }

  const colors = colorVariants[accentColor]

  return (
    <Card
      className={cn(
        "relative transition-all duration-300 hover:shadow-lg",
        highlight ? `${colors.bg} ${colors.ring} ring-1` : "hover:shadow-md",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={cn(
            "h-8 w-8 rounded-md flex items-center justify-center shadow-sm",
            colors.icon
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <p>{description}</p>
          {trend && (
            <Badge
              variant="secondary"
              className={cn(
                "px-1.5 py-0.5 text-xs font-medium",
                trendDirection === "up"
                  ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                  : trendDirection === "down"
                  ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
              )}
            >
              {trendDirection === "up" && "↗"} 
              {trendDirection === "down" && "↘"} 
              {trend}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface StatsGridProps {
  children: React.ReactNode
  className?: string
}

export function StatsGrid({ children, className }: StatsGridProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {children}
    </div>
  )
}
