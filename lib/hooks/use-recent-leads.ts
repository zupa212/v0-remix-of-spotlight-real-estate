"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface RecentLead {
  id: string
  name: string
  property_code: string | null
  stage: string
  score: number | null
  source: string | null
  created_at: string
}

export function useRecentLeads(limit: number = 8) {
  const supabase = createClient()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["recent-leads", limit],
    queryFn: async (): Promise<RecentLead[]> => {
      const { data, error } = await supabase
        .from("leads")
        .select("id, name, property_code, stage, score, source, created_at")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
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


