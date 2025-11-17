"use client"

import * as React from "react"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface AdminKpiCardProps {
  title: string
  value: string | number
  delta?: number
  deltaLabel?: string
  icon: LucideIcon
  isLoading?: boolean
  className?: string
}

export function AdminKpiCard({
  title,
  value,
  delta,
  deltaLabel,
  icon: Icon,
  isLoading,
  className,
}: AdminKpiCardProps) {
  const deltaType = delta !== undefined ? (delta >= 0 ? "positive" : "negative") : "neutral"

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-24" />
          </CardTitle>
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {delta !== undefined && (
          <div className="flex items-center gap-1 text-xs mt-1">
            {deltaType === "positive" ? (
              <TrendingUp className="h-3 w-3 text-emerald-500" />
            ) : deltaType === "negative" ? (
              <TrendingDown className="h-3 w-3 text-red-500" />
            ) : null}
            <span
              className={cn(
                "font-medium",
                deltaType === "positive" && "text-emerald-500",
                deltaType === "negative" && "text-red-500",
                deltaType === "neutral" && "text-muted-foreground"
              )}
            >
              {delta >= 0 ? "+" : ""}
              {delta} {deltaLabel || "vs last period"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


