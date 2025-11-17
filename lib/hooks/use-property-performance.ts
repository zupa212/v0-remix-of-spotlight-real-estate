"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface PropertyPerformanceData {
  property_id: string
  property_code: string
  title: string
  views: number
  clicks: number
  inquiries: number
  conversionRate: number
  daysOnMarket: number
}

export function usePropertyPerformance(limit: number = 10, rangeDays: number = 30) {
  const supabase = createClient()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["property-performance", limit, rangeDays],
    queryFn: async (): Promise<PropertyPerformanceData[]> => {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - rangeDays * 24 * 60 * 60 * 1000)

      // Fetch properties
      const { data: properties, error: propertiesError } = await supabase
        .from("properties")
        .select("id, property_code, title_en, title_gr, created_at")

      if (propertiesError) throw propertiesError

      // Fetch page views
      const { data: pageViews, error: viewsError } = await supabase
        .from("analytics_page_views")
        .select("property_id")
        .gte("viewed_at", startDate.toISOString())
        .not("property_id", "is", null)

      if (viewsError) throw viewsError

      // Fetch clicks
      const { data: clicks, error: clicksError } = await supabase
        .from("analytics_clicks")
        .select("route")
        .gte("clicked_at", startDate.toISOString())

      if (clicksError) throw clicksError

      // Fetch inquiries (leads with property_id)
      const { data: inquiries, error: inquiriesError } = await supabase
        .from("leads")
        .select("property_id")
        .gte("created_at", startDate.toISOString())
        .not("property_id", "is", null)

      if (inquiriesError) throw inquiriesError

      // Aggregate data by property
      const performanceMap = new Map<string, PropertyPerformanceData>()

      properties?.forEach((property) => {
        const propertyId = property.id
        const daysOnMarket = Math.floor(
          (endDate.getTime() - new Date(property.created_at).getTime()) / (1000 * 60 * 60 * 24)
        )

        performanceMap.set(propertyId, {
          property_id: propertyId,
          property_code: property.property_code || "N/A",
          title: property.title_en || property.title_gr || "Untitled",
          views: 0,
          clicks: 0,
          inquiries: 0,
          conversionRate: 0,
          daysOnMarket,
        })
      })

      // Count views
      pageViews?.forEach((view) => {
        if (view.property_id) {
          const perf = performanceMap.get(view.property_id)
          if (perf) perf.views++
        }
      })

      // Count clicks (property detail pages)
      clicks?.forEach((click) => {
        const propertyIdMatch = click.route.match(/\/properties\/([^\/]+)/)
        if (propertyIdMatch) {
          const propertyId = propertyIdMatch[1]
          const perf = performanceMap.get(propertyId)
          if (perf) perf.clicks++
        }
      })

      // Count inquiries
      inquiries?.forEach((inquiry) => {
        if (inquiry.property_id) {
          const perf = performanceMap.get(inquiry.property_id)
          if (perf) perf.inquiries++
        }
      })

      // Calculate conversion rates
      performanceMap.forEach((perf) => {
        if (perf.views > 0) {
          perf.conversionRate = (perf.inquiries / perf.views) * 100
        }
      })

      return Array.from(performanceMap.values())
        .sort((a, b) => b.views - a.views)
        .slice(0, limit)
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

