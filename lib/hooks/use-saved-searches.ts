"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface SavedSearch {
  id: string
  name: string
  filters: Record<string, any>
  channels: string[]
  frequency: string
  status: string
  last_sent: string | null
  created_at: string
}

export function useSavedSearches() {
  const supabase = createClient()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["saved-searches"],
    queryFn: async (): Promise<SavedSearch[]> => {
      const { data: searches, error: searchesError } = await supabase
        .from("saved_searches")
        .select("id, name, filters, channels, frequency, status, last_sent, created_at")
        .order("created_at", { ascending: false })

      if (searchesError) throw searchesError
      return searches || []
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


