"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface Agent {
  id: string
  name_en: string
  name_gr: string | null
  avatar_url: string | null
  languages: string[] | null
  email: string | null
  phone: string | null
  bio_en: string | null
  bio_gr: string | null
  specialties: string[] | null
  featured: boolean
  display_order: number | null
  listings_count?: number
}

export function useAgents() {
  const supabase = createClient()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["agents"],
    queryFn: async (): Promise<Agent[]> => {
      const { data: agents, error: agentsError } = await supabase
        .from("agents")
        .select("id, name_en, name_gr, avatar_url, languages, email, phone, bio_en, bio_gr, specialties, featured, display_order")
        .order("display_order", { ascending: true, nullsFirst: false })
        .order("name_en", { ascending: true })

      if (agentsError) throw agentsError

      // Count listings for each agent
      const agentsWithCounts = await Promise.all(
        (agents || []).map(async (agent) => {
          const { count } = await supabase
            .from("properties")
            .select("id", { count: "exact", head: true })
            .eq("agent_id", agent.id)

          return {
            ...agent,
            listings_count: count || 0,
          }
        })
      )

      return agentsWithCounts
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


