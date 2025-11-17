"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { useEffect } from "react"

interface KpiData {
  totalProperties: number
  totalPropertiesDelta: number
  activeLeads: number
  activeLeadsDelta: number
  scheduledViewings: number
  scheduledViewingsDelta: number
  monthlyRevenue: number
  monthlyRevenueDelta: number
}

export function useKpis(enableRealtime: boolean = true) {
  const supabase = createClient()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["kpis"],
    queryFn: async (): Promise<KpiData> => {
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

      // Total Properties
      const [propertiesThisMonth, propertiesLastMonth] = await Promise.all([
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .gte("created_at", thisMonth.toISOString()),
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .gte("created_at", lastMonth.toISOString())
          .lt("created_at", thisMonth.toISOString()),
      ])

      const totalProperties = propertiesThisMonth.count || 0
      const totalPropertiesLastMonth = propertiesLastMonth.count || 0
      const totalPropertiesDelta = totalProperties - totalPropertiesLastMonth

      // Active Leads (status in new/contacted/qualified)
      const [leadsThisWeek, leadsLastWeek] = await Promise.all([
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .in("status", ["new", "contacted", "qualified"])
          .gte("created_at", new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .in("status", ["new", "contacted", "qualified"])
          .gte("created_at", new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString())
          .lt("created_at", new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      ])

      const activeLeads = leadsThisWeek.count || 0
      const activeLeadsLastWeek = leadsLastWeek.count || 0
      const activeLeadsDelta = activeLeads - activeLeadsLastWeek

      // Scheduled Viewings (next 7 days)
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const [viewingsThisWeek, viewingsLastWeek] = await Promise.all([
        supabase
          .from("viewings")
          .select("id", { count: "exact", head: true })
          .gte("scheduled_date", now.toISOString())
          .lte("scheduled_date", nextWeek.toISOString()),
        supabase
          .from("viewings")
          .select("id", { count: "exact", head: true })
          .gte("scheduled_date", new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .lt("scheduled_date", now.toISOString()),
      ])

      const scheduledViewings = viewingsThisWeek.count || 0
      const scheduledViewingsLastWeek = viewingsLastWeek.count || 0
      const scheduledViewingsDelta = scheduledViewings - scheduledViewingsLastWeek

      // Monthly Revenue (sum of accepted offers)
      const [revenueThisMonth, revenueLastMonth] = await Promise.all([
        supabase
          .from("offers")
          .select("amount")
          .eq("status", "accepted")
          .gte("created_at", thisMonth.toISOString())
          .lte("created_at", thisMonthEnd.toISOString()),
        supabase
          .from("offers")
          .select("amount")
          .eq("status", "accepted")
          .gte("created_at", lastMonth.toISOString())
          .lte("created_at", lastMonthEnd.toISOString()),
      ])

      const monthlyRevenue =
        revenueThisMonth.data?.reduce((sum, o) => sum + (Number(o.amount) || 0), 0) || 0
      const monthlyRevenueLastMonth =
        revenueLastMonth.data?.reduce((sum, o) => sum + (Number(o.amount) || 0), 0) || 0
      const monthlyRevenueDelta = monthlyRevenue - monthlyRevenueLastMonth

      return {
        totalProperties,
        totalPropertiesDelta,
        activeLeads,
        activeLeadsDelta,
        scheduledViewings,
        scheduledViewingsDelta,
        monthlyRevenue,
        monthlyRevenueDelta,
      }
    },
  })

  // Real-time subscription for KPIs
  useEffect(() => {
    if (!enableRealtime) return

    const channel = supabase
      .channel("kpis-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "properties",
        },
        () => refetch()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leads",
        },
        () => refetch()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "viewings",
        },
        () => refetch()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "offers",
        },
        () => refetch()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [enableRealtime, refetch])

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
  }
}

