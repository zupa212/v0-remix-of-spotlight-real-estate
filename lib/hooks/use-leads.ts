"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { useEffect } from "react"

export interface Lead {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  status: string
  property_id: string | null
  agent_id: string | null
  lead_source: string | null
  created_at: string
  updated_at: string
  last_activity: string | null
}

interface UseLeadsOptions {
  stage?: string
  agent?: string
  limit?: number
  enableRealtime?: boolean
}

export function useLeads(options: UseLeadsOptions = {}) {
  const supabase = createClient()
  const enableRealtime = options.enableRealtime !== false // Default to true

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["leads", options],
    queryFn: async (): Promise<Lead[]> => {
      // Select columns - updated_at will be added by migration, but we'll handle gracefully
      let query = supabase
        .from("leads")
        .select("id, full_name, email, phone, status, property_id, agent_id, lead_source, created_at")

      if (options.stage) {
        query = query.eq("status", options.stage)
      }
      if (options.agent) {
        query = query.eq("agent_id", options.agent)
      }
      if (options.limit) {
        query = query.limit(options.limit)
      }

      // Order by created_at (updated_at will be available after migration)
      query = query.order("created_at", { ascending: false })

      const { data, error } = await query

      if (error) throw error

      // Fetch last activity for each lead
      const leadsWithActivity = await Promise.all(
        (data || []).map(async (lead) => {
          const { data: activity } = await supabase
            .from("lead_activity")
            .select("created_at")
            .eq("lead_id", lead.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          return {
            ...lead,
            name: lead.full_name, // Alias for compatibility
            stage: lead.status, // Alias for compatibility
            source: lead.lead_source, // Alias for compatibility
            updated_at: (lead as any).updated_at || lead.created_at, // Fallback to created_at if updated_at doesn't exist
            last_activity: activity?.created_at || (lead as any).updated_at || lead.created_at,
          }
        })
      )

      return leadsWithActivity
    },
  })

  // Real-time subscription for leads
  useEffect(() => {
    if (!enableRealtime) return

    const channel = supabase
      .channel(`leads-changes-${JSON.stringify(options)}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leads",
        },
        () => {
          // Refetch on any change
          refetch()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lead_activity",
        },
        () => {
          // Refetch when activity changes
          refetch()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [enableRealtime, refetch, JSON.stringify(options)])

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
  }
}

