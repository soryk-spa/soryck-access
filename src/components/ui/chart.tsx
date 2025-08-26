"use client"

import * as React from "react"
import { ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

const Chart = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("w-full h-[350px]", className)}
    {...props}
  />
))
Chart.displayName = "Chart"

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config?: Record<string, { label: string; color?: string }>
    children: React.ReactElement
  }
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("w-full", className)}
    {...props}
  >
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </div>
))
ChartContainer.displayName = "ChartContainer"

interface PayloadItem {
  color: string
  dataKey: string
  value: string | number
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: PayloadItem[]
  label?: string
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "line" | "dot" | "dashed"
  className?: string
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(
  (
    {
      active,
      payload,
      label,
      hideLabel,
      hideIndicator,
      indicator = "dot",
      className,
      ...props
    },
    ref
  ) => {
    if (!active || !payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-background p-2 shadow-sm",
          className
        )}
        {...props}
      >
        {!hideLabel && label && (
          <div className="mb-2 font-medium">{label}</div>
        )}
        <div className="grid gap-2">
          {payload.map((item: PayloadItem, index: number) => (
            <div
              key={index}
              className="flex items-center gap-2"
            >
              {!hideIndicator && (
                <div
                  className={cn(
                    "h-2.5 w-2.5 shrink-0 rounded-[2px]",
                    indicator === "dot" && "rounded-full",
                    indicator === "line" && "w-4 h-0.5",
                    indicator === "dashed" && "w-4 h-0.5 border-dashed border-t-2"
                  )}
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              <div className="flex flex-col">
                <span className="text-[0.70rem] uppercase text-muted-foreground">
                  {item.dataKey}
                </span>
                <span className="font-bold">
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

export {
  Chart,
  ChartContainer,
  ChartTooltipContent,
}
