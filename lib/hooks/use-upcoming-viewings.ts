"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface UpcomingViewing {
  id: string
  scheduled_date: string
  property_id: string | null
  lead_id: string | null
  agent_id: string | null
  property_code: string | null
  lead_name: string | null
  agent_name: string | null
}

export function useUpcomingViewings(rangeDays: number = 7) {
  const supabase = createClient()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["upcoming-viewings", rangeDays],
    queryFn: async (): Promise<UpcomingViewing[]> => {
      const now = new Date()
      const endDate = new Date(now.getTime() + rangeDays * 24 * 60 * 60 * 1000)

      const { data: viewings, error: viewingsError } = await supabase
        .from("viewings")
        .select("id, scheduled_date, property_id, lead_id, agent_id")
        .gte("scheduled_date", now.toISOString())
        .lte("scheduled_date", endDate.toISOString())
        .order("scheduled_date", { ascending: true })

      if (viewingsError) throw viewingsError

      // Fetch related data
      const enrichedViewings = await Promise.all(
        (viewings || []).map(async (viewing) => {
          const [property, lead, agent] = await Promise.all([
            viewing.property_id
              ? supabase
                  .from("properties")
                  .select("property_code")
                  .eq("id", viewing.property_id)
                  .single()
              : { data: null },
            viewing.lead_id
              ? supabase
                  .from("leads")
                  .select("full_name")
                  .eq("id", viewing.lead_id)
                  .single()
              : { data: null },
            viewing.agent_id
              ? supabase
                  .from("agents")
                  .select("name_en")
                  .eq("id", viewing.agent_id)
                  .single()
              : { data: null },
          ])

          return {
            ...viewing,
            scheduled_at: viewing.scheduled_date, // Alias for compatibility
            property_code: property.data?.property_code || null,
            lead_name: lead.data?.full_name || null,
            agent_name: agent.data?.name_en || null,
          }
        })
      )

      return enrichedViewings
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


