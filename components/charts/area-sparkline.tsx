"use client"

import * as React from "react"
import { AreaChart, Area, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

interface AreaSparklineProps {
  data: Array<{ value: number }>
  color?: string
  className?: string
  height?: number
}

export function AreaSparkline({
  data,
  color = "hsl(var(--chart-1))",
  className,
  height = 40,
}: AreaSparklineProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className={cn("flex items-center justify-center text-xs text-muted-foreground", className)}
        style={{ height }}
      >
        No data
      </div>
    )
  }

  const chartData = data.map((item, index) => ({
    value: item.value,
    index,
  }))

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={`url(#gradient-${color})`}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}


