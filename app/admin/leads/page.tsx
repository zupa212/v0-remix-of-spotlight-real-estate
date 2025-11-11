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
        properties(title, property_code),
        agents(name)
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
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Leads</h1>
            <p className="text-muted-foreground">Manage and track all property inquiries</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/leads/pipeline">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Pipeline View
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
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
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="walk-in">Walk-in</SelectItem>
            </SelectContent>
          </Select>

          <Select value={agentFilter} onValueChange={setAgentFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
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
                <TableCell colSpan={9} className="text-center py-8">
                  Loading leads...
                </TableCell>
              </TableRow>
            ) : filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  No leads found
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="text-muted-foreground">{lead.email}</span>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span className="text-muted-foreground">{lead.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.properties ? (
                      <div className="text-sm">
                        <div className="font-medium">{lead.properties.title_en}</div>
                        <div className="text-muted-foreground">{lead.properties.property_code}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.budget_min && lead.budget_max ? (
                      <span className="text-sm">
                        €{lead.budget_min.toLocaleString()} - €{lead.budget_max.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[lead.status as keyof typeof statusColors]}>{lead.status}</Badge>
                  </TableCell>
                  <TableCell className="capitalize">{lead.source}</TableCell>
                  <TableCell>
                    {lead.agents ? (
                      <span className="text-sm">{lead.agents.name_en}</span>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/leads/${lead.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
