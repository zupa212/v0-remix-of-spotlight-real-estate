"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface PageViewsDataPoint {
  date: string
  views: number
  uniqueViews: number
}

export interface PageViewsByRoute {
  route: string
  views: number
  uniqueViews: number
}

export function usePageViewsAnalytics(rangeDays: number = 30) {
  const supabase = createClient()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["page-views-analytics", rangeDays],
    queryFn: async (): Promise<PageViewsDataPoint[]> => {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - rangeDays * 24 * 60 * 60 * 1000)

      const { data: pageViews, error: viewsError } = await supabase
        .from("analytics_page_views")
        .select("viewed_at, session_id")
        .gte("viewed_at", startDate.toISOString())
        .order("viewed_at", { ascending: true })

      if (viewsError) throw viewsError

      // Group by date
      const dateMap = new Map<string, { views: number; uniqueSessions: Set<string> }>()

      // Initialize all dates
      for (let i = 0; i < rangeDays; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const dateKey = date.toISOString().split("T")[0]
        dateMap.set(dateKey, { views: 0, uniqueSessions: new Set() })
      }

      // Count views
      pageViews?.forEach((view) => {
        const dateKey = view.viewed_at.split("T")[0]
        const stats = dateMap.get(dateKey)
        if (stats) {
          stats.views++
          if (view.session_id) {
            stats.uniqueSessions.add(view.session_id)
          }
        }
      })

      return Array.from(dateMap.entries())
        .map(([date, stats]) => ({
          date,
          views: stats.views,
          uniqueViews: stats.uniqueSessions.size,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
  }
}

export function usePageViewsByRoute(rangeDays: number = 30) {
  const supabase = createClient()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["page-views-by-route", rangeDays],
    queryFn: async (): Promise<PageViewsByRoute[]> => {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - rangeDays * 24 * 60 * 60 * 1000)

      const { data: pageViews, error: viewsError } = await supabase
        .from("analytics_page_views")
        .select("route, session_id")
        .gte("viewed_at", startDate.toISOString())

      if (viewsError) throw viewsError

      // Group by route
      const routeMap = new Map<string, { views: number; uniqueSessions: Set<string> }>()

      pageViews?.forEach((view) => {
        const route = view.route || "unknown"
        if (!routeMap.has(route)) {
          routeMap.set(route, { views: 0, uniqueSessions: new Set() })
        }

        const stats = routeMap.get(route)!
        stats.views++
        if (view.session_id) {
          stats.uniqueSessions.add(view.session_id)
        }
      })

      return Array.from(routeMap.entries())
        .map(([route, stats]) => ({
          route,
          views: stats.views,
          uniqueViews: stats.uniqueSessions.size,
        }))
        .sort((a, b) => b.views - a.views)
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
  }
}

