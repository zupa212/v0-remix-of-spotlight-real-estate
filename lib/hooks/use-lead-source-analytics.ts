"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface LeadSourceData {
  source: string
  count: number
  percentage: number
  converted: number
  conversionRate: number
}

export function useLeadSourceAnalytics(rangeDays: number = 30) {
  const supabase = createClient()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["lead-source-analytics", rangeDays],
    queryFn: async (): Promise<LeadSourceData[]> => {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - rangeDays * 24 * 60 * 60 * 1000)

      // Fetch all leads in range
      const { data: leads, error: leadsError } = await supabase
        .from("leads")
        .select("lead_source, status")
        .gte("created_at", startDate.toISOString())

      if (leadsError) throw leadsError

      // Group by source
      const sourceMap = new Map<string, { total: number; converted: number }>()

      leads?.forEach((lead) => {
        const source = lead.lead_source || "unknown"
        const isConverted = ["won", "closed_won", "accepted"].includes(lead.status || "")

        if (!sourceMap.has(source)) {
          sourceMap.set(source, { total: 0, converted: 0 })
        }

        const stats = sourceMap.get(source)!
        stats.total++
        if (isConverted) {
          stats.converted++
        }
      })

      const totalLeads = leads?.length || 0

      return Array.from(sourceMap.entries())
        .map(([source, stats]) => ({
          source,
          count: stats.total,
          percentage: totalLeads > 0 ? (stats.total / totalLeads) * 100 : 0,
          converted: stats.converted,
          conversionRate: stats.total > 0 ? (stats.converted / stats.total) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count)
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

