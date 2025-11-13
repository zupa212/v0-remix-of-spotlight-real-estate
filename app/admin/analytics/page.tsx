"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, MousePointer, Eye, Users, Building2, Calendar } from "lucide-react"
import { AdminPageWrapper } from "@/components/admin-page-wrapper"
import { AdminGlassCard } from "@/components/admin-glass-card"
import { StatCard } from "@/components/stat-card"
import { motion } from "framer-motion"

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
        .select("property_id, properties:properties!property_id(title_en)")
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
        .select("agent_id, agents:agents!agent_id(name_en)")
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
    <AdminPageWrapper
      title="Analytics Dashboard"
      description="Track your property performance and user engagement"
      headerActions={
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px] bg-white/60 backdrop-blur-sm border-white/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalytics} variant="outline" className="bg-white/40 backdrop-blur-sm border-white/30">
            Refresh
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Clicks"
              value={stats.totalClicks.toLocaleString()}
              change="Property and page clicks"
              icon={MousePointer}
              index={0}
            />
            <StatCard
              title="Page Views"
              value={stats.totalPageViews.toLocaleString()}
              change="Total page views"
              icon={Eye}
              index={1}
            />
            <StatCard
              title="Total Leads"
              value={stats.totalLeads.toLocaleString()}
              change="Inquiries and contacts"
              icon={Users}
              index={2}
            />

            <StatCard
              title="Conversion Rate"
              value={`${stats.conversionRate}%`}
              change="Clicks to leads"
              icon={TrendingUp}
              index={3}
            />
          </div>

          {/* Top Properties and Agents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminGlassCard index={4} title="Top Properties" headerActions={<span className="text-sm text-slate-500">Most clicked</span>}>
              {stats.topProperties.length > 0 ? (
                <div className="space-y-4">
                  {stats.topProperties.map((property, index) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-white/80 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-sm font-bold text-slate-700">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{property.title}</p>
                          <p className="text-sm text-slate-600">{property.clicks} clicks</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 text-center py-4">No data available</p>
              )}
            </AdminGlassCard>

            <AdminGlassCard index={5} title="Top Agents" headerActions={<span className="text-sm text-slate-500">Most leads</span>}>
              {stats.topAgents.length > 0 ? (
                <div className="space-y-4">
                  {stats.topAgents.map((agent, index) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-white/80 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-sm font-bold text-slate-700">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{agent.name}</p>
                          <p className="text-sm text-slate-600">{agent.leads} leads</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 text-center py-4">No data available</p>
              )}
            </AdminGlassCard>
          </div>
        </div>
      )}
    </AdminPageWrapper>
  )
}

