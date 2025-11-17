"use client"

import * as React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminEmptyState } from "@/components/admin-empty-state"
import { BarChart3 } from "lucide-react"

interface LeadSourceBarProps {
  data: Array<{
    source: string
    count: number
    percentage: number
    converted: number
    conversionRate: number
  }> | undefined
  title: string
  isLoading?: boolean
  error?: Error | null
}

const COLORS = ["#0EA5E9", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899"]

export function LeadSourceBar({ data, title, isLoading, error }: LeadSourceBarProps) {
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
            Error loading data: {error.message}
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
            icon={BarChart3}
            title="No lead source data"
            description="Lead source analytics will appear here once you have leads."
          />
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((item) => ({
    source: item.source,
    leads: item.count,
    converted: item.converted,
    conversionRate: item.conversionRate,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="source"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === "conversionRate") {
                  return [`${value.toFixed(1)}%`, "Conversion Rate"]
                }
                return [value, name === "leads" ? "Total Leads" : "Converted"]
              }}
            />
            <Legend />
            <Bar dataKey="leads" fill="#0EA5E9" name="Total Leads" />
            <Bar dataKey="converted" fill="#10B981" name="Converted" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          {data.map((item, index) => (
            <div key={item.source} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="font-medium">{item.source}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{item.count} leads</div>
                <div className="text-xs text-muted-foreground">
                  {item.conversionRate.toFixed(1)}% conversion
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

