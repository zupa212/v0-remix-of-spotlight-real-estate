"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface PropertyDistributionItem {
  name: string
  value: number
  color?: string
}

export function usePropertyDistribution(groupBy: "type" | "region" = "type") {
  const supabase = createClient()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["property-distribution", groupBy],
    queryFn: async (): Promise<PropertyDistributionItem[]> => {
      const { data: properties, error: propertiesError } = await supabase
        .from("properties")
        .select(groupBy === "type" ? "property_type" : "region_id")

      if (propertiesError) throw propertiesError

      // Group and count
      const distribution = new Map<string, number>()

      for (const property of properties || []) {
        const key =
          groupBy === "type"
            ? property.property_type || "Unknown"
            : property.region_id || "Unknown"

        distribution.set(key, (distribution.get(key) || 0) + 1)
      }

      // If grouping by region, fetch region names
      if (groupBy === "region") {
        const regionIds = Array.from(distribution.keys()).filter((id) => id !== "Unknown")
        if (regionIds.length > 0) {
          const { data: regions } = await supabase
            .from("regions")
            .select("id, name_en")
            .in("id", regionIds)

          const regionMap = new Map(regions?.map((r) => [r.id, r.name_en]) || [])

          return Array.from(distribution.entries()).map(([id, value]) => ({
            name: id === "Unknown" ? "Unknown" : regionMap.get(id) || id,
            value,
          }))
        }
      }

      return Array.from(distribution.entries()).map(([name, value]) => ({
        name,
        value,
      }))
    },
  })

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
  }
}


