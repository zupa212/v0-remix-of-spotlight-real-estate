"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, MousePointer, Eye, Users, Building2, Calendar } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("7d")
  const [stats, setStats] = useState({
    totalClicks: 0,
    totalPageViews: 0,
    totalLeads: 0,
    totalProperties: 0,
    conversionRate: 0,
    topProperties: [] as Array<{ id: string; title: string; clicks: number }>,
    topAgents: [] as Array<{ id: string; name: string; leads: number }>,
  })

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      // Calculate date range
      const now = new Date()
      const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()

      // Fetch clicks
      const { count: clicksCount } = await supabase
        .from("analytics_clicks")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startDate)

      // For now, we'll use leads as page views proxy (can be enhanced later)
      const { count: pageViewsCount } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startDate)

      // Fetch leads
      const { count: leadsCount } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startDate)

      // Fetch properties
      const { count: propertiesCount } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("published", true)

      // Fetch top properties by clicks
      const { data: topPropertiesData } = await supabase
        .from("analytics_clicks")
        .select("property_id, properties(title_en)")
        .gte("created_at", startDate)
        .not("property_id", "is", null)

      // Count clicks per property
      const propertyClicks: Record<string, number> = {}
      topPropertiesData?.forEach((click) => {
        if (click.property_id) {
          propertyClicks[click.property_id] = (propertyClicks[click.property_id] || 0) + 1
        }
      })

      const topProperties = Object.entries(propertyClicks)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id, clicks]) => ({
          id,
          title: (topPropertiesData?.find((c) => c.property_id === id)?.properties as any)?.title_en || "Unknown",
          clicks,
        }))

      // Fetch top agents by leads
      const { data: agentsData } = await supabase
        .from("leads")
        .select("agent_id, agents(name_en)")
        .gte("created_at", startDate)
        .not("agent_id", "is", null)

      const agentLeads: Record<string, number> = {}
      agentsData?.forEach((lead) => {
        if (lead.agent_id) {
          agentLeads[lead.agent_id] = (agentLeads[lead.agent_id] || 0) + 1
        }
      })

      const topAgents = Object.entries(agentLeads)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id, leads]) => ({
          id,
          name: (agentsData?.find((l) => l.agent_id === id)?.agents as any)?.name_en || "Unknown",
          leads,
        }))

      const conversionRate =
        (clicksCount || 0) > 0 ? ((leadsCount || 0) / (clicksCount || 1)) * 100 : 0

      setStats({
        totalClicks: clicksCount || 0,
        totalPageViews: pageViewsCount || 0,
        totalLeads: leadsCount || 0,
        totalProperties: propertiesCount || 0,
        conversionRate: Math.round(conversionRate * 100) / 100,
        topProperties,
        topAgents,
      })
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
            <p className="text-slate-600">Track your property performance and user engagement</p>
          </div>

          {/* Date Range Selector */}
          <div className="mb-6 flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchAnalytics} variant="outline">
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Loading analytics...</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Property and page clicks</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalPageViews.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Total page views</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalLeads.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Inquiries and contacts</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.conversionRate}%</div>
                    <p className="text-xs text-muted-foreground">Clicks to leads</p>
                  </CardContent>
                </Card>
              </div>

              {/* Top Properties and Agents */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Properties</CardTitle>
                    <CardDescription>Most clicked properties</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats.topProperties.length > 0 ? (
                      <div className="space-y-4">
                        {stats.topProperties.map((property, index) => (
                          <div key={property.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{property.title}</p>
                                <p className="text-sm text-slate-600">{property.clicks} clicks</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-600 text-center py-4">No data available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Agents</CardTitle>
                    <CardDescription>Agents with most leads</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats.topAgents.length > 0 ? (
                      <div className="space-y-4">
                        {stats.topAgents.map((agent, index) => (
                          <div key={agent.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{agent.name}</p>
                                <p className="text-sm text-slate-600">{agent.leads} leads</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-600 text-center py-4">No data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

