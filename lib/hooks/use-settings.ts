"use client"

import { useQuery } from "@tanstack/react-query"
import { getSettings } from "@/lib/actions/settings"

export interface Settings {
  logo_url: string | null
  company_name: string
  company_email: string
  primary_color: string
  accent_color: string
  hot_threshold: number
  warm_threshold: number
}

export function useSettings() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["settings"],
    queryFn: async (): Promise<Settings> => {
      const result = await getSettings()
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to load settings")
      }
      return result.data
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  return {
    settings: data,
    isLoading,
    isError,
    error,
    refetch,
  }
}

