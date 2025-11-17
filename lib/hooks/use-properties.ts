"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { useEffect } from "react"

export interface Property {
  id: string
  code: string | null
  title_en: string | null
  title_gr: string | null
  city: string | null
  region_id: string | null
  property_type: string | null
  status: string | null
  price_sale: number | null
  beds: number | null
  baths: number | null
  area: number | null
  published: boolean
  updated_at: string
  cover_image_url: string | null
}

interface UsePropertiesOptions {
  status?: string
  type?: string
  region?: string
  agent?: string
  published?: boolean
  limit?: number
  offset?: number
  enableRealtime?: boolean
}

export function useProperties(options: UsePropertiesOptions = {}) {
  const supabase = createClient()
  const enableRealtime = options.enableRealtime !== false // Default to true

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["properties", options],
    queryFn: async (): Promise<Property[]> => {
      let query = supabase
        .from("properties")
        .select("id, code, title_en, title_gr, city, region_id, property_type, status, price_sale, beds, baths, area, published, updated_at, cover_image_url, agent_id")

      if (options.status && options.status !== "all") {
        query = query.eq("status", options.status)
      }
      if (options.type && options.type !== "all") {
        query = query.eq("property_type", options.type)
      }
      if (options.region && options.region !== "all") {
        query = query.eq("region_id", options.region)
      }
      if (options.agent && options.agent !== "all") {
        query = query.eq("agent_id", options.agent)
      }
      if (options.published !== undefined) {
        query = query.eq("published", options.published)
      }
      if (options.limit) {
        query = query.limit(options.limit)
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      query = query.order("updated_at", { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
  })

  // Real-time subscription
  useEffect(() => {
    if (!enableRealtime) return

    const channel = supabase
      .channel(`properties-changes-${JSON.stringify(options)}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "properties",
        },
        () => {
          // Refetch on any change
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

