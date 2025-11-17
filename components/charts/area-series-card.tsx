"use client"

import * as React from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminEmptyState } from "@/components/admin-empty-state"
import { TrendingUp } from "lucide-react"
import { format } from "date-fns"

interface AreaSeriesCardProps {
  data: Array<{
    date: string
    leads?: number
    viewings?: number
    offers?: number
    won?: number
  }> | undefined
  title: string
  isLoading?: boolean
  error?: Error | null
}

export function AreaSeriesCard({ data, title, isLoading, error }: AreaSeriesCardProps) {
  const [activeTab, setActiveTab] = React.useState<"leads" | "viewings" | "offers" | "won">(
    "leads"
  )

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Failed to load chart data: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminEmptyState
            icon={TrendingUp}
            title="No data"
            description="No data available for this chart."
          />
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return format(date, "MMM d")
    } catch {
      return dateStr
    }
  }

  const chartData = data.map((item) => ({
    ...item,
    date: formatDate(item.date),
  }))

  const getDataKey = () => {
    switch (activeTab) {
      case "leads":
        return "leads"
      case "viewings":
        return "viewings"
      case "offers":
        return "offers"
      case "won":
        return "won"
      default:
        return "leads"
    }
  }

  const getColor = () => {
    switch (activeTab) {
      case "leads":
        return "hsl(var(--chart-1))"
      case "viewings":
        return "hsl(var(--chart-2))"
      case "offers":
        return "hsl(var(--chart-3))"
      case "won":
        return "hsl(var(--chart-4))"
      default:
        return "hsl(var(--chart-1))"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="viewings">Viewings</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="won">Won</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={getDataKey()}
                  stroke={getColor()}
                  fill={getColor()}
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}


