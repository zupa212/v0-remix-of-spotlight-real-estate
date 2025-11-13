"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Mail, Phone, ArrowLeft, LayoutGrid } from "lucide-react"
import Link from "next/link"
import { AdminPageWrapper } from "@/components/admin-page-wrapper"
import { AdminGlassCard } from "@/components/admin-glass-card"
import { motion } from "framer-motion"

type Lead = {
  id: string
  name: string
  email: string
  phone: string | null
  status: string
  source: string
  budget_min: number | null
  budget_max: number | null
  property_id: string | null
  agent_id: string | null
  created_at: string
  properties: { title_en: string; property_code: string } | null
  agents: { name_en: string } | null
}

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-purple-100 text-purple-800",
  qualified: "bg-green-100 text-green-800",
  viewing: "bg-amber-100 text-amber-800",
  offer: "bg-orange-100 text-orange-800",
  won: "bg-emerald-100 text-emerald-800",
  lost: "bg-gray-100 text-gray-800",
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [agentFilter, setAgentFilter] = useState("all")
  const [dateRangeFilter, setDateRangeFilter] = useState("all")
  const [agents, setAgents] = useState<Array<{ id: string; name_en: string }>>([])
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
    fetchAgents()
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [statusFilter, sourceFilter, agentFilter, dateRangeFilter])

  async function fetchAgents() {
    const { data } = await supabase.from("agents").select("id, name_en").order("name_en")
    if (data) {
      setAgents(data)
    }
  }

  async function fetchLeads() {
    setLoading(true)
    let query = supabase
      .from("leads")
      .select(`
        *,
        properties:properties!property_id(title_en, property_code),
        agents:agents!agent_id(name_en)
      `)
      .order("created_at", { ascending: false })

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter)
    }

    if (sourceFilter !== "all") {
      query = query.eq("lead_source", sourceFilter)
    }

    if (agentFilter !== "all") {
      query = query.eq("agent_id", agentFilter)
    }

    // Date range filter
    if (dateRangeFilter !== "all") {
      const now = new Date()
      let startDate: Date
      if (dateRangeFilter === "today") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      } else if (dateRangeFilter === "week") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      } else if (dateRangeFilter === "month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      }
      query = query.gte("created_at", startDate.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching leads:", error)
    } else {
      setLeads(data || [])
    }
    setLoading(false)
  }

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.phone && lead.phone.includes(searchQuery)),
  )

  return (
    <AdminPageWrapper
      title="Leads"
      description="Manage and track all property inquiries"
      headerActions={
        <Button asChild variant="outline" className="bg-white/40 backdrop-blur-xl border-white/20">
          <Link href="/admin/leads/pipeline">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Pipeline View
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <AdminGlassCard index={0}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/60 backdrop-blur-sm border-white/30"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-white/60 backdrop-blur-sm border-white/30">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="viewing">Viewing</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[150px] bg-white/60 backdrop-blur-sm border-white/30">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20">
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="walk-in">Walk-in</SelectItem>
                </SelectContent>
              </Select>

              <Select value={agentFilter} onValueChange={setAgentFilter}>
                <SelectTrigger className="w-[150px] bg-white/60 backdrop-blur-sm border-white/30">
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

              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger className="w-[150px] bg-white/60 backdrop-blur-sm border-white/30">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </AdminGlassCard>

        {/* Table */}
        <AdminGlassCard index={1} className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-slate-600">
                      Loading leads...
                    </TableCell>
                  </TableRow>
                ) : filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-slate-600">
                      No leads found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead, index) => (
                    <TableRow
                      key={lead.id}
                      className="border-b border-white/10 hover:bg-white/30 transition-all duration-300"
                    >
                      <TableCell className="font-medium text-slate-900">{lead.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-sm">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-slate-500" />
                              <span className="text-slate-600">{lead.email}</span>
                            </div>
                            {lead.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-slate-500" />
                                <span className="text-slate-600">{lead.phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {lead.properties ? (
                            <div className="text-sm">
                              <div className="font-medium text-slate-900">{lead.properties.title_en}</div>
                              <div className="text-slate-500">{lead.properties.property_code}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {lead.budget_min && lead.budget_max ? (
                            <span className="text-sm text-slate-700">
                              €{lead.budget_min.toLocaleString()} - €{lead.budget_max.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[lead.status as keyof typeof statusColors]} border border-white/30 backdrop-blur-sm`}>
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize text-slate-700">{lead.source}</TableCell>
                        <TableCell>
                          {lead.agents ? (
                            <span className="text-sm text-slate-700">{lead.agents.name_en}</span>
                          ) : (
                            <span className="text-slate-400">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/leads/${lead.id}`}>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button variant="ghost" size="sm" className="bg-white/40 backdrop-blur-sm border border-white/30">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          </Link>
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
