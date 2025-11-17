"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface Viewing {
  id: string
  scheduled_at: string
  property_id: string | null
  lead_id: string | null
  agent_id: string | null
  type: string
  status: string
  meeting_link: string | null
  property_code: string | null
  lead_name: string | null
  agent_name: string | null
  notes: string | null
}

interface UseViewingsOptions {
  agent?: string
  property?: string
  dateFrom?: string
  dateTo?: string
  upcoming?: boolean
}

export function useViewings(options: UseViewingsOptions = {}) {
  const supabase = createClient()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["viewings", options],
    queryFn: async (): Promise<Viewing[]> => {
      const now = new Date()
      let query = supabase
        .from("viewings")
        .select("id, scheduled_at, property_id, lead_id, agent_id, type, status, meeting_link, notes")

      if (options.agent) {
        query = query.eq("agent_id", options.agent)
      }
      if (options.property) {
        query = query.eq("property_id", options.property)
      }
      if (options.dateFrom) {
        query = query.gte("scheduled_at", options.dateFrom)
      }
      if (options.dateTo) {
        query = query.lte("scheduled_at", options.dateTo)
      }
      if (options.upcoming !== undefined) {
        if (options.upcoming) {
          query = query.gte("scheduled_at", now.toISOString())
        } else {
          query = query.lt("scheduled_at", now.toISOString())
        }
      }

      query = query.order("scheduled_at", { ascending: options.upcoming !== false })

      const { data: viewings, error: viewingsError } = await query

      if (viewingsError) throw viewingsError

      // Enrich with related data
      const enrichedViewings = await Promise.all(
        (viewings || []).map(async (viewing) => {
          const [property, lead, agent] = await Promise.all([
            viewing.property_id
              ? supabase
                  .from("properties")
                  .select("code")
                  .eq("id", viewing.property_id)
                  .single()
              : { data: null },
            viewing.lead_id
              ? supabase
                  .from("leads")
                  .select("name")
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
            property_code: property.data?.code || null,
            lead_name: lead.data?.name || null,
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


