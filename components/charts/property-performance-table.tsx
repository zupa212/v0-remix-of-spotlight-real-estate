"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminEmptyState } from "@/components/admin-empty-state"
import { TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PropertyPerformanceTableProps {
  data: Array<{
    property_id: string
    property_code: string
    title: string
    views: number
    clicks: number
    inquiries: number
    conversionRate: number
    daysOnMarket: number
  }> | undefined
  title: string
  isLoading?: boolean
  error?: Error | null
}

export function PropertyPerformanceTable({
  data,
  title,
  isLoading,
  error,
}: PropertyPerformanceTableProps) {
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
            icon={TrendingUp}
            title="No property performance data"
            description="Property performance metrics will appear here once you have properties with views."
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">Inquiries</TableHead>
              <TableHead className="text-right">Conversion</TableHead>
              <TableHead className="text-right">Days on Market</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((property) => (
              <TableRow key={property.property_id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{property.property_code}</div>
                    <div className="text-sm text-muted-foreground">{property.title}</div>
                  </div>
                </TableCell>
                <TableCell className="text-right">{property.views}</TableCell>
                <TableCell className="text-right">{property.clicks}</TableCell>
                <TableCell className="text-right">{property.inquiries}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={property.conversionRate > 5 ? "default" : "secondary"}>
                    {property.conversionRate.toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{property.daysOnMarket}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

