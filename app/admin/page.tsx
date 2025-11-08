import { redirect } from "next/navigation"
import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin-sidebar"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, MessageSquare, Calendar, TrendingUp, Eye, Clock } from "lucide-react"

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
          full_name,
          email,
          status,
          created_at,
          property:property_id ( title_en, property_code )
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
          properties:property_id ( title_en, property_code ),
          leads:lead_id ( full_name, email ),
          agents:agent_id ( name_en, name_gr )
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

  if (propertiesCountResponse.error) console.error("Failed to count properties", propertiesCountResponse.error)
  if (newPropertiesResponse.error) console.error("Failed to count new properties", newPropertiesResponse.error)
  if (propertyDistributionResponse.error) console.error("Failed to load property distribution", propertyDistributionResponse.error)
  if (activeLeadsCountResponse.error) console.error("Failed to count leads", activeLeadsCountResponse.error)
  if (newLeadsResponse.error) console.error("Failed to count new leads", newLeadsResponse.error)
  if (recentLeadsResponse.error) console.error("Failed to load recent leads", recentLeadsResponse.error)
  if (scheduledViewingsCountResponse.error)
    console.error("Failed to count upcoming viewings", scheduledViewingsCountResponse.error)
  if (viewingsCreatedResponse.error) console.error("Failed to count created viewings", viewingsCreatedResponse.error)
  if (upcomingViewingsResponse.error) console.error("Failed to load upcoming viewings", upcomingViewingsResponse.error)
  if (soldPropertiesResponse.error) console.error("Failed to calculate revenue", soldPropertiesResponse.error)

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

  const recentLeads = (recentLeadsResponse.data ?? []).map((lead) => ({
    id: lead.id,
    name: lead.full_name ?? "Unnamed lead",
    email: lead.email ?? "",
    property: lead.property?.title_en ?? "General inquiry",
    status: lead.status ?? "new",
    createdAt: lead.created_at ?? nowIso,
  }))

  const upcomingViewings = (upcomingViewingsResponse.data ?? []).map((viewing: any) => {
    const scheduledDate = viewing.scheduled_date ? new Date(viewing.scheduled_date) : null
    return {
      id: viewing.id,
      property: viewing.properties?.title_en ?? "Property",
      client: viewing.leads?.full_name ?? viewing.client_name ?? "Prospective client",
      date: scheduledDate ? format(scheduledDate, "PPpp") : "To be confirmed",
      agent: viewing.agents?.name_en ?? "Unassigned",
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
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
            <p className="text-slate-600">Welcome back! Here's what's happening today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Properties"
              value={totalProperties}
              change={propertyChangeText}
              changeType={propertyChangeType}
              icon={Building2}
            />
            <StatCard
              title="Active Leads"
              value={activeLeads}
              change={leadChangeText}
              changeType={leadChangeType}
              icon={MessageSquare}
            />
            <StatCard
              title="Scheduled Viewings"
              value={scheduledViewings}
              change={viewingChangeText}
              changeType={viewingChangeType}
              icon={Calendar}
            />
            <StatCard
              title="Monthly Revenue"
              value={formatCurrency(monthlyRevenue)}
              change={revenueChangeText}
              changeType={revenueChangeType}
              icon={TrendingUp}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Leads */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Leads</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/leads">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentLeads.length > 0 ? (
                  <div className="space-y-4">
                    {recentLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-slate-600">
                            {lead.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="font-semibold text-slate-900">{lead.name}</div>
                            <Badge
                              variant="secondary"
                              className={
                                lead.status === "new"
                                  ? "bg-blue-100 text-blue-700"
                                  : lead.status === "contacted"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-green-100 text-green-700"
                              }
                            >
                              {lead.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 truncate mb-1">{lead.property}</p>
                          <p className="text-xs text-slate-500">{formatRelativeTime(lead.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">No leads have been captured yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Viewings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming Viewings</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/viewings">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {upcomingViewings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingViewings.map((viewing) => (
                      <div
                        key={viewing.id}
                        className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="font-semibold text-slate-900 line-clamp-1">{viewing.property}</div>
                          <Badge
                            variant="secondary"
                            className={
                              viewing.status === "confirmed"
                                ? "bg-green-100 text-green-700"
                                : viewing.status === "completed"
                                  ? "bg-slate-100 text-slate-700"
                                  : "bg-blue-100 text-blue-700"
                            }
                          >
                            {viewing.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{viewing.date}</span>
                          </div>
                          <div>Client: {viewing.client}</div>
                          <div>Agent: {viewing.agent}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">No upcoming viewings have been scheduled.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Property Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Property Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {propertyStats.length > 0 ? (
                <div className="space-y-4">
                  {propertyStats.map((stat) => (
                    <div key={stat.type}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-900">{stat.type}</span>
                        <span className="text-sm text-slate-600">
                          {stat.count} ({stat.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-600 rounded-full transition-all"
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600">No published properties yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild className="h-auto py-6 flex-col gap-2">
              <Link href="/admin/properties/new">
                <Building2 className="h-6 w-6" />
                <span>Add Property</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-6 flex-col gap-2 bg-transparent">
              <Link href="/admin/leads">
                <MessageSquare className="h-6 w-6" />
                <span>View Leads</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-6 flex-col gap-2 bg-transparent">
              <Link href="/admin/viewings">
                <Calendar className="h-6 w-6" />
                <span>Schedule Viewing</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-6 flex-col gap-2 bg-transparent">
              <Link href="/admin/agents">
                <Eye className="h-6 w-6" />
                <span>Manage Agents</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
