"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface InventoryMetrics {
  totalProperties: number
  publishedProperties: number
  publishedCoverage: number
  averageDaysOnMarket: number
  propertiesByStatus: {
    draft: number
    published: number
    sold: number
    rented: number
  }
}

export function useInventoryMetrics() {
  const supabase = createClient()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["inventory-metrics"],
    queryFn: async (): Promise<InventoryMetrics> => {
      // Fetch all properties
      const { data: properties, error: propertiesError } = await supabase
        .from("properties")
        .select("id, published, status, created_at")

      if (propertiesError) throw propertiesError

      const totalProperties = properties?.length || 0
      const publishedProperties = properties?.filter((p) => p.published).length || 0
      const publishedCoverage = totalProperties > 0 ? (publishedProperties / totalProperties) * 100 : 0

      // Calculate average days on market
      const now = new Date()
      const totalDays = properties?.reduce((sum, p) => {
        const days = Math.floor((now.getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24))
        return sum + days
      }, 0) || 0
      const averageDaysOnMarket = totalProperties > 0 ? totalDays / totalProperties : 0

      // Count by status
      const statusCounts = {
        draft: 0,
        published: 0,
        sold: 0,
        rented: 0,
      }

      properties?.forEach((p) => {
        const status = p.status || "draft"
        if (status in statusCounts) {
          statusCounts[status as keyof typeof statusCounts]++
        }
      })

      return {
        totalProperties,
        publishedProperties,
        publishedCoverage,
        averageDaysOnMarket: Math.round(averageDaysOnMarket),
        propertiesByStatus: statusCounts,
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
  }
}

