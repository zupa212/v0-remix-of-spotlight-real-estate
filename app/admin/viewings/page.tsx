"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar, MapPin, User, Eye, Plus, Edit, Filter } from "lucide-react"
import Link from "next/link"
import { AdminPageWrapper } from "@/components/admin-page-wrapper"
import { AdminGlassCard } from "@/components/admin-glass-card"
import { motion } from "framer-motion"
import { showToast } from "@/lib/toast"

type Viewing = {
  id: string
  scheduled_at: string
  status: string
  notes: string | null
  leads: { id: string; name: string; email: string } | null
  properties: { title: string; property_code: string; city: string } | null
  agents: { name: string } | null
}

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  rescheduled: "bg-amber-100 text-amber-800",
}

export default function AdminViewingsPage() {
  const [viewings, setViewings] = useState<Viewing[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [agentFilter, setAgentFilter] = useState<string>("all")
  const [agents, setAgents] = useState<Array<{ id: string; name_en: string }>>([])
  const [searchTerm, setSearchTerm] = useState("")

  const supabase = createClient()

  useEffect(() => {
    fetchAgents()
  }, [])

  useEffect(() => {
    fetchViewings()
  }, [filter, statusFilter, agentFilter])

  async function fetchAgents() {
    const { data } = await supabase.from("agents").select("id, name_en").order("name_en")
    if (data) {
      setAgents(data)
    }
  }

  async function fetchViewings() {
    setLoading(true)
    let query = supabase
      .from("viewings")
      .select(`
        *,
        property:properties!property_id ( title_en, property_code, city_en ),
        agent:agents!agent_id ( id, name_en, name_gr )
      `)
      .order("scheduled_date", { ascending: true })

    const now = new Date().toISOString()

    if (filter === "upcoming") {
      query = query.gte("scheduled_date", now)
    } else if (filter === "past") {
      query = query.lt("scheduled_date", now)
    }

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter)
    }

    if (agentFilter !== "all") {
      query = query.eq("agent_id", agentFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching viewings:", error)
      showToast.error("Failed to load viewings", error.message)
    } else {
      // Fetch leads separately for viewings that have lead_id
      const leadIds = (data || [])
        .map((v: any) => v.lead_id)
        .filter((id: string | null) => id !== null) as string[]
      
      let leadsMap: Record<string, { id: string; name: string; email: string }> = {}
      if (leadIds.length > 0) {
        const { data: leadsData } = await supabase
          .from("leads")
          .select("id, name, email")
          .in("id", leadIds)
        
        if (leadsData) {
          leadsData.forEach((lead: any) => {
            leadsMap[lead.id] = {
              id: lead.id,
              name: lead.name ?? "Unknown",
              email: lead.email ?? "",
            }
          })
        }
      }

      // Transform data to match expected format
      const transformed = (data || []).map((v: any) => ({
        ...v,
        scheduled_at: v.scheduled_date,
        leads: v.lead_id && leadsMap[v.lead_id] ? leadsMap[v.lead_id] : null,
        properties: v.property ? { 
          title: v.property.title_en || "", 
          property_code: v.property.property_code || "", 
          city: v.property.city_en || "" 
        } : null,
        agents: v.agent ? { 
          name: v.agent.name_en || v.agent.name_gr 
        } : null,
      }))
      setViewings(transformed)
    }
    setLoading(false)
  }

  const filteredViewings = viewings.filter((viewing) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const propertyMatch = viewing.properties?.title?.toLowerCase().includes(searchLower) ||
        viewing.properties?.property_code?.toLowerCase().includes(searchLower) ||
        viewing.properties?.city?.toLowerCase().includes(searchLower)
      const leadMatch = viewing.leads?.name?.toLowerCase().includes(searchLower) ||
        viewing.leads?.email?.toLowerCase().includes(searchLower)
      const agentMatch = viewing.agents?.name?.toLowerCase().includes(searchLower)
      return propertyMatch || leadMatch || agentMatch
    }
    return true
  })

  return (
    <AdminPageWrapper
      title="Viewings"
      description="Manage property viewing appointments"
      headerActions={
        <Button asChild className="bg-white/40 backdrop-blur-xl border-white/20">
          <Link href="/admin/viewings/new">
            <Plus className="mr-2 h-5 w-5" />
            Schedule Viewing
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <AdminGlassCard index={0}>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search viewings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/60 backdrop-blur-sm border-white/30"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                variant={filter === "upcoming" ? "default" : "outline"} 
                onClick={() => setFilter("upcoming")}
                className={filter === "upcoming" ? "bg-white/40 backdrop-blur-xl border-white/20" : "bg-white/60 backdrop-blur-sm border-white/30"}
              >
                Upcoming
              </Button>
              <Button 
                variant={filter === "past" ? "default" : "outline"} 
                onClick={() => setFilter("past")}
                className={filter === "past" ? "bg-white/40 backdrop-blur-xl border-white/20" : "bg-white/60 backdrop-blur-sm border-white/30"}
              >
                Past
              </Button>
              <Button 
                variant={filter === "all" ? "default" : "outline"} 
                onClick={() => setFilter("all")}
                className={filter === "all" ? "bg-white/40 backdrop-blur-xl border-white/20" : "bg-white/60 backdrop-blur-sm border-white/30"}
              >
                All
              </Button>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-white/60 backdrop-blur-sm border-white/30">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>

            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger className="w-[180px] bg-white/60 backdrop-blur-sm border-white/30">
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20">
                <SelectItem value="all">All Agents</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </AdminGlassCard>

        {/* Table */}
        <AdminGlassCard index={1} className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading viewings...
                </TableCell>
              </TableRow>
            ) : viewings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No viewings found
                </TableCell>
              </TableRow>
            ) : (
              filteredViewings.map((viewing) => (
                <TableRow 
                  key={viewing.id}
                  className="border-b border-white/10 hover:bg-white/30 transition-all duration-300"
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <div className="text-sm">
                        <div className="font-medium text-slate-900">{new Date(viewing.scheduled_at).toLocaleDateString()}</div>
                        <div className="text-slate-600">
                          {new Date(viewing.scheduled_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {viewing.properties ? (
                      <div className="text-sm">
                        <div className="font-medium text-slate-900">{viewing.properties.title}</div>
                        <div className="flex items-center gap-1 text-slate-500">
                          <MapPin className="h-3 w-3" />
                          {viewing.properties.city}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {viewing.leads ? (
                      <div className="text-sm">
                        <div className="font-medium text-slate-900">{viewing.leads.name}</div>
                        <div className="text-slate-600">{viewing.leads.email}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {viewing.agents ? (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="text-slate-700">{viewing.agents.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={viewing.status}
                      onValueChange={async (newStatus) => {
                        const { error } = await supabase
                          .from("viewings")
                          .update({ status: newStatus })
                          .eq("id", viewing.id)
                        if (error) {
                          alert("Failed to update status: " + error.message)
                        } else {
                          fetchViewings()
                        }
                      }}
                    >
                      <SelectTrigger className="w-[140px] bg-white/60 backdrop-blur-sm border-white/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20">
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="no_show">No Show</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-slate-600">
                    {viewing.notes || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {viewing.properties && (
                        <Link href={`/admin/properties/${viewing.properties.id}`}>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button variant="ghost" size="sm" className="bg-white/40 backdrop-blur-sm border border-white/30" title="View Property">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </Link>
                      )}
                      {viewing.leads && (
                        <Link href={`/admin/leads/${viewing.leads.id}`}>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button variant="ghost" size="sm" className="bg-white/40 backdrop-blur-sm border border-white/30">
                              <User className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </Link>
                      )}
                      <Link href={`/admin/viewings/${viewing.id}/edit`}>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button variant="ghost" size="sm" className="bg-white/40 backdrop-blur-sm border border-white/30">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
          </div>
        </AdminGlassCard>
      </div>
    </AdminPageWrapper>
  )
}
