import { redirect } from "next/navigation"
import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, MessageSquare, Calendar, TrendingUp, Eye, Clock } from "lucide-react"
import { DashboardContent } from "@/components/dashboard-content"

// Force dynamic rendering to avoid build-time errors
export const dynamic = "force-dynamic"

function titleCase(value: string) {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

function formatTypeLabel(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((segment) => titleCase(segment))
    .join(" ")
}

function formatCurrency(value: number, currency = "EUR") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatRelativeTime(date: string | null | undefined) {
  if (!date) return "Just now"
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch {
    return "Just now"
  }
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/admin/login")
  }

  const now = new Date()
  const nowIso = now.toISOString()
  const startOfMonthIso = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const sevenDaysAgoIso = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const activeLeadStatuses = ["new", "contacted", "qualified", "viewing_scheduled", "negotiating"]

  const [
    propertiesCountResponse,
    newPropertiesResponse,
    propertyDistributionResponse,
    activeLeadsCountResponse,
    newLeadsResponse,
    recentLeadsResponse,
    scheduledViewingsCountResponse,
    viewingsCreatedResponse,
    upcomingViewingsResponse,
    soldPropertiesResponse,
  ] = await Promise.all([
    supabase.from("properties").select("id", { count: "exact", head: true }),
    supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfMonthIso),
    supabase.from("properties").select("property_type").eq("published", true),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .in("status", activeLeadStatuses),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgoIso),
    supabase
      .from("leads")
      .select(
        `
          id,
          name,
          email,
          status,
          created_at,
          property:properties!property_id ( title_en, property_code )
        `,
      )
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("viewings")
      .select("id", { count: "exact", head: true })
      .in("status", ["scheduled", "confirmed"])
      .gte("scheduled_date", nowIso),
    supabase
      .from("viewings")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgoIso),
    supabase
      .from("viewings")
      .select(
        `
          id,
          scheduled_date,
          status,
          client_name,
          lead_id,
          agent_id,
          property:properties!property_id ( title_en, property_code )
        `,
      )
      .gte("scheduled_date", nowIso)
      .order("scheduled_date", { ascending: true })
      .limit(5),
    supabase
      .from("properties")
      .select("price_sale")
      .eq("status", "sold")
      .gte("updated_at", startOfMonthIso),
  ])

  // Collect errors for display
  const errors: string[] = []
  if (propertiesCountResponse.error) {
    console.error("Failed to count properties", propertiesCountResponse.error)
    errors.push("Failed to load property count")
  }
  if (newPropertiesResponse.error) {
    console.error("Failed to count new properties", newPropertiesResponse.error)
    errors.push("Failed to load new properties")
  }
  if (propertyDistributionResponse.error) {
    console.error("Failed to load property distribution", propertyDistributionResponse.error)
    errors.push("Failed to load property distribution")
  }
  if (activeLeadsCountResponse.error) {
    console.error("Failed to count leads", activeLeadsCountResponse.error)
    errors.push("Failed to load leads count")
  }
  if (newLeadsResponse.error) {
    console.error("Failed to count new leads", newLeadsResponse.error)
    errors.push("Failed to load new leads")
  }
  if (recentLeadsResponse.error) {
    console.error("Failed to load recent leads", recentLeadsResponse.error)
    errors.push("Failed to load recent leads")
  }
  if (scheduledViewingsCountResponse.error) {
    console.error("Failed to count upcoming viewings", scheduledViewingsCountResponse.error)
    errors.push("Failed to load viewings count")
  }
  if (viewingsCreatedResponse.error) {
    console.error("Failed to count created viewings", viewingsCreatedResponse.error)
    errors.push("Failed to load created viewings")
  }
  if (upcomingViewingsResponse.error) {
    console.error("Failed to load upcoming viewings", upcomingViewingsResponse.error)
    errors.push("Failed to load upcoming viewings")
  }
  if (soldPropertiesResponse.error) {
    console.error("Failed to calculate revenue", soldPropertiesResponse.error)
    errors.push("Failed to load revenue data")
  }

  const totalProperties = propertiesCountResponse.count ?? 0
  const newPropertiesThisMonth = newPropertiesResponse.count ?? 0
  const activeLeads = activeLeadsCountResponse.count ?? 0
  const newLeadsThisWeek = newLeadsResponse.count ?? 0
  const scheduledViewings = scheduledViewingsCountResponse.count ?? 0
  const viewingsCreatedThisWeek = viewingsCreatedResponse.count ?? 0
  const monthlyRevenue = (soldPropertiesResponse.data ?? []).reduce((sum, property) => {
    const price = Number(property.price_sale ?? 0)
    return sum + (Number.isFinite(price) ? price : 0)
  }, 0)
  const dealsClosed = soldPropertiesResponse.data?.length ?? 0

  const propertyDistributionRows = propertyDistributionResponse.data ?? []
  const distributionCounts = propertyDistributionRows.reduce((acc, row) => {
    const type = row.property_type ?? "other"
    acc[type] = (acc[type] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const distributionTotal = Object.values(distributionCounts).reduce((acc, count) => acc + count, 0)

  const propertyStats = Object.entries(distributionCounts)
    .map(([type, count]) => ({
      type: formatTypeLabel(type),
      count,
      percentage: distributionTotal > 0 ? Math.round((count / distributionTotal) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)

  const recentLeads = (recentLeadsResponse.data ?? []).map((lead: any) => ({
    id: lead.id,
    name: lead.name ?? "Unnamed lead",
    email: lead.email ?? "",
    property: lead.property?.title_en ?? "General inquiry",
    status: lead.status ?? "new",
    createdAt: lead.created_at ?? nowIso,
  }))

  // Fetch lead names and agent names for viewings that have lead_id and agent_id
  const viewingLeadIds = (upcomingViewingsResponse.data ?? [])
    .map((v: any) => v.lead_id)
    .filter((id: string | null) => id !== null) as string[]
  
  const viewingAgentIds = (upcomingViewingsResponse.data ?? [])
    .map((v: any) => v.agent_id)
    .filter((id: string | null) => id !== null) as string[]
  
  let leadNamesMap: Record<string, string> = {}
  if (viewingLeadIds.length > 0) {
    const { data: leadsData } = await supabase
      .from("leads")
      .select("id, name")
      .in("id", viewingLeadIds)
    
    if (leadsData) {
      leadsData.forEach((lead: any) => {
        leadNamesMap[lead.id] = lead.name ?? "Unknown"
      })
    }
  }

  let agentNamesMap: Record<string, string> = {}
  if (viewingAgentIds.length > 0) {
    const { data: agentsData } = await supabase
      .from("agents")
      .select("id, name_en, name_gr")
      .in("id", viewingAgentIds)
    
    if (agentsData) {
      agentsData.forEach((agent: any) => {
        agentNamesMap[agent.id] = agent.name_en ?? agent.name_gr ?? "Unknown"
      })
    }
  }

  const upcomingViewings = (upcomingViewingsResponse.data ?? []).map((viewing: any) => {
    const scheduledDate = viewing.scheduled_date ? new Date(viewing.scheduled_date) : null
    const clientName = viewing.lead_id && leadNamesMap[viewing.lead_id]
      ? leadNamesMap[viewing.lead_id]
      : viewing.client_name ?? "Prospective client"
    
    const agentName = viewing.agent_id && agentNamesMap[viewing.agent_id]
      ? agentNamesMap[viewing.agent_id]
      : "Unassigned"
    
    return {
      id: viewing.id,
      property: viewing.property?.title_en ?? "Property",
      client: clientName,
      date: scheduledDate ? format(scheduledDate, "PPpp") : "To be confirmed",
      agent: agentName,
      status: viewing.status ?? "scheduled",
    }
  })

  const propertyChangeText =
    newPropertiesThisMonth > 0 ? `+${newPropertiesThisMonth} this month` : "No new listings this month yet"
  const propertyChangeType = newPropertiesThisMonth > 0 ? "positive" : "neutral" as const

  const leadChangeText = newLeadsThisWeek > 0 ? `+${newLeadsThisWeek} this week` : "No new leads this week yet"
  const leadChangeType = newLeadsThisWeek > 0 ? "positive" : "neutral" as const

  const viewingChangeText =
    viewingsCreatedThisWeek > 0 ? `+${viewingsCreatedThisWeek} booked in 7 days` : "No new bookings this week"
  const viewingChangeType = viewingsCreatedThisWeek > 0 ? "positive" : "neutral" as const

  const revenueChangeText =
    dealsClosed > 0
      ? `${dealsClosed} ${dealsClosed === 1 ? "deal" : "deals"} closed this month`
      : "No closed deals recorded this month yet"
  const revenueChangeType = dealsClosed > 0 ? "positive" : "neutral" as const

  return (
    <DashboardContent
      errors={errors}
      totalProperties={totalProperties}
      newPropertiesThisMonth={newPropertiesThisMonth}
      activeLeads={activeLeads}
      newLeadsThisWeek={newLeadsThisWeek}
      scheduledViewings={scheduledViewings}
      viewingsCreatedThisWeek={viewingsCreatedThisWeek}
      monthlyRevenue={monthlyRevenue}
      dealsClosed={dealsClosed}
      propertyChangeText={propertyChangeText}
      propertyChangeType={propertyChangeType}
      leadChangeText={leadChangeText}
      leadChangeType={leadChangeType}
      viewingChangeText={viewingChangeText}
      viewingChangeType={viewingChangeType}
      revenueChangeText={revenueChangeText}
      revenueChangeType={revenueChangeType}
      propertyStats={propertyStats}
      recentLeads={recentLeads}
      upcomingViewings={upcomingViewings}
    />
  )
}
