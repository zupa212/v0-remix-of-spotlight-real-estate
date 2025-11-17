"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface Region {
  id: string
  name_en: string
  name_gr: string | null
  slug: string
  description_en: string | null
  description_gr: string | null
  image_url: string | null
  featured: boolean
  display_order: number | null
}

export function useRegions() {
  const supabase = createClient()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["regions"],
    queryFn: async (): Promise<Region[]> => {
      const { data: regions, error: regionsError } = await supabase
        .from("regions")
        .select("id, name_en, name_gr, slug, description_en, description_gr, image_url, featured, display_order")
        .order("display_order", { ascending: true, nullsFirst: false })
        .order("name_en", { ascending: true })

      if (regionsError) throw regionsError
      return regions || []
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


