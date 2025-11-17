"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface ConversionFunnelData {
  stage: string
  count: number
  percentage: number
}

export function useConversionFunnel() {
  const supabase = createClient()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["conversion-funnel"],
    queryFn: async (): Promise<ConversionFunnelData[]> => {
      // Get total leads count
      const { count: totalLeads } = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })

      if (!totalLeads || totalLeads === 0) {
        return []
      }

      // Get counts by stage
      const stages = ["new", "contacted", "qualified", "viewing", "offer", "won", "lost"]
      const stageCounts = await Promise.all(
        stages.map(async (stage) => {
          const { count } = await supabase
            .from("leads")
            .select("id", { count: "exact", head: true })
            .eq("stage", stage)

          return {
            stage,
            count: count || 0,
            percentage: totalLeads > 0 ? ((count || 0) / totalLeads) * 100 : 0,
          }
        })
      )

      return stageCounts.filter((item) => item.count > 0)
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


