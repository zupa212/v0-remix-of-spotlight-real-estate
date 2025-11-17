"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface PipelineDataPoint {
  date: string
  leads: number
  viewings: number
  offers: number
  won: number
}

export function usePipelineSeries(rangeDays: number = 30) {
  const supabase = createClient()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["pipeline-series", rangeDays],
    queryFn: async (): Promise<PipelineDataPoint[]> => {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - rangeDays * 24 * 60 * 60 * 1000)

      // Fetch all data
      const [leads, viewings, offers] = await Promise.all([
        supabase
          .from("leads")
          .select("created_at")
          .gte("created_at", startDate.toISOString()),
        supabase
          .from("viewings")
          .select("created_at")
          .gte("created_at", startDate.toISOString()),
        supabase
          .from("offers")
          .select("created_at, status")
          .gte("created_at", startDate.toISOString()),
      ])

      // Group by date
      const dateMap = new Map<string, PipelineDataPoint>()

      // Initialize all dates in range
      for (let i = 0; i < rangeDays; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const dateKey = date.toISOString().split("T")[0]
        dateMap.set(dateKey, {
          date: dateKey,
          leads: 0,
          viewings: 0,
          offers: 0,
          won: 0,
        })
      }

      // Count leads
      leads.data?.forEach((lead) => {
        const dateKey = lead.created_at.split("T")[0]
        const point = dateMap.get(dateKey)
        if (point) point.leads++
      })

      // Count viewings
      viewings.data?.forEach((viewing) => {
        const dateKey = viewing.created_at.split("T")[0]
        const point = dateMap.get(dateKey)
        if (point) point.viewings++
      })

      // Count offers and won
      offers.data?.forEach((offer) => {
        const dateKey = offer.created_at.split("T")[0]
        const point = dateMap.get(dateKey)
        if (point) {
          point.offers++
          if (offer.status === "accepted" || offer.status === "won") {
            point.won++
          }
        }
      })

      return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date))
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


