"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface RecentLead {
  id: string
  full_name: string
  status: string
  lead_source: string | null
  created_at: string
  // Aliases for compatibility
  name: string
  stage: string
  source: string | null
}

export function useRecentLeads(limit: number = 8) {
  const supabase = createClient()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["recent-leads", limit],
    queryFn: async (): Promise<RecentLead[]> => {
      const { data, error } = await supabase
        .from("leads")
        .select("id, full_name, status, lead_source, created_at")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      
      // Add aliases for compatibility
      return (data || []).map(lead => ({
        ...lead,
        name: lead.full_name,
        stage: lead.status,
        source: lead.lead_source,
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


